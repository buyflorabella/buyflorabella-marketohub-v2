import { Menu, Search, User, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
              <Menu className="w-6 h-6 text-[#7cb342]" strokeWidth={2} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
              <Search className="w-6 h-6 text-[#7cb342]" strokeWidth={2} />
            </button>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img
              src="/flora_bella_logo.png"
              alt="Flora Bella Trace Minerals"
              className={`transition-all duration-300 hover:scale-110 cursor-pointer ${scrolled ? 'h-16' : 'h-24'}`}
            />
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
              <a href="#shop" className="hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                Shop
              </a>
              <a href="#learn" className="hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                Learn
              </a>
              <a href="#community" className="hover:text-[#7cb342] transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                Community
              </a>
            </nav>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
              <User className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 group relative">
              <ShoppingCart className="w-5 h-5 text-white group-hover:animate-bounce" strokeWidth={2} />
              <span className="absolute -top-1 -right-1 bg-[#7cb342] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold group-hover:scale-125 transition-transform">
                2
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
