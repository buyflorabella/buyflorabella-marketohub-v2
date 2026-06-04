#!/usr/bin/env bash
set -e

# Production Change Comparator
# Runs in prod/ worktree only
#
# Phases:
#   0. Merge dev → master  (replaces the manual Bitbucket PR step)
#   1. Pre-update validation
#   2. Code update + test
#   3. Install frontend + restart backend

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"

# Guard: this script must run in prod/ worktree only
if [[ "${_WORKTREE}" != "prod" ]]; then
  echo "ERROR: update-production.sh must be run from the prod/ worktree only" >&2
  echo "Current worktree: ${_WORKTREE}" >&2
  exit 1
fi

# Load settings
_SETTINGS_FILE="${SCRIPT_DIR}/settings.prod.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

# ── Helpers ───────────────────────────────────────────────────────────────────

log_info() { echo "[INFO] $*"; }

log_phase() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📍 $*"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

log_success() { echo "✅ $*"; }
log_error()   { echo "❌ $*" >&2; }

prompt_continue() {
  local msg="$1"
  local reply
  read -r -p "👉 ${msg} (y/n/abort) " reply
  case "$reply" in
    [Yy]) return 0 ;;
    [Nn]) return 1 ;;
    [Aa]*) log_error "Aborted by operator"; exit 1 ;;
    *) prompt_continue "$msg" ;;
  esac
}

confirm() {
  local reply
  read -r -p "👉 $1 (y/n) " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

# ── Preflight ─────────────────────────────────────────────────────────────────

cd "${PROJECT_ROOT}"

log_info "PulseComposer Production Update Orchestrator"
log_info "Started at $(date '+%Y-%m-%d %H:%M:%S')"

if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
  log_error "Uncommitted changes in prod/ working directory. Please commit or stash them first."
  exit 1
fi

if [[ -n $(git ls-files --others --exclude-standard) ]]; then
  log_error "Untracked files in prod/ working directory. Please handle them first."
  exit 1
fi

log_success "Working directory is clean"

# ============================================================================
# PHASE 0: Merge dev → master
# ============================================================================

log_phase "PHASE 0: Merge dev → master"

log_info "Fetching all remotes..."
git fetch --all --prune 2>&1 | sed 's/^/  /'
echo ""

# Ensure local dev branch exists
if ! git show-ref --verify --quiet refs/heads/dev; then
  log_error "Local dev branch does not exist"
  exit 1
fi

UNMERGED=$(git log master..dev --oneline 2>/dev/null || true)

if [[ -z "$UNMERGED" ]]; then
  log_success "master is already up to date with dev — no merge needed"
else
  COMMIT_COUNT=$(echo "$UNMERGED" | wc -l | tr -d ' ')
  log_info "${COMMIT_COUNT} commit(s) in dev not yet in master:"
  echo ""
  git log master..dev --oneline --format="  %C(yellow)%h%Creset  %ad  %s" --date=short 2>/dev/null \
    || echo "$UNMERGED" | sed 's/^/  /'
  echo ""

  if ! confirm "Merge these commits from dev into master now?"; then
    log_error "Cannot deploy without merging dev into master. Aborting."
    exit 1
  fi

  echo ""
  log_info "Merging dev into master..."

  if ! git merge dev --no-edit; then
    echo ""
    log_error "Merge conflict. Resolve conflicts manually, then re-run."
    log_info "Commands:"
    log_info "  git status               — see conflicting files"
    log_info "  git add <file>           — mark resolved"
    log_info "  git merge --continue     — finish the merge"
    log_info "  git merge --abort        — cancel"
    exit 1
  fi

  log_success "Merged dev into master"
  echo ""

  log_info "Pushing master to origin..."
  git push origin master
  log_success "master pushed to origin"
fi

# Reload settings — they may have changed after the merge (e.g. VERSION_MINOR bump)
source "${_SETTINGS_FILE}"

# ============================================================================
# PHASE 1: VALIDATION (Pre-update inspection)
# ============================================================================

log_phase "PHASE 1: Pre-Update Validation"

MAJOR="${VERSION_MAJOR}"
MINOR="${VERSION_MINOR}"
BUILD="${VERSION_BUILD_NUMBER}"

log_info "Version being deployed: v${MAJOR}.${MINOR}.${BUILD}"
echo ""

log_info "Starting React dev server on port ${FRONTEND_PORT}..."
log_info "(Shows the current frontend code before full deploy)"
echo ""

"${SCRIPT_DIR}/run-frontend.sh" &
FRONTEND_PID=$!
sleep 3

log_success "React dev server started (PID: ${FRONTEND_PID})"
log_info "Visit: https://frontend.pulsecomposer.boardmansgame.com"
echo ""

if ! prompt_continue "Frontend started. Can you reach it? Continue?"; then
  kill $FRONTEND_PID 2>/dev/null || true
  log_error "Frontend validation failed. Aborting."
  exit 1
fi

log_info "Stopping production backend service..."
sudo systemctl stop pulsecomposer
log_success "Backend stopped"

log_info "Starting Flask dev server on port ${BACKEND_PORT}..."
"${SCRIPT_DIR}/run-backend.sh" &
BACKEND_PID=$!
sleep 3

log_success "Flask dev server started (PID: ${BACKEND_PID})"
log_info "Backend is now running on http://127.0.0.1:${BACKEND_PORT}"
echo ""

if ! prompt_continue "Backend running. Continue to code update?"; then
  log_info "Keeping servers running for manual inspection. Exiting."
  log_info "When done: kill ${FRONTEND_PID} ${BACKEND_PID}"
  exit 0
fi

# ============================================================================
# PHASE 2: CODE UPDATE
# ============================================================================

log_phase "PHASE 2: Code Update"

log_info "Pulling latest master (should be fast-forward after Phase 0 merge)..."
git pull origin master
log_success "Code updated"

log_info "Restarting Flask dev server with new code..."
kill $BACKEND_PID 2>/dev/null || true
wait $BACKEND_PID 2>/dev/null || true
"${SCRIPT_DIR}/run-backend.sh" &
BACKEND_PID=$!
sleep 2
log_success "Flask dev server restarted with new code"

echo ""
log_info "Running validation tests..."
if [[ -f "${SCRIPT_DIR}/run-tests.sh" ]]; then
  if "${SCRIPT_DIR}/run-tests.sh"; then
    log_success "Validation tests passed"
  else
    log_error "Validation tests failed"
    if ! prompt_continue "Tests failed. Continue anyway?"; then
      log_info "Keeping servers running for debugging. Exiting."
      log_info "When done: kill ${FRONTEND_PID} ${BACKEND_PID}"
      exit 1
    fi
  fi
else
  log_info "No test script found at ${SCRIPT_DIR}/run-tests.sh — skipping"
fi

echo ""
log_info "Inspect the running site:"
log_info "  Backend:  http://127.0.0.1:${BACKEND_PORT}"
log_info "  Frontend: https://frontend.pulsecomposer.boardmansgame.com"
echo ""

if ! prompt_continue "Code looks good? Ready to build frontend and restart backend service?"; then
  log_info "Keeping servers running for manual inspection. Exiting."
  log_info "When done: kill ${FRONTEND_PID} ${BACKEND_PID}"
  exit 1
fi

# ============================================================================
# PHASE 3: INSTALL & RESTART
# ============================================================================

log_phase "PHASE 3: Install Frontend & Restart Backend"

log_info "Stopping React dev server..."
kill $FRONTEND_PID 2>/dev/null || true
wait $FRONTEND_PID 2>/dev/null || true
log_success "React dev server stopped"

log_info "Building production React SPA..."
"${SCRIPT_DIR}/deploy-frontend.sh"
log_success "Frontend built to frontend/build/"

log_info "Stopping Flask dev server..."
kill $BACKEND_PID 2>/dev/null || true
wait $BACKEND_PID 2>/dev/null || true
log_success "Flask dev server stopped"

log_info "Starting production backend service (systemd)..."
sudo systemctl start pulsecomposer
sleep 2
log_success "Production backend service started"

echo ""
log_info "Final verification:"
log_info "  Production site: https://pulsecomposer.boardmansgame.com"
log_info "  Admin:           https://admin.pulsecomposer.boardmansgame.com"
echo ""

if prompt_continue "Production is live. Verification successful?"; then
  log_success "Update complete"
else
  log_error "Verification failed. Manual intervention may be needed."
  exit 1
fi

# ============================================================================
# COMPLETE
# ============================================================================

log_phase "UPDATE COMPLETE"

source "${_SETTINGS_FILE}"
PRODUCTION_VERSION="v${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_BUILD_NUMBER}"

log_success "Production is now running: ${PRODUCTION_VERSION}"
log_info "Finished at $(date '+%Y-%m-%d %H:%M:%S')"
echo ""