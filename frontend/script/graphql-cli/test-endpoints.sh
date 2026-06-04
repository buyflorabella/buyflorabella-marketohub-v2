#!/bin/bash
#
# Simple endpoint tester - raw curl with verbose output
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo "=============================================="
echo "  ENDPOINT CONNECTIVITY TEST"
echo "=============================================="
echo ""
echo "Store:       $SHOPIFY_STORE"
echo "API Version: $API_VERSION"
echo ""

# Simple query that works on both APIs
QUERY='{ "query": "{ shop { name } }" }'

echo "=============================================="
echo "  TEST 1: ADMIN API"
echo "=============================================="
echo ""
ADMIN_ENDPOINT="https://$SHOPIFY_STORE/admin/api/$API_VERSION/graphql.json"
echo "Endpoint: $ADMIN_ENDPOINT"
echo "Token:    ${SHOPIFY_ADMIN_TOKEN:0:15}..."
echo ""
echo "curl command:"
echo "  curl -X POST '$ADMIN_ENDPOINT' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'X-Shopify-Access-Token: \$SHOPIFY_ADMIN_TOKEN' \\"
echo "    -d '$QUERY'"
echo ""
echo "Response:"
echo "---"
curl -s -w "\n\nHTTP Status: %{http_code}\n" -X POST "$ADMIN_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
  -d "$QUERY"
echo "---"
echo ""

echo "=============================================="
echo "  TEST 2: STOREFRONT API"
echo "=============================================="
echo ""
STOREFRONT_ENDPOINT="https://$SHOPIFY_STORE/api/$API_VERSION/graphql.json"
echo "Endpoint: $STOREFRONT_ENDPOINT"
echo "Token:    ${STOREFRONT_TOKEN:0:15}..."
echo ""
echo "curl command:"
echo "  curl -X POST '$STOREFRONT_ENDPOINT' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'X-Shopify-Storefront-Access-Token: \$STOREFRONT_TOKEN' \\"
echo "    -d '$QUERY'"
echo ""
echo "Response:"
echo "---"
curl -s -w "\n\nHTTP Status: %{http_code}\n" -X POST "$STOREFRONT_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: $STOREFRONT_TOKEN" \
  -d "$QUERY"
echo "---"
echo ""

echo "=============================================="
echo "  COMPARISON"
echo "=============================================="
echo ""
echo "If Admin API returns shop name: Token + endpoint are working"
echo "If Admin API returns 'Not Found': Wrong endpoint or API version"
echo "If Admin API returns 401/403: Token is invalid or lacks permissions"
echo ""
echo "The Admin API endpoint should be:"
echo "  https://YOUR-STORE.myshopify.com/admin/api/VERSION/graphql.json"
echo ""
echo "NOT:"
echo "  https://admin.shopify.com/..."
echo "  https://YOUR-STORE.com/admin/..."
echo ""
