import { useState, useEffect } from 'react';
import { Settings, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

export default function TestingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { flags, updateFlag, resetFlags } = useFeatureFlags();

  // DxB persist visibility across page loads with localStorate
  //const [isVisible, setIsVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false; // SSR safety
    return localStorage.getItem("testingWidgetVisible") === "true";
  });

  // const [isVisible, setIsVisible] = useState(
  //   () => localStorage.getItem("testingWidgetVisible") === "true"
  // );
  useEffect(() => {
    const isVisible = localStorage.getItem("testingWidgetVisible");

    //console.log("Get visibility: " + isVisible);
    setIsVisible(isVisible === "true");
  }, []);

  useEffect(() => {
    //console.log("Set visibility: " + isVisible);

    localStorage.setItem("testingWidgetVisible", String(isVisible));
  }, [isVisible]);

  useEffect(() => {
   const handleKeyDown = (event: KeyboardEvent) => {
    // Check for Ctrl + Shift + D (or Cmd + Shift + D for Mac)
    if (event.ctrlKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      setIsVisible(!isVisible);
    }
  };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  if (!isVisible) {
    return <></>
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="z-50 w-14 h-14 bg-gradient-to-br from-[#7cb342] to-[#558b2f] hover:from-[#8bc34a] hover:to-[#689f38] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        title="Open Testing Widget"
      >
        <Settings className="w-6 h-6 animate-spin-slow" />
      </button>
    );
  }

  return (
    <div className="z-50 w-80 bg-gradient-to-br from-[#1a1a2e] to-[#0a0015] border-2 border-[#7cb342]/50 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#7cb342] to-[#558b2f] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">Feature Testing</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-white font-semibold text-sm">Bookmark Icon</div>
            <div className="text-white/60 text-xs">Article save feature</div>
          </div>
          <button
            onClick={() => updateFlag('bookmarkIcon', !flags.bookmarkIcon)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              flags.bookmarkIcon ? 'bg-[#7cb342]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                flags.bookmarkIcon ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">Abandoned Cart Popup</div>
              <div className="text-white/60 text-xs">Cart reminder system</div>
            </div>
            <button
              onClick={() => updateFlag('abandonedCartPopup', !flags.abandonedCartPopup)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                flags.abandonedCartPopup ? 'bg-[#7cb342]' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  flags.abandonedCartPopup ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {flags.abandonedCartPopup && (
            <div className="pl-2 space-y-2">
              <div className="text-white/60 text-xs mb-2">Trigger Type:</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="abandonedCartTrigger"
                  checked={flags.abandonedCartTrigger === 'exit'}
                  onChange={() => updateFlag('abandonedCartTrigger', 'exit')}
                  className="text-[#7cb342]"
                />
                <span className="text-white/80 text-sm">Exit Intent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="abandonedCartTrigger"
                  checked={flags.abandonedCartTrigger === 'tab-switch'}
                  onChange={() => updateFlag('abandonedCartTrigger', 'tab-switch')}
                  className="text-[#7cb342]"
                />
                <span className="text-white/80 text-sm">Tab Switch</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-white font-semibold text-sm">Discount Display</div>
            <div className="text-white/60 text-xs">Show discount banners</div>
          </div>
          <button
            onClick={() => updateFlag('discountDisplay', !flags.discountDisplay)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              flags.discountDisplay ? 'bg-[#7cb342]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                flags.discountDisplay ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-white font-semibold text-sm">Wishlist Icon</div>
            <div className="text-white/60 text-xs">Product heart icon</div>
          </div>
          <button
            onClick={() => updateFlag('wishlistIcon', !flags.wishlistIcon)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              flags.wishlistIcon ? 'bg-[#7cb342]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                flags.wishlistIcon ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-white font-semibold text-sm">WhatsApp Widget</div>
            <div className="text-white/60 text-xs">Chat support button</div>
          </div>
          <button
            onClick={() => updateFlag('whatsappWidget', !flags.whatsappWidget)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              flags.whatsappWidget ? 'bg-[#7cb342]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                flags.whatsappWidget ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-white font-semibold text-sm">Survey Popup</div>
            <div className="text-white/60 text-xs">Customer feedback survey</div>
          </div>
          <button
            onClick={() => updateFlag('surveyPopup', !flags.surveyPopup)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              flags.surveyPopup ? 'bg-[#7cb342]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                flags.surveyPopup ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={resetFlags}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-white/20"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>

        <div className="text-white/40 text-xs text-center pt-2 border-t border-white/10">
          Settings persist in localStorage
        </div>
      </div>
    </div>
  );
}
