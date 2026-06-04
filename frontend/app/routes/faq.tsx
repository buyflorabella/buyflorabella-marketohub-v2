import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import PageBackground from '../componentsMockup2/components/PageBackground';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar';

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
        a: 'We offer shipping discount promotions throughout the year, follow us on social media to receive updates.',
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
        q: 'What is Flora Bella used for?',
        a: 'Flora Bella is designed to support soil vitality and plant development by replenishing naturally occurring trace minerals. It can be used across a wide range of gardens, from vegetables and flowers to trees, lawns, and container plants.',
      },
      {
        q: 'How do I apply Flora Bella to my garden?',
        a: 'Flora Bella can be mixed into soil, added to water, or used as part of a regular feeding routine. Application methods may vary based on plant type, growing medium, and season. Always start with recommended guidelines and adjust as needed.',
      },
      {
        q: 'When is the best time to use Flora Bella?',
        a: 'Flora Bella can be used throughout the growing cycle, including planting, active growth, and maintenance phases. Many gardeners incorporate it at the beginning of the season and continue as plants develop.',
      },
      {
        q: 'Is Flora Bella safe for edible plants?',
        a: 'Yes. Flora Bella is intended for use in gardens that include vegetables, herbs, and fruiting plants. As with any soil input, it should be applied according to usage guidance and good gardening practices.',
      },
      {
        q: 'Can Flora Bella be used with other soil amendments or fertilizers?',
        a: 'Flora Bella is often used alongside compost, organic matter, and standard fertilization programs. Gardeners may choose to integrate it into existing routines rather than replace other inputs.',
      },
      {
        q: 'Is Flora Bella suitable for raised beds and containers?',
        a: 'Yes. Flora Bella can be used in raised beds, container gardens, and in-ground plantings. Application amounts may differ depending on soil volume and planting density.',
      },
      {
        q: 'Does Flora Bella work for indoor plants or houseplants?',
        a: 'Many gardeners use Flora Bella for indoor plants as part of regular care. Adjust application frequency and amounts based on pot size and plant needs.',
      },
      {
        q: 'Is Flora Bella tested for quality and consistency?',
        a: 'Flora Bella is produced with attention to sourcing and consistency. Quality practices are in place to ensure the product meets internal standards before reaching customers.',
      },
    ],
  },
  {
    category: 'Subscribe & Save',
    questions: [
      {
        q: 'How does Subscribe & Save work?',
        a: 'Subscribe & Save lets you receive Flora Bella products automatically on a recurring basis. You choose a delivery schedule that fits your needs, and we take care of the rest. Subscription benefits and details may vary over time and are always shown at checkout.',
      },
      {
        q: 'Can I change my subscription frequency?',
        a: 'Yes. You can manage your subscription at any time, including adjusting delivery frequency, skipping an order, or making changes to your selections through your customer account.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Subscriptions can be paused or canceled at any time through your customer account. Changes typically take effect before the next scheduled order processes.',
      },
      {
        q: 'Will I be notified before each shipment?',
        a: 'Yes. You’ll receive a notification ahead of each scheduled shipment so you have time to review, update, or make changes if needed.',
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
      // {
      //   q: 'How long do refunds take?',
      //   a: 'Once we receive your return, refunds are processed within 5-7 business days. The refund will be issued to your original payment method. Please allow additional time for your bank to process the refund.',
      // },
      // {
      //   q: 'Can I exchange a product?',
      //   a: 'Yes! If you would like to exchange a product for a different one, contact our support team. We will send you the new product and provide a prepaid return label for the original item.',
      // },
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
