import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="w-full gradient-green py-2 px-4 fixed top-0 z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <ChevronLeft className="w-4 h-4 text-white opacity-60 cursor-pointer hover:opacity-100 hover:scale-125 hover:-translate-x-1 transition-all duration-300" />
        <p className="text-white font-medium text-sm text-center flex-1 animate-pulse">
          New growers save ten percent with code <span className="font-bold px-2 py-0.5 bg-white/20 rounded hover:bg-white/30 transition-colors cursor-pointer">GETTEN</span>
        </p>
        <ChevronRight className="w-4 h-4 text-white opacity-60 cursor-pointer hover:opacity-100 hover:scale-125 hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  );
}
