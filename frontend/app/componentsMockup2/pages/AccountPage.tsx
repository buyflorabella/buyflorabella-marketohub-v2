import { Package, MapPin, Settings, LogOut, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountPage() {
  const orders = [
    {
      id: '#10245',
      date: 'Jan 15, 2026',
      status: 'Delivered',
      total: 89.00,
      items: 2,
    },
    {
      id: '#10198',
      date: 'Dec 28, 2025',
      status: 'Delivered',
      total: 49.00,
      items: 1,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
          <p className="text-white/70">Welcome back, John!</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="glass border border-white/10 rounded-2xl p-6">
            <nav className="space-y-2">
              <a href="#orders" className="flex items-center gap-3 px-4 py-3 bg-[#7cb342]/20 text-[#7cb342] rounded-xl font-semibold">
                <Package className="w-5 h-5" />
                Orders
              </a>
              <a href="#addresses" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <MapPin className="w-5 h-5" />
                Addresses
              </a>
              <a href="#wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <Heart className="w-5 h-5" />
                Wishlist
              </a>
              <a href="#settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </a>
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out
              </Link>
            </nav>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-white">Order {order.id}</h3>
                          <span className="px-3 py-1 bg-[#7cb342]/20 text-[#7cb342] text-sm rounded-full font-semibold">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-white/50 text-sm mt-1">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${order.total.toFixed(2)}</div>
                        <p className="text-white/50 text-sm">{order.items} items</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-lg font-semibold transition-colors">
                        View Order
                      </button>
                      <button className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white rounded-lg font-semibold transition-colors">
                        Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Active Subscriptions</h2>
              <div className="glass border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Essential Mineral Complex</h3>
                    <p className="text-white/70 text-sm">Next delivery: Feb 15, 2026</p>
                    <p className="text-white/50 text-sm">Every 30 days</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$75.65</div>
                    <p className="text-[#7cb342] text-sm font-semibold">15% savings</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-lg font-semibold transition-colors">
                    Manage
                  </button>
                  <button className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white rounded-lg font-semibold transition-colors">
                    Skip Next
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Saved Addresses</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white">Home</h3>
                    <span className="text-xs text-[#7cb342] bg-[#7cb342]/20 px-2 py-1 rounded-full">Default</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    John Doe<br />
                    123 Main Street<br />
                    Boulder, CO 80302<br />
                    United States
                  </p>
                  <button className="mt-4 text-[#7cb342] hover:underline text-sm font-semibold">
                    Edit
                  </button>
                </div>
                <button className="glass border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-[#7cb342]/50 hover:bg-white/5 transition-all text-white/50 hover:text-white flex items-center justify-center min-h-[160px]">
                  + Add New Address
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
