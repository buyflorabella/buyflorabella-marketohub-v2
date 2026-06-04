import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useEnv } from '../contexts/EnvContext';

export default function WhatsAppWidget() {
  const { flags } = useFeatureFlags();
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = '1234567890';
  const defaultMessage = 'Hi! I have a question about Flora Bella Trace Minerals.';
  const { whatsappGroupUrl, whatsappGroupName, whatsappLinkDescription } = useEnv();

  if (!flags.whatsappWidget) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(defaultMessage);
    //window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    window.open(`${whatsappGroupUrl}`, '_blank');
  };

  return (
    <>
      <div className="z-[9998] flex flex-col items-end gap-4">
        {isOpen && (
          <div className="bg-white border-2 border-[#7cb342] rounded-2xl shadow-2xl p-6 max-w-sm animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Flora Bella Support</h3>
                  <p className="text-xs text-gray-500">Typically replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f5f5f0] rounded-xl p-4 mb-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Welcome to {whatsappGroupName || "Flora Bella!"}</strong>
              </p>
              <p className="text-xs text-gray-600">
                {whatsappLinkDescription || "Have questions about our trace minerals? Our support team is here to help you with:"}
              </p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>• Product information</li>
                <li>• Order assistance</li>
                <li>• Usage guidance</li>
                <li>• General inquiries</li>
              </ul>
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0F7A6B] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Start Chat on WhatsApp
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-3">
              Click to open WhatsApp
            </p>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0F7A6B] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="WhatsApp Support"
        >
          {isOpen ? (
            <X className="w-7 h-7 animate-spin-slow" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9997] bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
