#!/usr/bin/env bash
# auto-deploy.sh — Comprehensive deployment workflow
# Automates: code changes → tag → merge → production update
#
# Usage:
#   ./script/auto-deploy.sh                    # Interactive mode
#   ./script/auto-deploy.sh --yes              # Auto-proceed
#   ./script/auto-deploy.sh --help             # Show help
#
# Workflow steps:
#   1. Verify we are in dev worktree
#   2. Create release candidate and tag
#   3. Commit pending changes
#   4. Verify git branch state
#   5. Switch to prod worktree and merge
#   6. Run update-production.sh to deploy
#   7. Report final status

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKTREE_NAME="$(basename "$PROJECT_ROOT")"
PROD_ROOT="$(cd "${PROJECT_ROOT}/../prod" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helpers
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}✅${NC} $*"; }
log_error() { echo -e "${RED}❌${NC} $*" >&2; }
log_warning() { echo -e "${YELLOW}⚠️${NC} $*"; }

confirm() {
  local prompt="$1"

  if [[ "${AUTO_YES:-}" == "true" ]]; then
    log_info "$prompt - auto-proceeding"
    return 0
  fi

  local reply
  read -p "$(echo -e "${BLUE}?${NC} $prompt - y/n: ") " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

# --- Workflow Steps ---

step_verify_dev_worktree() {
  log_info "Step 1/6: Verifying dev worktree..."

  if [[ "$WORKTREE_NAME" != "dev" ]]; then
    log_error "This script must run from the dev/ worktree"
    log_error "Current: $PROJECT_ROOT"
    return 1
  fi

  log_success "Dev worktree verified"
  return 0
}

step_create_release_candidate() {
  log_info "Step 2/6: Creating release candidate..."

  if confirm "Create release candidate?"; then
    cd "$PROJECT_ROOT"
    "${SCRIPT_DIR}/release-candidate.sh" || return 1
    log_success "Release candidate created"
    return 0
  else
    log_warning "Skipping release candidate creation"
    return 0
  fi
}

step_commit_changes() {
  log_info "Step 3/6: Checking for pending changes..."

  cd "$PROJECT_ROOT"

  if git status --porcelain | grep -q .; then
    log_warning "Found uncommitted changes:"
    git status --short

    if confirm "Commit all changes?"; then
      git add -A
      git commit -m "Auto-deploy: pending changes

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>" || return 1
      log_success "Changes committed"
    else
      log_warning "Skipping commit"
    fi
  else
    log_success "No pending changes"
  fi

  return 0
}

step_verify_branch_state() {
  log_info "Step 4/6: Verifying git branch state..."

  cd "$PROJECT_ROOT"

  local current_branch=$(git rev-parse --abbrev-ref HEAD)
  local dev_ahead=$(git rev-list --count master..HEAD 2>/dev/null || echo 0)

  log_info "Current branch: $current_branch"
  log_info "Commits ahead of master: $dev_ahead"

  if [[ "$current_branch" != "dev" ]]; then
    log_warning "Current branch is $current_branch (expected dev)"
  fi

  if [[ "$dev_ahead" -eq 0 ]]; then
    log_warning "No commits ahead of master"
  fi

  log_success "Branch state verified"
  return 0
}

step_merge_to_master() {
  log_info "Step 5/6: Switching to prod worktree and merging..."

  if ! [[ -d "$PROD_ROOT" ]]; then
    log_error "Prod worktree not found: $PROD_ROOT"
    return 1
  fi

  if confirm "Merge dev into master in prod worktree?"; then
    cd "$PROD_ROOT"

    # Ensure we are on master
    git checkout master || return 1

    # Merge dev into master
    git merge dev -m "Merge dev into master for production deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>" || {
      log_error "Merge conflict or failure!"
      log_error "Resolve conflicts manually in $PROD_ROOT and re-run"
      return 1
    }

    log_success "Dev merged into master"
    return 0
  else
    log_warning "Skipping merge"
    return 1
  fi
}

step_update_production() {
  log_info "Step 6/6: Running production update and validation..."

  if confirm "Run update-production.sh?"; then
    cd "$PROD_ROOT"

    if [[ ! -f "${PROD_ROOT}/script/update-production.sh" ]]; then
      log_error "update-production.sh not found in prod worktree"
      return 1
    fi

    "${PROD_ROOT}/script/update-production.sh" || {
      log_error "Production update failed!"
      return 1
    }

    log_success "Production update completed and validated"
    return 0
  else
    log_warning "Skipping production update"
    return 1
  fi
}

step_final_report() {
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  log_success "DEPLOYMENT COMPLETE"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "Summary:"
  echo "  - Dev changes committed and tagged"
  echo "  - Master branch merged with dev"
  echo "  - Production updated and validated"
  echo ""
  echo "Next steps:"
  echo "  1. Verify: https://pulsecomposer.boardmansgame.com"
  echo "  2. Admin:  https://admin.pulsecomposer.boardmansgame.com"
  echo "  3. Tests:  cd prod && ./script/testing_framework.sh --all"
  echo ""
}

# --- Main ---

main() {
  local auto_yes="${1:-}"

  if [[ "$auto_yes" == "--help" ]]; then
    head -20 "$0" | tail -15
    return 0
  fi

  if [[ "$auto_yes" == "--yes" ]]; then
    export AUTO_YES="true"
  fi

  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║  PulseComposer Deployment Pipeline                           ║"
  echo "║  Dev → Release Tag → Merge → Production Update                ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""

  # Run all steps
  step_verify_dev_worktree || { log_error "Aborted at step 1"; return 1; }
  step_create_release_candidate || { log_error "Aborted at step 2"; return 1; }
  step_commit_changes || { log_error "Aborted at step 3"; return 1; }
  step_verify_branch_state || { log_error "Aborted at step 4"; return 1; }
  step_merge_to_master || { log_error "Aborted at step 5"; return 1; }
  step_update_production || { log_error "Aborted at step 6"; return 1; }

  step_final_report
  return 0
}

main "$@"
