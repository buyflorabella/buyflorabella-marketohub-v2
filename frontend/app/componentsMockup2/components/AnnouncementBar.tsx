import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEnv } from '../contexts/EnvContext'; // adjust path if needed

export default function AnnouncementBar() {
  const { announcementBarEnabled, announcementBarCoupon, announcementBarMessage } = useEnv();

  // Hide the bar if disabled
  if (!announcementBarEnabled) return null;
  
  return (
    <div className="w-full gradient-green py-2 px-4 fixed top-0 z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <ChevronLeft className="w-4 h-4 text-white opacity-60 cursor-pointer hover:opacity-100 hover:scale-125 hover:-translate-x-1 transition-all duration-300" />

        <p className="text-white font-medium text-sm text-center flex-1 animate-pulse">
          {announcementBarMessage
            ? announcementBarMessage
            : announcementBarCoupon
            ? "Enter Coupon to save:"
            : ""}

          {announcementBarCoupon && (
            <>
              {' '}
              <span className="font-bold px-2 py-0.5 bg-white/20 rounded hover:bg-white/30 transition-colors cursor-pointer">
                {announcementBarCoupon}
              </span>
            </>
          )}
        </p>

        <ChevronRight className="w-4 h-4 text-white opacity-60 cursor-pointer hover:opacity-100 hover:scale-125 hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  );
}
