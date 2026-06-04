import { CheckCircle, Package, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';

export default function OrderConfirmationPage() {
  return (
    <>
      <AnnouncementBar />
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#7cb342]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-white/70">
            Thank you for your order. We've sent a confirmation email to your inbox.
          </p>
        </div>

        <div className="glass border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Order #10246</h2>
              <p className="text-white/50">Placed on January 19, 2026</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">$96.12</div>
              <p className="text-white/50 text-sm">Total</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-3">Shipping Address</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                John Doe<br />
                123 Main Street<br />
                Boulder, CO 80302<br />
                United States
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Shipping Method</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Standard Shipping (3-5 business days)<br />
                FREE
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h3 className="text-white font-bold mb-4">Order Items</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src="/20260105_163329.jpg"
                  alt="Product"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold">Essential Mineral Complex</h4>
                  <p className="text-white/50 text-sm">Qty: 1</p>
                </div>
                <div className="text-white font-bold">$89.00</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass border border-white/10 rounded-2xl p-6 text-center">
            <Package className="w-8 h-8 text-[#7cb342] mx-auto mb-3" />
            <h3 className="text-white font-bold mb-2">Track Your Order</h3>
            <p className="text-white/70 text-sm mb-4">
              You'll receive a tracking number once your order ships
            </p>
            <Link
              to="/account"
              className="inline-block px-6 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors"
            >
              View Orders
            </Link>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 text-center">
            <Mail className="w-8 h-8 text-[#7cb342] mx-auto mb-3" />
            <h3 className="text-white font-bold mb-2">Confirmation Email</h3>
            <p className="text-white/70 text-sm mb-4">
              Check your email for order details and updates
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/shop"
            className="inline-block px-8 py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>
        </div>
      </div>
    </>
  );
}
