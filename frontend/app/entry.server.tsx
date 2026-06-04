import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

const omniSend = [
  'https://omnisnippet.com',
  'https://*.omnisnippet.com',  
  'https://omnisnippet1.com',
  'https://*.omnisnippet1.com',
  'https://omnisend.com',
  'https://*.omnisend.com',
  'https://omnisendlink.com',       
  'https://*.omnisendlink.com',       
  'https://api.omnisend.com',
  'https://wt.soundestlink.com',    // ✅ Add this for legacy tracking
  'https://wt.omnisendlink.com',
  'https://forms.soundestlink.com',
  'https://forms.omnisend.com',     // REQUIRED: This is the iframe source
];

const googanalytics = [
  'https://google-analytics.com',
  'https://*.google-analytics.com',
  'https://analytics.google.com',
  'https://*.analytics.google.com',
  'https://googletagmanager.com',
  'https://*.googletagmanager.com',
]

const clarity = [
  'https://clarity.ms',
  'https://*.clarity.ms',
  'https://c.clarity.ms',
  'https://l.clarity.ms',
];

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      ...omniSend,
      ...googanalytics,
      ...clarity,
    ],
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    imgSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "data:",
      "blob:",
      "https://images.pexels.com",
      "https://i.vtimg.com",
      ...omniSend,      
      ...clarity,
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",                // Omnisend often injects inline styles
      "https://*.omnisnippet.com",      // Add this      
    ],
    connectSrc: [
      "'self'",
      // Analytics
      ...googanalytics,
      ...clarity,
      ...omniSend,
      // Our services
      //"https://survey-server.boardmansgame.com",
      //"https://email.boardmansgame.com",
      //"https://remail.buyflorabella.com",
      "https://*.buyflorabella.com",
      "https://*.boardmansgame.com",
      // Shopify telemetry (Hydrogen often needs this)
      'https://monorail-edge.shopifysvc.com', 
      // Websockets     
      // "wss://dev1-frontend.textreader.boardmansgame.com",
      // "wss://dev2-frontend.textreader.boardmansgame.com",
      // "wss://dev1-frontend.buyflorabella.com"
      "wss://*.buyflorabella.com",
      "wss://*.boardmansgame.com",
    ],
    frameSrc: [
      "'self'",
      ...omniSend,
      'https://*.youtube.com',
      // ... rest of your youtube entries ...
    ],
    childSrc: [
      "'self'",
      'https://www.youtube.com/embed/',
      'https://www.youtube-nocookie.com/',
      'https://*.youtube.com',
      'https://*.youtube-nocookie.com',
    ],
    mediaSrc: [
      "'self'", 
      'https://cdn.shopify.com/',
      'https://*.googleapis.com'
    ],
    fontSrc: [
      "'self'",
      'https://fonts.googleapis.com', // example if using Google Fonts
      'https://fonts.gstatic.com',
      'https://use.typekit.net',       
      // add any other font hosts here
    ],    
  });

  // DxB - moved {nonce} into here instead of <ServerRouter /> according to chatgpt suggestion
  const body = await renderToReadableStream(
    <NonceProvider >
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
