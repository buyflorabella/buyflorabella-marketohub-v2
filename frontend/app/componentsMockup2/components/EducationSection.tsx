import { BookOpen, Sprout, Bug, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EducationSection() {
  const guides = [
    {
      icon: Sprout,
      image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=600',
      title: 'More Than NPK: Why Soil Systems Matter for the Future of Food',
      description: 'Traditional fertilizers focus on NPK. Flora Bella focuses on the soil system that makes NPK work better—trace minerals, humic + fulvic acids, and biology from the ground up.',
      readTime: '7 min read',
      slug: 'soil-education/more-than-npk-why-soil-systems-matter-for-the-future-of-food',
    },
    {
      icon: Bug,
      image: 'https://images.pexels.com/photos/4751285/pexels-photo-4751285.jpeg?auto=compress&cs=tinysrgb&w=600',
      title: 'Soil as a Resource Strategy: Building Resilience in a Resource-Constrained World',
      description: 'In a world of volatile inputs and strained resources, soil health is a resilience strategy. Learn how soil systems improve efficiency, stability, and long-term performance.',
      readTime: '8 min read',
      slug: 'sustainability/soil-as-a-resource-strategy',
    },
    {
      icon: BookOpen,
      image: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=600',
      title: 'What Is the Soil Food Web (and Why It Changes Everything)?',
      description: 'The Soil Food Web is the living system beneath your plants. Learn how soil biology influences nutrient availability, root health, and long-term resilience.',
      readTime: '9 min read',
      slug: 'soil-education/what-is-the-soil-food-web',
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
            <Link
              key={index}
              to={`/article/${guide.slug}`}
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
                <span className="flex items-center gap-2 text-[#d4ff00] font-semibold group-hover:gap-4 transition-all">
                  Read guide
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
