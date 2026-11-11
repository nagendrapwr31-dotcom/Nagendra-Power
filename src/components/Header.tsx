import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Moon,
  Sun,
  Check,
  LogOut,
  RefreshCw,
  Key,
} from 'lucide-react';
import { AccountInfo, AccountType } from '../types';

interface HeaderProps {
  realAccount: AccountInfo;
  demoAccount: AccountInfo;
  activeAccountType: AccountType;
  onSelectAccount: (type: AccountType, loginid?: string) => void;
  onOpenTokenModal: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  isLanding?: boolean;
  onLoginClick: () => void;
  onRegisterClick?: () => void;
  onOpenMenuDrawer: () => void;
  onNavigateSection?: (sectionId: string) => void;
  marketAnalysis?: {
    rsi: number | null;
    sma: number | null;
    signal: string;
    price: number | null;
    asset: string;
  } | null;
  isBackgroundRunning?: boolean;
  isDocumentHidden?: boolean;
  hasSecret?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  realAccount,
  demoAccount,
  activeAccountType,
  onSelectAccount,
  onOpenTokenModal,
  onLogout,
  isLoggedIn,
  isLanding = false,
  hasSecret = false,
  onLoginClick,
  onRegisterClick,
  marketAnalysis,
  isBackgroundRunning = false,
  isDocumentHidden = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeAccount = activeAccountType === 'real' ? realAccount : demoAccount;

  const formatBalance = (val: number) => {
    return (val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0E1A]/95 backdrop-blur-md border-b border-gray-800/80 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo exact from video */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-950/60 border border-cyan-400/50 shadow-xs flex-shrink-0">
            <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none">
              <line x1="10" y1="6" x2="10" y2="26" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
              <rect x="8.5" y="10" width="3" height="10" rx="1.5" fill="#00E5FF" />
              <line x1="22" y1="7" x2="22" y2="25" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
              <rect x="20.5" y="12" width="3" height="8" rx="1.5" fill="#00E5FF" />
              <path d="M12 9H17C19.7614 9 22 11.2386 22 14V18C22 20.7614 19.7614 23 17 23H12V9Z" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-white font-bold text-xs sm:text-sm tracking-tight">
              Live Deriv
            </span>
            <span className="text-cyan-400 font-extrabold text-[10px] sm:text-xs tracking-tight">
              Data Analysis
            </span>
          </div>
        </div>

        {/* Live Deriv Analysis Indicator Chip */}
        {marketAnalysis && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-gray-300">
              RSI(14): <strong className="text-white">{marketAnalysis.rsi ?? '--'}</strong>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">
              SMA(14): <strong className="text-white">{marketAnalysis.sma ? marketAnalysis.sma.toFixed(2) : '--'}</strong>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                marketAnalysis.signal === 'OVERSOLD / BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : marketAnalysis.signal === 'OVERBOUGHT / SELL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {marketAnalysis.signal}
            </span>
          </div>
        )}

        {/* Right Section: Background Status + Theme Toggle + Balance Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Background Running Badges */}
          {isDocumentHidden && isBackgroundRunning && (
            <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-[#00E5FF] text-[#00E5FF] text-[10px] font-mono font-bold animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              RUNNING IN BACKGROUND (Tap to return)
            </div>
          )}

          {!isDocumentHidden && isBackgroundRunning && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              🔒 Background KeepAlive ON
            </div>
          )}

          {/* Moon / Sun toggle matching video 00:45 */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-[#0E1524] border border-gray-800 text-gray-300 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-cyan-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Balance Pill Button matching video 00:45 */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="balance-pill-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0E1524] border border-gray-700/80 hover:border-gray-600 text-white text-xs sm:text-sm transition-all focus:outline-none"
            >
              {/* USA Flag */}
              <span className="inline-flex items-center justify-center w-5 h-3.5 rounded-xs overflow-hidden shadow-xs flex-shrink-0">
                <svg viewBox="0 0 7410 3900" className="w-full h-full object-cover">
                  <rect width="7410" height="3900" fill="#b22234" />
                  <path
                    d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410"
                    stroke="#fff"
                    strokeWidth="300"
                  />
                  <rect width="2964" height="2100" fill="#3c3b6e" />
                  <circle cx="1482" cy="1050" r="700" fill="#fff" opacity="0.9" />
                </svg>
              </span>

              {/* Hidden balance identifiers for scripts and tests */}
              <span id="nexoraBalance" className="hidden">
                ${formatBalance(activeAccount.balance)}
              </span>
              <span id="derivBalance" className="hidden">
                ${formatBalance(activeAccount.balance)}
              </span>
              <div className="flex flex-col text-left leading-tight">
                <span id="nexora-balance" className="top-balance font-extrabold text-white text-xs sm:text-sm font-mono tracking-tight">
                  {formatBalance(activeAccountType === 'demo' ? demoAccount.balance : realAccount.balance)} USD
                </span>
                <span id="balance-pill" className="hidden">
                  {formatBalance(activeAccountType === 'demo' ? demoAccount.balance : realAccount.balance)} USD
                </span>
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  <span>{activeAccountType === 'demo' ? 'Demo account' : 'Real account (Options)'}</span>
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ml-0.5 ${
                  dropdownOpen ? 'rotate-180 text-sky-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu matching video 01:16: "YOUR ACCOUNTS" */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0E1524] border border-gray-700 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-800">
                  Your Accounts
                </div>

                {/* Real Account */}
                <button
                  onClick={() => {
                    onSelectAccount('real', realAccount.accountNumber || 'ROT92244596');
                    setDropdownOpen(false);
                  }}
                  className={`w-full mt-2 flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    activeAccountType === 'real'
                      ? 'bg-[#152336] text-white border border-sky-500/40'
                      : 'text-gray-300 hover:bg-gray-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex w-5 h-3.5 rounded-xs overflow-hidden shadow-xs flex-shrink-0">
                      <svg viewBox="0 0 7410 3900" className="w-full h-full object-cover">
                        <rect width="7410" height="3900" fill="#b22234" />
                        <rect width="2964" height="2100" fill="#3c3b6e" />
                      </svg>
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Real account (Options)</span>
                      </span>
                      <span
                        data-account-id={realAccount.accountNumber || 'ROT92244596'}
                        className="text-sm font-black text-white font-mono"
                      >
                        {formatBalance(realAccount.balance)} USD
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                        {realAccount.accountNumber || 'ROT92244596'}
                      </span>
                    </div>
                  </div>
                  {activeAccountType === 'real' && (
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  )}
                </button>

                {/* Demo Account */}
                <button
                  onClick={() => {
                    onSelectAccount('demo', demoAccount.accountNumber || 'DOT93791311');
                    setDropdownOpen(false);
                  }}
                  className={`w-full mt-1.5 flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    activeAccountType === 'demo'
                      ? 'bg-[#152336] text-white border border-sky-500/40'
                      : 'text-gray-300 hover:bg-gray-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-3.5 rounded-xs bg-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-300">
                      VR
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Demo account</span>
                        <span className="text-emerald-400 text-[10px]">
                          {demoAccount.account_type === 'wallet' ? '(Wallet)' : '(Options)'}
                        </span>
                      </span>
                      <span
                        data-account-id={demoAccount.accountNumber || 'DOT93791311'}
                        className="text-sm font-black text-white font-mono"
                      >
                        {formatBalance(demoAccount.balance)} USD
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">
                        {demoAccount.accountNumber || 'DOT93791311'}
                      </span>
                    </div>
                  </div>
                  {activeAccountType === 'demo' && (
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  )}
                </button>

                <div className="my-2 border-t border-gray-800" />

                {/* Connect API Token Button */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenTokenModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors mb-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Connect API Token</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
