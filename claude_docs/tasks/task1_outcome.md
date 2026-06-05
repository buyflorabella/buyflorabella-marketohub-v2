# Task 1 Outcome — Identify Current Hydrogen Version in Production

**Status:** DONE  
**Date:** 2026-06-04  
**Mode:** Investigation Only — no code changed

---

## TL;DR

**There is no currently running Hydrogen server.** The Apache vhost proxies to port 20107 but nothing is listening there. The most recently developed Hydrogen codebase is `frontend/hydrogen-frontend-v7/` at `@shopify/hydrogen 2025.7.2`, targeting the `buyflorabella.com` Shopify store.

---

## Findings by Directory

| Directory | `@shopify/hydrogen` | Last Modified | Build Artifacts | Notes |
|---|---|---|---|---|
| `headless-shopify/` | **2025.7.0** | Dec 8, 2024 (src) / Apr 16, 2025 (pkg) | NONE | CLAUDE.md calls this "primary"; `.env` is placeholder only (`SESSION_SECRET=foobar`) |
| `frontend/hydrogen-frontend-v7/` | **2025.7.2** | Apr 16, 2025 | NONE | Git-tracked (`M` in status); connects to `buyflorabella.com` |
| `frontend/hydrogen-frontend-v7-dxb/` | **2025.7.2** | Jan 15, 2025 | NONE | Untracked; most feature-rich `.env` (feature flags, WhatsApp, survey, etc.) |
| `frontend/alt-hydrogen-frontend-v7-dev/` | **2025.7.2** | Jan 27, 2025 | NONE | `sirensongreiki.com` store |
| `frontend/alt-hydrogen-frontend-v8/` | **2025.7.3** | Jan 27, 2025 | NONE | |
| `frontend/alt-hydrogen-frontend-v9/` | **2025.7.2** | — | NONE | |
| `frontend/hydrogen-frontend-v4/` | **none** (plain React SPA) | Jan 13, 2025 | `dist/` built Jan 13 | `script/settings` FRONTEND_DIR points here; no Shopify Hydrogen |
| `my-frontend/` | `@shopify/hydrogen-react: ^2025.7.0` | — | NONE | Plain React SPA using hydrogen-react (not full SSR) |

---

## Apache Vhost (what's actually wired up)

File: `/etc/httpd/conf.d/075-traceminerals.boardmansgame.com.conf`

```
ProxyPass "/" "http://127.0.0.1:20107/"   ← ACTIVE (dev proxy mode)
DocumentRoot .../frontend/react_build      ← commented out; dir does NOT EXIST
```

**Port 20107 has no process listening.** The site (`traceminerals.boardmansgame.com`) is currently returning connection errors/502 for Hydrogen content.

---

## Process Check

- Port 15107 Gunicorn: **running from `/var/www/html/api_textreader_boardmansgame_com`** — a completely different project, not traceminerals.
- Port 20107: **nothing listening**.
- No `node` process found anywhere for this project.

---

## Shopify Store Being Targeted

Consistent across `hydrogen-frontend-v7`, `hydrogen-frontend-v7-dxb`:
- **Store domain:** `buy-flora-bella.myshopify.com` / `buyflorabella.com`
- **Shop ID:** `64048332903`
- **Checkout domain:** `checkout.buyflorabella.com`

---

## Most Likely "Production Code" Identification

**Answer:** `frontend/hydrogen-frontend-v7/` at `@shopify/hydrogen 2025.7.2`, targeting `buyflorabella.com`. This is:
- The most recently modified Hydrogen directory (Apr 16, 2025)
- Git-tracked in the main repo (shows as modified in `git status`)
- The one `hydrogen-frontend-v7-dxb/` was branched from for DxB-specific experiments

The `headless-shopify/` directory (designated "primary" in CLAUDE.md) lags one minor version behind (`2025.7.0` vs `2025.7.2`) and has never been fully configured (placeholder `.env`). It appears to be a fresh scaffold that was not developed further.

---

## Recommendations for Migration Planning

1. **Source of truth for migration:** `frontend/hydrogen-frontend-v7/` — this is the most developed, git-tracked version.
2. **DxB's experimental feature work** lives in `frontend/hydrogen-frontend-v7-dxb/` (untracked) — compare `.env` files, `app/` routes, and `componentsMockup2/` between them before migrating.
3. **No build step needed to read the code** — no compiled output exists anywhere; everything is source-only.
4. **`headless-shopify/`** can be treated as a clean scaffold reference (newer Shopify CLI tooling, `react-router 7.9.2`) but has essentially no custom work in it.
5. **Port 20107 needs a running Hydrogen dev server** before `traceminerals.boardmansgame.com` serves anything.
