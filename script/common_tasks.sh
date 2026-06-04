#!/usr/bin/env bash
# common_tasks.sh — Workflow-level task runner
#
# Each task represents a real developer operation, abstracted from the
# underlying scripts. Claude and developers use the same entrypoint.
#
# Usage:
#   ./script/common_tasks.sh --list
#   ./script/common_tasks.sh --run <task> [--yes]
#   ./script/common_tasks.sh --help
#
# Tasks:
#   increment-build   Bump build number, deploy to production, verify version
#   deploy            Merge dev → master, build frontend, restart backend, verify
#   health-check      Smoke-test all production endpoints and service status

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKTREE_NAME="$(basename "${PROJECT_ROOT}")"
PROD_ROOT="$(cd "${PROJECT_ROOT}/../prod" && pwd)"

# --- Settings ---
_SETTINGS_FILE="${SCRIPT_DIR}/settings.${WORKTREE_NAME}.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

# Production API URL — read from prod settings regardless of which worktree we run from
_PROD_SETTINGS="${PROD_ROOT}/script/settings.prod.txt"
if [[ -f "${_PROD_SETTINGS}" ]]; then
  PROD_API_BASE_URL="$(grep '^API_BASE_URL=' "${_PROD_SETTINGS}" | cut -d'"' -f2)"
fi
PROD_API_BASE_URL="${PROD_API_BASE_URL:-https://admin.pulsecomposer.com}"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- Helpers ---
log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $*"; }
log_error()   { echo -e "${RED}[FAIL]${NC} $*" >&2; }
log_step()    { echo -e "\n${CYAN}──── $* ${NC}"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }

confirm() {
  local msg="$1"
  if [[ "${AUTO_YES:-false}" == "true" ]]; then
    log_info "${msg} — proceeding (--yes)"
    return 0
  fi
  local reply
  read -p "$(echo -e "${BLUE}?${NC} ${msg} [y/n]: ")" reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

require_dev_worktree() {
  if [[ "${WORKTREE_NAME}" != "dev" ]]; then
    log_error "common_tasks.sh must run from the dev/ worktree"
    log_error "Current: ${PROJECT_ROOT}"
    exit 1
  fi
}

# --- Task Registry ---
# Each entry: "task-name|One-line description"

TASK_REGISTRY=(
  "increment-build|Bump build number, deploy to production, verify version"
  "deploy|Merge dev → master, build frontend, restart backend, verify"
  "health-check|Smoke-test all production endpoints and service status"
)

list_tasks() {
  echo ""
  echo "Available tasks:"
  echo ""
  local max_name=0
  for entry in "${TASK_REGISTRY[@]}"; do
    local name="${entry%%|*}"
    [[ ${#name} -gt $max_name ]] && max_name=${#name}
  done
  for entry in "${TASK_REGISTRY[@]}"; do
    local name="${entry%%|*}"
    local desc="${entry##*|}"
    printf "  ${CYAN}%-${max_name}s${NC}  %s\n" "$name" "$desc"
  done
  echo ""
  echo "Usage: ./script/common_tasks.sh --run <task> [--yes]"
  echo ""
}

# ============================================================================
# Test suites (test IDs safe to run in each environment)
# ============================================================================

# All tests that run against the dev backend (boardmansgame.com domain)
DEPLOY_SUITE_DEV=("tc_0001" "tc_0002" "tc_0003" "tc_0004" "tc_0005")

# Tests safe to run against production (no destructive DB pre-setup)
# tc_0006 = prod health check; tc_0001 = OTP auth; tc_0008 = login acceptance (project owner)
DEPLOY_SUITE_PROD=("tc_0006" "tc_0001" "tc_0008")

# --- Validation helpers ---

# run_validation_suite LABEL ENV_MODE TC_IDS...
#   ENV_MODE: "dev" | "prod"
#   Writes per-test results to SUITE_RESULTS_FILE (global).
#   Sets SUITE_PASSED / SUITE_FAILED (globals).
#   Returns 0 if all pass, 1 if any fail.
run_validation_suite() {
  local label="$1"
  local env_mode="$2"
  shift 2
  local -a suite=("$@")

  local env_flag=""
  [[ "${env_mode}" == "prod" ]] && env_flag="--env prod"

  local passed=0 failed=0
  SUITE_RESULTS_FILE=$(mktemp)

  log_step "${label}"
  cd "${PROJECT_ROOT}"

  for tc in "${suite[@]}"; do
    local exit_code=0
    # set +e so a failing test doesn't abort the script
    set +e
    "${SCRIPT_DIR}/testing_framework.sh" --frontend ${env_flag} --run "${tc}"
    exit_code=$?
    set -e

    local log_path
    log_path=$(ls -t "${PROJECT_ROOT}/frontend/test_cases/logs/runs/${tc}_"*.md 2>/dev/null | head -1 || echo "no-log")

    if [[ $exit_code -eq 0 ]]; then
      ((passed++)) || true
      echo "PASS|${tc}|${log_path}" >> "${SUITE_RESULTS_FILE}"
    else
      ((failed++)) || true
      echo "FAIL|${tc}|${log_path}" >> "${SUITE_RESULTS_FILE}"
    fi
  done

  SUITE_PASSED=$passed
  SUITE_FAILED=$failed

  echo ""
  if [[ $failed -eq 0 ]]; then
    log_success "${label}: ${passed}/${#suite[@]} PASS"
  else
    log_error "${label}: ${passed}/${#suite[@]} PASS — ${failed} FAILED"
  fi

  [[ $failed -eq 0 ]]
}

# write_deploy_report TIMESTAMP VERSION PRE_RESULTS_FILE POST_RESULTS_FILE
# Writes frontend/test_cases/logs/deploy_TIMESTAMP.md and prints the path.
write_deploy_report() {
  local ts="$1" version="$2" pre_file="$3" post_file="$4"
  local report="${PROJECT_ROOT}/frontend/test_cases/logs/deploy_${ts}.md"

  {
    echo "# Deploy Report — ${ts}"
    echo ""
    echo "**Version deployed:** \`${version}\`"
    echo "**Date:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "---"
    echo ""
    echo "## Pre-Deploy Validation (dev — ${API_BASE_URL:-boardmansgame.com})"
    echo ""
    if [[ -f "${pre_file}" ]]; then
      while IFS='|' read -r status tc log; do
        local icon="✅"; [[ "$status" == "FAIL" ]] && icon="❌"
        echo "- ${icon} \`${tc}\`  →  \`${log##*/}\`"
      done < "${pre_file}"
    else
      echo "- (not run)"
    fi
    echo ""
    echo "## Post-Deploy Validation (production — ${PROD_API_BASE_URL})"
    echo ""
    local -a post_failures=()
    if [[ -f "${post_file}" ]]; then
      while IFS='|' read -r status tc log; do
        local icon="✅"; [[ "$status" == "FAIL" ]] && icon="❌"
        echo "- ${icon} \`${tc}\`  →  \`${log##*/}\`"
        [[ "$status" == "FAIL" ]] && post_failures+=("${tc}|${log}")
      done < "${post_file}"
    else
      echo "- (not run)"
    fi
    echo ""

    if [[ ${#post_failures[@]} -gt 0 ]]; then
      echo "---"
      echo ""
      echo "## ⚠️ Post-Deploy Failures — Paste to Claude to Investigate"
      echo ""
      echo "One or more production validation tests failed after deploy."
      echo "Copy the block below and paste it to Claude:"
      echo ""
      echo '```'
      echo "Deploy: ${ts}  Version: ${version}"
      echo "Environment: production (${PROD_API_BASE_URL})"
      echo ""
      for entry in "${post_failures[@]}"; do
        local ftc="${entry%%|*}" flog="${entry##*|}"
        echo "## FAILED: ${ftc}"
        echo "Log: ${flog}"
        echo ""
        if [[ -f "${flog}" ]]; then
          grep -A 12 "Result.*FAIL\|❌\|HTTP Status.*[^2][0-9][0-9]" "${flog}" 2>/dev/null | head -40 || true
        fi
        echo ""
      done
      echo '```'
      echo ""
      echo "### Log files"
      for entry in "${post_failures[@]}"; do
        echo "- \`${entry##*|}\`"
      done
    fi
  } > "${report}"

  echo "${report}"
}

# ============================================================================
# TASK: health-check
# ============================================================================

task_health_check() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  Health Check — Production Endpoint Verification            ║"
  echo "╚══════════════════════════════════════════════════════════════╝"

  local all_ok=true

  log_step "Systemd service"
  if systemctl is-active --quiet pulsecomposer; then
    log_success "pulsecomposer service is running"
  else
    log_error "pulsecomposer service is NOT running"
    all_ok=false
  fi

  log_step "Production endpoints"

  local prod_frontend_url
  prod_frontend_url="$(grep '^FRONTEND_PUBLIC_URL=' "${_PROD_SETTINGS}" 2>/dev/null | cut -d'"' -f2 || echo 'https://pulsecomposer.com')"
  prod_frontend_url="${prod_frontend_url:-https://pulsecomposer.com}"

  local -A checks=(
    ["Frontend SPA"]="${prod_frontend_url}"
    ["Admin backend"]="${PROD_API_BASE_URL}/api/health"
  )

  for label in "Frontend SPA" "Admin backend"; do
    local url="${checks[$label]}"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${url}" 2>/dev/null || echo "000")
    if [[ "$code" == "200" ]]; then
      log_success "${label}: ${code}  (${url})"
    else
      log_error  "${label}: ${code}  (${url})"
      all_ok=false
    fi
  done

  log_step "Backend version"
  local version_json
  version_json=$(curl -s --max-time 10 "${PROD_API_BASE_URL}/api/health" 2>/dev/null || echo "{}")
  local version
  version=$(echo "${version_json}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('version','unknown'))" 2>/dev/null || echo "unknown")
  local env
  env=$(echo "${version_json}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('env','unknown'))" 2>/dev/null || echo "unknown")
  log_info "Version: ${version}  Env: ${env}"

  echo ""
  if [[ "${all_ok}" == "true" ]]; then
    echo -e "${GREEN}All checks passed.${NC}"
    return 0
  else
    echo -e "${RED}One or more checks failed.${NC}"
    return 1
  fi
}

# ============================================================================
# TASK: deploy
# ============================================================================

task_deploy() {
  require_dev_worktree

  local deploy_ts
  deploy_ts=$(date '+%Y%m%d_%H%M%S')
  local pre_results_file="" post_results_file=""
  local deployed_version="unknown"

  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  Deploy — Dev → Production                                   ║"
  echo "╚══════════════════════════════════════════════════════════════╝"

  # ── Step 1: Uncommitted changes ──────────────────────────────────────────
  log_step "Step 1 of 7 — Verify dev is clean"
  cd "${PROJECT_ROOT}"

  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    log_warn "Uncommitted changes in dev working tree:"
    git status --short
    echo ""
    if confirm "Commit these changes before deploying?"; then
      local default_msg="Pre-deploy commit"
      local commit_msg
      if [[ "${AUTO_YES:-false}" == "true" ]]; then
        commit_msg="${default_msg}"
      else
        read -p "$(echo -e "${BLUE}?${NC} Commit message [${default_msg}]: ")" commit_msg
        commit_msg="${commit_msg:-${default_msg}}"
      fi
      git add -A
      git commit -m "${commit_msg}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
      log_success "Changes committed"
    else
      log_error "Uncommitted changes remain. Deploy cancelled."
      return 1
    fi
  else
    log_success "Dev working tree is clean"
  fi

  # ── Step 2: Pre-deploy validation (dev) ──────────────────────────────────
  run_validation_suite "Step 2 of 7 — Pre-deploy validation (dev)" \
      "dev" "${DEPLOY_SUITE_DEV[@]}"
  local pre_exit=$?
  pre_results_file="${SUITE_RESULTS_FILE}"

  if [[ $pre_exit -ne 0 ]]; then
    log_error "${SUITE_FAILED} test(s) failed in dev before deploy."
    if ! confirm "Deploy anyway despite pre-deploy failures?"; then
      local report_file
      report_file=$(write_deploy_report "${deploy_ts}" "aborted" \
          "${pre_results_file}" "")
      log_info "Report written: ${report_file}"
      return 1
    fi
    log_warn "Proceeding despite pre-deploy failures — results recorded."
  fi

  # ── Step 3: Commits to deploy ─────────────────────────────────────────────
  log_step "Step 3 of 7 — Commits to deploy"
  cd "${PROJECT_ROOT}"
  local commits_ahead
  commits_ahead=$(git rev-list --count master..HEAD 2>/dev/null || echo "0")

  if [[ "${commits_ahead}" -eq 0 ]]; then
    log_warn "No commits ahead of master — nothing to deploy."
    confirm "Continue anyway?" || return 0
  fi

  git log --oneline master..HEAD | sed 's/^/  /'
  echo ""
  confirm "Deploy these ${commits_ahead} commit(s) to production?" || { log_info "Deploy cancelled."; return 0; }

  # ── Step 4: Merge ─────────────────────────────────────────────────────────
  log_step "Step 4 of 7 — Merge dev into master"
  cd "${PROD_ROOT}"
  git checkout master
  git merge dev -m "Deploy: merge dev into master"
  log_success "Dev merged into master"

  # Capture the deployed version from prod settings (post-merge)
  deployed_version="$( \
    grep '^VERSION_MAJOR='        "${PROD_ROOT}/script/settings.prod.txt" | cut -d'"' -f2 \
  ).$(grep '^VERSION_MINOR='      "${PROD_ROOT}/script/settings.prod.txt" | cut -d'"' -f2 \
  ).$(grep '^VERSION_BUILD_NUMBER=' "${PROD_ROOT}/script/settings.prod.txt" | cut -d'"' -f2)"

  # ── Step 5: Build frontend ────────────────────────────────────────────────
  log_step "Step 5 of 7 — Build frontend"
  cd "${PROD_ROOT}"
  ./script/deploy-frontend.sh

  local prod_build_dir="${PROD_ROOT}/frontend/build"
  local new_bundle_hash
  new_bundle_hash=$(grep -o 'index-[A-Za-z0-9_-]*\.js' "${prod_build_dir}/index.html" 2>/dev/null | head -1 || echo "")

  # Sync to the Apache-served path if it differs from the build dir
  local spa_serve_path
  spa_serve_path="$(grep '^FRONTEND_SPA_SERVE_PATH=' "${_PROD_SETTINGS}" 2>/dev/null | cut -d'"' -f2 || echo '')"
  if [[ -n "${spa_serve_path}" && "${spa_serve_path}" != "${prod_build_dir}" ]]; then
    log_info "Syncing build → ${spa_serve_path}"
    rsync -a --delete "${prod_build_dir}/" "${spa_serve_path}/"
    log_success "Build synced to Apache serve path"
  fi

  log_success "Frontend built — bundle: ${new_bundle_hash:-unknown}"

  # ── Step 6: Restart backend ───────────────────────────────────────────────
  log_step "Step 6 of 7 — Restart backend service"
  sudo systemctl restart pulsecomposer
  log_success "Backend restarted"

  # ── Step 7: Post-deploy validation (production) ───────────────────────────
  sleep 3
  local post_exit=0
  run_validation_suite "Step 7 of 7 — Post-deploy validation (production)" \
      "prod" "${DEPLOY_SUITE_PROD[@]}" || post_exit=$?
  post_results_file="${SUITE_RESULTS_FILE}"

  # Verify the new bundle is actually being served by the production frontend
  local frontend_public_url
  frontend_public_url="$(grep '^FRONTEND_PUBLIC_URL=' "${_PROD_SETTINGS}" 2>/dev/null | cut -d'"' -f2 || echo 'https://pulsecomposer.boardmansgame.com')"
  if [[ -n "${new_bundle_hash}" ]]; then
    log_info "Verifying frontend bundle is live at ${frontend_public_url}"
    local served_hash
    served_hash=$(curl -s --max-time 10 "${frontend_public_url}/" 2>/dev/null \
      | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1 || echo "")
    if [[ "${served_hash}" == "${new_bundle_hash}" ]]; then
      log_success "Frontend bundle verified: ${served_hash}"
    else
      log_error "Bundle mismatch — built: ${new_bundle_hash}, serving: ${served_hash:-none}"
      log_error "Check FRONTEND_SPA_SERVE_PATH matches the Apache DocumentRoot"
      post_exit=1
    fi
  fi

  # Write deploy report
  local report_file
  report_file=$(write_deploy_report "${deploy_ts}" "${deployed_version}" \
      "${pre_results_file}" "${post_results_file}")

  echo ""
  log_info "Deploy report: ${report_file}"
  echo ""

  if [[ $post_exit -ne 0 ]]; then
    log_error "Post-deploy validation failed on production."
    log_warn "Open the report above and paste the failure block to Claude."
    return 1
  fi

  log_success "Deploy complete — ${deployed_version} live. All validation passed."
}

# ============================================================================
# TASK: increment-build
# ============================================================================

task_increment_build() {
  require_dev_worktree

  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  Increment Build — Bump version and deploy to production     ║"
  echo "╚══════════════════════════════════════════════════════════════╝"

  local dev_settings="${SCRIPT_DIR}/settings.dev.txt"
  local prod_settings="${PROD_ROOT}/script/settings.prod.txt"

  log_step "Step 0 — Verify dev is clean"
  cd "${PROJECT_ROOT}"
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    log_warn "Uncommitted changes in dev working tree:"
    git status --short
    echo ""
    if confirm "Commit these changes before incrementing build?"; then
      local default_msg="Pre-deploy commit"
      local pre_commit_msg
      if [[ "${AUTO_YES:-false}" == "true" ]]; then
        pre_commit_msg="${default_msg}"
      else
        read -p "$(echo -e "${BLUE}?${NC} Commit message [${default_msg}]: ")" pre_commit_msg
        pre_commit_msg="${pre_commit_msg:-${default_msg}}"
      fi
      git add -A
      git commit -m "${pre_commit_msg}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
      log_success "Changes committed"
    else
      log_error "Uncommitted changes remain. Build increment cancelled."
      return 1
    fi
  else
    log_success "Dev working tree is clean"
  fi

  # Read current build from dev settings (source of truth for versioning)
  local current_build major minor
  current_build=$(grep '^VERSION_BUILD_NUMBER=' "${dev_settings}" | cut -d'"' -f2)
  major=$(grep '^VERSION_MAJOR=' "${dev_settings}" | cut -d'"' -f2)
  minor=$(grep '^VERSION_MINOR=' "${dev_settings}" | cut -d'"' -f2)

  local new_build=$(( current_build + 1 ))
  local new_version="${major}.${minor}.${new_build}"
  local old_version="${major}.${minor}.${current_build}"

  log_info "Current version:  ${old_version}"
  log_info "New version:      ${new_version}"
  echo ""

  confirm "Increment build from ${old_version} to ${new_version} and deploy?" || {
    log_info "Cancelled."
    return 0
  }

  log_step "Step 1 of 6 — Bump VERSION_BUILD_NUMBER in dev settings"
  cd "${PROJECT_ROOT}"

  sed -i "s/VERSION_BUILD_NUMBER=\"${current_build}\"/VERSION_BUILD_NUMBER=\"${new_build}\"/" "${dev_settings}"
  log_success "settings.dev.txt updated: ${old_version} → ${new_version}"

  log_step "Step 2 of 6 — Commit version bump in dev"
  git add script/settings.dev.txt
  git commit -m "Build: increment build number to ${new_version}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  log_success "Committed in dev"

  log_step "Step 3 of 6 — Merge dev into master (prod worktree)"
  cd "${PROD_ROOT}"
  git checkout master
  git merge dev -m "Build: merge dev into master for build ${new_version}"
  log_success "Dev merged into master"

  log_step "Step 4 of 6 — Sync build number to prod settings"
  sed -i "s/VERSION_BUILD_NUMBER=\"${current_build}\"/VERSION_BUILD_NUMBER=\"${new_build}\"/" "${prod_settings}"
  git add script/settings.prod.txt
  git commit -m "Build: sync VERSION_BUILD_NUMBER to ${new_version} in prod settings"
  log_success "settings.prod.txt updated and committed on master"

  log_step "Step 5 of 6 — Restart backend service (no frontend rebuild needed)"
  sudo systemctl restart pulsecomposer
  log_success "Backend restarted with new settings"

  log_step "Step 6 of 6 — Verify production shows new version (tc_0006)"
  sleep 3  # brief settle time for gunicorn workers to reload

  # Run tc_0006 via the test framework — produces a durable log file as evidence
  cd "${PROJECT_ROOT}"
  "${SCRIPT_DIR}/testing_framework.sh" --frontend --env prod --run tc_0006

  # Also verify exact version matches what we just deployed
  local version_json
  version_json=$(curl -s --max-time 10 "${PROD_API_BASE_URL}/api/health" 2>/dev/null || echo "{}")
  local live_version
  live_version=$(echo "${version_json}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('version','unknown'))" 2>/dev/null || echo "unknown")

  if [[ "${live_version}" == "${new_version}" ]]; then
    log_success "Production version confirmed: ${live_version}"
    echo ""
    echo -e "${GREEN}Build increment complete. Production is running ${new_version}.${NC}"
    return 0
  else
    log_error "Expected version ${new_version} but got ${live_version}"
    log_info "Check: journalctl -u pulsecomposer -n 30 --no-pager"
    return 1
  fi
}

# ============================================================================
# Main
# ============================================================================

usage() {
  echo ""
  echo "Usage:"
  echo "  ./script/common_tasks.sh --list"
  echo "  ./script/common_tasks.sh --run <task> [--yes]"
  echo "  ./script/common_tasks.sh --help"
  echo ""
  list_tasks
}

main() {
  local cmd="${1:-}"
  local task=""
  local yes_flag=false

  # Parse args
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --list)   list_tasks; exit 0 ;;
      --help)   usage; exit 0 ;;
      --run)    task="${2:-}"; shift ;;
      --yes)    yes_flag=true ;;
    esac
    shift
  done

  if [[ "${yes_flag}" == "true" ]]; then
    export AUTO_YES=true
  fi

  if [[ -z "${task}" ]]; then
    usage
    exit 1
  fi

  # Dispatch
  case "${task}" in
    increment-build) task_increment_build ;;
    deploy)          task_deploy ;;
    health-check)    task_health_check ;;
    *)
      log_error "Unknown task: ${task}"
      list_tasks
      exit 1
      ;;
  esac
}

main "$@"
