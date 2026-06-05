# Task 4 — Hydrogen Architecture Assessment: BuyFloraBella Forward Strategy

**Status:** DONE  
**Date:** 2026-06-04  
**Type:** architecture / ops  
**Origin:** Migrated from `traceminerals_boardmansgame_com` project (task3_intent.md adapted for buyflorabella)

---

## Intent

Re-evaluate the Shopify Hydrogen architecture assessment from Task 3, now correctly targeted
at the live codebase at `buyflorabella/dev/frontend/`. Task 3 examined the correct codebase
indirectly (via `traceminerals/frontend/hydrogen-frontend-v7/`) — Task 2's zero-diff
validation confirms both are identical. This task re-frames those findings for buyflorabella
and produces a forward strategy with correct path references.

Two specific questions drive this task:

1. Does the latest Shopify Hydrogen version give us anything meaningful? What is the right
   approach to modernizing the base — start over from a clean scaffold and port in the UI,
   or fix in place?

2. The auth/login implementation is considered fragile and clunky. Does a rebuild resolve
   this? What are the specific risks?

---

## Objective

Produce `build_docs/task4_design_doc.md` — a corrected and updated version of the Task 3
design document, with all codebase references pointing to `buyflorabella/dev/frontend/`
and a refined recommendation incorporating the two-phase approach identified during
the Task 4 analysis.

---

## Background

`buyflorabella/dev/frontend/` is `traceminerals/frontend/hydrogen-frontend-v7/` with one
intentional delta (vite.config.ts HMR hostname). Task 3 examined that codebase in the
traceminerals context. All findings are valid — only the path references need correction.

The dev server is now **live** at `https://frontend.dev.buyflorabella.boardmansgame.com`.
This changes the risk profile for Option A (rebuild) vs. the original Task 3 assessment,
which assumed no live traffic.

---

## Deliverable

`claude_docs/build_docs/task4_design_doc.md` — see that file for full findings.

## Decision

Two-phase approach:
- **Phase 1 (immediate, ~half day):** Remove `login.tsx` duplicate, dead code, and `@remix-run/server-runtime` dep. Zero visual change, eliminates the two highest-risk items.
- **Phase 2 (deferred, 7–10 days):** Rebuild from fresh `@shopify/hydrogen@latest` scaffold, port UI and custom routes. Addresses long-term maintainability.

---

## Iteration Feedback

Task 3 design doc preserved at `build_docs/task3_design_doc.md` (historical, traceminerals refs).  
Corrected version at `build_docs/task4_design_doc.md` (buyflorabella refs, updated recommendation).
