# TASK Outcome

_Overwritten after every significant task._

**Last task:** Task 7 — GitHub Repository Mirror
**Date:** 2026-06-05
**Status:** DONE (code complete; human setup steps remaining)
**Commit:** `8be725e`
**Deliverable:** `.github/workflows/mirror-to-boardmansgame.yml`

Mirror workflow committed to `dev` branch. Fires on every push/delete/tag in `buyflorabella/buyflorabella-marketohub-v2`, clones bare and pushes `--mirror` to `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` via SSH deploy key.

**Human steps remaining (in order):**
1. Create `boardmansgameremotedeveloper/buyflorabella-marketohub-v2` on GitHub (if absent)
2. Generate SSH key pair: `ssh-keygen -t ed25519 -C "buyflorabella-mirror" -f ./mirror_key -N ""`
3. Add public key as deploy key (write access) on `boardmansgameremotedeveloper` repo
4. Add private key as `MIRROR_DEPLOY_KEY` secret in `buyflorabella` repo
5. Push `dev` branch to GitHub (when SSH available)
6. Trigger workflow manually or let first push trigger it
7. Set `OXYGEN_DEPLOYMENT_TOKEN_1000084126` secret in `boardmansgameremotedeveloper` repo
8. Connect Shopify to `boardmansgameremotedeveloper/buyflorabella-marketohub-v2`, branch `main`

**Next:** Human steps 1–8, then first `shopify-promote.sh` run to validate full chain.
