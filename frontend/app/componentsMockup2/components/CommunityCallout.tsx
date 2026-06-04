import { Mail, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEnv } from '../contexts/EnvContext';
import { useFeatureFlags  } from '../contexts/FeatureFlagsContext';
import { useRouteLoaderData } from 'react-router';


export default function CommunityCallout() {
  const { whatsappGroupUrl, whatsappLinkCallout } = useEnv();
  const { flags } = useFeatureFlags();  

  // Read from root loader (runtime-safe)
  const rootData = useRouteLoaderData('root') as {
    env?: {
      omnisendBrandId?: string;
    };
  };

  const BRAND_ID = rootData?.env?.omnisendBrandId;  
  //console.log("BRAND_ID:" + BRAND_ID);
  

  //console.log(`whatsappWidget: ${flags.whatsappWidget}, whatsappGroupUrl: ${whatsappGroupUrl}, whatsappLinkCallout: ${whatsappLinkCallout}`);

  return (
    <section className="gradient-offwhite py-20" id="community">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold heading-font text-gray-900 mb-6">
            A Community For Growers Who Care About Soil Health
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Flora Bella exists to make expert level soil care simple for everyday gardeners. Join our
            growing community for seasonal tips, real case studies, and honest conversations about what
            works.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* original 
          <div className="bg-white rounded-3xl p-8 hover:scale-105 transition-transform shadow-lg border border-gray-200">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#7cb342]/20 rounded-xl mb-6">
              <Mail className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-2xl font-bold heading-font text-gray-900 mb-4">Join the email list</h3>
            <p className="text-gray-600 mb-6">
              Enter your email to receive practical soil tips and early access to new batches.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7cb342] transition-colors"
              />
              <button className="w-full gradient-green text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">
                Get soil tips
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          */}

<div className="bg-white rounded-3xl p-8 hover:scale-105 transition-transform shadow-lg border border-gray-200">
  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#7cb342]/20 rounded-xl mb-6">
    <Mail className="w-8 h-8 text-[#7cb342]" />
  </div>
  <h3 className="text-2xl font-bold heading-font text-gray-900 mb-4">Join the email list</h3>
  <p className="text-gray-600 mb-6">
    Enter your email to receive practical soil tips and early access to new batches.
  </p>
  
  {/* Omnisend embedded form */}
  <div id="omnisend-embedded-v2-69825e4afd9aa41796edfb9e"></div>
</div>

          <div className="bg-white rounded-3xl p-8 hover:scale-105 transition-transform shadow-lg border border-gray-200">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#7cb342]/20 rounded-xl mb-6">
              <Users className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-2xl font-bold heading-font text-gray-900 mb-4">Growers group</h3>
            <p className="text-gray-600 mb-6">
              {(flags.whatsappWidget && whatsappLinkCallout) || "Connect with experienced growers, share your results, and get personalized advice for your unique growing conditions."}
            </p>
            {(flags.whatsappWidget && whatsappGroupUrl) ? (
              <a
                href={whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gray-100 border-2 border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-gray-900"
              >
                Join WhatsApp group
                <ArrowRight className="w-5 h-5" />
              </a>
            ) : (
              <Link
                to="/community"
                className="w-full bg-gray-100 border-2 border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-gray-900"
              >
                Request invite
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_1_of_6.jpg?v=1769731706',
            'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_2_of_6.jpg?v=1769731708',
            'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_3_of_6.jpg?v=1769731701',
            'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_4_of_6.jpg?v=1769731701',
            'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_5_of_6.jpg?v=1769731705',
            'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Home_Page_Bottom_Banner_6_of_6.jpg?v=1769731707',
          ].map((img, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden aspect-square hover:scale-105 transition-transform cursor-pointer relative shadow"
            >
              <img src={img} alt="Customer garden spotlight" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-xs font-semibold">Customer spotlight</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
