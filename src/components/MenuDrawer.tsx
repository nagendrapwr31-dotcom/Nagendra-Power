import React from 'react';
import {
  X,
  Zap,
  Crown,
  Sliders,
  CreditCard,
  ExternalLink,
  Shield,
  Activity,
  Layers,
  HelpCircle,
  FileText,
  LogOut,
  Target,
} from 'lucide-react';
import { ActiveTab, AccountInfo, AccountType } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeAccountType: AccountType;
  realAccount: AccountInfo;
  demoAccount: AccountInfo;
  onLogout: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  activeAccountType,
  realAccount,
  demoAccount,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-72 sm:w-80 max-w-[85%] bg-[#05161A] border-r border-[#00E5FF]/30 h-full p-5 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1A3A3E]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A2428] to-[#041215] border border-[#00E5FF]/40 flex items-center justify-center font-bold text-cyan-400">
                D
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">Live Deriv</div>
                <div className="text-[10px] text-gray-400 font-mono">Data Analysis</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#0E2A2E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Active Account Card */}
          <div className="mt-4 p-3 rounded-xl bg-[#0A2428] border border-[#00E5FF]/20">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
              <span>Active Account</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded ${
                  activeAccountType === 'real'
                    ? 'bg-cyan-500/20 text-[#00E5FF]'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {activeAccountType === 'real' ? 'REAL' : 'DEMO'}
              </span>
            </div>
            <div
              id="active-account-balance"
              className="text-base font-bold text-white mt-1 font-mono"
            >
              {(activeAccountType === 'real' ? realAccount.balance : demoAccount.balance).toFixed(2)}{' '}
              USD
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
              {activeAccountType === 'real'
                ? realAccount.accountNumber || 'R0T92680319'
                : demoAccount.accountNumber || 'D0T93866397'}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="mt-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2">
              Modules &amp; Pages
            </div>

            {[
              { id: 'landing', label: 'Front Landing Page', icon: FileText },
              { id: 'free', label: 'Nexora AI Free Tier', icon: Zap },
              { id: 'premium', label: 'Nexora AI Premium (Alpha)', icon: Crown, isYellow: true },
              { id: 'manual', label: 'Manual Tick Trading', icon: Sliders },
              { id: 'pricing', label: 'AI Plans & Unlock', icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id as ActiveTab);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? item.isYellow
                        ? 'bg-[#0A2428] border border-yellow-400 text-yellow-300'
                        : 'bg-[#0A2428] border border-[#00E5FF] text-[#00E5FF]'
                      : 'text-gray-300 hover:bg-[#0E2A2E] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      item.isYellow
                        ? 'text-yellow-400'
                        : isActive
                        ? 'text-[#00E5FF]'
                        : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* System Specs */}
          <div className="mt-6 px-2 space-y-2 text-[11px] font-mono text-gray-400">
            <div className="flex justify-between">
              <span>Deriv App ID:</span>
              <span className="text-gray-200">34DXdDGwVHlw3UsKchz7J</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Reaction:</span>
              <span className="text-emerald-400">&lt;50ms</span>
            </div>
            <div className="flex justify-between">
              <span>Markov Matrix:</span>
              <span className="text-cyan-400">Active 60fps</span>
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="pt-4 border-t border-[#1A3A3E]">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
