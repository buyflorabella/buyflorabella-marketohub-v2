import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router';
import {useAsideSafe} from '~/componentsMockup2/contexts/AsideContext';

/**
 * Handles cart_return query param from checkout return flow.
 * Opens the cart tray automatically when user returns from checkout.
 * Safe to use outside AsideProvider - will silently skip if not available.
 */
export function CartReturnHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const asideContext = useAsideSafe();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('cart_return') === 'true' && asideContext?.openAside) {
      // Open cart tray
      asideContext.openAside('cart');

      // Clean up URL by removing the cart_return param
      params.delete('cart_return');
      const newSearch = params.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');

      // Replace URL without cart_return param (no history entry)
      navigate(newUrl, {replace: true});
    }
  }, [location.search, location.pathname, navigate, asideContext]);

  return null;
}
