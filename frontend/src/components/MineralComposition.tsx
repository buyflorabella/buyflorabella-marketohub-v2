export default function MineralComposition() {
  const minerals = [
    { symbol: 'Mg', name: 'Magnesium', number: 12, benefit: 'Supports deep green foliage and strong energy production in leaves.' },
    { symbol: 'Fe', name: 'Iron', number: 26, benefit: 'Essential for chlorophyll production and oxygen transport in plants.' },
    { symbol: 'Zn', name: 'Zinc', number: 30, benefit: 'Activates enzymes and regulates growth hormones for healthy development.' },
    { symbol: 'Cu', name: 'Copper', number: 29, benefit: 'Supports protein synthesis and strengthens cell walls.' },
    { symbol: 'Mn', name: 'Manganese', number: 25, benefit: 'Helps chelate nutrients so roots can access what already exists in the soil.' },
    { symbol: 'B', name: 'Boron', number: 5, benefit: 'Critical for cell division and proper fruit and seed development.' },
  ];

  return (
    <section className="py-32 relative gradient-offwhite overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Soil texture"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#7cb342] rounded-full floating"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#8b6f47] rounded-full floating-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-[#7cb342] rounded-full floating"></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-[#8b6f47] rounded-full floating-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#7cb342] rounded-full floating-slow"></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[#8b6f47] rounded-full floating-x"></div>
        <div className="absolute bottom-1/2 left-1/4 w-4 h-4 bg-[#7cb342] rounded-full floating-diagonal"></div>
        <div className="absolute top-1/3 left-2/3 w-3 h-3 bg-[#8b6f47] rounded-full floating-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
            <span className="text-[#7cb342] font-semibold text-sm tracking-wide">70+ TRACE MINERALS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold heading-font text-gray-900 mb-6">
            Inside Every Scoop<br />Of Flora Bella
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Over 70 trace minerals in a molecular matrix designed by nature
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16 max-w-6xl mx-auto">
          {minerals.map((mineral, index) => (
            <div key={index} className="floating" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="bg-white border border-[#7cb342]/20 rounded-xl p-4 hover:border-[#7cb342]/50 hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 group shadow cursor-pointer">
                <div className="text-right text-[#7cb342]/50 text-xs font-bold mb-1">
                  {mineral.number}
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#7cb342] mb-1 heading-font group-hover:scale-110 transition-transform">
                    {mineral.symbol}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {mineral.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {minerals.map((mineral, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 accent-border shadow hover:shadow-xl hover:scale-105 hover:border-[#7cb342]/50 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#7cb342]/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-[#7cb342] heading-font">{mineral.symbol}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 heading-font">{mineral.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{mineral.benefit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-lg mb-6 font-medium">
            + 64 additional trace minerals working in synergy
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {['Mo', 'Co', 'Ni', 'Se', 'Si', 'V', 'Cr', 'Li', 'Sr', 'Ca', 'K', 'S', 'P', 'N'].map((element, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs font-bold tracking-wide hover:border-[#7cb342]/50 hover:text-[#7cb342] hover:scale-110 hover:-translate-y-1 transition-all duration-200 shadow-sm cursor-pointer"
              >
                {element}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
