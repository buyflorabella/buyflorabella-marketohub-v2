# Task 7 Outcome — GitHub Repository Mirror

**Status:** DONE (code complete; human setup steps remaining)
**Date:** 2026-06-05
**Executed by:** Claude Sonnet 4.6
**Commit:** `8be725e`

---

## What Was Executed

One file created and committed to `dev` branch:

**`.github/workflows/mirror-to-boardmansgame.yml`** — GitHub Actions workflow that automatically mirrors all branches, tags, and refs from `buyflorabella/buyflorabella-marketohub-v2` to `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` on every push.

---

## Workflow Summary

| Property | Value |
|---|---|
| Trigger | `push` to any branch/tag, `delete`, `workflow_dispatch` |
| Guard | `if: github.repository == 'buyflorabella/buyflorabella-marketohub-v2'` |
| Method | `git clone --bare` + `git push --mirror` |
| Auth | SSH deploy key (`secrets.MIRROR_DEPLOY_KEY`) |
| Target | `git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git` |

**Step order (correct):** Write SSH key → Clone bare → Push mirror

---

## Human Setup Steps Required Before First Run

All of these must be completed before the workflow can succeed.

### Step 1 — Create mirror repo (if it doesn't exist)
Log in to GitHub as `boardmansgameremotedeveloper`, create empty repo named `buyflorabella-marketohub-v2`. Do NOT initialize with README.

### Step 2 — Generate SSH key pair
```bash
ssh-keygen -t ed25519 -C "buyflorabella-mirror" -f ./mirror_key -N ""
# Produces: mirror_key (private), mirror_key.pub (public)
```

### Step 3 — Add public key to mirror repo as deploy key (write access)
`boardmansgameremotedeveloper/buyflorabella-marketohub-v2` → Settings → Deploy keys → Add deploy key
- Title: `buyflorabella mirror`
- Key: contents of `mirror_key.pub`
- **Allow write access: YES**

### Step 4 — Add private key as secret to canonical repo
`buyflorabella/buyflorabella-marketohub-v2` → Settings → Secrets and variables → Actions → New secret
- Name: `MIRROR_DEPLOY_KEY`
- Value: full contents of `mirror_key` (including header/footer lines)

Delete local key files after: `rm mirror_key mirror_key.pub`

### Step 5 — Push `dev` branch to GitHub (when SSH available)
The workflow file is committed locally but not yet on GitHub. Push when SSH is restored:
```bash
git push origin dev
```

### Step 6 — Initial full mirror (first run)
Either trigger manually from GitHub Actions UI (`workflow_dispatch`), or let the first `dev` push trigger it automatically.

### Step 7 — Set Oxygen token in mirror repo
`boardmansgameremotedeveloper/buyflorabella-marketohub-v2` → Settings → Secrets → Actions
- Name: `OXYGEN_DEPLOYMENT_TOKEN_1000084126`
- Value: Shopify Oxygen deployment token for storefront 1000084126

### Step 8 — Connect Shopify to mirror repo
Shopify Admin → Hydrogen → Storefront 1000084126
- Connect GitHub: `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`, branch `main`

---

## Verification

After setup, verify the mirror works:

```bash
# Compare dev branch HEAD in both repos (SHAs must match):
curl -s https://api.github.com/repos/buyflorabella/buyflorabella-marketohub-v2/git/ref/heads/dev | grep sha
curl -s https://api.github.com/repos/boardmansgameremotedeveloper/buyflorabella-marketohub-v2/git/ref/heads/dev | grep sha
```

Then run `shopify-promote.sh` → verify mirror fires → verify Oxygen workflow fires in `boardmansgameremotedeveloper` → verify storefront updates at `buyflorabella.com`.

---

## Recovery

**Mirror out of sync:** Trigger `workflow_dispatch` in `buyflorabella` → Actions → Mirror workflow.

**Mirror repo corrupted:** Manually run bare clone + `--force` mirror (see task7_design_doc.md section 10).

**Deploy key rotated:** Generate new pair, update deploy key in `boardmansgameremotedeveloper`, update `MIRROR_DEPLOY_KEY` secret in `buyflorabella`.

---

## Full Deployment Chain (Post-Setup)

```
shopify-promote.sh (prod/ worktree)
  → git push origin main   [buyflorabella]
  → mirror workflow fires  [buyflorabella Actions]
  → git push --mirror      [→ boardmansgameremotedeveloper]
  → oxygen workflow fires  [boardmansgameremotedeveloper Actions]
  → npx shopify hydrogen deploy
  → buyflorabella.com
```
