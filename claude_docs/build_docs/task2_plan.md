# Task 2 Plan — Migrate Hydrogen V7 into Platform-Template Workflow

**Status:** pending
**Date:** 2026-06-04
**GitHub target:** https://github.com/buyflorabella/buyflorabella-marketohub-v2.git
**Source:** `frontend/hydrogen-frontend-v7/`

---

## Port Assignment (from `/opt/operations/site-management`)

Port blocks use `site_index * 10`. Highest assigned index is **11** (divorcemachine).
Next available: **index 12**.

| Worktree | Role                  | Port  |
|----------|-----------------------|-------|
| dev      | frontend (Hydrogen)   | 15220 |
| dev      | backend (Flask stub)  | 15221 |
| prod     | frontend              | 20220 |
| prod     | backend               | 20221 |

---

## Target Directory Layout

```
/var/www/html/buyflorabella/
  dev/                          ← worktree: dev branch — all development here
    frontend/                   ← Hydrogen Remix app (migrated from v7, zero source changes)
    backend/                    ← minimal Python Flask stub (admin hook, not used iteration 1)
    script/                     ← platform-template scripts, name-patched for buyflorabella
    apache/                     ← vhost configs (committed, symlinked by admin)
    systemd/                    ← service unit templates
    .claude/CLAUDE.md
    claude_docs/
  prod/                         ← worktree: master branch — never edited directly
    (same structure)
```

---

## Worktree Rules

| Worktree | Branch | Rule |
|----------|--------|------|
| `dev/`   | dev    | All Claude/developer work happens here |
| `prod/`  | master | Read-only; updated only via `update-production.sh` |

---

## Execution Checklist

- [ ] Block 0 — Operations registration
- [ ] Block 1 — Repo + worktrees
- [ ] Block 2 — Scaffold scripts, backend, apache, systemd
- [ ] Block 3 — Script name-patch (buyflorabella substitutions)
- [ ] Block 4 — Hydrogen source rsync
- [ ] Block 5 — Pre-flight file diff validation
- [ ] Block 6 — vite.config.ts HMR host update (only expected delta)
- [ ] Block 7 — Settings files
- [ ] Block 8 — Apache vhosts (frontend + admin, dev + prod)
- [ ] Block 9 — Pre-flight: DNS check
- [ ] Block 10 — Pre-flight: SSL certs
- [ ] Block 11 — npm install, start, browser smoke test
- [ ] Block 12 — Shopify OAuth callback URLs
- [ ] Block 13 — Initial commit + push to GitHub
- [ ] Block 14 — DEVLOG + task2_outcome.md

---

## Block 0: Operations Registration

**0-A** Add to `/opt/operations/site-management/inventory/group_vars/all/ports.yml`:

```yaml
buyflorabella:
  base_domain: buyflorabella.boardmansgame.com
  site_repo: git@github.com:buyflorabella/buyflorabella-marketohub-v2.git
  site_index: 12
  admin_email: boardmansgameremotedeveloper@gmail.com
  webroot: /var/www/html/buyflorabella
  has_frontend: true
  has_admin: true      # stub — Shopify is the real backend
  has_api: false
  env_webroot: true
  ports:
    dev:
      frontend: 15220
      backend:  15221
    prod:
      frontend: 20220
      backend:  20221
  vhost_prefix:
    prod: "010"
    staging: "050"
    dev: "090"
```

**0-B** Update `~/.claude/CLAUDE.md` Port Registry:

```
| buyflorabella (dev)  | 15220 | 15221 | dev worktree, dev branch   |
| buyflorabella (prod) | 20220 | 20221 | prod worktree, master branch |
```

---

## Block 1: Repo + Worktrees

```bash
mkdir -p /var/www/html/buyflorabella
cd /var/www/html/buyflorabella

# Clone into dev/ worktree (GitHub repo may be empty initially)
git clone git@github.com:buyflorabella/buyflorabella-marketohub-v2.git dev
cd dev
git checkout -b dev || git checkout dev

# Create prod worktree pointing at master (add after first push to master)
# git worktree add ../prod master
```

If the repo is brand new (empty):
```bash
cd /var/www/html/buyflorabella/dev
git init
git remote add origin git@github.com:buyflorabella/buyflorabella-marketohub-v2.git
git checkout -b dev
```

---

## Block 2: Scaffold from Platform-Template

Copy all management scripts and structural dirs:

```bash
cp -r /var/www/html/platform-template/dev/script/   /var/www/html/buyflorabella/dev/script/
cp -r /var/www/html/platform-template/dev/backend/  /var/www/html/buyflorabella/dev/backend/
cp -r /var/www/html/platform-template/dev/apache/   /var/www/html/buyflorabella/dev/apache/
cp -r /var/www/html/platform-template/dev/systemd/  /var/www/html/buyflorabella/dev/systemd/
```

Strip the backend down to a minimal Flask stub: keep `app.py` and `requirements.txt`,
remove routes and models beyond a health-check endpoint. The stub holds port 15221 for
future admin hooks.

---

## Block 3: Script Name-Patch — Hardcoded Strings

After copying, apply the following substitutions. These are the **only** changes to
the scripts; all logic stays identical to platform-template.

### Executable scripts

| File | What to change | From | To |
|------|---------------|------|----|
| `kill-zombie-backend.sh` | line 2 comment | `platform-template backend` | `buyflorabella backend` |
| `kill-zombie-backend.sh` | line 42 comment | `platform-template known ports` | `buyflorabella known ports` |
| `kill-zombie-backend.sh` | line 134 echo | `platform-template process report` | `buyflorabella process report` |
| `run-tests.sh` | line 30 echo banner | `platform-template Test Runner` | `buyflorabella Test Runner` |
| `kill-zombie-processes.sh` | line 43 fallback | `BACKEND_PORTS[dev]="17150"` | `BACKEND_PORTS[dev]="15221"` |
| `kill-zombie-processes.sh` | line 44 fallback | `BACKEND_PORTS[prod]="17150"` | `BACKEND_PORTS[prod]="20221"` |
| `kill-zombie-processes.sh` | line 45 fallback | `FRONTEND_PORTS[dev]="17151"` | `FRONTEND_PORTS[dev]="15220"` |
| `kill-zombie-processes.sh` | line 46 fallback | `FRONTEND_PORTS[prod]="17151"` | `FRONTEND_PORTS[prod]="20220"` |
| `kill-zombie-processes.sh` | line 50 service map | `BACKEND_SERVICES[17150]="platform-template-dev.service"` | `BACKEND_SERVICES[15221]="buyflorabella-dev.service"` |
| `kill-zombie-processes.sh` | line 51 service map | `BACKEND_SERVICES[17150]="platform-template.service"` | `BACKEND_SERVICES[20221]="buyflorabella.service"` |
| `kill-zombie-processes.sh` | line 154 echo | `platform-template process report` | `buyflorabella process report` |

**`manage`, `release-candidate.sh`, and `update-production.sh` have zero hardcoded
project names** — they derive everything from settings files. No changes needed.

### Systemd service units

Rename the service unit files:
```
platform-template-dev.service  →  buyflorabella-dev.service
platform-template.service      →  buyflorabella.service
```
Update the `Description=` and `ExecStart=` lines inside.

---

## Block 4: Hydrogen Source — rsync

```bash
rsync -av \
  --exclude=node_modules \
  --exclude='.git' \
  --exclude='*.generated.*' \
  --exclude='.env' \
  /var/www/html/traceminerals_boardmansgame_com/frontend/hydrogen-frontend-v7/ \
  /var/www/html/buyflorabella/dev/frontend/
```

---

## Block 5: Pre-Flight File Diff Validation

Run immediately after rsync. Zero code changes is a hard requirement.

```bash
diff -rq \
  --exclude=node_modules \
  --exclude='.git' \
  --exclude='*.generated.*' \
  --exclude='.env' \
  /var/www/html/traceminerals_boardmansgame_com/frontend/hydrogen-frontend-v7/ \
  /var/www/html/buyflorabella/dev/frontend/
```

**Expected result:** silent (no output). Any `differ` line is a problem — investigate
before proceeding. Save the full diff output (even if empty) in `task2_outcome.md` as
the validation receipt.

---

## Block 6: vite.config.ts HMR Host Update

The only intentional Hydrogen source change — infrastructure config only, not app logic.
`vite.config.ts` has a hardcoded HMR block for the old dev domain:

```ts
// Current (must change):
hmr: {
  host: 'dev1-frontend.buyflorabella.com',
  protocol: 'wss',
  clientPort: 443,
},

// New:
hmr: {
  host: 'frontend.dev.buyflorabella.boardmansgame.com',
  protocol: 'wss',
  clientPort: 443,
},
```

Also update `server.allowedHosts`:

```ts
server: {
  allowedHosts: [
    '.boardmansgame.com',
    '.buyflorabella.com',
  ],
  hmr: { ... },
}
```

This is the **only** delta that will appear in the diff validation. Document it
explicitly in `task2_outcome.md`.

---

## Block 7: Settings Files

Not committed to git — created manually per worktree.

### `script/settings.dev.txt`

```bash
# Structural vars
FRONTEND_DIR=frontend
BACKEND_DIR=backend
PYTHON_BIN=python3
BACKEND_APP_SCRIPT=app
FRONTEND_HOST=localhost
GUNICORN_GROUP=apache

# Allocation (from ports.yml site_index 12)
ENV=development
SERVER_ID=buyflorabella
SITE_NAME=buyflorabella-dev
FRONTEND_PORT=15220
BACKEND_PORT=15221
BACKEND_HOST=127.0.0.1
NODE_ENV=development
DEBUG=true
DEV_SLOT=

BASE_DOMAIN=buyflorabella.boardmansgame.com
FRONTEND_DOMAIN=frontend.dev.buyflorabella.boardmansgame.com
ADMIN_DOMAIN=admin.dev.buyflorabella.boardmansgame.com
API_DOMAIN=admin.dev.buyflorabella.boardmansgame.com

API_BASE_URL=https://admin.dev.buyflorabella.boardmansgame.com
ADMIN_URL=https://admin.dev.buyflorabella.boardmansgame.com/admin/
ALLOWED_CORS_DOMAINS=.boardmansgame.com
SESSION_COOKIE_DOMAIN=              # leave blank for dev — see cookie note below

GUNICORN_USER=apache
WORKERS=3

FLASK_SECRET_KEY=<generate>
MONGO_URI=mongodb://localhost:27028/buyflorabella_dev

FRONTEND_URL=https://frontend.dev.buyflorabella.boardmansgame.com
VERSION_MAJOR="1"
VERSION_MINOR="0"
VERSION_BUILD_NUMBER="0"
```

### `script/settings.prod.txt`

```bash
FRONTEND_PORT=20220
BACKEND_PORT=20221
BACKEND_HOST=127.0.0.1
ENV=production
DEBUG=false
NODE_ENV=production
SERVER_ID=buyflorabella
SITE_NAME=buyflorabella
GUNICORN_USER=apache
GUNICORN_GROUP=apache
WORKERS=3

BASE_DOMAIN=buyflorabella.boardmansgame.com
FRONTEND_DOMAIN=buyflorabella.boardmansgame.com
ADMIN_DOMAIN=admin.buyflorabella.boardmansgame.com
API_DOMAIN=admin.buyflorabella.boardmansgame.com

API_BASE_URL=https://admin.buyflorabella.boardmansgame.com
ADMIN_URL=https://admin.buyflorabella.boardmansgame.com/admin/
FRONTEND_URL=https://buyflorabella.boardmansgame.com
FRONTEND_SPA_SERVE_PATH=/var/www/html/buyflorabella/prod/frontend/build

ALLOWED_CORS_DOMAINS=.boardmansgame.com
SESSION_COOKIE_DOMAIN=.buyflorabella.boardmansgame.com

FLASK_SECRET_KEY=<generate>
MONGO_URI=mongodb://localhost:27028/buyflorabella
```

### Cookie Domain Note

`SESSION_COOKIE_DOMAIN` controls the Flask admin session cookie scope:

- **Dev:** leave blank — cookie scoped to exact hostname, no cross-subdomain sharing needed
- **Prod:** `.buyflorabella.boardmansgame.com` — covers `frontend.buyflorabella.boardmansgame.com`
  and `admin.buyflorabella.boardmansgame.com`

The SSL cert **must cover all subdomains in SESSION_COOKIE_DOMAIN** or browsers will
reject the cookies. Solution: issue one cert covering both subdomains per environment
(see Block 10).

**Hydrogen sessions are separate:** Hydrogen manages its own session via `SESSION_SECRET`
in `frontend/.env` (a Shopify-managed cookie). Unaffected by Flask's `SESSION_COOKIE_DOMAIN`.

---

## Block 8: Apache Vhosts

Four configs committed to `apache/` in the repo. Admin symlinks to `/etc/httpd/conf.d/`
after certs are issued. Always run `httpd -t` before reload.

### `apache/090-frontend.dev.buyflorabella.boardmansgame.com.conf`

```apache
<VirtualHost *:443>
    ServerName frontend.dev.buyflorabella.boardmansgame.com
    SSLEngine on
    ProxyPreserveHost On
    ProxyPass        "/" "http://127.0.0.1:15220/"
    ProxyPassReverse "/" "http://127.0.0.1:15220/"
    SSLCertificateFile    /etc/letsencrypt/live/buyflorabella-dev/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/buyflorabella-dev/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    ErrorLog  /var/log/httpd/buyflorabella-dev-frontend_error.log
    CustomLog /var/log/httpd/buyflorabella-dev-frontend_access.log combined
</VirtualHost>
<VirtualHost *:80>
    ServerName frontend.dev.buyflorabella.boardmansgame.com
    RewriteEngine on
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

### `apache/091-admin.dev.buyflorabella.boardmansgame.com.conf`

```apache
<VirtualHost *:443>
    ServerName admin.dev.buyflorabella.boardmansgame.com
    SSLEngine on
    ProxyPreserveHost On
    ProxyPass        "/" "http://127.0.0.1:15221/"
    ProxyPassReverse "/" "http://127.0.0.1:15221/"
    SSLCertificateFile    /etc/letsencrypt/live/buyflorabella-dev/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/buyflorabella-dev/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    ErrorLog  /var/log/httpd/buyflorabella-dev-admin_error.log
    CustomLog /var/log/httpd/buyflorabella-dev-admin_access.log combined
</VirtualHost>
<VirtualHost *:80>
    ServerName admin.dev.buyflorabella.boardmansgame.com
    RewriteEngine on
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

### `apache/010-buyflorabella.boardmansgame.com.conf` (prod frontend)

```apache
<VirtualHost *:443>
    ServerName buyflorabella.boardmansgame.com
    SSLEngine on
    ProxyPreserveHost On
    ProxyPass        "/" "http://127.0.0.1:20220/"
    ProxyPassReverse "/" "http://127.0.0.1:20220/"
    SSLCertificateFile    /etc/letsencrypt/live/buyflorabella-prod/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/buyflorabella-prod/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    ErrorLog  /var/log/httpd/buyflorabella-frontend_error.log
    CustomLog /var/log/httpd/buyflorabella-frontend_access.log combined
</VirtualHost>
<VirtualHost *:80>
    ServerName buyflorabella.boardmansgame.com
    RewriteEngine on
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

### `apache/011-admin.buyflorabella.boardmansgame.com.conf` (prod admin)

```apache
<VirtualHost *:443>
    ServerName admin.buyflorabella.boardmansgame.com
    SSLEngine on
    ProxyPreserveHost On
    ProxyPass        "/" "http://127.0.0.1:20221/"
    ProxyPassReverse "/" "http://127.0.0.1:20221/"
    SSLCertificateFile    /etc/letsencrypt/live/buyflorabella-prod/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/buyflorabella-prod/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    ErrorLog  /var/log/httpd/buyflorabella-admin_error.log
    CustomLog /var/log/httpd/buyflorabella-admin_access.log combined
</VirtualHost>
<VirtualHost *:80>
    ServerName admin.buyflorabella.boardmansgame.com
    RewriteEngine on
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

> Vhost prefix convention: `090`/`091` for dev slots, `010`/`011` for prod.

---

## Block 9: Pre-Flight DNS Check

Run before certbot. All four domains must resolve to this server's IP or the
ACME HTTP-01 challenge will fail.

```bash
SERVER_IP=$(curl -4s --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo "This server: ${SERVER_IP}"
echo ""
for domain in \
  frontend.dev.buyflorabella.boardmansgame.com \
  admin.dev.buyflorabella.boardmansgame.com \
  buyflorabella.boardmansgame.com \
  admin.buyflorabella.boardmansgame.com; do
  resolved=$(dig +short "$domain" | tail -1)
  if [[ "$resolved" == "$SERVER_IP" ]]; then
    echo "✅  $domain → $resolved"
  else
    echo "❌  $domain → '${resolved:-NXDOMAIN}' (expected $SERVER_IP)"
  fi
done
```

**Do not proceed to Block 10 until all four show ✅.**

---

## Block 10: SSL Certificates

Two certs — one per environment. Each cert SAN list must cover all domains that share
a `SESSION_COOKIE_DOMAIN`, otherwise browsers reject the session cookies.

```bash
# Dev cert (covers frontend.dev + admin.dev)
certbot certonly --apache \
  --cert-name buyflorabella-dev \
  -d frontend.dev.buyflorabella.boardmansgame.com \
  -d admin.dev.buyflorabella.boardmansgame.com

# Prod cert (covers apex + admin)
certbot certonly --apache \
  --cert-name buyflorabella-prod \
  -d buyflorabella.boardmansgame.com \
  -d admin.buyflorabella.boardmansgame.com
```

After issuance, symlink vhosts and reload:

```bash
ln -s /var/www/html/buyflorabella/dev/apache/090-frontend.dev.buyflorabella.boardmansgame.com.conf \
      /etc/httpd/conf.d/
ln -s /var/www/html/buyflorabella/dev/apache/091-admin.dev.buyflorabella.boardmansgame.com.conf \
      /etc/httpd/conf.d/

httpd -t && systemctl reload httpd
```

---

## Block 11: Start + Smoke Test

```bash
cd /var/www/html/buyflorabella/dev

# Install Node deps
cd frontend && npm install && cd ..

# Start Hydrogen dev server (port 15220)
./script/manage --frontend

# In another terminal — start Flask backend stub (port 15221)
./script/manage --backend
```

Visit `https://frontend.dev.buyflorabella.boardmansgame.com` — confirm products load,
CSS renders, no console errors. Login is tested after Block 12.

---

## Block 12: Shopify OAuth Callback URLs

Product browsing, collections, and cart work immediately with just the Storefront API
token in `frontend/.env`. Login requires this additional step.

**Register dev domain in Shopify admin** for store `buy-flora-bella.myshopify.com`:

1. Shopify Admin → **Settings → Apps and sales channels → [Headless app]**
2. Under **Customer Account API → Authorized redirect URLs**, add:
   ```
   https://frontend.dev.buyflorabella.boardmansgame.com/account/authorize
   ```
3. Add prod when ready: `https://buyflorabella.boardmansgame.com/account/authorize`

If login shows "redirect_uri not allowed" — the callback isn't registered. Shopify
admin change only, no code change.

Running the dev frontend does not affect the live Shopify store. The Storefront API
is read-only for product data.

---

## Block 13: Release Workflow (dev → prod)

Workflow is **identical to platform-template** — no script changes. Scripts derive
project identity entirely from settings files.

### Promote dev to prod:

**Step 1 — in `dev/` worktree:**
```bash
cd /var/www/html/buyflorabella/dev
./script/manage --release-candidate
```
Commits pending changes, merges master into dev, bumps version, tags, pushes to GitHub.

**Step 2 — in `prod/` worktree:**
```bash
cd /var/www/html/buyflorabella/prod
./script/update-production.sh
```
Merges dev → master, pulls, builds frontend, restarts backend service.

### Hydrogen-specific production note

Platform-template's `deploy-frontend.sh` produces a static SPA under `frontend/build/`.
Hydrogen's build produces a **Node.js server bundle** (`build/server/index.js`), not
static files. The prod systemd service unit for the frontend runs:

```bash
node /var/www/html/buyflorabella/prod/frontend/build/server/index.js
```

This is the **only structural difference** from platform-template's deploy flow.
All script machinery (`manage`, `release-candidate`, `update-production`) stays
identical — only the systemd frontend service unit runs `node` instead of `gunicorn`.

---

## Iteration 2: Login / Account Management

### Context

The v7 codebase evolved away from Hydrogen's standard customer account scaffold. Login
and account flows were moved into custom React components (`componentsMockup2/`, custom
`routes/account*` files). These may work, be partially broken, or have subtle OAuth
issues that only surface on a new domain.

### Decision Process

**First:** run v7 on the dev domain and test the login flow end-to-end.

| Observation | Approach |
|---|---|
| Login → Shopify → returns to site → account page loads | **Fix in place** — OAuth intact; issues are cosmetic or route-level |
| Login → Shopify → return redirect fails or 404 | **Examine routes** — likely `routes/account*.tsx` or callback URL mismatch |
| Login does not redirect at all / JS error before Shopify | **Evaluate rebuild** — Customer Account API client config may be broken |

### Option A: Fix in Place

Diagnose the specific failure point in existing routes and components. Scope is
limited — don't refactor working code.

### Option B: Rebuild from Stock Hydrogen + Integrate

If the auth flow is fundamentally broken, start from a fresh Hydrogen scaffold:

```bash
npx create @shopify/hydrogen@latest
```

A fresh scaffold generates correct, working Customer Account API auth flows:
OAuth redirect/callback routes, customer session management, account/orders/addresses
routes. Integration work: import v7's look/feel (CSS, non-account routes, UI
components) into the clean scaffold. Auth machinery stays from the scaffold.

**The stock Hydrogen scaffold is the authoritative reference** for a clean auth
implementation — not any existing directory in this repo.

### Iteration 2 begins only after iteration 1 is running on the dev domain.
