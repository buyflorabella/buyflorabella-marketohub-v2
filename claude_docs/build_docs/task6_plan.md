# Task 6 — Shopify Oxygen Deployment: Stage 1
## Execution Plan

**Date:** 2026-06-05
**Status:** PENDING
**DD:** `task6_design_doc.md`

---

## Ground Truth (Correction to DD)

The DD describes `dev` + `master` as VPS branches and `main` as Shopify-only. The **actual current state** is:

```
git worktree list:
  /var/www/html/buyflorabella/dev    [dev]
  /var/www/html/buyflorabella/prod   [main]   ← prod/ is on main, NOT master

Remote branches:
  origin/dev
  origin/main
```

`update-production.sh` merges `dev → main` and pushes `origin/main`. There is no `master` branch.

**To reach the DD target state, the first block of work renames `main` → `master`** so that `main` can become the Shopify-only branch. The DD is the correct target; the plan accounts for how to get there from the current state.

---

## Execution Blocks

### Block 0 — Branch Rename: `main` → `master`

**Goal:** Free up `main` for Shopify. Move VPS production to `master`.

**Why this must go first:** `main` already exists as a VPS production branch with the full project tree. A new Shopify `main` (flat Hydrogen-only) cannot be created until the VPS production branch is renamed.

**Prerequisite:** Confirm there is no active Shopify/Oxygen deployment connected to `buyflorabella-marketohub-v2`. If one exists, the GitHub `main` branch is already being watched by Oxygen — do not rename until Track B (Shopify Admin) is coordinated.

**Steps (run from `dev/` worktree):**

1. Create `master` from the current `main`:
   ```bash
   git branch master main
   git push origin master
   ```

2. Update `prod/` worktree to track `master`:
   ```bash
   # From dev/ — switch the prod worktree's checked-out branch
   git -C /var/www/html/buyflorabella/prod checkout master
   ```

3. Update `update-production.sh` — change all `main` branch references to `master`:
   - `git log main..dev` → `git log master..dev`
   - `git merge dev` (in Phase 0 context of prod/main) → `git merge dev` (still merges dev into current branch, which is now master — no change needed in logic, but comments/log messages referencing "main" need updating)
   - `git push origin main` → `git push origin master`
   - `git ls-remote --exit-code origin main` → `git ls-remote --exit-code origin master`
   - `git pull origin main` → `git pull origin master`

4. Update `release-candidate.sh` — change `origin/main` references to `origin/master`:
   - Phase 2 sync check: `git log HEAD..origin/main` → `git log HEAD..origin/master`
   - Merge prompt and merge command: `origin/main` → `origin/master`

5. Verify `prod/` still works:
   ```bash
   cd /var/www/html/buyflorabella/prod
   git branch   # should show: * master
   ```

6. Delete the old remote `main` branch (only after `master` is confirmed working):
   ```bash
   git push origin --delete main
   ```
   > ⚠️ If GitHub's default branch is `main`, change it to `master` in GitHub repo Settings → Branches → Default branch BEFORE deleting `main`.

7. Verify `dev` worktree still works:
   ```bash
   cd /var/www/html/buyflorabella/dev
   git branch -a   # dev + master, no main
   ```

**Deliverables:**
- `prod/` worktree is on `master` branch
- `update-production.sh` references `master` throughout
- `release-candidate.sh` references `origin/master` throughout
- `origin/main` deleted from GitHub

---

### Block 1 — Fix Oxygen Workflow Trigger

**Goal:** The Oxygen workflow must only fire on pushes to `main`. It currently fires on all branches.

**File:** `frontend/.github/workflows/oxygen-deployment-1000084126.yml` (on `dev` branch)

Change:
```yaml
# Current:
on: [push]

# Replace with:
on:
  push:
    branches: [main]
```

This change travels to `main` via `shopify-promote.sh` in Block 4. It must exist in `frontend/` on `dev`/`master` first.

**Commit this on `dev` branch** and let normal `update-production.sh` flow carry it to `master`.

---

### Block 2 — Code Structure Cleanup

**Goal:** Resolve duplicate routes and remove dead code before the first Oxygen deployment.

**All work on `dev` branch. Commit and let `update-production.sh` carry to `master`.**

#### 2a. Credential Audit
Check whether `frontend/.env.dxb-reference` is tracked in `buyflorabella-marketohub-v2` on GitHub. If present:
```bash
# Add to frontend/.gitignore:
echo ".env.dxb-reference" >> frontend/.gitignore
git rm --cached frontend/.env.dxb-reference
git commit -m "security: remove .env.dxb-reference from tracking"
```
Then rotate: `SESSION_SECRET`, `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_STOREFRONT_API_TOKEN`.

#### 2b. Duplicate Route Resolution
Inspect `frontend/app/routes/` and resolve each conflict. For each pair, determine which file is active (check imports, git log, actual usage):

| Pair | Action |
|---|---|
| `account_login_refactor.tsx` vs `account_.login.tsx` | Keep active; move other to `frontend/app/_archive/` |
| `account_logout_refactor.tsx` vs `account_.logout.tsx` | Same |
| `account_refactor.tsx` vs `account.tsx` | Same |
| `learn.$handle.tsx` vs `learn.$slug.tsx` | Keep one; delete the other |
| `article.$blog.$handle.tsx` vs `article.$blogHandle.$articleHandle.tsx` | Keep one; delete the other |

Note: React Router does NOT route files under `_archive/` (non-route directory). Alternatively move them outside `app/routes/` entirely.

#### 2c. Dead Code Removal
```
frontend/src/           — delete entire directory (SPA migration artifact)
frontend/app/componentsMockup/   — delete entire directory (superseded by componentsMockup2/)
```

Verify no active imports before deleting:
```bash
grep -r "from.*componentsMockup[^2]" frontend/app/
grep -r "from.*\/src\/" frontend/app/
```

#### 2d. SSR Risk: `componentsMockup2/main.tsx`
This file contains `ReactDOM.createRoot()` which breaks SSR if imported. Confirm it is not in the module graph:
```bash
grep -r "componentsMockup2/main" frontend/app/
```
If found in any import, replace the import with the specific component it needs instead of the bootstrap entry point.

---

### Block 3 — Create `main` Worktree

**Goal:** Create `/var/www/html/buyflorabella/main/` as a git worktree on the `main` branch.

**After Block 0 completes** (old `main` deleted, `master` is now VPS production).

```bash
cd /var/www/html/buyflorabella/dev

# Create main as an orphan branch (no shared history with dev/master)
git checkout --orphan main
git rm -rf .   # clear the working tree
git commit --allow-empty -m "init: shopify main branch (managed by shopify-promote.sh)"
git push origin main
git checkout dev   # return to dev branch

# Add main/ worktree
git worktree add /var/www/html/buyflorabella/main main
```

Verify:
```bash
git worktree list
# Expected:
# /var/www/html/buyflorabella/dev    [dev]
# /var/www/html/buyflorabella/prod   [master]
# /var/www/html/buyflorabella/main   [main]
```

---

### Block 4 — Write `shopify-promote.sh`

**Goal:** Script that populates `main` from `frontend/` on `master` and pushes to GitHub.

**File:** `script/shopify-promote.sh` (written on `dev` branch, committed, carried to `master` by `update-production.sh`)

**Script logic:**

```bash
#!/usr/bin/env bash
set -e

# Guard: must run from prod/ worktree (on master branch)
# Source: frontend/ in the current worktree (master)
# Target: /var/www/html/buyflorabella/main/ (main branch worktree)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MAIN_WORKTREE="/var/www/html/buyflorabella/main"
FRONTEND_SRC="${PROJECT_ROOT}/frontend"
SOURCE_SHA=$(git -C "${PROJECT_ROOT}" rev-parse --short HEAD)

# 1. Guard checks (on master, clean working tree)
# 2. rsync frontend/ → main worktree root
#    - exclude: node_modules/, .env*, *.log
#    - preserve: .github/ (already in main from Block 3 setup)
#    - delete extraneous files in destination
rsync -av --delete \
  --exclude='node_modules/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='.cache/' \
  --filter=':- .gitignore' \
  "${FRONTEND_SRC}/" "${MAIN_WORKTREE}/"

# 3. Stage, commit
cd "${MAIN_WORKTREE}"
git add -A
git commit -m "shopify-promote: from master@${SOURCE_SHA}"

# 4. Show what will be pushed; prompt for confirmation
git log --oneline -5
# (prompt: "Push main to GitHub? This triggers Oxygen deployment.")

# 5. Push
git push origin main
```

**Key rsync flags:**
- `--delete`: removes files in `main/` that are no longer in `frontend/` (keeps them in sync)
- `--exclude='.env.*'`: never copies env files (credentials stay off GitHub)
- `.github/` in `main/` is seeded by Block 3 and never touched by rsync (rsync syncs FROM `frontend/` which has `.github/workflows/` — so the workflows ARE copied, which is correct; we want the workflow in `main`)

**Note:** `.github/workflows/` inside `frontend/` is the workflow file that Shopify Oxygen uses. It must be present in `main/`'s root. Since rsync copies `frontend/` contents including `frontend/.github/`, the workflow is included automatically.

---

### Block 5 — Shopify Admin: Track B

**These steps require Shopify Partner/Admin access. They can run in parallel with Blocks 1–4.**

1. Log in to Shopify Admin for `buyflorabella.com`
2. Navigate to: Sales Channels → Hydrogen → Storefront 1000084126
3. Verify or update the GitHub repo connection: must point to `buyflorabella/buyflorabella-marketohub-v2`, branch `main`
   - If still connected to `hydrogen-frontend-v7`, disconnect and reconnect to the correct repo
4. Retrieve the `OXYGEN_DEPLOYMENT_TOKEN` for storefront 1000084126
5. Set GitHub secret on `buyflorabella-marketohub-v2`:
   - Repo → Settings → Secrets and variables → Actions
   - Name: `OXYGEN_DEPLOYMENT_TOKEN_1000084126`
   - Value: token from step 4
6. Configure Oxygen environment variables (Shopify Admin → Hydrogen → Storefront → Environment Variables):
   - See DD section 4.2 for the full list

---

### Block 6 — First Promotion and Validation

**Prerequisite:** Blocks 0–5 all complete.

1. From `prod/` worktree (on `master`):
   ```bash
   ./script/shopify-promote.sh
   ```

2. Inspect `/var/www/html/buyflorabella/main/`:
   - Confirm `app/`, `server.ts`, `package.json` at root
   - Confirm no `backend/`, `script/`, `apache/` directories
   - Confirm `.github/workflows/oxygen-deployment-1000084126.yml` is present

3. Optional local build validation:
   ```bash
   cd /var/www/html/buyflorabella/main
   npm ci
   npm run build
   # Must complete without errors
   ```

4. Confirm push (script prompts before pushing)

5. In GitHub Actions for `buyflorabella-marketohub-v2` → Actions tab:
   - Verify workflow fires on the `main` push
   - Verify it does NOT fire on `dev` or `master` pushes

6. Validate the Oxygen deployment using the checklist from DD section 4.7.

---

## Execution Order

```
Block 0  — rename main→master, update scripts          (BLOCKING: must go first)
Block 1  — fix workflow trigger                         (can start after Block 0)
Block 2  — code cleanup (credential audit, routes)      (can run parallel with Block 1)
Block 3  — create main worktree                         (after Block 0)
Block 4  — write shopify-promote.sh                     (after Block 3)
Block 5  — Shopify Admin / Track B                      (parallel with all other blocks)
Block 6  — first promote + validation                   (after Blocks 1–5 all done)
```

---

## Files Modified by This Task

| File | Block | Change |
|---|---|---|
| `script/update-production.sh` | 0 | `main` → `master` throughout |
| `script/release-candidate.sh` | 0 | `origin/main` → `origin/master` throughout |
| `frontend/.github/workflows/oxygen-deployment-1000084126.yml` | 1 | `on: [push]` → `on: push: branches: [main]` |
| `frontend/app/routes/*_refactor.tsx` (5 files) | 2b | Moved to archive or deleted |
| `frontend/app/routes/learn.$handle.tsx` or `learn.$slug.tsx` | 2b | One deleted |
| `frontend/app/routes/article.*` (duplicate) | 2b | One deleted |
| `frontend/src/` (directory) | 2c | Deleted |
| `frontend/app/componentsMockup/` (directory) | 2c | Deleted |
| `script/shopify-promote.sh` | 4 | New file |

---

## Risk Notes

| Risk | Block | Mitigation |
|---|---|---|
| Deleting `origin/main` before GitHub default branch is changed → GitHub rejects delete | 0 | Change default branch in GitHub Settings first |
| `rsync --delete` removes files it shouldn't in `main/` | 4 | Dry-run first: add `--dry-run` flag, review output before live run |
| Workflow fires immediately on first push to new `main` branch (Block 3) without env vars set | 3/5 | Complete Block 5 (env vars) before Block 6 (first push via shopify-promote) |
| Rotating exposed tokens (Block 2a) requires updating VPS `.env` files and Oxygen dashboard simultaneously | 2a | Coordinate: update Oxygen dashboard first, then VPS env files, then push |
