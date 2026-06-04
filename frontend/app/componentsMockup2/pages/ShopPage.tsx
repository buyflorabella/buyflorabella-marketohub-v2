import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { products as staticProducts, bundles as staticBundles } from '../data/staticData';
import { useCart } from '../contexts/CartContext';
import AnnouncementBar from '../components/AnnouncementBar';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  featured: boolean;
  in_stock: boolean;
  subscription_available: boolean;
  subscription_discount: number;
}

export default function ShopPage() {
  const [filter, setFilter] = useState<'all' | 'products' | 'bundles'>('all');
  const { addItem } = useCart();

  const products = staticProducts;
  const bundles = staticBundles;

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image_url,
    });
  };

  const displayProducts = filter === 'bundles' ? [] : products;
  const displayBundles = filter === 'products' ? [] : bundles;

  return (
    <>
      <AnnouncementBar />
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

        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              filter === 'all'
                ? 'bg-[#7cb342] text-white'
                : 'glass border border-white/20 text-white hover:bg-white/10'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('products')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              filter === 'products'
                ? 'bg-[#7cb342] text-white'
                : 'glass border border-white/20 text-white hover:bg-white/10'
            }`}
          >
            Supplements
          </button>
          <button
            onClick={() => setFilter('bundles')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              filter === 'bundles'
                ? 'bg-[#7cb342] text-white'
                : 'glass border border-white/20 text-white hover:bg-white/10'
            }`}
          >
            Bundles & Kits
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBundles.map((bundle) => (
            <div
              key={bundle.id}
              className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-[#7cb342]/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="relative">
                <img
                  src={bundle.image_url}
                  alt={bundle.name}
                  className="w-full h-64 object-cover"
                />
                {bundle.featured && (
                  <div className="absolute top-4 left-4 bg-[#7cb342] text-white px-4 py-1 rounded-full text-sm font-bold">
                    Featured Bundle
                  </div>
                )}
                {bundle.savings_amount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Save ${bundle.savings_amount}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{bundle.name}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{bundle.description}</p>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-white">${bundle.price}</span>
                  {bundle.compare_at_price && (
                    <span className="text-lg text-white/40 line-through">
                      ${bundle.compare_at_price}
                    </span>
                  )}
                </div>
                <Link
                  to={`/product/${bundle.slug}`}
                  className="block w-full py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold text-center transition-all duration-300 group-hover:scale-105 shiny-border relative z-10"
                >
                  <span className="relative z-10">View Bundle Details</span>
                </Link>
              </div>
            </div>
          ))}

          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-[#7cb342]/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-[#7cb342] text-white px-4 py-1 rounded-full text-sm font-bold">
                    Best Seller
                  </div>
                )}
                {product.compare_at_price && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Sale
                  </div>
                )}
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#7cb342] text-[#7cb342]" />
                    ))}
                  </div>
                  <span className="text-sm text-white/50">(45 reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-white">${product.price}</span>
                  {product.compare_at_price && (
                    <span className="text-lg text-white/40 line-through">
                      ${product.compare_at_price}
                    </span>
                  )}
                </div>

                {product.subscription_available && (
                  <div className="mb-4 p-3 glass rounded-lg border border-[#7cb342]/30">
                    <p className="text-sm text-[#7cb342] font-semibold">
                      Subscribe & Save {product.subscription_discount}%
                    </p>
                    <p className="text-xs text-white/50">
                      ${(product.price * (1 - product.subscription_discount / 100)).toFixed(2)} per delivery
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.in_stock}
                      className="flex-1 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shiny-border relative z-10"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </span>
                    </button>
                    <Link
                      to="/checkout"
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-3 border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center shiny-border relative z-10"
                    >
                      <span className="relative z-10">Buy Now</span>
                    </Link>
                  </div>
                  <Link
                    to={`/product/${product.slug}`}
                    className="block w-full py-3 border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold text-center transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayProducts.length === 0 && displayBundles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-white/50">No products found</p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
