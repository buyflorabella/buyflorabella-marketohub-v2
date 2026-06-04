import { type ActionFunctionArgs } from "react-router";

export async function loader() {
  return new Response(null, { status: 404 });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const origin = url.origin; // e.g., https://buyflorabella.com
  
  return context.customerAccount.logout({
    postLogoutRedirectUri: `${origin}/account/login`
  });
}