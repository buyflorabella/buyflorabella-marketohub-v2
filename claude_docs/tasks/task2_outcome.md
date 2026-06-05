# Task 2 Outcome — Migrate Hydrogen V7 into Platform-Template Workflow

**Status:** DONE  
**Date:** 2026-06-04  
**Executed by:** Claude Sonnet 4.6

---

## What Was Accomplished

The `hydrogen-frontend-v7` codebase is now installed at
`/var/www/html/buyflorabella/dev/` with the full platform-template management
script structure, running live on `https://frontend.dev.buyflorabella.boardmansgame.com`.

---

## Pre-Flight Diff Validation Receipt

```
diff -rq \
  --exclude=node_modules --exclude='.git' \
  --exclude='*.generated.*' --exclude='.env' \
  .../hydrogen-frontend-v7/ \
  /var/www/html/buyflorabella/dev/frontend/

exit: 0  ← SILENT — zero unintended source changes
```

**One intentional delta** documented: `frontend/vite.config.ts`
- Removed `'.tryhydrogen.dev'` from `allowedHosts`
- Changed HMR `host` from `dev1-frontend.buyflorabella.com` →
  `frontend.dev.buyflorabella.boardmansgame.com`
- Added `host: '0.0.0.0'` to `server` block (required for server binding)

---

## Infrastructure Registered

| Item | Value |
|---|---|
| Operations ports.yml | site_index 12, buyflorabella entry added |
| Global CLAUDE.md | Port registry updated |
| Dev frontend port | 15220 |
| Dev backend port | 15221 |
| Prod frontend port | 20220 |
| Prod backend port | 20221 |

---

## DNS Pre-Flight (all ✅)

| Domain | IP |
|---|---|
| frontend.dev.buyflorabella.boardmansgame.com | 74.208.147.12 |
| admin.dev.buyflorabella.boardmansgame.com | 74.208.147.12 |
| buyflorabella.boardmansgame.com | 74.208.147.12 |
| admin.buyflorabella.boardmansgame.com | 74.208.147.12 |

---

## SSL Certificates Issued

| Cert name | Domains | Expires |
|---|---|---|
| `buyflorabella-dev` | frontend.dev + admin.dev | 2026-09-02 |
| `buyflorabella-prod` | buyflorabella.boardmansgame.com + admin | 2026-09-02 |

---

## Apache Vhosts Active

| File | Port | Status |
|---|---|---|
| `090-frontend.dev.buyflorabella.boardmansgame.com.conf` | 15220 | symlinked, live |
| `091-admin.dev.buyflorabella.boardmansgame.com.conf` | 15221 | symlinked, live |
| `010-buyflorabella.boardmansgame.com.conf` | DocumentRoot build/ | committed, not yet linked |
| `011-admin.buyflorabella.boardmansgame.com.conf` | 20221 | committed, not yet linked |

---

## Smoke Test Result

```
curl -sk https://frontend.dev.buyflorabella.boardmansgame.com/ | head -1
→ <!DOCTYPE html><html lang="en">...
   <title>Buy Flora Bella | Premium Trace Minerals</title>
```

**Site is live and serving the correct storefront.**

---

## Git Status

- Commit `eb39e80` pushed to local `dev` branch — 382 files
- **GitHub push pending** — requires Personal Access Token (PAT) or SSH key for GitHub

To push:
```bash
# Option A: SSH (add GitHub SSH key first)
git -C /var/www/html/buyflorabella/dev remote set-url origin \
  git@github.com:buyflorabella/buyflorabella-marketohub-v2.git
git -C /var/www/html/buyflorabella/dev push -u origin dev

# Option B: HTTPS with PAT
git -C /var/www/html/buyflorabella/dev push \
  https://<your-github-pat>@github.com/buyflorabella/buyflorabella-marketohub-v2.git dev
```

---

## Manual Steps Remaining (human action)

1. **GitHub push** — see above
2. **Shopify OAuth callback URL** — in Shopify admin for `buy-flora-bella.myshopify.com`:
   - Settings → Apps → Headless app → Customer Account API → Authorized redirect URLs
   - Add: `https://frontend.dev.buyflorabella.boardmansgame.com/account/authorize`
   - Add when prod is live: `https://buyflorabella.boardmansgame.com/account/authorize`
3. **Start Hydrogen dev server** (not persistent across reboots yet):
   ```bash
   cd /var/www/html/buyflorabella/dev
   ./script/manage --frontend
   ```
4. **Systemd service** (for persistent dev server) — install `systemd/buyflorabella-dev.service`
5. **Prod worktree** — create after first push to master:
   ```bash
   git -C /var/www/html/buyflorabella worktree add prod master
   ```

---

## Next: Iteration 2

With the dev environment running, test the login flow at
`https://frontend.dev.buyflorabella.boardmansgame.com/account/login`.
Observe where it breaks (if at all) to decide between fix-in-place vs.
fresh `npx create @shopify/hydrogen@latest` scaffold + UI integration.
