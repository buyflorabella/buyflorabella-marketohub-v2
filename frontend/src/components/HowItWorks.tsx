import { Droplets, Sparkles, TrendingUp, Leaf, CircleDot } from 'lucide-react';

export default function HowItWorks() {
  const minerals = [
    { name: 'Mg', delay: '0s', left: '15%', top: '30%' },
    { name: 'Zn', delay: '0.5s', left: '29%', top: '50%' },
    { name: 'Cu', delay: '1s', left: '43%', top: '30%' },
    { name: 'Fe', delay: '1.5s', left: '57%', top: '50%' },
    { name: 'Mn', delay: '2s', left: '71%', top: '30%' },
    { name: 'B', delay: '2.5s', left: '85%', top: '50%' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Mix & Apply',
      description: 'Add the recommended amount of Flora Bella Bio Trace to your watering can or irrigation tank.',
      image: 'https://images.pexels.com/photos/6231882/pexels-photo-6231882.jpeg?auto=compress&cs=tinysrgb&w=1920',
      icon: Droplets,
    },
    {
      number: '02',
      title: 'Activate Biology',
      description: 'Trace minerals and natural acids wake up the biology in your soil and help unlock tied up nutrition.',
      image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1920',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'See Growth',
      description: 'Plants access a broader buffet of minerals, leading to stronger growth using the same fertilizer routine.',
      image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=1920',
      icon: TrendingUp,
    },
  ];

  return (
    <section className="gradient-offwhite py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 floating">
          <Leaf className="w-48 h-48 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-40 right-32 floating-delayed">
          <Leaf className="w-64 h-64 text-[#8b6f47]" />
        </div>
        <div className="absolute top-1/2 left-1/3 floating-slow">
          <Leaf className="w-36 h-36 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 floating-x">
          <Leaf className="w-28 h-28 text-[#8b6f47]" />
        </div>
        <div className="absolute top-1/4 right-1/2 floating-diagonal">
          <Leaf className="w-20 h-20 text-[#7cb342]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold heading-font text-gray-900 mb-6">
            How Flora Bella Works<br />With Your Soil
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            A precise blend of over 70 trace minerals working in harmony with your soil
          </p>

          <div className="relative max-w-5xl mx-auto mb-20">
            <div className="relative w-full aspect-[2/1]">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7cb342" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#8b6f47" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#7cb342" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 100,250 Q 300,150 500,250 T 900,250"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,10"
                  className="animate-pulse"
                />
              </svg>

              {minerals.map((mineral, index) => (
                <div
                  key={index}
                  className="absolute floating"
                  style={{
                    left: mineral.left,
                    top: mineral.top,
                    animationDelay: mineral.delay,
                  }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-2xl bg-[#7cb342] border-2 border-white/30">
                    {mineral.name}
                  </div>
                </div>
              ))}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-[#7cb342]/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-32 h-32 rounded-full border-4 border-[#7cb342]/30 flex items-center justify-center bg-white shadow-xl">
                    <CircleDot className="w-12 h-12 text-[#7cb342]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-32">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#7cb342]/20 to-[#8b6f47]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
                  <img
                    src={step.image}
                    alt={step.title}
                    className="relative rounded-2xl shadow-2xl border border-gray-200 w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 bg-[#7cb342] text-white px-6 py-3 rounded-full font-bold text-lg">
                    Step {step.number}
                  </div>
                </div>
              </div>

              <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <div className="bg-white rounded-2xl p-8 accent-border shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7cb342]/20 rounded-xl mb-6">
                    <step.icon className="w-8 h-8 text-[#7cb342]" />
                  </div>
                  <h3 className="text-4xl font-bold heading-font text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
