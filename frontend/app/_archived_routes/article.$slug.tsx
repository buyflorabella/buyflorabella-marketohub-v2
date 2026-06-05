import { useLoaderData, Link, type LoaderFunctionArgs } from 'react-router';
import { useState, useEffect } from 'react';
import { Clock, ArrowLeft, Share2, Bookmark, User, Calendar } from 'lucide-react';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar';

interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface ArticleNode {
  id: string;
  title: string;
  handle: string;
  contentHtml: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  authorV2: { name: string } | null;
  image: ShopifyImage | null;
  blog: {
    handle: string;
    title: string;
  };
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { blogHandle, articleHandle } = params;
  const { storefront } = context;

  const { blog } = await storefront.query(ARTICLE_QUERY, {
    variables: {
      blogHandle: blogHandle || 'news',
      articleHandle: articleHandle || '',
    },
  });

  if (!blog?.articleByHandle) {
    throw new Response('Article Not Found', { status: 404 });
  }

  return { 
    article: blog.articleByHandle,
  };
}

const calculateReadTime = (html: string) => {
  const text = html.replace(/<[^>]*>?/gm, '');
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200) || 1;
};

export default function ArticlePage() {
  const { article } = useLoaderData<{ article: ArticleNode }>();
  const [tableOfContents, setTableOfContents] = useState<Array<{ id: string; title: string; level: number }>>([]);

  const isSaved = (id: string) => false; 
  const toggleSave = (item: any) => {};
  const flags = { bookmarkIcon: true };

  useEffect(() => {
    const contentElement = document.getElementById('article-content');
    if (contentElement) {
      const headings = Array.from(contentElement.querySelectorAll('h2, h3'));
      const toc = headings.map((heading, idx) => {
        const title = heading.textContent || '';
        const id = `heading-${idx}`;
        heading.setAttribute('id', id);
        heading.classList.add('scroll-mt-32');
        return {
          id,
          title,
          level: heading.tagName === 'H2' ? 2 : 3
        };
      });
      setTableOfContents(toc);
    }
  }, [article.contentHtml]);

  return (
    <>
      <AnnouncementBar />
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
                  {article.blog.title}
                </span>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadTime(article.contentHtml)} min read</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    {article.authorV2?.name || 'Staff Writer'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                  {flags.bookmarkIcon && (
                    <button
                      onClick={() => toggleSave(article)}
                      className={`p-2 border border-gray-200 rounded-lg transition-all ${
                        isSaved(article.id) ? 'bg-[#7cb342] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved(article.id) ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {article.image && (
              <div className="w-full h-[400px] md:h-[500px]">
                <img
                  src={article.image.url}
                  alt={article.image.altText || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <article className="space-y-8">
              {/* Main Content Area */}
              <div className="bg-white border border-gray-200 shadow-md rounded-3xl p-8 md:p-12">
                <div 
                  id="article-content"
                  className="prose prose-lg prose-slate max-w-none 
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-h2:text-3xl prose-h2:border-b prose-h2:pb-4 prose-h2:mt-12
                    prose-h3:text-2xl prose-h3:mt-8
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-li:text-gray-700
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-blockquote:border-l-4 prose-blockquote:border-[#7cb342] prose-blockquote:bg-[#7cb342]/5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl"
                  dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                />
              </div>

              {article.tags.length > 0 && (
                <div className="bg-white border border-gray-200 shadow-md rounded-3xl p-8">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700">
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
                          document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {heading.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

const ARTICLE_QUERY = `#graphql
  query GetArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        title
        contentHtml
        excerpt
        publishedAt
        tags
        authorV2 {
          name
        }
        image {
          url
          altText
        }
        blog {
          handle
          title
        }
      }
    }
  }
`;