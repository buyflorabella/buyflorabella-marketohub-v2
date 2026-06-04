import { useState } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';
import AnnouncementBar from '../components/AnnouncementBar';

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
      url: 'https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Morning wellness routine with Flora Bella',
      author: 'Sarah M.',
      likes: 142
    },
    {
      id: 2,
      url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Starting my day right with trace minerals',
      author: 'John D.',
      likes: 98
    },
    {
      id: 3,
      url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Fitness and minerals go hand in hand',
      author: 'Emily R.',
      likes: 215
    },
    {
      id: 4,
      url: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Hydration and mineral balance',
      author: 'Mike T.',
      likes: 167
    },
    {
      id: 5,
      url: 'https://images.pexels.com/photos/1282169/pexels-photo-1282169.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Nature and wellness combined',
      author: 'Lisa K.',
      likes: 189
    },
    {
      id: 6,
      url: 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'My essential daily supplements',
      author: 'David W.',
      likes: 134
    },
    {
      id: 7,
      url: 'https://images.pexels.com/photos/1478691/pexels-photo-1478691.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Yoga and mineral nutrition',
      author: 'Anna S.',
      likes: 201
    },
    {
      id: 8,
      url: 'https://images.pexels.com/photos/3768582/pexels-photo-3768582.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Healthy habits for a better life',
      author: 'Chris B.',
      likes: 156
    },
    {
      id: 9,
      url: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Post-workout recovery essentials',
      author: 'Rachel P.',
      likes: 178
    },
    {
      id: 10,
      url: 'https://images.pexels.com/photos/3771111/pexels-photo-3771111.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Mindful living with Flora Bella',
      author: 'Tom H.',
      likes: 143
    },
    {
      id: 11,
      url: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Natural wellness journey',
      author: 'Grace L.',
      likes: 192
    },
    {
      id: 12,
      url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: 'Daily dose of minerals',
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
              Join thousands of health enthusiasts who are transforming their gardens with Flora Bella. Share your journey, inspire others, and celebrate wellness together.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-lg rounded-3xl p-8 mb-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#7cb342] mb-2">50+</div>
                <div className="text-gray-600 font-semibold">Years in Use</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#7cb342] mb-2">10,000+</div>
                <div className="text-gray-600 font-semibold">Forms</div>
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
              Real stories, real results from our amazing community members
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
              Inspire others by sharing your soil's transformation with Flora Bella. Tag us on social media or submit your story directly.
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
