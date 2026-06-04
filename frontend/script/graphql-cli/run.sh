#!/bin/bash
#
# Shopify GraphQL CLI Tool
# Run GraphQL queries against Shopify Admin or Storefront API
#
# Structure:
#   queries/XX_name.json     - Metadata (name, description, api, variables)
#   queries/XX_name.graphql  - The actual GraphQL query
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUERIES_DIR="$SCRIPT_DIR/queries"
CONFIG_FILE="$SCRIPT_DIR/config.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Load config
if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
else
    echo -e "${RED}Error: config.sh not found${NC}"
    echo "Please create $CONFIG_FILE with your Shopify credentials"
    exit 1
fi

# Check for jq
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed${NC}"
    echo "Install with: sudo apt-get install jq"
    exit 1
fi

# Function to display header
show_header() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}              ${GREEN}Shopify GraphQL CLI Tool${NC}                              ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  Store: ${YELLOW}$SHOPIFY_STORE${NC}"
    echo -e "${CYAN}║${NC}  API Version: ${YELLOW}$API_VERSION${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${RED}[ADMIN]${NC}      https://$SHOPIFY_STORE/admin/api/$API_VERSION/graphql.json"
    echo -e "${CYAN}║${NC}  ${BLUE}[STOREFRONT]${NC} https://$SHOPIFY_STORE/api/$API_VERSION/graphql.json"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to extract number prefix from filename (e.g., "00_ping" -> "00")
get_file_number() {
    local basename="$1"
    echo "$basename" | grep -oE '^[0-9]+' || echo ""
}

# Function to list available queries
list_queries() {
    echo -e "${BLUE}Available Queries:${NC}"
    echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"

    for file in "$QUERIES_DIR"/*.json; do
        if [[ -f "$file" ]]; then
            local name=$(jq -r '.name' "$file")
            local desc=$(jq -r '.description' "$file")
            local api=$(jq -r '.api' "$file")
            local basename=$(basename "$file" .json)
            local graphql_file="$QUERIES_DIR/${basename}.graphql"
            local file_num=$(get_file_number "$basename")

            # Check if .graphql file exists
            local file_status=""
            if [[ -f "$graphql_file" ]]; then
                file_status="${GREEN}✓${NC}"
            else
                file_status="${RED}✗ missing .graphql${NC}"
            fi

            # Color-code API type
            local api_badge=""
            if [[ "$api" == "admin" ]]; then
                api_badge="${RED}[ADMIN]${NC}"
            elif [[ "$api" == "storefront" ]]; then
                api_badge="${BLUE}[STOREFRONT]${NC}"
            else
                api_badge="${YELLOW}[$api]${NC}"
            fi

            # Use file number prefix as the selection number
            printf "${GREEN}[%2s]${NC} $api_badge ${YELLOW}$name${NC} $file_status\n" "$file_num"
            echo -e "     ${GRAY}$desc${NC}"
            echo ""
        fi
    done

    echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"
    echo -e "${GREEN}[v]${NC} View a query without executing"
    echo -e "${GREEN}[c]${NC} Check config"
    echo -e "${GREEN}[q]${NC} Quit"
    echo ""
}

# Function to read graphql file and minify for curl
read_graphql_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        # Read file and collapse to single line, preserving string contents
        cat "$file" | tr '\n' ' ' | sed 's/  */ /g'
    else
        echo ""
    fi
}

# Function to view a query
view_query() {
    local file="$1"
    local basename=$(basename "$file" .json)
    local graphql_file="$QUERIES_DIR/${basename}.graphql"

    echo -e "${CYAN}Metadata (${basename}.json):${NC}"
    echo -e "${GRAY}─────────────────────────────────────────────────────────────${NC}"
    cat "$file" | jq '.'
    echo ""

    if [[ -f "$graphql_file" ]]; then
        echo -e "${CYAN}Query (${basename}.graphql):${NC}"
        echo -e "${GRAY}─────────────────────────────────────────────────────────────${NC}"
        cat "$graphql_file"
    else
        echo -e "${RED}No .graphql file found: ${basename}.graphql${NC}"
    fi
}

# Function to execute a query
execute_query() {
    local json_file="$1"

    if [[ ! -f "$json_file" ]]; then
        echo -e "${RED}Error: JSON file not found${NC}"
        return 1
    fi

    local basename=$(basename "$json_file" .json)
    local graphql_file="$QUERIES_DIR/${basename}.graphql"

    if [[ ! -f "$graphql_file" ]]; then
        echo -e "${RED}Error: GraphQL file not found: ${graphql_file}${NC}"
        return 1
    fi

    local name=$(jq -r '.name' "$json_file")
    local api=$(jq -r '.api' "$json_file")
    local variables=$(jq -r '.variables // empty' "$json_file")
    local query=$(read_graphql_file "$graphql_file")

    # Show API type with prominent badge
    if [[ "$api" == "admin" ]]; then
        echo -e "${RED}╔═══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ADMIN API REQUEST                                                ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}║  STOREFRONT API REQUEST                                           ║${NC}"
        echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    fi
    echo ""
    echo -e "${CYAN}Query:${NC} $name"
    echo ""

    # Show the query
    echo -e "${YELLOW}Query (${basename}.graphql):${NC}"
    echo -e "${GRAY}─────────────────────────────────────────────────────────────${NC}"
    cat "$graphql_file"
    echo -e "${GRAY}─────────────────────────────────────────────────────────────${NC}"
    echo ""

    # Build the request body
    local body
    if [[ -n "$variables" && "$variables" != "null" ]]; then
        echo -e "${YELLOW}Variables:${NC}"
        echo "$variables" | jq '.'
        echo ""
        body=$(jq -n --arg q "$query" --argjson v "$variables" '{query: $q, variables: $v}')
    else
        body=$(jq -n --arg q "$query" '{query: $q}')
    fi

    # Set up endpoint and headers based on API type
    local endpoint=""
    local auth_header=""
    local token_masked=""

    if [[ "$api" == "admin" ]]; then
        if [[ -z "$SHOPIFY_ADMIN_TOKEN" ]]; then
            echo -e "${RED}Error: SHOPIFY_ADMIN_TOKEN not set in config.sh${NC}"
            echo ""
            echo -e "${YELLOW}To get an Admin API token:${NC}"
            echo "1. Go to Shopify Admin > Settings > Apps and sales channels"
            echo "2. Click 'Develop apps' > Create an app"
            echo "3. Configure Admin API scopes: read_products, write_products"
            echo "4. Install the app and copy the Admin API access token"
            return 1
        fi

        endpoint="https://$SHOPIFY_STORE/admin/api/$API_VERSION/graphql.json"
        auth_header="X-Shopify-Access-Token"
        token_masked="${SHOPIFY_ADMIN_TOKEN:0:10}...${SHOPIFY_ADMIN_TOKEN: -4}"

    elif [[ "$api" == "storefront" ]]; then
        if [[ -z "$STOREFRONT_TOKEN" ]]; then
            echo -e "${RED}Error: STOREFRONT_TOKEN not set in config.sh${NC}"
            return 1
        fi

        endpoint="https://$SHOPIFY_STORE/api/$API_VERSION/graphql.json"
        auth_header="X-Shopify-Storefront-Access-Token"
        token_masked="${STOREFRONT_TOKEN:0:8}...${STOREFRONT_TOKEN: -4}"

    else
        echo -e "${RED}Error: Unknown API type '$api'${NC}"
        return 1
    fi

    # Show request details with color matching the API type
    local api_color=""
    if [[ "$api" == "admin" ]]; then
        api_color="${RED}"
    else
        api_color="${BLUE}"
    fi

    echo -e "${api_color}Request Details:${NC}"
    echo -e "  ${CYAN}Method:${NC}      POST"
    echo -e "  ${CYAN}Endpoint:${NC}    $endpoint"
    echo -e "  ${CYAN}Auth Header:${NC} $auth_header"
    echo -e "  ${CYAN}Token:${NC}       $token_masked"
    echo ""

    # Execute curl with verbose output to capture HTTP status
    local tmp_file=$(mktemp)
    local http_code

    echo -e "${BLUE}Sending request...${NC}"

    if [[ "$api" == "admin" ]]; then
        http_code=$(curl -s -w "%{http_code}" -o "$tmp_file" -X POST \
            "$endpoint" \
            -H "Content-Type: application/json" \
            -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
            -d "$body")
    else
        http_code=$(curl -s -w "%{http_code}" -o "$tmp_file" -X POST \
            "$endpoint" \
            -H "Content-Type: application/json" \
            -H "X-Shopify-Storefront-Access-Token: $STOREFRONT_TOKEN" \
            -d "$body")
    fi

    local response=$(cat "$tmp_file")
    rm -f "$tmp_file"

    echo ""
    echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}"

    # Display HTTP status with color coding
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}HTTP Status: $http_code OK${NC}"
    elif [[ "$http_code" == "404" ]]; then
        echo -e "${RED}HTTP Status: $http_code NOT FOUND${NC}"
    elif [[ "$http_code" == "401" ]]; then
        echo -e "${RED}HTTP Status: $http_code UNAUTHORIZED${NC}"
    elif [[ "$http_code" == "403" ]]; then
        echo -e "${RED}HTTP Status: $http_code FORBIDDEN${NC}"
    elif [[ "$http_code" =~ ^2 ]]; then
        echo -e "${GREEN}HTTP Status: $http_code${NC}"
    elif [[ "$http_code" =~ ^4 ]]; then
        echo -e "${RED}HTTP Status: $http_code (Client Error)${NC}"
    elif [[ "$http_code" =~ ^5 ]]; then
        echo -e "${RED}HTTP Status: $http_code (Server Error)${NC}"
    else
        echo -e "${YELLOW}HTTP Status: $http_code${NC}"
    fi

    echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}"
    echo ""

    # Handle non-200 responses with specific guidance
    if [[ "$http_code" == "404" ]]; then
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  404 NOT FOUND - Endpoint does not exist                   ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Possible causes:${NC}"
        echo -e "  1. ${CYAN}Wrong API version${NC} - Current: $API_VERSION"
        echo -e "     Try: 2024-01, 2024-04, 2024-07, 2024-10, 2025-01"
        echo ""
        echo -e "  2. ${CYAN}Wrong store domain${NC} - Current: $SHOPIFY_STORE"
        echo -e "     Must be: yourstore.myshopify.com (not custom domain)"
        echo ""
        echo -e "  3. ${CYAN}Wrong API type${NC} - This query uses: $api"
        echo -e "     Admin API endpoint:     /admin/api/VERSION/graphql.json"
        echo -e "     Storefront API endpoint: /api/VERSION/graphql.json"
        echo ""
        if [[ -n "$response" ]]; then
            echo -e "${GRAY}Raw response:${NC}"
            echo "$response"
        fi
        return 1
    fi

    if [[ "$http_code" == "401" ]]; then
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  401 UNAUTHORIZED - Invalid or missing API token           ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Check your token in config.sh:${NC}"
        if [[ "$api" == "admin" ]]; then
            echo -e "  SHOPIFY_ADMIN_TOKEN must be a valid Admin API access token"
            echo -e "  Format: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        else
            echo -e "  STOREFRONT_TOKEN must be a valid Storefront API access token"
            echo -e "  Format: 32-character hex string"
        fi
        echo ""
        if [[ -n "$response" ]]; then
            echo -e "${GRAY}Raw response:${NC}"
            echo "$response"
        fi
        return 1
    fi

    if [[ "$http_code" == "403" ]]; then
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  403 FORBIDDEN - Token lacks required permissions          ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Your API token needs additional scopes:${NC}"
        if [[ "$api" == "admin" ]]; then
            echo -e "  Go to: Shopify Admin > Settings > Apps > Your App > API Scopes"
            echo -e "  Required: read_products, write_products, read_metafield_definitions"
        fi
        echo ""
        if [[ -n "$response" ]]; then
            echo -e "${GRAY}Raw response:${NC}"
            echo "$response"
        fi
        return 1
    fi

    # Try to parse as JSON
    if ! echo "$response" | jq '.' >/dev/null 2>&1; then
        echo -e "${RED}Response is not valid JSON:${NC}"
        echo "$response"
        return 1
    fi

    echo -e "${GREEN}Response:${NC}"
    echo "$response" | jq '.'

    # Check for simple "errors" string (like {"errors": "Not Found"})
    local simple_error=$(echo "$response" | jq -r '.errors // empty' 2>/dev/null)
    if [[ -n "$simple_error" && "$simple_error" != "null" ]]; then
        # Check if it's a string (simple error) vs array (GraphQL errors)
        local error_type=$(echo "$response" | jq -r '.errors | type')

        if [[ "$error_type" == "string" ]]; then
            echo ""
            echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${RED}║  API Error: $simple_error${NC}"
            echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}This usually means:${NC}"
            echo -e "  - The endpoint URL is incorrect"
            echo -e "  - The API version ($API_VERSION) is not supported"
            echo -e "  - The store domain ($SHOPIFY_STORE) is wrong"
            return 1
        fi

        if [[ "$error_type" == "array" ]]; then
            echo ""
            echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${RED}║  GraphQL Errors                                            ║${NC}"
            echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo "$response" | jq '.errors'
        fi
    fi

    # Check for userErrors in mutations
    local userErrors=$(echo "$response" | jq '.data | .. | .userErrors? // empty | select(. != null and . != [])' 2>/dev/null)
    if [[ -n "$userErrors" ]]; then
        echo ""
        echo -e "${YELLOW}User Errors (from mutation):${NC}"
        echo "$userErrors" | jq '.'
    fi

    # Check if data is null or empty, or contains empty arrays
    local data=$(echo "$response" | jq '.data // empty')
    if [[ "$data" == "null" || -z "$data" ]]; then
        echo ""
        echo -e "${YELLOW}Note: Response data is null/empty${NC}"
        echo -e "This could mean the query succeeded but found no matching records."
    else
        # Check for empty nodes arrays (common in list queries)
        local nodes=$(echo "$response" | jq '.data | .. | .nodes? // empty | select(. == [])' 2>/dev/null)
        if [[ -n "$nodes" ]]; then
            echo ""
            echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${YELLOW}║  Query returned empty results (nodes: [])                         ║${NC}"
            echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════════╝${NC}"
            echo ""

            # Provide context based on query type
            if [[ "$basename" == *"metafield"* ]]; then
                echo -e "${CYAN}For metafield queries, this could mean:${NC}"
                echo -e "  1. No metafield definitions exist for this owner type (PRODUCT)"
                echo -e "  2. Metafields exist but your Admin API token lacks permissions:"
                echo -e "     - read_metafield_definitions"
                echo -e "     - write_metafield_definitions"
                echo -e "  3. The metafields were created without definitions (legacy metafields)"
                echo ""
                echo -e "${CYAN}To check in Shopify Admin:${NC}"
                echo -e "  Settings > Custom data > Products"
                echo ""
            fi
        fi
    fi
}

# Function to check config
check_config() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Configuration Status${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Store Domain:   ${GREEN}$SHOPIFY_STORE${NC}"
    echo -e "  API Version:    ${GREEN}$API_VERSION${NC}"
    echo ""

    # Admin API Section
    echo -e "${RED}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${RED}│  ADMIN API                                                      │${NC}"
    echo -e "${RED}├─────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${RED}│${NC}  Endpoint: https://$SHOPIFY_STORE/admin/api/$API_VERSION/graphql.json"
    echo -e "${RED}│${NC}  Header:   X-Shopify-Access-Token"
    if [[ -n "$SHOPIFY_ADMIN_TOKEN" ]]; then
        local masked="${SHOPIFY_ADMIN_TOKEN:0:10}...${SHOPIFY_ADMIN_TOKEN: -4}"
        echo -e "${RED}│${NC}  Token:    ${GREEN}$masked${NC}"
        echo -e "${RED}│${NC}  Status:   ${GREEN}CONFIGURED${NC}"
    else
        echo -e "${RED}│${NC}  Token:    ${RED}NOT SET${NC}"
        echo -e "${RED}│${NC}  Status:   ${RED}MISSING - Admin queries will fail${NC}"
    fi
    echo -e "${RED}│${NC}"
    echo -e "${RED}│${NC}  ${GRAY}Used for: Metafield definitions, product management, mutations${NC}"
    echo -e "${RED}│${NC}  ${GRAY}Required scopes: read_products, write_products,${NC}"
    echo -e "${RED}│${NC}  ${GRAY}                 read_metafield_definitions, write_metafield_definitions${NC}"
    echo -e "${RED}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Storefront API Section
    echo -e "${BLUE}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│  STOREFRONT API                                                 │${NC}"
    echo -e "${BLUE}├─────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${BLUE}│${NC}  Endpoint: https://$SHOPIFY_STORE/api/$API_VERSION/graphql.json"
    echo -e "${BLUE}│${NC}  Header:   X-Shopify-Storefront-Access-Token"
    if [[ -n "$STOREFRONT_TOKEN" ]]; then
        local masked="${STOREFRONT_TOKEN:0:8}...${STOREFRONT_TOKEN: -4}"
        echo -e "${BLUE}│${NC}  Token:    ${GREEN}$masked${NC}"
        echo -e "${BLUE}│${NC}  Status:   ${GREEN}CONFIGURED${NC}"
    else
        echo -e "${BLUE}│${NC}  Token:    ${RED}NOT SET${NC}"
        echo -e "${BLUE}│${NC}  Status:   ${RED}MISSING - Storefront queries will fail${NC}"
    fi
    echo -e "${BLUE}│${NC}"
    echo -e "${BLUE}│${NC}  ${GRAY}Used for: Public product queries, cart, checkout${NC}"
    echo -e "${BLUE}│${NC}  ${GRAY}Note: Metafields must have storefront access enabled${NC}"
    echo -e "${BLUE}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""

    echo -e "${BLUE}Query Files:${NC}"
    echo -e "${BLUE}─────────────────────────────────────────────────────────────────${NC}"

    for file in "$QUERIES_DIR"/*.json; do
        if [[ -f "$file" ]]; then
            local basename=$(basename "$file" .json)
            local graphql_file="$QUERIES_DIR/${basename}.graphql"
            local api=$(jq -r '.api' "$file")

            # Color-code by API
            local api_color=""
            if [[ "$api" == "admin" ]]; then
                api_color="${RED}"
            else
                api_color="${BLUE}"
            fi

            if [[ -f "$graphql_file" ]]; then
                echo -e "  ${GREEN}✓${NC} ${api_color}[$api]${NC} $basename"
            else
                echo -e "  ${RED}✗${NC} ${api_color}[$api]${NC} $basename ${RED}(missing .graphql)${NC}"
            fi
        fi
    done
    echo ""
}

# Function to find query file by number prefix
# Usage: find_query_by_number "10" -> returns full path to 10_*.json
find_query_by_number() {
    local num="$1"
    # Pad single digit to match both "1" and "01" style prefixes
    local padded=$(printf "%02d" "$num" 2>/dev/null || echo "$num")

    for file in "$QUERIES_DIR"/*.json; do
        if [[ -f "$file" ]]; then
            local basename=$(basename "$file" .json)
            local file_num=$(get_file_number "$basename")
            # Match either the raw input or padded version
            if [[ "$file_num" == "$num" || "$file_num" == "$padded" ]]; then
                echo "$file"
                return 0
            fi
        fi
    done
    return 1
}

# Main menu loop
main() {
    while true; do
        show_header
        list_queries

        echo -n -e "${CYAN}Select a query [0-99, v, c, q]: ${NC}"
        read -r choice

        case "$choice" in
            q|Q)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            c|C)
                show_header
                check_config
                echo -e "\nPress Enter to continue..."
                read -r
                continue
                ;;
            v|V)
                echo -n -e "${CYAN}Enter query number to view: ${NC}"
                read -r view_num
                local query_file=$(find_query_by_number "$view_num")
                if [[ -n "$query_file" ]]; then
                    show_header
                    view_query "$query_file"
                    echo -e "\nPress Enter to continue..."
                    read -r
                else
                    echo -e "${RED}No query found with number: $view_num${NC}"
                    sleep 1
                fi
                ;;
            [0-9]*)
                # Find query file by its number prefix
                local query_file=$(find_query_by_number "$choice")

                if [[ -n "$query_file" ]]; then
                    show_header
                    execute_query "$query_file"
                    echo ""
                    echo -e "\nPress Enter to continue..."
                    read -r
                else
                    echo -e "${RED}No query found with number: $choice${NC}"
                    sleep 1
                fi
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                sleep 1
                ;;
        esac
    done
}

# Run with argument or interactive
if [[ -n "$1" ]]; then
    # Direct execution with file argument or number
    target=""

    # First, check if it's just a number (e.g., "./run.sh 10")
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        target=$(find_query_by_number "$1")
        if [[ -z "$target" ]]; then
            echo -e "${RED}Error: No query found with number: $1${NC}"
            exit 1
        fi
    elif [[ -f "$1" ]]; then
        target="$1"
    elif [[ -f "$QUERIES_DIR/$1" ]]; then
        target="$QUERIES_DIR/$1"
    elif [[ -f "$QUERIES_DIR/$1.json" ]]; then
        target="$QUERIES_DIR/$1.json"
    else
        echo -e "${RED}Error: Query file not found: $1${NC}"
        exit 1
    fi

    # If given a .graphql file, find the corresponding .json
    if [[ "$target" == *.graphql ]]; then
        target="${target%.graphql}.json"
    fi

    execute_query "$target"
else
    # Interactive mode
    main
fi
