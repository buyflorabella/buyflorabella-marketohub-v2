#!/usr/bin/env bash
# performance.sh - Performance checks for Simple Site Validator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
load_config

check_page_performance() {
    local url="$1"
    local timeout="${CURL_TIMEOUT:-30}"
    local user_agent="${USER_AGENT:-SimpleSiteValidator/1.0}"

    local raw_output
    raw_output=$(curl -sL \
        --max-time "$timeout" \
        -A "$user_agent" \
        -w '\n__CURL_STATS__\nhttp_code:%{http_code}\ntime_total:%{time_total}\nsize_download:%{size_download}\ntime_connect:%{time_connect}\ntime_ttfb:%{time_starttransfer}\n' \
        -o - \
        "$url" 2>/dev/null) || {
        echo "{\"url\":\"$(json_escape "$url")\",\"status\":\"error\",\"error\":\"fetch_failed\"}"
        return
    }

    # Split body from stats
    local stats
    stats=$(echo "$raw_output" | sed -n '/__CURL_STATS__/,$p')

    local http_code time_total size_download time_connect time_ttfb
    http_code=$(echo "$stats" | grep '^http_code:' | cut -d: -f2)
    time_total=$(echo "$stats" | grep '^time_total:' | cut -d: -f2)
    size_download=$(echo "$stats" | grep '^size_download:' | cut -d: -f2)
    time_connect=$(echo "$stats" | grep '^time_connect:' | cut -d: -f2)
    time_ttfb=$(echo "$stats" | grep '^time_ttfb:' | cut -d: -f2)

    # Evaluate thresholds
    local max_size="${MAX_PAGE_SIZE_BYTES:-3145728}"
    local max_time="${MAX_RESPONSE_TIME_SECONDS:-5}"
    local slow_time="${SLOW_RESPONSE_TIME_SECONDS:-2}"

    local size_flag="ok"
    if awk "BEGIN{exit(!($size_download > $max_size))}"; then
        size_flag="over_limit"
    fi

    local time_flag="ok"
    if awk "BEGIN{exit(!($time_total > $max_time))}"; then
        time_flag="over_limit"
    elif awk "BEGIN{exit(!($time_total > $slow_time))}"; then
        time_flag="slow"
    fi

    # Human-readable size
    local size_human
    if (( ${size_download%.*} > 1048576 )); then
        size_human="$(awk "BEGIN{printf \"%.2f\", $size_download / 1048576}")MB"
    elif (( ${size_download%.*} > 1024 )); then
        size_human="$(awk "BEGIN{printf \"%.2f\", $size_download / 1024}")KB"
    else
        size_human="${size_download}B"
    fi

    echo "{\"url\":\"$(json_escape "$url")\",\"http_code\":$http_code,\"time_total_s\":$time_total,\"time_connect_s\":$time_connect,\"time_ttfb_s\":$time_ttfb,\"size_bytes\":$size_download,\"size_human\":\"$size_human\",\"size_flag\":\"$size_flag\",\"time_flag\":\"$time_flag\"}"
}

run_performance() {
    local start_url="$1"
    local dry_run="${2:-0}"

    log_info "Starting performance checks: $start_url"
    log_info "Thresholds: max_size=${MAX_PAGE_SIZE_BYTES:-3145728}B, max_time=${MAX_RESPONSE_TIME_SECONDS:-5}s, slow=${SLOW_RESPONSE_TIME_SECONDS:-2}s"

    if [[ "$dry_run" == "1" ]]; then
        log_info "[DRY RUN] Would check performance on $start_url"
        return 0
    fi

    # Use sitemap if it exists AND belongs to the same domain
    local urls=()
    local sitemap_file="${OUTPUT_DIR}/sitemap.json"
    local target_host
    target_host=$(get_host "$start_url")

    if [[ -f "$sitemap_file" ]] && has_jq; then
        local sitemap_host
        sitemap_host=$(jq -r '.pages[0].url // empty' "$sitemap_file" 2>/dev/null)
        sitemap_host=$(get_host "${sitemap_host:-}")

        if [[ -n "$sitemap_host" && "$sitemap_host" == "$target_host" ]]; then
            log_info "Using existing sitemap (matching domain): $sitemap_file"
            while IFS= read -r url; do
                urls+=("$url")
            done < <(jq -r '.pages[] | select(.status=="ok") | .url' "$sitemap_file" 2>/dev/null)
        else
            log_info "Ignoring sitemap (domain mismatch: $sitemap_host != $target_host)"
        fi
    fi

    # Always fall back to the provided URL if sitemap didn't match
    if [[ ${#urls[@]} -eq 0 ]]; then
        log_info "Checking provided URL only."
        urls+=("$start_url")
    fi

    log_info "Checking ${#urls[@]} page(s) for performance..."

    local page_results=()
    local flagged_size=()
    local flagged_slow=()
    local flagged_over_time=()

    for url in "${urls[@]}"; do
        log_info "Checking: $url"

        local result
        result=$(check_page_performance "$url")
        page_results+=("$result")

        # Track flags
        local sf tf
        sf=$(echo "$result" | grep -oP '"size_flag":"\K[^"]+')
        tf=$(echo "$result" | grep -oP '"time_flag":"\K[^"]+')

        [[ "$sf" == "over_limit" ]] && flagged_size+=("$url")
        [[ "$tf" == "slow" ]] && flagged_slow+=("$url")
        [[ "$tf" == "over_limit" ]] && flagged_over_time+=("$url")

        sleep "${CRAWL_DELAY:-1}"
    done

    write_performance_report \
        page_results flagged_size flagged_slow flagged_over_time
}

write_performance_report() {
    local -n _results=$1
    local -n _flag_size=$2
    local -n _flag_slow=$3
    local -n _flag_over=$4

    ensure_output_dir

    local report_file="${OUTPUT_DIR}/performance_report.json"

    {
        echo "{"
        echo "  \"generated\": \"$(date -Iseconds)\","
        echo "  \"total_pages_checked\": ${#_results[@]},"
        echo "  \"thresholds\": {"
        echo "    \"max_page_size_bytes\": ${MAX_PAGE_SIZE_BYTES:-3145728},"
        echo "    \"max_response_time_s\": ${MAX_RESPONSE_TIME_SECONDS:-5},"
        echo "    \"slow_response_time_s\": ${SLOW_RESPONSE_TIME_SECONDS:-2}"
        echo "  },"

        # Summary
        echo "  \"summary\": {"
        echo "    \"oversized_pages\": ${#_flag_size[@]},"
        echo "    \"slow_pages\": ${#_flag_slow[@]},"
        echo "    \"overtime_pages\": ${#_flag_over[@]}"
        echo "  },"

        # Per-page results
        echo "  \"pages\": ["
        local i=0
        for entry in "${_results[@]}"; do
            if [[ $i -gt 0 ]]; then
                echo "    ,$entry"
            else
                echo "    $entry"
            fi
            i=$((i + 1))
        done
        echo "  ]"

        echo "}"
    } > "$report_file"

    # Prettify with jq if available
    if has_jq; then
        local tmp
        tmp=$(jq '.' "$report_file" 2>/dev/null) && echo "$tmp" > "$report_file"
    fi

    log_info "Performance report saved to: $report_file"

    # Print summary
    echo ""
    echo "=== Performance Summary ==="
    echo "Pages checked:  ${#_results[@]}"
    echo "Oversized (>$(awk "BEGIN{printf \"%d\", ${MAX_PAGE_SIZE_BYTES:-3145728}/1048576}")MB): ${#_flag_size[@]}"
    echo "Slow (>${SLOW_RESPONSE_TIME_SECONDS:-2}s):     ${#_flag_slow[@]}"
    echo "Over limit (>${MAX_RESPONSE_TIME_SECONDS:-5}s): ${#_flag_over[@]}"
    echo "============================="
}
