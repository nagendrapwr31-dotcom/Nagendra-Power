import React, { useState } from 'react';
import {
  Check,
  TrendingUp,
  Zap,
  Shield,
  Activity,
  BarChart2,
  Sliders,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Lock,
  Package,
  Layers,
  Repeat,
  Radio,
  Key,
} from 'lucide-react';
import { MarketTicker } from '../types';

interface LandingPageProps {
  onLoginWithDeriv: () => void;
  onRegisterClick: () => void;
  onAccessNexoraFree: () => void;
  marketTickers: MarketTicker[];
  onOpenTokenModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginWithDeriv,
  onRegisterClick,
  onAccessNexoraFree,
  onOpenTokenModal,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is this an official Deriv product?',
      a: 'No. Live Deriv Data Analysis is an independent platform that connects to your Deriv account through the official Deriv API.',
    },
    {
      q: 'How do you handle my login?',
      a: 'Authentication happens directly with Deriv via OAuth. We only receive a scoped access token — never your password.',
    },
    {
      q: 'Which login methods are supported?',
      a: 'Both the modern OAuth 2.0 (PKCE) flow and the classic legacy token redirect are fully supported.',
    },
    {
      q: 'Can I use a demo account?',
      a: 'Yes. Virtual (Demo) accounts work exactly like real ones so you can test strategies risk-free.',
    },
  ];

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* 1. Header (Public Landing - Pure White Theme) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Left */}
          <div
            onClick={() => handleScroll('hero')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-cyan-50 border border-cyan-400/50 shadow-xs flex-shrink-0">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <line x1="10" y1="6" x2="10" y2="26" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
                <rect x="8.5" y="10" width="3" height="10" rx="1.5" fill="#0284C7" />
                <line x1="22" y1="7" x2="22" y2="25" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
                <rect x="20.5" y="12" width="3" height="8" rx="1.5" fill="#0284C7" />
                <path d="M12 9H17C19.7614 9 22 11.2386 22 14V18C22 20.7614 19.7614 23 17 23H12V9Z" stroke="#0369A1" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-gray-900 font-bold text-sm tracking-tight">
                Live Deriv
              </span>
              <span className="text-sky-600 font-extrabold text-xs tracking-tight">
                Data Analysis
              </span>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-gray-600">
            <button
              onClick={() => handleScroll('features')}
              className="hover:text-sky-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleScroll('markets')}
              className="hover:text-sky-600 transition-colors"
            >
              Markets
            </button>
            <button
              onClick={() => handleScroll('how-it-works')}
              className="hover:text-sky-600 transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => handleScroll('faq')}
              className="hover:text-sky-600 transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenTokenModal || onLoginWithDeriv}
              className="text-xs font-bold text-gray-700 hover:text-sky-600 px-3 py-1.5 transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-sky-600" />
              <span>Connect API Token</span>
            </button>
            <button
              onClick={onLoginWithDeriv}
              className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              Login with Deriv
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="pt-10 sm:pt-16 pb-14 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 max-w-2xl mx-auto leading-[1.15]">
          Trade Deriv options on autopilot
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Build, run, and monitor automated strategies with live market data and no code — all from a single, secure Deriv-linked platform.
        </p>

        {/* Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            id="derivLoginBtn"
            onClick={onLoginWithDeriv}
            style={{
              background: 'linear-gradient(90deg,#00d2ff,#7d5cff)',
              color: '#fff',
              padding: '14px 28px',
              width: '100%',
              maxWidth: '340px',
              borderRadius: '30px',
              fontWeight: 900,
              border: 0,
              cursor: 'pointer',
              fontSize: '15px',
              boxShadow: '0 8px 25px rgba(125,92,255,0.3)',
            }}
            className="hover:opacity-95 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            Login with Deriv
          </button>

          <button
            onClick={() => handleScroll('features')}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-xs sm:text-sm transition-all shadow-xs"
          >
            Join Community
          </button>
        </div>

        {/* Text checklist & Register */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>No card required</span>
        </div>

        <div className="mt-2 text-xs text-gray-600">
          Don't have a Deriv account?{' '}
          <button
            onClick={onRegisterClick}
            className="text-sky-600 font-bold hover:underline"
          >
            Register here
          </button>
        </div>

        {/* 3. Center Card: "Nexora AI" */}
        <div className="mt-10 max-w-xl mx-auto rounded-2xl bg-white border border-purple-200/80 p-6 sm:p-7 shadow-[0_10px_35px_rgba(168,85,247,0.08)] text-left relative overflow-hidden">
          {/* Card Top Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-gray-900">Nexora AI</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold tracking-wide uppercase">
                    Promoted
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Automated Markov trading engine</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3.5 mb-3">
            Sign in with Deriv using OAuth 2.0 and let Nexora AI handle the trading.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>One secure click, no password stored</span>
          </div>

          {/* Stats 3 Boxes: 10K+ Strategies run | 24/7 Market scanning | ~150ms Avg reaction */}
          <div className="grid grid-cols-3 gap-2.5 my-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <div className="text-base font-extrabold text-gray-900 font-mono">10K+</div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">Strategies run</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <div className="text-base font-extrabold text-gray-900 font-mono">24/7</div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">Market scanning</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <div className="text-base font-extrabold text-gray-900 font-mono">&lt;50ms</div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">Avg latency</div>
            </div>
          </div>

          {/* 6 Features Checklist in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs text-gray-700">
            {[
              'Automated strategies',
              'Adaptive risk engine',
              'Priority support',
              'Active 24/7',
              'Real-time analysis',
              'Cloud powered',
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200/80"
              >
                <Check className="w-4 h-4 text-sky-600 flex-shrink-0 stroke-[2.5]" />
                <span className="font-semibold text-gray-800">{item}</span>
              </div>
            ))}
          </div>

          {/* Button: Gradient "Access Nexora AI For Free" */}
          <div className="mt-5">
            <button
              onClick={onAccessNexoraFree}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-transform hover:scale-[1.01]"
            >
              <span>Access Nexora AI For Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="text-center text-[11px] text-gray-400 mt-2 font-medium">
              Authorize with Deriv to activate
            </div>
          </div>
        </div>

        {/* 4. Stats Row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center border-y border-gray-100 py-8">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">24/7</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Automated execution</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">50+</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Synthetic &amp; forex markets</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">&lt;1s</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Tick-level reaction</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">2FA</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">OAuth-secured login</div>
          </div>
        </div>
      </section>

      {/* 5. Section: Everything you need to trade smarter (6 Cards) */}
      <section id="features" className="py-14 px-4 sm:px-6 max-w-4xl mx-auto border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Everything you need to trade smarter
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            A focused toolkit for running automated options strategies on Deriv.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Automated strategies</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Run rule-based options strategies around the clock without watching every tick.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Live market data</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Stream real-time prices and balances straight from the Deriv WebSocket API.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Secure by design</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Log in with OAuth 2.0 (PKCE) or the classic token flow — your credentials never touch our servers.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Fast execution</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Low-latency order routing reacts to market moves in under a second.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Full control</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Start, stop, and switch accounts instantly. You stay in charge at all times.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Performance insights</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Track balance, open positions, and results from a single clean dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Section: Trade the markets that move */}
      <section id="markets" className="py-14 px-4 sm:px-6 max-w-4xl mx-auto border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Trade the markets that move
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            Synthetic indices, forex, and commodities — all from one account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Volatility 75 Index</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] font-mono">
                Synthetic
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-600">+2.4%</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Volatility 100 Index</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] font-mono">
                Synthetic
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-600">+1.1%</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Boom 1000 Index</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] font-mono">
                Synthetic
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-rose-500">-0.6%</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Crash 500 Index</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] font-mono">
                Synthetic
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-600">+0.9%</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">EUR / USD</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] font-mono">
                Forex
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-600">+0.3%</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Gold / USD</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] font-mono">
                Commodities
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-600">+1.5%</div>
          </div>
        </div>
      </section>

      {/* 7. Section: Up and running in three steps */}
      <section id="how-it-works" className="py-14 px-4 sm:px-6 max-w-4xl mx-auto border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Up and running in three steps
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            From login to live trading in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl font-black text-sky-600 font-mono mb-2">01</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Connect your Deriv account</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Securely log in with OAuth 2.0 or the legacy token flow in a couple of clicks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl font-black text-sky-600 font-mono mb-2">02</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Pick a strategy</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Choose from automated options strategies and configure your risk parameters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl font-black text-sky-600 font-mono mb-2">03</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Go live &amp; monitor</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Let it run 24/7 and watch live balance and performance on your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="py-14 px-4 sm:px-6 max-w-3xl mx-auto border-t border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Common questions about automated Deriv options trading
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-white border border-gray-200 shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-gray-900 hover:text-sky-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-sky-600 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. CTA Section */}
      <section className="py-14 px-4 sm:px-6 bg-gray-50 border-t border-gray-200 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Ready to automate your trading?
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-2">
            Connect your Deriv account and launch your first automated strategy today.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onLoginWithDeriv}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-white text-sky-600 font-black text-[10px] flex items-center justify-center">
                d
              </span>
              <span>Login with Deriv</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="py-12 px-4 sm:px-8 bg-white border-t border-gray-200 text-gray-600 text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-sky-50 border border-cyan-400 flex items-center justify-center text-sky-600 font-bold text-xs">
                d
              </div>
              <span className="font-extrabold text-gray-900 text-sm">Live Deriv Data Analysis</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Automated options trading on Deriv. Build, run, and monitor strategies with a secure login.
            </p>
          </div>

          <div>
            <div className="font-bold text-gray-900 mb-2.5">Platform</div>
            <ul className="space-y-1.5 text-gray-500">
              <li><button onClick={() => handleScroll('features')} className="hover:text-sky-600">Features</button></li>
              <li><button onClick={() => handleScroll('markets')} className="hover:text-sky-600">Markets</button></li>
              <li><button onClick={onLoginWithDeriv} className="hover:text-sky-600">Dashboard</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-gray-900 mb-2.5">Resources</div>
            <ul className="space-y-1.5 text-gray-500">
              <li><button onClick={() => handleScroll('how-it-works')} className="hover:text-sky-600">How it works</button></li>
              <li><button onClick={() => handleScroll('faq')} className="hover:text-sky-600">FAQ</button></li>
              <li><span className="text-gray-400">Support</span></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-gray-900 mb-2.5">Company</div>
            <ul className="space-y-1.5 text-gray-500">
              <li><span className="text-gray-400">About</span></li>
              <li><span className="text-gray-400">Blog</span></li>
              <li><span className="text-gray-400">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] gap-2">
          <span>Trading disclosure: Real money at risk. Synthetic indices carry substantial risk. Live Deriv Data Analysis is an independent platform.</span>
          <span>© {new Date().getFullYear()} Live Deriv Data Analysis</span>
        </div>
      </footer>
    </div>
  );
};
