import { useLoaderData, Link, type LoaderFunctionArgs } from 'react-router';
import { CartForm } from '@shopify/hydrogen';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '~/componentsMockup2/contexts/CartContext';

interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  productType: string;
  tags: string[];
  variants: {
    nodes: Array<{
      id: string;
    }>;
  };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange: {
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage: ShopifyImage | null;
}

interface CollectionNode {
  title: string;
  handle: string;
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront } = context;

  // Read collection from URL
  const url = new URL(request.url);
  const collectionHandle = url.searchParams.get('collection');

  // Choose the correct products query
  const productsQuery = collectionHandle
    ? storefront.query(SHOP_PRODUCTS_BY_COLLECTION_QUERY, {
        variables: { handle: collectionHandle },
      })
    : storefront.query(SHOP_PRODUCTS_QUERY);

  // Run queries in parallel
  const [collectionsResult, productsResult] = await Promise.all([
    storefront.query(SHOP_COLLECTIONS_QUERY),
    productsQuery,
  ]);

  // Normalize data shapes
  const collections = collectionsResult.collections?.nodes || [];

  const products = collectionHandle
    ? productsResult.collection?.products?.nodes || []
    : productsResult.products?.nodes || [];

  return {
    collections,
    products,
    activeCollection: collectionHandle,
  };
}

{/* 
export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;

  const { products, collections } = await storefront.query(SHOP_PAGE_QUERY, {
    variables: {
      firstProducts: 20,
      firstCollections: 10,
    },
  });

  return {
    products: products.nodes,
    collections: collections.nodes,
  };
}
*/}

export default function ShopPage() {
  const { products, collections, activeCollection } = useLoaderData<typeof loader>();
  const { openCart } = useCart();
  //const [selectedCategory, setSelectedCategory] = useState<string>('');

  // const filteredProducts = selectedCategory === 'all'
  //   ? products
  //   : products.filter(p => 
  //       p.productType.toLowerCase() === selectedCategory.toLowerCase() ||
  //       p.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
  //     );
  const filteredProducts = products;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Shop Premium Minerals
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Discover our complete line of mineral supplements designed to support your wellness journey
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              to={`/shop`} 
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                !activeCollection === ''
                  ? 'bg-[#7cb342] text-white'
                  : 'glass border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              All
            </Link>
            {collections.map((collection: CollectionNode) => (
              <Link
                key={collection.handle}
                to={`/shop?collection=${collection.handle}`}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeCollection === collection.handle
                    ? 'bg-[#7cb342] text-white'
                    : 'glass border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {collection.title}
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product: ProductNode) => {
              const price = parseFloat(product.priceRange.minVariantPrice.amount);
              const compareAtPrice = parseFloat(product.compareAtPriceRange.maxVariantPrice.amount);
              const isSale = compareAtPrice > price;
              const firstVariantId = product.variants.nodes[0]?.id;

              return (
                <div
                  key={product.id}
                  className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-[#7cb342]/50 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="relative">
                    {product.featuredImage && (
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        className="w-full h-64 object-cover"
                      />
                    )}
                    
                    {product.tags.includes('best-seller') && (
                      <div className="absolute top-4 left-4 bg-[#7cb342] text-white px-4 py-1 rounded-full text-sm font-bold">
                        Best Seller
                      </div>
                    )}
                    {isSale && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Sale
                      </div>
                    )}
                    {!product.availableForSale && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <span className="text-white text-lg font-bold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{product.title}</h3>
                    <p className="text-white/70 mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#7cb342] text-[#7cb342]" />
                        ))}
                      </div>
                      <span className="text-sm text-white/50">Verified Results</span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-white">
                        ${price.toFixed(2)}
                      </span>
                      {isSale && (
                        <span className="text-lg text-white/40 line-through">
                          ${compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                        <CartForm
                          route="/cart"
                          action={CartForm.ACTIONS.LinesAdd}
                          inputs={{
                            lines: [
                              {
                                merchandiseId: firstVariantId,
                                quantity: 1,
                              },
                            ],
                          }}
                        >
                            {(fetcher) => (
                              <>
                                <div className="flex gap-3">
                                  <button
                                    type="submit"
                                    disabled={!product.availableForSale || fetcher.state !== 'idle'}
                                    className="flex-1 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shiny-border relative z-10">
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                      <ShoppingCart className="w-5 h-5" />
                                      {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
                                    </span>
                                  </button>
                                  <button
                                    type="submit"
                                    onClick={openCart}
                                    disabled={!product.availableForSale || fetcher.state !== 'idle'}
                                    className="px-4 py-3 border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center shiny-border relative z-10"
                                    >
                                      <span className="relative z-10">Buy Now</span>
                                  </button>
                                </div>
                                <br />
                                <Link
                                  to={`/product/${product.handle}`}
                                  className="block w-full py-3 border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold text-center transition-all duration-300"
                                >
                                  View Details
                                </Link>
                              </>
                            )}
                        </CartForm>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-white/50">No products found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const SHOP_COLLECTIONS_QUERY = `#graphql
  query ShopCollections {
    collections(first: 20) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

export const SHOP_PRODUCTS_QUERY = `#graphql
  query ShopProducts {
    products(first: 50) {
      nodes {
        id
        title
        handle
        description
        availableForSale
        productType
        tags
        variants(first: 1) {
          nodes {
            id
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;


export const SHOP_PRODUCTS_BY_COLLECTION_QUERY = `#graphql
  query ShopProductsByCollection($handle: String!) {
    collection(handle: $handle) {
      products(first: 50) {
        nodes {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
            width
            height
          }
          availableForSale
          productType
          tags
          variants(first: 1) {
            nodes {
              id
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
