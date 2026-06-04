import { Play, Instagram, ArrowRight } from 'lucide-react';

export default function VideoReels() {
  const reels = [
    {
      title: 'Before and after soil test',
      platform: 'From Instagram',
      thumbnail: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      title: 'Indoor plant rescue',
      platform: 'From Instagram',
      thumbnail: 'https://images.pexels.com/photos/1388944/pexels-photo-1388944.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      title: 'Market gardener walkthrough',
      platform: 'From Instagram',
      thumbnail: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  return (
    <section className="gradient-offwhite py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff1493]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4ff00]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden aspect-[9/16] max-w-md mx-auto relative group cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg">
              <img
                src="https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Main Tutorial"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold text-lg">Watch how to use Flora Bella</p>
                <p className="text-white/70 text-sm">Complete mixing and application guide</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-gray-900 mb-8">
              See Flora Bella In Action
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Watch exactly how we mix and apply Flora Bella in real gardens, and see the transformation
              from growers just like you.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {reels.map((reel, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-[9/16] relative group cursor-pointer hover:scale-105 transition-transform duration-300 shadow"
                >
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-white text-xs font-semibold mb-1">{reel.title}</p>
                    <p className="text-white/60 text-xs flex items-center gap-1">
                      <Instagram className="w-3 h-3" />
                      {reel.platform}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="bg-white border-2 border-[#7cb342] px-8 py-4 rounded-full font-semibold hover:bg-[#7cb342]/10 transition-all flex items-center gap-2 text-gray-900 shadow">
              <Instagram className="w-5 h-5 text-[#7cb342]" />
              View more on Instagram
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
