# TASK Outcome

_Overwritten after every significant task._

**Last task:** Task 6 — Shopify Oxygen Deployment: Stage 1 (planning phase)
**Date:** 2026-06-05
**Status:** PENDING (plan approved, execution not yet started)
**Deliverables:** `build_docs/task6_design_doc.md`, `build_docs/task6_plan.md`, `tasks/task6_outcome.md`

Planning complete. Goal: deploy existing Hydrogen frontend to Shopify Oxygen via `main` branch in `buyflorabella-marketohub-v2`. No rescaffold.

**Key discovery:** `prod/` worktree is on `main` (not `master`). Block 0 of the plan renames `main` → `master` to free `main` for the Shopify-only deployment branch.

**6 execution blocks:**
- Block 0: Rename `main` → `master`, update scripts (blocking)
- Block 1: Fix Oxygen workflow trigger to `branches: [main]`
- Block 2: Credential audit + duplicate route cleanup + dead code removal
- Block 3: Create `main` orphan branch + `main/` worktree
- Block 4: Write `shopify-promote.sh`
- Block 5: Shopify Admin — reconnect storefront, set deploy token, configure env vars (human)
- Block 6: First promote + Oxygen validation

**Next:** Begin Block 0 (branch rename) when ready to execute.
