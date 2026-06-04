import { Star, Quote, Leaf, Flower2 } from 'lucide-react';

//name: 'Jacob Cataldo',
//name: 'Michael Misko',
export default function SocialProof() {
  const reviews = [
    {
      quote: "I have been on farms and in gardens for 40 years. I used Flora Bella on my farm and noticed an immediate difference in the vigor of all my plants, especially the palms.... I am amazed with the quality and performance of the Flora Bella product.",
      name: 'Michael M.',
      location: 'Larue MS',
      rating: 5,
      avatar: 'MM',
    },
    {
      quote: 'What surprised me most was how quickly I noticed new growth.  The plants responded faster than i expected.. with visible vitality early on!',
      name: 'Shannon L.',
      location: 'Tampa FL',
      rating: 5,
      avatar: 'SL',
    },
    {
      quote: 'I can\'t speak highly of it enough. Stuff made our plants explode! We had a pretty balanced recipe, but it helped give the plants a slower release version of the micronutrients a lot of growers struggle finding the right balance for. I\'d say it benefits smaller craft growers the most but it boosted the gardens we ran, and that was 42 acres....',
      name: 'Jacob C.',
      location: 'Cooperstate',
      rating: 5,
      avatar: 'JC',
    },
  ];

  return (
    <section className="bg-black py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d4ff00]/5 via-transparent to-transparent"></div>
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-10 floating">
          <Leaf className="w-24 h-24 text-[#d4ff00]" />
        </div>
        <div className="absolute bottom-1/4 right-10 floating-delayed">
          <Flower2 className="w-20 h-20 text-[#ff1493]" />
        </div>
        <div className="absolute top-1/2 right-1/3 floating-slow">
          <Leaf className="w-16 h-16 text-[#d4ff00]" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 floating-diagonal">
          <Flower2 className="w-18 h-18 text-[#ff1493]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <h2 className="text-5xl md:text-6xl font-bold heading-font text-center text-white mb-6">
          Gardeners Are Seeing Real Change
        </h2>
        <p className="text-xl text-white/60 text-center mb-20">Real results from real growers</p>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="group floating-slow" style={{ animationDelay: `${index * 0.3}s` }}>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#d4ff00]/20 to-[#ff1493]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#0a0015] to-black border border-white/10 rounded-3xl p-8 hover:border-white/30 hover:scale-105 transition-all duration-300 h-full cursor-pointer">
                  <div className="absolute top-6 right-6">
                    <Quote className="w-12 h-12 text-[#d4ff00]/20" />
                  </div>

                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#d4ff00] text-[#d4ff00]" />
                    ))}
                  </div>

                  <p className="text-white/90 text-lg mb-8 leading-relaxed relative z-10">
                    "{review.quote}"
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4ff00] to-[#ff1493] flex items-center justify-center font-bold text-black text-lg shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{review.name}</p>
                      <p className="text-sm text-white/50">{review.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 hidden">
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#d4ff00]/50 rounded-full font-semibold text-white transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-[#d4ff00]/20">
            <span>Read all 487 verified reviews</span>
            <span className="text-[#d4ff00] group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
