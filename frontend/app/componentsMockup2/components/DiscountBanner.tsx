import { Tag, X } from 'lucide-react';
import { useState } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

interface DiscountBannerProps {
  code?: string;
  message?: string;
  percentage?: number;
  expiresAt?: string;
}

export default function DiscountBanner({
  code = 'WELCOME15',
  message = 'Get 15% off your first order!',
  percentage = 15,
  expiresAt,
}: DiscountBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { flags } = useFeatureFlags();

  if (!flags.discountDisplay || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#7cb342] to-[#558b2f] text-white py-3 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-sm md:text-base">{message}</span>
            <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold">
              {code}
            </span>
          </div>
        </div>
        {expiresAt && (
          <div className="hidden sm:block text-xs text-white/80">
            Expires: {new Date(expiresAt).toISOString()}
          </div>
        )}
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
