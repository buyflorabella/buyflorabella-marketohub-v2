# Task 6 Outcome — Shopify Oxygen Deployment: Stage 1

**Status:** PENDING (planning complete; execution not yet started)
**Date:** 2026-06-05
**Produced by:** Claude Sonnet 4.6

---

## What Was Accomplished

Task 6 planning phase is complete. The design document and execution plan are approved and ready to execute. No code was changed.

**Documents produced:**
- `claude_docs/build_docs/task6_design_doc.md` — forward architecture DD (supersedes task5)
- `claude_docs/build_docs/task6_plan.md` — six-block execution plan

**Documents preserved as historical reference:**
- `claude_docs/build_docs/task5_design_doc.md` — full Oxygen compatibility assessment; retained as-is

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| No rescaffold; deploy existing codebase | Task 5 confirmed Oxygen compatibility. Rescaffold is deferred to a future stage. |
| `main` is the Shopify-only branch (flat Hydrogen at root) | Shopify Oxygen must read from `main`. The VPS project structure (frontend/ + backend/) is incompatible with Shopify's expected repo root layout. |
| VPS production branch renamed `main` → `master` | `main` is already in use as VPS production. Must be freed before a new Shopify `main` can be created. |
| Separate `shopify-promote.sh` script | VPS production deploy (`update-production.sh`) and Shopify deploy are independent pipelines; the promote script runs only after VPS production is verified. |
| `main/` worktree added at `/buyflorabella/main/` | Allows local inspection and build validation of the Shopify branch before any push to GitHub. |
| Flask backend stays on VPS | Oxygen cannot run Python; backend is decoupled and accessed via HTTP env vars. |

---

## Corrections to Prior DD (task5)

Task 5 made assumptions that are now resolved:

| task5 Assumption | Actual State |
|---|---|
| Repo is `hydrogen-frontend-v7` | Historical. Active repo: `buyflorabella/buyflorabella-marketohub-v2` |
| `prod/` worktree is on `master` branch | `prod/` is on `main` branch (confirmed via `git worktree list`) |
| There is a `master` branch | No `master` exists; only `dev` and `main` |
| VPS and GitHub repo may be separate | Same repo. `dev/` = `dev` branch worktree; `prod/` = `main` branch worktree |

---

## Execution Blocks Summary

| Block | Scope | Dependency |
|---|---|---|
| 0 | Rename `main` → `master`; update scripts | First — blocks everything else |
| 1 | Fix Oxygen workflow trigger to `branches: [main]` | After Block 0 |
| 2 | Credential audit + duplicate route cleanup + dead code removal | Parallel with Block 1 |
| 3 | Create `main` orphan branch + `main/` worktree | After Block 0 |
| 4 | Write `shopify-promote.sh` | After Block 3 |
| 5 | Shopify Admin: reconnect storefront to correct repo, set deployment token, configure env vars | Parallel with Blocks 1–4 |
| 6 | First promote + Oxygen validation | After all blocks done |

---

## Files That Will Change During Execution

| File | Block | Change |
|---|---|---|
| `script/update-production.sh` | 0 | `main` → `master` throughout |
| `script/release-candidate.sh` | 0 | `origin/main` → `origin/master` throughout |
| `frontend/.github/workflows/oxygen-deployment-1000084126.yml` | 1 | `on: [push]` → `on: push: branches: [main]` |
| `frontend/app/routes/*_refactor.tsx` (5 files) | 2b | Archived or deleted |
| `frontend/app/routes/learn.$handle.tsx` or `learn.$slug.tsx` | 2b | One deleted |
| `frontend/app/routes/article.*` (duplicate) | 2b | One deleted |
| `frontend/src/` (directory) | 2c | Deleted |
| `frontend/app/componentsMockup/` (directory) | 2c | Deleted |
| `script/shopify-promote.sh` | 4 | New file |

---

## Human Action Required Before Block 6

Block 5 requires Shopify Admin access (human-only):
- Reconnect storefront 1000084126 from `hydrogen-frontend-v7` to `buyflorabella-marketohub-v2`, branch `main`
- Retrieve and set `OXYGEN_DEPLOYMENT_TOKEN_1000084126` as a GitHub secret
- Configure all Oxygen environment variables in Shopify Admin dashboard

---

## Open Items at Execution Start

- Is `.env.dxb-reference` tracked in the GitHub repo? (Block 2a audit will answer this)
- Does `release-candidate.sh` reference the `main` branch anywhere beyond what was read? (confirm during Block 0)
- GitHub default branch setting: must be changed from `main` to `master` in GitHub Settings before `origin/main` can be deleted (Block 0, step 6)
