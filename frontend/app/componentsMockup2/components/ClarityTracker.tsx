import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useNonce } from '@shopify/hydrogen';

export default function ClarityTracker() {
  const location = useLocation();
  const nonce = useNonce();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inject only once
    if (!document.getElementById('clarity-js')) {
      const script = document.createElement('script');
      script.id = 'clarity-js';
      script.nonce = nonce;
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "v5m5vwm2b4");
      `;
      document.head.appendChild(script);
    }

    if (window.clarity) {
      window.clarity('set', 'page', location.pathname);
    }
  }, [location, nonce]);

  return null;
}
