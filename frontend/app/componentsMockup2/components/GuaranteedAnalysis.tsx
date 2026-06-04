import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function GuaranteedAnalysis() {
  const [isOpen, setIsOpen] = useState(false);

  const analysis = [
    { element: 'Calcium', symbol: 'Ca', percentage: '1.40%' },
    { element: 'Magnesium', symbol: 'Mg', percentage: '1.40%' },
    { element: 'Sulfur', symbol: 'S', percentage: '3.65%' },
    { element: 'Boron', symbol: 'B', percentage: '0.02%' },
    { element: 'Cobalt', symbol: 'Co', percentage: '0.0028%' },
    { element: 'Copper', symbol: 'Cu', percentage: '0.25%' },
    { element: 'Iron', symbol: 'Fe', percentage: '2.50%' },
    { element: 'Manganese', symbol: 'Mn', percentage: '0.24%' },
    { element: 'Molybdenum', symbol: 'Mo', percentage: '0.0005%' },
    { element: 'Zinc', symbol: 'Zn', percentage: '0.48%' },
  ];

  return (
    <div className="max-w-2xl mx-auto mb-16">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Collapsible Header Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#7cb342] to-[#8bc34a] hover:from-[#8bc34a] hover:to-[#7cb342] transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">%</span>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white heading-font">
                Guaranteed Analysis
              </h3>
              <p className="text-white/80 text-xs">
                View mineral percentages
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-6 animate-fade-in">
            <div className="grid gap-2">
              {analysis.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#7cb342]/10 group-hover:bg-[#7cb342]/20 rounded flex items-center justify-center transition-colors">
                      <span className="text-sm font-bold text-[#7cb342] heading-font">
                        {item.symbol}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {item.element}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#7cb342] heading-font">
                    {item.percentage}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 text-center">
                Minimum percentages by weight • Lab tested
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}