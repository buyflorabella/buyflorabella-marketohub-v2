import { Droplets, Sparkles, TrendingUp, Leaf } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Beneficial Microbes',
      description: 'Naturally occurring beneficial bacteria:',
      highlights: ['Convert nutrients into forms plants can absorb', 'Support root development through natural growth signaling', 'Compete with harmful organisms in the root zone', 'Improve tolerance to environmental stress (drought, heat, poor soil condition)'],
      //video: 'https://cdn.shopify.com/videos/c/o/v/12248bcbad704361b1fad8c56073383f.mp4',
      image: "https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Why_Growers_Choose_5_of_6_lighted_roots.jpg?v=1769724521",
      icon: Droplets,
    },
    {
      number: '02',
      title: 'Humic Acid - Soil Structure & Retention',
      description: 'Humic acids are large organic compounds that:',
      highlights: ['Improve soil structure, aggregation, and aeration', 'Increase water-holding capacity', 'Bind and retain nutrients in the root zone', 'Support beneficial microbial activity'],
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Rectangle_-_How_Flora_Bella_Works_2_of_3_Humic_Acid.jpg?v=1769727046',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'Fulvic Acid - Mineral Transport',
      description: 'Fulvic acids are smaller, highly bioavailable organic compounds that:',
      highlights: ['Bind trace minerals into plant-usable forms', 'Facilitate movement of minerals through plant cell walls', 'Improve nutrient uptake efficiency'],
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Rectangle_-_How_Flora_Bella_Works_3_of_3_Fulvic_Acid.jpg?v=1769727046',
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
                  
                  <div className="relative rounded-2xl shadow-2xl border border-gray-200 w-full aspect-[4/3] overflow-hidden group-hover:scale-110 transition-transform duration-700 bg-gray-100">
                    {step.video ? (
                      <video
                        src={step.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="absolute top-6 left-6 bg-[#7cb342] text-white px-6 py-3 rounded-full font-bold text-lg hidden">
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
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3 ml-6">
                    {step.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-gray-900 font-semibold">{highlight}</span>
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}