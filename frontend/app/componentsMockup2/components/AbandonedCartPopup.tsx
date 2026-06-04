import { useState, useEffect } from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

export default function AbandonedCartPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const { items, itemCount } = useCart();
  const { flags } = useFeatureFlags();

  useEffect(() => {
    if (!flags.abandonedCartPopup || itemCount === 0 || hasTriggered) {
      setIsVisible(false);
      return;
    }

    if (flags.abandonedCartTrigger === 'exit') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && flags.abandonedCartPopup) {
          setIsVisible(true);
          setHasTriggered(true);
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    } else if (flags.abandonedCartTrigger === 'tab-switch') {
      const handleVisibilityChange = () => {
        if (document.hidden && flags.abandonedCartPopup) {
          setTimeout(() => {
            if (document.hidden && flags.abandonedCartPopup) {
              setIsVisible(true);
              setHasTriggered(true);
            }
          }, 2000);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [flags.abandonedCartPopup, flags.abandonedCartTrigger, itemCount, hasTriggered]);

  if (!isVisible || !flags.abandonedCartPopup || itemCount === 0) {
    return null;
  }

  const firstItem = items[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1a1a2e] to-[#0a0015] border-2 border-[#7cb342] rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7cb342] to-[#558b2f]"></div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#7cb342]/20 border-2 border-[#7cb342] rounded-full flex items-center justify-center animate-pulse">
              <ShoppingCart className="w-8 h-8 text-[#7cb342]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Wait! Don't Leave Yet
          </h2>

          <p className="text-white/70 text-center mb-6">
            You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart. Complete your order now and start your wellness journey!
          </p>

          {firstItem && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <img
                  src={firstItem.imageUrl}
                  alt={firstItem.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold line-clamp-2 mb-1">
                    {firstItem.name}
                  </h3>
                  <p className="text-[#7cb342] font-bold">
                    ${firstItem.price.toFixed(2)}
                  </p>
                </div>
              </div>
              {itemCount > 1 && (
                <div className="mt-3 pt-3 border-t border-white/10 text-white/60 text-sm">
                  + {itemCount - 1} more {itemCount - 1 === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/checkout"
              onClick={() => setIsVisible(false)}
              className="block w-full py-3 px-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold text-center transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Complete My Order
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-center transition-colors border border-white/20"
            >
              Continue Shopping
            </button>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <div className="w-8 h-px bg-white/20"></div>
              <span>Free shipping on orders over $50</span>
              <div className="w-8 h-px bg-white/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
