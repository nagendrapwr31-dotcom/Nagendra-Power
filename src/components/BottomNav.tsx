import React from 'react';
import { Sliders, Sparkles, Crown, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleTransactions?: () => void;
  isTransactionsOpen?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onToggleTransactions,
  isTransactionsOpen = false,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'manual', label: 'Manual Trading', icon: Sliders },
    { id: 'free', label: 'Nexora AI Free', icon: Sparkles },
    { id: 'premium', label: 'Nexora AI Premium', icon: Crown },
    { id: 'pricing', label: 'AI Pricing', icon: Tag },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-md border-t border-gray-800/80 px-2 py-1 transition-colors">
      {/* Collapsible Transactions Drawer Bar on top of nav matching video */}
      {onToggleTransactions && (
        <div className="max-w-md mx-auto mb-1">
          <button
            onClick={onToggleTransactions}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#0E1524] border border-gray-800 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Transactions</span>
            </div>
            {isTransactionsOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      )}

      {/* 4 Bottom Tabs */}
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-sky-400 font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-sky-400' : 'text-gray-400'
                }`}
              />

              <span className="text-[10px] mt-1 text-center truncate max-w-full font-medium tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
