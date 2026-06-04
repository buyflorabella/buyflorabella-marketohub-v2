import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, ShoppingCart } from 'lucide-react';
import { products, articles } from '../data/staticData';
import { useCart } from '../contexts/CartContext';

interface SearchDropdownProps {
  searchQuery: string;
  onClose: () => void;
}

export default function SearchDropdown({ searchQuery, onClose }: SearchDropdownProps) {
  const query = searchQuery.toLowerCase().trim();
  const { addItem } = useCart();

  if (!query) {
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image_url,
    });
  };

  const matchedProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    )
    .slice(0, 3);

  const matchedArticles = articles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
    )
    .slice(0, 3);

  const hasResults = matchedProducts.length > 0 || matchedArticles.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/20 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
      <div className="p-4">
        <div className="text-white/60 text-sm mb-4">
          Search results for "{searchQuery}"
        </div>

        {!hasResults && (
          <div className="text-white/40 text-sm py-4">
            No results found. Try different keywords.
          </div>
        )}

        {matchedProducts.length > 0 && (
          <div className="mb-6">
            <div className="text-[#7cb342] text-sm font-semibold mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Products ({matchedProducts.length})
            </div>
            <div className="space-y-2">
              {matchedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-start gap-3 flex-1 min-w-0"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium group-hover:text-[#7cb342] transition-colors">
                        {product.name}
                      </div>
                      <div className="text-white/60 text-sm truncate">
                        {product.description}
                      </div>
                      <div className="text-[#7cb342] text-sm font-semibold mt-1">
                        ${product.price}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex-shrink-0 p-2 bg-[#7cb342] hover:bg-[#8bc34a] rounded-lg transition-all duration-300 hover:scale-105"
                    title="Add to cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {matchedArticles.length > 0 && (
          <div>
            <div className="text-[#7cb342] text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Articles ({matchedArticles.length})
            </div>
            <div className="space-y-2">
              {matchedArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/learn/${article.slug}`}
                  onClick={onClose}
                  className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#7cb342]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#7cb342]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium group-hover:text-[#7cb342] transition-colors line-clamp-1">
                      {article.title}
                    </div>
                    <div className="text-white/60 text-sm line-clamp-2">
                      {article.excerpt}
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      {article.read_time} min read
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
