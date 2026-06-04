import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface FeatureFlags {
  bookmarkIcon: boolean;
  abandonedCartPopup: boolean;
  abandonedCartTrigger: 'exit' | 'tab-switch';
  discountDisplay: boolean;
  wishlistIcon: boolean;
  whatsappWidget: boolean;
  surveyPopup: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  updateFlag: (key: keyof FeatureFlags, value: boolean | string) => void;
  resetFlags: () => void;
}

const defaultFlags: FeatureFlags = {
  bookmarkIcon: true,
  abandonedCartPopup: false,
  abandonedCartTrigger: 'exit',
  discountDisplay: true,
  wishlistIcon: true,
  whatsappWidget: false,
  surveyPopup: false,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({
    children, 
    envOverrides 
  }: { 
    children: ReactNode,
    envOverrides?: Partial<FeatureFlags>; // overrides from .env
  }) {
  
  const [isHydrated, setIsHydrated] = useState(false);

  const baseFlags = {
    ...defaultFlags,
    ...envOverrides, // Env overrides win over defaults
  };

  const [flags, setFlags] = useState<FeatureFlags>(baseFlags);

  // Example: administrative override (can come from env, query, or global variable)
  // const adminOverride: Partial<FeatureFlags> = {
  //   whatsappWidget: true, // force it on
  //   // other flags can also be overridden here
  // };  

  useEffect(() => {
    const saved: string | null = localStorage.getItem('featureFlags');
    if (saved) {
      try {
        const savedFlags = JSON.parse(saved) as FeatureFlags; // ✅ define savedFlags here        
        
        // PRIORITY ORDER (highest to lowest):
        // 1. localStorage (admin/user manually set)
        // 2. envOverrides (from .env)
        // 3. defaultFlags (hardcoded)
        setFlags({
          ...defaultFlags,      // Start with defaults
          ...envOverrides,      // Apply env overrides
          ...savedFlags,        // Apply localStorage (WINS)
        });
      } catch (e) {
        setFlags(baseFlags);
      }
    }
    setIsHydrated(true);
  }, [envOverrides]);

  // save to localstorage whenever flags change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('featureFlags', JSON.stringify(flags));
      //console.log("[FeatureFlags] Saved to localStorage:", flags);
    }
  }, [flags, isHydrated]);

  const updateFlag = (key: keyof FeatureFlags, value: boolean | string) => {
    setFlags(prev => ({ 
      ...prev, 
      [key]: value 
    }));
  };

  const resetFlags = () => {
    // Reset to env overrides if available, otherwise defaults
    const resetTo = {
      ...defaultFlags,
      ...envOverrides,
    };
    setFlags(resetTo);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('featureFlags');
    }
    //console.log("[FeatureFlags] Reset to env overrides + defaults:", resetTo);
  };

  //console.log("[FeatureFlags] Active flags:", flags);
  //console.log("[FeatureFlags] Env overrides:", envOverrides);

  return (
    <FeatureFlagsContext.Provider value={{ flags, updateFlag, resetFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}