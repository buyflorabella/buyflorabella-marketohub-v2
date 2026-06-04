import { Truck, Shield, MessageCircle } from 'lucide-react';

export default function ReassuranceStrip() {
  return (
    <section className="bg-[#2d1b4e] py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
            <div className="p-3 bg-[#d4ff00]/10 rounded-xl">
              <Truck className="w-8 h-8 text-[#d4ff00]" />
            </div>
            <p className="text-white/90 font-medium">Free US shipping over $75</p>
          </div>

          <div className="glass rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
            <div className="p-3 bg-[#ff0080]/10 rounded-xl">
              <Shield className="w-8 h-8 text-[#ff0080]" />
            </div>
            <p className="text-white/90 font-medium">Secure checkout with major cards and PayPal</p>
          </div>

          <div className="glass rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
            <div className="p-3 bg-[#90ffd9]/10 rounded-xl">
              <MessageCircle className="w-8 h-8 text-[#90ffd9]" />
            </div>
            <p className="text-white/90 font-medium">Support from real growers, not bots</p>
          </div>
        </div>
      </div>
    </section>
  );
}
