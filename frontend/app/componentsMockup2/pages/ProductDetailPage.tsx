import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Share2, Heart, ChevronDown, ChevronUp, Check, Truck, RefreshCw, Shield, ThumbsUp, Package } from 'lucide-react';
import { products as staticProducts, bundles as staticBundles, reviews as staticReviews, faqs as staticFaqs } from '../data/staticData';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import DiscountBox from '../components/DiscountBox';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  gallery_images: string[];
  ingredients: Array<{ name: string; amount: string; daily_value: string }>;
  benefits: string[];
  how_to_use: string;
  mineral_composition: any;
  featured: boolean;
  in_stock: boolean;
  subscription_available: boolean;
  subscription_discount: number;
  category?: string;
}

interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string;
  content: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

interface FAQ {
  id: string;
  product_id: string;
  question: string;
  answer: string;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscription'>('one-time');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'how-to' | 'technical' | 'faq'>('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { flags } = useFeatureFlags();

  const product = staticProducts.find(p => p.slug === slug) || null;
  const bundle = staticBundles.find(b => b.slug === slug) || null;
  const item = product || bundle;
  const isBundle = !!bundle;

  const reviews = item && !isBundle ? staticReviews.filter(r => r.product_id === item.id) : [];
  const faqs = item && !isBundle ? staticFaqs.filter(f => f.product_id === item.id) : [];
  const relatedProducts = item && !isBundle
    ? staticProducts.filter(p => p.id !== item.id && p.category === (item as any).category).slice(0, 3)
    : [];
  const bundleProducts = isBundle && bundle
    ? staticProducts.filter(p => (bundle as any).items.includes(p.id))
    : [];

  useEffect(() => {
    setSelectedImage(0);
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (!item) return;

    const price = item.price;

    addItem({
      productId: item.id,
      name: item.name,
      price,
      quantity,
      imageUrl: item.image_url,
    });
  };

  const handleToggleWishlist = () => {
    if (!item) return;

    toggleWishlist({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image_url,
    });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5;

  if (!item) {
    return (
      <>
        <AnnouncementBar />
        <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-3xl text-white mb-4">Product not found</h1>
            <Link to="/shop" className="text-[#7cb342] hover:underline">
              Return to shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  const allImages = [item.image_url, ...((item as any).gallery_images || [])];
  const finalPrice = item.price;

  return (
    <>
      <AnnouncementBar />
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
                src={allImages[selectedImage]}
                alt={item.name}
                className="w-full h-[500px] object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-[#7cb342]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {item.featured && (
              <div className="inline-block bg-[#7cb342] text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
                {isBundle ? 'Featured Bundle' : 'Best Seller'}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {item.name}
            </h1>
            <p className="text-xl text-white/70 mb-6">{item.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(averageRating)
                          ? 'fill-[#7cb342] text-[#7cb342]'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/70">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-bold text-white">${finalPrice.toFixed(2)}</span>
              {(item as any).compare_at_price && (
                <>
                  <span className="text-2xl text-white/40 line-through">
                    ${(item as any).compare_at_price}
                  </span>
                  {(item as any).savings_amount && (
                    <span className="text-lg text-[#7cb342] font-semibold">
                      Save ${(item as any).savings_amount}
                    </span>
                  )}
                </>
              )}
            </div>

            {!isBundle && (product as any).subscription_available && (
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
                      <div className="text-white/70">${(product as any).price.toFixed(2)}</div>
                    </div>
                    {purchaseType === 'one-time' && (
                      <Check className="w-6 h-6 text-[#7cb342]" />
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setPurchaseType('subscription')}
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
                        <span className="bg-[#7cb342] text-white text-xs px-2 py-0.5 rounded-full">
                          {(product as any).subscription_discount}% OFF
                        </span>
                      </div>
                      <div className="text-white/70">${finalPrice.toFixed(2)} per delivery</div>
                    </div>
                    {purchaseType === 'subscription' && (
                      <Check className="w-6 h-6 text-[#7cb342]" />
                    )}
                  </div>
                </button>
                {purchaseType === 'subscription' && (
                  <div className="mt-3">
                    <label className="block text-white/70 text-sm mb-2">Delivery Frequency:</label>
                    <select
                      value={subscriptionFrequency}
                      onChange={(e) => setSubscriptionFrequency(e.target.value)}
                      className="w-full p-3 glass border border-white/20 rounded-xl text-white bg-transparent"
                    >
                      <option value="30" className="bg-[#1a1a2e]">Every 30 days</option>
                      <option value="60" className="bg-[#1a1a2e]">Every 60 days</option>
                      <option value="90" className="bg-[#1a1a2e]">Every 90 days</option>
                    </select>
                  </div>
                )}
              </div>
            )}

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

            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!(item as any).in_stock}
                className="flex-1 py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shiny-border relative z-10"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  {(item as any).in_stock ? 'Add to Cart' : 'Out of Stock'}
                </span>
              </button>
              
              {flags.wishlistIcon && (
                <button
                  onClick={() => {
                    // Try browser bookmark first
                    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                    const shortcut = isMac ? '⌘+D' : 'Ctrl+D';
                    
                    if (window.sidebar?.addPanel) {
                      // Firefox (legacy)
                      window.sidebar.addPanel(item.name, window.location.href, '');
                    } else if ((window.external as any)?.AddFavorite) {
                      // IE (legacy)
                      (window.external as any).AddFavorite(window.location.href, item.name);
                    } else {
                      // Modern browsers: Save to app wishlist instead + show browser shortcut
                      handleToggleWishlist();
                      
                      // Show toast message
                      const message = isInWishlist(item.id) 
                        ? 'Removed from wishlist' 
                        : `Added to wishlist! Tip: Press ${shortcut} to bookmark in your browser`;
                      
                      setToastMessage(message);
                    }
                  }}
                  className={`px-6 py-4 glass border rounded-xl transition-all ${
                    isInWishlist(item.id)
                      ? 'border-[#7cb342] bg-[#7cb342]/10'
                      : 'border-white/20 hover:bg-white/10'
                  }`}
                  title={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist (or press Ctrl+D to bookmark)'}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist(item.id)
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
                      title: item.name,
                      text: item.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    setToastMessage('Link copied to clipboard!');
                  }
                }}
                className="px-6 py-4 glass border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                title="Share this product"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass border border-white/10 rounded-xl p-4 text-center">
                <Truck className="w-6 h-6 text-[#7cb342] mx-auto mb-2" />
                <div className="text-sm text-white/70">Free Shipping</div>
                <div className="text-xs text-white/50">On orders $75+</div>
              </div>
              <div className="glass border border-white/10 rounded-xl p-4 text-center">
                <RefreshCw className="w-6 h-6 text-[#7cb342] mx-auto mb-2" />
                <div className="text-sm text-white/70">Easy Returns</div>
                <div className="text-xs text-white/50">60-day guarantee</div>
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
            {(isBundle ? ['overview'] : ['overview', 'ingredients', 'how-to', 'technical', 'faq']).map((tab) => (
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
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">{isBundle ? 'Bundle' : 'Product'} Overview</h2>
                <p className="text-white/70 text-lg leading-relaxed mb-8">
                  {(item as any).long_description}
                </p>
                {isBundle && bundleProducts.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">What's Included</h3>
                    <div className="grid md:grid-cols-1 gap-4">
                      {bundleProducts.map((bundleProduct) => (
                        <Link
                          key={bundleProduct.id}
                          to={`/product/${bundleProduct.slug}`}
                          className="flex items-center gap-4 p-4 glass rounded-xl border border-white/10 hover:border-[#7cb342] transition-all group"
                        >
                          <img
                            src={bundleProduct.image_url}
                            alt={bundleProduct.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="text-white font-semibold group-hover:text-[#7cb342] transition-colors">
                              {bundleProduct.name}
                            </div>
                            <div className="text-white/60 text-sm">{bundleProduct.description}</div>
                          </div>
                          <Package className="w-5 h-5 text-[#7cb342]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {(item as any).benefits && (item as any).benefits.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Key Benefits</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(item as any).benefits.map((benefit: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-6 h-6 text-[#7cb342] flex-shrink-0 mt-1" />
                          <span className="text-white/80">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isBundle && activeTab === 'ingredients' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">What's Inside</h2>
                {(product as any).ingredients && (product as any).ingredients.length > 0 && (
                  <div className="space-y-4">
                    {(product as any).ingredients.map((ingredient: any, idx: number) => (
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
                  {(product as any).how_to_use}
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

        {!isBundle && reviews.length > 0 && (
          <div className="mb-16" id="reviews">
            <h2 className="text-3xl font-bold text-white mb-8">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review) => (
              <div
                key={review.id}
                className="glass border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-[#7cb342] text-[#7cb342]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  {review.verified_purchase && (
                    <span className="text-xs text-[#7cb342]">✓ Verified Purchase</span>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-2">{review.title}</h3>
                <p className="text-white/70 mb-4">{review.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">{review.author_name}</span>
                  <button className="flex items-center gap-1 text-white/50 hover:text-[#7cb342] transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful_count})</span>
                  </button>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-16">
          <DiscountBox
            percentage={15}
            minPurchase={50}
            code="WELCOME15"
            description="Get 15% off your first order of $50 or more. Use code at checkout."
          />
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">You May Also Like</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.slug}`}
                  className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-[#7cb342]/50 transition-all duration-300 hover:scale-105 group"
                >
                  <img
                    src={relatedProduct.image_url}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{relatedProduct.name}</h3>
                    <p className="text-white/70 mb-4 line-clamp-2">{relatedProduct.description}</p>
                    <div className="text-2xl font-bold text-white">${relatedProduct.price}</div>
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
