import { Heart, Award, Leaf, Users, Shield, Beaker, Sprout, TreePine } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124, 179, 66, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124, 179, 66, 0.08) 0%, transparent 50%)',
        }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
            <span className="text-[#7cb342] font-semibold text-sm tracking-wide">ABOUT US</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 heading-font">
            Our Story
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Founded on the belief that optimal **SOIL** begins with proper mineral nutrition, Flora Bella is committed to providing the highest quality trace minerals to support your wellness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden group hover:scale-105 transition-transform duration-300">
            <img
              src="/20260105_163329.jpg"
              alt="Flora Bella Mission"
              className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 heading-font">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              At Flora Bella, we believe that everyone deserves access to pure, bioavailable minerals that support optimal health and vitality. Our mission is to bridge the gap between modern nutritional needs and the mineral-depleted foods of today's agricultural system.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              We are dedicated to sourcing the finest quality minerals from pristine ancient sea beds and volcanic deposits, ensuring that each product delivers the full spectrum of trace minerals your body needs to thrive.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Through rigorous testing, transparent sourcing, and a commitment to education, we empower individuals to take control of their mineral nutrition and experience the transformative benefits of proper supplementation.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pure Sourcing</h3>
            <p className="text-gray-600">
              Minerals sourced from pristine ancient sea beds and volcanic deposits, free from modern pollutants.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Tested</h3>
            <p className="text-gray-600">
              Every batch is third-party tested for purity, potency, and safety to ensure premium quality.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Science-Backed</h3>
            <p className="text-gray-600">
              Formulations based on cutting-edge research and clinical studies in mineral nutrition.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
            <p className="text-gray-600">
              Supporting a vibrant community of health-conscious individuals on their wellness journey.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 heading-font">
              Our Sourcing & Quality Standards
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Every step, from source to supplement, meets the highest standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-gray-200 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Pristine Natural Sources"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold heading-font text-gray-900 mb-2">
                  Pristine Sources
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Ancient sea beds and volcanic deposits, formed millions of years before modern pollution.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-gray-200 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Quality Testing Laboratory"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <Beaker className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold heading-font text-gray-900 mb-2">
                  Rigorous Testing
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Third-party tested for heavy metals, contaminants, and potency at every stage.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-gray-200 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Bioavailable Mineral Forms"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold heading-font text-gray-900 mb-2">
                  Bioavailable Forms
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Premium mineral forms engineered for maximum absorption and effectiveness.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-gray-200 hover:border-[#7cb342]/30 hover:scale-105 hover:shadow-2xl hover:shadow-[#7cb342]/20 group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Sustainable Practices"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-12 h-12 bg-[#7cb342] rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold heading-font text-gray-900 mb-2">
                  Sustainable Practices
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Eco-friendly sourcing and packaging that protects the environments we depend on.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Wellness Community</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Experience the difference that pure, bioavailable minerals can make in your life. Join thousands of satisfied customers who have transformed their health with Flora Bella.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="px-8 py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shiny-border relative z-10"
            >
              <span className="relative z-10">Shop Products</span>
            </a>
            <a
              href="/contact"
              className="px-8 py-4 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shiny-border relative z-10"
            >
              <span className="relative z-10">Contact Us</span>
            </a>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
