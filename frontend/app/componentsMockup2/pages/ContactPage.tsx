import { useState, useEffect } from 'react';
import { Mail, Phone, Clock, MapPin, Send, Users, Package, ExternalLink } from 'lucide-react';
import PageBackground from '../components/PageBackground';
import AnnouncementBar from '../components/AnnouncementBar';
import { useRouteLoaderData } from 'react-router';

declare global {
  interface Window {
    omnisend: any;
  }
}

export default function ContactPage() {
  // Read from root loader (runtime-safe)
  const { env } = useRouteLoaderData('root');

  type ContactForm = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    inquiry_type: string;
    orderNumber: string;
  };

  const [formData, setFormData] = useState<ContactForm>({
    name: 'John Doe',
    email: 'webmaster@allthingsgood.com',
    phone: '555-0199',
    subject: 'Integration Question',
    message: 'Testing the backend sync.',
    inquiry_type: 'general',
    orderNumber: '',
  });


  //const [submitting, setSubmitting] = useState(false);
  //const [submitted, setSubmitted] = useState(false);

  // Replaces submitting/submitted booleans with a single status object
  const [statusBackend, setStatusBackend] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  } | null>(null);  



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBackend({ type: 'loading', message: 'Syncing...' });

    const mailUrl = new URL(
      env.mailApiRoute,
      env.mailApiBase
    ).toString();

    //console.log("---------->>>>>>>> SENDING A REQUEST FOR MAILER: " + mailUrl);
    try {
      const response = await fetch(mailUrl, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      // Omnisend Identify
      if (window.omnisend) {
        window.omnisend.push(["identifyContact", {
          email: formData.email,
          firstName: formData.name,
          phone: formData.phone,
          tags: ["source:contact-page", `inquiry:${formData.inquiry_type}`]
        }]);
      }

      setStatusBackend({ type: 'success', message: data.success || 'Message sent!' });
    } catch (error: any) {
      setStatusBackend({ type: 'error', message: error.message });
    }
  };

  // const handleSubmit_v1 = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setSubmitting(true);

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 1000));

  //     console.log('Contact form submission:', formData);

  //     setSubmitted(true);
  //     setFormData({
  //       name: '',
  //       email: '',
  //       phone: '',
  //       subject: '',
  //       message: '',
  //       inquiry_type: 'general',
  //       orderNumber: '',
  //     });

  //     setTimeout(() => setSubmitted(false), 5000);
  //   } catch (error) {
  //     console.error('Error submitting contact form:', error);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiry_type: 'general',
      orderNumber: '',
    });
    setStatusBackend(null);
  };  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <AnnouncementBar />
      <div className="relative min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20 overflow-hidden">
        <PageBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
            <span className="text-[#7cb342] font-semibold text-sm tracking-wide">CONTACT US</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 heading-font">
            Get In Touch
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Have a question? We're here to help. Reach out to our customer support team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass border border-[#7cb342]/30 rounded-2xl p-8 hover:border-[#7cb342] transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-[#7cb342]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Brand Ambassadors</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Earn rewards by sharing Flora Bella with your community. Sign-ups are managed through our partner platform.
            </p>
            <a
              href="https://uppromote.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Apply via UpPromote
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-white/40 text-xs mt-4">Opens in new tab</p>
          </div>

          <div className="glass border border-[#7cb342]/30 rounded-2xl p-8 hover:border-[#7cb342] transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-[#7cb342]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Wholesale / Bulk Orders</h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Buying in bulk? Contact us for pricing and delivery options for larger quantities.
            </p>
            <a
              href="#bulk-inquiry"
              onClick={(e) => {
                e.preventDefault();
                setFormData(prev => ({ ...prev, inquiry_type: 'wholesale' })); // Update the state!
                document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                // const form = document.getElementById('contact-form');
                // const inquiryType = document.getElementById('inquiry_type') as HTMLSelectElement;
                // if (inquiryType) {
                //   inquiryType.value = 'wholesale';
                // }
                //form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Request Bulk Pricing
            </a>
            <p className="text-white/40 text-xs mt-4">For orders over 100 lbs or pallet/truckload quantities</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="glass border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
            <p className="text-white/70 mb-2">support@buyflorabella.com</p>
            <p className="text-white/50 text-sm">We'll respond within 24 hours</p>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
            <p className="text-white/70 mb-2">415-860-1455</p>
            <p className="text-white/50 text-sm">Mon-Fri 9AM-6PM EST</p>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Response Time</h3>
            <p className="text-white/70 mb-2">Within 24 hours</p>
            <p className="text-white/50 text-sm">Average response: 4 hours</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 font-semibold">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value="DxB"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 font-semibold">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 font-semibold">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 font-semibold">Inquiry Type *</label>
                  <select
                    id="inquiry_type"
                    name="inquiry_type"
                    value={formData.inquiry_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                  >
                    <option value="general" className="bg-[#1a1a2e]">General Inquiry</option>
                    <option value="order_support" className="bg-[#1a1a2e]">Order Support</option>
                    <option value="product_question" className="bg-[#1a1a2e]">Product Question</option>
                    <option value="wholesale" className="bg-[#1a1a2e]">Wholesale / Bulk Inquiry</option>
                    <option value="ambassador" className="bg-[#1a1a2e]">Brand Ambassador Program</option>
                  </select>
                </div>
              </div>

              {formData.inquiry_type === 'order_support' && (
                <div>
                  <label className="block text-white mb-2 font-semibold">Order Number</label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="#12345"
                  />
                </div>
              )}

              <div>
                <label className="block text-white mb-2 font-semibold">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                  placeholder="How can we help?"
                />
              </div>
              <div classname="text-white">Mailer: {env.mailApiBase}</div>

              <div>
                <label className="block text-white mb-2 font-semibold">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors resize-none bg-transparent"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                // Disable if the backend is currently processing
                disabled={statusBackend?.type === 'loading'}
                className="w-full py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {statusBackend?.type === 'loading' ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <div className="status-feedback mt-6">
                {statusBackend?.type === 'loading' && (
                  <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-xl text-blue-200 text-center">
                    Sending message ...
                  </div>
                )}
                {statusBackend?.type === 'success' && (
                  <div className="p-4 bg-[#7cb342]/20 border border-[#7cb342] rounded-xl text-[#7cb342] text-center">
                    {statusBackend.message}
                  </div>
                )}
                {statusBackend?.type === 'error' && (
                  <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-center">
                    {statusBackend.message}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Quick Help</h2>
            <div className="space-y-6">
              <div className="glass border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">Order Help</h3>
                <p className="text-white/70 mb-4">
                  Need help with an existing order? Track your shipment, make changes, or request a return.
                </p>
                <a
                  href="/faq"
                  className="text-[#7cb342] hover:underline font-semibold"
                >
                  View Order FAQs →
                </a>
              </div>

              <div className="glass border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">Product Questions</h3>
                <p className="text-white/70 mb-4">
                  Learn about our products, ingredients, usage instructions, and certifications.
                </p>
                <a
                  href="/faq"
                  className="text-[#7cb342] hover:underline font-semibold"
                >
                  View Product FAQs →
                </a>
              </div>

              <div className="glass border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">Partnerships</h3>
                <p className="text-white/70 mb-4">
                  Interested in partnering with Flora Bella? We offer opportunities for brand ambassadors, wholesale buyers, and retail partnerships.
                </p>
                <p className="text-white/50 text-sm">
                  Select the appropriate inquiry type in the form to learn more about partnership opportunities.
                </p>
              </div>

              <div className="glass border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">Location</h3>
                <div className="flex items-start gap-3 text-white/70">
                  <MapPin className="w-5 h-5 text-[#7cb342] flex-shrink-0 mt-1" />
                  <div>
                    <p>Flora Bella Trace Minerals</p>
                    <p>218 Julia Street</p>
                    <p>Bay St. Louis, MS 39520</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
