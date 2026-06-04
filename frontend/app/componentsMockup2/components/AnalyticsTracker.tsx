import { useEffect } from 'react';
import { useLocation } from 'react-router';

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-MYFE3JJT6S', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
}
