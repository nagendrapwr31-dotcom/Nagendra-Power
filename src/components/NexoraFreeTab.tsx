import React, { useState } from 'react';
import {
  TrendingUp,
  Hash,
  Shuffle,
  Brain,
  ChevronDown,
  Layers,
  Play,
  RotateCcw,
  List,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from 'lucide-react';
import { BotConfig, StrategyFreeType, TradingStats, TradeRecord } from '../types';
import { MarketSelectModal, ALL_VOLATILITY_MARKETS } from './MarketSelectModal';

interface NexoraFreeTabProps {
  config: BotConfig;
  onChangeConfig: (newConfig: Partial<BotConfig>) => void;
  onRunBot: () => void;
  stats: TradingStats;
  trades: TradeRecord[];
  onResetTrades: () => void;
  onViewTransactionsScreen?: () => void;
  isRealAccount?: boolean;
}

export const NexoraFreeTab: React.FC<NexoraFreeTabProps> = ({
  config,
  onChangeConfig,
  onRunBot,
  stats,
  trades,
  onResetTrades,
  onViewTransactionsScreen,
  isRealAccount = false,
}) => {
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [smartAiEnabled, setSmartAiEnabled] = useState(true);

  const strategies: { id: StrategyFreeType; label: string; icon: any }[] = [
    { id: 'rise_fall', label: 'Rise / Fall', icon: TrendingUp },
    { id: 'even_odd', label: 'Even / Odd', icon: Hash },
    { id: 'mix_both', label: 'Mix Both', icon: Shuffle },
    { id: 'smart_ai', label: 'Smart AI', icon: Brain },
  ];

  const formatUsd = (val: number, showPlus: boolean = false) => {
    const formatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (val > 0) return `${showPlus ? '+' : ''}${formatted} USD`;
    if (val < 0) return `-${formatted} USD`;
    return `${showPlus ? '+' : ''}0.00 USD`;
  };

  const formatDate = (d: Date) => {
    const date = new Date(d);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${month}, ${time}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white space-y-4">
      {/* 1. Header matching video 00:55 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-6 h-6 text-purple-400 stroke-[2.2]" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Nexora AI
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-extrabold uppercase">
              FREE TIER
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase">
              DEMO &amp; REAL ACCOUNTS
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Automated Markov trading engine for Demo &amp; Real
            </span>
          </div>
        </div>
      </div>

      {/* 2. Strategy Selector (4 Free strategies) */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Strategy
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = config.strategy === strat.id;

            return (
              <button
                key={strat.id}
                onClick={() => onChangeConfig({ strategy: strat.id })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#152336] border-2 border-sky-400 text-white shadow-sm'
                    : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-sky-400' : 'text-gray-400'}`} />
                <span className="truncate">{strat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended Smart AI Toggle Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black font-extrabold text-[9px] uppercase tracking-wide">
            Recommended
          </span>
          <span className="font-bold text-emerald-300 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5" />
            Smart AI
          </span>
        </div>

        {/* Toggle switch */}
        <button
          onClick={() => {
            const next = !smartAiEnabled;
            setSmartAiEnabled(next);
            if (next) onChangeConfig({ strategy: 'smart_ai' });
            else if (config.strategy === 'smart_ai') onChangeConfig({ strategy: 'mix_both' });
          }}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
            smartAiEnabled ? 'bg-emerald-500' : 'bg-gray-700'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              smartAiEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 4. Market Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Market
        </label>
        <button
          type="button"
          onClick={() => setMarketModalOpen(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0E1524] border border-gray-800 text-sm font-bold text-white hover:border-gray-700 transition-colors"
        >
          <span>{config.market || 'Volatility 100 (1s)'}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* 5. Risk Level Selector (Low, Medium, High) */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Risk level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Low', 'Medium', 'High'] as const).map((level) => {
            const isSelected = config.riskLevel === level;
            return (
              <button
                key={level}
                onClick={() => onChangeConfig({ riskLevel: level })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#152336] border-2 border-sky-400 text-sky-300 shadow-sm'
                    : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* Martingale indicator box below */}
        <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
          <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            {config.riskLevel === 'Low'
              ? 'Flat stake - no martingale'
              : config.riskLevel === 'High'
              ? 'Martingale x2 on loss (capped at 3 steps)'
              : 'Martingale x1.6 on loss (capped at 2 steps)'}
          </span>
        </div>
      </div>

      {/* 6. Inputs: Stake per trade, Profit target, Max loss */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Stake per trade
          </label>
          <div className="relative">
            <input
              id="stake"
              type="number"
              step="0.5"
              min="0.35"
              value={config.stake}
              onChange={(e) => onChangeConfig({ stake: parseFloat(e.target.value) || 1 })}
              className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-sky-500 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
              USD
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Profit target
          </label>
          <div className="relative">
            <input
              id="profitTarget"
              type="number"
              min="1"
              value={config.profitTarget}
              onChange={(e) => onChangeConfig({ profitTarget: parseFloat(e.target.value) || 10 })}
              className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-sky-500 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
              USD
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Max loss
          </label>
          <div className="relative">
            <input
              id="maxLoss"
              type="number"
              min="1"
              value={config.maxLoss}
              onChange={(e) => onChangeConfig({ maxLoss: parseFloat(e.target.value) || 10 })}
              className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-sky-500 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
              USD
            </span>
          </div>
        </div>
      </div>

      {/* 7. Big Gradient Run Bot Button */}
      <div className="pt-2">
        <button
          onClick={onRunBot}
          className="w-full py-4 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-current stroke-none" />
          <span>Run Nexora AI</span>
        </button>
      </div>

      {/* 8. Transactions Section */}
      <div className="pt-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Transactions</h3>
            {trades.length > 0 && onViewTransactionsScreen && (
              <button
                onClick={onViewTransactionsScreen}
                className="text-[11px] text-sky-400 hover:underline"
              >
                View Live Screen
              </button>
            )}
          </div>
          <button
            onClick={onResetTrades}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1524] border border-gray-800 text-xs font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Empty State or Recent Trades Preview */}
        {trades.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-[#0E1524] border border-gray-800 p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#152336] border border-gray-700 flex items-center justify-center text-gray-400 mb-3">
              <List className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              No trades this session. Trades you place — manual or bot — appear here live.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {trades.slice(0, 3).map((trade, idx) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0E1524] border border-gray-800"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      trade.isWin
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {trade.isWin ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{trade.symbolName}</span>
                      {trade.lastDigit !== undefined && (
                        <span className="text-[10px] px-1 rounded bg-gray-800 text-gray-300 font-mono">
                          d:{trade.lastDigit}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {formatDate(trade.timestamp)} • Stake {trade.stake.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold font-mono ${
                      trade.isWin ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {trade.isWin ? `+${trade.profit.toFixed(2)}` : trade.profit.toFixed(2)}
                  </span>
                  {idx === 0 && trade.isWin && (
                    <span className="px-2 py-0.5 rounded-full border border-rose-300 bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                      ✕ Sell
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Selector Modal */}
      <MarketSelectModal
        isOpen={marketModalOpen}
        onClose={() => setMarketModalOpen(false)}
        selectedSymbol={config.marketSymbol || 'R_100'}
        onSelect={(selected) => {
          onChangeConfig({
            market: selected.label,
            marketSymbol: selected.symbol,
          });
        }}
      />
    </div>
  );
};
