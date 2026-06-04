#!/usr/bin/env bash
# analytics.sh - Analytics detection for Simple Site Validator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
load_config

# Analytics detection patterns
GA4_PATTERNS=(
    'gtag'
    'googletagmanager'
    'google-analytics'
    'G-[A-Z0-9]+'
    'GT-[A-Z0-9]+'
    'UA-[0-9]+-[0-9]+'
)

CLARITY_PATTERNS=(
    'clarity\.ms'
    'clarity.js'
    'microsoft.*clarity'
)

detect_analytics_on_page() {
    local url="$1"
    local html="$2"

    local ga_found=0
    local ga_ids=()
    local clarity_found=0

    # Detect GA4 / GTM
    for pattern in "${GA4_PATTERNS[@]}"; do
        local matches
        matches=$(echo "$html" | grep -oEi "$pattern" | sort -u) || true
        if [[ -n "$matches" ]]; then
            ga_found=1
            while IFS= read -r match; do
                ga_ids+=("$match")
            done <<< "$matches"
        fi
    done

    # Detect Clarity
    for pattern in "${CLARITY_PATTERNS[@]}"; do
        if echo "$html" | grep -qiE "$pattern"; then
            clarity_found=1
            break
        fi
    done

    # Deduplicate GA IDs
    local unique_ids=()
    if [[ ${#ga_ids[@]} -gt 0 ]]; then
        while IFS= read -r id; do
            unique_ids+=("$id")
        done < <(printf '%s\n' "${ga_ids[@]}" | sort -u)
    fi

    local ids_json="[]"
    if [[ ${#unique_ids[@]} -gt 0 ]]; then
        ids_json="["
        local first=1
        for id in "${unique_ids[@]}"; do
            if [[ $first -eq 1 ]]; then
                ids_json+="\"$(json_escape "$id")\""
                first=0
            else
                ids_json+=",\"$(json_escape "$id")\""
            fi
        done
        ids_json+="]"
    fi

    echo "{\"url\":\"$(json_escape "$url")\",\"google_analytics\":$ga_found,\"ga_identifiers\":$ids_json,\"microsoft_clarity\":$clarity_found}"
}

run_analytics_page() {
    local url="$1"

    log_info "Targeted analytics check: $url"

    local html
    html=$(fetch_page "$url") || {
        log_error "Failed to fetch: $url"
        return 1
    }

    local result
    result=$(detect_analytics_on_page "$url" "$html")

    local has_ga has_clarity
    has_ga=$(echo "$result" | grep -oP '"google_analytics":\K[01]')
    has_clarity=$(echo "$result" | grep -oP '"microsoft_clarity":\K[01]')

    echo ""
    echo "=== Targeted Analytics Validation ==="
    echo "URL: $url"
    echo ""

    # Google Analytics
    if [[ "$has_ga" == "1" ]]; then
        local ga_ids
        ga_ids=$(echo "$result" | grep -oP '"ga_identifiers":\[\K[^\]]+' | tr ',' '\n' | tr -d '"' | sed 's/^ //')
        echo "Google Analytics:    PASS"
        echo "  Matched snippets:"
        while IFS= read -r id; do
            [[ -n "$id" ]] && echo "    - $id"
        done <<< "$ga_ids"
    else
        echo "Google Analytics:    FAIL (not detected)"
    fi

    echo ""

    # Microsoft Clarity
    if [[ "$has_clarity" == "1" ]]; then
        echo "Microsoft Clarity:   PASS"
    else
        echo "Microsoft Clarity:   FAIL (not detected)"
    fi

    echo ""

    # Overall verdict
    if [[ "$has_ga" == "1" && "$has_clarity" == "1" ]]; then
        echo "Overall: PASS (all analytics present)"
    elif [[ "$has_ga" == "1" || "$has_clarity" == "1" ]]; then
        echo "Overall: PARTIAL (some analytics missing)"
    else
        echo "Overall: FAIL (no analytics detected)"
    fi
    echo "======================================"
}

run_analytics() {
    local start_url="$1"
    local dry_run="${2:-0}"

    log_info "Starting analytics detection: $start_url"

    if [[ "$dry_run" == "1" ]]; then
        log_info "[DRY RUN] Would check analytics on $start_url"
        log_info "[DRY RUN] GA4 patterns: ${GA4_PATTERNS[*]}"
        log_info "[DRY RUN] Clarity patterns: ${CLARITY_PATTERNS[*]}"
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

    log_info "Checking ${#urls[@]} page(s) for analytics..."

    local page_results=()
    local pages_with_ga=()
    local pages_without_ga=()
    local pages_with_clarity=()
    local pages_without_clarity=()
    local homepage_result=""

    local base_origin
    base_origin=$(get_base_url "$start_url")

    for url in "${urls[@]}"; do
        log_info "Checking: $url"

        local html
        html=$(fetch_page "$url") || {
            log_warn "Failed to fetch: $url"
            continue
        }

        local result
        result=$(detect_analytics_on_page "$url" "$html")
        page_results+=("$result")

        # Track GA presence
        local has_ga
        has_ga=$(echo "$result" | grep -oP '"google_analytics":\K[01]')
        if [[ "$has_ga" == "1" ]]; then
            pages_with_ga+=("$url")
        else
            pages_without_ga+=("$url")
        fi

        # Track Clarity presence
        local has_clarity
        has_clarity=$(echo "$result" | grep -oP '"microsoft_clarity":\K[01]')
        if [[ "$has_clarity" == "1" ]]; then
            pages_with_clarity+=("$url")
        else
            pages_without_clarity+=("$url")
        fi

        # Homepage check
        local normalized_url="${url%/}"
        local normalized_origin="${base_origin%/}"
        if [[ "$normalized_url" == "$normalized_origin" ]]; then
            homepage_result="$result"
        fi

        sleep "${CRAWL_DELAY:-1}"
    done

    write_analytics_report \
        page_results \
        pages_with_ga pages_without_ga \
        pages_with_clarity pages_without_clarity \
        "$homepage_result"
}

write_analytics_report() {
    local -n _page_results=$1
    local -n _with_ga=$2
    local -n _without_ga=$3
    local -n _with_clarity=$4
    local -n _without_clarity=$5
    local homepage_result="$6"

    ensure_output_dir

    local report_file="${OUTPUT_DIR}/analytics_report.json"

    {
        echo "{"
        echo "  \"generated\": \"$(date -Iseconds)\","
        echo "  \"total_pages_checked\": ${#_page_results[@]},"

        # Summary
        echo "  \"summary\": {"
        echo "    \"google_analytics\": {"
        echo "      \"found_on\": ${#_with_ga[@]},"
        echo "      \"missing_on\": ${#_without_ga[@]}"
        echo "    },"
        echo "    \"microsoft_clarity\": {"
        echo "      \"found_on\": ${#_with_clarity[@]},"
        echo "      \"missing_on\": ${#_without_clarity[@]}"
        echo "    }"
        echo "  },"

        # Homepage validation
        echo "  \"homepage_validation\": {"
        if [[ -n "$homepage_result" ]]; then
            local hp_ga hp_clarity
            hp_ga=$(echo "$homepage_result" | grep -oP '"google_analytics":\K[01]')
            hp_clarity=$(echo "$homepage_result" | grep -oP '"microsoft_clarity":\K[01]')
            echo "    \"checked\": true,"
            echo "    \"google_analytics_present\": $([ "$hp_ga" == "1" ] && echo true || echo false),"
            echo "    \"microsoft_clarity_present\": $([ "$hp_clarity" == "1" ] && echo true || echo false)"
        else
            echo "    \"checked\": false,"
            echo "    \"note\": \"Homepage was not in the checked pages\""
        fi
        echo "  },"

        # Per-page results
        echo "  \"pages\": ["
        local i=0
        for entry in "${_page_results[@]}"; do
            if [[ $i -gt 0 ]]; then
                echo "    ,$entry"
            else
                echo "    $entry"
            fi
            i=$((i + 1))
        done
        echo "  ],"

        # Missing analytics lists
        echo "  \"pages_missing_ga\": ["
        i=0
        for url in "${_without_ga[@]}"; do
            if [[ $i -gt 0 ]]; then
                echo "    ,\"$(json_escape "$url")\""
            else
                echo "    \"$(json_escape "$url")\""
            fi
            i=$((i + 1))
        done
        echo "  ],"

        echo "  \"pages_missing_clarity\": ["
        i=0
        for url in "${_without_clarity[@]}"; do
            if [[ $i -gt 0 ]]; then
                echo "    ,\"$(json_escape "$url")\""
            else
                echo "    \"$(json_escape "$url")\""
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

    log_info "Analytics report saved to: $report_file"

    # Print summary
    echo ""
    echo "=== Analytics Summary ==="
    echo "Pages checked:    ${#_page_results[@]}"
    echo "GA found on:      ${#_with_ga[@]} page(s)"
    echo "GA missing on:    ${#_without_ga[@]} page(s)"
    echo "Clarity found on: ${#_with_clarity[@]} page(s)"
    echo "Clarity missing:  ${#_without_clarity[@]} page(s)"
    if [[ -n "$homepage_result" ]]; then
        local hp_ga
        hp_ga=$(echo "$homepage_result" | grep -oP '"google_analytics":\K[01]')
        local hp_clarity
        hp_clarity=$(echo "$homepage_result" | grep -oP '"microsoft_clarity":\K[01]')
        echo "Homepage GA:      $([ "$hp_ga" == "1" ] && echo "PASS" || echo "FAIL")"
        echo "Homepage Clarity: $([ "$hp_clarity" == "1" ] && echo "PASS" || echo "FAIL")"
    fi
    echo "========================="
}
