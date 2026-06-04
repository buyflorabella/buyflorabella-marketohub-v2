#!/usr/bin/env bash
# Diagnose and kill orphaned buyflorabella backend (Python/Gunicorn) and
# frontend (Node/Vite) processes.
#
# Usage:
#   ./script/kill-zombie-backend.sh              → dev env, interactive kill
#   ./script/kill-zombie-backend.sh dev          → dev only
#   ./script/kill-zombie-backend.sh prod         → prod only
#   ./script/kill-zombie-backend.sh --check      → diagnose only, no kill prompt

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ---------- arg parsing ----------
ENVS=()
CHECK_ONLY=false
for arg in "$@"; do
  case "$arg" in
    dev|prod) ENVS+=("$arg") ;;
    --check)  CHECK_ONLY=true ;;
    *) echo "Usage: $0 [dev|prod] [--check]" >&2; exit 1 ;;
  esac
done
[[ ${#ENVS[@]} -eq 0 ]] && ENVS=(dev)

# ---------- port lookup from settings files ----------
declare -A BACKEND_PORTS
declare -A FRONTEND_PORTS

for env in "${ENVS[@]}"; do
  settings="${SCRIPT_DIR}/settings.${env}.txt"
  if [[ -f "$settings" ]]; then
    bp=$(grep -E '^BACKEND_PORT='  "$settings" | cut -d'=' -f2 | tr -d '"' | head -1)
    fp=$(grep -E '^FRONTEND_PORT=' "$settings" | cut -d'=' -f2 | tr -d '"' | head -1)
    [[ -n "$bp" ]] && BACKEND_PORTS[$env]="$bp"
    [[ -n "$fp" ]] && FRONTEND_PORTS[$env]="$fp"
  fi
done

# Fallback to buyflorabella known ports
[[ -z "${BACKEND_PORTS[dev]:-}"  ]] && BACKEND_PORTS[dev]="5000"
[[ -z "${BACKEND_PORTS[prod]:-}" ]] && BACKEND_PORTS[prod]="5000"
[[ -z "${FRONTEND_PORTS[dev]:-}" ]] && FRONTEND_PORTS[dev]="5001"
[[ -z "${FRONTEND_PORTS[prod]:-}" ]] && FRONTEND_PORTS[prod]="5001"

# ---------- systemd service map (port → service unit) ----------
declare -A BACKEND_SERVICES

unit_for_pid() {
  local pid="$1"
  local unit
  unit=$(systemctl show "$pid" --property=Id 2>/dev/null | cut -d= -f2)
  [[ "$unit" == *.service ]] && echo "$unit"
}

# ---------- helpers ----------
port_pids() {
  local port="$1"
  local pids

  pids=$(ss -tlnp "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u)
  [[ -n "$pids" ]] && { echo "$pids"; return; }

  local hex_port inode
  hex_port=$(printf '%04X' "$port")
  inode=$(awk -v hp=":${hex_port}" '$4=="0A" && $2~hp"$"{print $10}' /proc/net/tcp  2>/dev/null | head -1)
  [[ -n "$inode" ]] || \
  inode=$(awk -v hp=":${hex_port}" '$4=="0A" && $2~hp"$"{print $10}' /proc/net/tcp6 2>/dev/null | head -1)

  if [[ -n "$inode" ]]; then
    grep -rl "socket:\[${inode}\]" /proc/*/fd 2>/dev/null \
      | grep -oP '/proc/\K[0-9]+(?=/fd)' \
      | sort -u
  fi
}

proc_cwd() { readlink -f "/proc/$1/cwd" 2>/dev/null || echo "(unknown)"; }
proc_cmd() { tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null || echo "(unknown)"; }

# ---------- collect PIDs ----------
declare -A PID_SOURCE
declare -A PID_CWD
declare -A PID_CMD
declare -A PID_TYPE
FOUND_PIDS=()

add_pid() {
  local pid="$1" source="$2" type="$3"
  PID_SOURCE[$pid]="$source"
  PID_CWD[$pid]=$(proc_cwd "$pid")
  PID_CMD[$pid]=$(proc_cmd "$pid")
  PID_TYPE[$pid]="$type"
  FOUND_PIDS+=("$pid")
}

for env in "${ENVS[@]}"; do
  port="${BACKEND_PORTS[$env]}"
  for pid in $(port_pids "$port"); do
    [[ -z "${PID_SOURCE[$pid]:-}" ]] && add_pid "$pid" "${env}:${port}" "backend"
  done
done

for pid in $(ps -eo pid= 2>/dev/null); do
  [[ -d "/proc/$pid" ]] || continue
  [[ -n "${PID_SOURCE[$pid]:-}" ]] && continue
  cwd=$(proc_cwd "$pid")
  [[ "$cwd" == "${REPO_ROOT}"* ]] || continue
  cmd=$(proc_cmd "$pid")
  [[ "$cmd" =~ app\.py|gunicorn ]] || continue
  add_pid "$pid" "worktree:?" "backend"
done

for env in "${ENVS[@]}"; do
  port="${FRONTEND_PORTS[$env]}"
  for pid in $(port_pids "$port"); do
    [[ -z "${PID_SOURCE[$pid]:-}" ]] && add_pid "$pid" "${env}:${port}" "frontend"
  done
done

for pid in $(ps -eo pid= 2>/dev/null); do
  [[ -d "/proc/$pid" ]] || continue
  [[ -n "${PID_SOURCE[$pid]:-}" ]] && continue
  cwd=$(proc_cwd "$pid")
  [[ "$cwd" == "${REPO_ROOT}"* ]] || continue
  cmd=$(proc_cmd "$pid")
  [[ "$cmd" =~ node|vite ]] || continue
  add_pid "$pid" "worktree:?" "frontend"
done

# ---------- port status report ----------
echo ""
echo "=== buyflorabella process report ==="
echo ""

echo "  Backend ports:"
for env in "${ENVS[@]}"; do
  port="${BACKEND_PORTS[$env]}"
  count=$(ss -tlnp "sport = :$port" 2>/dev/null | grep -c "LISTEN" || true)
  [[ "$count" -gt 0 ]] \
    && echo "    ⚠️  $port ($env backend): OCCUPIED" \
    || echo "    ✅ $port ($env backend): free"
done

echo ""
echo "  Frontend ports:"
for env in "${ENVS[@]}"; do
  port="${FRONTEND_PORTS[$env]}"
  count=$(ss -tlnp "sport = :$port" 2>/dev/null | grep -c "LISTEN" || true)
  [[ "$count" -gt 0 ]] \
    && echo "    ⚠️  $port ($env frontend): OCCUPIED" \
    || echo "    ✅ $port ($env frontend): free"
done

echo ""

if [[ ${#FOUND_PIDS[@]} -eq 0 ]]; then
  echo "  No orphaned processes found."
  echo ""
  exit 0
fi

BACKEND_PIDS=()
FRONTEND_PIDS=()
for pid in "${FOUND_PIDS[@]}"; do
  [[ "${PID_TYPE[$pid]}" == "backend"  ]] && BACKEND_PIDS+=("$pid")
  [[ "${PID_TYPE[$pid]}" == "frontend" ]] && FRONTEND_PIDS+=("$pid")
done

print_table() {
  local label="$1"; shift
  [[ $# -eq 0 ]] && return
  local pids=("$@")
  echo "  ${label}:"
  printf "    %-8s %-14s %-40s %s\n" "PID" "SOURCE" "CWD" "CMD"
  printf "    %-8s %-14s %-40s %s\n" "---" "------" "---" "---"
  for pid in "${pids[@]}"; do
    cwd="${PID_CWD[$pid]:-?}"
    short_cwd="${cwd/${REPO_ROOT}\//}"
    cmd="${PID_CMD[$pid]:-?}"
    printf "    %-8s %-14s %-40s %s\n" \
      "$pid" "${PID_SOURCE[$pid]}" "${short_cwd:0:40}" "${cmd:0:55}"
  done
  echo ""
}

[[ ${#BACKEND_PIDS[@]}  -gt 0 ]] && print_table "Backend processes"  "${BACKEND_PIDS[@]}"
[[ ${#FRONTEND_PIDS[@]} -gt 0 ]] && print_table "Frontend processes" "${FRONTEND_PIDS[@]}"

$CHECK_ONLY && exit 0

# ---------- detect systemd-managed PIDs ----------
declare -A SYSTEMD_UNITS
declare -A PID_UNIT

for pid in "${FOUND_PIDS[@]}"; do
  unit=$(unit_for_pid "$pid")
  PID_UNIT[$pid]="${unit:-}"
  if [[ -n "$unit" ]]; then
    SYSTEMD_UNITS["$unit"]=1
  fi
done

if [[ ${#SYSTEMD_UNITS[@]} -gt 0 ]]; then
  echo "  ⚠️  Systemd-managed services detected (Restart=always):"
  for unit in "${!SYSTEMD_UNITS[@]}"; do
    echo "       $unit"
  done
  echo "  → Will use 'systemctl stop' to prevent auto-restart."
  echo ""
fi

# ---------- kill prompt ----------
read -r -p "👉 Kill all listed processes? (y/n) " reply
[[ "$reply" =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 0; }
echo ""

for unit in "${!SYSTEMD_UNITS[@]}"; do
  echo "  sudo systemctl stop $unit"
  sudo systemctl stop "$unit" 2>/dev/null || echo "  ⚠️  Failed to stop $unit"
done
[[ ${#SYSTEMD_UNITS[@]} -gt 0 ]] && sleep 2

for pid in "${FOUND_PIDS[@]}"; do
  [[ -d "/proc/$pid" ]] || continue
  unit="${PID_UNIT[$pid]:-}"
  if [[ -z "$unit" ]]; then
    echo "  Sending SIGTERM → PID $pid (${PID_TYPE[$pid]})"
    kill -TERM "$pid" 2>/dev/null || true
  else
    echo "  Sending SIGKILL → PID $pid (straggler from $unit)"
    kill -KILL "$pid" 2>/dev/null || true
  fi
done

sleep 1

for pid in "${FOUND_PIDS[@]}"; do
  [[ -d "/proc/$pid" ]] || continue
  [[ -n "${PID_UNIT[$pid]:-}" ]] && continue
  echo "  Still alive — sending SIGKILL → PID $pid"
  kill -KILL "$pid" 2>/dev/null || true
done

sleep 1

if [[ ${#SYSTEMD_UNITS[@]} -gt 0 ]]; then
  echo ""
  echo "  ℹ️  Stopped service(s) will not restart automatically."
  echo "     To restart:  sudo systemctl start <service>"
  for unit in "${!SYSTEMD_UNITS[@]}"; do
    echo "       sudo systemctl start $unit"
  done
fi

# ---------- verify ----------
echo ""
echo "=== Verification ==="
echo ""
any_open=false

for env in "${ENVS[@]}"; do
  for label in backend frontend; do
    [[ "$label" == "backend"  ]] && port="${BACKEND_PORTS[$env]}"
    [[ "$label" == "frontend" ]] && port="${FRONTEND_PORTS[$env]}"
    result=$(ss -tlnp "sport = :$port" 2>/dev/null | grep LISTEN || true)
    if [[ -n "$result" ]]; then
      echo "  ⚠️  Port $port ($env $label) still occupied:"
      echo "$result" | sed 's/^/    /'
      any_open=true
    else
      echo "  ✅ Port $port ($env $label): free"
    fi
  done
done

echo ""
if $any_open; then
  echo "❌ Some ports still in use — manual intervention needed."
  exit 1
fi
echo "✅ All processes terminated."
exit 0
