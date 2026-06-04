# Shopify GraphQL CLI Tool

A simple CLI tool to run GraphQL queries against Shopify's Admin and Storefront APIs.

## Setup

1. **Edit `config.sh`** with your credentials:

```bash
# Your store domain
SHOPIFY_STORE="buyflorabella.myshopify.com"

# Admin API token (required for mutations)
SHOPIFY_ADMIN_TOKEN="shpat_xxxxx"

# Storefront API token (for storefront queries)
STOREFRONT_TOKEN="xxxxx"
```

2. **Get an Admin API Token:**
   - Go to Shopify Admin > Settings > Apps and sales channels
   - Click "Develop apps" > "Create an app"
   - Name it (e.g., "GraphQL CLI Tool")
   - Configure Admin API scopes:
     - `read_products`
     - `write_products`
     - `read_metafield_definitions`
     - `write_metafield_definitions`
   - Install the app
   - Copy the "Admin API access token"

3. **Install jq** (if not already installed):
```bash
sudo apt-get install jq
```

## Usage

### Interactive Mode
```bash
./run.sh
```

This shows a menu of available queries. Select by number.

### Direct Execution
```bash
./run.sh queries/01_check_metafield_definitions.json
./run.sh 01_check_metafield_definitions.json
./run.sh 01_check_metafield_definitions
```

## Adding New Queries

Create a JSON file in the `queries/` directory:

```json
{
  "name": "Human-readable name",
  "description": "What this query does",
  "api": "admin",
  "query": "query { shop { name } }"
}
```

### Fields

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `name` | Yes | string | Display name in the menu |
| `description` | Yes | string | What the query does |
| `api` | Yes | `admin` or `storefront` | Which API to use |
| `query` | Yes | string | The GraphQL query/mutation |
| `variables` | No | object | Variables to pass to the query |

### Example with Variables

```json
{
  "name": "Get Product by Handle",
  "description": "Fetch a product using its handle",
  "api": "storefront",
  "variables": {
    "handle": "my-product-handle"
  },
  "query": "query GetProduct($handle: String!) { product(handle: $handle) { id title } }"
}
```

## Query Files Included

| File | Purpose |
|------|---------|
| `01_check_metafield_definitions.json` | List all product metafield definitions |
| `02_enable_product_overview.json` | Enable storefront access for product_overview_multiline |
| `03_enable_benefits.json` | Enable storefront access for benefits |
| `04_enable_ingredients.json` | Enable storefront access for ingredients |
| `05_enable_how_to_use.json` | Enable storefront access for how_to_use |
| `06_create_product_overview.json` | Create product_overview_multiline if it doesn't exist |
| `10_storefront_test_product.json` | Test fetching metafield via Storefront API |
| `11_storefront_all_metafields.json` | Fetch all metafields for a product |

## Troubleshooting

### "Access denied" error
- Your Admin API token doesn't have the required scopes
- Go back to the app settings and add the missing scopes

### "Metafield definition not found"
- The metafield definition doesn't exist yet
- Run query `06` to create it first

### Storefront query returns null for metafield
- The metafield definition exists but storefront access isn't enabled
- Run the corresponding `enable` mutation (queries 02-05)
