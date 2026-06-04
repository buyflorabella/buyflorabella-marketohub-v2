#!/usr/bin/env bash
# utils.sh - Shared utilities for Simple Site Validator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config/thresholds.conf"
OUTPUT_DIR="${SCRIPT_DIR}/output"

# Load configuration
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        # Source only lines that look like VAR=VALUE (skip comments/blanks)
        while IFS='=' read -r key value; do
            key=$(echo "$key" | xargs)
            [[ -z "$key" || "$key" == \#* ]] && continue
            value=$(echo "$value" | sed 's/#.*//' | xargs)
            # Only set if not already in environment (env overrides config)
            if [[ -z "${!key:-}" ]]; then
                export "$key=$value"
            fi
        done < "$CONFIG_FILE"
    else
        log_warn "Config file not found: $CONFIG_FILE (using defaults)"
    fi
}

# Logging helpers
log_info() {
    echo "[INFO]  $(date '+%H:%M:%S') $*" >&2
}

log_warn() {
    echo "[WARN]  $(date '+%H:%M:%S') $*" >&2
}

log_error() {
    echo "[ERROR] $(date '+%H:%M:%S') $*" >&2
}

log_debug() {
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        echo "[DEBUG] $(date '+%H:%M:%S') $*" >&2
    fi
}

# Extract the base URL (scheme + host) from a full URL
get_base_url() {
    local url="$1"
    echo "$url" | sed -E 's|(https?://[^/]+).*|\1|'
}

# Extract the host from a URL
get_host() {
    local url="$1"
    echo "$url" | sed -E 's|https?://([^/:]+).*|\1|'
}

# Normalize a URL: resolve relative paths, strip fragments, trailing slashes
normalize_url() {
    local base_url="$1"
    local href="$2"
    local result=""

    # Strip fragments
    href="${href%%#*}"

    # Skip empty, javascript:, mailto:, tel: links
    case "$href" in
        "") return 1 ;;
        javascript:*|mailto:*|tel:*|data:*) return 1 ;;
    esac

    # Absolute URL
    if [[ "$href" =~ ^https?:// ]]; then
        result="$href"
    # Protocol-relative
    elif [[ "$href" =~ ^// ]]; then
        local scheme
        scheme=$(echo "$base_url" | sed -E 's|(https?)://.*|\1|')
        result="${scheme}:${href}"
    # Root-relative
    elif [[ "$href" =~ ^/ ]]; then
        local origin
        origin=$(get_base_url "$base_url")
        result="${origin}${href}"
    # Relative
    else
        local dir
        dir=$(echo "$base_url" | sed -E 's|/[^/]*$|/|')
        result="${dir}${href}"
    fi

    # Strip query params and trailing slash for dedup purposes
    result="${result%%\?*}"
    result="${result%/}"

    # Skip non-HTML resources
    case "$result" in
        *.pdf|*.jpg|*.jpeg|*.png|*.gif|*.svg|*.css|*.js|*.zip|*.mp4|*.mp3|*.webp|*.ico|*.woff|*.woff2|*.ttf|*.eot)
            return 1 ;;
    esac

    echo "$result"
}

# Fetch a page with curl, returning the HTTP body
fetch_page() {
    local url="$1"
    local timeout="${CURL_TIMEOUT:-30}"
    local user_agent="${USER_AGENT:-SimpleSiteValidator/1.0}"

    curl -sL \
        --max-time "$timeout" \
        -A "$user_agent" \
        -o - \
        "$url" 2>/dev/null
}

# Fetch page with timing data; outputs body to stdout, timing to fd 3
fetch_page_with_timing() {
    local url="$1"
    local timeout="${CURL_TIMEOUT:-30}"
    local user_agent="${USER_AGENT:-SimpleSiteValidator/1.0}"

    curl -sL \
        --max-time "$timeout" \
        -A "$user_agent" \
        -w '\n__CURL_STATS__\nhttp_code:%{http_code}\ntime_total:%{time_total}\nsize_download:%{size_download}\ntime_connect:%{time_connect}\ntime_ttfb:%{time_starttransfer}\n' \
        -o - \
        "$url" 2>/dev/null
}

# Extract links from raw HTML (simple grep-based extraction)
extract_links() {
    local html="$1"
    echo "$html" | grep -oEi 'href="[^"]*"' | sed -E 's/href="([^"]*)"/\1/' | sort -u
}

# Parse robots.txt and return disallowed paths
fetch_robots_disallowed() {
    local base_url="$1"
    local robots_url
    robots_url="$(get_base_url "$base_url")/robots.txt"

    local robots_content
    robots_content=$(curl -sL --max-time 10 "$robots_url" 2>/dev/null) || true

    if [[ -z "$robots_content" ]]; then
        return
    fi

    local in_our_block=0
    while IFS= read -r line; do
        line=$(echo "$line" | sed 's/#.*//' | xargs)
        [[ -z "$line" ]] && continue

        if [[ "$line" =~ ^[Uu]ser-[Aa]gent: ]]; then
            local agent
            agent=$(echo "$line" | sed 's/[Uu]ser-[Aa]gent:\s*//' | xargs)
            if [[ "$agent" == "*" || "$agent" == "SimpleSiteValidator" ]]; then
                in_our_block=1
            else
                in_our_block=0
            fi
        elif [[ $in_our_block -eq 1 && "$line" =~ ^[Dd]isallow: ]]; then
            echo "$line" | sed 's/[Dd]isallow:\s*//' | xargs
        fi
    done <<< "$robots_content"
}

# Check if a path is disallowed by robots.txt rules
is_disallowed() {
    local path="$1"
    shift
    local disallowed_paths=("$@")

    for pattern in "${disallowed_paths[@]}"; do
        [[ -z "$pattern" ]] && continue
        if [[ "$path" == "$pattern"* ]]; then
            return 0
        fi
    done
    return 1
}

# Ensure output directory exists
ensure_output_dir() {
    mkdir -p "$OUTPUT_DIR"
}

# JSON escape a string
json_escape() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    echo "$s"
}

# Check if jq is available
has_jq() {
    command -v jq &>/dev/null
}
