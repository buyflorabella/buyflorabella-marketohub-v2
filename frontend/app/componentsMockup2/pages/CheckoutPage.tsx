import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Tag, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const availableCoupons = [
  { code: 'GETTEN', discount: 10, description: 'New growers save 10%' },
  { code: 'SAVE15', discount: 15, description: 'Save 15% on orders over $75' },
  { code: 'SPRING20', discount: 20, description: 'Spring special - 20% off' },
];

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { flags } = useFeatureFlags();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof availableCoupons[0] | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const shipping = 0;
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowExitModal(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/order-confirmation');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (items.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl text-white mb-4">Your cart is empty</h1>
            <a href="/shop" className="text-[#7cb342] hover:underline">
              Continue shopping
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <div className="flex items-center gap-2 text-white/50">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Secure checkout</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="glass border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              <div>
                <label className="block text-white mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-2 font-semibold">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                      placeholder="Boulder"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                      placeholder="CO"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                      placeholder="80302"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-semibold">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    maxLength={19}
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleChange}
                      required
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                      maxLength={4}
                      className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="glass border border-white/10 rounded-2xl p-8 sticky top-32">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="glass border border-white/10 rounded-xl p-4">
                    <div className="flex gap-4 mb-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <p className="text-white/50 text-sm">${item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/50 hover:text-red-400 transition-colors h-fit"
                        title="Remove item"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white/70 text-sm">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 glass border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 glass border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-white font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 border-t border-white/10 pt-6">
                {flags.discountDisplay && (
                  <div className="bg-[#7cb342]/10 border border-[#7cb342]/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-[#7cb342]" />
                      <span className="text-sm font-semibold text-[#7cb342]">Available Discount Codes</span>
                    </div>
                    <div className="space-y-2">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon.code}
                          onClick={() => {
                            setCouponCode(coupon.code);
                            const c = availableCoupons.find(c => c.code === coupon.code);
                            if (c) setAppliedCoupon(c);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <span className="text-white font-bold text-sm">{coupon.code}</span>
                            <p className="text-white/60 text-xs">{coupon.description}</p>
                          </div>
                          <span className="text-[#7cb342] font-bold text-sm">{coupon.discount}% OFF</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-6 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-sm mt-2">{couponError}</p>}
                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-[#7cb342]/20 border border-[#7cb342]/50 rounded-xl flex justify-between items-center">
                    <span className="text-[#7cb342] font-semibold text-sm">
                      {appliedCoupon.code} applied ({appliedCoupon.discount}% off)
                    </span>
                    <button onClick={removeCoupon} className="text-white/70 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#7cb342]">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-[#7cb342]">FREE</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-xl font-bold pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Complete Order
              </button>
              <p className="text-center text-white/50 text-sm mt-4">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </form>
        </div>

      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong border border-white/20 rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#7cb342]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-[#7cb342]" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">Wait! Before You Go...</h3>
              <p className="text-white/70 mb-6">
                Complete your order now and get an additional 5% off with code <span className="font-bold text-[#7cb342]">CHECKOUT5</span>
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setCouponCode('CHECKOUT5');
                    setAppliedCoupon({ code: 'CHECKOUT5', discount: 5, description: 'Exit offer - 5% off' });
                    setShowExitModal(false);
                  }}
                  className="w-full py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Apply Discount & Continue
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-4 glass border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  No Thanks, I'll Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
