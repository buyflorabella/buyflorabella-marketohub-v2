# Task 9 Plan — Port & Domain Audit + Gap Resolution
**Status:** DONE
**Intent:** `claude_docs/tasks/task9_intent.md`

---

## Context: How the Environment Works

**dev/ worktree** — always `npm run dev` (Vite dev server):
- `manage --frontend` → Hydrogen dev server on **15220** → `frontend.dev.buyflorabella.boardmansgame.com`
- `manage --backend`  → Flask gunicorn on **15221** → `admin.dev.buyflorabella.boardmansgame.com`

**prod/ worktree** — two modes sharing one backend port (by design):
- Systemd (`buyflorabella-frontend.service`) → `shopify hydrogen preview` (built) on **20220** → `buyflorabella.boardmansgame.com`
- Debugging: stop systemd → `manage --backend` on **20221** (same port as systemd backend — intentional, not a gap)

**The single gap:** `frontend.buyflorabella.boardmansgame.com` is in the intent but has no Apache vhost and no port assigned. This is the **prod dev-mode frontend server**, distinct from the built production server, and it needs its own port so both can run simultaneously.

---

## Port Registry (site-management) — Current State

```yaml
buyflorabella:
  ports:
    dev:
      frontend: 15220
      backend:  15221
    prod:
      frontend: 20220   # systemd workerd (built)
      backend:  20221
```

`frontend.buyflorabella.boardmansgame.com` has no port here. That's what we're adding.

---

## Block 0 — Assign New Port

Add `frontend_dev: 20222` under `prod:` in
`/opt/operations/site-management/inventory/group_vars/all/ports.yml`.

```yaml
    prod:
      frontend:     20220   # systemd workerd (built) → buyflorabella.boardmansgame.com
      frontend_dev: 20222   # manage --frontend (dev server) → frontend.buyflorabella.boardmansgame.com
      backend:      20221
```

---

## Block 1 — Update settings.prod.txt

Add / update:
```
FRONTEND_DEV_PORT=20222
FRONTEND_DEV_DOMAIN=frontend.buyflorabella.boardmansgame.com
```

`run-frontend.sh` in the prod/ worktree currently binds to `${FRONTEND_PORT}` (20220).
We need it to bind to 20222 when used for dev/inspection.

Two options — choose one in execution:
- **Option A (simpler):** Change `FRONTEND_PORT` in `settings.prod.txt` to `20222`. The built systemd service has its port hardcoded (`--port 20220`), so this won't affect it.
- **Option B:** Add a separate `run-frontend-dev.sh` that reads `FRONTEND_DEV_PORT`.

**Recommendation: Option A** — changing `FRONTEND_PORT` in settings.prod.txt to `20222` is the cleanest. The systemd service is decoupled from settings.prod.txt for its port.

---

## Block 2 — Create Apache Vhost

New file: `apache/010-frontend.buyflorabella.boardmansgame.com.conf`

```apache
# HTTP redirect
<VirtualHost *:80>
    ServerName frontend.buyflorabella.boardmansgame.com
    Redirect permanent "/" "https://frontend.buyflorabella.boardmansgame.com/"
</VirtualHost>

# HTTPS reverse proxy → port 20222
<VirtualHost *:443>
    ServerName frontend.buyflorabella.boardmansgame.com
    SSLEngine on
    ProxyPreserveHost On
    ProxyPass        "/" "http://127.0.0.1:20222/"
    ProxyPassReverse "/" "http://127.0.0.1:20222/"
    SSLCertificateFile    /etc/letsencrypt/live/buyflorabella-prod/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/buyflorabella-prod/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    ErrorLog  /var/log/httpd/buyflorabella-frontend-dev_error.log
    CustomLog /var/log/httpd/buyflorabella-frontend-dev_access.log combined
</VirtualHost>
```

**SSL cert:** Verify `buyflorabella-prod` cert covers `frontend.buyflorabella.boardmansgame.com`
(check with `certbot certificates`). If not, expand it before the admin copies the vhost.

---

## Block 3 — DNS Check

Verify `frontend.buyflorabella.boardmansgame.com` resolves to the server IP.
If missing, the admin adds the A record before activating the vhost.

---

## Block 4 — Outcome Document

Write `task9_outcome.md` containing:
- Full port registry table (site-management vs actual config vs what's expected)
- Complete vhost table (all 5 active buyflorabella vhosts including new one)
- Settings.prod.txt delta
- SSL cert status for new domain
- DNS status
- Human steps remaining (cert expansion if needed, admin copies vhost, httpd -t + reload)
