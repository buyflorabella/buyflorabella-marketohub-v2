import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SoloShopButton() {
  return (
    <section className="gradient-offwhite py-20">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold heading-font text-gray-900 mb-6">
          Shop Flora Bella Products
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Explore our premium mineral soil supplements, crafted to restore nutrient balance and
          help your garden thrive.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <Link
            to="/shop"
            className="gradient-green text-white px-8 py-4 rounded-full font-bold text-base hover:scale-110 hover:shadow-2xl hover:shadow-[#7cb342]/50 transition-all duration-300 shadow-xl flex items-center gap-2 group relative z-10"
          >
            <span className="relative z-10 flex items-center gap-2">
              Shop Bio Trace Mix
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>

          <Link
            to="/community"
            className="bg-white border border-gray-200 px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-50 hover:scale-105 hover:border-[#7cb342]/50 transition-all duration-300 text-gray-900 relative z-10"
          >
            <span className="relative z-10">See Real Grower Results</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
