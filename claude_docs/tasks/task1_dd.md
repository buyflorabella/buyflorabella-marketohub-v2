# Task 1 — Design Document

**Title:** Identify Current Hydrogen Version in Production  
**Status:** DONE  
**Date:** 2026-06-04  
**Mode:** Investigation Only

---

## Problem Statement

We need to know which version of the Hydrogen frontend code is currently "live" on Shopify
without touching the Shopify admin. The repo contains multiple frontend directories
(hydrogen-frontend-v1 through v9, alt variants, etc.). We must determine which one
produced the last production build.

---

## Investigation Plan

### Step 1 — Identify candidate directories
List all `frontend/` subdirectories and `headless-shopify/` to enumerate what exists.

### Step 2 — Check `headless-shopify/` (primary per CLAUDE.md)
- `package.json` — Hydrogen/Remix version pinned
- `package-lock.json` / lockfile — exact resolved versions
- `.env` / `.env.production` — Shopify store handle, API version, endpoint
- Last git-tracked changes to this directory

### Step 3 — Check build artifacts
- Does `headless-shopify/build/` exist? If so, check mtime and contents.
- Does `headless-shopify/dist/` exist?
- `worker-build/` or `server/index.js` presence?

### Step 4 — Check running processes
- `ps aux` for node/vite/remix processes to see what is actually running
- Identify port 20107 process (Hydrogen dev) and port 15107 (Python proxy)

### Step 5 — Check git log for headless-shopify
- Last commits touching `headless-shopify/` to find when it was last changed/deployed

### Step 6 — Check alt frontends for any build artifacts
- Quick scan of `frontend/alt-*` and `frontend/hydrogen-frontend-v*` for `build/` dirs
  that might indicate a different version was built more recently

### Step 7 — Check Apache vhost / script config
- `script/settings` — what port/path is configured for production serving
- Apache vhost pointing at port 15107 to confirm what proxy serves

---

## Success Criteria

Produce a clear answer: "The production Hydrogen code is in directory X, version Y,
last built on date Z, serving Shopify store S."
