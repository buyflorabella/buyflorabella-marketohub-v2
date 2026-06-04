import { Percent } from 'lucide-react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

interface DiscountBoxProps {
  percentage: number;
  minPurchase?: number;
  code: string;
  description: string;
}

export default function DiscountBox({ percentage, minPurchase, code, description }: DiscountBoxProps) {
  const { flags } = useFeatureFlags();

  if (!flags.discountDisplay) {
    return null;
  }

  return (
    <div className="glass border border-[#7cb342]/30 rounded-2xl p-6 hover:border-[#7cb342] transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-[#7cb342]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Percent className="w-8 h-8 text-[#7cb342]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{percentage}% OFF</span>
            {minPurchase && (
              <span className="text-white/60 text-sm">on ${minPurchase}+</span>
            )}
          </div>
          <p className="text-white/70 text-sm mb-3">{description}</p>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-[#7cb342] font-mono font-bold text-sm">
              {code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
              }}
              className="px-3 py-1.5 bg-[#7cb342]/20 hover:bg-[#7cb342]/30 text-[#7cb342] rounded-lg text-xs font-semibold transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
