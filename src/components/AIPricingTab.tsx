import React from 'react';
import { Crown, Check, Zap, Sparkles, Shield, ArrowRight, Gift, Flame, ShoppingBag } from 'lucide-react';

interface AIPricingTabProps {
  onActivateFree: () => void;
  onActivatePremium: () => void;
}

export const AIPricingTab: React.FC<AIPricingTabProps> = ({
  onActivateFree,
  onActivatePremium,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white space-y-6">
      {/* Title Header matching video 01:33 */}
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Choose your Nexora AI plan
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Start free, upgrade when you're ready. No hidden fees — cancel anytime.
        </p>
      </div>

      {/* Card 1: NEXORA AI FREE matching video 01:36 */}
      <div className="rounded-2xl bg-[#0E1524] border border-gray-800 p-6 sm:p-7 relative overflow-hidden shadow-lg">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-black text-white uppercase tracking-wider">
              NEXORA AI FREE
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/40 text-sky-400 text-[10px] font-extrabold uppercase">
            FREE FOREVER
          </span>
        </div>

        <div className="inline-block px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] font-bold uppercase mb-4">
          NO CARD NEEDED
        </div>

        <div className="text-xs text-gray-400 mb-2">Get started at no cost</div>

        {/* Big Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-black text-white">Free</span>
          <span className="text-xs text-gray-400">/ lifetime</span>
        </div>

        {/* Demo & Real Accounts pill */}
        <div className="mb-5">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase">
            DEMO &amp; REAL ACCOUNTS
          </span>
        </div>

        {/* Features list */}
        <ul className="space-y-3 text-xs text-gray-300 mb-6">
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />
            <span>Even/Odd AI &amp; Rise/Fall Expert bots</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />
            <span>Automated Markov engine</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />
            <span>Risk levels: Low / Medium / High</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />
            <span>Live P&amp;L &amp; trade history</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />
            <span>Works on Demo &amp; Real accounts</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />
            <span>Email &amp; Telegram support</span>
          </li>
        </ul>

        {/* Action Button: Start free now */}
        <button
          onClick={onActivateFree}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.01]"
        >
          <span>Start free now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Sub notes */}
        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-sky-400" /> No card required
          </span>
          <span>•</span>
          <span>Instant access</span>
          <span>•</span>
          <span>Email support</span>
        </div>

        {/* Banner Box Below */}
        <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <div className="font-bold mb-0.5">Free, with no trial period</div>
          <p className="text-[11px] text-gray-300">
            Run it as long as you like. Move up only when you want the extra bots.
          </p>
        </div>
      </div>

      {/* Card 2: ALPHA STARTER matching video 01:35 */}
      <div className="rounded-2xl bg-[#0E1524] border-2 border-amber-400/80 p-6 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-black text-white uppercase tracking-wider">
              QUANTUM
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase">
            100% FREE UNLOCKED
          </span>
        </div>

        {/* Free unlocked banner */}
        <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>All Premium &amp; Apex bots unlocked for everyone</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400">Free</span>
          <span className="text-xs text-emerald-400">/ 100% unlocked</span>
          <span className="text-xs text-gray-500 line-through ml-1">$165</span>
        </div>

        <ul className="space-y-3 text-xs text-gray-300 mb-6">
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0 stroke-[2.5]" />
            <span className="font-bold text-white">Everything in Free</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0 stroke-[2.5]" />
            <span>Matches Printer bot — Matches strategy</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0 stroke-[2.5]" />
            <span>Trade on Real &amp; Demo accounts</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0 stroke-[2.5]" />
            <span>Priority bot execution</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0 stroke-[2.5]" />
            <span>Email &amp; Telegram support</span>
          </li>
        </ul>

        <button
          onClick={onActivatePremium}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01]"
        >
          <span>Get Alpha now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400 leading-relaxed text-center">
          This offer will not last long. Once the slots are gone, the price returns to 165 USD.
        </div>
      </div>
    </div>
  );
};
