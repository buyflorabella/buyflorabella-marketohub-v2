import { useState } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar';

interface GalleryImage {
  id: number;
  url: string;
  caption: string;
  author: string;
  likes: number;
}

export default function CommunityPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
 const galleryImages: GalleryImage[] = [
    {
      id: 1,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_1.jpg?v=1770056143',
      caption: 'Raised Bed Growth in Progress',
      author: 'Sarah M.',
      likes: 142
    },
    {
      id: 2,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_2.jpg?v=1770056141',
      caption: 'Flowering Vines During the Growing Season',
      author: 'John D.',
      likes: 98
    },
    {
      id: 3,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_3.jpg?v=1770056140',
      caption: 'New Root Growth Emerging',
      author: 'Emily R.',
      likes: 215
    },
    {
      id: 4,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_4.jpg?v=1770056135',
      caption: 'Vegetable Raised Beds in Active Growth',
      author: 'Mike T.',
      likes: 167
    },
    {
      id: 5,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_5.jpg?v=1770056134',
      caption: 'Dense Leaf Development in Garden Beds',
      author: 'Lisa K.',
      likes: 189
    },
    {
      id: 6,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_6.jpg?v=1770056143',
      caption: 'Heavy Tomato Production',
      author: 'David W.',
      likes: 134
    },
    {
      id: 7,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_7.jpg?v=1770056135',
      caption: 'Trellis Support Established Early',
      author: 'Anna S.',
      likes: 201
    },
    {
      id: 8,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_8.jpg?v=1770056134',
      caption: 'Tomato Plants in Vigorous Growth Phase',
      author: 'Chris B.',
      likes: 156
    },
    {
      id: 9,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_9.jpg?v=1770056135',
      caption: 'Soil Layers in an Established Garden Plot',
      author: 'Rachel P.',
      likes: 178
    },
    {
      id: 10,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_10.jpg?v=1770056134',
      caption: 'Early Sprout Emergence',
      author: 'Tom H.',
      likes: 143
    },
    {
      id: 11,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_11.jpg?v=1770056142',
      caption: 'Strong Root Development in Cacti',
      author: 'Grace L.',
      likes: 192
    },
    {
      id: 12,
      url: 'https://cdn.shopify.com/s/files/1/0640/4833/2903/files/Community_-_Square_Image_12.jpg?v=1770056143',
      caption: 'Winter Root Activity Observed',
      author: 'Mark F.',
      likes: 121
    }
  ];


  return (
    <>
      <AnnouncementBar />
      <div className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124, 179, 66, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124, 179, 66, 0.08) 0%, transparent 50%)',
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#7cb342]/10 border border-[#7cb342]/30 px-4 py-2 rounded-full mb-6">
              <span className="text-[#7cb342] font-semibold text-sm tracking-wide">OUR COMMUNITY</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 heading-font">
              Growing Together
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Join thousands of organic gardeners and farmers who are transforming their results with Flora Bella. Share your journey, inspire others, and celebrate together.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-lg rounded-3xl p-8 mb-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#7cb342] mb-2">50+</div>
                <div className="text-gray-600 font-semibold">Years in Use</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#7cb342] mb-2">+10,000</div>
                <div className="text-gray-600 font-semibold">Farms</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#7cb342] mb-2">+1M</div>
                <div className="text-gray-600 font-semibold">Acres</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Gallery</h2>
            <p className="text-gray-600 text-lg">
              Real stories. <b>Real results.</b>  From our amazing community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-sm mb-2 line-clamp-2">
                        {image.caption}
                      </p>
                      <div className="flex items-center justify-between text-white/90 text-xs">
                        <span>by {image.author}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current" />
                          <span>{image.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-[#7cb342] to-[#8bc34a] rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Share Your Journey</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Inspire others by sharing your wellness transformation with Flora Bella. Tag us on social media or submit your story directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-[#7cb342] rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Submit Your Story
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:bg-white/20">
                Join the Community
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-[#7cb342] transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="bg-white rounded-2xl p-6 mt-4">
              <p className="text-gray-900 font-semibold text-lg mb-3">
                {selectedImage.caption}
              </p>
              <div className="flex items-center justify-between text-gray-600">
                <span>by {selectedImage.author}</span>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 hover:text-[#7cb342] transition-colors">
                    <Heart className="w-5 h-5" />
                    <span>{selectedImage.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-[#7cb342] transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
