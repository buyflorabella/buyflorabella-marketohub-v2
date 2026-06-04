import { Star, Plus, Minus, ArrowRight, Sparkles, TreeDeciduous, Flower2, Leaf, ShoppingCart } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Await, useLoaderData } from 'react-router';
import { CartForm } from '@shopify/hydrogen';

export default function FeatureProduct() {
  const [quantity, setQuantity] = useState(1);
  const { latestProduct } = useLoaderData();
  const { openCart } = useCart();

  return (
    <section className="gradient-dark py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 floating">
          <Leaf className="w-40 h-40 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-20 right-10 floating-delayed">
          <Leaf className="w-32 h-32 text-[#8b6f47]" />
        </div>
        <div className="absolute top-1/2 right-1/4 floating-x">
          <Leaf className="w-24 h-24 text-[#7cb342]" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="glass-strong rounded-2xl p-8 shadow-2xl sticky top-24 border border-white/10">
            <Suspense fallback={<>Loading...</>}>
              <Await
                resolve={latestProduct}
                errorElement={<>Error loading products!</>}
              >
                {(resolved) => {
                  const product = resolved.products.nodes.at(0);
                  return <>
                    <div className="relative">
                      <div className="absolute -top-4 -right-4 bg-[#7cb342] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                        Best Seller
                      </div>
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText}
                        className="w-full rounded-xl mb-6 hover:scale-110 hover:rotate-2 transition-all duration-500 parallax-float"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#7cb342] text-[#7cb342]" />
                      ))}
                      <span className="text-white/70 text-sm ml-2">(487 reviews)</span>
                    </div>

                    <div className="text-4xl font-bold text-white mb-6">{product.priceRange.minVariantPrice.currencyCode}{product.priceRange.minVariantPrice.amount}</div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Variants</label>
                        <select className="w-full glass border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7cb342] transition-colors">
                          {product.variants.nodes.map((variant) => {
                            return <option value={variant.id} key={variant.id}>
                              {variant.title}
                            </option>
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Quantity</label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="glass p-3 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="glass p-3 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <CartForm
                          route="/cart"
                          action={CartForm.ACTIONS.LinesAdd}
                          inputs={{
                            lines: [
                              {
                                merchandiseId: product.variants.nodes.at(0).id,
                                quantity,
                              },
                            ],
                          }}
                        >
                            {(fetcher) => (
                              <>
                                <div className="flex gap-3">
                                  <button
                                    type="submit"
                                    disabled={!product.variants.nodes[0].availableForSale || fetcher.state !== 'idle'}
                                    className="flex-1 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shiny-border relative z-10">
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                      <ShoppingCart className="w-5 h-5" />
                                      {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
                                    </span>
                                  </button>
                                  <button
                                    type="submit"
                                    onClick={openCart}
                                    disabled={!product.variants.nodes[0].availableForSale || fetcher.state !== 'idle'}
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

                  </>
                }}
              </Await>
            </Suspense>
          </div>

          <div className="glass-strong rounded-2xl p-10 shadow-2xl border border-white/10">
            <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="text-[#7cb342]">Organic trace mineral concentrate</span>
            </div>

            <h3 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6 leading-tight">
              More life in your soil, more life in your plants.
            </h3>

            <div className="space-y-4 text-lg text-white/80 mb-8">
              <p>
                Most fertilizers only feed the plant. Flora Bella feeds the soil life first, so
                roots can absorb more of what you already give them.
              </p>
              <p>
                A few milliliters per gallon is all it takes. Within a few waterings you will notice
                thicker stems, deeper green leaves, and blooms that last longer.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 glass rounded-xl hover:bg-white/5 transition-colors accent-border">
                <div className="p-2 bg-[#7cb342]/20 rounded-lg">
                  <Flower2 className="w-6 h-6 text-[#7cb342]" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Bigger, fuller blooms</h4>
                  <p className="text-white/60 text-sm">More vibrant colors and longer-lasting flowers</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 glass rounded-xl hover:bg-white/5 transition-colors accent-border">
                <div className="p-2 bg-[#7cb342]/20 rounded-lg">
                  <TreeDeciduous className="w-6 h-6 text-[#7cb342]" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Deeper, more resilient roots</h4>
                  <p className="text-white/60 text-sm">Stronger foundation for healthier growth</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 glass rounded-xl hover:bg-white/5 transition-colors accent-border">
                <div className="p-2 bg-[#7cb342]/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-[#7cb342]" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Better taste and aroma in food crops</h4>
                  <p className="text-white/60 text-sm">Enhanced flavor profiles and nutritional content</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/50 mb-6">
              Safe for raised beds, containers, indoor plants, and outdoor gardens when used as directed.
            </p>

            <Link
              to="/product/bio-trace-mix"
              className="inline-flex items-center gap-2 text-[#7cb342] font-semibold hover:gap-4 transition-all"
            >
              View full product details page
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
