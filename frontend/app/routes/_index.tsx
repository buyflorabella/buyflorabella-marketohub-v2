import {
  Await,
  useLoaderData,
  Link,
} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import LandingPage from '../componentsMockup2/pages/HomePage'
import {getSeoMeta} from '@shopify/hydrogen';


//export const meta: Route.MetaFunction = () => { return [{title: 'Hydrogen | Home'}]; };

export const meta: Route.MetaFunction = ({data}) => {
  const seo = data?.seo;

  const title = seo?.title
    ? `${seo.title} | Premium Trace Minerals`
    : 'Buy Flora Bella';

  return [
    {title},
    {
      name: 'description',
      content:
        seo?.description ??
        'Premium mineral soil supplement for healthier, more vibrant gardens.',
    },
  ];
};



export async function loader(args: Route.LoaderArgs) {
  const {env} = args.context;
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData, env,
    seo: {
      title: 'Buy Flora Bella',
      description: 'Florabella premium mineral soil supplement for healthier, more vibrant gardens.',
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const latestProduct = context.storefront
    .query(PRODUCT_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    latestProduct,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <LandingPage />
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
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
` as const;

const PRODUCT_QUERY = `#graphql
  query Product($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
` as const;