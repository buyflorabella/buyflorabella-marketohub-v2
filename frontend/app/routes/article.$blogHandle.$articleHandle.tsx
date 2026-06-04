import { useLoaderData, Link, type LoaderFunctionArgs } from 'react-router';
import { useState, useEffect } from 'react';
import { Clock, ArrowLeft, Share2, Bookmark, User, Calendar } from 'lucide-react';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar';
import { useSavedItems } from '../componentsMockup2/contexts/SavedItemsContext';
import { useFeatureFlags } from '../componentsMockup2/contexts/FeatureFlagsContext';
import Toast from '../componentsMockup2/components/Toast';

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

  if (!blogHandle || !articleHandle) {
    throw new Response('Missing blog or article handle', { status: 400 });
  }

  const { blog } = await storefront.query(ARTICLE_QUERY, {
    variables: {
      blogHandle,
      articleHandle,
    },
  });

  if (!blog?.articleByHandle) {
    console.error(`Article not found for blog: ${blogHandle}, article: ${articleHandle}`);
    throw new Response('Article Not Found', { status: 404 });
  }

  return { article: blog.articleByHandle };
}

const calculateReadTime = (html: string) => {
  const text = html.replace(/<[^>]*>?/gm, '');
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200) || 1;
};

export default function ArticlePage() {
  const { article } = useLoaderData<{ article: ArticleNode }>();
  const [tableOfContents, setTableOfContents] = useState<
    Array<{ id: string; title: string; level: number }>
  >([]);
  const { isSaved, toggleSave } = useSavedItems();
  const { flags } = useFeatureFlags();
  const [activeId, setActiveId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!article.contentHtml) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(article.contentHtml, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4'));

    const toc = headings.map((heading, index) => {
      const title = heading.textContent || '';
      const id = heading.id || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `heading-${index}`;
      
      heading.id = id;

      return {
        id,
        title,
        level: parseInt(heading.tagName.replace('H', ''), 10),
      };
    });

    setTableOfContents(toc);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%', threshold: 1.0 }
    );

    const contentElement = document.getElementById('article-content');
    if (contentElement) {
      const contentHeadings = contentElement.querySelectorAll('h2, h3');
      contentHeadings.forEach((h, i) => {
        if (!h.id && toc[i]) h.id = toc[i].id;
        observer.observe(h);
      });
    }

    return () => observer.disconnect();
  }, [article.contentHtml]);

  return (
    <>
      {/* Toast */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)}
          type="success"
        />
      )}
      <div className="bg-gray-50 pt-52">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link to="/learn" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7cb342] mt-8 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>
          
          <div className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden mb-8">
            {article.image && (
              <div className="w-full h-[400px] md:h-[500px]">
                  <img src={article.image.url} className="w-full h-full object-cover" alt={article.title} />
              </div>
            )}            
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <User className="w-4 h-4" />
                    {article.authorV2?.name || 'Staff'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: article.title,
                          text: article.excerpt,
                          url: window.location.href,
                        });
                      } else {
                        // Fallback: Copy link to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                  >
                  <Share2 className="w-5 h-5 text-gray-700" />
                    
                  </button>
                  {flags.bookmarkIcon && (
                    <button
                      onClick={() => {
                        // Try browser bookmark first
                        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                        const shortcut = isMac ? '⌘+D' : 'Ctrl+D';
                        
                        if (window.sidebar?.addPanel) {
                          // Firefox (legacy)
                          window.sidebar.addPanel(article.title, window.location.href, '');
                        } else if ((window.external as any)?.AddFavorite) {
                          // IE (legacy)
                          (window.external as any).AddFavorite(window.location.href, article.title);
                        } else {
                          // Modern browsers: Save to app instead + show browser shortcut
                          article && toggleSave({
                            id: article.id,
                            type: 'article',
                            title: article.title,
                            url: `/learn/${article.handle}`,
                            image: article?.image?.url,
                          });
                          
                          // Optional: Show both actions
                          const message = isSaved(article?.id || '') 
                            ? 'Removed from saved articles' 
                            : `Saved! Tip: Press ${shortcut} to bookmark in your browser`;
                          
                          // You can replace alert with a toast notification if you have one
                          //alert(message);
                          setToastMessage(message);
                        }
                      }}
                      className={`p-2 border border-gray-200 rounded-lg transition-all ${
                        isSaved(article?.id || '') ? 'bg-[#7cb342] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={isSaved(article?.id || '') ? 'Remove from saved articles' : 'Save article (or press Ctrl+D to bookmark)'}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved(article?.id || '') ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex w-full min-h-screen rounded-lg overflow-hidden">
                <div className="w-full md:w-2/3 p-6 ps-0 flex flex-col justify-start bg-white">
                  <div
                    dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                    className="prose prose-lg max-w-none w-full text-gray-700"
                  />
                </div>

                <div className="hidden md:flex md:w-1/3 flex-col items-stretch border-l">
                  <div className="sticky top-8 bg-white border border-gray-200 shadow-md rounded-2xl p-6 w-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Table of Contents
                    </h3>
                    <nav className="space-y-3">
                      {tableOfContents.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block py-2 transition-all duration-200 border-l-2 ${
                            item.level === 3 ? 'ml-4 text-xs' : 'text-sm font-medium'
                          } ${
                            activeId === item.id 
                              ? 'border-[#7cb342] text-[#7cb342] bg-[#7cb342]/5 pl-3' 
                              : 'border-transparent text-gray-500 hover:text-gray-900 pl-3'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({
                              behavior: 'smooth'
                            });
                          }}
                        >
                          {item.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
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
        authorV2 { name }
        image { url, altText }
        blog { handle, title }
      }
    }
  }
`;