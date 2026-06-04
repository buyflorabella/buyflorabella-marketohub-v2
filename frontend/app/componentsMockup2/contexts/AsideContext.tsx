import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type AsideType = 'cart' | 'mobile-menu' | 'search' | null;

interface AsideContextValue {
  aside: AsideType;
  openAside: (type: AsideType) => void;
  closeAside: () => void;
  toggleAside: (type: AsideType) => void;
}

const AsideContext = createContext<AsideContextValue | null>(null);

export function AsideProvider({ children }: { children: ReactNode }) {
  const [aside, setAside] = useState<AsideType>(null);

  const openAside = useCallback((type: AsideType) => {
    setAside(type);
    document.body.style.overflow = 'hidden'; // prevent scroll
  }, []);

  const closeAside = useCallback(() => {
    setAside(null);
    document.body.style.overflow = '';
  }, []);

  const toggleAside = useCallback(
    (type: AsideType) => {
      setAside((current) => {
        const next = current === type ? null : type;
        document.body.style.overflow = next ? 'hidden' : '';
        return next;
      });
    },
    []
  );

  return (
    <AsideContext.Provider
      value={{ aside, openAside, closeAside, toggleAside }}
    >
      {children}
    </AsideContext.Provider>
  );
}

export function useAside() {
  const ctx = useContext(AsideContext);

  if (!ctx) {
    throw new Error('useAside must be used within an AsideProvider');
  }

  return ctx;
}

/**
 * Safe version of useAside that returns null if not within AsideProvider.
 * Use this when the component might render outside the provider.
 */
export function useAsideSafe() {
  return useContext(AsideContext);
}
