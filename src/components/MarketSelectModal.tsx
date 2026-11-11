import React from 'react';
import { X } from 'lucide-react';

export interface MarketOption {
  label: string;
  symbol: string;
  price?: number;
}

/**
 * Valid Deriv API Symbols:
 * ["R_10","R_25","R_50","R_75","R_100","1HZ10V","1HZ25V","1HZ50V","1HZ75V","1HZ100V","1HZ150V","1HZ200V","1HZ250V","1HZ300V"]
 * Maps display names to valid Deriv API symbols: e.g. "Volatility 100" => "R_100"
 */
export const ALL_VOLATILITY_MARKETS: MarketOption[] = [
  { label: 'Volatility 100 Index', symbol: 'R_100', price: 1845.22 },
  { label: 'Volatility 75 Index', symbol: 'R_75', price: 348210.45 },
  { label: 'Volatility 50 Index', symbol: 'R_50', price: 245.82 },
  { label: 'Volatility 25 Index', symbol: 'R_25', price: 6812.30 },
  { label: 'Volatility 10 Index', symbol: 'R_10', price: 1882.79 },
  { label: 'Volatility 100 (1s)', symbol: '1HZ100V', price: 1252.91 },
  { label: 'Volatility 75 (1s)', symbol: '1HZ75V', price: 348210.45 },
  { label: 'Volatility 50 (1s)', symbol: '1HZ50V', price: 245.82 },
  { label: 'Volatility 25 (1s)', symbol: '1HZ25V', price: 6812.30 },
  { label: 'Volatility 10 (1s)', symbol: '1HZ10V', price: 1882.79 },
  { label: 'Volatility 150 (1s)', symbol: '1HZ150V', price: 820.45 },
  { label: 'Volatility 200 (1s)', symbol: '1HZ200V', price: 1420.10 },
  { label: 'Volatility 250 (1s)', symbol: '1HZ250V', price: 2150.80 },
  { label: 'Volatility 300 (1s)', symbol: '1HZ300V', price: 3200.50 },
];

interface MarketSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: string;
  onSelect: (market: MarketOption) => void;
}

export const MarketSelectModal: React.FC<MarketSelectModalProps> = ({
  isOpen,
  onClose,
  selectedSymbol,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#141A29] border border-gray-700/80 p-5 text-white shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-base font-bold text-white">Select Volatility Index</h3>
            <p className="text-[11px] text-cyan-400 font-mono mt-0.5">Valid Deriv API Symbols</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market List */}
        <div className="overflow-y-auto py-2 space-y-1 divide-y divide-gray-800/40">
          {ALL_VOLATILITY_MARKETS.map((market, idx) => {
            const isSelected = selectedSymbol === market.symbol;

            return (
              <button
                key={`${market.symbol}_${idx}`}
                onClick={() => {
                  onSelect(market);
                  onClose();
                }}
                className={`w-full flex items-center justify-between py-3 px-3 rounded-xl text-left transition-colors ${
                  isSelected
                    ? 'bg-sky-500/15 text-white'
                    : 'text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{market.label}</span>
                  <span className="text-[10px] font-mono text-cyan-400">API: {market.symbol}</span>
                </div>

                {/* Radio button circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-sky-400 bg-sky-500 text-white'
                      : 'border-gray-500 bg-transparent'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
