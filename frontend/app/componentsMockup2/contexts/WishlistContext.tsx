import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  addedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved) as WishlistItem[]);
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isHydrated]);

  const isInWishlist = (id: string) => {
    return wishlist.some(item => item.id === id);
  };

  const toggleWishlist = (item: Omit<WishlistItem, 'addedAt'>) => {
    setWishlist(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, { ...item, addedAt: new Date().toISOString() }];
      }
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const clearWishlist = () => {
    setWishlist([]);
    // Ensure we are in the browser before calling localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wishlist');
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      isInWishlist, 
      toggleWishlist, 
      removeFromWishlist, 
      clearWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}