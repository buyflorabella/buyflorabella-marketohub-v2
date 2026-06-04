import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { articles as staticArticles, guides as staticGuides } from '../data/staticData';
import PageBackground from '../components/PageBackground';
import AnnouncementBar from '../components/AnnouncementBar';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  tags: string[];
  author_name: string;
  read_time: number;
  featured: boolean;
  published_at: string;
}

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const articles = staticArticles;
  const guides = staticGuides;

  const categories = ['all', 'Soil Education', 'Sustainability'];
  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  const filteredArticles = selectedCategory === 'all'
    ? regularArticles
    : regularArticles.filter(a => a.category === selectedCategory);

  return (
    <>
      <AnnouncementBar />
      <div className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124, 179, 66, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124, 179, 66, 0.08) 0%, transparent 50%)',
        }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
            <span className="text-[#7cb342] font-semibold text-sm tracking-wide">EDUCATION & INSIGHTS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 heading-font">
            Learn About Minerals
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Expert insights, research-backed articles, and practical guides to help you optimize your mineral nutrition
          </p>
        </div>

        {featuredArticle && (
          <Link
            to={`/learn/${featuredArticle.slug}`}
            className="block mb-16 bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden hover:border-[#7cb342] hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-[400px] md:h-auto overflow-hidden">
                <img
                  src={featuredArticle.featured_image}
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 bg-[#7cb342] text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                  Featured Article
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center bg-gray-50">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[#7cb342] text-sm font-semibold uppercase tracking-wide">
                    {featuredArticle.category}
                  </span>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{featuredArticle.read_time} min read</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#7cb342] transition-colors heading-font">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">By {featuredArticle.author_name}</span>
                  <ArrowRight className="w-5 h-5 text-[#7cb342] group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {guides.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 heading-font">Step-by-Step Guides</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/guides/${guide.slug}`}
                  className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 hover:border-[#7cb342] hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#7cb342]/20 flex items-center justify-center mb-4 group-hover:bg-[#7cb342]/30 transition-colors group-hover:scale-110 duration-300">
                    <BookOpen className="w-6 h-6 text-[#7cb342]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7cb342] transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{guide.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{guide.estimated_time}</span>
                    <span className="text-[#7cb342] font-semibold capitalize">{guide.difficulty_level}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 capitalize ${
                  selectedCategory === category
                    ? 'bg-[#7cb342] text-white shadow-xl shadow-[#7cb342]/30 scale-105'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              to={`/learn/${article.slug}`}
              className="bg-white rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-gray-200 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-semibold">{article.read_time} min</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[#7cb342] text-xs font-semibold uppercase tracking-wide">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold heading-font text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{article.author_name}</span>
                  <ArrowRight className="w-4 h-4 text-[#7cb342] group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No articles found in this category</p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
