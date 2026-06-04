import { BookOpen, Sprout, Bug, ArrowRight } from 'lucide-react';

export default function EducationSection() {
  const guides = [
    {
      icon: Sprout,
      image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=600',
      title: 'Soil biology made simple for home growers',
      description: 'Understanding the living ecosystem beneath your plants and how trace minerals support it.',
      readTime: '5 min read',
    },
    {
      icon: Bug,
      image: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=600',
      title: 'How to fix tired raised beds without starting over',
      description: 'Revitalize depleted soil with simple additions that rebuild biological activity.',
      readTime: '7 min read',
    },
    {
      icon: BookOpen,
      image: 'https://images.pexels.com/photos/4751285/pexels-photo-4751285.jpeg?auto=compress&cs=tinysrgb&w=600',
      title: 'Why trace minerals matter even when you already fertilize',
      description: 'Learn how micronutrients unlock the full potential of your existing feeding routine.',
      readTime: '6 min read',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white/5 to-transparent py-20" id="learn">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
            Learn To Treat Soil As A Living System
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Expert knowledge made accessible for gardeners at every level
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="glass-strong rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full">
                  <guide.icon className="w-6 h-6 text-[#d4ff00]" />
                </div>
              </div>
              <div className="p-8">
                <p className="text-sm text-[#90ffd9] font-semibold mb-3">{guide.readTime}</p>
                <h3 className="text-xl font-bold heading-font text-white mb-3 leading-snug">
                  {guide.title}
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">{guide.description}</p>
                <button className="flex items-center gap-2 text-[#d4ff00] font-semibold group-hover:gap-4 transition-all">
                  Read guide
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
