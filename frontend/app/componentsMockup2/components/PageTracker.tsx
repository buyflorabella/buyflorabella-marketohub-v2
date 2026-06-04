import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useAnalytics } from '@shopify/hydrogen';
import { useNonce } from '@shopify/hydrogen';

export default function PageTracker() {
  const location = useLocation();
  const { subscribe } = useAnalytics();
  const nonce = useNonce();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ---- Inject GA script dynamically once ----
    if (!document.getElementById('gtag-js')) {
      // GA library
      const script = document.createElement('script');
      script.id = 'gtag-js';
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MYFE3JJT6S';
      script.nonce = nonce;
      document.head.appendChild(script);

      // Inline initialization
      const inline = document.createElement('script');
      inline.nonce = nonce;
      inline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MYFE3JJT6S', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(inline);
    }

    // ---- Track page view for this route ----
    if (window.gtag) {
      window.gtag('config', 'G-MYFE3JJT6S', { page_path: location.pathname });
    }

    // ---- Hydrogen events subscription ----
    const unsubscribePage = subscribe('page_viewed', (data) => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: data.url,
          page_title: document.title,
        });
      }
    });

    const unsubscribeProduct = subscribe('product_viewed', (data) => {
      if (window.gtag) {
        window.gtag('event', 'view_item', {
          ecommerce: {
            items: data.products.map(p => ({
              item_id: p.id,
              item_name: p.title,
              price: p.price
            }))
          }
        });
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      if (typeof unsubscribePage === 'function') unsubscribePage();
      if (typeof unsubscribeProduct === 'function') unsubscribeProduct();
    };


  }, [location, subscribe, nonce]);

  return null;
}
