import { useState } from 'react';
import { useLoaderData, Link, type LoaderFunctionArgs } from 'react-router';
import { CartForm } from '@shopify/hydrogen';
import {
  Star,
  ShoppingCart,
  Share2,
  Heart,
  Check,
  Truck,
  RefreshCw,
  Shield,
  Package,
  ChevronUp,
  ChevronDown,
  // ThumbsUp
} from 'lucide-react';

import { useCart } from '../componentsMockup2/contexts/CartContext';
import { useWishlist } from '../componentsMockup2/contexts/WishlistContext';
import { useToast } from '../componentsMockup2/contexts/ToastContext';
import { useFeatureFlags } from '../componentsMockup2/contexts/FeatureFlagsContext';
import DiscountBox from '../componentsMockup2/components/DiscountBox';
import { products, faqs } from '~/componentsMockup2/data/staticData';
import { Money } from '@shopify/hydrogen';

/* ═══════════════════════════════════════════════════════════════════════════
 * PnT: RICHTEXT & MULTILINE PARSER UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Shopify RichText metafields return JSON with this structure:
 * {
 *   "type": "root",
 *   "children": [
 *     { "type": "heading", "level": 2, "children": [{ "type": "text", "value": "...", "bold": true }] },
 *     { "type": "paragraph", "children": [{ "type": "text", "value": "..." }] },
 *     { "type": "list", "listType": "unordered", "children": [{ "type": "list-item", "children": [...] }] }
 *   ]
 * }
 *
 * Supported node types:
 *   - root: Container for all content
 *   - heading: Has "level" (1-6) for h1-h6 tags
 *   - paragraph: Standard <p> tag
 *   - list: Has "listType" (ordered/unordered) for <ol>/<ul>
 *   - list-item: <li> tag
 *   - text: Inline text with optional "bold" and "italic" flags
 *   - link: Anchor with "url" and "title" properties
 *
 * NOT SUPPORTED (skipped):
 *   - image, video, and other media types
 *
 * Multiline text fields use \n as delimiter, converted to paragraphs with spacing.
 * ═══════════════════════════════════════════════════════════════════════════ */

// PnT: Type definitions for Shopify RichText nodes
interface RichTextNode {
  type: string;
  value?: string;
  bold?: boolean;
  italic?: boolean;
  level?: number;
  listType?: 'ordered' | 'unordered';
  url?: string;
  title?: string;
  children?: RichTextNode[];
}

// PnT: Render inline text with formatting (bold, italic)
function renderTextNode(node: RichTextNode, index: number): React.ReactNode {
  if (node.type !== 'text') return null;

  let content: React.ReactNode = node.value || '';

  // PnT: Apply formatting in order - italic first, then bold wraps it
  if (node.italic) {
    content = <em key={`em-${index}`}>{content}</em>;
  }
  if (node.bold) {
    content = <strong key={`strong-${index}`}>{content}</strong>;
  }

  return <span key={index}>{content}</span>;
}

// PnT: Recursively render children of a node
function renderChildren(children: RichTextNode[] | undefined): React.ReactNode[] {
  if (!children) return [];
  return children.map((child, index) => renderRichTextNode(child, index));
}

// PnT: Main recursive renderer for RichText nodes
function renderRichTextNode(node: RichTextNode, index: number): React.ReactNode {
  switch (node.type) {
    case 'root':
      // PnT: Root is just a container, render its children
      return <div key={index}>{renderChildren(node.children)}</div>;

    case 'heading': {
      // PnT: Map level (1-6) to heading tags, default to h2
      const level = node.level || 2;
      const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;
      // PnT: Apply consistent heading styles matching our design
      const headingStyles: Record<number, string> = {
        1: 'text-3xl font-bold text-white mb-4',
        2: 'text-2xl font-bold text-white mb-3',
        3: 'text-xl font-semibold text-white mb-3',
        4: 'text-lg font-semibold text-white mb-2',
        5: 'text-base font-semibold text-white mb-2',
        6: 'text-sm font-semibold text-white mb-2',
      };
      return (
        <HeadingTag key={index} className={headingStyles[level] || headingStyles[2]}>
          {renderChildren(node.children)}
        </HeadingTag>
      );
    }

    case 'paragraph':
      // PnT: Standard paragraph with our text styling
      return (
        <p key={index} className="text-white/70 text-lg leading-relaxed mb-4">
          {renderChildren(node.children)}
        </p>
      );

    case 'list': {
      // PnT: Ordered vs unordered list based on listType
      const ListTag = node.listType === 'ordered' ? 'ol' : 'ul';
      const listStyle = node.listType === 'ordered'
        ? 'list-decimal list-inside text-white/70 mb-4 space-y-2'
        : 'list-disc list-inside text-white/70 mb-4 space-y-2';
      return (
        <ListTag key={index} className={listStyle}>
          {renderChildren(node.children)}
        </ListTag>
      );
    }

    case 'list-item':
      return (
        <li key={index} className="text-white/70">
          {renderChildren(node.children)}
        </li>
      );

    case 'link':
      // PnT: Render links with hover styling
      return (
        <a
          key={index}
          href={node.url || '#'}
          title={node.title}
          className="text-[#7cb342] hover:text-[#8bc34a] underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderChildren(node.children)}
        </a>
      );

    case 'text':
      // PnT: Inline text with formatting
      return renderTextNode(node, index);

    // PnT: Skip media types - we don't handle image/video here
    case 'image':
    case 'video':
      return null;

    default:
      // PnT: Unknown node type, attempt to render children if present
      console.warn(`[RichText] Unknown node type: ${node.type}`);
      return node.children ? <span key={index}>{renderChildren(node.children)}</span> : null;
  }
}

// PnT: Parse and render Shopify RichText JSON string
function parseRichText(jsonString: string): React.ReactNode {
  try {
    const parsed: RichTextNode = JSON.parse(jsonString);
    return renderRichTextNode(parsed, 0);
  } catch (error) {
    console.error('[RichText] Failed to parse richtext JSON:', error);
    // PnT: Fallback - return raw string if parsing fails
    return <p className="text-white/70 text-lg leading-relaxed">{jsonString}</p>;
  }
}

// PnT: Parse multiline text field - splits on \n and renders as spaced paragraphs
function parseMultilineText(text: string): React.ReactNode {
  // PnT: Split on newlines, filter empty lines, render each as paragraph
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed) {
      // PnT: Non-empty line becomes a paragraph
      elements.push(
        <p key={index} className="text-white/70 text-lg leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    } else if (index > 0 && index < lines.length - 1) {
      // PnT: Empty line in middle adds visual spacing (not at start/end)
      elements.push(<div key={`spacer-${index}`} className="h-2" />);
    }
  });

  return <div>{elements}</div>;
}

// PnT: Parse key_benefits_parsable multiline metafield
// Each line (separated by \n) represents one benefit item
function parseKeyBenefits(text: string): string[] {
  // PnT: Split on newlines, trim each line, filter out empty lines
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// PnT: Render key benefits as a grid with check icons
function renderKeyBenefits(benefitsText: string): React.ReactNode {
  const benefits = parseKeyBenefits(benefitsText);

  if (benefits.length === 0) return null;

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4">Key Benefits</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {benefits.map((benefit, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Check className="w-6 h-6 text-[#7cb342] flex-shrink-0 mt-1" />
            <span className="text-white/80">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Updated to match working CLI pattern (query 17)
// Uses productByHandle() and queries all three metafield variants
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    productByHandle(handle: $handle) {
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
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
          }
          # PnT: Selling plans for subscription options
          sellingPlanAllocations(first: 5) {
            nodes {
              sellingPlan {
                id
                name
                billingPolicy {
                  ... on SellingPlanRecurringBillingPolicy {
                    interval
                    intervalCount
                  }
                }
              }
              priceAdjustments {
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                perDeliveryPrice {
                  amount
                  currencyCode
                }
              }
            }
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
      overviewPlain: metafield(namespace: "custom", key: "product_overview") {
        value
        type
      }
      overviewMultiline: metafield(namespace: "custom", key: "product_overview_multiline") {
        value
        type
      }
      overviewRichtext: metafield(namespace: "custom", key: "product_overview_richtext") {
        value
        type
      }
      keyBenefits: metafield(namespace: "custom", key: "key_benefits_parsable") {
        value
        type
      }
    }
  }
`;

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts($handle: String!) {
    collection(handle: $handle) {
      id
      title
      products(first: 3) {
        nodes {
          title
          handle
          description
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  const { storefront } = context;

  // ORIGINAL CODE (uses product() - commented out for testing)
  // const { product } = await storefront.query(PRODUCT_QUERY, {
  //   variables: {
  //     handle: slug,
  //     selectedOptions: [],
  //   },
  // });

  // NEW CODE: Query uses productByHandle (matching working CLI pattern)
  const data = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: slug,
    },
  });

  // Extract product from productByHandle response
  const product = data.productByHandle;

  // DEBUG: Log metafield data to see what's being returned
  // console.log('[METAFIELD DEBUG]', {
  //   handle: slug,
  //   productId: product?.id,
  //   productTitle: product?.title,
  //   overviewPlain: product?.overviewPlain,
  //   overviewMultiline: product?.overviewMultiline,
  //   overviewRichtext: product?.overviewRichtext,
  //   keyBenefits: product?.keyBenefits,
  // });

  // PnT: DEBUG - Log selling plan allocations for subscriptions
  const sellingPlanAllocations = product?.variants?.nodes?.[0]?.sellingPlanAllocations?.nodes || [];
  // console.log('[SUBSCRIPTION DEBUG]', {
  //   handle: slug,
  //   variantId: product?.variants?.nodes?.[0]?.id,
  //   sellingPlansCount: sellingPlanAllocations.length,
  //   sellingPlans: sellingPlanAllocations.map((allocation: any) => ({
  //     id: allocation.sellingPlan?.id,
  //     name: allocation.sellingPlan?.name,
  //     interval: allocation.sellingPlan?.billingPolicy?.interval,
  //     intervalCount: allocation.sellingPlan?.billingPolicy?.intervalCount,
  //     price: allocation.priceAdjustments?.[0]?.price?.amount,
  //     compareAtPrice: allocation.priceAdjustments?.[0]?.compareAtPrice?.amount,
  //   })),
  // });

  if (!product) {
    throw new Response('Product Not Found', { status: 404 });
  }

  // Handle case where product has no collections
  let related: any[] = [];
  if (product.collections?.nodes?.[0]?.handle) {
    const { collection } = await storefront.query(RELATED_PRODUCTS_QUERY, {
      variables: {
        handle: product.collections.nodes[0].handle
      },
    });
    related = collection?.products?.nodes || [];
  }

  return { product, related };
}

export default function ProductDetailPage() {
  const { product, related } = useLoaderData<typeof loader>();
  const item = products.at(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState('one-time');
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<string | null>(null); // PnT: Track selected subscription plan
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'how-to' | 'technical' | 'faq'>('overview');

  const { openCart } = useCart();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { flags } = useFeatureFlags();

  const variant = product.variants.nodes[0];
  const images = product.images.nodes;
  const price = parseFloat(variant.price.amount);
  const compareAtPrice = variant.compareAtPrice ? parseFloat(variant.compareAtPrice.amount) : null;

  // PnT: Extract selling plan allocations for subscription options
  const sellingPlanAllocations = variant?.sellingPlanAllocations?.nodes || [];
  const hasSubscriptionOptions = sellingPlanAllocations.length > 0;

  // PnT: Get the currently selected selling plan details
  const selectedPlanAllocation = sellingPlanAllocations.find(
    (allocation: any) => allocation.sellingPlan?.id === selectedSellingPlanId
  );
  const subscriptionPrice = selectedPlanAllocation?.priceAdjustments?.[0]?.price?.amount
    ? parseFloat(selectedPlanAllocation.priceAdjustments[0].price.amount)
    : null;
  const subscriptionComparePrice = selectedPlanAllocation?.priceAdjustments?.[0]?.compareAtPrice?.amount
    ? parseFloat(selectedPlanAllocation.priceAdjustments[0].compareAtPrice.amount)
    : null;

  // PnT: Calculate discount percentage if subscription has savings
  const subscriptionDiscount = subscriptionComparePrice && subscriptionPrice
    ? Math.round((1 - subscriptionPrice / subscriptionComparePrice) * 100)
    : 0;

  // PnT: DEBUG - Log subscription state in component
  // console.log('[SUBSCRIPTION UI DEBUG]', {
  //   hasSubscriptionOptions,
  //   sellingPlansCount: sellingPlanAllocations.length,
  //   selectedSellingPlanId,
  //   purchaseType,
  //   subscriptionPrice,
  //   subscriptionDiscount,
  // });

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.title,
      slug: product.handle,
      price,
      image: images[0]?.url,
    });
  };

  // PnT: Calculate final price based on purchase type
  const displayPrice = purchaseType === 'subscription' && subscriptionPrice
    ? subscriptionPrice
    : price;
  const finalPrice = displayPrice * quantity;
  const isBundle = false;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6">
            <Link to="/shop" className="text-white/50 hover:text-[#7cb342] transition-colors">
              ← Back to Shop
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="glass border border-white/10 rounded-2xl overflow-hidden mb-4">
                <img
                  src={images[selectedImage]?.url}
                  alt={images[selectedImage]?.altText || product.title}
                  className="w-full h-[500px] object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.url}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#7cb342]' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>


            <div>
              <div className="inline-block bg-[#7cb342] text-white px-4 py-1 rounded-full text-sm font-bold">
                Best Seller
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {product.title}
              </h1>

              <p className="text-xl text-white/70 mb-6">
                {product.description.substr(0, 160)}
                {product.description.length > 160 ? '...' : ''}
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < 5 ? 'fill-[#7cb342] text-[#7cb342]' : 'text-white/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-white/70">5.0 (Review Sync via App)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-5xl font-bold text-white">
                  ${price.toFixed(2)}
                </span>
                {compareAtPrice && (
                  <span className="text-2xl text-white/40 line-through">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mb-6 space-y-3">
                <label className="block text-white font-semibold mb-2">Purchase Options:</label>
                <button
                  onClick={() => setPurchaseType('one-time')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    purchaseType === 'one-time'
                      ? 'border-[#7cb342] bg-[#7cb342]/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">One-time Purchase</div>
                      <div className="text-white/70">${price}</div>
                    </div>
                    {purchaseType === 'one-time' && (
                      <Check className="w-6 h-6 text-[#7cb342]" />
                    )}
                  </div>
                </button>

                {/* PnT: SUBSCRIPTION ABILITY TOGGLE - Now dynamic based on selling plans */}
                {hasSubscriptionOptions && (
                  <>
                    <button
                      onClick={() => {
                        setPurchaseType('subscription');
                        // PnT: Auto-select first plan if none selected
                        if (!selectedSellingPlanId && sellingPlanAllocations.length > 0) {
                          setSelectedSellingPlanId(sellingPlanAllocations[0].sellingPlan?.id);
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        purchaseType === 'subscription'
                          ? 'border-[#7cb342] bg-[#7cb342]/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">Subscribe & Save</span>
                            {subscriptionDiscount > 0 && (
                              <span className="bg-[#7cb342] text-white text-xs px-2 py-0.5 rounded-full">
                                {subscriptionDiscount}% OFF
                              </span>
                            )}
                          </div>
                          <div className="text-white/70">
                            {subscriptionPrice
                              ? `$${subscriptionPrice.toFixed(2)} per delivery`
                              : 'Select a plan below'}
                          </div>
                        </div>
                        {purchaseType === 'subscription' && (
                          <Check className="w-6 h-6 text-[#7cb342]" />
                        )}
                      </div>
                    </button>

                    {/* PnT: Delivery frequency selector - shows when subscription is selected */}
                    {purchaseType === 'subscription' && (
                      <div className="mt-3">
                        <label className="block text-white/70 text-sm mb-2">Delivery Frequency:</label>
                        <select
                          value={selectedSellingPlanId || ''}
                          onChange={(e) => {
                            setSelectedSellingPlanId(e.target.value);
                            // PnT: DEBUG - Log plan selection
                            // console.log('[SUBSCRIPTION SELECT]', {
                            //   selectedPlanId: e.target.value,
                            //   plan: sellingPlanAllocations.find(
                            //     (a: any) => a.sellingPlan?.id === e.target.value
                            //   ),
                            // });
                          }}
                          className="w-full p-3 glass border border-white/20 rounded-xl text-white bg-transparent"
                        >
                          {sellingPlanAllocations.map((allocation: any) => (
                            <option
                              key={allocation.sellingPlan?.id}
                              value={allocation.sellingPlan?.id}
                              className="bg-[#1a1a2e]"
                            >
                              {allocation.sellingPlan?.name} - ${parseFloat(allocation.priceAdjustments?.[0]?.price?.amount || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Quantity:</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 glass border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                  >
                    -
                  </button>
                  <span className="text-2xl text-white font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 glass border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* PnT: CartForm - conditionally includes sellingPlanId for subscriptions */}
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesAdd}
                inputs={{
                  lines: [
                    {
                      merchandiseId: product.variants.nodes[0]?.id,
                      quantity,
                      // PnT: Include sellingPlanId only when subscription is selected
                      ...(purchaseType === 'subscription' && selectedSellingPlanId
                        ? { sellingPlanId: selectedSellingPlanId }
                        : {}),
                    },
                  ],
                }}
              >
                {(fetcher) => (
                  <div className="flex gap-4 mb-8">
                    <button
                      type="submit"
                      disabled={!variant.availableForSale || fetcher.state !== 'idle'}
                      onClick={() => {
                        // PnT: DEBUG - Log cart add action
                        // console.log('[CART ADD DEBUG]', {
                        //   purchaseType,
                        //   merchandiseId: product.variants.nodes[0]?.id,
                        //   quantity,
                        //   sellingPlanId: purchaseType === 'subscription' ? selectedSellingPlanId : null,
                        // });
                        // openCart();
                      }}
                      className="flex-1 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shiny-border relative z-10"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {variant.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    {flags.wishlistIcon && (
                      <button
                        onClick={() => {
                          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                          const shortcut = isMac ? '⌘+D' : 'Ctrl+D';
                          
                          if (window.sidebar?.addPanel) {
                            window.sidebar.addPanel(product.title, window.location.href, '');
                          } else if ((window.external as any)?.AddFavorite) {
                            (window.external as any).AddFavorite(window.location.href, product.title);
                          } else {
                            const alreadyInWishlist = isInWishlist(product.id);

                            handleToggleWishlist();

                            const message = alreadyInWishlist
                              ? 'Removed from wishlist'
                              : `Added to wishlist! Tip: Press ${shortcut} to bookmark in your browser`;

                            toast.success(message);
                          }
                        }}
                        className={`px-6 py-4 glass border rounded-xl transition-all ${
                          isInWishlist(product.id)
                            ? 'border-[#7cb342] bg-[#7cb342]/10'
                            : 'border-white/20 hover:bg-white/10'
                        }`}
                        title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist (or press Ctrl+D to bookmark)'}
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            isInWishlist(product.id)
                              ? 'fill-[#7cb342] text-[#7cb342]'
                              : 'text-white'
                          }`}
                        />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product.title,  // ← Fixed: item.name → product.title
                            text: product.description,  // ← Fixed: item.description → product.description
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied to clipboard!');
                        }
                      }}
                      className="px-6 py-4 glass border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                      title="Share this product"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </CartForm>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass border border-white/10 rounded-xl p-4 text-center">
                  <Truck className="w-6 h-6 text-[#7cb342] mx-auto mb-2" />
                  <div className="text-sm text-white/70">Quality Sourced</div>
                  <div className="text-xs text-white/50">Carefully selected inputs</div>
                </div>
                <div className="glass border border-white/10 rounded-xl p-4 text-center">
                  <RefreshCw className="w-6 h-6 text-[#7cb342] mx-auto mb-2" />
                  <div className="text-sm text-white/70">Consistent Supply</div>
                  <div className="text-xs text-white/50">Reliable, repeatable fulfillment</div>
                </div>
                <div className="glass border border-white/10 rounded-xl p-4 text-center">
                  <Shield className="w-6 h-6 text-[#7cb342] mx-auto mb-2" />
                  <div className="text-sm text-white/70">Secure Payment</div>
                  <div className="text-xs text-white/50">SSL encrypted</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
          <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto">
            {['overview', 'ingredients', 'how-to', 'technical', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-[#7cb342] border-b-2 border-[#7cb342]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'ingredients' && "What's Inside"}
                {tab === 'how-to' && 'How to Use'}
                {tab === 'technical' && 'Technical'}
                {tab === 'faq' && 'FAQ'}
              </button>
            ))}
          </div>

          <div className="glass border border-white/10 rounded-2xl p-8">
            {/* PnT: OVERVIEW TAB - Renders product description from metafields
                Priority order: richtext > multiline > plain > fallback to description
                See parser utilities at top of file for implementation details */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">{isBundle ? 'Bundle' : 'Product'} Overview</h2>

                {/* PnT: Metafield display with priority fallback chain */}
                {product.overviewRichtext?.value ? (
                  // PnT: RichText - parse JSON and render structured content
                  <div className="mb-8">
                    {parseRichText(product.overviewRichtext.value)}
                  </div>
                ) : product.overviewMultiline?.value ? (
                  // PnT: Multiline - split on \n and render as spaced paragraphs
                  <div className="mb-8">
                    {parseMultilineText(product.overviewMultiline.value)}
                  </div>
                ) : product.overviewPlain?.value ? (
                  // PnT: Plain text - simple paragraph
                  <p className="text-white/70 text-lg leading-relaxed mb-8">
                    {product.overviewPlain.value}
                  </p>
                ) : (
                  // PnT: Fallback - use product description if no metafields
                  <p className="text-white/70 text-lg leading-relaxed mb-8">
                    {product.description}
                  </p>
                )}
                {/* PnT: Key Benefits from key_benefits_parsable metafield (multiline text) */}
                {product.keyBenefits?.value && renderKeyBenefits(product.keyBenefits.value)}
              </div>
            )}

            {!isBundle && activeTab === 'ingredients' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">{"What's Inside"}</h2>
                {(item as any).ingredients && (item as any).ingredients.length > 0 && (
                  <div className="space-y-4">
                    {(item as any).ingredients.map((ingredient: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 glass rounded-xl border border-white/10"
                      >
                        <div>
                          <div className="text-white font-semibold">{ingredient.name}</div>
                          <div className="text-white/50 text-sm">{ingredient.amount}</div>
                        </div>
                        <div className="text-[#7cb342] font-bold">{ingredient.daily_value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isBundle && activeTab === 'how-to' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">How to Use</h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  {(item as any).how_to_use}
                </p>
              </div>
            )}

            {!isBundle && activeTab === 'technical' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Technical Information</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Formulation Overview</h3>
                    <div className="space-y-4">
                      <div className="p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                          <Check className="w-6 h-6 text-[#7cb342] flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-white font-semibold">Broad-spectrum trace minerals</span>
                            <p className="text-white/60 text-sm mt-1">Complete mineral profile for optimal plant nutrition</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                          <Check className="w-6 h-6 text-[#7cb342] flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-white font-semibold">Naturally occurring humic and fulvic compounds</span>
                            <p className="text-white/60 text-sm mt-1">Enhances nutrient uptake and soil biology</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                          <Check className="w-6 h-6 text-[#7cb342] flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-white font-semibold">Supports micronutrient availability</span>
                            <p className="text-white/60 text-sm mt-1">Chelated minerals for maximum plant absorption</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                          <Check className="w-6 h-6 text-[#7cb342] flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-white font-semibold">Compatible with soil, coco, and compost systems</span>
                            <p className="text-white/60 text-sm mt-1">Versatile application across growing media</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Application Guidance</h3>
                    <div className="bg-[#7cb342]/10 border border-[#7cb342]/30 rounded-xl p-6">
                      <p className="text-white/80 leading-relaxed mb-4">
                        For detailed application rates, guaranteed analysis, and commercial use information, please refer to our comprehensive technical documentation.
                      </p>
                      <Link
                        to="/technical-docs"
                        className="inline-flex items-center gap-2 text-[#7cb342] font-semibold hover:gap-4 transition-all"
                      >
                        View Technical Documentation →
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Safety & Handling</h3>
                    <ul className="space-y-2 text-white/70">
                      <li className="flex items-start gap-2">
                        <span className="text-[#7cb342] mt-1">•</span>
                        <span>Store in a cool, dry place away from direct sunlight</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#7cb342] mt-1">•</span>
                        <span>Keep out of reach of children and pets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#7cb342] mt-1">•</span>
                        <span>Use appropriate protective equipment when handling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#7cb342] mt-1">•</span>
                        <span>Follow all label instructions and local regulations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!isBundle && activeTab === 'faq' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="glass border border-white/10 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-semibold pr-4">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-[#7cb342] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6 text-white/70 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

          <div className="mb-16 hidden">
            <DiscountBox
              percentage={15}
              minPurchase={50}
              code="WELCOME15"
              description="Get 15% off your first order of $50 or more. Use code at checkout."
            />
          </div>

          {related.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">You May Also Like</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((relatedProduct) => (
                <Link
                  key={relatedProduct.handle}
                  to={`/product/${relatedProduct.handle}`}
                  className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-[#7cb342]/50 transition-all duration-300 hover:scale-105 group"
                >
                  <img
                    src={relatedProduct.featuredImage.url}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{relatedProduct.title}</h3>
                    <p className="text-white/70 mb-4 line-clamp-2">{relatedProduct.description}</p>
                    <div className="text-2xl font-bold text-white">
                      <Money data={relatedProduct.variants.nodes[0].price} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}