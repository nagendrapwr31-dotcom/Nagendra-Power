export type AccountType = 'real' | 'demo';

export interface AccountInfo {
  type: AccountType;
  accountNumber: string;
  balance: number;
  currency: string;
  token?: string;
  account_type?: string; // 'options' or 'wallet'
}

export interface DerivAccountItem {
  loginid: string;
  is_virtual: number;
  balance: number;
  currency: string;
  account_type?: string; // 'options', 'wallet'
  landing_company_name?: string;
}

export type StrategyFreeType = 'rise_fall' | 'even_odd' | 'mix_both' | 'smart_ai' | 'over_8_killer';
export type StrategyPremiumType = 'matches_printer' | 'over_8_killer' | 'tickstrike_pro' | 'auto_switcher';

export interface TradeRecord {
  id: string;
  symbol: string;
  symbolName: string;
  timestamp: Date;
  stake: number;
  payout: number;
  profit: number; // payout - stake (negative if loss)
  isWin: boolean;
  contractType: string;
  barrier?: number | string;
  entryTick?: number;
  exitTick?: number;
  lastDigit?: number;
  strategy: string;
  isPending?: boolean;
  currentValue?: number;
  tickCount?: number;
}

export interface OpenAccuContract {
  contract_id: string | number;
  contract_type: string;
  symbol: string;
  buy_price: number;
  bid_price: number;
  profit: number;
  tick_count: number;
  growth_rate?: number;
  is_sold: number;
}

export interface TradingStats {
  totalStake: number;
  totalPayout: number;
  numberOfRuns: number;
  contractsLost: number;
  contractsWon: number;
  totalPL: number;
}

export interface SniperPriorityItem {
  id: 1 | 2 | 3 | 4;
  title: string;
  type: string;
  barrier?: string;
  confidence: number;
  payoutPct: number;
  passed: boolean;
  conditionText: string;
  details: string;
}

export interface SniperScanDetails {
  selectedContract: string | null;
  selectedConfidence: number;
  selectedPayoutPct: number;
  calculatedStake: number;
  targetProfit: number;
  trendBullishPct: number;
  isVolatile: boolean;
  digitUnder8Ratio: number;
  lockRemainingMs: number;
  isLocked: boolean;
  completedBlocks: number;
  skippedBlocks: number;
  hourlyProfitTarget: number;
  priorities: SniperPriorityItem[];
}

export interface BotConfig {
  market: string;
  marketSymbol: string;
  stake: number;
  profitTarget: number;
  maxLoss: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  strategy: string;
  isPremium: boolean;
}

export type ActiveTab = 'landing' | 'free' | 'premium' | 'manual' | 'pricing';
export type TradingScreenState = 'config' | 'trading';

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

declare global {
  interface Window {
    derivBalance?: number;
    realBal?: number;
    digits?: number[];
    ticks?: number[];
    mainWs?: any;
    lastContractId?: string | number;
    startScanning?: () => void;
    startTrade?: () => void;
    buyOver8Killer?: (stake?: number) => void;
    connectDeriv?: (token: string) => void;
    subscribeAll?: () => void;
  }
}
