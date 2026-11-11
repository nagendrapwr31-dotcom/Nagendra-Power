import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Settings,
  ChevronDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TradeRecord, TradingStats, OpenAccuContract } from '../types';
import { MarketSelectModal, ALL_VOLATILITY_MARKETS } from './MarketSelectModal';
import { derivWs } from '../services/derivWs';

interface ManualTradingTabProps {
  onPlaceManualTrade: (type: string, barrier?: number, stake?: number) => void;
  trades: TradeRecord[];
  stats: TradingStats;
  onResetTrades: () => void;
  currentTick?: { quote: number; digit: number };
  recentDigits: number[];
}

export const ManualTradingTab: React.FC<ManualTradingTabProps> = ({
  onPlaceManualTrade,
  trades,
  stats,
  onResetTrades,
  currentTick,
  recentDigits,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rise_fall' | 'accumulators' | 'multipliers'>('accumulators');
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('Volatility 100 Index');
  const [selectedSymbol, setSelectedSymbol] = useState('R_100');
  const [direction, setDirection] = useState<'rise' | 'fall'>('rise');
  const [stake, setStake] = useState<number>(2);
  const [allowEquals, setAllowEquals] = useState(false);
  const duration = '5 minutes';

  // Accumulator specific state
  const [accuStake, setAccuStake] = useState<number>(87);
  const [growthRate, setGrowthRate] = useState<number>(2); // 2% growth rate -> 80% win rate
  const [openAccu, setOpenAccu] = useState<OpenAccuContract | null>(null);

  // Multiplier specific state
  const [multiplier, setMultiplier] = useState<number>(50);

  // Subscribe to live open contract from Deriv WebSocket
  useEffect(() => {
    const unsub = derivWs.subscribeOpenContract((contract) => {
      if (contract && !contract.is_sold) {
        setOpenAccu({
          contract_id: contract.contract_id,
          contract_type: contract.contract_type || 'ACCU',
          symbol: contract.symbol || selectedSymbol,
          buy_price: Number(contract.buy_price) || accuStake,
          bid_price: Number(contract.bid_price) || accuStake,
          profit: Number(contract.profit) || 0,
          tick_count: Number(contract.tick_count) || 0,
          growth_rate: Number(contract.growth_rate) || growthRate,
          is_sold: 0,
        });
      } else {
        setOpenAccu(null);
      }
    });

    return () => unsub();
  }, [accuStake, growthRate, selectedSymbol]);

  const calculatedPayout = (stake * 1.95).toFixed(2);

  const handleBuyRiseFall = () => {
    const contractType = direction === 'rise' ? 'CALL' : 'PUT';
    onPlaceManualTrade(contractType, undefined, stake);
  };

  const handleOpenAccumulator = () => {
    derivWs.buyAccumulator({
      stake: accuStake,
      symbol: selectedSymbol,
      growthRate: growthRate,
      targetProfit: 210.95,
    });
  };

  const handleSellAccumulator = () => {
    if (openAccu) {
      derivWs.sellContract(openAccu.contract_id);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white space-y-4">
      {/* 1. Sub Tabs matching video 00:50 */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('accumulators')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'accumulators'
              ? 'bg-[#152336] text-white border border-emerald-400 shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#0E1524]'
          }`}
        >
          <span>Accumulators</span>
          <span className="text-sm">🔥</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rise_fall')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'rise_fall'
              ? 'bg-[#152336] text-white border border-sky-400/50 shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#0E1524]'
          }`}
        >
          <span>Rise/Fall</span>
          <span className="text-sm">🔥</span>
        </button>

        <button
          onClick={() => setActiveSubTab('multipliers')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'multipliers'
              ? 'bg-[#152336] text-white border border-sky-400/50 shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#0E1524]'
          }`}
        >
          <span>Multipliers</span>
        </button>
      </div>

      {/* 2. Market Selector with Price and Settings icon */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E1524] border border-gray-800">
        <button
          type="button"
          onClick={() => setMarketModalOpen(true)}
          className="flex items-center gap-2 text-left"
        >
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="w-1 h-3 rounded-xs bg-red-400" />
          </div>

          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1">
              <span>{selectedMarket}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">
              {currentTick ? currentTick.quote.toFixed(2) : '1252.91'}{' '}
              <span className="text-emerald-400 text-[10px]">Deriv Real Ticks</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMarketModalOpen(true)}
          className="p-2 rounded-lg bg-gray-800/60 text-gray-400 hover:text-white transition-colors"
          title="Market settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ===================== TAB 1: ACCUMULATORS (ACCU) ===================== */}
      {activeSubTab === 'accumulators' && (
        <div className="space-y-3.5">
          {/* Active Open Accumulator Live Card */}
          {openAccu ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#06241E] to-[#0A1A24] border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.25)] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Live Accumulator Active
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  {openAccu.tick_count} Ticks Survived
                </span>
              </div>

              {/* Live values exact from video & photo */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/40 border border-emerald-500/30 text-center font-mono">
                <div>
                  <div className="text-[10px] text-gray-400">STAKE</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    ${openAccu.buy_price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">CURRENT VALUE</div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">
                    ${openAccu.bid_price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">LIVE PROFIT</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">
                    +{openAccu.profit.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Instant Sell / Take Profit Button */}
              <button
                onClick={handleSellAccumulator}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Close Contract & Take Profit</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/20 text-white font-bold">
                  +{openAccu.profit.toFixed(2)} USD
                </span>
              </button>
            </div>
          ) : (
            <>
              {/* Growth Rate Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center justify-between">
                  <span>Growth Rate</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    2% Rate = 80% Win Rate (10 trades 8 wins)
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setGrowthRate(rate)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        growthRate === rate
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                          : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {rate}%
                      {rate === 2 && (
                        <span className="block text-[9px] text-emerald-400 font-normal">Best</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stake input with quick-select buttons matching video ($87 USD) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center justify-between">
                  <span>Stake (USD)</span>
                  <span className="text-gray-400 font-mono text-[11px]">Owner preset: 87 USD</span>
                </label>
                <div className="relative mb-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={accuStake}
                    onChange={(e) => setAccuStake(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
                    USD
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 87, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAccuStake(amt)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${
                        accuStake === amt
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Projection Banner */}
              <div className="p-3 rounded-xl bg-[#0E1524] border border-emerald-500/20 text-xs flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-[11px]">Projected Win Payout</div>
                  <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                    Stake ${accuStake.toFixed(2)} → Value ${(accuStake * 3.424).toFixed(2)} (+${(accuStake * 2.424).toFixed(2)})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">Barrier Hit Loss</div>
                  <div className="text-red-400 font-mono font-bold text-xs">-${accuStake.toFixed(2)}</div>
                </div>
              </div>

              {/* Buy Accumulator Button */}
              <div className="pt-1">
                <button
                  onClick={handleOpenAccumulator}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base tracking-wide flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Trade Accumulator</span>
                  <span className="text-xs font-normal opacity-90 font-mono">
                    Stake ${accuStake.toFixed(2)} • 2% Growth • Deriv Real ACCU
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================== TAB 2: RISE / FALL ===================== */}
      {activeSubTab === 'rise_fall' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setDirection('rise')}
              className={`py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border ${
                direction === 'rise'
                  ? 'bg-emerald-600/30 border-2 border-emerald-400 text-emerald-300 shadow-md'
                  : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              <span>Rise</span>
            </button>

            <button
              onClick={() => setDirection('fall')}
              className={`py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border ${
                direction === 'fall'
                  ? 'bg-red-600/30 border-2 border-red-400 text-red-300 shadow-md'
                  : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
              <span>Fall</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Duration
              </label>
              <div className="p-3.5 rounded-xl bg-[#0E1524] border border-gray-800 text-sm font-bold text-white">
                {duration}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Stake
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.35"
                  step="1"
                  value={stake}
                  onChange={(e) => setStake(parseFloat(e.target.value) || 1)}
                  className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-sky-500 pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
                  USD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1524] border border-gray-800 text-xs">
              <span className="font-semibold text-gray-300">Allow equals</span>
              <button
                onClick={() => setAllowEquals(!allowEquals)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  allowEquals ? 'bg-sky-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    allowEquals ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleBuyRiseFall}
              className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base tracking-wide flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Buy</span>
              <span className="text-xs font-normal opacity-90 font-mono">
                Payout: {calculatedPayout} USD
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: MULTIPLIERS ===================== */}
      {activeSubTab === 'multipliers' && (
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Multiplier Factor
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[20, 50, 100, 200].map((m) => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                    multiplier === m
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-[#0E1524] border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  x{m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Stake
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#0E1524] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-sky-500 pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
                USD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => onPlaceManualTrade('MULTUP', undefined, stake)}
              className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Up (x{multiplier})</span>
            </button>
            <button
              onClick={() => onPlaceManualTrade('MULTDOWN', undefined, stake)}
              className="py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm text-white flex items-center justify-center gap-1.5"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Down (x{multiplier})</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Trades History Section */}
      <div className="pt-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Recent Trades</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
              Total P/L: {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(2)} USD
            </span>
          </h3>
          <button
            onClick={onResetTrades}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1524] border border-gray-800 text-xs text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {trades.length === 0 ? (
          <div className="mt-3 p-6 rounded-2xl bg-[#0E1524] border border-gray-800 text-center text-xs text-gray-400">
            No trades executed yet. Trade Accumulator or Rise/Fall to see live contract results.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {trades.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0E1524] border border-gray-800"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{t.symbolName}</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-black/40 text-gray-400">
                      {t.contractType}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Stake ${t.stake.toFixed(2)} • {t.isWin ? `Value $${(t.stake + t.profit).toFixed(2)}` : 'Barrier Hit'}
                  </div>
                </div>
                <div
                  className={`text-xs font-bold font-mono ${
                    t.isWin ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {t.isWin ? `+${t.profit.toFixed(2)} USD` : `${t.profit.toFixed(2)} USD`}
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
        selectedSymbol={selectedSymbol}
        onSelect={(selected) => {
          setSelectedMarket(selected.label);
          setSelectedSymbol(selected.symbol);
        }}
      />
    </div>
  );
};
