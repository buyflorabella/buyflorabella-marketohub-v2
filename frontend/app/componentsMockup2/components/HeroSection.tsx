import { ArrowRight, CheckCircle2, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 gradient-offwhite">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#7cb342] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b6f47] rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 floating">
          <Leaf className="w-32 h-32 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 floating-delayed">
          <Leaf className="w-24 h-24 text-[#8b6f47]" />
        </div>
        <div className="absolute top-1/3 right-1/3 floating-slow">
          <Leaf className="w-20 h-20 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 floating-x">
          <Leaf className="w-28 h-28 text-[#8b6f47]" />
        </div>
        <div className="absolute top-2/3 right-1/4 floating-diagonal">
          <Leaf className="w-16 h-16 text-[#7cb342]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-left">
          <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
            <Link to="/shop" className="gradient-green text-white px-8 py-4 rounded-full font-bold text-base hover:scale-110 hover:shadow-2xl hover:shadow-[#7cb342]/50 transition-all duration-300 shadow-xl flex items-center gap-2 group shiny-border relative z-10">
              <span className="relative z-10 flex items-center gap-2">BUY NOW</span>
            </Link>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold heading-font text-gray-900 mb-6 leading-[0.95]">
            Wake Up<br />Your Soil
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-6 font-medium leading-relaxed">
            Bio trace minerals that make every drop of fertilizer work harder.
          </p>

          <div className="relative block lg:hidden">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r rounded-3xl blur-2xl"></div>
              <img
                src="/20260105_163329.jpg"
                alt="Flora Bella Bio Trace Mix"
                className="relative rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </div>

          <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-xl">
            Flora Bella delivers commercial-grade trace minerals to home gardens. With a single 
            addition to your watering routine—or blended directly into your soil—you strengthen 
            soil health, support resilient plants, and bring deeper color and vitality to 
            every bed, pot, and vegetable garden.
          </p>

          <div className="bg-[#7cb342]/5 border border-[#7cb342]/20 rounded-2xl p-6 mb-10 max-w-xl">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">Trusted for Over 25 Years.</span> Flora Bella works with naturally occurring mineral complexes that have supported commercial agriculture for decades. These minerals are thoughtfully processed to preserve biological integrity and improve plant availability—supporting soil as a living system, not a substrate. Now available in nearby retail stores and delivered directly to your door.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link to="/shop" className="gradient-green text-white px-8 py-4 rounded-full font-bold text-base hover:scale-110 hover:shadow-2xl hover:shadow-[#7cb342]/50 transition-all duration-300 shadow-xl flex items-center gap-2 group shiny-border relative z-10">
              <span className="relative z-10 flex items-center gap-2">
                Shop Bio Trace Mix
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            <Link to="/community" className="bg-white border border-gray-200 px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-50 hover:scale-105 hover:border-[#7cb342]/50 transition-all duration-300 text-gray-900 shiny-border relative z-10">
              <span className="relative z-10">See Real Grower Results</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#7cb342] flex-shrink-0" />
              <span>Over seventy trace minerals</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#7cb342] flex-shrink-0" />
              <span>Loved by organic growers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#7cb342] flex-shrink-0" />
              <span>From farmers to you</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative parallax-float">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#7cb342]/20 to-[#8b6f47]/20 rounded-3xl blur-2xl"></div>
            <img
              src="/20260105_163329.jpg"
              alt="Flora Bella Bio Trace Mix"
              className="relative rounded-2xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
