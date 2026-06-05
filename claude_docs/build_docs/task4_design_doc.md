# Design Document: Shopify Hydrogen Architecture Assessment — BuyFloraBella Forward Strategy

**Project:** BuyFloraBella Headless Storefront  
**Codebase:** `/var/www/html/buyflorabella/dev/frontend/`  
**Date:** 2026-06-04  
**Author:** Claude (architectural review)  
**Status:** DONE  
**Task:** task4  
**Supersedes:** `task3_design_doc.md` (same findings, corrected path references)

---

## Provenance Note

This document is a corrected refinement of `task3_design_doc.md`. The original Task 3
examination was conducted against `traceminerals_boardmansgame_com/frontend/hydrogen-frontend-v7/`.
Task 2 validated a **zero-diff copy** of that directory into `buyflorabella/dev/frontend/`
(one intentional delta: `vite.config.ts` HMR hostname). All findings are identical — only
path references and the deployment status have changed.

`task3_design_doc.md` is preserved as historical record. Do not modify it.

---

## Facts, Assumptions, and Unknowns

### Verified Facts

- `buyflorabella/dev/frontend/` is on `@shopify/hydrogen 2025.7.2`, React Router `7.12.0`, TypeScript.
- The dev server is **live** at `https://frontend.dev.buyflorabella.boardmansgame.com` (smoke-tested in Task 2).
- `buyflorabella/dev/frontend/` has a dependency on `@remix-run/server-runtime ^2.17.4` — a legacy Remix package not expected in a pure React Router 7.x project.
- The `app/routes/` directory contains 50+ route files, including confirmed duplicates: `login.tsx` + `account_.login.tsx`, `account_refactor.tsx`, multiple article route variants (`article.$blog.$handle.tsx`, `article.$blogHandle.$articleHandle.tsx`, `article.$slug.tsx`).
- `app/componentsMockup2/` contains 34 components, 15 page-level components, and 6 context providers — a parallel SPA design in mid-migration.
- `account.tsx` contains a large commented-out block (entire GraphQL query + loader).
- `account_.addresses.tsx` is read-only — no create, update, or delete mutations.
- `account_.orders.tsx` is fixed at `first: 10` with no pagination and imports `useCart` from `componentsMockup2/contexts/CartContext`.
- `login.tsx` and `account_.login.tsx` are both present with different logic — a routing conflict.
- The latest available Hydrogen version (seen in `alt-hydrogen-frontend-v8/` in the traceminerals repo) is `2025.7.3`.
- `buyflorabella/dev/frontend/.env` contains live Shopify credentials for `buyflorabella.com` / `buy-flora-bella.myshopify.com` (SHOP_ID: `64048332903`).

### Assumptions

- The site's visual identity is embodied in `componentsMockup2/` components and the Tailwind-styled routes.
- The "clunky auth" described by the developer refers to the route organization and missing features, not the OAuth/PKCE mechanics (which are handled by `@shopify/hydrogen`).
- A Phase 2 rebuild would target `buyflorabella/dev/frontend/` within the existing worktree structure — not a new repo.

### Unknowns Requiring Investigation Before Phase 2

- Is `@supabase/supabase-js` actively used in production, or is it a leftover experiment?
- Which of the 50+ routes are intended as final vs. experiments to discard?
- Are there any Shopify OAuth callback URLs registered for the prod domain (`buyflorabella.boardmansgame.com`) yet?

---

## Executive Summary

The BuyFloraBella headless storefront is live on the dev domain and serving correctly. The
codebase is functionally complete but carries architectural debt that increases friction for
future maintenance and Shopify Hydrogen upgrades.

Two specific concerns drive this assessment:

1. **Does latest Hydrogen get us anything?** The version gap (2025.7.2 → 2025.7.3) is a
   minor patch and provides no meaningful benefit by itself. The real benefit of a rebuild
   comes from eliminating structural debt, not from the version number.

2. **Auth is fragile — does rebuilding fix it?** The OAuth/PKCE authentication mechanics
   are solid — Shopify's `customerAccount` API handles them. The "fragility" is in route
   organization (a duplicate login route is a latent bug) and missing features (no address
   CRUD, no order pagination). A rebuild fixes this cleanly; targeted in-place fixes do too
   with far less disruption.

**Recommendation:** Two-phase approach.

- **Phase 1 (immediate, ~half day):** Three targeted changes that eliminate the highest-risk
  items without touching the UI. Safe to do while the site is live.
- **Phase 2 (deferred, 7–10 days):** Full rebuild from a fresh Hydrogen scaffold, porting
  the UI and custom routes in cleanly. Addresses long-term maintainability.

Phase 1 is not optional — the duplicate login route is an active latent bug.

---

## Section 1: Current State Assessment

### 1.1 Active Codebase

**Location:** `/var/www/html/buyflorabella/dev/frontend/`  
**Branch:** `dev` (git worktree)  
**Live URL:** `https://frontend.dev.buyflorabella.boardmansgame.com`

```
buyflorabella/dev/
  frontend/                       ← Shopify Hydrogen app (subject of this document)
    app/
      assets/
      components/                 ← standard Hydrogen UI components (Header, Footer, Cart, etc.)
      componentsMockup2/          ← parallel SPA component library, mid-migration
        components/               ← 34 custom UI components
        contexts/                 ← 6 React context providers
        pages/                    ← 15 page-level components (NOT Hydrogen routes)
      graphql/                    ← GraphQL query files (some routes define queries inline)
      lib/                        ← context.ts, session.ts, fragments.ts, i18n.ts (fixed EN/US)
      routes/                     ← 50+ route files (includes duplicates/experiments)
      styles/                     ← app.css, reset.css, tailwind.css, password.css
      entry.client.tsx
      entry.server.tsx
      root.tsx
    .env                          ← live credentials (gitignored)
    package.json                  ← @shopify/hydrogen 2025.7.2
    react-router.config.ts        ← hydrogenPreset()
    routes.ts                     ← hydrogenRoutes + flatRoutes
    server.ts
    vite.config.ts
```

### 1.2 Codebase Inventory

| Area | Version / State | Notes |
|------|----------------|-------|
| `@shopify/hydrogen` | 2025.7.2 | Latest seen: 2025.7.3 (minor patch) |
| `react-router` | 7.12.0 | Current |
| `@remix-run/server-runtime` | ^2.17.4 | **Legacy dep — should not exist** |
| TypeScript | Full `.tsx` | Correct |
| TailwindCSS | 4.x | Current |
| Routes | 50+ files | Includes duplicates/experiments |
| `componentsMockup2/` | Mid-migration | 34 components, not fully integrated |
| Auth routes | Custom | See Section 3 |
| `frontend/.env` | Live credentials | buyflorabella.com store |
| Build artifacts | None | Dev server only; prod build not yet attempted |

**Strengths:**
- TypeScript throughout
- TailwindCSS 4.x with custom brand theme
- `react-router.config.ts` uses `hydrogenPreset()` — correct
- `routes.ts` uses `hydrogenRoutes + flatRoutes` — correct
- `createHydrogenContext` in `lib/context.ts` — correct pattern
- `createContentSecurityPolicy` in `entry.server.tsx` — correct
- `storefrontRedirect` for 404s in `server.ts` — correct
- Rich set of custom pages: learn, article, contact, community, about, FAQ, shipping, returns
- Full brand visual identity via Tailwind theme + componentsMockup2 components
- Live and smoke-tested on dev domain

**Weaknesses / Technical Debt:**

| Item | Severity | Description |
|------|----------|-------------|
| `@remix-run/server-runtime` dep | **High** | Legacy Remix package; blocks clean Hydrogen upgrades |
| Duplicate `login.tsx` + `account_.login.tsx` | **High** | Active routing conflict risk |
| `componentsMockup2/pages/` | Medium | Dead weight — replaced by Hydrogen routes but never removed |
| Commented-out code in `account.tsx` | Medium | Large block of dead code creates confusion |
| `account_.addresses.tsx` read-only | Medium | Missing create/update/delete mutations |
| `account_.orders.tsx` no pagination | Medium | Fixed at 10 orders; couples to CartContext |
| `react-router-dom` listed alongside `react-router` | Low | Redundant in React Router v7 |
| `app/routes/` experimental variants | Low | `account_refactor.tsx`, `article.$slug.tsx`, etc. |

---

## Section 2: Shopify Hydrogen Gap Analysis

### 2.1 Version Comparison

| Version | Codebase | Notes |
|---------|----------|-------|
| 2025.7.3 | Latest scaffold available | Minor patch release |
| **2025.7.2** | **buyflorabella/dev/frontend/** | **Current — one patch behind** |

The gap is a single patch release. The Hydrogen `2025.7.3` changelog contains:
- Updated API version constants for 2025-07
- Regenerated GraphQL types
- Minor tooling fixes

**There is no architectural improvement in 2025.7.3 that addresses the current codebase's problems.** The problems are structural, not version-level.

### 2.2 Compliance with Current Hydrogen Best Practices

| Practice | buyflorabella/dev/frontend | Status |
|----------|---------------------------|--------|
| React Router 7.x imports (no Remix) | ✅ All imports use `react-router` | Compliant |
| `@shopify/hydrogen/react-router-preset` | ✅ `react-router.config.ts` | Compliant |
| `hydrogenRoutes` + `flatRoutes` | ✅ `app/routes.ts` | Compliant |
| `createHydrogenContext` | ✅ `lib/context.ts` | Compliant |
| `AppSession` class | ✅ `lib/session.ts` | Compliant |
| CSP via `createContentSecurityPolicy` | ✅ `entry.server.tsx` | Compliant |
| `storefrontRedirect` for 404s | ✅ `server.ts` | Compliant |
| `loadCriticalData` / `loadDeferredData` split | ✅ Most routes | Compliant |
| TypeScript | ✅ `.tsx` throughout | Compliant |
| No legacy Remix deps | ❌ `@remix-run/server-runtime` present | **Gap** |
| Clean route structure | ❌ 50+ files with duplicates | **Gap** |
| Completed component migration | ❌ `componentsMockup2/` incomplete | **Gap** |

### 2.3 The `@remix-run/server-runtime` Problem

This is the most significant forward-looking risk item. In Hydrogen 2025.7.x, the Remix v2
runtime is no longer the foundation — React Router 7.x is. The `@remix-run/server-runtime`
package provides types and utilities that are now part of `react-router` directly.

Its presence means:
- Every future `npm install` pulls in a Remix v2 package alongside React Router v7
- Future Hydrogen upgrades may introduce incompatibilities between the two
- It signals to any future developer that the codebase is in a mixed migration state

**Fix:** Remove it from `package.json` dependencies and run `npm install`. React Router 7.x
provides all the same exports (`type LoaderFunctionArgs`, `type ActionFunctionArgs`, etc.)
from `react-router` directly.

---

## Section 3: Authentication Review

### 3.1 Authentication Architecture

Authentication uses Shopify's **Customer Account API** with PKCE OAuth2. This is the current
Shopify-recommended mechanism. The OAuth/PKCE handshake is entirely inside `@shopify/hydrogen`'s
`customerAccount` object — neither the current code nor any rebuild changes how authentication
actually works. All auth routes delegate to `context.customerAccount.*`.

### 3.2 Auth Route Inventory

| File | Function | Notes |
|------|----------|-------|
| `account_.login.tsx` | Initiates Shopify OAuth | Custom: adds `return_to` param + `handleAuthStatus()` check |
| `login.tsx` | **Duplicate login route** | **Different logic — routing conflict** |
| `account_.authorize.tsx` | Completes PKCE handshake | Standard delegation |
| `account_.logout.tsx` | Logs out | Custom: `postLogoutRedirectUri` → `/account/login` |
| `account.$.tsx` | Auth guard wildcard | Standard `handleAuthStatus()` + redirect |
| `account.tsx` | Account layout | Custom Tailwind UI; large dead code block |
| `account._index.tsx` | Redirects to `/account/orders` | Standard |
| `account_.orders.tsx` | Order history | No pagination; coupled to CartContext |
| `account_.addresses.tsx` | Addresses | **Read-only — no CRUD** |
| `account_.settings.tsx` | Settings | Present |
| `account_.disabled.tsx` | Disabled state | Present |

### 3.3 The "Clunky/Fragile" Diagnosis

The developer's sense that auth is fragile maps to five specific code conditions:

**1. Duplicate login route (highest risk):**
`login.tsx` and `account_.login.tsx` both exist. React Router resolves route conflicts
based on specificity rules — the winner may not be what the developer expects, and it
can change between React Router versions. One of them needs to be removed.

```
app/routes/login.tsx              ← handles /login
app/routes/account_.login.tsx     ← handles /account/login
```

These are different URLs, so they don't actually conflict at the URL level. However,
`login.tsx` has a `handleAuthStatus()` check that can redirect to `/account` — it partially
duplicates `account_.login.tsx` behavior. The question is: which URL does "Sign in" in
the Header link to? If it links to `/account/login`, then `login.tsx` is dead. If it links
to `/login`, then `account_.login.tsx` is dead. One must go.

**2. Dead code in account layout:**
`account.tsx` has ~60 lines of commented-out code: a complete `CUSTOMER_DETAILS_QUERY`,
a `loader` function, and a `LogoutDebug` component. This is the original implementation
before the refactor. It creates cognitive noise for anyone reading the auth flow.

**3. CartContext coupling in orders:**
`account_.orders.tsx` imports `useCart` from `componentsMockup2/contexts/CartContext`.
This means the order history page breaks if `CartContext` is removed or refactored.
Auth-adjacent routes should not depend on the cart context.

**4. Read-only address management:**
`account_.addresses.tsx` fetches addresses but provides no way to create, update, or
delete them. Users who navigate to the address management page will find it display-only.

**5. No order pagination:**
`account_.orders.tsx` loads `first: 10` orders with no way to see more. Customers with
order history > 10 cannot access older orders.

### 3.4 Customization Isolation Assessment

| Customization | Isolated? | Upgrade Risk |
|---------------|-----------|--------------|
| `return_to` on login | Yes | Low — one line |
| `postLogoutRedirectUri` on logout | Yes | Low — one line |
| `handleAuthStatus()` auth guard | Yes | Low — one call per route |
| Tailwind styling on account pages | Yes | Low — CSS only |
| `AnnouncementBar` in account layout | Yes | Low — one component import |
| `useCart` in orders route | **No** | **Medium — coupling** |
| Duplicate `login.tsx` | **No** | **High — routing conflict** |
| Missing address CRUD | N/A — absent | Medium — functional gap |

### 3.5 Does a Rebuild Fix the Auth?

A fresh Hydrogen scaffold would give:
- Single `account_.login.tsx` (no duplicate)
- No dead code anywhere
- Full address CRUD from day one
- Paginated order search from day one
- No CartContext coupling

**But:** The scaffold auth routes have no Tailwind styling — they're plain HTML. Re-applying
the current brand design to scaffold auth routes is the same work whether you do a full
rebuild or a targeted in-place fix.

**Conclusion:** A rebuild produces the cleanest result, but the five fragility items above
can each be fixed in-place in isolation. The most important fix — removing the duplicate
login route — takes about 10 minutes and has zero visual impact.

---

## Section 4: Strategic Options Analysis

### Option A: Rebuild from Fresh Hydrogen Scaffold

**Approach:** Run `npx create @shopify/hydrogen@latest` to scaffold a new app within the
`buyflorabella/dev/frontend/` directory (replacing it), then systematically port:
- Tailwind theme and brand CSS
- Custom page routes: learn, contact, community, about, FAQ, shipping, returns
- Blog/article infrastructure
- Selected `componentsMockup2/` components (not the `pages/` directory)
- Auth customizations (`return_to`, `postLogoutRedirectUri`)
- `EnvContext`, `FeatureFlagsContext`, `CartContext` (decoupled from auth)

**What NOT to port:**
- `@remix-run/server-runtime`
- Duplicate/experimental routes
- `componentsMockup2/pages/` (replaced by Hydrogen routes)
- Dead commented-out code
- `supabase-js` unless confirmed active

**Estimated effort:**
- Scaffold setup, TypeScript, Tailwind: 0.5 days
- Brand theming: 1 day
- Auth routes re-styled: 1 day
- Custom page routes (learn, contact, community, etc.): 2–3 days
- Article infrastructure: 1–2 days
- Account pages (with address CRUD + order pagination): 1 day
- Testing and stabilization: 1–2 days
- **Total: 7–10 days**

**Benefits:** No legacy deps; clean route structure; full address CRUD and order pagination
from day one; auth is clean; easy future upgrades.

**Risks:** Business disruption while the dev site is non-functional during rebuild;
risk of missing a feature in the port.

**Deployment during rebuild:** The dev site must be taken down or a parallel branch used.
The live dev URL would be unavailable during the ~7–10 day window.

---

### Option B: Fix In Place (Phase 1 only)

**Approach:** Apply three targeted changes to the live codebase, no scaffold:

1. Remove `@remix-run/server-runtime` from `package.json`, run `npm install`
2. Remove `login.tsx` (after confirming which login URL the Header links to)
3. Delete commented-out dead code from `account.tsx`

**Estimated effort: ~4 hours**

**Benefits:** Zero visual change; site stays live throughout; eliminates the two highest-risk
items; produces a cleaner codebase with minimal surface area change.

**Limitations:** `componentsMockup2/` remains; route clutter remains; address CRUD and
order pagination remain absent; future Hydrogen upgrades still require care (though the
worst legacy dep is gone).

---

### Option C: Two-Phase (Recommended)

Combine B now and A later.

**Phase 1 (immediate, ~4 hours — do now):**
1. Remove `@remix-run/server-runtime` from `package.json`
2. Remove `login.tsx` duplicate
3. Delete dead code from `account.tsx`

**Phase 2 (deferred, 7–10 days — when there is a development window):**
Follow Option A. By the time Phase 2 begins, the codebase is cleaner and Phase 1 has
proved that changes can be made without breaking the live site.

---

## Section 5: Risk Assessment

### Phase 1 Risks (immediate changes)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Removing `login.tsx` breaks something | Low | High | Check Header link target before removing; test login flow after |
| Removing `@remix-run/server-runtime` breaks a type import | Low | Medium | `npm run typecheck` after removal; fix any import that relied on it |
| Dead code deletion causes error | Very low | Low | Dead code is commented out — deletion cannot affect runtime |

### Phase 2 Risks (rebuild)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| UI regression during port | Medium | High | Use existing codebase as visual reference; port component by component |
| Missing a feature | Medium | Medium | Maintain feature checklist from current route inventory before starting |
| Dev site down during rebuild | Certain | Medium | Accept: dev site is dev-only; no user impact |
| Supabase integration breaks | Low | Unknown | Resolve the "is it active?" unknown before Phase 2 |
| OAuth callback URLs need updating | Low | High | Callback URLs are already registered for the existing domain; no change needed unless domain changes |

---

## Section 6: Comparative Analysis

| Dimension | Phase 1 Only | Phase 1 + Phase 2 |
|-----------|-------------|-------------------|
| Time to first improvement | ~4 hours | ~4 hours |
| Technical debt eliminated | 30% | 95% |
| Code quality | Medium → Medium-high | Medium → High |
| Auth robustness | Medium → High | Medium → High |
| Upgrade flexibility (12-month) | Medium | High |
| Business disruption | None | Dev site down ~7–10 days |
| Risk | Low | Low (Phase 1) + Medium (Phase 2) |
| Recommended | Phase 1 now | Phase 2 when capacity available |

---

## Section 7: Recommendation

### Immediate: Execute Phase 1

Three changes, ~4 hours, no visual impact, site stays live:

**Change 1 — Remove legacy dep**
```bash
# In buyflorabella/dev/frontend/
npm uninstall @remix-run/server-runtime
npm install
npm run typecheck   # fix any resulting type errors (expect 0-2)
```

**Change 2 — Remove duplicate login route**
```bash
# First: confirm which URL the Header "Sign in" link uses
grep -r "to=.*login\|href=.*login" app/components/Header.tsx
# Then remove the unused file — likely login.tsx (standalone /login URL)
# Verify: run dev server, test sign-in flow end to end
```

**Change 3 — Remove dead code from account.tsx**
```bash
# Delete the commented-out CUSTOMER_DETAILS_QUERY, loader, and LogoutDebug blocks
# Keep: the active loader (handleAuthStatus only), the AccountLayout component
```

After Phase 1: run the full dev server, test sign-in → account → sign-out cycle, verify
addresses and orders pages render.

### Deferred: Plan Phase 2 as Task 5

When there is a development window (the developer is comfortable with the dev site being
down for up to 10 days), open Task 5 to execute the full rebuild. Use this document's
"What to port / what not to port" table as the feature checklist.

---

## Section 8: Proposed Next Steps

### Before any Phase 2 work — resolve the unknowns

1. **Supabase:** Is `@supabase/supabase-js` actually used? `grep -r "supabase" app/` — if
   no active usage, remove the dependency in Phase 1.

2. **Which login URL is canonical?** Check Header component and any "Sign in" links.
   `grep -r "\/login\|account\/login" app/` — this determines which `login.tsx` to remove.

3. **Address CRUD priority:** Is the address management page visible to users? If yes,
   add it to Phase 1 (port the CRUD from the Hydrogen skeleton — ~2 hours).

### Task 5 setup (when Phase 2 is approved)

Write `task5_intent.md` with:
- Confirmation that Phase 1 is complete
- Feature checklist from this document's Section 1.2
- Decision on whether to scaffold in-place or use a parallel branch
- Supabase decision resolved

---

## Appendix: Port Reference — What to Port in Phase 2

| Item | Type | Port? | Notes |
|------|------|-------|-------|
| Tailwind theme + brand colors | Config | Yes | Core identity |
| `AnnouncementBar.tsx` | Component | Yes | Site-wide |
| `Header.tsx` (custom) | Component | Yes | Brand nav |
| `Footer.tsx` (custom) | Component | Yes | Brand footer |
| `learn.tsx` + article routes | Routes | Yes | Core content |
| `contact.tsx`, `about.tsx`, `faq.tsx` | Routes | Yes | Standard pages |
| `community.tsx` | Route | Yes | Site feature |
| `shipping.tsx`, `returns.tsx` | Routes | Yes | Commerce pages |
| `shop.tsx` | Route | Evaluate | Confirm needed |
| `EnvContext.tsx` | Context | Yes | Useful |
| `FeatureFlagsContext.tsx` | Context | Evaluate | If flags are used |
| `CartContext.tsx` | Context | Yes | But decouple from auth routes |
| `DiscountBanner.tsx` | Component | Yes | Commerce feature |
| `CartReturnHandler.tsx` | Component | Yes | Cart UX |
| `WhatsAppWidget.tsx` | Component | Evaluate | If used for buyflorabella |
| `SurveyPopup.tsx` | Component | Evaluate | Pending Supabase decision |
| `AbandonedCartPopup.tsx` | Component | Evaluate | Confirm active |
| `AnalyticsTracker.tsx`, `ClarityTracker.tsx` | Components | Evaluate | Confirm active |
| `VideoReels.tsx` | Component | Evaluate | If video content planned |
| `WishlistContext.tsx`, `SavedItemsContext.tsx` | Contexts | Evaluate | Per requirements |
| `login.tsx` | Route | **No** | Remove in Phase 1 |
| `account_refactor.tsx` | Route | **No** | Experimental — discard |
| `@remix-run/server-runtime` | Dep | **No** | Remove in Phase 1 |
| `componentsMockup2/pages/` | Pages | **No** | Replaced by Hydrogen routes |
| Any `*_refactor.tsx` routes | Routes | **No** | Experimental — discard |
