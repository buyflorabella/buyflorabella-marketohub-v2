import { Bug, Sparkles, Users, Leaf, Droplet, Flag, Shield, FileStack, Flower2 } from 'lucide-react';
import { Folders } from 'lucide-react';

export default function BenefitsGrid() {
  const benefits = [
    {
      icon: Leaf,
      title: 'Compost-Friendly Trace Minerals',
      description: 'Designed to work alongside compost and living soil systems — helping unlock what your soil is already capable of.',
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Why_Growers_Choose_1_of_6_Compost_pile.jpg?v=1769724521',
    },
    {
      icon: FileStack,
      title: 'Ancient + Mineral-dense',
      description: 'Made from mineral deposits formed over thousands of years — carrying complexity you can’t replicate in a lab.',
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Why_Growers_Choose_2_of_6_FB_Zoom_in.jpg?v=1769724260',
    },
    {
      icon: Flag,
      title: 'Born in the USA',
      description: 'Sourced and crafted in the United States, Flora Bella is composted for 6-8 months to reawaken naturally occurring microbes and biology that have rested for thousands of years - brining ancient mineral vitality back into living soil.',
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_6_of_6.jpg?v=1770154470',
    },
    {
      icon: Sparkles,
      title: 'Iron-ore Derived Blend',
      description: 'Encapsulated in an iron core, preserving the natural biology in the Bucatunna clay.',
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Why_Growers_Choose_4_of_6_Flora_Bella_Bio_Trace.jpg?v=1769724522',
    },
    {
      icon: Bug,
      title: 'Biology Included',
      description: 'Designed to support beneficial microbes and nutrient cycling — the living foundation behind healthy, resilient soil.',
      image: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Why_Growers_Choose_5_of_6_lighted_roots.jpg?v=1769724521',
    },
    {
      icon: Users,
      title: 'Handled with Care + Lab Verified',
      description: 'Gently processed and packaged with care, with quality checks to support consistency and peace of mind.',
      image: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
  ];

  return (
    <section className="py-32 relative bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Garden background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-10 floating">
          <Leaf className="w-32 h-32 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/4 right-10 floating-delayed">
          <Flower2 className="w-28 h-28 text-[#8b6f47]" />
        </div>
        <div className="absolute top-1/2 right-1/3 floating-slow">
          <Leaf className="w-24 h-24 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 floating-diagonal">
          <Flower2 className="w-20 h-20 text-[#7cb342]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold heading-font text-white mb-6">
            Why Growers Choose<br />Flora Bella
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Trusted by home gardeners and commercial growers alike
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="glass-strong rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={benefit.image}
                  alt={benefit.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  {typeof benefit.icon === 'string' ? (
                    <img src={benefit.icon} alt={benefit.title} className="w-6 h-6" />
                  ) : (
                    <benefit.icon className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold heading-font text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
