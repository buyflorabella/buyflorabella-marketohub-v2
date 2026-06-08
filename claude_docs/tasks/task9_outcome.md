# Task 9 Outcome — Port & Domain Audit + Gap Resolution
**Status:** DONE
**Date:** 2026-06-06

---

## Architecture (mirrors pulsecomposer pattern)

| Domain                                         | Server type   | Port  | How served                              |
|------------------------------------------------|---------------|-------|-----------------------------------------|
| `buyflorabella.boardmansgame.com`              | Built SPA     | —     | Apache `DocumentRoot` (static files)   |
| `frontend.buyflorabella.boardmansgame.com`     | Dev server    | 20220 | Apache ProxyPass → `npm run dev`        |
| `admin.buyflorabella.boardmansgame.com`        | Flask backend | 20221 | Apache ProxyPass → Flask/systemd        |
| `frontend.dev.buyflorabella.boardmansgame.com` | Dev server    | 15220 | Apache ProxyPass → `npm run dev`        |
| `admin.dev.buyflorabella.boardmansgame.com`    | Flask backend | 15221 | Apache ProxyPass → Flask                |

The built SPA (`buyflorabella.boardmansgame.com`) has **no port** — Apache serves static
files directly from `prod/frontend/build`, with `FallbackResource /index.html` for
client-side routing. This matches the pulsecomposer `010-pulsecomposer-spa.conf` pattern exactly.

---

## Port Registry — site-management `ports.yml` (corrected)

```yaml
buyflorabella:
  ports:
    dev:
      frontend: 15220   # npm run dev → frontend.dev.buyflorabella.boardmansgame.com
      backend:  15221   # Flask → admin.dev.buyflorabella.boardmansgame.com
    prod:
      frontend: 20220   # npm run dev → frontend.buyflorabella.boardmansgame.com
      backend:  20221   # Flask/systemd → admin.buyflorabella.boardmansgame.com
```

Note: no port entry for the built SPA — it has no running server.

---

## Apache Vhost Table (all 5 buyflorabella vhosts)

| File                                                    | Domain                                         | Type        | Status  |
|---------------------------------------------------------|------------------------------------------------|-------------|---------|
| `010-buyflorabella.boardmansgame.com.conf`              | `buyflorabella.boardmansgame.com`              | DocumentRoot| REWRITTEN |
| `011-admin.buyflorabella.boardmansgame.com.conf`        | `admin.buyflorabella.boardmansgame.com`        | ProxyPass→20221 | ACTIVE |
| `012-frontend.buyflorabella.boardmansgame.com.conf`     | `frontend.buyflorabella.boardmansgame.com`     | ProxyPass→20220 | PENDING |
| `090-frontend.dev.buyflorabella.boardmansgame.com.conf` | `frontend.dev.buyflorabella.boardmansgame.com` | ProxyPass→15220 | ACTIVE |
| `091-admin.dev.buyflorabella.boardmansgame.com.conf`    | `admin.dev.buyflorabella.boardmansgame.com`    | ProxyPass→15221 | ACTIVE |

`010` was rewritten from ProxyPass to DocumentRoot (the previous ProxyPass to port 20220
via a systemd hydrogen preview service was wrong — does not match the intended architecture).

`012` is committed and ready but awaiting cert expansion + admin symlink.

---

## What `manage --frontend` does per worktree

| Worktree | Port | Domain | Command |
|----------|------|--------|---------|
| `dev/`   | 15220 | `frontend.dev.buyflorabella.boardmansgame.com` | `npm run dev -- --host --port 15220` |
| `prod/`  | 20220 | `frontend.buyflorabella.boardmansgame.com` | `npm run dev -- --host --port 20220` |

Backend (`manage --backend`) and systemd share port 20221 by design — stop systemd to
debug via `manage --backend`.

---

## SSL Certificate Status

| Cert Name            | SANs                                                                    | Covers new domain?  |
|----------------------|-------------------------------------------------------------------------|---------------------|
| `buyflorabella-prod` | `buyflorabella.boardmansgame.com`, `admin.buyflorabella.boardmansgame.com` | **NO** — must expand |

---

## DNS Status

| Domain                                     | A Record      | Status |
|--------------------------------------------|---------------|--------|
| `frontend.buyflorabella.boardmansgame.com` | 74.208.147.12 | EXISTS |

---

## Human Steps Remaining

### Step 1 — Disable the wrong systemd service

The old `buyflorabella-frontend.service` (running `hydrogen preview` on port 20220) conflicts
with the correct architecture. With `010-buyflorabella.boardmansgame.com.conf` now using
DocumentRoot, port 20220 belongs to `manage --frontend` (dev server), not a systemd unit.

```bash
sudo systemctl stop buyflorabella-frontend.service
sudo systemctl disable buyflorabella-frontend.service
```

### Step 2 — Admin copies rewritten vhost (010) and reloads Apache

The `010-buyflorabella.boardmansgame.com.conf` is committed as DocumentRoot.
Admin re-copies (or the symlink picks up the new content if already symlinked):

```bash
sudo httpd -t && sudo systemctl reload httpd
```

### Step 3 — Expand SSL cert

```bash
sudo certbot certonly --expand \
  -d buyflorabella.boardmansgame.com \
  -d admin.buyflorabella.boardmansgame.com \
  -d frontend.buyflorabella.boardmansgame.com
```

### Step 4 — Symlink new vhost (012) and reload

```bash
sudo ln -s /var/www/html/buyflorabella/dev/apache/012-frontend.buyflorabella.boardmansgame.com.conf \
           /etc/httpd/conf.d/
sudo httpd -t && sudo systemctl reload httpd
```

### Step 5 — Verify

- `https://buyflorabella.boardmansgame.com` — static build served by Apache (no running server needed)
- `https://frontend.buyflorabella.boardmansgame.com` — start via `cd prod/ && ./script/manage --frontend`, then visit

---

## Files Changed

| File | Change |
|------|--------|
| `ports.yml` (site-management) | Fixed `prod.frontend: 20220` comment; removed erroneous `frontend_dev: 20222` |
| `prod/script/settings.prod.txt` | Reverted FRONTEND_PORT to 20220; removed erroneous additions |
| `dev/apache/010-buyflorabella.boardmansgame.com.conf` | Rewritten: ProxyPass → DocumentRoot |
| `dev/apache/012-frontend.buyflorabella.boardmansgame.com.conf` | NEW — ProxyPass to port 20220 |
| `dev/.claude/CLAUDE.md` | Port table corrected |
| `dev/claude_docs/tasks/task9_plan.md` | Status → DONE |
