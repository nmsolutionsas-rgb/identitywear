import { Analytics, getShopAnalytics, useNonce } from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import favicon from '~/assets/favicon.svg';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';

// Import New Providers and Components
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { WishlistProvider } from '@/hooks/useWishlist';
import GymHeader from '@/components/GymHeader';
import Footer from '@/components/Footer';
import WelcomeMessage from '@/components/WelcomeMessage';


export const shouldRevalidate = ({ formMethod, currentUrl, nextUrl }) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap',
    },
    { rel: 'icon', type: 'image/svg+xml', href: favicon },
  ];
}

export async function loader(args) {
  const { storefront, env } = args.context;
  return {
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
    env: {
      PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY: env.PUBLIC_SUPABASE_ANON_KEY,
    }
  };
}

export function Layout({ children }) {
  const nonce = useNonce();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen bg-white flex flex-col">
                <GymHeader />
                <WelcomeMessage />
                <main className="flex-grow identity-shell">
                  {children}
                </main>
                <Footer />
                <Toaster />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData('root');

  return (
    <Analytics.Provider
      cart={null} // We are using custom cart
      shop={data?.shop}
      consent={data?.consent}
    >
      <Outlet />
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
