import { Play, Instagram, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {Video} from '@shopify/hydrogen-react';
import './VideoReelsIframe.css';

export default function VideoReels() {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const videoRef = useRef(null);

  const reels = [
    {
      title: 'How To Mix Flora Bella',
      platform: 'YouTube',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/video_how_to_mix_thumbnail.png?v=1770014714',
      type: 'youtube',
      videoSrc: 'https://www.youtube.com/embed/-SFmEtrPzd0?autoplay=1',
    },
    {
      title: 'Compost Tea Mix',
      platform: 'YouTube',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/video_compost_tea_thumbnail.png?v=1770014310',
      type: 'youtube',
      videoSrc: 'https://www.youtube.com/embed/3L2qpacas2s?autoplay=1',
    },
    {
      title: 'Flora Bella Trace Minerals',
      platform: 'YouTube',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/video_flora_bella_and_water_thumbnail.png?v=1770015063',
      type: 'youtube',      
      videoSrc: 'https://www.youtube.com/embed/ZjHmtGw0ZqA?autoplay=1',
    },
    {
      title: 'Flora Bella Trace Minerals',
      platform: 'YouTube',
      thumbnail: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/video_flora_bella_waterfall_scene.png?v=1770057707',
      type: 'youtube',      
      videoSrc: 'https://www.youtube.com/embed/MdAHWVib7Kk?autoplay=1',
    },
    // {
    //   title: 'How To Mix Flora Bella',
    //   platform: 'Shopify',
    //   thumbnail: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/video_how_to_mix_thumbnail.png?v=1770014714',
    //   type: 'mp4',      
    //   videoSrc: 'https://cdn.shopify.com/videos/c/o/v/a638f13cde5e4749a87a2de8cbd4ec9b.mp4',
    // },
    // {
    //   title: 'Compost Tea Mix',
    //   platform: 'Shopify',
    //   thumbnail: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/video_compost_tea_thumbnail.png?v=1770014310',
    //   type: 'mp4',      
    //   videoSrc: 'https://cdn.shopify.com/videos/c/o/v/20c8f9fd3db046d4b1f83fbf8a7b34ad.mp4',
    // },
    ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedVideo]);

  return (
    <section className="bg-zinc-50 py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff1493]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4ff00]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="bg-black border border-gray-200 rounded-3xl overflow-hidden aspect-[9/16] max-w-md mx-auto relative shadow-2xl">
              <div className="bg-black border border-gray-200 rounded-3xl overflow-hidden aspect-[9/16] max-w-md mx-auto relative shadow-2xl">
                {(() => {
                  const selected = reels[selectedVideo];

                  if (!selected || !selected.type) {
                    //console.warn('Video metadata missing or invalid:', selected);

                    return (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-600">
                        ⚠️ Video unavailable — metadata error.
                      </div>
                    );
                  }

                  if (selected.type === 'mp4') {
                    //console.log('Rendering MP4:', selected.videoSrc);

                    return (
                      <>
                        <span className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          MP4
                        </span>

                        <video
                          ref={videoRef}
                          key={selected.videoSrc}
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          autoPlay
                          muted
                        >
                          <source src={selected.videoSrc} type="video/mp4" />
                        </video>
                      </>
                    );
                  }

                  if (selected.type === 'youtube') {
                    //console.log('Rendering iframe:', selected.videoSrc);

                    return (
                      <iframe
                        key={selected.videoSrc}
                        src={selected.videoSrc}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 0 }}
                      />
                    );
                  }

                  //console.error('Unknown video type:', selected.type);

                  return (
                    <div className="flex items-center justify-center w-full h-full bg-red-50 text-red-600">
                      ⚠️ Unsupported video type: {selected.type}
                    </div>
                  );
                })()}

              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <p className="text-white font-bold text-lg">{reels[selectedVideo].title}</p>
                <p className="text-white/70 text-sm">{reels[selectedVideo].platform}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              See Flora Bella In Action
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Watch exactly how we mix and apply Flora Bella in real gardens. Select a video below to switch views.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {reels.slice(0, 4).map((reel, index) => {
                // If this is the one playing, don't render it in the selection grid
                //if (index === selectedVideo) return null;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedVideo(index)}
                    className={`${selectedVideo === index
                      ? 'border-2 border-purple-600 scale-105 neon-pulse'
                      : 'border-2 border-black-400 hover:scale-105'
                    } bg-white rounded-2xl overflow-hidden aspect-[9/16] relative group cursor-pointer transition-all duration-300 shadow`}
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
                      <p className="text-white text-[10px] font-semibold mb-1 truncate">{reel.title}</p>
                      <p className="text-white/60 text-[8px] flex items-center gap-1">
                        <Instagram className="w-2 h-2" />
                        {reel.platform}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* <button className="bg-white border-2 border-[#7cb342] px-8 py-4 rounded-full font-semibold hover:bg-[#7cb342]/10 transition-all flex items-center gap-2 text-gray-900 shadow">
              <Instagram className="w-5 h-5 text-[#7cb342]" />
              View more on Instagram
              <ArrowRight className="w-5 h-5" />
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
}