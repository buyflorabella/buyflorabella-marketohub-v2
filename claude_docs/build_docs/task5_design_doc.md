# Task 5 — Shopify Oxygen Deployment Architecture
## Design Document for Engineering Review

**Date:** 2026-06-04  
**Scope:** `github.com/buyflorabella/hydrogen-frontend-v7` + VPS deployment workflow  
**Status:** Assessment only — no code changes  
**Classification:** `VERIFIED` | `ASSUMPTION` | `RISK` | `UNKNOWN`

---

## Executive Summary

**Core finding:** The Hydrogen frontend codebase is already Oxygen-compatible. No structural transformation is required. A functional Oxygen deployment workflow (`oxygen-deployment-1000084126.yml`) already exists in the repository and has been connected to Shopify storefront 1000084126.

**The primary work is operational, not architectural.** The path to production Oxygen deployment involves:

1. Fixing the deployment trigger (currently fires on every branch push)
2. Migrating environment variables into the Oxygen dashboard
3. Establishing a clear sync protocol between the VPS development repo and the GitHub deployment repo
4. Cleaning up dead code artifacts that don't affect deployment but create maintenance risk

The Flask backend, Apache infrastructure, and VPS management tooling are fully decoupled from the Hydrogen frontend. They do not impede Oxygen deployment and require no changes.

**Recommended path:** Option C (Direct Deployment — Refinement of what already exists), not Option A or B.

---

## 1. Current Architecture Review

### 1.1 Repository Structure

**`VERIFIED`** The GitHub repository `hydrogen-frontend-v7` contains only the Hydrogen frontend. Its root corresponds to the `frontend/` subdirectory of the VPS working tree.

```
hydrogen-frontend-v7 (GitHub root)
├── .github/workflows/
│   └── oxygen-deployment-1000084126.yml  ← Oxygen CI/CD already present
├── app/
│   ├── components/          ← Active Hydrogen components
│   ├── componentsMockup/    ← Stale: pre-migration SPA mockup (v1)
│   ├── componentsMockup2/   ← Active: current component library
│   ├── graphql/             ← Shopify Storefront/Customer API fragments
│   ├── lib/                 ← context.ts, session.ts, fragments.ts
│   ├── routes/              ← 50+ file-system routes
│   └── styles/
├── guides/                  ← Present in GitHub, absent locally (divergence noted)
├── public/
├── script/                  ← Frontend-specific scripts (NOT VPS management)
├── site-validations/        ← Python Flask validation tool embedded in frontend repo
│   └── backend/             ← Flask app, Jinja templates, Python code
├── src/                     ← Stale: SPA-era migration artifact
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── components/          ← Duplicate of pre-Hydrogen component designs
├── server.ts                ← Oxygen Workers fetch handler (correct pattern)
├── vite.config.ts           ← Uses @shopify/mini-oxygen/vite (correct)
├── react-router.config.ts   ← Uses hydrogenPreset() (correct)
├── env.d.ts                 ← References @shopify/oxygen-workers-types
└── package.json             ← shopify hydrogen build / shopify hydrogen dev
```

**VPS-only (not in GitHub repo):**
```
buyflorabella/dev/ (VPS git worktree)
├── frontend/    ← maps to hydrogen-frontend-v7 GitHub repo root
├── backend/     ← Flask backend (MongoDB, auth, analytics)
├── apache/      ← Apache vhost configs
├── script/      ← VPS management scripts (manage, run-frontend.sh, etc.)
└── systemd/     ← systemd service unit templates
```

### 1.2 Git Repository Topology

**`VERIFIED`** Two separate `.gitignore` files exist at different levels:
- `dev/frontend/.gitignore` — inner Hydrogen repo gitignore
- `dev/.gitignore` — outer VPS project gitignore (contains rules like `frontend/node_modules/`, `frontend/.env.*`)

**`ASSUMPTION`** This indicates two separate git repositories:
1. **Inner repo** — `dev/frontend/` → remote: `github.com/buyflorabella/hydrogen-frontend-v7`
2. **Outer repo** — `dev/` → tracks the full VPS project (frontend + backend + scripts)

The outer repo likely uses the inner repo as a submodule or synchronizes via `git subtree push`. The `release-candidate.sh` script likely handles the sync from the outer VPS repo to the GitHub `hydrogen-frontend-v7` remote.

**`UNKNOWN`** Whether the outer VPS repo is pushed to any remote, and the exact sync mechanism between VPS `dev` branch and GitHub `main` branch.


1.2 developer notes: assumption #1 is wrong.  hydrogen-frontend-v7 was a codebase which was ported into this one.  it is historical from now on and should have no meaning here.  this code here in frontend/ is the authoritative source now.
dev/ is a gitworktree on the dev branch.  

### 1.3 Build and Runtime Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Cloudflare Workers (via Shopify Oxygen) | `ExecutionContext`, `caches.open` |
| Framework | React Router 7.12 + Hydrogen 2025.7.2 | `hydrogenPreset()` in config |
| Build | Shopify Hydrogen CLI (`shopify hydrogen build`) | Workers bundle output |
| Dev | `@shopify/mini-oxygen` (Vite plugin) | Local Workers emulation |
| SSR | `renderToReadableStream` | Streaming SSR |
| Session | Cookie-based `AppSession` | Stateless — no server storage |
| Cache | Workers `caches.open('hydrogen')` | CDN-level caching |

### 1.4 Frontend Responsibilities

**`VERIFIED`** The Hydrogen app is responsible for:

- All storefront rendering (products, collections, cart, checkout redirect)
- Customer account management (login, register, orders, addresses)
- Server-side password/store-lock gate
- Content pages (community, FAQ, learn, about, contact, technical docs)
- Feature flags (WhatsApp widget, bookmark, wishlist, surveys, countdown timer)
- Announcement bar
- Analytics integration (Omnisend, Google Analytics, Microsoft Clarity)
- CSP header generation
- Shopify Storefront and Customer Account API proxying

### 1.5 Backend Responsibilities

**`VERIFIED`** The Flask backend (`backend/`) handles:

- Survey submission and storage (MongoDB)
- Contact form processing
- Email API integration
- Admin dashboard (analytics, page views, user presence tracking)
- Site validation tooling (in `frontend/site-validations/backend/`)

**`VERIFIED`** The Flask backend is completely decoupled from the Hydrogen frontend. The frontend calls it via outbound HTTP using two env vars: `PUBLIC_SURVEY_API_BASE` and `PUBLIC_MAIL_API_BASE`. These are external URLs, not local process communication.

---

## 2. Shopify Oxygen Compatibility Analysis

### 2.1 Core Compatibility Assessment

**`VERIFIED` — The codebase is already Oxygen-compatible.** Rationale:

| Check | Status | Evidence |
|---|---|---|
| `server.ts` exports `fetch` handler | PASS | `export default { async fetch(request, env, executionContext) }` |
| Uses Workers `ExecutionContext` | PASS | `executionContext.waitUntil.bind(executionContext)` |
| Uses Workers Cache API | PASS | `caches.open('hydrogen')` |
| `react-router.config.ts` uses `hydrogenPreset()` | PASS | Confirmed in GitHub raw file |
| `vite.config.ts` uses `oxygen()` plugin | PASS | `@shopify/mini-oxygen/vite` |
| `env.d.ts` references oxygen-workers-types | PASS | `/// <reference types="@shopify/oxygen-workers-types" />` |
| Build script is `shopify hydrogen build` | PASS | `package.json` scripts |
| Deployment workflow exists | PASS | `oxygen-deployment-1000084126.yml` |
| Storefront ID matches | PASS | `1000084126` in workflow name and `.env.dxb-reference` |

### 2.2 Items That Do NOT Block Oxygen Deployment

**`VERIFIED`** The following VPS-specific items exist in the codebase but do not affect the Oxygen build:

| Item | Location | Why It's Safe |
|---|---|---|
| `server.allowedHosts` | `vite.config.ts` | Dev-only Vite setting; `shopify hydrogen build` ignores it |
| `hmr.host` pointing to VPS hostname | `vite.config.ts` | Dev-only; build process doesn't use HMR config |
| `VITE_PUBLIC_*` env vars | `.env.dxb-reference` | Not consumed by `app/` loader; Workers runtime uses `env.PUBLIC_*` |
| Flask backend `backend/` | VPS only (not in GitHub) | Not in GitHub repo; Oxygen never sees it |
| Apache/systemd configs | VPS only | Not in GitHub repo |
| VPS management scripts | `dev/script/` | Not in GitHub repo |

### 2.3 Items That Require Action Before Oxygen Goes Live

**`VERIFIED`**

| Issue | Severity | Description |
|---|---|---|
| `on: [push]` workflow trigger | HIGH | Every push to every branch triggers Oxygen deployment |
| `PRIVATE_STOREFRONT_API_TOKEN` | HIGH | Must be set in Oxygen dashboard as a secret env var |
| `SESSION_SECRET` | HIGH | Must be set in Oxygen dashboard; hard-coded in `.env.dxb-reference` |
| All `PUBLIC_*` env vars | MEDIUM | Must be configured in Oxygen environment variable dashboard |
| `.env.dxb-reference` in GitHub repo | HIGH | Inner `.gitignore` only ignores `.env`, not `.env.dxb-reference`; if tracked on GitHub public repo, API tokens are exposed |

**`RISK`** The `SECRET_SESSION`, `PRIVATE_STOREFRONT_API_TOKEN`, and `PUBLIC_STOREFRONT_API_TOKEN` values visible in `.env.dxb-reference` — if this file is tracked in the public GitHub repo, these credentials are exposed. The outer VPS `.gitignore` contains `frontend/.env.*` which would exclude this file from the outer repo. **Whether the inner GitHub repo tracks it is unconfirmed without direct inspection of the GitHub repo's file tree.**

**Recommended immediate check:** `curl -I https://raw.githubusercontent.com/buyflorabella/hydrogen-frontend-v7/main/.env.dxb-reference` — a 200 response means it's public.

### 2.4 Dead Code and Hygiene Issues

**`VERIFIED`** These items do not block deployment but carry maintenance and confusion risk:

**`src/` directory** — Contains SPA-era migration artifacts: `entry.server.tsx`, `entry.client.tsx`, `root.tsx`, and 14 component files. These are not imported by the active `app/` module graph. They exist at the root of the GitHub repo and will be present in Oxygen deployments (though Oxygen's bundle only includes what's imported).

**`componentsMockup/`** — First-generation component mockups. 15 files. Unused by active routes.

**`componentsMockup2/main.tsx`** — Contains `ReactDOM.createRoot()` — SPA bootstrap pattern. This file must never be imported by an SSR route. It is currently inside `app/componentsMockup2/` which is imported indirectly via `root.tsx`. If this file is accidentally introduced into the module graph, it breaks SSR. **`RISK`**

**Duplicate/conflicting route files:**
- `account_login_refactor.tsx` alongside `account_.login.tsx`
- `account_logout_refactor.tsx` alongside `account_.logout.tsx`  
- `account_refactor.tsx` alongside `account.tsx`
- `learn.$handle.tsx` AND `learn.$slug.tsx` — same path segment, different parameter names (React Router picks up both; behavior is undefined)
- `article.$blog.$handle.tsx` AND `article.$blogHandle.$articleHandle.tsx` — different parameter naming conventions for same URLs

React Router file-system routing picks up all files in `app/routes/`. The `*-refactor.tsx` files are matched routes and are currently live alongside their counterparts. **`RISK`** — duplicate routes can result in unexpected rendering, incorrect loader execution, or silent misrouting.

**`site-validations/backend/`** — A standalone Python Flask application embedded inside `frontend/`, and therefore inside the `hydrogen-frontend-v7` GitHub repo. It will be committed to GitHub and cloned as part of Oxygen build steps (though Oxygen only runs the compiled Workers bundle). It's operational overhead with no deployment impact, but should eventually be extracted to its own repo or to the VPS-only project structure.

**`guides/` directory** — Present in GitHub `main` branch but absent from the local VPS `dev` copy. **`ASSUMPTION`** This may be generated by Shopify CLI's `codegen` command or may represent unmerged upstream content. The local VPS working copy is out of sync with GitHub `main`.

### 2.5 External Service Dependencies

**`VERIFIED`** The Hydrogen app makes outbound HTTP calls to two VPS-hosted services:

| Service | Env Var | Destination |
|---|---|---|
| Survey submission | `PUBLIC_SURVEY_API_BASE` + `PUBLIC_SURVEY_API_ROUTE` | `https://survey-server.boardmansgame.com` |
| Contact/mail form | `PUBLIC_MAIL_API_BASE` + `PUBLIC_MAIL_API_ROUTE` | `https://remail.buyflorabella.com` |

**`VERIFIED`** Oxygen supports outbound HTTP fetch calls. These dependencies work unchanged in Oxygen. They are configured via env vars, allowing different endpoints for VPS vs. Oxygen environments. No changes needed to the calling code.

**`ASSUMPTION`** These services are hosted on the VPS and will remain so. If the VPS is eventually decommissioned, these services would need migration to a hosted platform (e.g., Vercel, Railway, or Shopify Functions).

---

## 3. Deployment Architecture Options Analysis

### Option A — Deployment Build Transformation

**Assessment: NOT RECOMMENDED. Not needed.**

This option proposes transforming the repository at deploy time into a Shopify-compatible format.

**Finding:** The repository IS already in the Shopify-compatible format. `shopify hydrogen build` already produces a Workers-compatible bundle. No transformation layer is needed. Adding one would introduce unnecessary complexity and a fragile build pipeline.

The correct interpretation of Option A assumed that Shopify requires a different repository structure. **This assumption is false.** The repository structure is exactly what Shopify expects.

### Option B — Dedicated Shopify Deployment Branch

**Assessment: PARTIALLY APPLICABLE — refinement of the existing workflow.**

This option proposes maintaining a dedicated deployment branch. The existing workflow already does this implicitly (pushes to the GitHub repo trigger Oxygen). The needed refinement is:

1. Restrict the Oxygen workflow to specific branches (not all pushes)
2. Distinguish production vs. preview environments

The existing `on: [push]` trigger means every branch push triggers Oxygen deployment. This is not branch-separated deployment — it's accidental deployment on every branch.

**What's missing from the current setup:**
- Branch filtering (e.g., only deploy to production Oxygen when pushing to `main`)
- Preview environment deployments for `dev` branch pushes
- Branch protection rules preventing direct pushes to `main`

### Option C — Direct Deployment (Recommended)

**Assessment: RECOMMENDED. Already implemented; needs refinement.**

The repository already has a functioning Oxygen deployment workflow. Option C means accepting the current architecture and fixing the operational gaps:

1. Fix the `on: [push]` trigger to be branch-scoped
2. Configure environment variables in the Oxygen dashboard
3. Establish the VPS-to-GitHub sync protocol
4. Clean up dead code to reduce maintenance confusion

**This is the path of least resistance and lowest risk.** No architectural changes to the Hydrogen app are needed.

---

## 4. Branch and Work Tree Strategy

### 4.1 Current State

**VPS-level (outer project):**
- `dev` branch → development, VPS port 15220/15221
- `master` branch → production VPS, port 20220/20221

**GitHub `hydrogen-frontend-v7`:**
- `main` branch → 211 commits, Oxygen deployment target

4.1 developers notes: https://github.com/buyflorabella/buyflorabella-marketohub-v2 is the repo for this site.  discard references to hydrogen-frontend-v7.  that was the historical git repo this codebase came from.  that is al.

- Oxygen workflow fires on ALL branch pushes

**`UNKNOWN`** Whether VPS `dev`/`master` branches are the same git repo as GitHub `main`, or whether they are separate repos synchronized via subtree or other mechanism.


Developers note: yes, dev / master are the same git repo as main if we choose to use master.


### 4.2 Recommended Branch Strategy

```
[VPS Dev Workflow]          [GitHub hydrogen-frontend-v7]     [Shopify Oxygen]
dev branch                 
  → develop, test on VPS   → push to feature/dev branch  →  Preview Environment
  → promote to master        
master branch              → merge to main                →  Production Oxygen
```

**Specific changes needed:**

**GitHub Actions workflow fix:**
```yaml
# Current (broken — fires everywhere):
on: [push]

# Recommended:
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Add preview environment for dev:**
```yaml
# Additional job for previews:
on:
  push:
    branches: [dev, 'feature/**']
```

Oxygen supports per-branch preview URLs. Connecting `dev` branch pushes to preview deployments gives a staging environment in Oxygen without touching the production storefront.

### 4.3 Work Tree Strategy

**Recommended: Keep the current VPS work tree strategy intact.**

The VPS `dev`/`prod` work tree pattern is sound and should continue to serve local development and the Flask backend. Shopify Oxygen becomes an **additional deployment target** alongside the VPS production deployment — not a replacement for the VPS workflow.

```
Deployment targets:
├── VPS Production (master branch) → buyflorabella.boardmansgame.com
│   ├── Hydrogen frontend (port 20220)
│   └── Flask backend (port 20221)
│
└── Shopify Oxygen (main branch) → buyflorabella.com  ← TARGET
    └── Hydrogen frontend only
    (Flask backend remains on VPS, accessed via PUBLIC_MAIL_API_BASE etc.)
```

**`ASSUMPTION`** The long-term goal is to serve `buyflorabella.com` from Oxygen, not the VPS. The VPS frontend would then become a development environment only.

### 4.4 Sync Protocol Between VPS and GitHub

**`UNKNOWN`** The exact current sync mechanism. Based on the `release-candidate.sh` script name, it likely creates git tags and possibly pushes to the GitHub remote. This needs to be documented and validated.

**Recommended sync flow:**
1. Develop on VPS `dev` branch
2. Test on VPS preview (port 15220)
3. When ready: sync `frontend/` content to GitHub `hydrogen-frontend-v7` `dev` branch
4. PR to `main` on GitHub → triggers Oxygen preview
5. Review and merge → triggers Oxygen production deployment
6. Merge also to VPS `master` for VPS production consistency

**If single-repo model applies** (VPS outer repo = hydrogen-frontend-v7 remote):
1. VPS `dev` branch → push to GitHub triggers Oxygen preview
2. VPS `master` branch → push to GitHub `main` triggers Oxygen production

---

## 5. Risk Assessment

### 5.1 High Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `on: [push]` trigger deploys dev work to Oxygen production | HIGH | HIGH | Add `branches: [main]` filter to workflow immediately |
| API tokens exposed in `.env.dxb-reference` if tracked in public GitHub repo | UNKNOWN | HIGH | Verify file presence; rotate tokens if exposed |
| `SESSION_SECRET` not set in Oxygen → startup crash | HIGH if not configured | HIGH | Set in Oxygen dashboard before first deployment |
| Route collision: `learn.$handle.tsx` vs `learn.$slug.tsx` | VERIFIED present | MEDIUM | Remove or rename one; test routing |

### 5.2 Medium Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `componentsMockup2/main.tsx` imported by SSR route accidentally | LOW | HIGH | Audit component import graph; add ESLint guard |
| VPS `dev` out of sync with GitHub `main` (guides/ divergence) | CONFIRMED | MEDIUM | Pull latest from GitHub `main` or reconcile |
| `PRIVATE_STOREFRONT_API_TOKEN` used incorrectly for Oxygen | MEDIUM | MEDIUM | Confirm Oxygen uses `PRIVATE_` vars as Worker secrets, not VITE |
| Flask backend VPS downtime breaks contact/survey forms | MEDIUM | MEDIUM | Acceptable; document external dependency |

### 5.3 Low Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `site-validations/backend/` Python code in GitHub repo confuses Oxygen build | LOW | LOW | Oxygen only bundles JS/TS; Python files are ignored |
| VPS-specific `vite.config.ts` settings visible in repo | LOW | LOW | Dev-only settings; no production impact |
| `@supabase/supabase-js` in dependencies but not used in `app/` | UNKNOWN | LOW | Tree-shaking removes it; audit anyway |

---

## 6. Recommended Long-Term Architecture

### 6.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Development Environment (VPS)                                  │
│                                                                  │
│  dev worktree (branch: dev)                                     │
│  ├── frontend/  ← Hydrogen app  ──────────────────────────────┐ │
│  ├── backend/   ← Flask API     ─── port 15221                │ │
│  └── script/    ← VPS tools                                   │ │
│                              (dev server port 15220)           │ │
│  prod worktree (branch: master)                               │ │
│  ├── frontend/  ← built Hydrogen ─── port 20220               │ │
│  ├── backend/   ← Flask API      ─── port 20221               │ │
│  └── script/                                                   │ │
└──────────────────────────────────────────────────────────────┼─┘
                                                               │
                    git push / release-candidate sync          │
                                                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  GitHub: buyflorabella/hydrogen-frontend-v7                      │
│                                                                  │
│  branch: dev  ──→ Oxygen Preview Environment                    │
│                   (preview.buyflorabella.com equivalent)         │
│                                                                  │
│  branch: main ──→ GitHub Actions: oxygen-deployment-1000084126  │
│                   └── npx shopify hydrogen deploy               │
│                       └── Shopify Oxygen Production             │
│                           buyflorabella.com                     │
└──────────────────────────────────────────────────────────────────┘
                                         │
                    outbound HTTP calls   │
                                         ▼
┌─────────────────────────────────────┐
│  VPS Persistent Services            │
│  ├── Survey API (boardmansgame.com) │
│  └── Mail API (remail.buyflorabella) │
└─────────────────────────────────────┘
```

### 6.2 Key Architectural Decisions

**Decision 1: Flask backend stays on VPS.**  
There is no benefit to migrating the Flask backend to Oxygen — Oxygen cannot run Python. The backend is decoupled and accessed via HTTP. It should remain as a VPS-hosted service.

**Decision 2: No transformation layer needed.**  
The `shopify hydrogen build --codegen` command already produces the Oxygen deployment artifact. No intermediate transformation, deployment branch generation, or build wrapper is needed.

**Decision 3: VPS development workflow is preserved.**  
The existing `dev`/`prod` worktree pattern should continue for:
- Flask backend development
- Local iteration without Oxygen roundtrip delay
- Apache/systemd management

**Decision 4: Oxygen becomes the canonical production frontend.**  
Once Oxygen is configured and stable, `buyflorabella.com` should route to Oxygen rather than the VPS frontend. The VPS frontend (port 20220) can continue as a backup or be decommissioned.

### 6.3 Repository Housekeeping Recommendations

These are not blocking items but should be addressed before Oxygen goes live for brand/maintainability reasons:

1. **Remove `src/` directory** — stale migration artifact; 14 component files and 3 entry points that are not part of the active app.

2. **Remove `componentsMockup/` directory** — superseded by `componentsMockup2/`; 15 stale files.

3. **Resolve duplicate routes** — at minimum, rename `account_login_refactor.tsx` and siblings so React Router doesn't route to them (e.g., move to `_archive/` outside `routes/`).

4. **Resolve `learn.$handle.tsx` vs `learn.$slug.tsx`** — React Router will pick up both. Determine which is active and delete the other.

5. **Move `site-validations/backend/` out of `frontend/`** — this Python tool shouldn't be in the Hydrogen repo root. Move it to the VPS project's `backend/` area or a separate repo.

6. **Reconcile `guides/` divergence** — pull from GitHub `main` or explicitly remove from the repo.

---

## 7. Implementation Roadmap

### Phase 1 — Environment Configuration (Immediate, ~1 day)

**Prerequisites for ANY Oxygen deployment:**

1. **Audit `.env.dxb-reference` exposure** — check whether the file is tracked in GitHub. If yes: add `.env.dxb-reference` to the inner `.gitignore`, remove it from git tracking, and rotate any exposed tokens.

2. **Configure Oxygen environment variables** — in Shopify Admin → Hydrogen → Storefront → Environment Variables, set:
   - `SESSION_SECRET` (required; crashes without it)
   - `PRIVATE_STOREFRONT_API_TOKEN`
   - `PUBLIC_STOREFRONT_API_TOKEN`
   - `PUBLIC_STORE_DOMAIN`
   - `PUBLIC_CHECKOUT_DOMAIN`
   - `PUBLIC_CUSTOMER_ACCOUNT_API_URL`
   - All `PUBLIC_*` feature flags and API endpoints

3. **Fix workflow trigger** — change `on: [push]` to `on: push: branches: [main]` to prevent dev pushes from triggering production deployment.

### Phase 2 — Validation Deployment (~2-3 days)

1. **First controlled Oxygen deployment** — push a known-good state to GitHub `main`. Verify Oxygen build succeeds and storefront loads.

2. **Verify external service calls work from Oxygen** — test contact form and survey form submission to confirm outbound HTTP calls reach the VPS APIs.

3. **Verify authentication flow** — test customer account login/logout/register from the Oxygen deployment.

4. **Verify session/password gate** — confirm `PUBLIC_STORE_LOCKED` and `SESSION_SECRET` work correctly from Oxygen environment.

### Phase 3 — Route and Code Cleanup (~1-2 days)

1. **Audit and resolve duplicate routes** — identify which of each pair is active; archive or delete the inactive version.

2. **Remove `src/` and `componentsMockup/`** — verify no imports reference them, then delete.

3. **Move `site-validations/backend/`** — extract to appropriate location outside the Hydrogen repo root.

4. **Reconcile `guides/` divergence** — sync VPS `dev` with GitHub `main`.

### Phase 4 — Preview Environment (~1 day)

1. **Add dev branch preview deployment** — add a second GitHub Actions job that deploys `dev` branch pushes to an Oxygen preview environment.

2. **Document the VPS→GitHub sync protocol** — formalize `release-candidate.sh` usage and when/how content flows from VPS `dev` to GitHub `main`.

### Phase 5 — Cutover (~1 day)

1. **Update DNS / Apache proxy** — when Oxygen is confirmed stable, route `buyflorabella.com` to Oxygen instead of VPS port 20220.

2. **VPS frontend becomes staging only** — or decommission port 20220 if Oxygen preview environments serve the staging need.

---

## 8. Open Questions (Unknowns Requiring Resolution)

| # | Question | Why It Matters |
|---|---|---|
| 1 | Is `.env.dxb-reference` tracked in the GitHub public repo? | Security: API tokens and SESSION_SECRET may be exposed |
| 2 | Is the VPS outer repo the same remote as `hydrogen-frontend-v7`, or are they separate repos? | Determines whether VPS `dev` pushes currently trigger Oxygen deployment |
| 3 | What does `release-candidate.sh` actually do? | Determines current sync protocol between VPS and GitHub |
| 4 | Is there currently a working Oxygen deployment from GitHub `main`? | If yes, the first phase is just fixing the trigger and env vars |
| 5 | Where is `@supabase/supabase-js` used? | Present in `package.json` dependencies but no usages found in `app/` — dead dependency or missing feature |
| 6 | What is the `guides/` directory in GitHub `main`? | Unknown purpose; absent in VPS dev copy — may be Shopify CLI generated or stale |
| 7 | Which routes are actually being served vs. which are in-progress drafts? | Clarifies route cleanup scope (e.g., `-refactor` variants) |

---

## Appendix A — Oxygen Workflow (Current)

```yaml
# .github/workflows/oxygen-deployment-1000084126.yml
name: "Storefront 1000084126"
on: [push]                      # ← ISSUE: fires on all branches

permissions:
  contents: read
  deployments: write

jobs:
  deploy:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-build-cache-node-modules-${{ hashFiles('**/package-lock.json') }}
      - run: npm ci
      - run: npx shopify hydrogen deploy
        env:
          SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN: ${{ secrets.OXYGEN_DEPLOYMENT_TOKEN_1000084126 }}
```

## Appendix B — Environment Variable Inventory (Oxygen Required)

Variables that must be set in the Shopify Oxygen environment variables dashboard:

**Required (will crash or fail without):**
- `SESSION_SECRET` — crashes at startup if unset
- `PRIVATE_STOREFRONT_API_TOKEN` — Storefront API access
- `PUBLIC_STOREFRONT_API_TOKEN` — Storefront API (public)
- `PUBLIC_STORE_DOMAIN` — Shopify store domain
- `PUBLIC_CHECKOUT_DOMAIN` — Checkout domain
- `PUBLIC_CUSTOMER_ACCOUNT_API_URL` — Customer Account API

**Required for feature functionality:**
- `PUBLIC_STORE_LOCKED` / `PUBLIC_STORE_PASSWORD` — password gate
- `PUBLIC_MAIL_API_BASE` / `PUBLIC_MAIL_API_ROUTE` — contact form
- `PUBLIC_SURVEY_API_BASE` / `PUBLIC_SURVEY_API_ROUTE` — survey form
- `PUBLIC_OMNISEND_BRAND_ID` — email marketing

**Optional feature flags (safe to omit; features disabled):**
- `PUBLIC_FEATURE_WHATSAPP`, `PUBLIC_FEATURE_BOOKMARK`, `PUBLIC_FEATURE_WISHLIST`
- `PUBLIC_ANNOUNCEMENT_BAR_ENABLED`, `PUBLIC_ANNOUNCEMENT_BAR_MESSAGE`
- `PUBLIC_COUNTDOWN_TIMER_ENABLED`
- `PUBLIC_SITE_SURVEY_ENABLED`, `PUBLIC_SITE_SURVEY_SINGLE_ANSWER`
- `PUBLIC_WHATSAPP_*` (all 4 WhatsApp vars)

**Not needed for Oxygen** (VPS dev only):
- `VITE_PUBLIC_*` variants — Vite client-side prefixed vars; not consumed by Workers runtime
