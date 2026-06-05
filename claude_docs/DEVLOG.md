# BuyFloraBella — Dev Log

Append-only session history. Newest entries at top.

**Note:** This project was spun up from the `traceminerals_boardmansgame_com` project on
2026-06-04. Entries for Tasks 1–3 originated there and are carried over for continuity.

---

## 2026-06-05 — Task 6 PENDING: Shopify Oxygen Deployment — Stage 1 Planning Complete

**Status:** PENDING
**Deliverables:** `build_docs/task6_design_doc.md`, `build_docs/task6_plan.md`
**Historical reference:** `build_docs/task5_design_doc.md` (full compatibility assessment)

Planning phase complete for getting the BuyFloraBella Hydrogen frontend deploying to Shopify Oxygen. No code changed. Key outputs:

**DD corrections vs task5:**
- Active repo is `buyflorabella/buyflorabella-marketohub-v2` (not `hydrogen-frontend-v7`, which is historical)
- `prod/` worktree is on `main` branch, not `master`; only `dev` and `main` branches exist

**Architecture decisions:**
- `main` branch = Shopify-only, flat Hydrogen-at-root structure (no frontend/ subdirectory)
- `master` = renamed VPS production branch (currently `main`)
- New `main/` worktree at `/buyflorabella/main/` for local Shopify build validation
- `shopify-promote.sh` = separate script that copies `frontend/` from `master` → `main/`, commits, pushes
- `update-production.sh` untouched in behavior; references updated `main` → `master`
- Flask backend stays on VPS permanently

**6-block execution plan:**
- Block 0 (blocking first): rename `main` → `master`, update scripts
- Blocks 1–4: workflow fix, code cleanup, worktree creation, promote script
- Block 5: Shopify Admin (human — reconnect storefront, deploy token, env vars)
- Block 6: first promotion + Oxygen validation

---

## 2026-06-04 — Task 4 DONE: Hydrogen Architecture Assessment Re-framed for BuyFloraBella

**Status:** DONE  
**Deliverable:** `claude_docs/build_docs/task4_design_doc.md`

Confirmed task3_design_doc.md findings are 100% applicable to `buyflorabella/dev/frontend/`
(zero-diff validated in Task 2). Produced corrected design doc with all path references
updated to buyflorabella. Added two-phase refined recommendation.

Key findings on the two developer questions:
- "Does latest Hydrogen help?" — No meaningful benefit from the 2025.7.2 → 2025.7.3 version
  bump alone. The gain comes from a clean scaffold, not the version number.
- "Auth is fragile" — Root cause identified: duplicate `login.tsx` (latent routing bug),
  missing address CRUD, no order pagination, CartContext coupling in orders. OAuth itself is
  solid. All fixable in-place.

Decision: Two-phase approach.
- Phase 1 (~4 hours, immediate): Remove `@remix-run/server-runtime`, remove `login.tsx`
  duplicate, delete dead code from `account.tsx`.
- Phase 2 (7–10 days, deferred): Full rebuild from fresh `@shopify/hydrogen@latest` scaffold,
  clean port of UI and custom routes. Document as Task 5.

---

## 2026-06-04 — Claude workflow migrated from traceminerals project

Lifted all Claude working docs from `traceminerals_boardmansgame_com/claude_docs/` and
`.claude/` into this project (`buyflorabella/dev/`). All task history, the design doc,
devlog, and workflow files are now here. Active development continues from this project.
Next task is Task 4.

---

## 2026-06-04 — Task 3 DONE: Hydrogen Codebase Assessment and Forward Strategy

**Status:** DONE  
**Deliverable:** `claude_docs/build_docs/task3_design_doc.md`

Conducted comprehensive architectural review of the full repository. Examined `headless-shopify/` (vanilla scaffold, 2025.7.0, JavaScript), `frontend/hydrogen-frontend-v7/` (developed codebase, 2025.7.2, TypeScript, 50+ routes), `alt-hydrogen-frontend-v8/` (2025.7.3), all deployment scripts, and authentication flows.

**Key findings:**
- `headless-shopify/` is a near-canonical Hydrogen scaffold, architecturally sound, but unconfigured (no Shopify credentials) and never deployed
- `hydrogen-frontend-v7/` has real custom work but carries `@remix-run/server-runtime` legacy debt, 50+ routes with duplicates, incomplete `componentsMockup2/` migration
- Nothing is currently listening on port 20107 — traceminerals site is down
- `script/settings` FRONTEND_DIR incorrectly points to non-Hydrogen `hydrogen-frontend-v4/`

**Recommendation:** Option A — use a clean Hydrogen scaffold as foundation, upgrade to 2025.7.3, add TypeScript and Tailwind, connect to Shopify store, port custom features from v7 selectively.

**Three pre-work blockers identified:** Shopify store credentials, OAuth callback URL registration, port reconciliation.

---

## 2026-06-04 — Task 2 DONE: Migrate Hydrogen V7 into Platform-Template Workflow

**Status:** DONE  
**Repo:** https://github.com/buyflorabella/buyflorabella-marketohub-v2.git  
**Dev worktree:** /var/www/html/buyflorabella/dev/

Executed all 14 blocks:
- Operations port registry updated (site_index 12, ports 15220/15221/20220/20221)
- GitHub repo created and initial commit pushed
- Git bare repo + dev/prod worktrees created
- Platform-template scripts ported and name-patched for buyflorabella
- Hydrogen source rsynced with zero source file changes (diff validated)
- vite.config.ts HMR host updated to `frontend.dev.buyflorabella.boardmansgame.com`
- Apache vhosts created (frontend + admin, dev + prod)
- DNS pre-flight: all 4 domains resolve to 74.208.147.12 ✅
- SSL certs issued: `buyflorabella-dev` + `buyflorabella-prod`
- `npm install` complete; dev server started; smoke test passed

Smoke test result:
```
curl -sk https://frontend.dev.buyflorabella.boardmansgame.com/ | head -1
→ <!DOCTYPE html><html lang="en">...<title>Buy Flora Bella | Premium Trace Minerals</title>
```

**Manual steps remaining:** systemd service installation; Shopify OAuth callback URL registration; prod worktree after first push to master.

---

## 2026-06-04 — Task 2 Plan Refined (feedback round)

Refined task2_plan.md based on feedback:
- Block 3: catalogued all hardcoded "platform-template" strings in scripts
- Block 8: added admin.dev and admin (prod) vhosts
- Block 9: added DNS pre-flight check script
- Block 10: two certs (buyflorabella-dev, buyflorabella-prod)
- Block 11: Hydrogen-specific production deployment note
- Block 12: release workflow via manage --release-candidate + update-production.sh
- Iteration 2: options are fix-in-place vs. fresh scaffold + integrate (this is Task 3)

---

## 2026-06-04 — Task 2 Plan: Migrate Hydrogen V7 into Platform-Template Workflow

**Status:** PLAN_READY  
Plan written for migrating `frontend/hydrogen-frontend-v7/` into
`buyflorabella-marketohub-v2` GitHub repo with platform-template management scripts.

Key decisions documented:
- Port assignment: site_index 12, dev 15220/15221, prod 20220/20221
- Zero-change file diff validation required
- Only expected delta: vite.config.ts HMR host for new domain
- Shopify OAuth callback URL must be registered for dev domain before login works
- Running locally does NOT affect live Shopify store

---

## 2026-06-04 — Task 1 DONE: Identify Current Hydrogen Version in Production

**Status:** DONE  
**Mode:** Investigation Only

Key findings:
- No Hydrogen server was running (port 20107 empty)
- Most developed Hydrogen codebase: `frontend/hydrogen-frontend-v7/` at `@shopify/hydrogen 2025.7.2`
- Shopify store: `buyflorabella.com` / `buy-flora-bella.myshopify.com` (SHOP_ID: 64048332903)
- `headless-shopify/` (CLAUDE.md "primary") is on `2025.7.0` with placeholder `.env` — never fully configured

---

## 2026-06-04 — Claude workflow initialized (traceminerals project origin)

Created `.claude/` and `claude_docs/` structure. Project identified as Shopify Hydrogen
headless storefront. Stack: Hydrogen/React Router 7 SSR frontend, Gunicorn Python proxy.

---

---

## 2026-06-04 18:44 — Task 4b: Env Variable Investigation

Investigated 27 environment variables from task4b_intent_investigation.md.

**Result:** 27/27 found — all variables are actively used in the codebase.

Primary consumption point: `frontend/app/root.tsx` (loader function).

Key findings:
- `SESSION_SECRET` is the only hard-required variable (throws if missing)
- VITE_PUBLIC_* variants in `.env.dxb-reference` are stale migration artifacts (not consumed)
- `frontend/src/entry.server.tsx` appears to be a stale duplicate of `frontend/app/entry.server.tsx`
- Feature flags / WhatsApp vars use spread-conditional pattern; undefined ≠ false for consumers

Outcome written to: `claude_docs/tasks/task4b_outcome.md`

---

## 2026-06-04 19:XX — Task 5: Oxygen Deployment Architecture Assessment

Performed comprehensive architectural assessment of `github.com/buyflorabella/hydrogen-frontend-v7` for Shopify Oxygen deployment compatibility.

**Core finding:** The codebase is already Oxygen-compatible. A deployment workflow already exists and is connected to Shopify storefront 1000084126. No structural transformation is required.

**Key verified facts:**
- `server.ts` uses correct Workers fetch handler pattern
- `react-router.config.ts` uses `hydrogenPreset()`
- `.github/workflows/oxygen-deployment-1000084126.yml` already present and functional
- Flask backend is fully decoupled (outbound HTTP only); stays on VPS

**Primary issues identified:**
1. `on: [push]` workflow trigger fires on ALL branches (HIGH)
2. Env vars need to be configured in Oxygen dashboard (HIGH)
3. `.env.dxb-reference` may be tracked on public GitHub repo (CRITICAL — verify)
4. Dead code: `src/`, `componentsMockup/`, duplicate/conflicting routes
5. VPS dev copy out of sync with GitHub main (guides/ directory)

**Recommended option:** C — refine existing direct deployment, not transformation/branch generation

Design doc written to: `claude_docs/build_docs/task5_design_doc.md`
