# Task 6 — Shopify Oxygen Deployment: Stage 1
## Design Document — Forward Plan

**Date:** 2026-06-05
**Supercedes:** `task5_design_doc.md` (retained as historical reference)
**Scope:** Deploy existing codebase to Shopify Oxygen via GitHub `main` branch
**Status:** PLAN_READY
**Repo:** `github.com/buyflorabella/buyflorabella-marketohub-v2`

---

## Established Facts (Corrections to Task 5 Assumptions)

The following were marked `ASSUMPTION` or `UNKNOWN` in task5_design_doc.md. They are now resolved:

| Task 5 Assumption | Actual State |
|---|---|
| Repo is `hydrogen-frontend-v7` | **Historical.** `hydrogen-frontend-v7` was the source this codebase was ported from. It has no forward meaning. The active repo is `buyflorabella/buyflorabella-marketohub-v2`. |
| VPS outer repo and GitHub repo may be separate | **Same repo.** `dev/` is a git worktree on the `dev` branch. `prod/` is a git worktree on the `master` branch. Both point to `buyflorabella-marketohub-v2`. |
| `main` branch is the same structure as `dev`/`master` | **No.** `main` is a structurally distinct branch — Shopify-only. See section 1.2. |

---

## Executive Summary

**Goal for Stage 1:** Get the BuyFloraBella Hydrogen frontend deploying to Shopify Oxygen using the existing codebase, via the `main` branch in `buyflorabella-marketohub-v2`. No rescaffold. No architecture rewrite.

**What Stage 1 is NOT:**
- Not a rescaffold using a fresh Shopify Hydrogen base (deferred)
- Not a decommission of the VPS workflow
- Not a migration of the Flask backend

**The VPS `dev`/`prod` worktree pattern continues unchanged.** `update-production.sh` continues to target `master`/`prod/` exactly as it always has. Oxygen is a separate deployment pipeline that runs after VPS production is confirmed stable.

---

## 1. Repository and Branch Architecture

### 1.1 Authoritative Repository

**Repo:** `github.com/buyflorabella/buyflorabella-marketohub-v2`

The `hydrogen-frontend-v7` GitHub repo is historical. All forward references in docs, scripts, and workflows must use `buyflorabella-marketohub-v2`.

### 1.2 Branch Topology — Three Distinct Branch Types

The repo has three branches with **different directory structures**. Each branch has a corresponding VPS worktree:

```
buyflorabella-marketohub-v2 (GitHub)
│
├── dev branch ─────── VPS worktree: /var/www/html/buyflorabella/dev/
│   Full project tree:                (daily development)
│   ├── frontend/    ← Hydrogen app source  port 15220
│   ├── backend/     ← Flask                port 15221
│   ├── script/
│   ├── apache/
│   └── systemd/
│
├── master branch ──── VPS worktree: /var/www/html/buyflorabella/prod/
│   Full project tree (same structure as dev):  (VPS production)
│   ├── frontend/    ← Hydrogen app source  port 20220
│   ├── backend/     ← Flask                port 20221
│   ├── script/
│   └── ...
│
└── main branch ─────── VPS worktree: /var/www/html/buyflorabella/main/
    Flattened Hydrogen-only tree:      (Shopify build validation — no persistent port)
    ├── .github/
    │   └── workflows/
    │       └── oxygen-deployment-1000084126.yml
    ├── app/            ← was frontend/app/
    ├── public/         ← was frontend/public/
    ├── server.ts       ← was frontend/server.ts
    ├── vite.config.ts  ← was frontend/vite.config.ts
    ├── package.json    ← was frontend/package.json
    └── ... (all of frontend/ promoted to root)
    (no backend/, no script/, no apache/, no systemd/)
```

**`main` is machine-managed.** It is never edited manually and is never a development environment. Its VPS worktree at `/buyflorabella/main/` exists solely to inspect and validate the output of the promote script before pushing to GitHub. It has no assigned service port.

### 1.3 VPS Work Tree Strategy

**The current VPS worktree strategy is kept intact with one addition:** the `main` worktree.

| Worktree | Branch | Path | Purpose |
|---|---|---|---|
| `dev/` | `dev` | `/buyflorabella/dev/` | Development (ports 15220/15221) |
| `prod/` | `master` | `/buyflorabella/prod/` | VPS production (ports 20220/20221) |
| `main/` | `main` | `/buyflorabella/main/` | Shopify build validation (no port) |

`update-production.sh` continues to operate on `prod/` (master branch) only. It is unchanged.

The VPS continues to serve:
- Active development (dev branch, port 15220/15221)
- Hydrogen production on VPS (master branch, port 20220/20221) — continues until Oxygen is confirmed stable
- Flask backend (survey API, mail API) — stays on VPS permanently; Oxygen cannot run Python

---

## 2. The Shopify Build Stage

The "Shopify build stage" is a **separate pipeline** from `update-production.sh`. The two are independent:

| Script | Source branch | Target | Purpose |
|---|---|---|---|
| `update-production.sh` | `dev` → `master` | `prod/` worktree, VPS ports 20220/20221 | VPS production deploy |
| `shopify-promote.sh` *(new)* | `master` → `main` | `main` worktree, then GitHub | Shopify Oxygen deploy |

### 2.1 Concept

`shopify-promote.sh` runs **after** `update-production.sh` has already promoted code to `master` and VPS production has been verified. It then:

1. Reads `frontend/` contents from `master`
2. Writes those contents to the root of the `main` worktree (replacing existing content, preserving `.github/workflows/`)
3. Commits in the `main` worktree
4. Allows manual inspection of `/buyflorabella/main/` before pushing
5. Pushes `main` to GitHub origin
6. GitHub Actions fires → `npx shopify hydrogen deploy` → Shopify Oxygen → `buyflorabella.com`

**Why `main` has a different structure from `dev`/`master`:**
Shopify Oxygen expects the Hydrogen app at the repo root (`package.json`, `server.ts`, `app/` at `/`). The VPS repo has those files inside `frontend/`. The `main` branch presents the Hydrogen app at root the way Shopify expects, without restructuring `dev` or `master`.

### 2.2 Promotion Flow

```
[dev branch — VPS, daily work]
  develop → test on port 15220
  ↓ merge to master when stable

[update-production.sh — unchanged]
  promotes master → prod/ worktree
  starts Hydrogen on port 20220
  verify VPS production
  ↓ (when satisfied)

[shopify-promote.sh — new]
  1. confirm on master, working tree clean
  2. rsync frontend/ → /buyflorabella/main/  (preserve .github/)
  3. cd /buyflorabella/main/ && git add -A && git commit
  4. (optional) inspect /buyflorabella/main/ locally — run npm ci && npm run build to verify
  5. git push origin main
  ↓

[main branch — GitHub, buyflorabella-marketohub-v2]
  GitHub Actions: oxygen-deployment-1000084126.yml fires
  (trigger: on push to main only)
  npx shopify hydrogen deploy
  ↓

[Shopify Oxygen — buyflorabella.com]
```

### 2.3 `main` Branch Invariants

- `main` is **never merged to** from `dev` or `master` directly
- `main` is **never edited manually**; only `shopify-promote.sh` writes to it
- `main` always reflects the last state of `frontend/` that was explicitly promoted
- The `/buyflorabella/main/` worktree is the staging area — push only after local build validates

---

## 3. Shopify Store Setup: Order of Operations

**Answer to "Do we need to make a new Shopify store before we build, or the other way around?"**

The Shopify Hydrogen storefront (Oxygen) must exist **before** a push to `main` can deploy anywhere. However, the code can be built and locally validated at any time without it. The two tracks are independent until the first push.

### Track A — Code (can start immediately)
1. Write `shopify-promote.sh`
2. Create the `main` worktree locally
3. Run the promote script → inspect `/buyflorabella/main/`
4. Run `npm ci && npm run build` in `/buyflorabella/main/` to confirm the Hydrogen build completes
5. Fix any build errors, route conflicts, dead code

**This track requires no Shopify credentials and no internet connection.**

### Track B — Shopify Admin (must complete before first push to GitHub)
1. Confirm the existing Shopify store at `buyflorabella.com` has a Hydrogen storefront in the admin (storefront ID `1000084126` is already referenced in the workflow)
2. In Shopify Admin → Hydrogen → Storefront → connect it to `buyflorabella/buyflorabella-marketohub-v2` on GitHub (not the old `hydrogen-frontend-v7` repo)
3. Retrieve the `OXYGEN_DEPLOYMENT_TOKEN` for storefront `1000084126`
4. Set it as a GitHub secret: `OXYGEN_DEPLOYMENT_TOKEN_1000084126`
5. Configure all required environment variables in the Oxygen dashboard (see section 4.2)

**Track B requires access to Shopify Partner/Admin dashboard.**

### Merge Point
Once both tracks are complete, push `main` → GitHub → Oxygen deployment fires → validate storefront on the Oxygen URL.

**The storefront already exists** (storefront ID `1000084126` is in the workflow). The key Track B action is reconnecting it from `hydrogen-frontend-v7` to `buyflorabella-marketohub-v2`.

---

## 4. Stage 1 Work Items

Stage 1 is complete when: a push to `main` triggers a successful Oxygen build, and the storefront loads from Oxygen with full functionality.

### 4.1 Security: Credential Audit

**Do first.**

Check whether `.env.dxb-reference` (or any `.env.*` file containing real API tokens) is tracked in the GitHub repo. If so:
1. Add `.env.dxb-reference` to `frontend/.gitignore`
2. Remove it from git tracking (`git rm --cached`)
3. Rotate any exposed tokens (`SESSION_SECRET`, `PRIVATE_STOREFRONT_API_TOKEN`, etc.)

### 4.2 Shopify Dashboard: Configure Oxygen Environment Variables

In Shopify Admin → Hydrogen → Storefront 1000084126 → Environment Variables, set:

**Required (startup fails without):**
- `SESSION_SECRET`
- `PRIVATE_STOREFRONT_API_TOKEN`
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN` → `buyflorabella.com`
- `PUBLIC_CHECKOUT_DOMAIN` → `buyflorabella.com`
- `PUBLIC_CUSTOMER_ACCOUNT_API_URL` → `https://shopify.com/64048332903`

**Required for feature functionality:**
- `PUBLIC_STORE_LOCKED` / `PUBLIC_STORE_PASSWORD`
- `PUBLIC_MAIL_API_BASE` / `PUBLIC_MAIL_API_ROUTE`
- `PUBLIC_SURVEY_API_BASE` / `PUBLIC_SURVEY_API_ROUTE`
- `PUBLIC_OMNISEND_BRAND_ID`

**Optional feature flags (safe to omit; features disabled):**
- `PUBLIC_FEATURE_WHATSAPP`, `PUBLIC_FEATURE_BOOKMARK`, `PUBLIC_FEATURE_WISHLIST`
- `PUBLIC_ANNOUNCEMENT_BAR_ENABLED`, `PUBLIC_ANNOUNCEMENT_BAR_MESSAGE`
- `PUBLIC_COUNTDOWN_TIMER_ENABLED`
- `PUBLIC_SITE_SURVEY_ENABLED`, `PUBLIC_SITE_SURVEY_SINGLE_ANSWER`
- `PUBLIC_WHATSAPP_*` (4 vars)

### 4.3 Fix Oxygen Workflow Trigger

The workflow on `main` must fire only on pushes to `main`. This change lives in `frontend/.github/workflows/oxygen-deployment-1000084126.yml` on `dev`/`master`, and is carried to `main` by `shopify-promote.sh`.

```yaml
# Current (fires on all branches — broken):
on: [push]

# Correct:
on:
  push:
    branches: [main]
```

### 4.4 Create `main` Worktree

```bash
cd /var/www/html/buyflorabella
git worktree add main main   # checkout the 'main' branch into the 'main/' directory
```

If `main` does not yet exist as a branch:

```bash
git worktree add --orphan -b main main
```

This creates `/var/www/html/buyflorabella/main/` as a working tree on the `main` branch.

### 4.5 Write `shopify-promote.sh`

Create `script/shopify-promote.sh`. The script:

1. Confirms current branch is `master` and working tree is clean
2. Records the current `master` commit SHA
3. Uses `rsync` to copy `frontend/` contents into `/buyflorabella/main/`, excluding `node_modules`, `.env*`, and preserving `main`'s `.github/` directory
4. `cd /buyflorabella/main/ && git add -A && git commit -m "shopify-promote: from master@<SHA>"`
5. Prints a summary and waits for user confirmation before pushing
6. `git push origin main`

### 4.6 Code Structure Cleanup

React Router picks up all files in `app/routes/` — duplicate and stale routes cause undefined behavior in Oxygen.

**Duplicate routes (must resolve before first promote):**

| Files | Problem | Action |
|---|---|---|
| `account_login_refactor.tsx` + `account_.login.tsx` | Both matched by router | Identify active version; archive the other outside `routes/` |
| `account_logout_refactor.tsx` + `account_.logout.tsx` | Same | Same |
| `account_refactor.tsx` + `account.tsx` | Same | Same |
| `learn.$handle.tsx` + `learn.$slug.tsx` | Same URL pattern, different param names | Keep one; delete the other |
| `article.$blog.$handle.tsx` + `article.$blogHandle.$articleHandle.tsx` | Same URL pattern | Keep one; delete the other |

**Dead code removal:**
- `src/` directory — SPA-era migration artifact
- `componentsMockup/` — superseded by `componentsMockup2/`

**`componentsMockup2/main.tsx` SSR risk:** Contains `ReactDOM.createRoot()`. Must not be in the active SSR module graph. Audit imports from `root.tsx` before first promote.

### 4.7 Validation Checklist (before Stage 1 is done)

**Local (Track A):**
- [ ] `main` worktree created at `/buyflorabella/main/`
- [ ] `shopify-promote.sh` runs cleanly; `/buyflorabella/main/` has Hydrogen app at root, no `backend/` or `script/`
- [ ] `npm ci && npm run build` succeeds in `/buyflorabella/main/`

**Shopify Admin (Track B):**
- [ ] Storefront 1000084126 connected to `buyflorabella-marketohub-v2` (not `hydrogen-frontend-v7`)
- [ ] `OXYGEN_DEPLOYMENT_TOKEN_1000084126` set as GitHub secret
- [ ] All required env vars configured in Oxygen dashboard

**Post-push:**
- [ ] GitHub Actions workflow fires only on `main` push (not on `dev` or `master`)
- [ ] Oxygen build completes without errors
- [ ] Storefront loads from Oxygen URL (products, collections, cart)
- [ ] Customer account login/logout works
- [ ] Password gate works
- [ ] Contact form reaches VPS mail API
- [ ] Survey form reaches VPS survey API

---

## 5. Deferred Items (Not Stage 1)

| Item | Reason for Deferral |
|---|---|
| Rescaffold using updated Shopify Hydrogen base | Deferred to a future stage after Stage 1 is stable |
| VPS frontend decommission (port 20220) | Remains as backup until Oxygen confirmed stable over time |
| Oxygen preview environment for `dev` branch | Not required for Stage 1 |
| Move `site-validations/backend/` out of `frontend/` | Low impact; deferred |
| Supabase dependency audit | Low priority; tree-shaking handles it |

---

## 6. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| `.env.dxb-reference` tracked in public GitHub repo → credentials exposed | HIGH | Audit first; rotate if exposed |
| `SESSION_SECRET` not set in Oxygen → storefront crashes on first request | HIGH | Configure before first promote push |
| Storefront still connected to `hydrogen-frontend-v7` → deployment token mismatch | HIGH | Verify storefront GitHub connection in Shopify Admin (Track B step 2) |
| `shopify-promote.sh` corrupts `main` (loses `.github/workflows/`) | HIGH | rsync must exclude and preserve `.github/`; test dry-run first |
| Duplicate routes cause silent misrouting in Oxygen production | MEDIUM | Resolve route conflicts before first promote |
| `componentsMockup2/main.tsx` accidentally pulled into SSR bundle | MEDIUM | Audit import graph before first promote |

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  VPS — buyflorabella-marketohub-v2 (three worktrees)                │
│                                                                     │
│  /buyflorabella/dev/   (branch: dev)                               │
│    frontend/  port 15220 │  backend/ port 15221                    │
│         ↓ merge to master                                           │
│                                                                     │
│  /buyflorabella/prod/  (branch: master)  ◄── update-production.sh  │
│    frontend/  port 20220 │  backend/ port 20221   (unchanged)      │
│         ↓ shopify-promote.sh                                        │
│                                                                     │
│  /buyflorabella/main/  (branch: main)  ◄── shopify-promote.sh      │
│    app/  server.ts  package.json  ...   (no backend/, no script/)  │
│    validate: npm run build                                          │
│         ↓ git push origin main                                      │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GitHub: buyflorabella/buyflorabella-marketohub-v2                  │
│  main branch → GitHub Actions: oxygen-deployment-1000084126.yml     │
│                npx shopify hydrogen deploy                          │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                  Shopify Oxygen → buyflorabella.com
                               │
              ┌────────────────┴─────────────────┐
              │  VPS Persistent Services          │
              │  Survey API: boardmansgame.com    │
              │  Mail API: remail.buyflorabella   │
              └───────────────────────────────────┘
```

---

## 8. Open Questions — Resolved

| # | Question | Answer |
|---|---|---|
| 1 | Is `.env.dxb-reference` tracked in the GitHub repo? | **Unknown — must audit.** Check GitHub file tree for `buyflorabella-marketohub-v2` main branch. If present, rotate credentials before any public push. |
| 2 | Does `main` branch already exist on GitHub? | **Unknown.** If it does (from `hydrogen-frontend-v7` era content), its history can be discarded — `shopify-promote.sh` will force-replace its content. If not, create as orphan. |
| 3 | Does `release-candidate.sh` push to `main`? | **Unknown — inspect the script.** If it does, it will need to be updated or replaced by `shopify-promote.sh`. |
| 4 | Do we need a new Shopify store before building, or the other way around? | **No new store needed. The storefront (ID 1000084126) already exists.** The code build (Track A) can proceed independently of Shopify Admin setup (Track B). They merge at the first push to `main`. The key Track B action is reconnecting the existing storefront from `hydrogen-frontend-v7` to `buyflorabella-marketohub-v2` in Shopify Admin. |

---

*task5_design_doc.md is retained at its original path as a historical reference and assessment record.*
