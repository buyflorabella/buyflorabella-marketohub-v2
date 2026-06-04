#!/usr/bin/env bash
# crawl.sh - Simple website crawler for Simple Site Validator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
load_config

# Globals
declare -A VISITED=()
SITEMAP_ENTRIES=()
SUBDOMAIN_ANNOTATIONS=()
CRAWL_ROBOTS_URL=""
CRAWL_ROBOTS_HTTP_CODE=""
CRAWL_RESPECT_ROBOTS=""
CRAWL_DISALLOWED_COUNT=0

run_crawl() {
    local start_url="$1"
    local dry_run="${2:-0}"
    local max_depth="${MAX_CRAWL_DEPTH:-20}"
    local max_pages="${MAX_PAGES:-200}"
    local delay="${CRAWL_DELAY:-1}"

    local base_host
    base_host=$(get_host "$start_url")
    local base_origin
    base_origin=$(get_base_url "$start_url")

    local respect_robots="${RESPECT_ROBOTS:-true}"

    log_info "Starting crawl: $start_url"
    log_info "Max depth: $max_depth | Max pages: $max_pages | Delay: ${delay}s"
    log_info "RESPECT_ROBOTS: $respect_robots"

    # Fetch robots.txt with status reporting
    local robots_url="${base_origin}/robots.txt"
    log_info "Fetching robots.txt: $robots_url"

    local robots_http_code
    local robots_body
    local robots_tmpfile
    robots_tmpfile=$(mktemp)

    robots_http_code=$(curl -sL \
        --max-time "${CURL_TIMEOUT:-30}" \
        -A "${USER_AGENT:-SimpleSiteValidator/1.0}" \
        -o "$robots_tmpfile" \
        -w '%{http_code}' \
        "$robots_url" 2>/dev/null) || robots_http_code="000"

    robots_body=""
    if [[ -f "$robots_tmpfile" ]]; then
        robots_body=$(cat "$robots_tmpfile")
        rm -f "$robots_tmpfile"
    fi

    # Report robots.txt status
    if [[ "$robots_http_code" == "200" ]]; then
        log_info "robots.txt: EXISTS (HTTP $robots_http_code) at $robots_url"
    else
        log_warn "robots.txt: MISSING (HTTP $robots_http_code) at $robots_url"
        log_info "No robots.txt found — no crawl restrictions in place."
    fi

    local disallowed=()
    if [[ "$robots_http_code" == "200" ]]; then
        while IFS= read -r path; do
            [[ -n "$path" ]] && disallowed+=("$path")
        done < <(fetch_robots_disallowed "$start_url")

        if [[ ${#disallowed[@]} -gt 0 ]]; then
            log_info "robots.txt disallowed paths: ${disallowed[*]}"
        else
            log_info "robots.txt found but no disallow rules apply to this validator."
        fi
    fi

    # If RESPECT_ROBOTS is disabled, clear disallowed list
    if [[ "$respect_robots" != "true" ]]; then
        log_warn "RESPECT_ROBOTS=false — ignoring robots.txt restrictions for this crawl."
        disallowed=()
    fi

    if [[ "$dry_run" == "1" ]]; then
        log_info "[DRY RUN] Would crawl $start_url with depth $max_depth"
        log_info "[DRY RUN] Disallowed paths: ${disallowed[*]:-none}"
        return 0
    fi

    # BFS crawl
    local queue=()
    local depths=()
    queue+=("$start_url")
    depths+=(0)
    local page_count=0

    while [[ ${#queue[@]} -gt 0 && $page_count -lt $max_pages ]]; do
        local current_url="${queue[0]}"
        local current_depth="${depths[0]}"
        queue=("${queue[@]:1}")
        depths=("${depths[@]:1}")

        # Skip if already visited
        if [[ -n "${VISITED[$current_url]:-}" ]]; then
            continue
        fi

        # Skip if too deep
        if [[ $current_depth -gt $max_depth ]]; then
            log_debug "Skipping (depth $current_depth > $max_depth): $current_url"
            continue
        fi

        # Check robots.txt
        local url_path
        url_path=$(echo "$current_url" | sed -E "s|${base_origin}||")
        url_path="${url_path:-/}"

        if [[ ${#disallowed[@]} -gt 0 ]] && is_disallowed "$url_path" "${disallowed[@]}"; then
            log_info "Skipped due to robots.txt: $current_url"
            VISITED["$current_url"]=1
            continue
        fi

        # Mark visited
        VISITED["$current_url"]=1
        page_count=$((page_count + 1))

        log_info "[$page_count] Crawling (depth $current_depth): $current_url"

        # Fetch page
        local html
        html=$(fetch_page "$current_url") || {
            log_warn "Failed to fetch: $current_url"
            SITEMAP_ENTRIES+=("{\"url\":\"$(json_escape "$current_url")\",\"depth\":$current_depth,\"status\":\"error\"}")
            continue
        }

        local title
        title=$(echo "$html" | grep -oiP '(?<=<title>).*?(?=</title>)' | head -1 || echo "")

        SITEMAP_ENTRIES+=("{\"url\":\"$(json_escape "$current_url")\",\"depth\":$current_depth,\"status\":\"ok\",\"title\":\"$(json_escape "$title")\"}")

        # Extract and process links
        local links
        links=$(extract_links "$html")

        while IFS= read -r href; do
            [[ -z "$href" ]] && continue

            local resolved
            resolved=$(normalize_url "$current_url" "$href") || continue

            local link_host
            link_host=$(get_host "$resolved")

            # Annotate subdomains (different host but shares root domain)
            if [[ "$link_host" != "$base_host" ]]; then
                local base_root
                base_root=$(echo "$base_host" | awk -F. '{print $(NF-1)"."$NF}')
                local link_root
                link_root=$(echo "$link_host" | awk -F. '{print $(NF-1)"."$NF}')

                if [[ "$base_root" == "$link_root" ]]; then
                    SUBDOMAIN_ANNOTATIONS+=("{\"subdomain\":\"$link_host\",\"found_on\":\"$(json_escape "$current_url")\"}")
                    log_debug "Subdomain found: $link_host (on $current_url)"
                fi
                continue
            fi

            # Queue if not visited and same host
            if [[ -z "${VISITED[$resolved]:-}" ]]; then
                queue+=("$resolved")
                depths+=($((current_depth + 1)))
            fi
        done <<< "$links"

        # Polite delay between requests
        sleep "$delay"
    done

    log_info "Crawl complete. Pages visited: $page_count"

    # Set globals for write_sitemap
    CRAWL_ROBOTS_URL="$robots_url"
    CRAWL_ROBOTS_HTTP_CODE="$robots_http_code"
    CRAWL_RESPECT_ROBOTS="$respect_robots"
    CRAWL_DISALLOWED_COUNT=${#disallowed[@]}

    write_sitemap
}

write_sitemap() {
    ensure_output_dir

    local sitemap_file="${OUTPUT_DIR}/sitemap.json"

    {
        echo "{"
        echo "  \"generated\": \"$(date -Iseconds)\","
        echo "  \"total_pages\": ${#SITEMAP_ENTRIES[@]},"

        # Pages array
        echo "  \"pages\": ["
        local i=0
        for entry in "${SITEMAP_ENTRIES[@]}"; do
            if [[ $i -gt 0 ]]; then
                echo "    ,$entry"
            else
                echo "    $entry"
            fi
            i=$((i + 1))
        done
        echo "  ],"

        # Subdomains
        echo "  \"subdomains_found\": ["
        i=0
        for annotation in "${SUBDOMAIN_ANNOTATIONS[@]}"; do
            if [[ $i -gt 0 ]]; then
                echo "    ,$annotation"
            else
                echo "    $annotation"
            fi
            i=$((i + 1))
        done
        echo "  ],"

        # Robots.txt info
        echo "  \"robots_txt\": {"
        echo "    \"url\": \"$(json_escape "$CRAWL_ROBOTS_URL")\","
        echo "    \"http_status\": $CRAWL_ROBOTS_HTTP_CODE,"
        echo "    \"exists\": $([ "$CRAWL_ROBOTS_HTTP_CODE" == "200" ] && echo true || echo false),"
        echo "    \"respect_robots\": $([ "$CRAWL_RESPECT_ROBOTS" == "true" ] && echo true || echo false),"
        echo "    \"disallowed_paths_count\": $CRAWL_DISALLOWED_COUNT"
        echo "  }"

        echo "}"
    } > "$sitemap_file"

    # Prettify with jq if available
    if has_jq; then
        local tmp
        tmp=$(jq '.' "$sitemap_file" 2>/dev/null) && echo "$tmp" > "$sitemap_file"
    fi

    log_info "Sitemap saved to: $sitemap_file"
}
