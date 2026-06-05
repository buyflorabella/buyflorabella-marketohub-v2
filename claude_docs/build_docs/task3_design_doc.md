# Design Document: Shopify Hydrogen Codebase Assessment and Forward Strategy

**Project:** TraceMineral Headless Storefront  
**Date:** 2026-06-04  
**Author:** Claude (architectural review)  
**Status:** PLAN_READY — awaiting engineering leadership review  
**Task:** task3

---

## Facts, Assumptions, and Unknowns

### Verified Facts (observed directly from repository)

- `headless-shopify/` is a Hydrogen 2025.7.0 skeleton scaffold with only `SESSION_SECRET=foobar` in `.env` — never connected to a live Shopify store.
- `frontend/hydrogen-frontend-v7/` is on Hydrogen 2025.7.2, connected to `buyflorabella.com` (store ID `64048332903`), and contains the richest custom feature set.
- `frontend/alt-hydrogen-frontend-v8/` is on Hydrogen 2025.7.3, the most recent alternative build.
- No Hydrogen server is currently running for this project. Port 20107 is empty. The Apache vhost proxies to 20107 with no listener.
- `script/settings` FRONTEND_DIR still points to `frontend/hydrogen-frontend-v4/` — a plain React SPA, not Hydrogen.
- `headless-shopify/` uses JavaScript (.jsx). All alt-frontend versions use TypeScript (.tsx).
- `frontend/hydrogen-frontend-v7/` has a dependency on `@remix-run/server-runtime ^2.17.4` — a legacy Remix package not expected in a pure React Router 7.x project.
- `frontend/hydrogen-frontend-v7/` contains a `componentsMockup2/` directory with 34 components, 15+ pages, and 6 contexts — an entire parallel SPA component library in mid-migration.
- `frontend/hydrogen-frontend-v7/` has 50+ route files, many of which are experimental duplicates.
- The git history in `headless-shopify/` has only 4 commits, confirming it is a near-vanilla scaffold.
- The outer repo git history shows active development in the `frontend/` directory through April 2025, with no commits touching `headless-shopify/`.
- As of Task 2, `frontend/hydrogen-frontend-v7/` has been migrated into the `buyflorabella/dev` worktree under a separate platform-template workflow.

### Assumptions (not directly verified)

- The site's "established visual identity and user experience" referenced in the intent is the design embodied in `componentsMockup2/` and the Tailwind-styled routes in `frontend/hydrogen-frontend-v7/`.
- The Shopify store that TraceMineral intends to use may be different from `buyflorabella.com` — the `.env` in `headless-shopify/` is entirely empty, suggesting no store has been wired up yet.
- "Authentication was heavily modified" in the intent refers to the custom login/logout/account routes in `hydrogen-frontend-v7/` relative to the vanilla skeleton.
- The project's objective is eventually to run a live traceminerals storefront, not to run another instance of buyflorabella.

### Unknowns Requiring Investigation

- What Shopify store does the traceminerals application target? (No credentials in `headless-shopify/.env`.)
- Is `supabase-js` being actively used in production, or is it a leftover experiment?
- Which of the 50+ routes in `hydrogen-frontend-v7/` are intended to be final vs. which are experiments to be discarded?
- What OAuth callback URLs are registered in the Shopify Customer Account API for the traceminerals store?
- Is there a production deployment target (Oxygen, Node server on this server, or other)?

---

## Executive Summary

The TraceMineral headless storefront project exists in a **structurally ambiguous state**. The codebase contains two distinct Hydrogen codebases with fundamentally different purposes:

1. **`headless-shopify/`** — A vanilla Shopify Hydrogen 2025.7.0 scaffold, designated "primary" in project documentation, but never connected to a live store. No custom UI, no Shopify credentials, never deployed.

2. **`frontend/hydrogen-frontend-v7/`** — The actual working codebase on Hydrogen 2025.7.2, connected to `buyflorabella.com`, containing significant custom UI and business logic. This has now been migrated to the buyflorabella project separately (Task 2).

The project is not currently serving any Hydrogen content. The Apache vhost is pointed at port 20107 with no listener.

**The strategic question** is not simply "Option A vs. Option B" within the existing `headless-shopify/` — it is whether the TraceMineral project should:

- **(A)** Build its storefront from a fresh, properly-configured Hydrogen scaffold, porting in the custom visual and business logic from v7's design work
- **(B)** Promote `headless-shopify/` as the evolving working codebase and extend it incrementally

**Recommendation:** Option A with a structured migration plan. The `headless-shopify/` scaffold, already on a modern Hydrogen version, should serve as the clean foundation. It should be upgraded to 2025.7.3 (latest), converted to TypeScript, connected to the traceminerals Shopify store, and custom features from `v7` should be ported in deliberately — not bulk-copied. The `componentsMockup2/` design work is valuable and should be preserved but migrated systematically.

---

## Section 1: Current State Assessment

### 1.1 Repository Structure Overview

```
traceminerals_boardmansgame_com/
├── headless-shopify/          ← DESIGNATED PRIMARY — vanilla scaffold, undeployed
├── frontend/
│   ├── hydrogen-frontend-v7/  ← ACTUAL DEVELOPED CODEBASE (buyflorabella)
│   ├── alt-hydrogen-frontend-v1 through v9/  ← 9 experimental versions
│   ├── hydrogen-frontend-v4-working/   ← older working state reference
│   ├── hydrogen-storefront-1/          ← older reference
│   ├── native-react-with-email-dxb/   ← Python+Flask email relay (separate project)
│   └── ...                  ← ~20 more variant directories
├── script/                    ← shell scripts; settings still point to v4 (wrong)
├── scripts/                   ← utility scripts
├── .claude/                   ← project instructions
└── claude_docs/               ← working documentation
```

**Assessment:** The `frontend/` directory is a graveyard of experiments totaling 25+ frontend variants. Most are untracked, unreferenced, and will never be used. This creates significant cognitive overhead and increases the risk of accidentally deploying the wrong version.

### 1.2 headless-shopify/ — Scaffold Inventory

| Area | Observation |
|------|-------------|
| Hydrogen version | 2025.7.0 |
| React Router | 7.9.2 (pinned by Hydrogen 2025.7.0) |
| Language | JavaScript (.jsx) |
| Routes | 30 standard skeleton routes |
| Authentication | Vanilla skeleton PKCE OAuth2 — 3-line delegating loader |
| Styling | Global CSS (app.css + reset.css) — no Tailwind, no design system |
| Custom components | None beyond skeleton defaults |
| Environment | `SESSION_SECRET=foobar` only — no Shopify credentials |
| Build artifacts | None — never built |
| Git history | 4 commits — scaffold + lockfile + markets support + route generation |
| Deployment | Not deployed; no `systemd` service, no process on port 20107 |

**Strengths:**
- Clean architecture following Shopify canonical patterns
- `NonceProvider` properly configured in `entry.client.jsx` (from 2025.7.0 release notes)
- Proper use of `createContentSecurityPolicy` in `entry.server.jsx`
- `hydrogenRoutes` + `flatRoutes` configuration in `routes.js`
- `loadCriticalData` / `loadDeferredData` split pattern throughout routes
- Locale-from-domain detection in `lib/i18n.js`
- Custom `orderFilters.js` utility with injection-safe sanitization — custom business logic already present

**Weaknesses:**
- Never configured (no real `.env`)
- JavaScript only — no TypeScript, no type safety
- No visual design — pure skeleton HTML with class names
- `vite.config.js` hardcodes port `20200`, which conflicts with CLAUDE.md documentation of port `20107`
- `app/styles/app.css` is skeleton-default, no brand identity
- Missing Tailwind CSS (used in all developed variants)

**Technical Debt:**
- Disconnected from all deployment scripts (`script/settings` points to `frontend/hydrogen-frontend-v4/`)
- `script/settings` references a non-Hydrogen directory as FRONTEND_DIR
- No systemd service exists for this directory
- No Apache vhost with the correct port (20200 in vite.config vs 20107 in vhost)

### 1.3 frontend/hydrogen-frontend-v7/ — Developed Codebase Inventory

| Area | Observation |
|------|-------------|
| Hydrogen version | 2025.7.2 |
| React Router | 7.12.0 |
| Language | TypeScript (.tsx) |
| Routes | 50+ files (many duplicates/experiments) |
| Authentication | Customized: `return_to`, `postLogoutRedirectUri`, custom auth status handling |
| Styling | TailwindCSS 4.x + `app.css` + `reset.css` + `password.css` |
| Custom components | `componentsMockup2/` — 34 components, 15 page components, 6 context providers |
| External dependencies | Supabase, Lucide React icons, Tailwind CSS 4.x |
| Legacy dependency | `@remix-run/server-runtime ^2.17.4` (should not exist) |
| Environment | Real Shopify credentials for `buyflorabella.com` |
| HMR | Hardcoded to `dev1-frontend.buyflorabella.com` |
| Build artifacts | None built |

**Custom features present (beyond skeleton):**
- `learn.tsx` — Blog/article listing with featured article logic, tag-based filtering, read-time calculation
- `article.$blogHandle.$articleHandle.tsx` — Full article page with table-of-contents, author metadata, bookmark/save feature
- `community.tsx`, `contact.tsx`, `about.tsx`, `faq.tsx`, `shipping.tsx`, `returns.tsx`
- `shop.tsx`, `theshop.tsx` — Custom shop pages
- `checkout.tsx` — Custom checkout route
- `order-confirmation.tsx` — Order confirmation page
- `technical-docs.tsx` — Documentation page
- `forget-password.tsx` / `register.tsx` — Password recovery and registration routes
- `AnnouncementBar`, `WhatsAppWidget`, `SurveyPopup`, `AbandonedCartPopup`, `DiscountBanner`
- `FeatureFlagsContext` — runtime feature toggle system
- `SavedItemsContext` / `WishlistContext` — client-side wishlist/bookmark state
- `CartContext` — wraps Hydrogen cart with additional client state
- `EnvContext` — exposes .env variables to client components
- `AnalyticsTracker`, `ClarityTracker`, `PageTracker` — tracking integrations
- `VideoReels`, `VideoReelsIframe` — video content components

**Technical Debt in v7:**
- `@remix-run/server-runtime ^2.17.4` — legacy Remix dependency, incompatible with pure React Router 7.x pattern
- 50+ routes with obvious duplicates: `account_.login.tsx` + `login.tsx`, `account_.logout.tsx` + custom logout, `account_refactor.tsx`, `account_login_refactor.tsx`, `article.$blog.$handle.tsx` + `article.$blogHandle.$articleHandle.tsx` + `article.$slug.tsx`
- `componentsMockup2/` contains a completely parallel set of pages (`pages/LearnPage.tsx`, `pages/AccountPage.tsx`, etc.) alongside actual Hydrogen routes — the migration was never completed
- Commented-out large blocks of code in `account.tsx` (entire GraphQL query + loader commented out)
- Pages directory in componentsMockup2 has routes that shadow the actual routes (e.g., `pages/CheckoutPage.tsx` vs `routes/checkout.tsx`)
- HMR hostname hardcoded to buyflorabella.com — would break on any other domain
- Supabase dependency with unclear production usage
- `react-router-dom 7.12.0` listed as dependency alongside `react-router 7.12.0` (redundant in React Router v7)

---

## Section 2: Shopify Hydrogen Gap Analysis

### 2.1 Current Hydrogen Version vs. Latest

| Version | Where | Notes |
|---------|-------|-------|
| 2025.7.3 | `alt-hydrogen-frontend-v8/` | Latest available scaffold seen in repo |
| 2025.7.2 | `hydrogen-frontend-v7/` | Developed codebase |
| 2025.7.0 | `headless-shopify/` | Designated primary — 2 point-releases behind |

**Assessment:** The gap is minor (patch-level within the 2025.7 series) but meaningful. The `headless-shopify/` misses:
- React Router 7.9.2 → 7.12.0 (three minor versions)
- `@shopify/cli 3.83.3` → `3.85.4`
- Upgraded `@shopify/mini-oxygen` v4 improvements (Miniflare v4 migration is significant for local dev)

All three versions share the same fundamental Hydrogen 2025.7.x architecture.

### 2.2 Architectural Comparison: headless-shopify vs. Hydrogen Best Practices

| Practice | headless-shopify | Status |
|----------|-----------------|--------|
| React Router 7.x (not Remix) | ✅ Uses `react-router` imports throughout | Compliant |
| `@shopify/hydrogen/react-router-preset` | ✅ `react-router.config.js` uses it | Compliant |
| `hydrogenRoutes` + `flatRoutes` | ✅ `app/routes.js` correct | Compliant |
| `createHydrogenContext` | ✅ `lib/context.js` correct | Compliant |
| `AppSession` class | ✅ `lib/session.js` standard | Compliant |
| CSP via `createContentSecurityPolicy` | ✅ `entry.server.jsx` | Compliant |
| `NonceProvider` on client hydration | ✅ `entry.client.jsx` | Compliant |
| `storefrontRedirect` for 404s | ✅ `server.js` | Compliant |
| `loadCriticalData` / `loadDeferredData` split | ✅ Most routes | Compliant |
| `shouldRevalidate` optimization on root | ✅ `root.jsx` | Compliant |
| Deferred footer/cart with `Suspense`/`Await` | ✅ `root.jsx` | Compliant |
| TypeScript | ❌ JavaScript (.jsx) | **Gap** |
| Tailwind CSS | ❌ Not present | Gap (not required but standard for new projects) |
| `cart.$lines.jsx` route | ✅ Present | Compliant |
| `@shopify/hydrogen/oxygen` for `createRequestHandler` | ✅ `server.js` | Compliant |

**Notable:** The `headless-shopify/` scaffold is architecturally very close to canonical Hydrogen. Its primary gap vs. current Shopify recommendations is the absence of TypeScript.

### 2.3 Architectural Comparison: hydrogen-frontend-v7 vs. Hydrogen Best Practices

| Practice | hydrogen-frontend-v7 | Status |
|----------|---------------------|--------|
| React Router 7.x (not Remix) | ⚠️ Uses `react-router` but retains `@remix-run/server-runtime` | **Gap** |
| `@shopify/hydrogen/react-router-preset` | ✅ `react-router.config.ts` | Compliant |
| `hydrogenRoutes` + `flatRoutes` | ✅ `app/routes.ts` | Compliant |
| `createHydrogenContext` | ✅ `lib/context.ts` | Compliant |
| CSP | ✅ | Compliant |
| `NonceProvider` | Unknown — not verified in v7 `entry.client.tsx` | Requires check |
| TypeScript | ✅ Full TypeScript | Compliant |
| Tailwind CSS | ✅ Tailwind 4.x | Compliant |
| Route organization | ❌ 50+ routes, many experimental duplicates | **Gap** |
| Clean component hierarchy | ❌ `componentsMockup2/` migration incomplete | **Gap** |
| No legacy Remix deps | ❌ `@remix-run/server-runtime` present | **Gap** |

### 2.4 Deprecated / Missing Patterns

- **`@remix-run/server-runtime`** in v7 is the most significant divergence. This package is a Remix v2 artifact. In React Router 7.x, its functionality is provided by `react-router` directly. Its presence creates the risk of import resolution conflicts and prevents clean upgrades.
- **GraphQL queries co-located in route files** (v7 style) vs. **`app/graphql/` directory** (`headless-shopify/` style) — the centralized pattern in `headless-shopify/` is better for maintainability.
- **`react-router-dom` as explicit dep** in v7 — in React Router 7.x, `react-router` and `react-router-dom` are the same package. Having both listed is redundant and potentially confusing.
- **Cursor rules file** (`headless-shopify/.cursor/rules/hydrogen-react-router.mdc`) documents the Remix-to-React-Router migration — this is a good developer reference but signals the project is actively managing import migration.

---

## Section 3: Authentication Review

### 3.1 Authentication Architecture

Both codebases use Shopify's **Customer Account API** with PKCE OAuth2. This is the current Shopify-recommended authentication mechanism for headless storefronts. Neither codebase implements a custom auth server — all authentication is delegated to Shopify.

The auth flow is:
1. User visits `/account/login` → server-side redirect to Shopify OAuth
2. Shopify authenticates and redirects to `/account/authorize`
3. `context.customerAccount.authorize()` completes the PKCE handshake
4. Session cookie is set; user lands at `/account`

### 3.2 headless-shopify/ Authentication Analysis

**Login** (`account_.login.jsx`): 3-line pure delegation to `customerAccount.login()`.

**Authorize** (`account_.authorize.jsx`): 3-line pure delegation to `customerAccount.authorize()`.

**Logout** (`account_.logout.jsx`): Standard skeleton — action calls `customerAccount.logout()`, loader redirects to `/`.

**Auth guard** (`account.$.jsx`): Calls `context.customerAccount.handleAuthStatus()` then redirects to `/account`.

**Assessment:** Completely vanilla — zero customization. The entire auth flow is delegated to `@shopify/hydrogen`'s built-in `customerAccount` methods. No visual customization, no custom redirects, no custom session handling.

**Isolation:** Auth is isolated in 4 dedicated route files and does not bleed into other routes. This is a positive signal for future maintainability.

### 3.3 hydrogen-frontend-v7/ Authentication Analysis

**Login** (`account_.login.tsx`): Custom. Calls `customerAccount.handleAuthStatus()` first; if already logged in, returns that. Otherwise initiates login with `return_to: origin + '/account'`. This ensures post-login redirect goes to the account page.

**Logout** (`account_.logout.tsx`): Custom. `postLogoutRedirectUri` set to `${origin}/account/login` — redirects back to login page after logout. Loader returns 404 (not a GET-accessible route). This is a subtle behavior difference from the skeleton.

**`login.tsx`** (separate from `account_.login.tsx`): A second login route with different logic — calls `handleAuthStatus()` and conditionally initiates login. This appears to be an experimental variant that was never removed.

**Account layout** (`account.tsx`): Heavily commented-out code — an entire customer GraphQL query and loader are commented out. The active code uses `handleAuthStatus()` but does NOT load customer data (it relies on child routes). UI is Tailwind-styled using `componentsMockup2/components/AnnouncementBar`.

**Account orders** (`account_.orders.tsx`): Uses a simplified order query (first 10 only, no pagination, no search filtering). Imports `useCart` from `componentsMockup2/contexts/CartContext` — a coupling between the auth-adjacent route and the custom cart context.

**Account addresses** (`account_.addresses.tsx`): Simplification — only fetches address data, no create/update/delete mutations (unlike `headless-shopify/` which has full address CRUD).

### 3.4 Customization Isolation Assessment

| Customization | Isolated? | Upgrade Risk |
|---------------|-----------|--------------|
| `return_to` on login | Yes — single loader line | Low |
| `postLogoutRedirectUri` on logout | Yes — single action line | Low |
| `handleAuthStatus()` auth guard | Yes — single call per route | Low |
| Tailwind styling on account pages | Yes — CSS only | Low |
| AnnouncementBar in account layout | No — couples auth to UI component | Medium |
| `useCart` in orders route | No — couples auth to cart context | Medium |
| Commented-out code in account.tsx | N/A — dead code | Low (cleanup needed) |
| Missing address CRUD mutations | Functional gap | Medium |
| Duplicate login route (`login.tsx`) | No — routing conflict risk | High |

**Summary:** The authentication customizations in v7 are mostly isolated and maintainable. The two high-risk items are: (1) the duplicate `login.tsx` + `account_.login.tsx` routing conflict, and (2) the coupling of order history to the custom cart context.

### 3.5 Divergence from Current Hydrogen Practices

The `headless-shopify/` skeleton is closer to current Shopify practice. In v7, three divergences are notable:

1. **Missing address CRUD** — v7's `account_.addresses.tsx` is read-only. The skeleton has full POST/PUT/DELETE. This is a functional regression.
2. **Duplicate login routes** — Shopify Hydrogen expects a single `account_.login` route. Having both `login.tsx` and `account_.login.tsx` creates ambiguous routing.
3. **No order search / pagination** in v7 (skeleton has `orderFilters.js` with paginated order search) — functional regression.

---

## Section 4: Strategic Options Analysis

### Option A: Build on Fresh Shopify Hydrogen Foundation

**Approach:** Use `headless-shopify/` as the base. Upgrade to Hydrogen 2025.7.3, convert to TypeScript, connect to the traceminerals Shopify store, then systematically port custom UI and business logic from `v7`.

**What needs to be ported:**
- Brand identity: Tailwind theme, custom CSS, brand colors
- Custom page routes: learn, contact, community, FAQ, shipping, returns, about
- Blog/article infrastructure: learn.tsx, article route, tag-based filtering, read-time
- UI components: Header, Footer, AnnouncementBar, and relevant components from `componentsMockup2/`
- Authentication customizations: `return_to`, `postLogoutRedirectUri`
- Feature flags context (if used in production)
- Analytics integrations (if applicable to traceminerals)
- Account pages: re-add Tailwind styling to skeleton account routes

**What should NOT be ported:**
- `componentsMockup2/` pages directory (these are being replaced by Hydrogen routes)
- `@remix-run/server-runtime`
- Experimental/duplicate routes (`login.tsx`, `account_refactor.tsx`, etc.)
- `supabase-js` unless confirmed actively used
- HMR configuration hardcoded to buyflorabella domains
- Dead commented-out code

**Estimated complexity:** Medium. The scaffold is clean; the porting work is mechanical for components and minimal for routes.

**Estimated effort:**
- Scaffold configuration and TypeScript setup: 0.5 days
- Brand theming (Tailwind, CSS): 1 day
- Custom page routes (learn, contact, community, FAQ, etc.): 2-3 days
- Article infrastructure: 1-2 days
- Account pages re-styling: 1 day
- Auth customizations: 0.5 days
- Testing and stabilization: 1-2 days
- **Total estimate: 7-10 development days**

**Benefits:**
- Clean codebase with no legacy debt from day one
- TypeScript throughout
- Latest Hydrogen version
- No `@remix-run/server-runtime` baggage
- Only necessary features are ported — dead experiments excluded
- Future Hydrogen upgrades will be straightforward (no accumulated drift)
- Clean route structure (no duplicates)
- Deployment scripts can be wired correctly from the start

**Long-term maintainability:** High. Running on a clean scaffold means each future Hydrogen upgrade involves a small, well-understood delta.

**Future upgrade path:** Excellent. Shopify publishes changelogs and migration guides with each version. A clean codebase can follow these mechanically.

**Alignment with Shopify roadmap:** Full alignment. The `headless-shopify/` base already uses all current Shopify-recommended patterns.

**Risks:**
- Time to first live deployment is 7-10 days vs. immediate (if v7 were just redeployed)
- Risk of missing a feature that exists in v7 but isn't ported
- Requires Shopify store credentials to be provided (currently missing from `headless-shopify/.env`)

---

### Option B: Continue from Existing Codebase

**Approach:** Promote `frontend/hydrogen-frontend-v7/` as the primary codebase for traceminerals, update the Shopify store credentials to point at the traceminerals store, clean up known issues incrementally.

**Immediate changes required before first deployment:**
1. Update `.env` with traceminerals store credentials
2. Update Shopify OAuth callback URLs in the Shopify Partner dashboard
3. Update HMR config in `vite.config.ts` to traceminerals domain
4. Wire `script/settings` to `frontend/hydrogen-frontend-v7/`
5. Create a systemd service file on port 20107

**Technical debt items to eventually address (not blocking, but accumulating):**
- Remove `@remix-run/server-runtime`
- Resolve duplicate route conflicts
- Complete or remove `componentsMockup2/` migration
- Remove experimental route variants
- Clarify/remove Supabase dependency
- Add address CRUD mutations
- Add order search/pagination

**Estimated complexity for initial deployment:** Low (1-2 days).
**Estimated complexity for full technical debt resolution:** High (3-5 days).

**Benefits:**
- Fastest path to a live deployment
- All custom work already done and tested in buyflorabella context
- No redesign of UI components

**Risks:**
- **Critical:** `@remix-run/server-runtime` dependency creates unknown risk during future Hydrogen upgrades. Every upgrade will require testing this interaction.
- 50+ routes create routing ambiguity. The duplicate login routes are a latent bug.
- The `componentsMockup2/` migration will either need to be completed (more work) or abandoned (dead code growing over time).
- Coupling of cart context into auth routes is a maintenance hazard.
- The codebase was designed for buyflorabella — subtle domain-specific assumptions exist throughout (HMR URL, some env variables, store-specific OAuth setup).

**Long-term maintainability:** Medium. The technical debt items are real but individually manageable. The risk is that the cumulative weight of drift grows faster than it is reduced.

**Future upgrade flexibility:** Medium-Low. The `@remix-run/server-runtime` dependency and the accumulated route proliferation mean each Hydrogen upgrade will require more manual investigation.

---

## Section 5: Risk Assessment

### Option A Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing a feature during port | Medium | Medium | Maintain a feature checklist from v7 route inventory before starting |
| Store credentials unavailable | Low | High | Obtain Shopify API credentials before starting |
| Port takes longer than estimated | Medium | Low | Buffer time; Option B is always available as fallback |
| OAuth callback URLs not registered | Medium | High | Pre-register callback URLs before testing authentication |

### Option B Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `@remix-run/server-runtime` breaks on next Hydrogen upgrade | Medium | High | Remove it as first cleanup task; but requires testing |
| Duplicate `login.tsx` + `account_.login.tsx` routing conflict surfaces | High | Medium | Remove `login.tsx` immediately |
| `componentsMockup2/` never gets cleaned up | High | Medium | Becomes permanent dead weight |
| buyflorabella-specific assumptions surface in production | Medium | Medium | Audit all env variable references before go-live |
| Order pagination/address CRUD absence causes user complaints | Medium | Medium | Prioritize adding these from skeleton |

### Operational Risks (Both Options)

| Risk | Likelihood | Impact |
|------|-----------|--------|
| No currently running Hydrogen server | High (already true) | Site is returning 502 |
| `script/settings` incorrect FRONTEND_DIR | High (already true) | Deploy scripts will launch wrong app |
| No systemd service | High (already true) | App won't survive server restarts |

---

## Section 6: Comparative Analysis

| Dimension | Option A (Rebuild from Scaffold) | Option B (Continue from v7) |
|-----------|----------------------------------|------------------------------|
| **Time to first live deployment** | 7-10 days | 1-2 days |
| **Technical debt at launch** | Minimal | High |
| **Code quality at launch** | High | Medium |
| **Upgrade flexibility (12-month)** | High | Medium-Low |
| **Risk of breakage during upgrade** | Low | Medium-High |
| **Custom feature completeness** | Requires porting (7-10 days) | Already present |
| **TypeScript coverage** | Full (convert scaffold) | Full (already .tsx) |
| **Route cleanliness** | High | Low (requires cleanup) |
| **Auth alignment with Shopify** | High | Medium (duplicates, missing features) |
| **Business disruption** | Low (nothing running today) | Low (nothing running today) |
| **Developer confidence** | High | Medium (legacy baggage) |

---

## Section 7: Recommendation

### Recommended Path: Option A (Fresh Scaffold)

The circumstances strongly favor Option A:

1. **The site is not currently serving Hydrogen content.** Nothing is lost by taking 7-10 days to do this correctly because there is no live site to protect.

2. **`headless-shopify/` is already 85% of what Option A requires.** It needs credentials, TypeScript conversion, Tailwind, and custom routes added. It does NOT need to be recreated from scratch.

3. **The `@remix-run/server-runtime` legacy in v7 is a significant forward blocker.** Shopify's upgrade path from 2025.7.x to 2026.x.x will be complicated by this dependency. Starting clean avoids the debt.

4. **The route proliferation in v7 is structural debt.** With 50+ routes and significant duplicate/experimental clutter, any future developer onboarding to v7 faces a confusing landscape. Option A produces a self-documenting route structure.

5. **The custom work in v7 is valuable but portable.** The `componentsMockup2/` components, Tailwind theme, and custom routes represent design and UX decisions — not hard technical work. Porting them to a clean scaffold is largely mechanical.

6. **Authentication customizations are minimal and easy to port.** The two meaningful changes (return_to on login, postLogoutRedirectUri on logout) are single-line additions. These migrate in minutes.

### Important Caveat

Before Option A begins, the following must be resolved as unknowns:
- The Shopify store credentials for the traceminerals store must be obtained
- The OAuth callback URLs must be pre-registered
- A decision must be made on whether Supabase is required

### If Option B is Chosen Instead

Option B is acceptable with the following **mandatory immediate actions** before any code work:
1. Remove `login.tsx` (routing conflict)
2. Remove `@remix-run/server-runtime` from `package.json` and run `npm install`
3. Update `script/settings` FRONTEND_DIR to `frontend/hydrogen-frontend-v7/`
4. Create a systemd service unit targeting port 20107
5. Update `vite.config.ts` to the traceminerals domain

These five changes are not optional — they are blocking bugs for Option B to function at all.

---

## Section 8: Proposed Next Steps

### Immediate (Pre-Work, Either Option)

1. **Identify the traceminerals Shopify store credentials.** `PUBLIC_STOREFRONT_API_TOKEN`, `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `SHOP_ID`, `PUBLIC_STORE_DOMAIN`, `PUBLIC_CHECKOUT_DOMAIN`. Without these, neither option can deploy.

2. **Decision: Register OAuth callback URL.** Determine the final domain for the traceminerals Hydrogen app and register it in Shopify Partner dashboard under Customer Account API → Callback URLs.

3. **Clean the `frontend/` directory.** Archive or delete the 20+ unused frontend variants. Keep: `hydrogen-frontend-v7/` (reference/source), `hydrogen-frontend-v4-working/` (historical reference if needed), and any active alt directories. This is not blocking but reduces confusion.

### If Option A Proceeds (Recommended)

**Phase 1 — Foundation (Day 1)**
- Upgrade `headless-shopify/` to Hydrogen 2025.7.3 (`npm install @shopify/hydrogen@2025.7.3 ...`)
- Convert all `.jsx` files to `.tsx` with TypeScript declarations
- Add Tailwind CSS 4.x to `vite.config.ts` and `package.json`
- Populate `headless-shopify/.env` with traceminerals Shopify credentials
- Update `vite.config.ts` server port to match chosen port (reconcile 20107 vs 20200)
- Update `script/settings` FRONTEND_DIR to `headless-shopify/`
- Create systemd service unit

**Phase 2 — Authentication (Day 2)**
- Port `return_to` customization to `account_.login.tsx`
- Port `postLogoutRedirectUri` customization to `account_.logout.tsx`
- Test complete PKCE OAuth2 flow against traceminerals store
- Verify `account.$.tsx` auth guard works

**Phase 3 — Brand & Theming (Day 2-3)**
- Port Tailwind theme configuration from v7 (colors, typography, spacing)
- Port `AnnouncementBar`, `Header`, `Footer` components
- Apply brand styling to skeleton pages

**Phase 4 — Custom Pages (Days 3-7)**
- Port `learn.tsx` and article route infrastructure
- Port `contact.tsx`, `community.tsx`, `about.tsx`
- Port `faq.tsx`, `shipping.tsx`, `returns.tsx`
- Port `shop.tsx` if required for traceminerals
- Port remaining `componentsMockup2/components/` selectively (not the `pages/` directory)

**Phase 5 — Account & Cart Enhancement (Day 7-8)**
- Port Tailwind styling to account routes (keeping skeleton's functional CRUD)
- Ensure address CRUD and order search/pagination are retained (they are in the scaffold)
- Remove `componentsMockup2/pages/` — these are replaced by actual Hydrogen routes

**Phase 6 — Validation & Deployment (Days 8-10)**
- Full authentication flow test
- Cart add/remove/update flow test
- Order history flow test
- Apache vhost update for traceminerals domain
- Systemd service activation
- `httpd -t` + `systemctl reload httpd`

### Ongoing

- Follow Shopify Hydrogen changelog for each 2025.7.x patch release
- Run `npm run codegen` after any GraphQL changes to regenerate types
- Add `DEVLOG.md` entries for each significant implementation session
- Eventually clean `frontend/` directory of unused variants

---

## Appendix: Customization Inventory for Port Reference

The following custom elements from `hydrogen-frontend-v7/` should be evaluated for inclusion in the Option A build. Items are rated by recommendation strength.

| Item | Type | Port? | Notes |
|------|------|-------|-------|
| Tailwind theme/colors | Config | Yes | Core brand identity |
| `AnnouncementBar.tsx` | Component | Yes | Site-wide UX element |
| `Header.tsx` (custom) | Component | Yes | Brand navigation |
| `Footer.tsx` (custom) | Component | Yes | Brand footer |
| `learn.tsx` | Route | Yes | Core content feature |
| `article.$blogHandle.$articleHandle.tsx` | Route | Yes | Core content feature |
| `contact.tsx` | Route | Yes | Business need |
| `community.tsx` | Route | Evaluate | If applicable to traceminerals |
| `about.tsx` | Route | Yes | Standard page |
| `faq.tsx` | Route | Yes | Standard page |
| `shipping.tsx` + `returns.tsx` | Routes | Yes | Standard pages |
| `FeatureFlagsContext.tsx` | Context | Evaluate | If runtime flags are needed |
| `EnvContext.tsx` | Context | Yes | Useful for client env access |
| `WhatsAppWidget.tsx` | Component | Evaluate | Only if used for traceminerals |
| `SurveyPopup.tsx` | Component | Evaluate | Verify active use |
| `AbandonedCartPopup.tsx` | Component | Evaluate | Verify active use |
| `AnalyticsTracker.tsx` / `ClarityTracker.tsx` | Component | Evaluate | Depends on tracking setup |
| `VideoReels.tsx` | Component | Evaluate | Only if video content planned |
| `DiscountBanner.tsx` | Component | Yes | Commerce feature |
| `WishlistContext.tsx` / `SavedItemsContext.tsx` | Context | Evaluate | Depends on product requirements |
| `CartReturnHandler.tsx` | Component | Yes | Important for cart UX |
| `login.tsx` (duplicate) | Route | No | Remove; use `account_.login.tsx` |
| `account_refactor.tsx` | Route | No | Experimental — discard |
| `@remix-run/server-runtime` | Dep | No | Do not port |
| `componentsMockup2/pages/` | Pages | No | Replaced by Hydrogen routes |

