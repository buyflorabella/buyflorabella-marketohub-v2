#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# CLEAN PRODUCTION UPDATE ORCHESTRATOR (STABLE WORKTREE MODEL)
# dev → main → origin
# NO rsync
# NO filesystem mutation outside git
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

log() { echo "[INFO] $*"; }
warn() { echo "[WARN] $*"; }
err() { echo "[ERROR] $*" >&2; }

# ─────────────────────────────────────────────────────────────
# SAFETY CHECKS
# ─────────────────────────────────────────────────────────────

if [[ -n "$(git status --porcelain)" ]]; then
  err "Working tree is not clean. Commit or stash first."
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "master" && "$CURRENT_BRANCH" != "prod" ]]; then
  warn "Running from branch: $CURRENT_BRANCH"
fi

# ─────────────────────────────────────────────────────────────
# FETCH LATEST
# ─────────────────────────────────────────────────────────────

log "Fetching origin..."
git fetch origin --prune || warn "Fetch failed (continuing local-only mode)"

# ─────────────────────────────────────────────────────────────
# VALIDATE BRANCHES
# ─────────────────────────────────────────────────────────────

git show-ref --verify --quiet refs/heads/dev || {
  err "dev branch missing"
  exit 1
}

git show-ref --verify --quiet refs/heads/main || {
  err "main branch missing"
  exit 1
}

# ─────────────────────────────────────────────────────────────
# DIFF CHECK
# ─────────────────────────────────────────────────────────────

UNMERGED=$(git log main..dev --oneline || true)

if [[ -z "$UNMERGED" ]]; then
  log "main already up to date with dev"
  exit 0
fi

echo ""
log "Commits to merge:"
echo "$UNMERGED" | sed 's/^/  - /'
echo ""

read -r -p "Merge dev → main? (y/n) " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || exit 1

# ─────────────────────────────────────────────────────────────
# MERGE DEV → MAIN
# ─────────────────────────────────────────────────────────────

log "Checking out main..."
git checkout main

log "Merging dev → main..."
if ! git merge dev --no-edit; then
  err "Merge conflict detected. Resolve manually."
  exit 1
fi

log "Merge successful"

# ─────────────────────────────────────────────────────────────
# PUSH MAIN
# ─────────────────────────────────────────────────────────────

log "Pushing main to origin..."
git push origin main

# ─────────────────────────────────────────────────────────────
# OPTIONAL TAG (safe rollback point)
# ─────────────────────────────────────────────────────────────

TAG="release-$(date +%Y%m%d-%H%M%S)"
git tag "$TAG" || true
git push origin "$TAG" || true

log "Tagged release: $TAG"

# ─────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────

echo ""
log "UPDATE COMPLETE"
log "dev → main → origin synced successfully"
log "Shopify/Oxygen deploy should trigger from main branch push"