#!/usr/bin/env bash
# html.sh - Raw HTML fetcher for Simple Site Validator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
load_config

run_html() {
    local url="$1"
    local save_output="${2:-0}"

    log_info "Fetching raw HTML: $url"

    local html
    html=$(fetch_page "$url") || {
        log_error "Failed to fetch: $url"
        return 1
    }

    if [[ "$save_output" == "1" ]]; then
        ensure_output_dir

        # Normalize URL into a safe filename
        local filename
        filename=$(echo "$url" | sed -E 's|https?://||; s|[/:?&#=]+|_|g; s|_$||')
        # Default to "homepage" if it's just the domain
        if [[ "$filename" =~ ^[^_/]+$ ]]; then
            filename="${filename}_homepage"
        fi

        local output_file="${OUTPUT_DIR}/raw_html_${filename}.html"
        echo "$html" > "$output_file"
        log_info "Raw HTML saved to: $output_file"
    else
        echo "$html"
    fi
}
