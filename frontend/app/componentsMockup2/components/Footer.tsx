import { Instagram, Facebook, Youtube, Twitter, Linkedin, CreditCard, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRouteLoaderData } from 'react-router';

export default function Footer() {
  // Read from root loader (runtime-safe)
  const rootData = useRouteLoaderData('root') as {
    env?: {
      omnisendBrandId?: string;
    };
  };

  const BRAND_ID = rootData?.env?.omnisendBrandId;  
  //console.log("BRAND_ID:" + BRAND_ID);

  // Form State
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!BRAND_ID) {
      console.warn('Omnisend Brand ID missing');
      return;
    }

    // Initialize queue
    window.omnisend = window.omnisend || [];
    window.omnisend.push(['brandID', BRAND_ID]);
    window.omnisend.push(['track', '$pageViewed']);

    //console.log(window.omnisend);

    // Load SDK once
    if (!document.getElementById('omnisend-script')) {
      const script = document.createElement('script');
      script.id = 'omnisend-script';
      script.src = 'https://omnisnippet1.com/inshop/launcher-v2.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [BRAND_ID]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    //console.log("NewLetterSubmit() [ entry ] ");
    e.preventDefault();
    //setStatus('loading');

    // Omnisend push commands are safe to call as soon as the array is initialized
    if (window.omnisend) {
      //console.log("Send to omnisend");

      try {
        window.omnisend.push(["identifyContact", {
          email: email,
          firstName: firstName,
          tags: ["source:footer-custom-signup"],
          identifiers: [{
            type: "email",
            id: email,
            channels: {
              email: {
                status: "subscribed",
                statusDate: new Date().toISOString()
              }
            }
          }]
        }]);

        // Optional: track a custom event if you have a specific automation trigger
        window.omnisend.push(["track", "Newsletter Subscribed"]);

        setStatus('success');
        setEmail('');
        setFirstName('');
        // Reset to idle after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } catch (err) {
        //console.error("Omnisend submission error:", err);
        setStatus('error');
      }
    } else {
      //console.log("ERROR Sending to omnisend");
      setStatus('error');
    }
  };  

  return (
    <footer className="bg-[#0a0015] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <img
              src="/flora_bella_logo.png"
              alt="Flora Bella Trace Minerals"
              className="h-20 mb-4"
            />
            <p className="text-white/70 leading-relaxed mb-6">
              Making expert level soil care simple for everyday gardeners. Commercial grade trace
              minerals for home and professional growers.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/buyflorabella/"
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61586134112080"
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.youtube.com/@BuyFloraBella"
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/randall-everett-33ab233a4/"
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                aria-label="X"
              >
                <Linkedin className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold heading-font text-white mb-6">Customer Care</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/policies/privacy" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Terms & Services
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold heading-font text-white mb-6">Guides & Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="/learn" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="/technical-docs" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Application Guide
                </a>
              </li>
              <li>
                <a href="/technical-docs" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Soil Testing
                </a>
              </li>
              <li>
                <a href="/community" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Grower Stories
                </a>
              </li>
              <li>
                <a href="/learn" className="text-white/70 hover:text-[#ff1493] transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold heading-font text-white mb-6">
              Stay Connected
            </h4>

            <p className="text-white/70 text-sm mb-4">
              Get growing tips and exclusive offers delivered to your inbox.
            </p>

            {/* Omnisend Embedded Form */}
            <div id="omnisend-embedded-v2-697e24c030f57720a72a784e" className="rounded-xl overflow-hidden"/>
          </div>
        </div>
                    
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © 2026 Flora Bella Trace Minerals. All rights reserved.
            </p>
            <p className="text-white/50 text-sm flex items-center gap-1">
              Site [ v8.2 ] by: BIRD Labs
              <span className="text-[10px] leading-none text-blue-400">🐦</span>
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 items-center">
                <CreditCard className="w-8 h-8 text-white/30" />
                <CreditCard className="w-8 h-8 text-white/30" />
                <CreditCard className="w-8 h-8 text-white/30" />
                <CreditCard className="w-8 h-8 text-white/30" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-white/50">
            <Link to="/policies/privacy" className="hover:text-[#ff1493] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/policies/terms" className="hover:text-[#ff1493] transition-colors">
              Terms of Service
            </Link>
            <Link to="/policies/shipping" className="hover:text-[#ff1493] transition-colors">
              Shipping Policy
            </Link>
            <Link to="/policies/returns" className="hover:text-[#ff1493] transition-colors">
              Returns & Refunds
            </Link>
            <Link to="/contact" className="hover:text-[#ff1493] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
