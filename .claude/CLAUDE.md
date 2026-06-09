# BuyFloraBella — Claude Project Instructions

## Project Overview

BuyFloraBella is a Shopify headless storefront using the platform-template workflow:
- **Frontend**: Shopify Hydrogen (React Router 7 / Vite SSR) in `frontend/`
- **Backend**: Python Flask stub in `backend/` (minimal; Shopify is the primary backend)
- **Dev server**: Hydrogen Vite dev server on port 15220
- **Prod server**: Hydrogen Node server on port 20220

**Origin:** This project was migrated from `traceminerals_boardmansgame_com/frontend/hydrogen-frontend-v7/` on 2026-06-04 as part of Task 2.

Project root (dev worktree): `/var/www/html/buyflorabella/dev/`

---

## Directory Layout

```
buyflorabella/
  dev/                              ← git worktree: dev branch — all development here
    .claude/
    │   ├── CLAUDE.md               # project instructions (this file)
    │   └── settings.json           # Claude Code project settings
    claude_docs/                    # all Claude working docs
    │   ├── tasks/                  # task DDs and outcomes
    │   ├── build_docs/             # phase plans and outcomes
    │   ├── issue_fixer/            # resolved bug records
    │   ├── ideas_iterations/       # exploratory ideas
    │   ├── design_docs/            # architecture / design
    │   ├── self_improve/           # LESSONS.md staging
    │   ├── semi_cache/             # conversation history
    │   ├── workflow_changes/       # methodology changelog
    │   ├── exec_logs/              # per-session command log (gitignored)
    │   ├── DEVLOG.md               # append-only session history
    │   └── DIAGNOSIS.md            # active bug scratchpad
    frontend/                       # Shopify Hydrogen app (React Router 7)
    │   ├── app/                    # routes, components, lib, styles
    │   ├── public/
    │   └── package.json
    backend/                        # Python Flask stub
    script/                         # platform-template management scripts
    apache/                         # Apache vhost configs (committed; admin symlinks)
    systemd/                        # systemd service unit templates
    .gitignore
  prod/                             ← git worktree: master branch — read-only
    (same structure — updated only via update-production.sh)
```

---

## Port Assignments

| Service                    | Port  | Notes                                              |
|----------------------------|-------|----------------------------------------------------|
| Dev frontend (dev server)  | 15220 | `frontend.dev.buyflorabella.boardmansgame.com`     |
| Dev backend (Flask)        | 15221 | `admin.dev.buyflorabella.boardmansgame.com`        |
| Prod frontend (dev server) | 20220 | `frontend.buyflorabella.boardmansgame.com`         |
| Prod frontend (built SPA)  | —     | `buyflorabella.boardmansgame.com` (Apache DocumentRoot, no port) |
| Prod backend (Flask)       | 20221 | `admin.buyflorabella.boardmansgame.com`            |

Server-wide ports and Apache conventions are in `~/.claude/CLAUDE.md`.

---

## Tech Stack

| Layer    | Technology                  | Location      |
|----------|-----------------------------|---------------|
| Frontend | Shopify Hydrogen / React Router 7 | `frontend/` |
| Runtime  | React SSR via Vite + Remix-Oxygen | `frontend/` |
| Backend  | Python Flask stub            | `backend/`    |
| Scripts  | Bash (platform-template)    | `script/`     |
| Styles   | TailwindCSS 4.x + custom CSS | `frontend/app/styles/` |

---

## Shopify Store Credentials

| Variable | Notes |
|---|---|
| `PUBLIC_STORE_DOMAIN` | `buyflorabella.com` |
| `PUBLIC_CHECKOUT_DOMAIN` | `buyflorabella.com` |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL` | `https://shopify.com/64048332903` |
| `SHOP_ID` | `64048332903` |
| Credentials file | `frontend/.env` (gitignored) |

---

## Development Workflow

### Start Hydrogen dev server
```bash
cd /var/www/html/buyflorabella/dev
./script/manage --frontend
```

### Start Flask backend
```bash
cd /var/www/html/buyflorabella/dev
./script/manage --backend
```

### Build for production
```bash
cd /var/www/html/buyflorabella/dev/frontend
npm run build
```

### Deploy to production
```bash
cd /var/www/html/buyflorabella/dev
./script/manage --release-candidate
./script/update-production.sh
```

---

## Iteration Pattern

| File | Owner | Purpose |
|------|-------|---------|
| `claude_docs/tasks/TASK_TEMPLATE.md` | Reference only | Blank template + state machine (never processed) |
| `claude_docs/tasks/TASK_outcome.md` | Claude writes | Latest task result (overwritten each time) |
| `claude_docs/DEVLOG.md` | Claude appends | Append-only session history |
| `claude_docs/DIAGNOSIS.md` | Claude writes | Active bug scratchpad (overwritten per issue) |
| `.claude/CLAUDE.md` | Both update | Project instructions (this file) |
| `claude_docs/self_improve/LESSONS.md` | Claude writes | Staged lessons → promoted to CLAUDE.md |

---

## Conversation History — MANDATORY FIRST ACTION

`claude_docs/semi_cache/ad_hoc_conversation.md` is a bash-history-style log of every
user message. **Prepend every user message as the very first action — before anything else.**

```bash
sed -i "0,/^---$/s|^---$|---\n\n[$(date '+%Y-%m-%d %H:%M')] <message>|" \
  /var/www/html/buyflorabella/dev/claude_docs/semi_cache/ad_hoc_conversation.md
```

Format: `[YYYY-MM-DD HH:MM] <user message verbatim>` — newest at top.

**Writes to `claude_docs/semi_cache/` are pre-authorized — always proceed.**
**Writes to `claude_docs/exec_logs/` are pre-authorized — always proceed.**

---

## Session Execution Log

Maintain a lightweight command log in `claude_docs/exec_logs/YYYYMMDD_HHMM.log`
during any IN_PROGRESS task.

```
[HH:MM:SS] SESSION_START — <task description>
[HH:MM:SS] CMD: <exact bash command>
[HH:MM:SS] DONE: <brief what completed>
[HH:MM:SS] ERROR: <what failed and why>
[HH:MM:SS] SESSION_END — <summary>
```

---

## Task Status Flow

`INTAKE` → `DD_DRAFT` → `PLAN_REQUESTED` → `PLAN_READY` → `PENDING` → `IN_PROGRESS` → `DONE`

- Claude does **not** write code during `INTAKE`, `DD_DRAFT`, or `PLAN_REQUESTED`.
- After execution: always write `claude_docs/tasks/TASK_outcome.md` and append to `DEVLOG.md`.

---

## DD Authoring

- **Path A (preferred):** write `tasks/taskN_intent.md` → tell Claude to create the DD.
- **Path B:** copy blank template into `tasks/taskN_dd.md`, set Status: INTAKE.

Plans go in `build_docs/taskN_plan.md`. Outcomes in `build_docs/taskN_outcome.md`.

---

## Self-Improvement Protocol

Claude may edit `.claude/CLAUDE.md` directly. Stage lessons in `self_improve/LESSONS.md`
before promoting. Note any edit in `DEVLOG.md`.

---

## Outcome Rules

**UNCONDITIONAL:** After any significant work (>1 file, any new feature, any bug fix),
Claude always writes `claude_docs/tasks/TASK_outcome.md`. Planned tasks also write
a permanent `claude_docs/build_docs/taskN_outcome.md`.

---

## Key Reminders

- **LOG EVERY MESSAGE FIRST** — prepend to `ad_hoc_conversation.md` before any other action.
- Server-wide context (Apache, ports, MongoDB) lives in `~/.claude/CLAUDE.md`.
- Apache configs follow the server-wide naming convention — never edit `/etc/httpd/conf.d/` directly.
- Always run `httpd -t` before `systemctl reload httpd`.
- `dev/` worktree uses branch `dev`; `prod/` worktree uses branch `master`.
- Never edit `prod/` directly — use `update-production.sh` only.
- Hydrogen OAuth callback URLs must be registered in Shopify Partner dashboard when new domains are added.
- Task 3 Design Doc (`claude_docs/build_docs/task3_design_doc.md`) defines the forward architecture plan — read it before starting any Hydrogen modernization work.

## Contracts — Check Before Changing These

Any time you are about to modify ports, domains, `.env` vars, `settings.*.txt`, `generate-env.sh`,
Apache vhosts, or systemd services — **read the relevant contract first**:

| What you're touching | Contract to read |
|----------------------|-----------------|
| Ports, domains, SSL certs, vhost files | `contracts/port-domain-contract.md` |
| Secrets, `.env` vars, `settings.*.txt`, `generate-env.sh` | `contracts/secrets-deployment-contract.md` |

If your change violates a contract, either fix the violation or propose a contract update before
proceeding. Both contracts are in `dev/contracts/` (the git-tracked canonical location).
