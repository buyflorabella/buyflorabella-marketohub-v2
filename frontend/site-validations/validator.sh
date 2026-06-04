#!/usr/bin/env bash
# validator.sh - Simple Site Validator CLI
# A lightweight post-deployment validation toolkit
#
# Usage:
#   ./validator.sh crawl <url>
#   ./validator.sh analytics <url>
#   ./validator.sh analytics --page <url>
#   ./validator.sh performance <url>
#   ./validator.sh html <url> [--save]
#   ./validator.sh robots <url>
#   ./validator.sh all <url>

set -euo pipefail

VERSION="1.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source modules
source "${SCRIPT_DIR}/scripts/utils.sh"
source "${SCRIPT_DIR}/scripts/crawl.sh"
source "${SCRIPT_DIR}/scripts/analytics.sh"
source "${SCRIPT_DIR}/scripts/performance.sh"
source "${SCRIPT_DIR}/scripts/html.sh"
source "${SCRIPT_DIR}/scripts/robots.sh"

show_help() {
    cat <<'HELP'
Simple Site Validator v1.1.0

A minimal validation toolkit for post-deployment site checks.

USAGE:
    ./validator.sh <command> <url> [options]

COMMANDS:
    crawl <url>              Crawl a website and generate a sitemap
    analytics <url>          Detect Google Analytics and Microsoft Clarity
    analytics --page <url>   Validate analytics on a single target page
    performance <url>        Check response times and page sizes
    html <url>               Fetch and display raw HTML for any page
    robots <url>             Inspect and parse robots.txt with SEO warnings
    all <url>                Run all checks in sequence
    clean                    Remove all files from the output directory

OPTIONS:
    --dry-run           Preview what would happen without executing
    --verbose           Enable debug logging
    --save              Save output to file (used with html command)
    --page <url>        Target a specific page (used with analytics)
    --help, -h          Show this help message
    --version, -v       Show version

EXAMPLES:
    ./validator.sh html https://example.com
    ./validator.sh html https://example.com --save
    ./validator.sh analytics --page https://example.com/pricing
    ./validator.sh robots https://example.com
    ./validator.sh crawl https://example.com
    ./validator.sh analytics https://example.com --dry-run
    ./validator.sh performance https://example.com --verbose
    ./validator.sh all https://example.com

OUTPUT:
    Results are saved to the output/ directory:
        output/sitemap.json             Crawled site structure
        output/analytics_report.json    Analytics detection results
        output/performance_report.json  Performance metrics
        output/raw_html_*.html          Raw HTML snapshots (with --save)

CONFIGURATION:
    Edit config/thresholds.conf to adjust crawl depth, page size
    limits, response time thresholds, and robots.txt behavior.
    Set RESPECT_ROBOTS=false to temporarily override robots.txt.
    Environment variables override config file values.

HELP
}

show_version() {
    echo "Simple Site Validator v${VERSION}"
}

validate_url() {
    local url="$1"
    if [[ ! "$url" =~ ^https?:// ]]; then
        log_error "Invalid URL: $url"
        log_error "URL must start with http:// or https://"
        exit 1
    fi
}

main() {
    local command=""
    local url=""
    local dry_run=0
    local save_html=0
    local page_url=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            crawl|analytics|performance|html|robots|all|clean)
                command="$1"
                shift
                ;;
            --dry-run)
                dry_run=1
                shift
                ;;
            --verbose)
                export VERBOSE=1
                shift
                ;;
            --save)
                save_html=1
                shift
                ;;
            --page)
                shift
                if [[ $# -gt 0 ]]; then
                    page_url="$1"
                    shift
                else
                    log_error "--page requires a URL argument"
                    exit 1
                fi
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            --version|-v)
                show_version
                exit 0
                ;;
            http://*|https://*)
                url="$1"
                shift
                ;;
            *)
                log_error "Unknown argument: $1"
                echo "Run './validator.sh --help' for usage."
                exit 1
                ;;
        esac
    done

    # Validate inputs
    if [[ -z "$command" ]]; then
        show_help
        exit 0
    fi

    load_config

    # Clean doesn't need a URL
    if [[ "$command" == "clean" ]]; then
        if [[ -d "$OUTPUT_DIR" ]]; then
            local count
            count=$(find "$OUTPUT_DIR" -type f | wc -l)
            rm -f "$OUTPUT_DIR"/*
            log_info "Cleaned output directory: removed $count file(s) from $OUTPUT_DIR"
        else
            log_info "Output directory does not exist: $OUTPUT_DIR"
        fi
        return 0
    fi

    # Fall back to default URL from config if none provided
    if [[ -z "$url" ]]; then
        if [[ -n "${DEFAULT_URL:-}" ]]; then
            url="$DEFAULT_URL"
            log_info "No URL provided. Using default: $url"
        else
            log_error "No URL provided."
            echo "Usage: ./validator.sh $command <url>"
            exit 1
        fi
    fi

    validate_url "$url"

    log_info "Simple Site Validator v${VERSION}"
    log_info "Command: $command | Target: $url"
    [[ $dry_run -eq 1 ]] && log_info "Mode: DRY RUN"

    case "$command" in
        crawl)
            run_crawl "$url" "$dry_run"
            ;;
        analytics)
            if [[ -n "$page_url" ]]; then
                run_analytics_page "$page_url"
            else
                run_analytics "$url" "$dry_run"
            fi
            ;;
        performance)
            run_performance "$url" "$dry_run"
            ;;
        html)
            run_html "$url" "$save_html"
            ;;
        robots)
            run_robots "$url"
            ;;
        all)
            log_info "Running all checks..."
            echo ""
            run_crawl "$url" "$dry_run"
            echo ""
            run_analytics "$url" "$dry_run"
            echo ""
            run_performance "$url" "$dry_run"
            echo ""
            log_info "All checks complete. Results in: ${OUTPUT_DIR}/"
            ;;
    esac
}

main "$@"
