#!/usr/bin/env bash
# Testing Framework
#
# Two modes:
#   Frontend — tests user-visible flows through public HTTPS URLs (same path as a real browser)
#   Backend  — tests raw API via direct localhost (fast, no SSL, no Apache)
#
# Frontend tests live in:  frontend/test_cases/
# Backend pytest lives in: backend/tests/
#
# Usage:
#   (no args)                    Interactive mode (pick frontend or backend)
#   --frontend                   Interactive menu of frontend tests
#   --frontend --list            List frontend tests with last result
#   --frontend --run tc_NN       Run a specific frontend test
#   --frontend --all             Run all frontend tests
#   --backend                    Interactive menu of backend tests (pytest)
#   --backend --list             List backend pytest files
#   --backend --run TESTFILE     Run a specific pytest file
#   --backend --all              Run all pytest tests
#   --env prod                   Use production URLs (default: derived from worktree name)
#   --help                       Show this help

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKTREE_NAME="$(basename "$PROJECT_ROOT")"

FRONTEND_TEST_DIR="${PROJECT_ROOT}/frontend/test_cases"
BACKEND_TEST_DIR="${PROJECT_ROOT}/backend/tests"
LOG_DIR="${FRONTEND_TEST_DIR}/logs"
RUN_OUTPUT_DIR="${LOG_DIR}/runs"
TEMP_DIR="${HOME}/.pulsecomposer-tests"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

COOKIES="${TEMP_DIR}/cookies.jar"
mkdir -p "$TEMP_DIR" "$LOG_DIR" "$RUN_OUTPUT_DIR"

# --- URL Configuration ---
# Derived from worktree name; --env prod overrides to production URLs
# Public URLs match what a real browser uses (go through Apache → Flask)
ENV_MODE="${WORKTREE_NAME}"

configure_urls() {
  local mode="${1:-$ENV_MODE}"
  if [[ "$mode" == "prod" ]]; then
    API_PORT=20150
    API_BASE_URL="http://127.0.0.1:${API_PORT}"
    API_PUBLIC_URL="https://admin.pulsecomposer.com"
    FRONTEND_PUBLIC_URL="https://pulsecomposer.com"
  else
    API_PORT=17150
    API_BASE_URL="http://127.0.0.1:${API_PORT}"
    API_PUBLIC_URL="https://admin.pulsecomposer.boardmansgame.com"
    FRONTEND_PUBLIC_URL="https://frontend.pulsecomposer.boardmansgame.com"
  fi
}
configure_urls "$ENV_MODE"

# --- Helpers ---

log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}✅${NC} $*"; }
log_error()   { echo -e "${RED}❌${NC} $*" >&2; }
log_warn()    { echo -e "${YELLOW}⚠️${NC}  $*"; }
log_header()  { echo -e "\n${BOLD}${CYAN}$*${NC}"; }

log_result() {
  local tc_name="$1" result="$2" passed="$3" total="$4" run_file="${5:-}"
  local log_file="${LOG_DIR}/${tc_name}.log"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  if [[ -n "$run_file" ]]; then
    echo "${timestamp} | ${result} | ${passed}/${total} | ${run_file}" >> "$log_file"
  else
    echo "${timestamp} | ${result} | ${passed}/${total}" >> "$log_file"
  fi
}

get_last_result() {
  local tc_name="$1"
  local log_file="${LOG_DIR}/${tc_name}.log"
  if [[ -f "$log_file" ]]; then
    local last
    last=$(tail -1 "$log_file")
    local result time
    result=$(echo "$last" | cut -d'|' -f2 | xargs)
    time=$(echo "$last" | cut -d'|' -f1 | xargs)
    if [[ "$result" == "PASS" ]]; then
      echo -e "(${GREEN}✅ PASS${NC} @ $time)"
    else
      echo -e "(${RED}❌ FAIL${NC} @ $time)"
    fi
  else
    echo "(never run)"
  fi
}

# Check if a URL is reachable before running tests through it
check_url_reachable() {
  local url="$1"
  local label="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "000" ]]; then
    log_warn "Cannot reach ${label}: ${url}"
    log_warn "Frontend tests may fail if public URL is not accessible"
    return 1
  fi
  log_info "Verified reachable: ${label} (HTTP ${code})"
  return 0
}

# --- HTTP Request Executors ---

# Backend-mode request: direct localhost, JSON
execute_request() {
  local method="$1" path="$2" body="$3" base_url="${4:-$API_BASE_URL}"
  local curl_opts=(-s -w "\n%{http_code}" -X "$method"
                   -H "Content-Type: application/json"
                   -b "$COOKIES" -c "$COOKIES")
  [[ -n "$body" ]] && curl_opts+=(-d "$body")
  curl "${curl_opts[@]}" "${base_url}${path}" 2>/dev/null || echo -e "\nerror"
}

# Frontend-mode request: public URL, JSON
execute_public_request() {
  local method="$1" path="$2" body="$3" base_url="${4:-$API_PUBLIC_URL}"
  local curl_opts=(-s -w "\n%{http_code}" -X "$method"
                   -H "Content-Type: application/json"
                   -H "Origin: ${FRONTEND_PUBLIC_URL}"
                   -b "$COOKIES" -c "$COOKIES")
  [[ -n "$body" ]] && curl_opts+=(-d "$body")
  curl "${curl_opts[@]}" "${base_url}${path}" 2>/dev/null || echo -e "\nerror"
}

# HTML scrape request (follows redirects, browser-like Accept header)
execute_html_request() {
  local method="$1" path="$2" base_url="${3:-$FRONTEND_PUBLIC_URL}"
  local curl_opts=(-s -L -w "\n%{http_code}" -X "$method"
                   -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                   -H "User-Agent: PulseComposer-TestFramework/1.0"
                   -b "$COOKIES" -c "$COOKIES")
  curl "${curl_opts[@]}" "${base_url}${path}" 2>/dev/null || echo -e "\nerror"
}

# --- Text Parsers ---

extract_http_meta() {
  echo "$1" | awk 'NR==1 { if ($0 ~ /^[A-Z]+ \//) { split($0,p," "); print p[1]"|"p[2] } else { print "|" } }'
}

extract_body() {
  echo "$1" | awk '/^{/,/^}/ { if(NR>1) printf " "; printf "%s",$0 } /^}/ { print "" }'
}

extract_json_field() {
  echo "$1" | jq -r "$2" 2>/dev/null || echo ""
}

substitute_variables() {
  local text="$1"
  local -n vars=$2
  local result="$text"
  for key in "${!vars[@]}"; do
    result="${result//\{\{$key\}\}/${vars[$key]}}"
  done
  echo "$result"
}

run_section_bash_blocks() {
  local tc_file="$1" section_name="$2"
  local in_section=false in_block=false block=""
  while IFS= read -r line; do
    if [[ "$line" =~ ^##[[:space:]](.+)$ ]]; then
      local sec="${BASH_REMATCH[1]}"
      if [[ "$sec" == "$section_name" ]]; then in_section=true
      elif $in_section; then break
      fi
      continue
    fi
    $in_section || continue
    if [[ "$line" =~ ^\`\`\`bash ]] && ! $in_block; then
      in_block=true; block=""; continue
    fi
    if [[ "$line" == '```' ]] && $in_block; then
      in_block=false
      [[ -n "$block" ]] && eval "$block" 2>&1 || true
      continue
    fi
    $in_block && block="${block}${line}"$'\n'
  done < "$tc_file"
}

# --- Frontend Test Runner ---

list_frontend_tests() {
  echo ""
  log_header "Frontend Test Cases  (public URL: ${API_PUBLIC_URL})"
  echo ""
  local count=0
  for f in "${FRONTEND_TEST_DIR}"/tc_[0-9][0-9][0-9][0-9].md; do
    [[ -f "$f" ]] && {
      local name title last_result
      name=$(basename "$f" .md)
      title=$(head -1 "$f" | sed 's/# Test Case [0-9]* — //')
      last_result=$(get_last_result "$name")
      printf "  %-12s %-48s %s\n" "$name" "$title" "$last_result"
      ((count++))
    }
  done
  echo ""
  log_info "Found ${count} frontend test case(s)"
  echo ""
}

interactive_frontend_menu() {
  echo ""
  log_header "Frontend Tests  [public URL: ${API_PUBLIC_URL}]"
  echo ""

  local -a tests=()
  local count=0
  for f in "${FRONTEND_TEST_DIR}"/tc_[0-9][0-9][0-9][0-9].md; do
    [[ -f "$f" ]] && {
      local name title last_result
      name=$(basename "$f" .md)
      tests+=("$name")
      title=$(head -1 "$f" | sed 's/# Test Case [0-9]* — //')
      last_result=$(get_last_result "$name")
      printf "  %d) %-12s %-40s %s\n" "$((count+1))" "$name" "$title" "$last_result"
      ((count++))
    }
  done

  echo ""
  printf "  a) Run all frontend tests\n"
  printf "  q) Back / Quit\n"
  echo ""
  read -p "Select (1-${count}, a, q): " choice

  case "$choice" in
    a|A) return 2 ;;
    q|Q) return 1 ;;
    *)
      if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= count )); then
        run_frontend_test "${tests[$((choice-1))]}"
        return 0
      else
        log_error "Invalid choice"
        return 1
      fi
      ;;
  esac
}

run_frontend_test() {
  local tc_name="$1"
  local tc_file="${FRONTEND_TEST_DIR}/${tc_name}.md"

  [[ -f "$tc_file" ]] || { log_error "Test not found: ${tc_file}"; return 1; }

  local title run_ts run_output
  title=$(head -1 "$tc_file" | sed 's/# Test Case [0-9]* — //')
  run_ts=$(date '+%Y%m%d_%H%M%S')
  run_output="${RUN_OUTPUT_DIR}/${tc_name}_${run_ts}.md"

  echo ""
  log_info "Running: ${tc_name} — ${title}"
  log_info "Mode: FRONTEND  API: ${API_PUBLIC_URL}  Frontend: ${FRONTEND_PUBLIC_URL}"
  log_info "Run output: ${run_output}"
  echo ""

  {
    echo "# Test Run: ${tc_name} — ${title}"
    echo ""
    echo "**Run timestamp:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo "**Mode:** FRONTEND (public URL)"
    echo "**API URL:** ${API_PUBLIC_URL}"
    echo "**Frontend URL:** ${FRONTEND_PUBLIC_URL}"
    echo "**Environment:** ${WORKTREE_NAME} worktree"
    echo ""
    echo "---"
    echo ""
  } > "$run_output"

  # Pre-Test Setup
  if grep -q "^## Pre-Test Setup" "$tc_file" 2>/dev/null; then
    log_info "Running Pre-Test Setup..."
    echo "## Pre-Test Setup" >> "$run_output"
    echo "" >> "$run_output"
    local setup_output
    setup_output=$(run_section_bash_blocks "$tc_file" "Pre-Test Setup" 2>&1)
    if [[ -n "$setup_output" ]]; then
      echo '```' >> "$run_output"
      echo "$setup_output" >> "$run_output"
      echo '```' >> "$run_output"
    fi
    echo "" >> "$run_output"
    log_success "  Setup: ${setup_output}"
    echo ""
  fi

  rm -f "$COOKIES" 2>/dev/null || true

  local step_num=0 passed=0
  local in_block=false block=""
  declare -A step_vars
  local current_step_desc=""

  echo "## Steps" >> "$run_output"
  echo "" >> "$run_output"

  while IFS= read -r line; do
    if [[ $line =~ ^###\ Step\ [0-9]+:\ (.+)$ ]]; then
      current_step_desc="${BASH_REMATCH[1]}"
      continue
    fi

    # Skip language-tagged blocks (```bash, ```json etc.) — not HTTP steps
    if [[ "$line" =~ ^\`\`\`[a-z] ]] && ! $in_block; then
      while IFS= read -r skip_line; do [[ "$skip_line" == '```' ]] && break; done
      continue
    fi

    if [[ "$line" == '```' ]] && ! $in_block; then
      in_block=true; block=""; continue
    fi

    if [[ "$line" == '```' ]] && $in_block; then
      in_block=false

      if [[ -n "$block" ]] && [[ -n "$current_step_desc" ]]; then
        # Parse directives
        local accept_html=false use_frontend=false expect_code="200"
        local remaining_block="$block"

        while true; do
          local first_line
          first_line=$(echo "$remaining_block" | head -1)
          if [[ "$first_line" =~ ^#[[:space:]]*accept:[[:space:]]*html ]]; then
            accept_html=true; remaining_block=$(echo "$remaining_block" | tail -n +2)
          elif [[ "$first_line" =~ ^#[[:space:]]*expect:[[:space:]]*([0-9]+) ]]; then
            expect_code="${BASH_REMATCH[1]}"; remaining_block=$(echo "$remaining_block" | tail -n +2)
          elif [[ "$first_line" =~ ^#[[:space:]]*base:[[:space:]]*frontend ]]; then
            use_frontend=true; remaining_block=$(echo "$remaining_block" | tail -n +2)
          elif [[ "$first_line" =~ ^#[[:space:]]*browser:[[:space:]]*(.*) ]]; then
            # Annotation directive — stored but not yet used
            remaining_block=$(echo "$remaining_block" | tail -n +2)
          else
            break
          fi
        done
        block="$remaining_block"

        local meta method path
        meta=$(extract_http_meta "$block")
        method=$(echo "$meta" | cut -d'|' -f1)
        path=$(echo "$meta" | cut -d'|' -f2)

        if [[ -n "$method" ]]; then
          ((step_num++))
          local body
          body=$(extract_body "$block")
          body=$(substitute_variables "$body" step_vars)

          # Determine target URL
          local target_base target_label
          if $use_frontend; then
            target_base="$FRONTEND_PUBLIC_URL"
            target_label="frontend public (${FRONTEND_PUBLIC_URL})"
          else
            target_base="$API_PUBLIC_URL"
            target_label="API public (${API_PUBLIC_URL})"
          fi

          local full_url="${target_base}${path}"
          local step_start_time
          step_start_time=$(date '+%s%3N')

          log_info "Step ${step_num}: ${method} ${path}"
          log_info "  URL: ${full_url}"

          # Write step header
          {
            echo "### Step ${step_num}: ${method} ${path}"
            echo ""
            echo "**Description:** ${current_step_desc}"
            echo "**URL:** \`${full_url}\`"
            if $accept_html; then
              echo "**Mode:** HTML scrape — target: ${target_label}"
            fi
            echo ""
          } >> "$run_output"

          # Execute request
          local resp
          if $accept_html; then
            resp=$(execute_html_request "$method" "$path" "$target_base")
          else
            resp=$(execute_public_request "$method" "$path" "$body" "$target_base")
          fi
          local code body_resp elapsed_ms
          code=$(echo "$resp" | tail -1)
          body_resp=$(echo "$resp" | head -n -1)
          elapsed_ms=$(( $(date '+%s%3N') - step_start_time ))

          {
            echo "**HTTP Status:** \`${code}\` (expected \`${expect_code}\`) — ${elapsed_ms}ms"
            echo ""
          } >> "$run_output"

          if [[ -n "$body_resp" ]]; then
            if $accept_html; then
              local html_title html_lines
              html_title=$(echo "$body_resp" | grep -oP '(?<=<title>)[^<]+' | head -1 || echo "")
              html_lines=$(echo "$body_resp" | wc -l)
              {
                echo "**Page Title:** \`${html_title:-[no title]}\`"
                echo "**HTML Lines:** ${html_lines}"
                echo ""
                echo "<details>"
                echo "<summary>Full HTML response (${html_lines} lines)</summary>"
                echo ""
                echo '```html'
                echo "$body_resp"
                echo '```'
                echo ""
                echo "</details>"
                echo ""
              } >> "$run_output"
            else
              # Pretty-print JSON if possible
              local pretty_body
              pretty_body=$(echo "$body_resp" | jq '.' 2>/dev/null || echo "$body_resp")
              {
                echo "**Response Body:**"
                echo '```json'
                echo "$pretty_body"
                echo '```'
                echo ""
              } >> "$run_output"
            fi
          fi

          if [[ "$code" == "$expect_code" ]]; then
            log_success "  HTTP ${code} (${elapsed_ms}ms)"
            echo "**Result:** ✅ PASS" >> "$run_output"
            ((passed++))

            # Variable capture from JSON responses
            if [[ -n "$body_resp" ]] && ! $accept_html; then
              local otp site_password mode session_unlocked
              otp=$(extract_json_field "$body_resp" '.otp_debug')
              [[ -n "$otp" && "$otp" != "null" ]] && step_vars[otp]="$otp"

              site_password=$(extract_json_field "$body_resp" '.site_password_debug')
              if [[ -n "$site_password" && "$site_password" != "null" ]]; then
                step_vars[site_password]="$site_password"
                log_info "  Captured: site_password = ${site_password}"
                echo "" >> "$run_output"
                echo "**Captured:** \`site_password = ${site_password}\`" >> "$run_output"
              fi

              mode=$(extract_json_field "$body_resp" '.mode')
              [[ -n "$mode" && "$mode" != "null" ]] && step_vars[mode]="$mode"

              session_unlocked=$(extract_json_field "$body_resp" '.session_unlocked')
              if [[ -n "$session_unlocked" && "$session_unlocked" != "null" ]]; then
                step_vars[session_unlocked]="$session_unlocked"
                # Annotate browser state
                local browser_state
                if [[ "$session_unlocked" == "true" ]]; then
                  browser_state="Gate bypassed — user sees OTP login form"
                else
                  browser_state="Gate active — user sees site password entry form"
                fi
                log_info "  Browser state: ${browser_state}"
                echo "" >> "$run_output"
                echo "**Expected Browser State:** ${browser_state}" >> "$run_output"
              fi
            fi

            if $accept_html && [[ -n "$body_resp" ]]; then
              local html_title
              html_title=$(echo "$body_resp" | grep -oP '(?<=<title>)[^<]+' | head -1 || echo "")
              local html_lines
              html_lines=$(echo "$body_resp" | wc -l)
              log_info "  HTML: title=\"${html_title}\" (${html_lines} lines captured)"
            fi
          else
            log_error "  HTTP ${code} (expected ${expect_code}) — ${elapsed_ms}ms"
            echo "**Result:** ❌ FAIL" >> "$run_output"
          fi

          echo "" >> "$run_output"
          echo ""
          current_step_desc=""
        fi
      fi
      continue
    fi

    $in_block && block="${block}${line}"$'\n'
  done < "$tc_file"

  # Post-Test Cleanup
  if grep -q "^## Post-Test Cleanup" "$tc_file" 2>/dev/null; then
    log_info "Running Post-Test Cleanup..."
    echo "## Post-Test Cleanup" >> "$run_output"
    echo "" >> "$run_output"
    local cleanup_output
    cleanup_output=$(run_section_bash_blocks "$tc_file" "Post-Test Cleanup" 2>&1)
    if [[ -n "$cleanup_output" ]]; then
      echo '```' >> "$run_output"
      echo "$cleanup_output" >> "$run_output"
      echo '```' >> "$run_output"
    fi
    echo "" >> "$run_output"
    log_success "  Cleanup: ${cleanup_output}"
    echo ""
  fi

  # Summary
  {
    echo "---"
    echo ""
    echo "## Session Summary"
    echo ""
    echo "| Variable | Value |"
    echo "|----------|-------|"
    for key in "${!step_vars[@]}"; do
      echo "| \`${key}\` | \`${step_vars[$key]}\` |"
    done
    echo ""
  } >> "$run_output"

  echo ""
  if (( passed == step_num && step_num > 0 )); then
    log_success "PASS: ${tc_name} (${passed}/${step_num} steps)"
    echo "## Result: ✅ PASS (${passed}/${step_num} steps)" >> "$run_output"
    log_result "$tc_name" "PASS" "$passed" "$step_num" "$run_output"
    return 0
  else
    log_error "FAIL: ${tc_name} (${passed}/${step_num} steps)"
    echo "## Result: ❌ FAIL (${passed}/${step_num} steps)" >> "$run_output"
    log_result "$tc_name" "FAIL" "$passed" "$step_num" "$run_output"
    return 1
  fi
}

# --- Backend Test Runner (pytest) ---

list_backend_tests() {
  echo ""
  log_header "Backend Tests  (pytest — direct localhost: ${API_BASE_URL})"
  echo ""
  local count=0
  for f in "${BACKEND_TEST_DIR}"/test_*.py; do
    [[ -f "$f" ]] && {
      local name
      name=$(basename "$f")
      printf "  %-40s\n" "$name"
      ((count++))
    }
  done
  echo ""
  log_info "Found ${count} pytest file(s)"
  echo ""
}

interactive_backend_menu() {
  echo ""
  log_header "Backend Tests  [direct localhost: ${API_BASE_URL}]"
  echo ""

  local -a tests=()
  local count=0
  for f in "${BACKEND_TEST_DIR}"/test_*.py; do
    [[ -f "$f" ]] && {
      local name
      name=$(basename "$f")
      tests+=("$f")
      printf "  %d) %s\n" "$((count+1))" "$name"
      ((count++))
    }
  done

  echo ""
  printf "  a) Run all backend tests\n"
  printf "  q) Back / Quit\n"
  echo ""
  read -p "Select (1-${count}, a, q): " choice

  case "$choice" in
    a|A) return 2 ;;
    q|Q) return 1 ;;
    *)
      if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= count )); then
        run_backend_test "${tests[$((choice-1))]}"
        return 0
      else
        log_error "Invalid choice"
        return 1
      fi
      ;;
  esac
}

run_backend_test() {
  local test_file="$1"
  [[ -f "$test_file" ]] || { log_error "Test file not found: ${test_file}"; return 1; }

  echo ""
  log_info "Running pytest: $(basename "$test_file")"
  log_info "Mode: BACKEND  API: ${API_BASE_URL}"
  echo ""

  cd "${PROJECT_ROOT}/backend" && python3 -m pytest "$test_file" -v 2>&1
  local exit_code=$?

  echo ""
  if [[ $exit_code -eq 0 ]]; then
    log_success "PASS: $(basename "$test_file")"
  else
    log_error "FAIL: $(basename "$test_file")"
  fi
  return $exit_code
}

run_all_backend_tests() {
  echo ""
  log_info "Running all backend tests"
  log_info "Mode: BACKEND  API: ${API_BASE_URL}"
  echo ""
  cd "${PROJECT_ROOT}/backend" && python3 -m pytest tests/ -v 2>&1
}

# --- Top-Level Menu ---

interactive_menu() {
  echo ""
  log_header "PulseComposer Test Framework"
  echo ""
  echo "  1) Frontend Tests  — user-visible flows via public HTTPS URL"
  echo "  2) Backend Tests   — raw API via direct localhost"
  echo ""
  printf "  q) Quit\n"
  echo ""
  read -p "Select mode (1, 2, or q): " choice

  case "$choice" in
    1)
      interactive_frontend_menu
      local ret=$?
      if [[ $ret -eq 2 ]]; then
        for f in "${FRONTEND_TEST_DIR}"/tc_[0-9][0-9][0-9][0-9].md; do
          [[ -f "$f" ]] && run_frontend_test "$(basename "$f" .md)"
        done
      fi
      ;;
    2)
      interactive_backend_menu
      local ret=$?
      if [[ $ret -eq 2 ]]; then
        run_all_backend_tests
      fi
      ;;
    q|Q)
      exit 0
      ;;
    *)
      log_error "Invalid choice"
      exit 1
      ;;
  esac
}

# --- Main ---

SUBCMD=""
SUBCMD_ARG=""
MODE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend) MODE="frontend"; shift ;;
    --backend)  MODE="backend";  shift ;;
    --env)      shift; configure_urls "$1"; shift ;;
    --list)     SUBCMD="list";   shift ;;
    --run)      SUBCMD="run"; shift; SUBCMD_ARG="${1:-}"; [[ -n "${SUBCMD_ARG}" ]] && shift ;;
    --all)      SUBCMD="all";    shift ;;
    --status)   SUBCMD="status"; shift; SUBCMD_ARG="${1:-}"; [[ -n "${SUBCMD_ARG}" ]] && shift ;;
    --help)
      sed -n '2,20p' "$0" | grep '^#' | sed 's/^# \?//'
      exit 0
      ;;
    *)
      log_error "Unknown argument: $1"
      echo "Run: $0 --help"
      exit 1
      ;;
  esac
done

# Default: interactive top-level menu
if [[ -z "$MODE" && -z "$SUBCMD" ]]; then
  interactive_menu
  exit 0
fi

# Frontend dispatch
if [[ "$MODE" == "frontend" ]]; then
  case "${SUBCMD}" in
    list)
      list_frontend_tests
      ;;
    run)
      [[ -z "$SUBCMD_ARG" ]] && { log_error "Specify a test case"; exit 1; }
      run_frontend_test "$SUBCMD_ARG"
      ;;
    all)
      for f in "${FRONTEND_TEST_DIR}"/tc_[0-9][0-9][0-9][0-9].md; do
        [[ -f "$f" ]] && run_frontend_test "$(basename "$f" .md)"
      done
      ;;
    status)
      [[ -z "$SUBCMD_ARG" ]] && { log_error "Specify a test case"; exit 1; }
      get_last_result "$SUBCMD_ARG"
      ;;
    "")
      interactive_frontend_menu
      local ret=$?
      if [[ $ret -eq 2 ]]; then
        for f in "${FRONTEND_TEST_DIR}"/tc_[0-9][0-9][0-9][0-9].md; do
          [[ -f "$f" ]] && run_frontend_test "$(basename "$f" .md)"
        done
      fi
      ;;
  esac
  exit 0
fi

# Backend dispatch
if [[ "$MODE" == "backend" ]]; then
  case "${SUBCMD}" in
    list)
      list_backend_tests
      ;;
    run)
      [[ -z "$SUBCMD_ARG" ]] && { log_error "Specify a test file"; exit 1; }
      run_backend_test "${BACKEND_TEST_DIR}/${SUBCMD_ARG}"
      ;;
    all)
      run_all_backend_tests
      ;;
    "")
      interactive_backend_menu
      local ret=$?
      if [[ $ret -eq 2 ]]; then
        run_all_backend_tests
      fi
      ;;
  esac
  exit 0
fi

# Legacy compatibility: --status without --mode
if [[ "$SUBCMD" == "status" && -n "$SUBCMD_ARG" ]]; then
  get_last_result "$SUBCMD_ARG"
  exit 0
fi
