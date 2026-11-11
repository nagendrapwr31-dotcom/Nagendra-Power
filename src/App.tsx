import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { NexoraFreeTab } from './components/NexoraFreeTab';
import { NexoraPremiumTab } from './components/NexoraPremiumTab';
import { ManualTradingTab } from './components/ManualTradingTab';
import { AIPricingTab } from './components/AIPricingTab';
import { LiveTransactionsScreen } from './components/LiveTransactionsScreen';
import { CongratulationsModal } from './components/CongratulationsModal';
import { ScanningOverlay } from './components/ScanningOverlay';
import { BottomNav } from './components/BottomNav';
import { TokenModal } from './components/TokenModal';
import { OAuthCallbackScreen } from './components/OAuthCallbackScreen';
import { derivWs, isValidDerivSymbol, normalizeDerivSymbol, resolveSecretTokens, getStoredOAuthTokens } from './services/derivWs';
import { backgroundKeepAlive } from './services/backgroundKeepAlive';
import { calculateAnalysis } from './services/analysisIndicators';
import {
  AccountInfo,
  AccountType,
  ActiveTab,
  BotConfig,
  MarketTicker,
  TradeRecord,
  TradingStats,
  SniperScanDetails,
} from './types';
import { X, Sparkles, Activity, RotateCcw } from 'lucide-react';

const NOTIFICATIONS = [
  'James Mark unlocked Nexora AI Premium',
  'Hope Njeri started a Nexora AI Free session',
  'Daniel Cole closed the day up $88.15',
  'Peter Hughes joined the Telegram community',
];

export default function App() {
  const [isOAuthCallback, setIsOAuthCallback] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.includes('/oauth/callback') ||
      window.location.search.includes('code=') ||
      window.location.hash.includes('code=')
    );
  });

  // Auth & Connection State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasSecret, setHasSecret] = useState<boolean>(false);
  const [isConnectingAuth, setIsConnectingAuth] = useState<boolean>(false);
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);

  // Accounts
  // Accounts - Strictly Isolated State for Demo & Real
  const [activeAccountType, setActiveAccountType] = useState<AccountType>('real');
  const [realAccount, setRealAccount] = useState<AccountInfo>(() => {
    let bal = 0.0;
    const accNum = 'ROT92244596';
    if (typeof window !== 'undefined') {
      let saved = localStorage.getItem('real_balance') || localStorage.getItem('nexora_real_balance');
      // Purge any corrupted or mock balance
      if (saved === '9888.45' || saved === '9888.12' || saved === '10000' || saved === '10000.00' || saved === '300') {
        saved = '0.00';
        localStorage.setItem('real_balance', '0.00');
        localStorage.setItem('nexora_real_balance', '0.00');
      }
      if (saved && !isNaN(parseFloat(saved))) {
        bal = parseFloat(saved);
      }
      localStorage.setItem('real_loginid', 'ROT92244596');
      localStorage.setItem('deriv_real_loginid', 'ROT92244596');
      localStorage.setItem('deriv_account_real', 'ROT92244596');
    }
    return {
      type: 'real',
      accountNumber: accNum,
      balance: bal,
      currency: 'USD',
    };
  });
  const [demoAccount, setDemoAccount] = useState<AccountInfo>(() => {
    let bal = 0.0;
    const accNum = 'DOT93791311';
    if (typeof window !== 'undefined') {
      let savedDemo = localStorage.getItem('demo_balance') || localStorage.getItem('nexora_demo_balance');
      // Purge any hardcoded/mock balances
      if (savedDemo === '9888.45' || savedDemo === '9888.12' || savedDemo === '10000' || savedDemo === '10000.00' || savedDemo === '300') {
        savedDemo = '0.00';
        localStorage.setItem('demo_balance', '0.00');
        localStorage.setItem('nexora_demo_balance', '0.00');
      }
      if (savedDemo && !isNaN(parseFloat(savedDemo))) {
        bal = parseFloat(savedDemo);
      }
      localStorage.setItem('demo_loginid', 'DOT93791311');
      localStorage.setItem('deriv_demo_loginid', 'DOT93791311');
      localStorage.setItem('deriv_account_demo', 'DOT93791311');
    }
    return {
      type: 'demo',
      accountNumber: accNum,
      balance: bal,
      currency: 'USD',
    };
  });

  // Navigation & View (FORCE AUTO-START to trading screen)
  const [activeTab, setActiveTab] = useState<ActiveTab>('free');
  const [screenView, setScreenView] = useState<'config' | 'trading'>('trading');
  const [isTransactionsOpen, setIsTransactionsOpen] = useState<boolean>(false);

  // Sliding Notification Banner
  const [notificationIndex, setNotificationIndex] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Modals & Overlays
  const [congratsModalOpen, setCongratsModalOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [marketAnalysis, setMarketAnalysis] = useState<{
    rsi: number | null;
    sma: number | null;
    signal: string;
    price: number | null;
    asset: string;
  } | null>(null);

  // Bot Configuration State - Auto-set valid default symbol R_100 and dynamic targets (100% User Stake Respect)
  const [config, setConfig] = useState<BotConfig>(() => {
    const savedStake = typeof window !== 'undefined' ? localStorage.getItem('nexora_stake') : null;
    const stakeNum = savedStake ? parseFloat(savedStake) : 10.00;
    const finalStake = !isNaN(stakeNum) && stakeNum > 0 ? stakeNum : 10.00;

    const savedTarget = typeof window !== 'undefined' ? localStorage.getItem('nexora_target') : null;
    const targetNum = savedTarget ? parseFloat(savedTarget) : finalStake * 4;

    const savedStop = typeof window !== 'undefined' ? localStorage.getItem('nexora_stopLoss') : null;
    const stopNum = savedStop ? parseFloat(savedStop) : finalStake * 3;

    return {
      market: 'Volatility 100 Index',
      marketSymbol: 'R_100',
      stake: finalStake,
      profitTarget: !isNaN(targetNum) && targetNum > 0 ? targetNum : 40.0,
      maxLoss: !isNaN(stopNum) && stopNum > 0 ? stopNum : 30.0,
      riskLevel: 'Medium',
      strategy: 'mix_both',
      isPremium: false,
    };
  });

  // Trades & Stats State
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [stats, setStats] = useState<TradingStats>({
    totalStake: 0,
    totalPayout: 0,
    numberOfRuns: 0,
    contractsLost: 0,
    contractsWon: 0,
    totalPL: 0,
  });

  // Live Trading State - MANUAL CONTROL ONLY: NO AUTO TRADE on page load
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [tradeStatusMessage, setTradeStatusMessage] = useState<string>(
    'MODE: MANUAL | STAKE: $10.00 | HOUR: 1/20 | TRADES THIS HOUR: 0/4 | RESULT THIS HOUR: 0/0 PROFIT | STATUS: WAITING FOR START'
  );
  const [lastSkippedReason, setLastSkippedReason] = useState<string>('');
  const [activeExecutionError, setActiveExecutionError] = useState<string | null>(null);
  const [scannedMarketStatus, setScannedMarketStatus] = useState<string>('R_100');
  const [lastScannedScore, setLastScannedScore] = useState<number>(0);
  const [lastScannedContract, setLastScannedContract] = useState<string>('RISE');
  const [sniperDetails, setSniperDetails] = useState<SniperScanDetails | null>(null);

  // Live WebSocket Ticks
  const [liveTick, setLiveTick] = useState<{ quote: number; digit: number; symbol: string }>({
    quote: 1252.91,
    digit: 8,
    symbol: 'R_100',
  });
  const [recentDigits, setRecentDigits] = useState<number[]>([4, 7, 2, 9, 1, 8, 3, 5, 2, 6, 9]);

  // Market Tickers
  const [marketTickers] = useState<MarketTicker[]>([
    { symbol: 'R_100', name: 'Volatility 100 (1s) Index', price: 1252.91, change: '+1.1%', isPositive: true, sparkline: [1240, 1245, 1252] },
    { symbol: 'R_75', name: 'Volatility 75 (1s) Index', price: 348210.45, change: '+2.4%', isPositive: true, sparkline: [340, 342, 348] },
    { symbol: 'R_50', name: 'Volatility 50 (1s)', price: 245.82, change: '+1.8%', isPositive: true, sparkline: [240, 243, 245] },
    { symbol: 'BOOM1000', name: 'Boom 1000 Index', price: 10423.8, change: '-0.6%', isPositive: false, sparkline: [10500, 10450, 10423] },
    { symbol: 'CRASH500', name: 'Crash 500 Index', price: 4982.15, change: '+0.9%', isPositive: true, sparkline: [4900, 4950, 4982] },
  ]);

  // Route Normalization: Cleanly redirect any invalid/accidental URLs (e.g. /oau, /oauth) to '/'
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path !== '/' && !path.startsWith('/oauth/callback')) {
        console.log(`[Router] Normalizing path ${path} -> /`);
        window.history.replaceState({}, document.title, '/');
      }
    }
  }, []);

  // Rotate notification banner every 5 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setNotificationIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Listen for OAuth completion from popup (postMessage)
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, accounts } = event.data;
        console.log('Received Deriv OAUTH_AUTH_SUCCESS message');
        localStorage.removeItem('nexora_logged_out');
        if (token) {
          localStorage.setItem('deriv_token', token);
          localStorage.setItem('deriv_oauth_token', token);
          localStorage.setItem('livedataanalysis', token);
        }

        if (accounts && accounts.length > 0) {
          const realAcc = accounts.find(
            (a: any) => a.account_type === 'real' || a.account_id?.startsWith('ROT')
          );
          const demoAcc = accounts.find(
            (a: any) => a.account_type === 'demo' || a.account_id?.startsWith('DOT')
          );
          if (realAcc) {
            setRealAccount({
              type: 'real',
              accountNumber: realAcc.account_id,
              balance: parseFloat(realAcc.balance) || 0.0,
              currency: realAcc.currency || 'USD',
            });
          }
          if (demoAcc) {
            setDemoAccount({
              type: 'demo',
              accountNumber: demoAcc.account_id,
              balance: parseFloat(demoAcc.balance) || 0.0,
              currency: demoAcc.currency || 'USD',
            });
          }
          setActiveAccountType(realAcc && parseFloat(realAcc.balance) > 0 ? 'real' : 'demo');
        }

        setIsConnectingAuth(false);
        setIsLoggedIn(true);
        setActiveTab('free');

        if (token) {
          await derivWs.connectAccount(token);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const [oauthSuccessAlert, setOauthSuccessAlert] = useState<string | null>(null);

  // Deriv OAuth Token Parsing & Lifecycle (No WS on page load, connect WS ONLY AFTER OAuth login)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user explicitly clicked logout
    if (localStorage.getItem('nexora_logged_out') === 'true') {
      setIsLoggedIn(false);
      derivWs.disconnect();
      return;
    }

    // 1. Check window.location.hash and window.location.search for tokens
    const hashString = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hashString);
    const searchParams = new URLSearchParams(window.location.search);

    let parsedRealToken = '';
    let parsedRealLoginId = '';
    let parsedDemoToken = '';
    let parsedDemoLoginId = '';
    let hasRedirectTokens = false;

    // Extract acct1, acct2... token1, token2...
    for (let i = 1; i <= 10; i++) {
      const acct = hashParams.get(`acct${i}`) || searchParams.get(`acct${i}`);
      const token = hashParams.get(`token${i}`) || searchParams.get(`token${i}`);
      if (token) {
        hasRedirectTokens = true;
        const isDemo =
          acct &&
          (acct.startsWith('VR') ||
            acct.startsWith('VRT') ||
            acct.startsWith('VRW') ||
            acct.startsWith('DOT') ||
            acct.toLowerCase().includes('demo'));

        if (isDemo) {
          parsedDemoToken = token;
          parsedDemoLoginId = acct || 'DOT93791311';
        } else {
          parsedRealToken = token;
          parsedRealLoginId = acct || 'ROT92244596';
        }
      }
    }

    // Check single token params if multi-account not found
    const singleToken =
      hashParams.get('token') ||
      searchParams.get('token') ||
      hashParams.get('token1') ||
      searchParams.get('token1');
    const singleAcct =
      hashParams.get('acct') ||
      searchParams.get('acct') ||
      hashParams.get('acct1') ||
      searchParams.get('acct1');

    if (singleToken && !parsedRealToken && !parsedDemoToken) {
      hasRedirectTokens = true;
      const isDemo =
        singleAcct &&
        (singleAcct.startsWith('VR') ||
          singleAcct.startsWith('VRT') ||
          singleAcct.startsWith('VRW') ||
          singleAcct.startsWith('DOT') ||
          singleAcct.toLowerCase().includes('demo'));

      if (isDemo) {
        parsedDemoToken = singleToken;
        parsedDemoLoginId = singleAcct || 'DOT93791311';
      } else {
        parsedRealToken = singleToken;
        parsedRealLoginId = singleAcct || 'ROT92244596';
      }
    }

    if (hasRedirectTokens) {
      console.log('[Deriv OAuth] Tokens parsed successfully on redirect.');
      localStorage.removeItem('nexora_logged_out');

      if (parsedRealToken) {
        localStorage.setItem('DERIV_REAL_TOKEN', parsedRealToken);
        localStorage.setItem('DERIV_REAL_LOGINID', parsedRealLoginId || 'ROT92244596');
        setRealAccount((prev) => ({
          ...prev,
          accountNumber: parsedRealLoginId || 'ROT92244596',
        }));
      }
      if (parsedDemoToken) {
        localStorage.setItem('DERIV_DEMO_TOKEN', parsedDemoToken);
        localStorage.setItem('DERIV_DEMO_LOGINID', parsedDemoLoginId || 'DOT93791311');
        setDemoAccount((prev) => ({
          ...prev,
          accountNumber: parsedDemoLoginId || 'DOT93791311',
        }));
      }

      // Clean URL: window.history.replaceState(null, '', window.location.pathname)
      window.history.replaceState(null, '', window.location.pathname);

      // Show green alert: "Deriv Connected Successfully"
      setOauthSuccessAlert('Deriv Connected Successfully');
      setTimeout(() => setOauthSuccessAlert(null), 5000);

      setIsLoggedIn(true);

      // Connect WS ONLY AFTER OAuth login:
      const activeToken =
        activeAccountType === 'real'
          ? (parsedRealToken || parsedDemoToken)
          : (parsedDemoToken || parsedRealToken);
      if (activeToken) {
        derivWs.connectWS(activeToken);
      }
      return;
    }

    // 2. If no redirect tokens, check stored OAuth tokens in localStorage
    const {
      REAL_TOKEN: savedRealToken,
      DEMO_TOKEN: savedDemoToken,
      realLoginId: savedRealLoginId,
      demoLoginId: savedDemoLoginId,
    } = getStoredOAuthTokens();

    if (savedRealToken || savedDemoToken) {
      setRealAccount((prev) => ({
        ...prev,
        accountNumber: savedRealLoginId || 'ROT92244596',
      }));
      setDemoAccount((prev) => ({
        ...prev,
        accountNumber: savedDemoLoginId || 'DOT93791311',
      }));
      setIsLoggedIn(true);

      // Connect WS directly with configured Deriv token
      const tokenToUse =
        activeAccountType === 'real'
          ? (savedRealToken || savedDemoToken)
          : (savedDemoToken || savedRealToken);
      if (tokenToUse) {
        derivWs.connectWS(tokenToUse);
      }
    } else {
      // Clean: No ws connections on page load, no auto-connect without tokens
      setIsLoggedIn(false);
      derivWs.disconnect();
    }
  }, [activeAccountType]);

  const pricesHistoryRef = useRef<number[]>([]);

  // Real-Time Deriv Data Analysis (RSI 14 + SMA 14) from API or live client ticks
  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/market-status')
        .then((res) => res.json())
        .then((data) => {
          if (data?.latest_analysis) {
            setMarketAnalysis({
              rsi: data.latest_analysis.rsi,
              sma: data.latest_analysis.sma,
              signal:
                data.latest_analysis.signal ||
                data.latest_analysis.analysisSignal ||
                'NEUTRAL',
              price: data.latest_analysis.price,
              asset: data.latest_analysis.asset || 'R_100',
            });
          }
        })
        .catch(() => {
          const prices = pricesHistoryRef.current;
          if (prices.length >= 14) {
            const analysis = calculateAnalysis(prices);
            setMarketAnalysis({
              rsi: analysis.rsi,
              sma: analysis.sma,
              signal: analysis.signal,
              price: prices[prices.length - 1] || null,
              asset: config.marketSymbol || 'R_100',
            });
          }
        });
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 2000);
    return () => clearInterval(timer);
  }, [config.marketSymbol]);

  // Subscribe to Deriv WebSocket Balance, Auth, Contracts & Ticks
  useEffect(() => {
    const unsubBalance = derivWs.subscribeBalance((newBal, currency, loginid, allAccounts) => {
      if (allAccounts) {
        if (typeof allAccounts.realBalance === 'number') {
          const bal = allAccounts.realBalance;
          setRealAccount((prev) => ({
            ...prev,
            accountNumber: derivWs.realLoginId || prev.accountNumber || 'ROT92244596',
            balance: bal,
          }));
          try {
            localStorage.setItem('real_balance', String(bal));
            localStorage.setItem('nexora_real_balance', String(bal));
          } catch (e) {}
        }
        if (typeof allAccounts.demoBalance === 'number') {
          const bal = allAccounts.demoBalance;
          setDemoAccount((prev) => ({
            ...prev,
            accountNumber: derivWs.demoLoginId || prev.accountNumber || 'DOT93791311',
            balance: bal,
          }));
          try {
            localStorage.setItem('demo_balance', String(bal));
            localStorage.setItem('nexora_demo_balance', String(bal));
          } catch (e) {}
        }
      } else if (loginid) {
        const isReal =
          loginid === 'ROT92244596' ||
          loginid === derivWs.realLoginId ||
          (!loginid.startsWith('VR') && !loginid.startsWith('DOT') && (loginid.startsWith('CR') || loginid.startsWith('ROT')));
        const isDemo =
          loginid === 'DOT93791311' ||
          loginid === derivWs.demoLoginId ||
          loginid.startsWith('VR') ||
          loginid.startsWith('VRT') ||
          loginid.startsWith('DOT') ||
          loginid.toLowerCase().includes('demo');

        if (isReal && !isDemo) {
          setRealAccount((prev) => ({
            ...prev,
            accountNumber: loginid,
            balance: newBal,
          }));
          try {
            localStorage.setItem('real_balance', String(newBal));
            localStorage.setItem('nexora_real_balance', String(newBal));
          } catch (e) {}
        } else if (isDemo) {
          setDemoAccount((prev) => ({
            ...prev,
            accountNumber: loginid,
            balance: newBal,
          }));
          try {
            localStorage.setItem('demo_balance', String(newBal));
            localStorage.setItem('nexora_demo_balance', String(newBal));
          } catch (e) {}
        }
      }

      // Update header top right element strictly based on the active selected account type
      const currentActiveBal = activeAccountType === 'real'
        ? (typeof allAccounts?.realBalance === 'number' ? allAccounts.realBalance : derivWs.realBalance)
        : (typeof allAccounts?.demoBalance === 'number' ? allAccounts.demoBalance : derivWs.demoBalance);

      const el = document.getElementById('nexora-balance');
      if (el) {
        el.innerText = (currentActiveBal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
      }
    });

    const unsubAuth = derivWs.subscribeAuth((acc) => {
      setIsLoggedIn(true);

      if (typeof acc.realBalance === 'number') {
        setRealAccount((prev) => ({
          ...prev,
          accountNumber: derivWs.realLoginId || prev.accountNumber || 'ROT92244596',
          balance: acc.realBalance,
          currency: acc.currency || 'USD',
        }));
      }
      if (typeof acc.demoBalance === 'number') {
        setDemoAccount((prev) => ({
          ...prev,
          accountNumber: derivWs.demoLoginId || prev.accountNumber || 'DOT93791311',
          balance: acc.demoBalance,
          currency: acc.currency || 'USD',
        }));
      }
    });

    const unsubContract = derivWs.subscribeContract((contract) => {
      const realProfit = Number(contract.profit) || 0;
      const realPayout = Number(contract.sell_price) || 0;
      const stake = Number(contract.buy_price) || 1;
      const isWon = realProfit > 0;

      const tradeItem: TradeRecord = {
        id: String(contract.contract_id || Date.now()),
        symbol: contract.underlying || config.marketSymbol || derivWs.currentSymbol,
        symbolName: config.market || contract.underlying || derivWs.currentSymbol,
        timestamp: new Date(),
        stake: stake,
        payout: realPayout,
        profit: realProfit,
        isWin: isWon,
        contractType: contract.contract_type || 'DIGITOVER',
        barrier: contract.barrier,
        lastDigit: contract.exit_tick_display_value
          ? parseInt(contract.exit_tick_display_value.slice(-1), 10)
          : undefined,
        strategy: config.strategy,
        isPending: false,
      };

      setTrades((prev) => [tradeItem, ...prev]);

      setStats({
        totalStake: Number(derivWs.totalStake.toFixed(2)),
        totalPayout: Number(derivWs.totalPayout.toFixed(2)),
        numberOfRuns: derivWs.runs,
        contractsLost: derivWs.lost,
        contractsWon: derivWs.won,
        totalPL: Number(derivWs.totalProfit.toFixed(2)),
      });

      // Real Deriv settlement balance update (Zero mock overrides)
      const profitToAdd = realProfit;
      if (activeAccountType === 'demo') {
        setDemoAccount((prev) => {
          const nextBal = Number((prev.balance + profitToAdd).toFixed(2));
          try { localStorage.setItem('nexora_demo_balance', String(nextBal)); } catch (e) {}
          derivWs.forcePushBalanceToWallet(nextBal, prev.accountNumber);
          return { ...prev, balance: nextBal };
        });
      } else {
        setRealAccount((prev) => {
          const nextBal = Number((prev.balance + profitToAdd).toFixed(2));
          try {
            localStorage.setItem('nexora_real_balance', String(nextBal));
            localStorage.setItem('nexora_balance', String(nextBal));
          } catch (e) {}
          derivWs.forcePushBalanceToWallet(nextBal, prev.accountNumber);
          return { ...prev, balance: nextBal };
        });
      }
    });

    const activeSym = config.marketSymbol || 'R_100';
    const unsubTick = derivWs.subscribeTick(activeSym, ({ quote, digit }) => {
      setLiveTick({ quote, digit, symbol: activeSym });
      pricesHistoryRef.current.push(quote);
      if (pricesHistoryRef.current.length > 60) pricesHistoryRef.current.shift();
      if (pricesHistoryRef.current.length >= 14) {
        const analysis = calculateAnalysis(pricesHistoryRef.current);
        setMarketAnalysis({
          rsi: analysis.rsi,
          sma: analysis.sma,
          signal: analysis.signal,
          price: quote,
          asset: activeSym,
        });
      }
      setRecentDigits((prev) => {
        const next = [...prev, digit];
        if (next.length > 50) next.shift();
        return next;
      });
    });

    const unsubTradeStatus = derivWs.subscribeTradeStatus((status, details) => {
      setTradeStatusMessage(status);
      if (details?.skippedReason) setLastSkippedReason(details.skippedReason);
      if (details?.error !== undefined) setActiveExecutionError(details.error);
      if (details?.market) setScannedMarketStatus(details.market);
      if (details?.score !== undefined) setLastScannedScore(details.score);
      if (details?.contract) setLastScannedContract(details.contract);
      if (details?.sniper !== undefined) setSniperDetails(details.sniper);
    });

    return () => {
      unsubBalance();
      unsubAuth();
      unsubContract();
      unsubTick();
      unsubTradeStatus();
    };
  }, [config.marketSymbol, config.market, config.strategy, activeAccountType]);

  // Target reached listener
  useEffect(() => {
    const onTargetReached = () => {
      setIsTrading(false);
      setCongratsModalOpen(true);
    };
    const onMarketSwitched = (e: any) => {
      if (e.detail?.newMarket) {
        setConfig((prev) => ({
          ...prev,
          marketSymbol: e.detail.newMarket,
          market: e.detail.newLabel || e.detail.newMarket,
        }));
      }
    };
    const onWalletUpdated = (e: any) => {
      const { balance, accountType, loginid } = e.detail || {};
      if (typeof balance === 'number') {
        const isDemo =
          accountType === 'demo' ||
          (loginid && (loginid.startsWith('VR') || loginid.startsWith('DOT')));
        if (isDemo) {
          setDemoAccount((prev) => ({ ...prev, accountNumber: 'DOT93791311', balance }));
        } else {
          setRealAccount((prev) => ({ ...prev, accountNumber: 'ROT92244596', balance }));
        }
      }
    };
    const unsubTarget = backgroundKeepAlive.onTargetHit((data) => {
      setIsTrading(false);
      setCongratsModalOpen(true);
      setTradeStatusMessage(`🎯 Target Hit: +$${data.profit.toFixed(2)} reached! Stopped.`);
    });
    const unsubStoploss = backgroundKeepAlive.onStoplossHit((data) => {
      setIsTrading(false);
      setTradeStatusMessage(`🛑 Stop Loss Hit: $${data.profit.toFixed(2)} limit reached. Stopped.`);
    });

    window.addEventListener('nexora_target_reached', onTargetReached);
    window.addEventListener('nexora_market_switched', onMarketSwitched);
    window.addEventListener('nexora_wallet_updated', onWalletUpdated);
    return () => {
      unsubTarget();
      unsubStoploss();
      window.removeEventListener('nexora_target_reached', onTargetReached);
      window.removeEventListener('nexora_market_switched', onMarketSwitched);
      window.removeEventListener('nexora_wallet_updated', onWalletUpdated);
    };
  }, []);

  // Requirement 1 & 3: Auto-set valid default symbol on load if none selected / invalid, and clear error state
  useEffect(() => {
    let sym = config.marketSymbol;
    if (!sym || !isValidDerivSymbol(sym)) {
      sym = 'R_100';
      setConfig((prev) => ({
        ...prev,
        market: 'Volatility 100 Index',
        marketSymbol: 'R_100',
      }));
    }
    derivWs.currentSymbol = sym;
    derivWs.ensureTickSubscription(sym);
    if (activeExecutionError && activeExecutionError.toLowerCase().includes('symbol')) {
      setActiveExecutionError(null);
      derivWs.lastExecutionError = null;
    }

    // LAYER 1 AUTO-RESUME: Check localStorage.isRunning == true => Auto-resume background session
    const isBgRunning = backgroundKeepAlive.isEngineMarkedRunning();
    const bgState = backgroundKeepAlive.getState();

    if (isBgRunning && bgState) {
      console.log('[Auto-Resume] Found active background session. Auto-resuming...');
      const resumedProfit = bgState.dailyProfit || 0;
      const resumedTarget = bgState.target || config.profitTarget || 40;
      const nextSlot = bgState.nextTradeSlot || (Date.now() + 15 * 60 * 1000);
      const remSec = Math.max(0, Math.ceil((nextSlot - Date.now()) / 1000));
      const m = Math.floor(remSec / 60);
      const s = remSec % 60;
      const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

      setStats((prev) => ({
        ...prev,
        totalPL: resumedProfit,
        contractsWon: bgState.completedBlocks || prev.contractsWon,
      }));

      derivWs.totalProfit = resumedProfit;
      derivWs.dailyTargetProfit = resumedTarget;
      derivWs.dailyStopLoss = Math.abs(bgState.stoploss || 20);

      const resumeStatus = `Resumed Background Session - Profit $${resumedProfit.toFixed(2)} / Target $${resumedTarget} - Next trade ${timeStr}`;
      setTradeStatusMessage(resumeStatus);
      derivWs.notifyTradeStatus(resumeStatus);

      // Reconnect immediately without asking user to click RUN again
      setIsTrading(true);
      setScreenView('trading');
      derivWs.startTrading(bgState.symbol || sym, config.strategy || 'mix_both', {
        stake: bgState.stake || config.stake || 10.49,
        profitTarget: resumedTarget,
        maxLoss: Math.abs(bgState.stoploss || 20),
        riskLevel: config.riskLevel || 'Medium',
        accountType: activeAccountType,
      });
    } else {
      // MANUAL CONTROL ONLY - NO AUTO TRADE on page load
      setIsTrading(false);
      derivWs.isTrading = false;
      const standbyMsg = derivWs.getDebugStatusLine();
      setTradeStatusMessage(standbyMsg);
    }
  }, []);

  // Official Deriv OAuth Flow: Direct navigation to Deriv Authorize URL
  const handleLoginWithDeriv = () => {
    localStorage.removeItem('nexora_logged_out');
    window.location.href = 'https://oauth.deriv.com/oauth2/authorize?app_id=1089&l=EN&brand=deriv';
  };

  const handleSelectAccount = (type: AccountType, _loginid?: string) => {
    setActiveAccountType(type);
    derivWs.switchAccountType(type);
  };

  const handleUpdateConfig = (newConfig: Partial<BotConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.marketSymbol) {
        derivWs.currentSymbol = newConfig.marketSymbol;
        derivWs.ensureTickSubscription(newConfig.marketSymbol);
      }
      return updated;
    });
  };

  // Start Trading (strictly with user-selected volatility market)
  const startTrade = useCallback(
    (scannedMarket?: { symbol: string; label: string }) => {
      setIsScanning(false);
      setScreenView('trading');
      setIsTrading(true);

      const targetAccountId =
        activeAccountType === 'real' ? realAccount.accountNumber : demoAccount.accountNumber;
      if (targetAccountId) {
        derivWs.switchAccount(targetAccountId);
      }

      // Strictly use the user-selected volatility index (never override with arbitrary hardcoded market)
      const targetSymbol = config.marketSymbol || scannedMarket?.symbol || '1HZ100V';

      derivWs.setRiskLevel(config.riskLevel || 'Medium');
      derivWs.startTrading(targetSymbol, config.strategy, {
        stake: config.stake,
        profitTarget: config.profitTarget,
        maxLoss: config.maxLoss,
        riskLevel: config.riskLevel,
        accountType: activeAccountType,
        accountId: targetAccountId,
      });
    },
    [
      config.marketSymbol,
      config.market,
      config.strategy,
      config.stake,
      config.profitTarget,
      config.maxLoss,
      config.riskLevel,
      activeAccountType,
      realAccount.accountNumber,
      demoAccount.accountNumber,
    ]
  );

  // Start Scanning Matrix
  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScreenView('trading');

    const sym = config.marketSymbol || '1HZ100V';
    derivWs.scanMarket(sym);
  }, [config.marketSymbol]);

  // Stop Trading (Layer 5: Worker terminate, close WS, release wakeLock, clear audio, isRunning=false)
  const handleStopTrading = useCallback(() => {
    setIsTrading(false);
    derivWs.stopTrading();
    backgroundKeepAlive.stopBackgroundSession('Stopped by User');
    const finalProfit = derivWs.totalProfit;
    const stopMsg = `Stopped by User - Final Profit $${finalProfit.toFixed(2)}`;
    setTradeStatusMessage(stopMsg);
    derivWs.notifyTradeStatus(stopMsg);
  }, []);

  // Reset Trades
  const handleResetTrades = () => {
    handleStopTrading();
    derivWs.resetTrades();
    setTrades([]);
    setStats({
      totalStake: 0,
      totalPayout: 0,
      numberOfRuns: 0,
      contractsLost: 0,
      contractsWon: 0,
      totalPL: 0,
    });
    setActiveExecutionError(null);
  };

  // Requirement 4: Clear & Force 15M Sniper button handler
  // - clearAllLocks()
  // - reset error state to null
  // - reset PnL safeguards
  // - set symbol = "R_100"
  // - reset interval timer
  // - force start Auto-Select Multi-Contract 15M Sniper immediately
  const handleClearAndForceSniper = useCallback(() => {
    derivWs.clearAllLocks();
    setActiveExecutionError(null);
    derivWs.lastExecutionError = null;

    setTrades([]);
    setStats({
      totalStake: 0,
      totalPayout: 0,
      numberOfRuns: 0,
      contractsLost: 0,
      contractsWon: 0,
      totalPL: 0,
    });
    derivWs.resetTrades();

    const targetSym = 'R_100';
    setConfig((prev) => ({
      ...prev,
      market: 'Volatility 100 Index',
      marketSymbol: 'R_100',
    }));
    derivWs.currentSymbol = targetSym;
    derivWs.ensureTickSubscription(targetSym);

    setIsTrading(true);
    setScreenView('trading');
    derivWs.startTrading(targetSym, config.strategy || 'mix_both', {
      stake: config.stake || 1.00,
      profitTarget: config.profitTarget || 20.0,
      maxLoss: config.maxLoss || 20.0,
      riskLevel: config.riskLevel || 'Medium',
      accountType: activeAccountType,
    });

    // Immediately dispatch forced real trade buy on Deriv WebSocket
    setTimeout(() => {
      console.log('[Clear & Force 15M Sniper] Disptaching immediate forced buy trade to Deriv WebSocket...');
      derivWs.directBuy('DIGITUNDER', config.stake || 1.00, 8);
    }, 350);
  }, [config.strategy, config.stake, config.profitTarget, config.maxLoss, config.riskLevel, activeAccountType]);

  // Dynamic user inputs change handler (Stake = Profit Per Trade, Daily Target, Daily Stop Loss)
  const handleSniperInputsChange = useCallback((profitPerTrade: number, dailyTarget: number, dailyStopLoss: number) => {
    setConfig((prev) => ({
      ...prev,
      stake: profitPerTrade,
      profitTarget: dailyTarget,
      maxLoss: dailyStopLoss,
    }));
    derivWs.setDynamicSniperInputs(profitPerTrade, dailyTarget, dailyStopLoss);
  }, []);

  // Manual trade
  const handlePlaceManualTrade = (type: string, barrier?: number, stakeAmount?: number) => {
    const stakeToUse = stakeAmount || 1;
    const sym = config.marketSymbol || 'R_100';

    if (type === 'ACCU') {
      derivWs.buyAccumulator({
        stake: stakeToUse,
        symbol: sym,
        growthRate: 0.02,
      });
      return;
    }

    derivWs.placeManualTrade(type, stakeToUse, sym, barrier);
  };

  const handleLogout = async () => {
    derivWs.disconnect();
    setIsLoggedIn(false);
    setScreenView('config');
    setActiveTab('free');

    // Thoroughly remove all OAuth tokens and session state
    localStorage.removeItem('DERIV_REAL_TOKEN');
    localStorage.removeItem('DERIV_DEMO_TOKEN');
    localStorage.removeItem('DERIV_REAL_LOGINID');
    localStorage.removeItem('DERIV_DEMO_LOGINID');
    localStorage.removeItem('deriv_token');
    localStorage.removeItem('deriv_loginid');
    localStorage.removeItem('deriv_token_real');
    localStorage.removeItem('deriv_loginid_real');
    localStorage.removeItem('deriv_account_real');
    localStorage.removeItem('deriv_token_demo');
    localStorage.removeItem('deriv_loginid_demo');
    localStorage.removeItem('deriv_account_demo');
    localStorage.removeItem('livedataanalysis');
    localStorage.removeItem('deriv_oauth_token');
    localStorage.removeItem('real_balance');
    localStorage.removeItem('demo_balance');
    localStorage.removeItem('nexora_real_balance');
    localStorage.removeItem('nexora_demo_balance');
    sessionStorage.clear();

    if (typeof window !== 'undefined') {
      (window as any).realBalance = 0;
      (window as any).demoBalance = 0;
      (window as any).globalWS = null;
    }

    // Mark explicit logout so reload will stay logged out and show Login with Deriv
    localStorage.setItem('nexora_logged_out', 'true');
  };

  // If OAuth callback
  if (isOAuthCallback) {
    return (
      <OAuthCallbackScreen
        onSuccess={({ realAccount: ra, demoAccount: da, activeAccountType: aat }) => {
          setRealAccount(ra);
          setDemoAccount(da);
          setActiveAccountType(aat);
          setIsLoggedIn(true);
          setIsOAuthCallback(false);
          setActiveTab('free');
        }}
        onError={(err) => console.error(err)}
      />
    );
  }

  // 1. AUTH CONNECTING SCREEN (Exact from video 00:42)
  if (isConnectingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-4 text-center">
        {/* Circular spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-sky-500 animate-spin mb-6" />
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Completing your login...
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Securely connecting to your Deriv account.
        </p>
      </div>
    );
  }

  // 2. PUBLIC LANDING PAGE (Pure White Theme)
  if (!isLoggedIn) {
    return (
      <>
        <LandingPage
          onLoginWithDeriv={handleLoginWithDeriv}
          onRegisterClick={handleLoginWithDeriv}
          onAccessNexoraFree={handleLoginWithDeriv}
          marketTickers={marketTickers}
          onOpenTokenModal={() => setTokenModalOpen(true)}
        />
        <TokenModal
          isOpen={tokenModalOpen}
          onClose={() => setTokenModalOpen(false)}
          onSubmitToken={async (tok, type) => {
            localStorage.removeItem('nexora_logged_out');
            if (type === 'demo') {
              localStorage.setItem('DERIV_DEMO_TOKEN', tok);
              localStorage.setItem('deriv_token_demo', tok);
              derivWs.setAccountToken(demoAccount.accountNumber, tok);
              setActiveAccountType('demo');
            } else {
              localStorage.setItem('DERIV_REAL_TOKEN', tok);
              localStorage.setItem('deriv_token_real', tok);
              derivWs.setAccountToken(realAccount.accountNumber, tok);
              setActiveAccountType('real');
            }
            setIsLoggedIn(true);
            setTokenModalOpen(false);
            await derivWs.connectWS(tok);
          }}
          onUseDemoSandbox={() => {
            derivWs.switchAccount('DOT93791311');
            setActiveAccountType('demo');
            setTokenModalOpen(false);
          }}
        />
      </>
    );
  }

  // 3. DASHBOARD (Dark Theme #0A0E1A)
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Hidden button for programmatic trigger */}
      <button
        id="triggerCongratsModal"
        onClick={() => {
          setIsTrading(false);
          setCongratsModalOpen(true);
        }}
        className="hidden"
        aria-hidden="true"
      />

      {/* Top Header */}
      <Header
        realAccount={realAccount}
        demoAccount={demoAccount}
        activeAccountType={activeAccountType}
        onSelectAccount={handleSelectAccount}
        onOpenTokenModal={() => setTokenModalOpen(true)}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        isLanding={false}
        hasSecret={hasSecret}
        onLoginClick={handleLoginWithDeriv}
        onOpenMenuDrawer={() => {}}
        marketAnalysis={marketAnalysis}
      />

      {/* Green alert on successful Deriv OAuth connection */}
      {oauthSuccessAlert && (
        <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs shadow-md animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-bold text-emerald-200">
                {oauthSuccessAlert}
              </span>
            </div>
            <button
              onClick={() => setOauthSuccessAlert(null)}
              className="p-1 text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sliding Notification Banner matching video 00:50, 00:55, 01:06 */}
      {isBannerVisible && (
        <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0E1524] border border-gray-800 text-xs shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0 animate-pulse" />
              <span className="font-semibold text-gray-200 truncate">
                {NOTIFICATIONS[notificationIndex]}
              </span>
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-1 text-gray-500 hover:text-white flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {screenView === 'trading' ? (
          <LiveTransactionsScreen
            trades={trades}
            stats={stats}
            isTrading={isTrading}
            onStopTrading={handleStopTrading}
            onStartTrading={() => {
              if (stats.totalPL <= -(config.maxLoss || 20)) {
                setStats({
                  totalStake: 0,
                  totalPayout: 0,
                  numberOfRuns: 0,
                  contractsLost: 0,
                  contractsWon: 0,
                  totalPL: 0,
                });
                derivWs.resetTrades();
              }
              setIsTrading(true);
              derivWs.startTrading(config.marketSymbol, config.strategy, {
                stake: config.stake,
                profitTarget: config.profitTarget,
                maxLoss: config.maxLoss,
                riskLevel: config.riskLevel,
              });
            }}
            onResetTrades={handleResetTrades}
            onBackToConfig={() => {
              setScreenView('config');
              setIsTrading(false);
              derivWs.stopTrading();
            }}
            config={config}
            liveTick={liveTick}
            tradeStatusMessage={tradeStatusMessage}
            lastSkippedReason={lastSkippedReason}
            activeExecutionError={activeExecutionError}
            scannedMarket={scannedMarketStatus}
            scannedScore={lastScannedScore}
            scannedContract={lastScannedContract}
            sniperDetails={sniperDetails}
            onClearAndForceSniper={handleClearAndForceSniper}
            onChangeSniperInputs={handleSniperInputsChange}
          />
        ) : (
          <>
            {activeTab === 'manual' && (
              <ManualTradingTab
                onPlaceManualTrade={handlePlaceManualTrade}
                trades={trades}
                stats={stats}
                onResetTrades={handleResetTrades}
                currentTick={liveTick}
                recentDigits={recentDigits}
              />
            )}

            {activeTab === 'free' && (
              <NexoraFreeTab
                config={config}
                onChangeConfig={handleUpdateConfig}
                onRunBot={startScanning}
                stats={stats}
                trades={trades}
                onResetTrades={handleResetTrades}
                onViewTransactionsScreen={() => setScreenView('trading')}
                isRealAccount={activeAccountType === 'real'}
              />
            )}

            {activeTab === 'premium' && (
              <NexoraPremiumTab
                config={config}
                onChangeConfig={handleUpdateConfig}
                onRunBot={startScanning}
                stats={stats}
                trades={trades}
                onResetTrades={handleResetTrades}
                onViewTransactionsScreen={() => setScreenView('trading')}
                onNavigateToPricing={() => setActiveTab('pricing')}
              />
            )}

            {activeTab === 'pricing' && (
              <AIPricingTab
                onActivateFree={() => setActiveTab('free')}
                onActivatePremium={() => setActiveTab('premium')}
              />
            )}
          </>
        )}
      </main>

      {/* Collapsible Transactions Drawer matching video 00:45 & 01:10 */}
      {isTransactionsOpen && screenView !== 'trading' && (
        <div className="fixed inset-x-0 bottom-16 z-30 max-w-xl mx-auto px-3 sm:px-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#0E1524] border border-gray-800 rounded-2xl p-4 shadow-2xl max-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white">Transactions Drawer</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetTrades}
                  className="px-2 py-1 rounded-lg bg-gray-800 text-[11px] text-gray-300 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsTransactionsOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trades List */}
            <div className="overflow-y-auto py-2 space-y-2 flex-1">
              {trades.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No trades this session. Trades you place — manual or bot — appear here live.
                </div>
              ) : (
                trades.map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#141C2E] border border-gray-800/80"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{t.symbolName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Stake ${t.stake.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold font-mono ${
                          t.isWin ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {t.isWin ? `+${t.profit.toFixed(2)}` : t.profit.toFixed(2)}
                      </span>
                      {idx === 0 && t.isWin && (
                        <span className="px-1.5 py-0.5 rounded-full border border-rose-300 bg-rose-500/10 text-rose-400 text-[9px] font-bold">
                          ✕ Sell
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Stats 6 Grid */}
            <div className="pt-2 border-t border-gray-800 grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
              <div className="bg-[#141C2E] p-1.5 rounded-lg">
                <div className="text-gray-400">STAKE</div>
                <div className="text-white font-bold">${stats.totalStake.toFixed(2)}</div>
              </div>
              <div className="bg-[#141C2E] p-1.5 rounded-lg">
                <div className="text-gray-400">PAYOUT</div>
                <div className="text-white font-bold">${stats.totalPayout.toFixed(2)}</div>
              </div>
              <div className="bg-[#141C2E] p-1.5 rounded-lg">
                <div className="text-gray-400">RUNS</div>
                <div className="text-white font-bold">{stats.numberOfRuns}</div>
              </div>
              <div className="bg-[#141C2E] p-1.5 rounded-lg">
                <div className="text-gray-400">WON</div>
                <div className="text-emerald-400 font-bold">{stats.contractsWon}</div>
              </div>
              <div className="bg-[#141C2E] p-1.5 rounded-lg">
                <div className="text-gray-400">LOST</div>
                <div className="text-rose-400 font-bold">{stats.contractsLost}</div>
              </div>
              <div className="bg-[#141C2E] p-1.5 rounded-lg">
                <div className="text-gray-400">P/L</div>
                <div
                  className={`font-black ${
                    stats.totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {stats.totalPL >= 0 ? '+' : ''}
                  {stats.totalPL.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setScreenView('config');
        }}
        onToggleTransactions={() => setIsTransactionsOpen(!isTransactionsOpen)}
        isTransactionsOpen={isTransactionsOpen}
      />

      {/* 5. 4-Second Scanning Matrix Overlay */}
      <ScanningOverlay
        isOpen={isScanning}
        onComplete={startTrade}
        strategyName={config.strategy}
        selectedMarket={{ symbol: config.marketSymbol, label: config.market }}
      />

      {/* 6. Congratulations Modal */}
      <CongratulationsModal
        isOpen={congratsModalOpen}
        onClose={() => setCongratsModalOpen(false)}
        stats={stats}
      />

      {/* 7. Token Modal */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSubmitToken={async (tok, type) => {
          localStorage.removeItem('nexora_logged_out');
          if (type === 'demo') {
            localStorage.setItem('DERIV_DEMO_TOKEN', tok);
            localStorage.setItem('deriv_token_demo', tok);
            derivWs.setAccountToken(demoAccount.accountNumber, tok);
            setActiveAccountType('demo');
          } else {
            localStorage.setItem('DERIV_REAL_TOKEN', tok);
            localStorage.setItem('deriv_token_real', tok);
            derivWs.setAccountToken(realAccount.accountNumber, tok);
            setActiveAccountType('real');
          }
          setIsLoggedIn(true);
          setTokenModalOpen(false);
          await derivWs.connectWS(tok);
        }}
        onUseDemoSandbox={() => {
          derivWs.switchAccount('DOT93791311');
          setActiveAccountType('demo');
          setTokenModalOpen(false);
        }}
      />
    </div>
  );
}
