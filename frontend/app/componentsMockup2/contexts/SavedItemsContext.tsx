import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface SavedItem {
  id: string;
  type: 'article' | 'product';
  title: string;
  url: string;
  image?: string;
  savedAt: string;
}

interface SavedItemsContextType {
  savedItems: SavedItem[];
  isSaved: (id: string) => boolean;
  toggleSave: (item: Omit<SavedItem, 'savedAt'>) => void;
  removeSaved: (id: string) => void;
  clearAll: () => void;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedItems');
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved) as SavedItem[]);
      } catch (e) {
        console.error("Failed to parse savedItems from localStorage:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('savedItems', JSON.stringify(savedItems));
    }
  }, [savedItems, isHydrated]);

  const isSaved = (id: string) => {
    return savedItems.some(item => item.id === id);
  };

  const toggleSave = (item: Omit<SavedItem, 'savedAt'>) => {
    setSavedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, { ...item, savedAt: new Date().toISOString() }];
      }
    });
  };

  const removeSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setSavedItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('savedItems');
    }
  };

  return (
    <SavedItemsContext.Provider value={{ savedItems, isSaved, toggleSave, removeSaved, clearAll }}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error('useSavedItems must be used within SavedItemsProvider');
  }
  return context;
}