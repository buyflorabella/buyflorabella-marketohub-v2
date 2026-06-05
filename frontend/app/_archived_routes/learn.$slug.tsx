import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft, Share2, Bookmark, User, Calendar } from 'lucide-react';
import { articles as staticArticles, products } from '../componentsMockup2/data/staticData';
import { useState, useEffect } from 'react';
import { useSavedItems } from '../componentsMockup2/contexts/SavedItemsContext';
import { useFeatureFlags } from '../componentsMockup2/contexts/FeatureFlagsContext';

const renderContentBlock = (block: string, idx: number, tocIndex: number) => {
  if (block.startsWith('[VIDEO:') && block.endsWith(']')) {
    const videoUrl = block.replace('[VIDEO:', '').replace(']', '').trim();
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isVimeo = videoUrl.includes('vimeo.com');

    let embedUrl = videoUrl;
    if (isYouTube) {
      const videoId = videoUrl.includes('youtu.be')
        ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
        : videoUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (isVimeo) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return (
      <div key={idx} className="my-8 bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        <div className="relative pb-[56.25%]">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (block.startsWith('> ')) {
    return (
      <blockquote key={idx} className="my-8 pl-6 border-l-4 border-[#7cb342] bg-gradient-to-r from-[#7cb342]/5 to-transparent py-4 pr-6 rounded-r-2xl">
        <p className="text-gray-700 text-xl italic leading-relaxed">
          {block.replace('> ', '')}
        </p>
      </blockquote>
    );
  }

  if (block.startsWith('### ')) {
    const title = block.replace('### ', '');
    const id = `heading-${idx}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    return (
      <h3 key={idx} id={id} className="text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-3 scroll-mt-32">
        <span className="w-1 h-8 bg-[#7cb342] rounded-full"></span>
        {title}
      </h3>
    );
  }

  if (block.startsWith('## ')) {
    const title = block.replace('## ', '');
    const id = `heading-${idx}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    return (
      <h2 key={idx} id={id} className="text-3xl md:text-4xl font-bold text-gray-900 mt-12 mb-6 pb-4 border-b-2 border-gray-200 scroll-mt-32">
        {title}
      </h2>
    );
  }

  if (block.startsWith('# ')) {
    return (
      <h1 key={idx} className="text-4xl md:text-5xl font-bold text-gray-900 mt-12 mb-6">
        {block.replace('# ', '')}
      </h1>
    );
  }

  if (block.startsWith('- ') || block.startsWith('* ')) {
    const items = block.split('\n').filter(line => line.startsWith('- ') || line.startsWith('* '));
    return (
      <ul key={idx} className="my-6 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700 text-lg leading-relaxed">
            <span className="w-2 h-2 bg-[#7cb342] rounded-full mt-2 flex-shrink-0"></span>
            <span>{item.replace(/^[*-] /, '')}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.startsWith('[IMAGE:') && block.endsWith(']')) {
    const imageParts = block.replace('[IMAGE:', '').replace(']', '').split('|');
    const imageUrl = imageParts[0].trim();
    const caption = imageParts[1]?.trim();

    return (
      <figure key={idx} className="my-8">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          <img src={imageUrl} alt={caption || ''} className="w-full h-auto" />
        </div>
        {caption && (
          <figcaption className="mt-3 text-center text-gray-600 italic text-sm">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.trim().length === 0) {
    return null;
  }

  return (
    <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-6">
      {block}
    </p>
  );
};

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  author_name: string;
  author_image: string;
  read_time: number;
  published_at: string;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [tableOfContents, setTableOfContents] = useState<Array<{ id: string; title: string; level: number }>>([]);
  const { isSaved, toggleSave } = useSavedItems();
  const { flags } = useFeatureFlags();

  const article = staticArticles.find(a => a.slug === slug) || null;
  const relatedArticles = article
    ? staticArticles.filter(a => a.id !== article.id && a.category === article.category).slice(0, 2)
    : [];
  const relatedProducts = products.filter(p => p.featured).slice(0, 2);

  useEffect(() => {
    if (article) {
      const headings: Array<{ id: string; title: string; level: number }> = [];
      const lines = article.content.split('\n');

      lines.forEach((line, idx) => {
        if (line.startsWith('## ')) {
          const title = line.replace('## ', '');
          const id = `heading-${idx}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
          headings.push({ id, title, level: 2 });
        } else if (line.startsWith('### ')) {
          const title = line.replace('### ', '');
          const id = `heading-${idx}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
          headings.push({ id, title, level: 3 });
        }
      });

      setTableOfContents(headings);
    }
  }, [article]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl text-gray-900 mb-4">Article not found</h1>
            <Link to="/learn" className="text-[#7cb342] hover:underline font-semibold">
              Return to articles
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124, 179, 66, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124, 179, 66, 0.08) 0%, transparent 50%)',
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7cb342] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>

          <div className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden mb-8">
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[#7cb342] text-sm font-semibold uppercase tracking-wide">
                  {article.category}
                </span>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{article.read_time} min read</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-4">
                <img
                  src={article.author_image}
                  alt={article.author_name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <User className="w-4 h-4" />
                    {article.author_name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                  {flags.bookmarkIcon && (
                    <button
                      onClick={() => article && toggleSave({
                        id: article.id,
                        type: 'article',
                        title: article.title,
                        url: `/learn/${article.slug}`,
                        image: article.featured_image,
                      })}
                      className={`p-2 border border-gray-200 rounded-lg transition-all ${
                        isSaved(article?.id || '') ? 'bg-[#7cb342] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={isSaved(article?.id || '') ? 'Remove from saved' : 'Save article'}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved(article?.id || '') ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full h-[400px] md:h-[500px]">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <article className="space-y-4">
              {article.content.split('\n\n').map((block, idx) => {
                const renderedBlock = renderContentBlock(block, idx, 0);

                if (block.startsWith('[VIDEO:') || block.startsWith('[IMAGE:') || block.startsWith('> ')) {
                  return renderedBlock;
                }

                if (renderedBlock) {
                  return (
                    <div key={idx} className="bg-white border border-gray-200 shadow-md rounded-3xl p-8 md:p-12">
                      {renderedBlock}
                    </div>
                  );
                }

                return null;
              })}

              {article.tags && article.tags.length > 0 && (
                <div className="bg-white border border-gray-200 shadow-md rounded-3xl p-8">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="space-y-6">
              {tableOfContents.length > 0 && (
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 sticky top-32">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm hover:text-[#7cb342] transition-colors ${
                          heading.level === 3 ? 'pl-4 text-gray-600' : 'text-gray-700 font-semibold'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(heading.id);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        {heading.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {relatedProducts.length > 0 && (
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Products</h3>
                  <div className="space-y-4">
                    {relatedProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#7cb342] transition-colors line-clamp-2 mb-1">
                              {product.name}
                            </h4>
                            <p className="text-[#7cb342] font-semibold">${product.price}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/learn/${related.slug}`}
                        className="block group"
                      >
                        <div className="relative h-24 mb-2 rounded-lg overflow-hidden">
                          <img
                            src={related.featured_image}
                            alt={related.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#7cb342] transition-colors line-clamp-2 mb-1">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{related.read_time} min read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
