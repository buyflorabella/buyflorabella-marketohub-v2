# Task 9 Plan — Port & Domain Audit + Gap Resolution
**Status:** PENDING
**Intent:** `claude_docs/tasks/task9_intent.md`

---

## What the Outcome Document Will Contain

The `task9_outcome.md` will record the full audit table, gap analysis, and
specific fixes applied or recommended. This plan defines the investigation
scope and what to check for each gap.

---

## Block 0 — Site-Management Port Registry

Report the full `buyflorabella` entry from
`/opt/operations/site-management/inventory/group_vars/all/ports.yml`
verbatim so the expected port assignments are on record.

**Already found (pre-plan inventory):**

| Env  | Role     | Port  |
|------|----------|-------|
| dev  | frontend | 15220 |
| dev  | backend  | 15221 |
| prod | frontend | 20220 |
| prod | backend  | 20221 |

vhost_prefix: prod=`010`, dev=`090`/`091`

---

## Block 1 — Active Apache Vhosts Cross-Reference

Check every file in `/etc/httpd/conf.d/` matching buyflorabella and map:
`ServerName → ProxyPass port → process expected → process actually running`

**Already found:**

| Conf file | ServerName | Port | What it serves |
|---|---|---|---|
| `010-buyflorabella.boardmansgame.com.conf` | `buyflorabella.boardmansgame.com` | 20220 | Prod built (workerd/systemd) |
| `011-admin.buyflorabella.boardmansgame.com.conf` | `admin.buyflorabella.boardmansgame.com` | 20221 | Prod Flask |
| `090-frontend.dev.buyflorabella.boardmansgame.com.conf` | `frontend.dev.buyflorabella.boardmansgame.com` | 15220 | Dev Hydrogen dev server |
| `091-admin.dev.buyflorabella.boardmansgame.com.conf` | `admin.dev.buyflorabella.boardmansgame.com` | 15221 | Dev Flask |

Extra vhosts in `/etc/httpd/conf.d/` NOT in the project repo:
- `025-dev1-frontend.buyflorabella.com.conf` → DocumentRoot (not a proxy)
- `025-dev2-frontend.buyflorabella.com.conf` → DocumentRoot (not a proxy)
- `075-buyflorabella.com.conf` → DocumentRoot (buyflorabella.com, unrelated)

---

## Block 2 — Live Process Audit

Check which expected ports are actually listening right now:

**Already found:**

| Port  | Process | Status |
|-------|---------|--------|
| 15220 | `node` / `npm run dev` (Hydrogen dev server) | ✅ listening |
| 15221 | Flask/gunicorn (dev backend) | ❌ **NOT listening** |
| 20220 | `workerd` via systemd `buyflorabella-frontend.service` | ✅ listening |
| 20221 | `python3`/gunicorn (prod Flask) | ✅ listening |

**Gap 1:** Dev backend (port 15221) is down. `admin.dev.buyflorabella.boardmansgame.com` is unreachable.

---

## Block 3 — Script Behaviour Audit

Trace what each manage command actually starts, per worktree:

**dev/ worktree:**
- `./script/manage --frontend` → `run-frontend.sh` → `exec npm run dev -- --host --port 15220`
  - Starts Hydrogen Vite dev server. Correct for dev.
- `./script/manage --backend` → `run-backend.sh` → starts Flask on port 15221. Correct for dev.

**prod/ worktree:**
- `./script/manage --frontend` → `run-frontend.sh` → `exec npm run dev -- --host --port 20220`
  - ⚠️ Starts a **Vite dev server** on port 20220 — same port as systemd (`workerd` built preview).
  - These conflict: can't run simultaneously.
- `./script/manage --backend` → `run-backend.sh` → starts Flask on port 20221. OK for debugging.

**systemd `buyflorabella-frontend.service`:**
- `ExecStart=/usr/bin/npx shopify hydrogen preview --port 20220`
- Runs the BUILT frontend (production mode). This is the `buyflorabella.boardmansgame.com` server.

**Gap 2:** `manage --frontend` in prod/ and the systemd service share port 20220. The user cannot run
the prod/ dev server for inspection without first stopping the built systemd service. There is no
dedicated port/vhost for "dev mode server running in prod/ worktree".

---

## Block 4 — Missing Domain: `frontend.buyflorabella.boardmansgame.com`

The intent specifies this domain as "dev version of react server running in prod".
No Apache vhost exists for it. No port is reserved for it in site-management.

**Gap 3:** `frontend.buyflorabella.boardmansgame.com` has no vhost and no dedicated port.
If we want this, we need:
1. A new port (e.g. `20222` or reuse `20220` under a separate domain with port disambiguation)
2. A new Apache vhost config `010-frontend.buyflorabella.boardmansgame.com.conf`
3. An entry in `ports.yml` for prod `frontend_dev: 20222` (or similar)
4. Update `run-frontend.sh` in prod to use the new port

Alternatively: the "dev mode server in prod" could use the existing `manage --frontend` flow
after stopping systemd — no permanent second port needed, just a workflow clarification.

---

## Block 5 — Gap Summary and Remediation Options

The outcome document will present a clear gap table and for each gap give:
- **Immediate fix** (what can be done now, minimal change)
- **Full fix** (proper permanent solution)

**Gap 1 — Dev Flask not running (port 15221)**
- Immediate fix: `cd /var/www/html/buyflorabella/dev && ./script/manage --backend`
- Permanent fix: systemd service for dev backend (like `buyflorabella-dev.service` stub already exists in `systemd/`)

**Gap 2 — Port conflict: manage --frontend in prod vs systemd on 20220**
- Immediate fix: `systemctl stop buyflorabella-frontend` before running `manage --frontend` in prod
- Full fix: assign a dedicated second port (e.g. `20222`) for "prod/ dev server", new vhost `frontend.buyflorabella.boardmansgame.com`, update `manage --frontend` in prod to use it, add to ports.yml

**Gap 3 — No `frontend.buyflorabella.boardmansgame.com` vhost**
- Same as Gap 2 full fix above

---

## Execution Order (when set to PENDING)

1. Record Block 0 registry extract verbatim
2. Build the full cross-reference table (Blocks 1–2)
3. Record script behaviour findings (Block 3)
4. Document Gap 2 + Gap 3 as linked (same root cause)
5. Start dev backend to close Gap 1 immediately
6. Write gap summary with immediate vs full fix recommendations
7. Write `task9_outcome.md`
