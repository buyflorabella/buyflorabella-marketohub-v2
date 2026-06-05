#!/usr/bin/env bash
set -e

# Shopify Oxygen Promote
# Copies frontend/ from master branch into the main/ worktree (flat Hydrogen-at-root structure),
# commits, and pushes origin/main — triggering the Oxygen deployment workflow.
#
# Must be run from the prod/ worktree (master branch).
# The main/ worktree at /var/www/html/buyflorabella/main must already exist.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"

MAIN_WORKTREE="/var/www/html/buyflorabella/main"
FRONTEND_SRC="${PROJECT_ROOT}/frontend"

# ── Helpers ───────────────────────────────────────────────────────────────────

log_info()    { echo "[INFO] $*"; }
log_success() { echo "✅  $*"; }
log_warn()    { echo "[WARN] $*"; }
log_error()   { echo "❌  $*" >&2; }
log_phase()   {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📍 $*"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

confirm() {
  local reply
  read -r -p "👉 $1 (y/n) " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

# ── Guards ────────────────────────────────────────────────────────────────────

if [[ "${_WORKTREE}" != "prod" ]]; then
  log_error "shopify-promote.sh must be run from the prod/ worktree only"
  log_error "Current worktree: ${_WORKTREE}"
  exit 1
fi

cd "${PROJECT_ROOT}"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "${CURRENT_BRANCH}" != "master" ]]; then
  log_error "prod/ worktree is not on master branch (currently on: ${CURRENT_BRANCH})"
  log_error "Run update-production.sh first to ensure master is up to date."
  exit 1
fi

if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
  log_error "Uncommitted changes in prod/ working directory. Commit or stash them first."
  exit 1
fi

if [[ ! -d "${MAIN_WORKTREE}" ]]; then
  log_error "main/ worktree not found at ${MAIN_WORKTREE}"
  log_error "Set it up with: git worktree add /var/www/html/buyflorabella/main main"
  exit 1
fi

if [[ ! -d "${FRONTEND_SRC}" ]]; then
  log_error "frontend/ directory not found at ${FRONTEND_SRC}"
  exit 1
fi

# Force git to use the deploy key if configured
_SETTINGS_FILE="${SCRIPT_DIR}/settings.prod.txt"
if [[ -f "${_SETTINGS_FILE}" ]]; then
  source "${_SETTINGS_FILE}"
  if [[ -n "${GITHUB_DEPLOY_KEY:-}" && -f "${GITHUB_DEPLOY_KEY}" ]]; then
    export GIT_SSH_COMMAND="ssh -i ${GITHUB_DEPLOY_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  fi
fi

SOURCE_SHA=$(git rev-parse --short HEAD)

log_info "Shopify Oxygen Promote"
log_info "Source: master@${SOURCE_SHA} → ${FRONTEND_SRC}/"
log_info "Target: ${MAIN_WORKTREE}/ (main branch)"
echo ""

# ── Phase 1: Rsync frontend/ into main/ worktree ─────────────────────────────

log_phase "PHASE 1: Sync frontend/ → main/ worktree"

log_info "Rsyncing frontend/ contents into main/ worktree..."
log_info "(excludes: node_modules, .env files, build artifacts)"
echo ""

rsync -a --delete --omit-dir-times \
  --exclude='node_modules/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='.cache/' \
  --exclude='/build/' \
  --exclude='/dist/' \
  --exclude='/.react-router/' \
  --exclude='/.shopify/' \
  "${FRONTEND_SRC}/" "${MAIN_WORKTREE}/"

log_success "Rsync complete"
echo ""

# ── Phase 2: Inspect and confirm ─────────────────────────────────────────────

log_phase "PHASE 2: Inspect main/ worktree"

log_info "Top-level structure of main/ after sync:"
ls "${MAIN_WORKTREE}/"
echo ""

# Verify Hydrogen app structure at root
MISSING=()
for required in "app" "server.ts" "package.json" "vite.config.ts"; do
  [[ -e "${MAIN_WORKTREE}/${required}" ]] || MISSING+=("${required}")
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  log_error "Required Hydrogen files missing from main/: ${MISSING[*]}"
  log_error "Aborting — frontend/ may not have been synced correctly."
  exit 1
fi
log_success "Hydrogen app structure confirmed at root (app/, server.ts, package.json, vite.config.ts)"

# Verify workflow file is present
WORKFLOW_FILE="${MAIN_WORKTREE}/.github/workflows/oxygen-deployment-1000084126.yml"
if [[ ! -f "${WORKFLOW_FILE}" ]]; then
  log_warn "Oxygen workflow file not found at .github/workflows/oxygen-deployment-1000084126.yml"
  log_warn "GitHub Actions will NOT trigger without it. Check frontend/.github/workflows/."
else
  log_success "Oxygen workflow file present"
fi

# Verify no VPS-only directories leaked into main/
for forbidden in "backend" "script" "apache" "systemd"; do
  if [[ -d "${MAIN_WORKTREE}/${forbidden}" ]]; then
    log_error "VPS directory '${forbidden}/' found in main/ — this should not be deployed to Oxygen."
    log_error "Check rsync source path: should be frontend/, not project root."
    exit 1
  fi
done
log_success "No VPS-only directories in main/ (backend/, script/, apache/, systemd/ absent)"

echo ""

# ── Phase 3: Commit ───────────────────────────────────────────────────────────

log_phase "PHASE 3: Commit to main branch"

cd "${MAIN_WORKTREE}"

if [[ -z $(git status --porcelain 2>/dev/null) ]]; then
  log_warn "No changes detected in main/ — frontend/ is already in sync with main branch."
  log_warn "Nothing to commit. Exiting."
  exit 0
fi

log_info "Changes staged for commit:"
git status --short | head -30
echo ""

COMMIT_MSG="shopify-promote: from master@${SOURCE_SHA}"
git add -A
git commit -m "${COMMIT_MSG}"
log_success "Committed: ${COMMIT_MSG}"
echo ""

log_info "Recent main branch history:"
git log --oneline -5
echo ""

# ── Phase 4: Push ─────────────────────────────────────────────────────────────

log_phase "PHASE 4: Push to GitHub"

DEPLOY_REMOTE="git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git"

log_warn "Pushing main to both repos will trigger the Oxygen deployment workflow."
log_warn "Ensure Shopify Admin has been configured (Block 5 in task6_plan.md):"
log_warn "  - Storefront 1000084126 connected to boardmansgameremotedeveloper/buyflorabella-marketohub-v2"
log_warn "  - OXYGEN_DEPLOYMENT_TOKEN_1000084126 set as GitHub secret in boardmansgameremotedeveloper"
log_warn "  - All env vars configured in Oxygen dashboard"
echo ""

_SSH_OK=false
_GIT_CHECK=$(git ls-remote origin HEAD 2>&1)
if [[ $? -eq 0 ]]; then
  _SSH_OK=true
  log_success "Push access to origin confirmed"
else
  log_warn "Cannot reach origin: ${_GIT_CHECK}"
fi

if ! $_SSH_OK; then
  log_warn "SSH unavailable — commit is local only."
  log_info "To push when SSH is available:"
  log_info "  cd ${MAIN_WORKTREE} && git push origin main"
  log_info "  git -C ${MAIN_WORKTREE} push ${DEPLOY_REMOTE} main"
  exit 0
fi

if ! confirm "Push main to GitHub? This triggers Oxygen deployment at buyflorabella.com."; then
  log_info "Push cancelled. Commit is local. Run when ready:"
  log_info "  cd ${MAIN_WORKTREE} && git push origin main"
  log_info "  git -C ${MAIN_WORKTREE} push ${DEPLOY_REMOTE} main"
  exit 0
fi

git push origin main
log_success "Pushed origin/main (buyflorabella)"

git push "${DEPLOY_REMOTE}" main
log_success "Pushed to boardmansgameremotedeveloper — Oxygen deployment triggered"
echo ""
log_info "Monitor deployment: GitHub → boardmansgameremotedeveloper/buyflorabella-marketohub-v2 → Actions tab"
