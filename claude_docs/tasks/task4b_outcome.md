# Task 4b — Env Variable Investigation: Outcome
**Date:** 2026-06-04 18:44  
**Scope:** `/var/www/html/buyflorabella/dev/frontend/`

---

## CSV — Variable Usage Audit

```csv
variable,found_in_code,primary_files
PUBLIC_ADMIN_BYPASS_PASSWORD_ENABLED,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_ANNOUNCEMENT_BAR_ENABLED,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_ANNOUNCEMENT_BAR_MESSAGE,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_CHECKOUT_DOMAIN,YES,"frontend/app/entry.server.tsx; frontend/app/root.tsx; frontend/app/routes/api.$version.[graphql.json].tsx; frontend/src/entry.server.tsx; frontend/.env.dxb-reference"
PUBLIC_CONTACT_PAGE_URL,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_COUNTDOWN_TIMER_ENABLED,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_FEATURE_BOOKMARK,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_FEATURE_WHATSAPP,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_FEATURE_WISHLIST,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_MAIL_API_BASE,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_MAIL_API_ROUTE,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_OMNISEND_BRAND_ID,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_SHOP_PAGE_URL,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_SITE_SURVEY_ENABLED,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_SITE_SURVEY_SINGLE_ANSWER,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_STORE_LOCKED,YES,"frontend/app/root.tsx; frontend/app/componentsMockup/Root.tsx; frontend/.env.dxb-reference"
PUBLIC_STORE_MESSAGE1,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_STORE_MESSAGE2,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_STORE_MESSAGE3,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_STORE_PASSWORD,YES,"frontend/app/root.tsx; frontend/app/routes/password.tsx; frontend/app/routes/password2.tsx; frontend/.env.dxb-reference"
PUBLIC_SURVEY_API_BASE,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_SURVEY_API_ROUTE,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_WHATSAPP_GROUP_NAME,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_WHATSAPP_GROUP_URL,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_WHATSAPP_LINK_CALLOUT,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
PUBLIC_WHATSAPP_LINK_DESCRIPTION,YES,"frontend/app/root.tsx; frontend/.env.dxb-reference"
SESSION_SECRET,YES,"frontend/app/lib/context.ts; frontend/.env.dxb-reference"
```

---

## Human-Readable Summary

### Overall: 27 / 27 variables found

Every variable in the investigation list is actively used in the codebase. No dead/orphaned variables.

---

### Variable Groups

#### Store Lock / Password Gate (5 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_STORE_LOCKED` | Active | Read in `root.tsx` loader; also in `componentsMockup/Root.tsx`. Drives SSR lock logic. |
| `PUBLIC_STORE_PASSWORD` | Active | Read in `root.tsx` and both password route files (`password.tsx`, `password2.tsx`). Direct string comparison — no hashing. |
| `PUBLIC_ADMIN_BYPASS_PASSWORD_ENABLED` | Active | Boolean flag; when `"true"`, bypasses password redirect entirely. Read in `root.tsx:166`. |
| `PUBLIC_STORE_MESSAGE1/2/3` | Active | Three message slots passed to loader data. Used by lock screen UI. Default to `""`. |

**Note:** `.env.dxb-reference` contains a legacy `VITE_PUBLIC_STORE_*` block (lines 26–30) alongside the active `PUBLIC_*` equivalents. The VITE-prefixed variants appear to be stale/deprecated — they are not referenced in `root.tsx`. Only the `PUBLIC_*` forms are consumed by the SSR loader.

---

#### Store Navigation (2 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_CONTACT_PAGE_URL` | Active | Defaulted to `"/contact"` if unset (`root.tsx:206`). |
| `PUBLIC_SHOP_PAGE_URL` | Active | Defaulted to `"/shop"` if unset (`root.tsx:207`). |

---

#### Announcement Bar (2 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_ANNOUNCEMENT_BAR_ENABLED` | Active | Optional boolean via `getEnvBoolean()`. Spread-conditional pattern — only included in loader if defined. |
| `PUBLIC_ANNOUNCEMENT_BAR_MESSAGE` | Active | Optional string via `getEnvString()`. Same spread-conditional pattern. |

---

#### Countdown Timer & Surveys (3 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_COUNTDOWN_TIMER_ENABLED` | Active | Boolean flag (`=== "true"`). Sets `publicTimer` in loader at `root.tsx:255`. |
| `PUBLIC_SITE_SURVEY_ENABLED` | Active | Boolean flag. Sets `surveysEnabled` at `root.tsx:256`. |
| `PUBLIC_SITE_SURVEY_SINGLE_ANSWER` | Active | Boolean flag. Sets `surveySingleAnswer` at `root.tsx:257`. |

---

#### WhatsApp Integration (5 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_FEATURE_WHATSAPP` | Active | Feature flag via `getEnvBoolean()`. Controls `whatsappWidget`. |
| `PUBLIC_WHATSAPP_GROUP_URL` | Active | Optional string. Spread-conditional. |
| `PUBLIC_WHATSAPP_GROUP_NAME` | Active | Optional string. Spread-conditional. |
| `PUBLIC_WHATSAPP_LINK_CALLOUT` | Active | Optional string. Spread-conditional. |
| `PUBLIC_WHATSAPP_LINK_DESCRIPTION` | Active | Optional string. Spread-conditional. |

---

#### Feature Flags (2 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_FEATURE_BOOKMARK` | Active | Feature flag via `getEnvBoolean()`. Controls `bookmarkIcon`. |
| `PUBLIC_FEATURE_WISHLIST` | Active | Feature flag via `getEnvBoolean()`. Controls `wishlistIcon`. |

---

#### Email / Mail API (2 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_MAIL_API_BASE` | Active | No default fallback. Passed directly to loader at `root.tsx:215`. |
| `PUBLIC_MAIL_API_ROUTE` | Active | No default fallback. Passed directly to loader at `root.tsx:216`. |

---

#### Survey API (2 vars)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_SURVEY_API_BASE` | Active | No default fallback. Passed to loader at `root.tsx:213`. |
| `PUBLIC_SURVEY_API_ROUTE` | Active | No default fallback. Passed to loader at `root.tsx:214`. |

---

#### Omnisend (1 var)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_OMNISEND_BRAND_ID` | Active | No default fallback. Passed to loader at `root.tsx:212`. |

---

#### Checkout / Shopify (1 var)
| Variable | Status | Notes |
|---|---|---|
| `PUBLIC_CHECKOUT_DOMAIN` | Active | Used in 3 entry points: `entry.server.tsx`, `root.tsx`, and `routes/api.$version.[graphql.json].tsx`. Also appears in stale `frontend/src/entry.server.tsx`. |

---

#### Session (1 var)
| Variable | Status | Notes |
|---|---|---|
| `SESSION_SECRET` | Active | **Hard required** — `lib/context.ts:33` throws `Error` if unset. Only variable with a guard. All others degrade gracefully or use defaults. |

---

### Key Findings

1. **All 27 vars are active** — none are dead code or stale.

2. **One required variable:** `SESSION_SECRET` throws at startup if missing. All others either have fallback defaults or are optional spread-conditionals.

3. **VITE_PUBLIC_* stale block:** `.env.dxb-reference` lines 26–30 define `VITE_PUBLIC_STORE_PASSWORD`, `VITE_PUBLIC_STORE_LOCKED`, and `VITE_PUBLIC_STORE_MESSAGE1/2/3`. These are not consumed anywhere in the current `app/` codebase — likely a migration artifact from an earlier Vite client-side exposure pattern. Safe to remove from `.env.dxb-reference`.

4. **Dual entry.server.tsx:** `PUBLIC_CHECKOUT_DOMAIN` appears in both `frontend/app/entry.server.tsx` (active) and `frontend/src/entry.server.tsx` (appears to be a stale source copy). The `src/` path is unusual for a Hydrogen project and may be another migration artifact.

5. **No hash/encryption on passwords:** `PUBLIC_STORE_PASSWORD` is compared in plain text in both password routes. Acceptable for a simple store gate but worth noting.

6. **Optional vs. required pattern:** Feature flags (`PUBLIC_FEATURE_*`, `PUBLIC_ANNOUNCEMENT_BAR_*`, `PUBLIC_WHATSAPP_*`) use a `getEnvBoolean()`/`getEnvString()` + spread-conditional pattern. If the variable is absent from `.env`, those keys are simply omitted from the loader response rather than defaulting to false/empty — the consuming components must handle `undefined`.
