import { useLocation } from 'react-router-dom';
import { Heart, Award, Leaf, Users, Shield, Beaker, Sprout, TreePine } from 'lucide-react';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar';

const policies = {
  '/privacy': {
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
        text: 'You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, please contact us at support@buyflorabella.com.',
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
  '/terms': {
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
  '/shipping': {
    title: 'Shipping Policy',
    lastUpdated: 'January 1, 2026',
    content: [
      {
        section: 'Domestic Shipping',
        text: 'We offer free standard shipping (3-5 business days) on all orders over $75 within the continental United States. Orders under $75 have a flat shipping rate of $5.99. Express shipping (2-3 days) and overnight options are available at checkout.',
      },
      {
        section: 'International Shipping',
        text: 'We ship to most countries worldwide. International shipping rates and delivery times vary by destination. International customers are responsible for any customs fees, import duties, or taxes levied by their country.',
      },
      {
        section: 'Processing Time',
        text: 'Orders are typically processed and shipped within 1-2 business days. You will receive a shipping confirmation email with tracking information once your order has shipped.',
      },
      {
        section: 'Tracking',
        text: 'All orders include tracking. You can track your order by logging into your account or using the tracking number provided in your shipping confirmation email.',
      },
      {
        section: 'Shipping Restrictions',
        text: 'We currently do not ship to P.O. boxes or APO/FPO addresses. Please provide a physical street address for delivery.',
      },
      {
        section: 'Lost or Damaged Packages',
        text: 'If your package is lost or damaged in transit, please contact us within 7 days of the expected delivery date. We will work with the carrier to resolve the issue and ensure you receive your order.',
      },
    ],
  },
  '/returns': {
    title: 'Returns & Refund Policy',
    lastUpdated: 'January 1, 2026',
    content: [
      {
        section: '60-Day Money-Back Guarantee',
        text: 'We stand behind the quality of our products. If you are not completely satisfied with your purchase, you may return it within 60 days for a full refund, even if the product has been opened and used.',
      },
      {
        section: 'How to Initiate a Return',
        text: 'To start a return, please contact our customer support team at support@buyflorabella.com or call 415-860-1455. We will provide you with a prepaid return shipping label and instructions.',
      },
      {
        section: 'Return Conditions',
        text: 'Products must be returned in their original packaging when possible. We accept returns of opened products, but please include all original contents. Shipping costs for returns are covered by us.',
      },
      {
        section: 'Refund Processing',
        text: 'Once we receive your return, refunds are processed within 5-7 business days. The refund will be issued to your original payment method. Please allow additional time for your bank to process the refund.',
      },
      {
        section: 'Exchanges',
        text: 'If you would like to exchange a product for a different one, please contact our support team. We will send you the new product and provide a prepaid return label for the original item.',
      },
      {
        section: 'Subscription Returns',
        text: 'Subscription orders can be returned using the same process. You can also pause or cancel your subscription at any time from your account dashboard.',
      },
      {
        section: 'Damaged Products',
        text: 'If you receive a damaged product, please contact us immediately with photos of the damage. We will send a replacement at no cost to you.',
      },
    ],
  },
};


export default function ReturnsPage() {
  const location = useLocation();
  const policy = policies[location.pathname as keyof typeof policies];

  if (!policy) {
    return (
      <>
        <AnnouncementBar />
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
      <AnnouncementBar />
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
