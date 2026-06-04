import {redirect} from 'react-router';
import type {Route} from './+types/account_.login';

export async function loader({request, context}: Route.LoaderArgs) {
  //console.log("DxB - login loader ------------> checking auth");
  
  // handleAuthStatus() checks if we're in an OAuth callback
  // If already logged in, it redirects to /account
  // If not logged in and not a callback, it returns null
  const authStatus = await context.customerAccount.handleAuthStatus();
  
  if (authStatus) {
    return authStatus; // User is logged in, redirect them
  }
  
  // Not logged in and not a callback - initiate Shopify login immediately
  //console.log("DxB - login loader ------------> redirecting to Shopify OAuth");
  const url = new URL(request.url);
  
  return context.customerAccount.login({
    countryCode: context.storefront.i18n.country,
    return_to: `${url.origin}/account`,
  });
}