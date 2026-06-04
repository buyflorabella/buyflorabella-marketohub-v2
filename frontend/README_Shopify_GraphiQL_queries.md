# README_Shopify_GraphiQL_queries.md

## GraphiQL endpoints:

### Admin API

https://admin.shopify.com/store/buy-flora-bella/apps/shopify-graphiql-app

### Storefront API

https://admin.shopify.com/store/buy-flora-bella/apps/api/2024-10/graphiql

### Customer API



### All product handles:

5lb-bag
flora-bella-bio-trace-5-lb-garden
microdust-5lbs-coming-soon
microdust-2lbs-coming-soon




### Example Queries

Get all Metafield definitions for products:

```
query CheckProductMetafieldDefinitions {
    metafieldDefinitions(ownerType: PRODUCT, first: 50) {
      nodes {
        id
        namespace
        key
        name
        type {
          name
        }
        access {
          storefront
        }
      }
    }
  }


```


# Enable metafield for query by storefront API

!.!

If this works, this was THE HARDEST thing to figure out about Hydrogen + Headless.



Here is a "before" view, which shows all "access" labeled as "storefront": "PUBLIC_READ" for all metafields:

```

{
  "data": {
    "metafieldDefinitions": {
      "nodes": [
        {
          "id": "gid://shopify/MetafieldDefinition/108894257255",
          "namespace": "shopify",
          "key": "authenticity",
          "name": "Authenticity",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/108894290023",
          "namespace": "shopify",
          "key": "condition",
          "name": "Condition",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/108894322791",
          "namespace": "shopify",
          "key": "mineral-class",
          "name": "Mineral class",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/108894355559",
          "namespace": "shopify",
          "key": "rarity",
          "name": "Rarity",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/110002831463",
          "namespace": "shopify",
          "key": "color-pattern",
          "name": "Color",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/110002864231",
          "namespace": "shopify",
          "key": "suitable-space",
          "name": "Suitable space",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/110002896999",
          "namespace": "shopify",
          "key": "application-method",
          "name": "Application method",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/110002929767",
          "namespace": "shopify",
          "key": "gardening-use",
          "name": "Gardening use",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/110002962535",
          "namespace": "shopify",
          "key": "nutrient-content",
          "name": "Nutrient content",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/116498071655",
          "namespace": "custom",
          "key": "product_overview",
          "name": "Product Overview",
          "type": {
            "name": "single_line_text_field"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/116498104423",
          "namespace": "custom",
          "key": "product_overview_multiline",
          "name": "Product Overview Multiline",
          "type": {
            "name": "multi_line_text_field"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/116498235495",
          "namespace": "custom",
          "key": "product_overview_richtext",
          "name": "Product Overview Richtext",
          "type": {
            "name": "rich_text_field"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/116837187687",
          "namespace": "shopify",
          "key": "dietary-preferences",
          "name": "Dietary preferences",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        },
        {
          "id": "gid://shopify/MetafieldDefinition/116837220455",
          "namespace": "shopify",
          "key": "food-product-form",
          "name": "Food product form",
          "type": {
            "name": "list.metaobject_reference"
          },
          "access": {
            "storefront": "PUBLIC_READ"
          }
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 23,
      "actualQueryCost": 8,
      "throttleStatus": {
        "maximumAvailable": 2000,
        "currentlyAvailable": 1992,
        "restoreRate": 100
      }
    }
  }
}

```


## Try the mutation query to enable something to allow it for query because we are getting one field back right now:

```
      "seo": {
        "title": null,
        "description": null
      },
      "metafield": {
        "value": "5lb product overview multiline",
        "type": "multi_line_text_field"
      }

```

## We will try this:

Fire this off against the 'ADMIN' shopify Endpoint:

```
mutation UpdateMetafieldStorefrontAccess {
    metafieldDefinitionUpdate(
      definition: {
        namespace: "custom"
        key: "product_overview_multiline"
        ownerType: PRODUCT
        access: {
          storefront: PUBLIC_READ
        }
      }
    ) {
      updatedDefinition {
        id
        name
        access {
          storefront
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
```

using the 'key' for the ***CUSTOM METAFIELD***


#### Enable MULTILINE value

```
mutation UpdateMetafieldStorefrontAccess {
    metafieldDefinitionUpdate(
      definition: {
        namespace: "custom"
        key: "product_overview"
        ownerType: PRODUCT
        access: {
          storefront: PUBLIC_READ
        }
      }
    ) {
      updatedDefinition {
        id
        name
        access {
          storefront
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }

```
#### Enable RICHTEXT value

```
mutation UpdateMetafieldStorefrontAccess {
    metafieldDefinitionUpdate(
      definition: {
        namespace: "custom"
        key: "product_overview_richtext"
        ownerType: PRODUCT
        access: {
          storefront: PUBLIC_READ
        }
      }
    ) {
      updatedDefinition {
        id
        name
        access {
          storefront
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }

```




----

This query in GraphiQL works:

```
query {
  productByHandle(handle: "5lb-bag") {
    id
    title
    handle
    descriptionHtml
    description
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    variants(first: 1) {
      nodes {
        id
        title
        availableForSale
        image {
          url
        }
      }
    }
    collections(first: 1) {
      nodes {
        id
        handle
        title
      }
    }
    productOverviewMultiline: metafield(namespace: "custom", key: "product_overview_multiline") {
      value
      type
    }
    productOverview: metafield(namespace: "custom", key: "product_overview") {
      value
      type
    }
    productOverviewRichtext: metafield(namespace: "custom", key: "product_overview_richtext") {
      value
      type
    }
  }
}


```

returning all metafield







# RED Herrings:

1.) The Shopify App named "Headless": it lost its head, apparantly, and is deprecated or, just overall, unnecessary in a NEW setup now.

2.) Requirement to MUTATE the object using GraphiQL (another APP you
must be led to, in order to know to install it, in order to perform
this tiring operation)

