import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import PageBackground from '../components/PageBackground';
import AnnouncementBar from '../components/AnnouncementBar';

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 3-5 business days within the continental US. Express shipping (2-3 days) and overnight shipping options are available at checkout. International shipping times vary by location.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free standard shipping on all orders over $75 within the United States. Free shipping is automatically applied at checkout when your order qualifies.',
      },
      {
        q: 'Can I track my order?',
        a: 'Absolutely! Once your order ships, you will receive a tracking number via email. You can also track your order by logging into your account and viewing your order history.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to most countries worldwide. Shipping rates and delivery times vary by destination. International customers are responsible for any customs fees or import duties.',
      },
    ],
  },
  {
    category: 'Products & Usage',
    questions: [
      {
        q: 'How should I take mineral supplements?',
        a: 'Take 2 capsules daily with food, preferably in the morning for energy support. For magnesium products, we recommend taking them in the evening. Always start with the recommended dose and consult your healthcare provider if you have specific health conditions.',
      },
      {
        q: 'Are your products suitable for vegetarians and vegans?',
        a: 'Yes! All our products are 100% vegetarian and most are vegan-friendly. We use plant-based capsules and do not use any animal-derived ingredients. Check individual product labels for specific certifications.',
      },
      {
        q: 'How long until I see results?',
        a: 'Most customers report feeling more energized within 1-2 weeks of consistent use. However, optimal mineral levels typically develop over 2-3 months of daily supplementation. Results vary based on individual needs and deficiency levels.',
      },
      {
        q: 'Can I take multiple mineral supplements together?',
        a: 'Generally yes, but we recommend spacing some minerals apart for optimal absorption. Our Essential Mineral Complex is designed to provide balanced minerals in one convenient formula. Consult your healthcare provider for personalized advice.',
      },
      {
        q: 'Are your products third-party tested?',
        a: 'Yes! All our products undergo rigorous third-party testing for purity, potency, and quality. We test for heavy metals, contaminants, and verify that each product contains what the label states.',
      },
    ],
  },
  {
    category: 'Subscribe & Save',
    questions: [
      {
        q: 'How does Subscribe & Save work?',
        a: 'Subscribe & Save offers 15% off and free shipping on recurring orders. Choose your delivery frequency (30, 60, or 90 days), and we will automatically send your products. You can modify, pause, or cancel anytime.',
      },
      {
        q: 'Can I change my subscription frequency?',
        a: 'Yes! Log into your account, go to Manage Subscriptions, and adjust your delivery frequency at any time. Changes will apply to your next scheduled order.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'You can cancel your subscription anytime from your account dashboard. Go to Manage Subscriptions and click Cancel. There are no cancellation fees or penalties.',
      },
      {
        q: 'Will I be notified before each shipment?',
        a: 'Yes! We send an email reminder 3 days before each subscription order is processed, giving you time to make any changes or skip a delivery if needed.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 60-day money-back guarantee on all products. If you are not completely satisfied, return the product (even if opened) for a full refund. Just contact our support team to initiate a return.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Once we receive your return, refunds are processed within 5-7 business days. The refund will be issued to your original payment method. Please allow additional time for your bank to process the refund.',
      },
      {
        q: 'Can I exchange a product?',
        a: 'Yes! If you would like to exchange a product for a different one, contact our support team. We will send you the new product and provide a prepaid return label for the original item.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click the Account icon in the header and select "Create Account." Enter your email and create a password. An account makes checkout faster and allows you to track orders and manage subscriptions.',
      },
      {
        q: 'Is my personal information secure?',
        a: 'Absolutely. We use industry-standard SSL encryption to protect your data. We never sell or share your personal information with third parties. Read our Privacy Policy for complete details.',
      },
      {
        q: 'How do I update my account information?',
        a: 'Log into your account and go to Account Settings. You can update your email, password, shipping addresses, and payment methods at any time.',
      },
    ],
  },
];

export default function FAQPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(faqs[0].category);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.questions.length > 0)
    : faqs;

  return (
    <>
      <AnnouncementBar />
      <div className="relative min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20 overflow-hidden">
        <PageBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
            <span className="text-[#7cb342] font-semibold text-sm tracking-wide">SUPPORT</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 heading-font">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, and policies
          </p>
        </div>

        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 glass border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredFaqs.map((category) => (
            <div key={category.category} className="glass border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                {expandedCategory === category.category ? (
                  <ChevronUp className="w-6 h-6 text-[#7cb342] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-white/50 flex-shrink-0" />
                )}
              </button>

              {expandedCategory === category.category && (
                <div className="border-t border-white/10">
                  {category.questions.map((faq, idx) => (
                    <div key={idx} className="border-b border-white/10 last:border-0">
                      <button
                        onClick={() => setExpandedQuestion(expandedQuestion === `${category.category}-${idx}` ? null : `${category.category}-${idx}`)}
                        className="w-full p-6 flex items-start justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-semibold pr-4">{faq.q}</span>
                        {expandedQuestion === `${category.category}-${idx}` ? (
                          <ChevronUp className="w-5 h-5 text-[#7cb342] flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0 mt-1" />
                        )}
                      </button>
                      {expandedQuestion === `${category.category}-${idx}` && (
                        <div className="px-6 pb-6 text-white/70 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50 text-lg">No questions found matching your search.</p>
          </div>
        )}

        <div className="mt-16 glass border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
          <p className="text-white/70 mb-6">
            Our customer support team is here to help
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            Contact Support
          </a>
        </div>
        </div>
      </div>
    </>
  );
}
