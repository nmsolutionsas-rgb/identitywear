import { useLoaderData, Link } from 'react-router';
import { Suspense } from 'react';
import { Await, Image } from '@shopify/hydrogen';
import ProductCarousel from '~/components/ProductCarousel';
import StorytellingSection from '~/components/StorytellingSection';
import LifestyleCarousel from '~/components/LifestyleCarousel';
import LimitedTimeDeal from '~/components/LimitedTimeDeal';
import ShopCombos from '~/components/ShopCombos';
import BrandValues from '~/components/BrandValues';
import CustomerReviews from '~/components/CustomerReviews';
import EnergyHero from '~/components/EnergyHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
    return [{ title: 'Identitywear | Premium Hoodies & Streetwear' }];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
    const deferredData = loadDeferredData(args);
    const criticalData = await loadCriticalData(args);
    return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context }) {
    const [{ collections }] = await Promise.all([
        context.storefront.query(FEATURED_COLLECTION_QUERY),
    ]);

    return {
        featuredCollection: collections.nodes[0],
    };
}

/**
 * Load data for rendering content below the fold.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({ context }) {
    const recommendedProducts = context.storefront
        .query(RECOMMENDED_PRODUCTS_QUERY)
        .catch((error) => {
            console.error(error);
            return null;
        });

    return {
        recommendedProducts,
    };
}

export default function Index() {
    const data = useLoaderData();

    return (
        <>
            <EnergyHero />
            <ProductCarousel products={data.recommendedProducts} />
            <StorytellingSection />
            <LifestyleCarousel />
            <LimitedTimeDeal />
            <ShopCombos products={data.recommendedProducts} />
            <BrandValues />
            <CustomerReviews />
        </>
    );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      price {
        amount
        currencyCode
      }
      image {
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
