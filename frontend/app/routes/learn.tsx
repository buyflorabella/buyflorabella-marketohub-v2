import { type LoaderFunctionArgs, useLoaderData, Link } from 'react-router';
import { useState } from 'react';
import { useEffect } from 'react';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface AuthorV2 {
  name: string;
}

interface ArticleNode {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  content: string;
  tags: string[];
  publishedAt: string;
  authorV2: AuthorV2 | null;
  image: ShopifyImage | null;
}

interface ArticlesConnection {
  nodes: ArticleNode[];
}

interface BlogNode {
  title: string;
  handle: string;
  articles: ArticlesConnection;
}

export interface GetAllBlogsQuery {
  blogs: {
    nodes: BlogNode[];
  };
}

export interface FlattenedArticle extends ArticleNode {
  blogHandle: string;
  blogTitle: string;
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;

  const { blogs }: GetAllBlogsQuery = await storefront.query(ALL_BLOGS_QUERY, {
    variables: {
      firstBlogs: 10,
      firstArticles: 12,
    },
  });

  return { blogs: blogs.nodes };
}

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content ? content.split(/\s+/).length : 0;
  return Math.ceil(words / wordsPerMinute) || 1;
};

// DxB Developer debugging
function summarizeArticle(article: FlattenedArticle) {
  return {
    id: article.id,
    title: article.title,
    handle: article.handle,
    blog: {
      title: article.blogTitle,
      handle: article.blogHandle,
    },
    author: article.authorV2?.name ?? '(unknown)',
    publishedAt: article.publishedAt,
    readTimeMin: calculateReadTime(article.content),
    excerpt: article.excerpt || article.content.substring(0, 120) + '…',
    tags: article.tags,
    image: article.image
      ? {
          url: article.image.url,
          altText: article.image.altText,
        }
      : null,
  };
}

export default function LearnPage() {
  const { blogs } = useLoaderData<typeof loader>();
  const [selectedHandle, setSelectedHandle] = useState<string>('all');

  // Flatten all articles into a single array for the "All" view
  const allArticles = blogs.flatMap((blog) =>
    blog.articles.nodes.map((article) => ({
      ...article,
      blogHandle: blog.handle,
      blogTitle: blog.title,
    }))
  );

  const featuredArticle = allArticles.find((a) =>
    a.tags?.some((tag) => tag.toLowerCase() === 'featured')
  ) || allArticles[0];

  // Filter articles for the grid based on the selector
  const regularArticles = allArticles.filter((a) => a.id !== featuredArticle?.id);
  const filteredArticles = selectedHandle === 'all'
    ? regularArticles
    : regularArticles.filter((a) => a.blogHandle === selectedHandle);

  //console.info(blogs);

  // DxB Developer debugging
  // useEffect(() => {
  //   console.group('📘 BLOGS');
  //   blogs.forEach((blog) => {
  //     console.log(`Blog: ${blog.title} (${blog.handle})`);
  //     console.log(`Articles: ${blog.articles.nodes.length}`);
  //   });
  //   console.groupEnd();

  //   if (featuredArticle) {
  //     console.group('⭐ FEATURED ARTICLE');
  //     console.table(summarizeArticle(featuredArticle));
  //     console.groupEnd();
  //   }

  //   console.group('📰 FILTERED ARTICLES');
  //   filteredArticles.forEach((article, index) => {
  //     console.group(`Article ${index + 1}`);
  //     console.table(summarizeArticle(article));
  //     console.groupEnd();
  //   });
  //   console.groupEnd();
  // }, [blogs, featuredArticle, filteredArticles]);

  const SHOW_GUIDES_IN_BLOG_LISTINGS = false; // 🔹 set to false in production

  return (
    <>
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
              to={`/article/${featuredArticle.blogHandle}/${featuredArticle.handle}`}
              className="block mb-16 bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden hover:border-[#7cb342] hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group hover:no-underline"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative h-[400px] md:h-auto overflow-hidden">
                  {featuredArticle.image && (
                    <img
                      src={featuredArticle.image.url}
                      alt={featuredArticle.image.altText || featuredArticle.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute top-6 left-6 bg-[#7cb342] text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                    Featured Article
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center bg-gray-50">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[#7cb342] text-sm font-semibold uppercase tracking-wide">
                      {featuredArticle.blogTitle}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{calculateReadTime(featuredArticle.content)} min read</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#7cb342] transition-colors heading-font">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt || featuredArticle.content.substring(0, 160)}...
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">By {featuredArticle.authorV2?.name}</span>
                    <ArrowRight className="w-5 h-5 text-[#7cb342] group-hover:translate-x-2 transition-transform" />
                  </div>
                        {featuredArticle.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {featuredArticle.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full transition-colors duration-200 hover:bg-yellow-100 hover:text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                </div>
              </div>
            </Link>
          )}

          {/* Step-by-Step Guides Section */}
          {allArticles.some(a => a.blogTitle.toLowerCase() === 'guides') && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 heading-font">Step-by-Step Guides</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {(() => {
                  const guides = allArticles.filter(a => a.blogTitle.toLowerCase() === 'guides');

                  // Dumb ordering: featured1 first, featured2 second, featured3 third
                  const pinnedOrder = ['featured1', 'featured2', 'featured3'];

                  // Map guides to "order" number based on tags
                  const guidesWithOrder = guides.map(g => {
                    const pinIndex = pinnedOrder.findIndex(f => g.tags?.includes(f));
                    return { ...g, pinIndex: pinIndex >= 0 ? pinIndex : 999 }; // 999 = unpinned
                  });

                  // Sort by pinIndex so feature1 comes first, unpinned last
                  guidesWithOrder.sort((a, b) => a.pinIndex - b.pinIndex);

                  // Limit to 3
                  const topGuides = guidesWithOrder.slice(0, 3);

                  return topGuides.map((guide) => (
                    <Link
                      key={guide.id}
                      to={`/article/${guide.blogHandle}/${guide.handle}`}
                      className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 hover:border-[#7cb342] hover:shadow-lg transition-all duration-300 hover:scale-105 group no-underline hover:no-underline"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#7cb342]/20 flex items-center justify-center mb-4 group-hover:bg-[#7cb342]/30 transition-colors group-hover:scale-110 duration-300">
                        <BookOpen className="w-6 h-6 text-[#7cb342]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7cb342] transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {guide.excerpt || guide.content.substring(0, 120) + '…'}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{calculateReadTime(guide.content)} min read</span>
                      </div>
                      <div className="hidden">
                      {guide.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {guide.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full transition-colors duration-200 hover:bg-yellow-100 hover:text-gray-800 group-hover:no-underline"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      </div>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedHandle('all')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  selectedHandle === 'all'
                    ? 'bg-[#7cb342] text-white shadow-xl shadow-[#7cb342]/30 scale-105'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {blogs
                .slice() // ✅ create a copy so we don't mutate original
                .sort((a, b) => a.title.localeCompare(b.title)) // ✅ sort and alphebetize
                .filter(blog => SHOW_GUIDES_IN_BLOG_LISTINGS || blog.title.toLowerCase() !== 'guides') // 🔹 filter out guides if SHOW_GUIDES_IN_BLOG_LISTINGS = false
                .map((blog) => {
                    const isDevBlog = blog.title.toLowerCase() === 'guides'; // ✅ flag
                    return (
                      <button
                        key={blog.handle}
                        onClick={() => setSelectedHandle(blog.handle)}
                        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 capitalize ${
                          selectedHandle === blog.handle
                            ? 'bg-[#7cb342] text-white shadow-xl shadow-[#7cb342]/30 scale-105'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {blog.title}
                      </button>
                    );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles
              .filter(article => SHOW_GUIDES_IN_BLOG_LISTINGS || article.blogTitle.toLowerCase() !== 'guides') // 🔹 filter guides if flag false            
              .map((article) => {
              return (
                <Link
                  key={article.id}
                  to={`/article/${article.blogHandle}/${article.handle}`}
                  className="bg-white rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-gray-200 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer no-underline hover:no-underline" // ✅ added no-underline utilities
                >
                  <div className="relative h-48 overflow-hidden">
                    {article.image && (
                      <img
                        src={article.image.url}
                        alt={article.image.altText || article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-semibold">{calculateReadTime(article.content)} min</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-[#7cb342] text-xs font-semibold uppercase tracking-wide group-hover:no-underline"> {/* ✅ added group-hover:no-underline */}
                      {article.blogTitle}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:no-underline"> {/* ✅ added group-hover:no-underline */}
                      {article.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-4 line-clamp-3 group-hover:no-underline"> {/* ✅ added group-hover:no-underline */}
                      {article.excerpt || article.content.substring(0, 120)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 group-hover:no-underline"> {/* ✅ added group-hover:no-underline */}
                        {article.authorV2?.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#7cb342] group-hover:translate-x-2 transition-transform" />
                    </div>
                    {article.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full transition-colors duration-200 hover:bg-yellow-100 hover:text-gray-800 group-hover:no-underline" // ✅ added group-hover:no-underline
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">No articles found for this blog</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const ALL_BLOGS_QUERY = `#graphql
  query GetAllBlogs($firstBlogs: Int!, $firstArticles: Int!) {
    blogs(first: $firstBlogs) {
      nodes {
        title
        handle
        articles(first: $firstArticles, sortKey: PUBLISHED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            excerpt
            content
            tags
            publishedAt
            authorV2 {
              name
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;