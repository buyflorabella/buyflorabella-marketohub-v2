import { X, AlertCircle, CreditCard, Mail, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderFailedNotificationProps {
  onClose: () => void;
  errorType?: 'payment' | 'card' | 'network' | 'inventory' | 'general';
  errorMessage?: string;
}

export default function OrderFailedNotification({
  onClose,
  errorType = 'general',
  errorMessage = 'Your order could not be processed.',
}: OrderFailedNotificationProps) {
  const getErrorDetails = () => {
    switch (errorType) {
      case 'payment':
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please check your payment details and try again.',
          actions: [
            { label: 'Update Payment Method', link: '/checkout', primary: true },
            { label: 'Try Again', link: '/checkout', primary: false },
          ],
        };
      case 'card':
        return {
          title: 'Card Declined',
          message: 'Your card was declined. Please check your card details or try a different payment method.',
          actions: [
            { label: 'Update Card', link: '/checkout', primary: true },
            { label: 'Use Different Card', link: '/checkout', primary: false },
          ],
        };
      case 'network':
        return {
          title: 'Connection Error',
          message: 'We lost connection while processing your order. Please check your internet connection and try again.',
          actions: [
            { label: 'Try Again', link: '/checkout', primary: true },
          ],
        };
      case 'inventory':
        return {
          title: 'Item Unavailable',
          message: 'One or more items in your cart are no longer available. Please review your cart and try again.',
          actions: [
            { label: 'Review Cart', link: '/shop', primary: true },
          ],
        };
      default:
        return {
          title: 'Order Failed',
          message: errorMessage || 'Your order could not be processed. Please try again or contact support.',
          actions: [
            { label: 'Try Again', link: '/checkout', primary: true },
            { label: 'Contact Support', link: '/contact', primary: false },
          ],
        };
    }
  };

  const details = getErrorDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#0a0015] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {details.title}
          </h2>

          <p className="text-white/70 text-center mb-8">
            {details.message}
          </p>

          <div className="space-y-3">
            {details.actions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                onClick={onClose}
                className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 hover:scale-105 ${
                  action.primary
                    ? 'bg-[#7cb342] hover:bg-[#8bc34a] text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-white/60 text-sm text-center mb-4">
              Common Solutions
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-white/70 text-sm">
                <CreditCard className="w-4 h-4 text-[#7cb342] flex-shrink-0 mt-0.5" />
                <span>Verify your card details and billing address</span>
              </div>
              <div className="flex items-start gap-3 text-white/70 text-sm">
                <HelpCircle className="w-4 h-4 text-[#7cb342] flex-shrink-0 mt-0.5" />
                <span>Check that you have sufficient funds</span>
              </div>
              <div className="flex items-start gap-3 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-[#7cb342] flex-shrink-0 mt-0.5" />
                <span>Contact your bank if the problem persists</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/contact"
              onClick={onClose}
              className="text-[#7cb342] hover:text-[#8bc34a] text-sm font-semibold transition-colors"
            >
              Need help? Contact our support team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
