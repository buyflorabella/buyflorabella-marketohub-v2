import { Heart, Shield } from 'lucide-react';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar';

export default function Potatoe() {
  return (
    <>
      <AnnouncementBar />

      <div className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] pt-32 pb-20 overflow-hidden">
        {/* soft background accents */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(124, 179, 66, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(124, 179, 66, 0.08) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#7cb342]/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#7cb342]" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 heading-font">
              Account Login Temporarily Disabled
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              We’re putting the final polish on our account experience and have
              temporarily disabled login access.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Everything is on track — this feature is actively being
              implemented and will be available very soon.  
              There’s nothing wrong, and there’s nothing you need to do right now.
            </p>

            <div className="flex items-center justify-center gap-3 text-[#7cb342] mb-10">
              <Heart className="w-6 h-6" />
              <span className="font-semibold text-lg">
                Thank you for your patience — we appreciate you.
              </span>
              <Heart className="w-6 h-6" />
            </div>

            <p className="text-gray-600 max-w-xl mx-auto">
              Please don’t be upset 💚  
              This is part of a planned rollout to ensure everything works
              beautifully and securely when it launches.
            </p>

            <div className="mt-10">
              <a
                href="/"
                className="inline-block px-8 py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
