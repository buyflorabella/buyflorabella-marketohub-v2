import { Menu, Search, User, ShoppingCart, X, LockKeyhole } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { Link, useRouteLoaderData, Await, useFetcher } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useEnv } from '../contexts/EnvContext';
import type { RootLoader } from '~/routes/root';
import type { Cart } from '@shopify/hydrogen/storefront-api-types';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { announcementBarEnabled, announcementBarCoupon } = useEnv();
  
  const fetcher = useFetcher();
  const { openCart } = useCart();

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetcher.load(`/api/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery]);

  const rootData = useRouteLoaderData<RootLoader>('root');

  const storeLocked = rootData?.env?.storeLocked === "true";
  const message1 = rootData?.env?.message1 ?? '';
  const message2 = rootData?.env?.message2 ?? '';
  const message3 = rootData?.env?.message3 ?? '';  
  const contactPageUrl = rootData?.env?.contactPageUrl ?? '/contact';
  const shopPageUrl = rootData?.env?.shopPageUrl ?? '/shop';

  const cartPromise = rootData?.cart;

  const isExternalUrl = (url: string): boolean => /^https?:\/\//i.test(url);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setSearchQuery('');
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  if (storeLocked) {
    return (
      <header className="locked-header p-4 text-center bg-gray-100 border-b">
        <p className="font-bold">{message1}</p>
        <p className="text-sm">{message2}</p>
        <p className="text-xs italic">{message3}</p>
      </header>
    );
  }  

  return (
    <>
      {announcementBarEnabled && <AnnouncementBar />}
      <header
        className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'top-0 glass-strong shadow-xl' : ''
        }`}
        style={{
          background: scrolled
            ? 'rgba(10, 10, 10, 0.85)'
            : 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <Menu className="w-6 h-6 text-[#7cb342]" strokeWidth={2} />
              </button>
              <button
                onClick={toggleSearch}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12"
              >
                <Search className="w-6 h-6 text-[#7cb342]" strokeWidth={2} />
              </button>
            </div>

            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
              <img
                src="/flora_bella_logo.png"
                alt="Flora Bella Trace Minerals"
                className={`transition-all duration-300 hover:scale-110 cursor-pointer ${scrolled ? 'h-16' : 'h-24'}`}
              />
            </Link>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
                {isExternalUrl(shopPageUrl) ? (
                  <a
                    href={shopPageUrl}
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                  >
                    Shop
                  </a>
                ) : (
                  <Link
                    to={shopPageUrl}
                    className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                  >
                    Shop
                  </Link>
                )}
                <Link
                  to="/learn"
                  className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                >
                  Learn
                </Link>
                <Link
                  to="/about"
                  className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                >
                  About
                </Link>
                <Link
                  to="/community"
                  className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                >
                  Community
                </Link>
                {isExternalUrl(contactPageUrl) ? (
                  <a
                    href={contactPageUrl}
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                  >
                    Contact
                  </a>
                ) : (
                  <Link
                    to={contactPageUrl}
                    className="text-white hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1 no-underline"
                  >
                    Contact
                  </Link>
                )}
              </nav>
              <Link to={rootData.isLoggedIn ? "/account" : "/account/login"} className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
                {rootData.isLoggedIn ?
                  <User className="w-5 h-5 text-white" strokeWidth={2} /> : 
                  <LockKeyhole className="w-5 h-5 text-white" strokeWidth={2} />
                }
              </Link>       
              <button
                onClick={openCart}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 group relative"
              >
                <ShoppingCart className="w-5 h-5 text-white group-hover:animate-bounce" strokeWidth={2} />
                <Suspense fallback={null}>
                  <Await resolve={cartPromise}>
                    {(resolvedCart: Cart) => {
                      const itemCount = resolvedCart?.totalQuantity ?? 0;
                      if (itemCount === 0) return null;
                      return (
                        <span className="absolute -top-1 -right-1 bg-[#7cb342] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold group-hover:scale-125 transition-transform">
                          {itemCount}
                        </span>
                      );
                    }}
                  </Await>
                </Suspense>
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 bg-black/90 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors"
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
                    {fetcher.state === 'loading' ? (
                      <div className="p-6 text-white/50 text-sm flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#7cb342] border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    ) : (
                      <div className="p-2 space-y-4">
                        {/* Product Section */}
                        {fetcher.data?.products?.length > 0 && (
                          <div>
                            <h3 className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40">Products</h3>
                            <ul className="space-y-1">
                              {fetcher.data.products.map((product: any) => (
                                <li key={product.id}>
                                  <Link
                                    to={`/product/${product.handle}`}
                                    onClick={closeSearch}
                                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors group"
                                  >
                                    <div className="w-12 h-12 bg-white/5 rounded overflow-hidden">
                                      {product.featuredImage && (
                                        <img src={product.featuredImage.url} alt={product.title} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white text-sm font-medium group-hover:text-[#7cb342] transition-colors">{product.title}</p>
                                      <p className="text-white/50 text-xs">${product.variants.nodes[0].price.amount}</p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Articles Section */}
                        {fetcher.data?.articles?.length > 0 && (
                          <div className="border-t border-white/5 pt-4">
                            <h3 className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40">Articles & News</h3>
                            <ul className="space-y-1">
                              {fetcher.data.articles.map((article: any) => (
                                <li key={article.id}>
                                  <Link
                                    to={`/article/${article.blog.handle}/${article.handle}`}
                                    onClick={closeSearch}
                                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors group"
                                  >
                                    <div className="w-12 h-12 bg-white/5 rounded overflow-hidden">
                                      {article.image && (
                                        <img src={article.image.url} alt={article.title} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-white text-sm font-medium group-hover:text-[#7cb342] transition-colors line-clamp-1">{article.title}</p>
                                      <p className="text-white/40 text-xs">Read Article</p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Empty State */}
                        {fetcher.data && fetcher.data.products?.length === 0 && fetcher.data.articles?.length === 0 && (
                          <div className="p-8 text-center">
                            <p className="text-white/40 text-sm">No results found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <img
                src="/flora_bella_logo.png"
                alt="Flora Bella"
                className="h-16"
              />
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <nav className="flex flex-col p-6 space-y-2">
              {isExternalUrl(shopPageUrl) ? (
                <a
                  href={shopPageUrl}
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Shop
                </a>
              ) : (
                <Link
                  to={shopPageUrl}
                  onClick={closeMobileMenu}
                  className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Shop
                </Link>
              )}
              <Link
                to="/learn"
                onClick={closeMobileMenu}
                className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
              >
                Learn
              </Link>
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
              >
                About
              </Link>
              <Link
                to="/community"
                onClick={closeMobileMenu}
                className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
              >
                Community
              </Link>
              {isExternalUrl(contactPageUrl) ? (
                <a
                  href={contactPageUrl}
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Contact
                </a>
              ) : (
                <Link
                  to={contactPageUrl}
                  onClick={closeMobileMenu}
                  className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Contact
                </Link>
              )}              
              <Link
                to="/account"
                onClick={closeMobileMenu}
                className="text-white text-lg font-medium py-4 px-4 hover:bg-white/10 rounded-lg transition-colors"
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}