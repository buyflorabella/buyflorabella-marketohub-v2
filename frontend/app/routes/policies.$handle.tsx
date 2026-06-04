// import {
//   Link,
//   useLoaderData,
// } from 'react-router';
// import type {Route} from './+types/policies.$handle';
// import {type Shop} from '@shopify/hydrogen/storefront-api-types';

// type SelectedPolicies = keyof Pick<
//   Shop,
//   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
// >;

// export const meta: Route.MetaFunction = ({data}) => {
//   return [{title: `Hydrogen | ${data?.policy.title ?? ''}`}];
// };

// export async function loader({params, context}: Route.LoaderArgs) {
//   if (!params.handle) {
//     throw new Response('No handle was passed in', {status: 404});
//   }

//   const policyName = params.handle.replace(
//     /-([a-z])/g,
//     (_: unknown, m1: string) => m1.toUpperCase(),
//   ) as SelectedPolicies;

//   const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
//     variables: {
//       privacyPolicy: false,
//       shippingPolicy: false,
//       termsOfService: false,
//       refundPolicy: false,
//       [policyName]: true,
//       language: context.storefront.i18n?.language,
//     },
//   });

//   const policy = data.shop?.[policyName];

//   if (!policy) {
//     throw new Response('Could not find the policy', {status: 404});
//   }

//   return {policy};
// }

// export default function Policy() {
//   const {policy} = useLoaderData<typeof loader>();

//   return (
//     <div className="policy">
//       <br />
//       <br />
//       <div>
//         <Link to="/policies">← Back to Policies</Link>
//       </div>
//       <br />
//       <h1>{policy.title}</h1>
//       <div dangerouslySetInnerHTML={{__html: policy.body}} />
//     </div>
//   );
// }

// // NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
// const POLICY_CONTENT_QUERY = `#graphql
//   fragment Policy on ShopPolicy {
//     body
//     handle
//     id
//     title
//     url
//   }
//   query Policy(
//     $country: CountryCode
//     $language: LanguageCode
//     $privacyPolicy: Boolean!
//     $refundPolicy: Boolean!
//     $shippingPolicy: Boolean!
//     $termsOfService: Boolean!
//   ) @inContext(language: $language, country: $country) {
//     shop {
//       privacyPolicy @include(if: $privacyPolicy) {
//         ...Policy
//       }
//       shippingPolicy @include(if: $shippingPolicy) {
//         ...Policy
//       }
//       termsOfService @include(if: $termsOfService) {
//         ...Policy
//       }
//       refundPolicy @include(if: $refundPolicy) {
//         ...Policy
//       }
//     }
//   }
// ` as const;

import { useParams } from 'react-router';

const policies = {
  'privacy': {
    title: 'Privacy Policy',
    lastUpdated: 'January 1, 2026',
    content: [
      {
        section: 'Information We Collect',
        text: 'We collect information you provide directly to us when you create an account, make a purchase, sign up for our newsletter, or contact us. This may include your name, email address, shipping address, phone number, and payment information.',
      },
      {
        section: 'How We Use Your Information',
        text: 'We use the information we collect to process your orders, communicate with you about your orders and our products, send you marketing communications (with your consent), improve our website and services, and comply with legal obligations.',
      },
      {
        section: 'Information Sharing',
        text: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.',
      },
      {
        section: 'Data Security',
        text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. All payment information is encrypted using SSL technology.',
      },
      {
        section: 'Your Rights',
        text: 'You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, please contact us at buyflorabella.com.',
      },
      {
        section: 'Cookies',
        text: 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
      },
      {
        section: 'Changes to This Policy',
        text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
      },
    ],
  },
  'terms': {
    title: 'Terms of Service',
    lastUpdated: 'January 1, 2026',
    content: [
      {
        section: 'Acceptance of Terms',
        text: 'By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our website.',
      },
      {
        section: 'Use of Website',
        text: 'You may use our website only for lawful purposes and in accordance with these Terms. You agree not to use the website in any way that violates any applicable laws or regulations, or to engage in any conduct that restricts or inhibits anyone\'s use of the website.',
      },
      {
        section: 'Product Information',
        text: 'We strive to provide accurate product information. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free. If a product is not as described, your sole remedy is to return it unused.',
      },
      {
        section: 'Orders and Payment',
        text: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices and availability are subject to change without notice. Payment must be received before we dispatch your order.',
      },
      {
        section: 'Intellectual Property',
        text: 'The content on this website, including text, graphics, logos, and images, is the property of Flora Bella and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works from our content without express written permission.',
      },
      {
        section: 'Limitation of Liability',
        text: 'To the fullest extent permitted by law, Flora Bella shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products.',
      },
      {
        section: 'Governing Law',
        text: 'These Terms shall be governed by and construed in accordance with the laws of the State of Colorado, without regard to its conflict of law provisions.',
      },
    ],
  },
  'shipping': {
    title: 'Shipping Policy',
    lastUpdated: 'January 1, 2026',
    content: [
      {
        section: 'Order Processing',
        text: 'Orders are prepared for shipment as quickly as possible after purchase. Processing times may vary based on order volume, product availability, and seasonal demand.  Once your order ships, you’ll receive a confirmation email with tracking information when available.',
      },
      {
        section: 'Tracking',
        text: 'Tracking details are provided for most shipments. You can access tracking information through your shipping confirmation email or customer account.',
      },
      {
        section: 'Shipping Addresses',
        text: 'Please ensure a complete and accurate delivery address at checkout. Some shipping methods may require a physical street address.',
      },
      {
        section: 'Lost or Damaged Packages',
        text: 'If your order arrives damaged or appears to be lost in transit, please contact our support team so we can review the situation and assist with next steps. Resolution may involve coordination with the shipping carrier.',
      },
      {
        section: 'Additional Notes',
        text: 'Shipping options, carriers, and policies may change over time. Current details are always presented during checkout and through order confirmation communications.',
      },
    ],
  },
  'returns': {
    title: 'Returns & Refund Policy',
    lastUpdated: 'January 1, 2026',
    content: [
      {
        section: 'Our Commitment',
        text: 'We take care in how Flora Bella products are sourced, prepared, and shipped. If there’s an issue with your order, our team is here to help ensure you receive the correct product in good condition.',
      },
      {
        section: 'Exchanges',
        text: 'Flora Bella does not offer refunds. Instead, we support product exchanges in certain situations, such as damaged items or order issues.  If you believe an exchange is needed, please contact our support team so we can review the details and determine the best next step.',
      },
      {
        section: 'How to Request an Exchange',
        text: 'To request assistance with an exchange, please reach out to our customer support team using the contact information provided on our website. Include your order number and a brief description of the issue so we can assist you efficiently.',
      },
      {
        section: 'Damaged or Incorrect Orders',
        text: 'If your order arrives damaged or incorrect, please contact us promptly and include photos when possible. Once reviewed, we’ll work with you to resolve the issue, which may include sending a replacement product.',
      },
      {
        section: 'Subscriptions',
        text: 'Subscription orders follow the same exchange and support process as one-time purchases. Subscription settings can be managed directly through your customer account.',
      },
      {
        section: 'Additional Notes',
        text: 'Exchange options, processes, and eligibility may change over time. Current details and instructions are always available through our customer support team.',
      },
    ],
  },
};

export default function PolicyPage() {
  const { handle = 'privacy' } = useParams();

  const policy = policies[handle as keyof typeof policies];

  if (!policy) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl text-white mb-4">Policy not found</h1>
            <a href="/" className="text-[#7cb342] hover:underline">
              Return home
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {policy.title}
          </h1>
          <p className="text-white/50">Last updated: {policy.lastUpdated}</p>
        </div>

        <div className="glass border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="space-y-8">
            {policy.content.map((item, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold text-white mb-4">{item.section}</h2>
                <p className="text-white/80 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Questions?</h3>
            <p className="text-white/70 mb-6">
              If you have any questions about this policy, please contact us:
            </p>
            <div className="space-y-2 text-white/70">
              <p>Email: support@buyflorabella.com</p>
              <p>Phone: 415-860-1455</p>
              <p>Address: 218 Julia Street Bay St. Louis, MS 39520</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
