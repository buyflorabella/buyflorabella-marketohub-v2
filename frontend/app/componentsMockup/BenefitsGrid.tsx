import { Bug, Sparkles, Users, Leaf, Droplet, Shield, Flower2 } from 'lucide-react';

export default function BenefitsGrid() {
  const benefits = [
    {
      icon: Bug,
      title: 'Supports beneficial microbes',
      description: 'Formulated to support the tiny life in your soil that feeds your plants every day.',
      image: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
      icon: Sparkles,
      title: 'Magnesium enriched',
      description: 'Crafted with an ideal balance of magnesium for lush color and strong photosynthesis.',
      image: 'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
      icon: Users,
      title: 'Created by growers',
      description: 'Developed by growers who care about long term soil health, not quick chemical fixes.',
      image: 'https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
      icon: Leaf,
      title: 'Safe for food gardens',
      description: 'Suitable for vegetables, herbs, and fruit when used according to label directions.',
      image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
      icon: Droplet,
      title: 'Clean formula',
      description: 'Zero synthetic fragrance, zero bright dyes, just powerful trace minerals.',
      image: 'https://images.pexels.com/photos/6231882/pexels-photo-6231882.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
      icon: Shield,
      title: 'Lab checked',
      description: 'Every batch tested for quality and screened for heavy metal safety.',
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
                  <benefit.icon className="w-6 h-6 text-white" />
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
