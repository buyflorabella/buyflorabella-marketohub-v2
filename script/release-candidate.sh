#!/usr/bin/env bash
set -e

# Release Candidate Creator
# Single entry point for committing dev work, syncing main, and tagging a release.
#
# Phases:
#   1. Commit any pending changes (interactive — stages and commits everything)
#   2. Pull main → dev (merge any changes made directly to main)
#   3. Bump version, tag, and push to GitHub

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"

# Guard: this script must run in dev/ worktree only
if [[ "${_WORKTREE}" != "dev" ]]; then
  echo "ERROR: release-candidate.sh must be run from the dev/ worktree only" >&2
  echo "Current worktree: ${_WORKTREE}" >&2
  exit 1
fi

# Load settings
_SETTINGS_FILE="${SCRIPT_DIR}/settings.dev.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

# ── Helpers ───────────────────────────────────────────────────────────────────

log_info()    { echo "ℹ️  $*"; }
log_success() { echo "✅ $*"; }
log_warn()    { echo "⚠️  $*"; }
log_error()   { echo "❌ $*" >&2; }
log_sep()     { echo "────────────────────────────────────────────────────────"; }

confirm() {
  # confirm "prompt text" → returns 0 (yes) or 1 (no)
  local reply
  read -r -p "👉 $1 (y/n) " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

# ── Main ──────────────────────────────────────────────────────────────────────

cd "${PROJECT_ROOT}"

log_info "${SITE_NAME} Release Candidate Creator"
log_sep
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Phase 1: Commit pending changes
# ─────────────────────────────────────────────────────────────────────────────
log_info "Phase 1 — Commit pending changes"
echo ""

STAGED=$(git diff --cached --name-only 2>/dev/null || true)
MODIFIED=$(git diff --name-only 2>/dev/null || true)

# Untracked files — split into gitignored (informational) and new (actionable)
UNTRACKED_NEW=""
UNTRACKED_IGNORED=""
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if git check-ignore -q "$f" 2>/dev/null; then
    UNTRACKED_IGNORED+="  $f"$'\n'
  else
    UNTRACKED_NEW+="  $f"$'\n'
  fi
done < <(git ls-files --others --exclude-standard 2>/dev/null)

HAS_PENDING=false
[[ -n "$STAGED" || -n "$MODIFIED" || -n "$UNTRACKED_NEW" ]] && HAS_PENDING=true

if $HAS_PENDING; then
  log_warn "Pending changes found:"
  echo ""

  if [[ -n "$STAGED" ]]; then
    echo "  Already staged:"
    echo "$STAGED" | sed 's/^/    /'
  fi

  if [[ -n "$MODIFIED" ]]; then
    echo "  Modified (not staged):"
    echo "$MODIFIED" | sed 's/^/    /'
  fi

  if [[ -n "$UNTRACKED_NEW" ]]; then
    echo "  New untracked files (not in .gitignore):"
    printf "%s" "$UNTRACKED_NEW"
  fi

  if [[ -n "$UNTRACKED_IGNORED" ]]; then
    echo "  Gitignored files (will NOT be committed — shown for info):"
    printf "%s" "$UNTRACKED_IGNORED"
  fi

  echo ""

  if confirm "Commit all pending changes now?"; then
    echo ""
    read -r -p "   Commit message: " COMMIT_MSG
    if [[ -z "$COMMIT_MSG" ]]; then
      log_error "Commit message cannot be empty."
      exit 1
    fi

    git add -A
    git commit -m "$COMMIT_MSG"
    log_success "Committed: $COMMIT_MSG"
  else
    log_error "Cannot proceed with uncommitted changes. Handle them manually and re-run."
    exit 1
  fi
else
  # Report ignored files even when clean
  if [[ -n "$UNTRACKED_IGNORED" ]]; then
    log_info "Gitignored files present (not committed — OK):"
    printf "%s" "$UNTRACKED_IGNORED"
  fi
  log_success "Working directory is clean"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Phase 2: Sync main → dev
# ─────────────────────────────────────────────────────────────────────────────
log_sep
log_info "Phase 2 — Sync main → dev"
echo ""

log_info "Fetching from origin..."
git fetch origin 2>&1 | sed 's/^/  /'
echo ""

# Check if origin/dev tracking ref exists (requires fetch refspec in bare repo config)
_ORIGIN_DEV_EXISTS=false
git rev-parse origin/dev &>/dev/null && _ORIGIN_DEV_EXISTS=true

if ! $_ORIGIN_DEV_EXISTS; then
  log_warn "origin/dev tracking ref not found — remote divergence check skipped."
  log_warn "Ensure the bare repo has a fetch refspec: fetch = +refs/heads/*:refs/remotes/origin/*"
fi

# ── Check 1: origin/dev has commits local dev is missing (most important) ──
if $_ORIGIN_DEV_EXISTS; then
  DEV_REMOTE_AHEAD=$(git log HEAD..origin/dev --oneline 2>/dev/null || true)
  if [[ -n "$DEV_REMOTE_AHEAD" ]]; then
    log_warn "origin/dev has commits not yet in local dev:"
    echo ""
    echo "$DEV_REMOTE_AHEAD" | sed 's/^/  /'
    echo ""
    if confirm "Merge origin/dev into local dev now?"; then
      echo ""
      if ! git merge origin/dev --no-edit; then
        echo ""
        log_error "Merge conflict. Resolve conflicts manually, then re-run this script."
        log_info "Commands:"
        log_info "  git status               — see conflicting files"
        log_info "  git add <file>           — mark resolved"
        log_info "  git merge --continue     — finish the merge"
        log_info "  git merge --abort        — cancel and start over"
        exit 1
      fi
      log_success "Merged origin/dev into dev"
    else
      log_error "Cannot push: origin/dev has commits not in local dev. Resolve and re-run."
      exit 1
    fi
  else
    log_success "Local dev is up to date with origin/dev"
  fi
fi

# ── Check 2: origin/main has commits local dev is missing ──
MASTER_AHEAD=$(git log HEAD..origin/main --oneline 2>/dev/null || true)

if [[ -n "$MASTER_AHEAD" ]]; then
  log_warn "main has commits not yet in dev:"
  echo ""
  echo "$MASTER_AHEAD" | sed 's/^/  /'
  echo ""

  if confirm "Merge origin/main into dev now?"; then
    echo ""
    if ! git merge origin/main --no-edit; then
      echo ""
      log_error "Merge conflict. Resolve conflicts manually, then re-run this script."
      log_info "Commands:"
      log_info "  git status               — see conflicting files"
      log_info "  git add <file>           — mark resolved"
      log_info "  git merge --continue     — finish the merge"
      log_info "  git merge --abort        — cancel and start over"
      exit 1
    fi
    log_success "Merged origin/main into dev"
  else
    log_warn "Skipping main merge. Proceeding anyway — note that dev may be behind main."
  fi
else
  log_success "dev is up to date with main (no merge needed)"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Phase 3: SSH check, version bump, tag, push
# ─────────────────────────────────────────────────────────────────────────────
log_sep
log_info "Phase 3 — Version bump + tag + push"
echo ""

# Read version from committed VERSION file (not from gitignored settings)
_VERSION_FILE="${SCRIPT_DIR}/VERSION"
[[ -f "${_VERSION_FILE}" ]] || { log_error "script/VERSION file not found."; exit 1; }
_VERSION_STRING=$(cat "${_VERSION_FILE}" | tr -d '[:space:]')
MAJOR=$(echo "${_VERSION_STRING}" | cut -d. -f1)
MINOR=$(echo "${_VERSION_STRING}" | cut -d. -f2)
BUILD=$(echo "${_VERSION_STRING}" | cut -d. -f3)
CURRENT_VERSION="v${MAJOR}.${MINOR}.${BUILD}"
NEW_MINOR=$((MINOR + 1))
NEW_VERSION="v${MAJOR}.${NEW_MINOR}.${BUILD}"

log_info "Current version : ${CURRENT_VERSION}"
log_info "Release version : ${NEW_VERSION}"
echo ""

if ! confirm "Create release candidate ${NEW_VERSION} and push to GitHub?"; then
  log_info "Cancelled."
  exit 0
fi

echo ""
log_info "Checking SSH access to GitHub..."
_SSH_OK=false
if ssh -T git@github.com >/dev/null 2>&1; then
  _SSH_OK=true
  log_success "SSH authentication OK"
else
  log_warn "SSH to GitHub unavailable — version will be bumped and committed locally."
  log_warn "Push to origin will be skipped. Run 'git push origin dev' when SSH is restored."
fi
echo ""

# Bump version in committed VERSION file
log_info "Updating script/VERSION..."
echo "${MAJOR}.${NEW_MINOR}.${BUILD}" > "${_VERSION_FILE}"
log_success "script/VERSION → ${MAJOR}.${NEW_MINOR}.${BUILD}"

# Sync version vars into gitignored settings files (for app runtime use)
_PROD_SETTINGS="${SCRIPT_DIR}/settings.prod.txt"
for _SF in "${_SETTINGS_FILE}" "${_PROD_SETTINGS}"; do
  [[ -f "${_SF}" ]] || continue
  sed -i "s/VERSION_MAJOR=\"[^\"]*\"/VERSION_MAJOR=\"${MAJOR}\"/"               "${_SF}"
  sed -i "s/VERSION_MINOR=\"[^\"]*\"/VERSION_MINOR=\"${NEW_MINOR}\"/"           "${_SF}"
  sed -i "s/VERSION_BUILD_NUMBER=\"[^\"]*\"/VERSION_BUILD_NUMBER=\"${BUILD}\"/" "${_SF}"
done
log_success "Version synced into settings files (not committed — gitignored)"

# Check for settings drift — warn if dev has keys not present in prod
if [[ -f "${_PROD_SETTINGS}" ]]; then
  _DEV_KEYS=$(grep -E '^[A-Z_]+=' "${_SETTINGS_FILE}" | cut -d'=' -f1 | sort)
  _PROD_KEYS=$(grep -E '^[A-Z_]+=' "${_PROD_SETTINGS}" | cut -d'=' -f1 | sort)
  _MISSING_IN_PROD=$(comm -23 <(echo "$_DEV_KEYS") <(echo "$_PROD_KEYS"))
  if [[ -n "$_MISSING_IN_PROD" ]]; then
    echo ""
    log_warn "Settings keys in settings.dev.txt NOT found in settings.prod.txt:"
    echo "$_MISSING_IN_PROD" | sed 's/^/    /'
    log_warn "Add these keys to settings.prod.txt before running update-production.sh."
    echo ""
  else
    log_success "settings.dev.txt and settings.prod.txt keys are in sync"
  fi
fi

# Commit VERSION file only (settings are gitignored)
git add "${_VERSION_FILE}"
git commit -m "Release: bump to ${NEW_VERSION}"
log_success "Committed version bump"

# Tag
log_info "Creating tag: ${NEW_VERSION}"
git tag -a "${NEW_VERSION}" -m "Release candidate: ${NEW_VERSION}"
log_success "Tagged: ${NEW_VERSION}"

if $_SSH_OK; then
  # Pre-push divergence guard
  if git rev-parse origin/dev &>/dev/null; then
    _BEHIND=$(git log HEAD..origin/dev --oneline 2>/dev/null | wc -l)
    if [[ $_BEHIND -gt 0 ]]; then
      log_error "origin/dev still has ${_BEHIND} commit(s) not in local dev — push would be rejected."
      log_error "Re-run Phase 2 sync or resolve manually: git pull --rebase origin dev"
      exit 1
    fi
  fi

  # Push branch + tag
  log_info "Pushing dev branch and tag to GitHub..."
  git push origin dev
  git push origin "${NEW_VERSION}"
  log_success "Pushed to origin"
else
  log_warn "Skipping remote push (SSH unavailable)"
  log_warn "To push later:  git push origin dev && git push origin ${NEW_VERSION}"
fi

echo ""
log_sep
log_success "Release candidate ready: ${NEW_VERSION}"
log_sep
echo ""
log_info "Next steps:"
log_info "1. Switch to the prod/ worktree"
log_info "2. Run: ./script/update-production.sh"
log_info "   Phase 0 will merge dev → main automatically (no PR needed)"
echo ""
