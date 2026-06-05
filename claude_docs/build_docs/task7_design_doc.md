# Task 7 — GitHub Repository Mirror: buyflorabella → boardmansgameremotedeveloper
## Design Document

**Date:** 2026-06-05
**Status:** PENDING
**Intent:** `claude_docs/tasks/task7_intent.md`

---

## Executive Summary

Shopify Oxygen can only connect to repositories under the `boardmansgameremotedeveloper` GitHub account. All development happens in `buyflorabella/buyflorabella-marketohub-v2`. Task 7 implements automatic full mirroring so every push to the canonical repo is immediately reflected in the deployment repo — with no manual steps and no developer awareness of the mirror.

**Result:** Shopify connects to `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`. When the `shopify-promote.sh` script (from task 6) pushes to `origin/main` in the canonical repo, the mirror fires, and Oxygen deploys automatically.

---

## 1. Repository Roles

| Repo | Role | Who pushes |
|---|---|---|
| `buyflorabella/buyflorabella-marketohub-v2` | Canonical — source of truth | Developers, CI scripts |
| `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` | Mirror — deployment target | Mirror workflow only |

**Mirror invariants:**
- `boardmansgameremotedeveloper` is never pushed to directly
- `boardmansgameremotedeveloper` content is always 1:1 with `buyflorabella` — same branches, tags, and commit history
- The mirror includes the `main` branch (Shopify deployment branch) and all other branches

---

## 2. Deployment Flow After Task 7

```
Developer: shopify-promote.sh (from prod/ worktree)
  → git push origin main  (canonical: buyflorabella)
  → GitHub Actions: mirror workflow fires (buyflorabella)
    → git push --mirror → boardmansgameremotedeveloper
      → GitHub Actions: oxygen workflow fires (boardmansgameremotedeveloper)
        → npx shopify hydrogen deploy → Shopify Oxygen → buyflorabella.com
```

The Oxygen deployment token is stored as a secret in `boardmansgameremotedeveloper`, not in `buyflorabella`.

---

## 3. Mirroring Mechanism

### 3.1 Workflow

**File:** `.github/workflows/mirror-to-boardmansgame.yml` (on `dev`/`master` branches in canonical repo)

**Triggers:**
```yaml
on:
  push:
    branches: ['**']
    tags: ['**']
  delete:
```

- `push` on `**`: fires on every commit push to any branch, and on tag creation
- `delete`: fires when a branch or tag is deleted — `--mirror` propagates the deletion

**Guard:** `if: github.repository == 'buyflorabella/buyflorabella-marketohub-v2'`

Prevents the workflow from running if it is somehow executed in the mirror repo (which also has the workflow on `dev`/`master` branches). Without this guard, `boardmansgameremotedeveloper` would attempt to re-mirror back (and fail, since it has no `MIRROR_DEPLOY_KEY` secret — but the guard is cleaner).

### 3.2 Mirror Operation

Bare clone + `git push --mirror` — the only reliable pattern for full ref mirroring:

```bash
git clone --bare https://github.com/buyflorabella/buyflorabella-marketohub-v2.git
cd buyflorabella-marketohub-v2.git
git push --mirror git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git
```

`--mirror` pushes all refs (branches, tags, notes) and deletes any refs in the destination that no longer exist in the source. This keeps the repos exactly identical.

### 3.3 Authentication

**Approach:** SSH deploy key (more secure than PAT — scoped to one repo).

| Key component | Location |
|---|---|
| Private key | Secret `MIRROR_DEPLOY_KEY` in `buyflorabella/buyflorabella-marketohub-v2` |
| Public key | Deploy key on `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` with **write** access |

SSH is used only for the push to `boardmansgameremotedeveloper`. The clone from `buyflorabella` uses HTTPS (no auth needed — public repo, or uses the default `GITHUB_TOKEN` if private).

---

## 4. Interaction With the Oxygen Workflow

The `oxygen-deployment-1000084126.yml` workflow lives in:
- `buyflorabella` repo: at `.github/workflows/` root (on `dev`/`master`) AND inside `frontend/.github/workflows/` (source for shopify-promote)
- After mirror: identical copy in `boardmansgameremotedeveloper` repo

GitHub Actions workflows fire in the repo that owns them. When the mirror pushes `main` to `boardmansgameremotedeveloper`, the Oxygen workflow in `boardmansgameremotedeveloper` detects the `main` push and fires — using `OXYGEN_DEPLOYMENT_TOKEN_1000084126` stored as a secret **in `boardmansgameremotedeveloper`**.

The same workflow in `buyflorabella` does NOT fire for Oxygen (it has no `OXYGEN_DEPLOYMENT_TOKEN_1000084126` secret there), which is correct.

**Secret placement summary:**

| Secret | Repo | Purpose |
|---|---|---|
| `MIRROR_DEPLOY_KEY` | `buyflorabella/buyflorabella-marketohub-v2` | Mirror push access to boardmansgameremotedeveloper |
| `OXYGEN_DEPLOYMENT_TOKEN_1000084126` | `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` | Oxygen deployment from mirror repo |

---

## 5. Existing `.github/` Situation

The root-level `.github/workflows/oxygen-deployment-1000084126.yml` already exists on the `dev` branch (committed in task 6, commit `e852b1e`). The mirror workflow goes into the same directory:

```
.github/
└── workflows/
    ├── oxygen-deployment-1000084126.yml   ← existing (branches: [main] trigger, no-ops on dev/master)
    └── mirror-to-boardmansgame.yml        ← new (task 7)
```

The oxygen workflow trigger `branches: [main]` means it is inert on `dev` and `master` pushes. Only `main` pushes will activate it. In `buyflorabella` that's harmless (no Oxygen token there). In `boardmansgameremotedeveloper` it deploys to Oxygen when `main` is pushed by the mirror.

---

## 6. Required Secrets and Permissions

### 6.1 `buyflorabella/buyflorabella-marketohub-v2`

| Secret name | Value | Permission needed |
|---|---|---|
| `MIRROR_DEPLOY_KEY` | Private SSH key (ed25519) | Read access to this repo (automatic via `GITHUB_TOKEN`), write to mirror repo via deploy key |

### 6.2 `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`

| Secret name | Value | Permission needed |
|---|---|---|
| `OXYGEN_DEPLOYMENT_TOKEN_1000084126` | Shopify Oxygen deployment token | Write deployments permission in GitHub |

### 6.3 Deploy Key on `boardmansgameremotedeveloper`

The public key from the SSH pair must be added to `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`:
- Settings → Deploy keys → Add deploy key
- Title: `buyflorabella mirror`
- Key: `<public key content>`
- **Allow write access: YES**

---

## 7. Workflow YAML

**File:** `.github/workflows/mirror-to-boardmansgame.yml`

```yaml
name: Mirror to boardmansgameremotedeveloper

on:
  push:
    branches: ['**']
    tags: ['**']
  delete:

jobs:
  mirror:
    name: Mirror all refs to boardmansgameremotedeveloper
    runs-on: ubuntu-latest
    if: github.repository == 'buyflorabella/buyflorabella-marketohub-v2'

    steps:
      - name: Clone bare repository
        run: git clone --bare https://github.com/buyflorabella/buyflorabella-marketohub-v2.git

      - name: Push mirror
        run: |
          cd buyflorabella-marketohub-v2.git
          git push --mirror git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git
        env:
          GIT_SSH_COMMAND: >-
            ssh
            -i ${{ runner.temp }}/mirror_key
            -o StrictHostKeyChecking=accept-new
            -o IdentitiesOnly=yes

      - name: Write SSH key
        run: |
          mkdir -p ${{ runner.temp }}
          echo "${{ secrets.MIRROR_DEPLOY_KEY }}" > ${{ runner.temp }}/mirror_key
          chmod 600 ${{ runner.temp }}/mirror_key
        # Note: key is written before it's needed — step order matters (see note below)
```

**Note on step ordering:** The SSH key must be written before the push step uses it. In the YAML above, write the key BEFORE the push. Reorder if needed:

```yaml
    steps:
      - name: Write SSH key
        run: |
          mkdir -p ${{ runner.temp }}
          echo "${{ secrets.MIRROR_DEPLOY_KEY }}" > ${{ runner.temp }}/mirror_key
          chmod 600 ${{ runner.temp }}/mirror_key

      - name: Clone bare repository
        run: git clone --bare https://github.com/buyflorabella/buyflorabella-marketohub-v2.git

      - name: Push mirror
        run: |
          cd buyflorabella-marketohub-v2.git
          git push --mirror git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git
        env:
          GIT_SSH_COMMAND: >-
            ssh
            -i ${{ runner.temp }}/mirror_key
            -o StrictHostKeyChecking=accept-new
            -o IdentitiesOnly=yes
```

Add `workflow_dispatch:` trigger to allow manual runs (useful for initial sync and recovery):

```yaml
on:
  push:
    branches: ['**']
    tags: ['**']
  delete:
  workflow_dispatch:
```

---

## 8. Initial Setup Procedure

**One-time steps before the workflow can run.**

### Step 1 — Create `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`

If the mirror repo does not exist:
- Log in to GitHub as `boardmansgameremotedeveloper`
- Create a new empty repository named `buyflorabella-marketohub-v2`
- Do NOT initialize with a README (it will be overwritten by the mirror)

### Step 2 — Generate SSH key pair

```bash
ssh-keygen -t ed25519 -C "buyflorabella-mirror" -f ./mirror_key -N ""
# Creates mirror_key (private) and mirror_key.pub (public)
```

### Step 3 — Add public key to `boardmansgameremotedeveloper` repo

- GitHub: `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` → Settings → Deploy keys
- Add deploy key: title `buyflorabella mirror`, paste `mirror_key.pub` contents, **enable write access**

### Step 4 — Add private key as secret to `buyflorabella` repo

- GitHub: `buyflorabella/buyflorabella-marketohub-v2` → Settings → Secrets and variables → Actions
- New secret: name `MIRROR_DEPLOY_KEY`, value = contents of `mirror_key` (the private key)
- Delete local key files after saving: `rm mirror_key mirror_key.pub`

### Step 5 — Commit workflow file to `dev` branch

The workflow file goes at `.github/workflows/mirror-to-boardmansgame.yml` in the canonical repo.

```bash
# From dev/ worktree:
git add .github/workflows/mirror-to-boardmansgame.yml
git commit -m "task7: add mirror workflow to boardmansgameremotedeveloper"
```

### Step 6 — Initial full mirror

Before the workflow has ever run, `boardmansgameremotedeveloper` may be empty or out of date. Run the initial mirror manually:

```bash
# From any machine with SSH access to boardmansgameremotedeveloper:
git clone --bare https://github.com/buyflorabella/buyflorabella-marketohub-v2.git
cd buyflorabella-marketohub-v2.git
GIT_SSH_COMMAND="ssh -i /path/to/mirror_key -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes" \
  git push --mirror git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git
```

**Or:** push the workflow commit to `dev` in `buyflorabella` — the workflow itself will fire as its first run and perform the initial mirror.

### Step 7 — Set Oxygen deployment token in `boardmansgameremotedeveloper`

- GitHub: `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` → Settings → Secrets → Actions
- New secret: `OXYGEN_DEPLOYMENT_TOKEN_1000084126` (value from Shopify Admin)

### Step 8 — Connect Shopify to `boardmansgameremotedeveloper`

- Shopify Admin → Hydrogen → Storefront 1000084126
- Connect GitHub: `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`, branch `main`

---

## 9. Verification Procedure

### 9.1 Mirror Verification

1. In `buyflorabella` repo → Actions tab, confirm `Mirror to boardmansgameremotedeveloper` workflow appears
2. Push any commit to `dev` branch in `buyflorabella`
3. Workflow fires → green check
4. Verify in `boardmansgameremotedeveloper`: same commit SHA appears on `dev` branch

```bash
# Compare HEAD of each repo's dev branch:
curl -s https://api.github.com/repos/buyflorabella/buyflorabella-marketohub-v2/git/ref/heads/dev \
  | grep sha
curl -s https://api.github.com/repos/boardmansgameremotedeveloper/buyflorabella-marketohub-v2/git/ref/heads/dev \
  | grep sha
# SHAs must match
```

### 9.2 Oxygen Deployment Verification

1. Run `shopify-promote.sh` from `prod/` worktree → pushes to `origin/main` in `buyflorabella`
2. Mirror fires → `main` appears in `boardmansgameremotedeveloper`
3. Oxygen workflow fires in `boardmansgameremotedeveloper` → Actions tab shows deployment
4. Shopify Oxygen URL serves updated storefront

---

## 10. Recovery Procedures

### Mirror out of sync

Trigger the workflow manually:
- `buyflorabella/buyflorabella-marketohub-v2` → Actions → Mirror workflow → Run workflow

Or run the bare clone + push manually (see Step 6).

### `boardmansgameremotedeveloper` repo corrupted or accidentally modified

```bash
# Force-reset boardmansgameremotedeveloper from canonical source:
git clone --bare https://github.com/buyflorabella/buyflorabella-marketohub-v2.git
cd buyflorabella-marketohub-v2.git
GIT_SSH_COMMAND="ssh -i /path/to/mirror_key -o IdentitiesOnly=yes" \
  git push --mirror --force git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git
```

`--force` overrides any diverged state in the mirror. The canonical repo is always authoritative.

### Deploy key revoked or rotated

1. Generate new key pair (Step 2)
2. Remove old deploy key from `boardmansgameremotedeveloper` → Settings → Deploy keys
3. Add new public key (Step 3)
4. Update `MIRROR_DEPLOY_KEY` secret in `buyflorabella` (Step 4)

---

## 11. Open Questions

| # | Question | Impact |
|---|---|---|
| 1 | Does `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` exist? | Step 1 of setup is a no-op if it does |
| 2 | Is the canonical repo `buyflorabella/buyflorabella-marketohub-v2` public or private? | If private, clone in workflow needs auth (add `secrets.GITHUB_TOKEN` to clone step) |
| 3 | Does `boardmansgameremotedeveloper` have Shopify app authorization to connect repos to Oxygen? | Required for Step 8; Shopify Partner approval may be needed |

---

## 12. Deliverables

| Deliverable | Location | Status |
|---|---|---|
| Mirror workflow YAML | `.github/workflows/mirror-to-boardmansgame.yml` | To be created in execution |
| `MIRROR_DEPLOY_KEY` secret | `buyflorabella` → Settings → Secrets | Human setup (Steps 2–4) |
| `OXYGEN_DEPLOYMENT_TOKEN_1000084126` secret | `boardmansgameremotedeveloper` → Settings → Secrets | Human setup (Step 7) |
| Initial mirror | One-time git operation | Human or automated via first push |
| Shopify connection | Shopify Admin | Human setup (Step 8) |
