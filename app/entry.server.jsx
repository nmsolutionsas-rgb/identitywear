import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { createContentSecurityPolicy } from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shop.app',
      'https://*.supabase.co',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://*.gstatic.com',
      'https://*.hostingersite.com',
      'https://*.hostinger.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.shopify.com',
      'https://shop.app',
      'https://*.google.com',
      'https://*.gstatic.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://shop.app',
      'https://horizons-cdn.hostinger.com',
      'https://i.ibb.co',
      'https://*.supabase.co',
      'https://cdn.zyrosite.com',
      'https://*.hostingersite.com',
      'https://*.hostinger.com',
      'https://images.unsplash.com',
    ],
    mediaSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://*.hostingersite.com',
      'https://*.hostinger.com',
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://fonts.googleapis.com',
    ],
    connectSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shop.app',
      'https://*.supabase.co',
      'https://api-ecommerce.hostinger.com',
      'https://*.hostinger.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
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

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
