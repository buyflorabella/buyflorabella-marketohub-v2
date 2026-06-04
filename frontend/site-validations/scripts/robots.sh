#!/usr/bin/env bash
# robots.sh - robots.txt inspection for Simple Site Validator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
load_config

run_robots() {
    local url="$1"
    local base_origin
    base_origin=$(get_base_url "$url")
    local robots_url="${base_origin}/robots.txt"

    log_info "Inspecting robots.txt: $robots_url"

    # Fetch with HTTP status
    local http_code
    local robots_content
    local tmpfile
    tmpfile=$(mktemp)

    http_code=$(curl -sL \
        --max-time "${CURL_TIMEOUT:-30}" \
        -A "${USER_AGENT:-SimpleSiteValidator/1.0}" \
        -o "$tmpfile" \
        -w '%{http_code}' \
        "$robots_url" 2>/dev/null) || http_code="000"

    robots_content=""
    if [[ -f "$tmpfile" ]]; then
        robots_content=$(cat "$tmpfile")
        rm -f "$tmpfile"
    fi

    echo ""
    echo "=== robots.txt Inspection ==="
    echo "URL:         $robots_url"
    echo "HTTP Status: $http_code"

    # Check existence
    if [[ "$http_code" != "200" ]]; then
        echo "Status:      MISSING (HTTP $http_code)"
        echo ""
        echo "robots.txt was not found at $robots_url"
        echo "This means no crawl restrictions are in place."
        echo "==============================="
        return 0
    fi

    echo "Status:      EXISTS"
    echo ""

    # Raw contents
    echo "--- Raw Contents ---"
    echo "$robots_content"
    echo "--- End Raw Contents ---"
    echo ""

    # Parse and summarize
    echo "--- Parsed Summary ---"

    local user_agents=()
    local disallow_rules=()
    local allow_rules=()
    local sitemap_entries=()
    local homepage_disallowed=0
    local broad_disallow=0
    local current_agent=""

    while IFS= read -r line; do
        # Strip comments and whitespace
        local clean
        clean=$(echo "$line" | sed 's/#.*//' | xargs)
        [[ -z "$clean" ]] && continue

        if [[ "$clean" =~ ^[Uu]ser-[Aa]gent:\ *(.*) ]]; then
            current_agent="${BASH_REMATCH[1]}"
            user_agents+=("$current_agent")

        elif [[ "$clean" =~ ^[Dd]isallow:\ *(.*) ]]; then
            local path="${BASH_REMATCH[1]}"
            disallow_rules+=("[$current_agent] $path")

            # Check for broad disallow and homepage disallow (wildcard agent only)
            if [[ "$current_agent" == "*" ]]; then
                if [[ "$path" == "/" ]]; then
                    broad_disallow=1
                    homepage_disallowed=1
                fi
            fi

        elif [[ "$clean" =~ ^[Aa]llow:\ *(.*) ]]; then
            allow_rules+=("[$current_agent] ${BASH_REMATCH[1]}")

        elif [[ "$clean" =~ ^[Ss]itemap:\ *(.*) ]]; then
            sitemap_entries+=("${BASH_REMATCH[1]}")
        fi
    done <<< "$robots_content"

    # Unique user-agents
    echo "User-Agents found:"
    if [[ ${#user_agents[@]} -gt 0 ]]; then
        printf '%s\n' "${user_agents[@]}" | sort -u | while read -r agent; do
            echo "  - $agent"
        done
    else
        echo "  (none)"
    fi
    echo ""

    echo "Disallow rules:"
    if [[ ${#disallow_rules[@]} -gt 0 ]]; then
        for rule in "${disallow_rules[@]}"; do
            echo "  $rule"
        done
    else
        echo "  (none)"
    fi
    echo ""

    echo "Allow rules:"
    if [[ ${#allow_rules[@]} -gt 0 ]]; then
        for rule in "${allow_rules[@]}"; do
            echo "  $rule"
        done
    else
        echo "  (none)"
    fi
    echo ""

    echo "Sitemap entries:"
    if [[ ${#sitemap_entries[@]} -gt 0 ]]; then
        for entry in "${sitemap_entries[@]}"; do
            echo "  - $entry"
        done
    else
        echo "  (none declared)"
    fi
    echo ""

    # Validator behavior
    local respect_robots="${RESPECT_ROBOTS:-true}"
    echo "Validator behavior:"
    echo "  RESPECT_ROBOTS=$respect_robots"
    if [[ "$respect_robots" == "true" ]]; then
        echo "  The validator IS respecting robots.txt rules during crawling."
    else
        echo "  The validator is NOT respecting robots.txt (override enabled)."
    fi
    echo ""

    # SEO risk warnings
    local warnings=0
    echo "--- SEO Risk Warnings ---"

    if [[ $broad_disallow -eq 1 ]]; then
        echo "  WARNING: Broad 'Disallow: /' found for User-agent: *"
        echo "           This blocks ALL crawlers from the entire site."
        echo "           This will prevent search engine indexing."
        warnings=$((warnings + 1))
    fi

    if [[ $homepage_disallowed -eq 1 ]]; then
        echo "  WARNING: Homepage (/) is disallowed."
        echo "           Search engines cannot crawl your homepage."
        warnings=$((warnings + 1))
    fi

    if [[ ${#sitemap_entries[@]} -eq 0 ]]; then
        echo "  NOTE: No Sitemap directive found in robots.txt."
        echo "        Consider adding: Sitemap: ${base_origin}/sitemap.xml"
        warnings=$((warnings + 1))
    fi

    if [[ $warnings -eq 0 ]]; then
        echo "  No SEO risks detected."
    fi

    echo "==============================="
}
