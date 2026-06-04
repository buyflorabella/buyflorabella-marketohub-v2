import { FileText, Download, Lock } from 'lucide-react';
import PageBackground from '../componentsMockup2/components/PageBackground';

const resources = [
  {
    title: 'Application & Use Guide',
    description: 'Complete application rates, mixing instructions, and best practices for all growing systems.',
    icon: FileText,
    size: '2.4 MB',
    pages: '12 pages',
    public: true,
  },
  {
    title: 'Guaranteed Analysis & Ingredients',
    description: 'Full ingredient disclosure, guaranteed analysis, and regulatory compliance information.',
    icon: FileText,
    size: '1.8 MB',
    pages: '8 pages',
    public: true,
  },
  {
    title: 'Commercial & Advisory Use',
    description: 'Bulk application protocols, commercial farming guidance, and distributor information.',
    icon: FileText,
    size: '3.2 MB',
    pages: '16 pages',
    public: false,
  },
];

export default function TechnicalDocsPage() {
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20 overflow-hidden">
        <PageBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
              <span className="text-[#7cb342] font-semibold text-sm tracking-wide">TECHNICAL RESOURCES</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Technical Documentation
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Comprehensive technical resources to ensure proper use across all growing systems
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-strong border border-white/10 rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Technical Overview</h2>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  Flora Bella products are supported by comprehensive technical documentation to ensure proper use across a range of growing systems. This page provides high-level technical context and access to detailed resources, including application guidance, guaranteed analysis, and commercial use information.
                </p>
                <p>
                  Detailed instructions, rates, and regulatory disclosures are contained within the individual resources listed below.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Available Technical Resources</h3>
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="glass border border-white/10 rounded-2xl p-6 hover:border-[#7cb342]/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#7cb342]/20 rounded-xl">
                        <resource.icon className="w-6 h-6 text-[#7cb342]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xl font-bold text-white">{resource.title}</h4>
                          {!resource.public && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                              <Lock className="w-3 h-3 text-white/70" />
                              <span className="text-xs text-white/70">Restricted</span>
                            </div>
                          )}
                        </div>
                        <p className="text-white/70 mb-4">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm text-white/50">
                            <span>{resource.size}</span>
                            <span>•</span>
                            <span>{resource.pages}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (!resource.public) {
                                alert('This resource requires commercial access. Please contact us for access.');
                              } else {
                                alert('PDF download functionality would be implemented here');
                              }
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                              resource.public
                                ? 'bg-[#7cb342] hover:bg-[#8bc34a] text-white hover:scale-105'
                                : 'bg-white/10 hover:bg-white/20 text-white/70'
                            }`}
                          >
                            <Download className="w-4 h-4" />
                            {resource.public ? 'Download PDF' : 'Request Access'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-strong border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Additional Support</h3>
              <p className="text-white/70 mb-6">
                For technical questions, bulk ordering, or commercial consultation, our team is ready to assist.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/contact"
                  className="p-4 glass border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-center"
                >
                  <div className="text-white font-semibold mb-1">Technical Support</div>
                  <div className="text-[#7cb342] text-sm">Contact our team →</div>
                </a>
                <a
                  href="/faq"
                  className="p-4 glass border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-center"
                >
                  <div className="text-white font-semibold mb-1">Common Questions</div>
                  <div className="text-[#7cb342] text-sm">View FAQ →</div>
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-[#7cb342]/10 border border-[#7cb342]/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Looking for More Information?</h3>
              <p className="text-white/70 mb-6">
                Our technical documentation sits alongside lab data, retail packaging specifications, distributor training materials, sustainability reporting, and international market resources.
              </p>
              <a
                href="/about"
                className="inline-block px-8 py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Learn More About Flora Bella
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
