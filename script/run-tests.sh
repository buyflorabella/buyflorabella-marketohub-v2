#!/usr/bin/env bash
# Test runner
# Usage:
#   ./script/run-tests.sh           — run all tests
#   ./script/run-tests.sh unit      — run unit/model tests only (no live server needed)
#   ./script/run-tests.sh workflow  — run auth workflow tests only (requires live backend)
#   ./script/run-tests.sh -v        — verbose output

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE="${1:-all}"
PYTEST_EXTRA="${2:-}"
[ "$MODE" = "-v" ] && { PYTEST_EXTRA="-v"; MODE="all"; }

# Use BACKEND_PORT from environment (set by update-production.sh / run-backend.sh),
# falling back to 17150 (the dev default) when running tests directly.
BACKEND_PORT="${BACKEND_PORT:-17150}"
export TEST_BASE_URL="http://127.0.0.1:${BACKEND_PORT}"

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   buyflorabella Test Runner                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Target backend: ${TEST_BASE_URL}${NC}"
echo ""

# Check backend reachability (for workflow tests)
backend_up() {
    curl -sf "http://127.0.0.1:${BACKEND_PORT}/api/health" > /dev/null 2>&1
}

run_suite() {
    local name="$1"
    local testfile="$2"
    echo -e "${YELLOW}▶ Running: $name${NC}"
    if [[ ! -f "$BACKEND/$testfile" ]]; then
        echo -e "${YELLOW}⚠  $name — test file not found: $testfile (skipped)${NC}"
        return 0
    fi
    if cd "$BACKEND" && python3 -m pytest "$testfile" -v --tb=short 2>&1; then
        echo -e "${GREEN}✓ $name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $name FAILED${NC}"
        return 1
    fi
}

FAILURES=0

case "$MODE" in
  unit)
    run_suite "Unit: access levels & feature gates" "tests/test_access.py" || FAILURES=$((FAILURES+1))
    ;;
  workflow)
    if ! backend_up; then
        echo -e "${RED}✗ Backend not reachable at ${TEST_BASE_URL}${NC}"
        echo "  Start it with:  ./script/manage --backend"
        exit 1
    fi
    echo -e "${GREEN}✓ Backend is reachable${NC}"
    echo ""
    run_suite "Integration: auth workflow" "tests/test_auth_workflow.py" || FAILURES=$((FAILURES+1))
    ;;
  all|*)
    run_suite "Unit: access levels & feature gates" "tests/test_access.py" || FAILURES=$((FAILURES+1))
    echo ""
    if backend_up; then
        echo -e "${GREEN}✓ Backend is reachable — running integration tests${NC}"
        echo ""
        run_suite "Integration: auth workflow" "tests/test_auth_workflow.py" || FAILURES=$((FAILURES+1))
    else
        echo -e "${YELLOW}⚠  Backend not running — skipping integration tests${NC}"
        echo "   Start with:  ./script/manage --backend   then re-run this script"
    fi
    ;;
esac

echo ""
echo -e "${BLUE}══════════════════════════════════════════${NC}"
if [ "$FAILURES" -eq 0 ]; then
    echo -e "${GREEN}All test suites passed.${NC}"
else
    echo -e "${RED}$FAILURES suite(s) failed.${NC}"
    exit 1
fi
