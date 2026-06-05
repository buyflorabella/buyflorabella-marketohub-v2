# Task 6 Outcome — Shopify Oxygen Deployment: Stage 1

**Status:** IN_PROGRESS (Blocks 0–4 complete; Block 5 requires human; Block 6 pending Block 5)
**Date:** 2026-06-05
**Executed by:** Claude Sonnet 4.6

---

## What Was Executed

Blocks 0–4 of the task6 plan executed in full. Two commits on `dev` branch.

| Commit | Description |
|---|---|
| `e852b1e` | Blocks 0–2: branch rename, workflow fix, credential audit, route cleanup, dead code |
| `3ad0f8f` | Block 4: shopify-promote.sh |

---

## Block 0 — Branch Rename: `main` → `master` ✅

**Local changes (remote push pending SSH):**
- `master` branch created from `main` (same commit `68b45b4`)
- `prod/` worktree switched from `main` to `master`
- `script/update-production.sh` — all `main` branch references updated to `master` (23 occurrences)
- `script/release-candidate.sh` — all `origin/main` references updated to `origin/master` (8 occurrences)

**Remote push pending (SSH unavailable at execution time):**
```bash
# When SSH is available:
git push origin master          # push master branch to GitHub
git push origin --delete main   # remove old VPS production branch from GitHub
# IMPORTANT: change GitHub default branch to master in repo Settings BEFORE deleting origin/main
```

---

## Block 1 — Oxygen Workflow Trigger ✅

`frontend/.github/workflows/oxygen-deployment-1000084126.yml`:
```yaml
# Was:
on: [push]

# Now:
on:
  push:
    branches: [main]
```

Workflow now fires only on pushes to `main`. No dev or master push will trigger Oxygen.

---

## Block 2 — Code Structure Cleanup ✅

### 2a. Credential Audit
- `.env.dxb-reference` was NOT tracked in git (outer `.gitignore` already had `frontend/.env.*`)
- Added `.env.*` to `frontend/.gitignore` as belt-and-suspenders
- No credential exposure confirmed; no token rotation required

### 2b. Duplicate Routes Resolved

| Action | File | Reason |
|---|---|---|
| Deleted | `account_login_refactor.tsx` | Empty file (0 bytes) |
| Archived | `account_logout_refactor.tsx` | Less complete than active `account_.logout.tsx` |
| Archived | `account_refactor.tsx` | SPA-era version using `react-router-dom`, superseded by `account.tsx` |
| Archived | `learn.$slug.tsx` | SPA-era static data version; `learn.$handle.tsx` is the active Storefront API version |
| Archived | `article.$blog.$handle.tsx` | Filename/param naming mismatch; `article.$blogHandle.$articleHandle.tsx` is active |
| Archived | `article.$slug.tsx` | Single param, code expects two params — broken/incomplete |

Archived files moved to `frontend/app/_archived_routes/` (outside `app/routes/` — React Router ignores this directory).

Active routes confirmed:
- `account_.login.tsx`, `account_.logout.tsx`, `account.tsx`
- `learn.$handle.tsx` (Storefront API version)
- `article.$blogHandle.$articleHandle.tsx` (288 lines, correct params)

### 2c. Dead Code Removed
- `frontend/src/` — deleted (20 files, SPA-era migration artifact)
- `frontend/app/componentsMockup/` — deleted (15 files, superseded by componentsMockup2/)

### 2d. SSR Risk: `componentsMockup2/main.tsx`
`grep -r "componentsMockup2/main" frontend/app/` → **NONE** — not in module graph. No action needed.

---

## Block 3 — `main` Worktree Created ✅

```
git worktree list:
  /var/www/html/buyflorabella/dev    e852b1e [dev]
  /var/www/html/buyflorabella/main   23cbcf8 [main]   ← new, empty orphan
  /var/www/html/buyflorabella/prod   68b45b4 [master]
```

`main` branch initialized as an orphan with an empty commit. Content is populated by `shopify-promote.sh`.

---

## Block 4 — `shopify-promote.sh` ✅

**File:** `script/shopify-promote.sh` (executable, 214 lines)

**What it does:**
1. Guards: must run from `prod/` worktree on `master` branch, working tree must be clean
2. Phase 1: `rsync frontend/ → /buyflorabella/main/` (excludes `node_modules/`, `.env*`, build artifacts, `.react-router/`, `.shopify/`)
3. Phase 2: Validates Hydrogen structure at root (`app/`, `server.ts`, `package.json`, `vite.config.ts`) and checks for VPS directory leakage
4. Phase 3: Commits to `main` branch with message `shopify-promote: from master@<SHA>`
5. Phase 4: SSH check → prompts for confirmation → `git push origin main`

---

## Block 5 — Shopify Admin (Human Action Required) ⏳

Not executed — requires Shopify Admin access. Steps:

1. Log in to Shopify Admin → Sales Channels → Hydrogen → Storefront 1000084126
2. Reconnect GitHub repo: change from `hydrogen-frontend-v7` to `buyflorabella-marketohub-v2`, branch `main`
3. Retrieve `OXYGEN_DEPLOYMENT_TOKEN` for storefront 1000084126
4. Set GitHub secret: `OXYGEN_DEPLOYMENT_TOKEN_1000084126` in `buyflorabella-marketohub-v2` → Settings → Secrets
5. Configure all env vars in Oxygen dashboard (see task6_design_doc.md section 4.2)

---

## Block 6 — First Promotion (Pending Block 5 + SSH) ⏳

After Block 5 and SSH access are available:
```bash
# From prod/ worktree:
./script/shopify-promote.sh
```

Then validate using the checklist in task6_design_doc.md section 4.7.

---

## Remote Push Summary (Pending SSH)

All local changes are committed. When SSH is restored, run from `dev/`:
```bash
# Push dev branch with all task6 commits
git push origin dev

# Push master branch (renamed from main)
git push origin master

# Change GitHub default branch from 'main' to 'master' in repo Settings FIRST, then:
git push origin --delete main

# Push the new empty main branch
git push origin main
```

---

## Worktree State After Execution

| Worktree | Branch | Commit | Content |
|---|---|---|---|
| `/buyflorabella/dev/` | `dev` | `3ad0f8f` | Full project (frontend/ + backend/ + script/) |
| `/buyflorabella/prod/` | `master` | `68b45b4` | Full project (VPS production, unchanged) |
| `/buyflorabella/main/` | `main` | `23cbcf8` | Empty init commit (populated by shopify-promote.sh) |

---

## Files Changed

| File | Change |
|---|---|
| `script/update-production.sh` | `main` → `master` throughout |
| `script/release-candidate.sh` | `origin/main` → `origin/master` throughout |
| `script/shopify-promote.sh` | New — Oxygen promote script |
| `frontend/.github/workflows/oxygen-deployment-1000084126.yml` | `on: [push]` → `on: push: branches: [main]` |
| `frontend/.gitignore` | Added `.env.*` rule |
| `frontend/app/routes/account_login_refactor.tsx` | Deleted (empty) |
| `frontend/app/routes/account_logout_refactor.tsx` | → `_archived_routes/` |
| `frontend/app/routes/account_refactor.tsx` | → `_archived_routes/` |
| `frontend/app/routes/learn.$slug.tsx` | → `_archived_routes/` |
| `frontend/app/routes/article.$blog.$handle.tsx` | → `_archived_routes/` |
| `frontend/app/routes/article.$slug.tsx` | → `_archived_routes/` |
| `frontend/src/` (20 files) | Deleted |
| `frontend/app/componentsMockup/` (15 files) | Deleted |
