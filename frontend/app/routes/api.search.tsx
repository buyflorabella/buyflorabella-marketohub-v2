import { type LoaderFunctionArgs } from 'react-router';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storefront } = context;
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q');

  if (!searchTerm) {
    return { products: [], articles: [] };
  }

  const { products, articles } = await storefront.query(SEARCH_QUERY, {
    variables: { searchTerm, first: 4 },
  });

  return { 
    products: products.nodes,
    articles: articles.nodes 
  };
}

const SEARCH_QUERY = `#graphql
  query Search($searchTerm: String!, $first: Int) {
    products(query: $searchTerm, first: $first) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
          width
          height
        }
        variants(first: 1) {
          nodes {
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
    articles(query: $searchTerm, first: $first) {
      nodes {
        id
        title
        handle
        blog {
          handle
        }
        image {
          url
          altText
        }
        publishedAt
      }
    }
  }
`;