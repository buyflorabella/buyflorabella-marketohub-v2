import { X } from 'lucide-react';
import { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number; // Auto-close after this many ms (optional)
  type?: 'success' | 'info' | 'error';
}

export default function Toast({ message, onClose, duration = 3000, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-[#7cb342]',
    info: 'bg-blue-500',
    error: 'bg-red-500',
  }[type];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Toast */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] animate-scale-in">
        <div className={`${bgColor} text-white rounded-2xl shadow-2xl p-6 min-w-[300px] max-w-md border-2 border-white/20`}>
          <div className="flex items-start justify-between gap-4">
            <p className="text-white font-medium leading-relaxed">
              {message}
            </p>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-all duration-300 hover:rotate-90"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}