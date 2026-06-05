# TASK Outcome

_Overwritten after every significant task._

**Last task:** Task 4 — Hydrogen Architecture Assessment Re-framed for BuyFloraBella  
**Date:** 2026-06-04  
**Status:** DONE  
**Deliverable:** `claude_docs/build_docs/task4_design_doc.md`

Re-evaluated Task 3 design doc for `buyflorabella/dev/frontend/` (zero-diff confirmed).
All findings identical; path references corrected; recommendation refined.

**Two-phase recommendation:**
- Phase 1 (~4 hours, do now): Remove `@remix-run/server-runtime`, remove `login.tsx` duplicate, delete dead code from `account.tsx`. Zero visual impact.
- Phase 2 (7–10 days, deferred): Full rebuild from `@shopify/hydrogen@latest` scaffold, clean port of UI and custom routes. Document as Task 5.

**Auth root cause:** Duplicate login route, missing address CRUD, no order pagination, CartContext coupling. OAuth/PKCE itself is solid.

**Next:** Resolve three unknowns before Phase 2 — Supabase active use?, canonical login URL, address CRUD priority.
