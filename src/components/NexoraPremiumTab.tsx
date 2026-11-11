import React, { useState } from 'react';
import {
  Crown,
  Target,
  Zap,
  Sparkles,
  Repeat,
  Lock,
  ChevronDown,
  Play,
  RotateCcw,
  List,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { BotConfig, StrategyPremiumType, TradingStats, TradeRecord } from '../types';
import { MarketSelectModal, ALL_VOLATILITY_MARKETS } from './MarketSelectModal';

interface NexoraPremiumTabProps {
  config: BotConfig;
  onChangeConfig: (newConfig: Partial<BotConfig>) => void;
  onRunBot: () => void;
  stats: TradingStats;
  trades: TradeRecord[];
  onResetTrades: () => void;
  onViewTransactionsScreen?: () => void;
  onNavigateToPricing?: () => void;
}

export const NexoraPremiumTab: React.FC<NexoraPremiumTabProps> = ({
  config,
  onChangeConfig,
  onRunBot,
  stats,
  trades,
  onResetTrades,
  onViewTransactionsScreen,
  onNavigateToPricing,
}) => {
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);

  const premiumStrategies: {
    id: StrategyPremiumType;
    name: string;
    tag: string;
    desc: string;
    icon: any;
  }[] = [
    {
      id: 'matches_printer',
      name: 'Matches Printer',
      tag: 'ALPHA',
      desc: 'Smart matches for consistent hits',
      icon: Target,
    },
    {
      id: 'over_8_killer',
      name: 'Over 8 Killer',
      tag: 'QUANTUM',
      desc: 'High-accuracy Over 8 sniper',
      icon: Zap,
    },
    {
      id: 'tickstrike_pro',
      name: 'TickStrike Pro',
      tag: 'APEX',
      desc: 'High-speed tick momentum plays',
      icon: Sparkles,
    },
    {
      id: 'auto_switcher',
      name: 'Auto Switcher',
      tag: 'APEX',
      desc: 'Auto-switches Ups/Downs to stay safe',
      icon: Repeat,
    },
  ];

  const currentStrat = premiumStrategies.find((s) => s.id === config.strategy) || premiumStrategies[0];

  const formatDate = (d: Date) => {
    const date = new Date(d);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${month}, ${time}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white space-y-4">
      {/* 1. Header matching video 01:19 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Crown className="w-6 h-6 text-amber-400 stroke-[2.2]" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Nexora AI Premium
            </h1>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase">
              DEMO &amp; REAL
            </span>
            <span className="text-xs text-gray-400 font-medium">
              All 4 Premium strategies unlocked for Free
            </span>
          </div>
        </div>

        {/* Free Unlocked badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-400 text-emerald-300">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
          <span>100% Free Unlocked</span>
        </div>
      </div>

      {/* 2. Bot Strategy (4 cards in 2x2 grid) */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Bot strategy
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {premiumStrategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = config.strategy === strat.id;

            return (
              <button
                key={strat.id}
                onClick={() => onChangeConfig({ strategy: strat.id })}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-[#152336] border-2 border-amber-400 text-white shadow-md'
                    : 'bg-[#0E1524] border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-gray-400'}`} />
                  <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-mono font-bold">
                    {strat.tag}
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate">{strat.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                  {strat.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Market Dropdown */}
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

      {/* 4. Risk Level Selector (Low, Medium, High) */}
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
                    ? 'bg-[#152336] border-2 border-amber-400 text-amber-300 shadow-sm'
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

      {/* 5. Stake, Profit target, Max loss inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Stake per trade
          </label>
          <div className="relative">
            <input
              id="stake"
              type="number"
              min="0.35"
              step="0.5"
              value={config.stake}
              onChange={(e) => onChangeConfig({ stake: parseFloat(e.target.value) || 1 })}
              className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-400 pr-14"
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
              onChange={(e) => onChangeConfig({ profitTarget: parseFloat(e.target.value) || 20 })}
              className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-400 pr-14"
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
              className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-400 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
              USD
            </span>
          </div>
        </div>
      </div>

      {/* 5. Button: Run Premium Bot - 100% Free Unlocked */}
      <div className="pt-2">
        <button
          onClick={onRunBot}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-current stroke-none" />
          <span>Run Premium Bot</span>
        </button>
      </div>

      {/* Subscribe Popup Modal */}
      {showSubscribePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0E1524] border-2 border-amber-500/50 p-6 relative shadow-[0_0_35px_rgba(245,158,11,0.25)] text-center">
            <button
              onClick={() => setShowSubscribePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>

            <h3 className="text-lg font-black text-white">Unlock Nexora AI Premium</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Access all 4 elite Alpha/Apex strategies with 90%+ high-win Markov prediction models.
            </p>

            <div className="space-y-2 mb-5 text-left text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-gray-900/60 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Monthly Subscription</div>
                  <div className="text-[10px] text-gray-400">Cancel anytime</div>
                </div>
                <div className="font-black text-amber-400">$100 / mo</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-300">Lifetime Pass (Best Value)</div>
                  <div className="text-[10px] text-gray-400">One-time payment</div>
                </div>
                <div className="font-black text-amber-400">$250 / life</div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsUnlocked(true);
                setShowSubscribePopup(false);
              }}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-sm shadow-md hover:from-amber-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 fill-current stroke-none" />
              <span>Unlock Access Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. In-Page Transactions */}
      <div className="pt-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Transactions</h3>
            {trades.length > 0 && onViewTransactionsScreen && (
              <button
                onClick={onViewTransactionsScreen}
                className="text-[11px] text-amber-400 hover:underline"
              >
                View Live Screen
              </button>
            )}
          </div>
          <button
            onClick={onResetTrades}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1524] border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

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
