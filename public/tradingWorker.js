/**
 * Nexora Deriv 15M Sniper Background Trading Web Worker
 * Runs continuously in background thread even if tab is minimized, screen is off, or app is switched.
 * Handles background intervals, timers, profit tracking, target/stoploss auto-stop checks.
 */

let isRunning = false;
let startTime = 0;
let dailyProfit = 0;
let target = 40;
let stoploss = -20;
let stake = 10.49;
let userStake = 10.0;
let symbol = 'R_100';
let lastTradeTime = 0;
let nextTradeSlot = 0;
let completedBlocks = 0;
let skippedBlocks = 0;

let intervalTimer = null;
let heartbeatCounter = 0;

function formatCountdown(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function startEngine(config) {
  isRunning = true;
  startTime = config.startTime || Date.now();
  dailyProfit = typeof config.dailyProfit === 'number' ? config.dailyProfit : 0;
  target = typeof config.target === 'number' ? config.target : 40;
  stoploss = typeof config.stoploss === 'number' ? (config.stoploss > 0 ? -config.stoploss : config.stoploss) : -20;
  stake = typeof config.stake === 'number' ? config.stake : 10.49;
  userStake = typeof config.userStake === 'number' ? config.userStake : 10.0;
  symbol = config.symbol || 'R_100';
  lastTradeTime = config.lastTradeTime || 0;
  completedBlocks = config.completedBlocks || 0;
  skippedBlocks = config.skippedBlocks || 0;

  // Next trade slot is dynamically aligned with next 15-minute clock mark (:00, :15, :30, :45)
  const calcNextBoundary = () => {
    const d = new Date();
    const nextMin = (Math.floor(d.getMinutes() / 15) + 1) * 15;
    d.setMinutes(nextMin, 0, 0);
    return d.getTime();
  };
  nextTradeSlot = config.nextTradeSlot || calcNextBoundary();

  let lastForcedSlot = -1;
  let lastSlotTimestamp = Date.now();

  intervalTimer = setInterval(() => {
    if (!isRunning) return;
    heartbeatCounter++;

    const now = Date.now();
    const dateObj = new Date(now);
    const currentHour = dateObj.getHours();
    const currentMinute = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    const currentSlot = currentHour * 4 + Math.floor(currentMinute / 15);

    // Dynamic next 15M boundary calculation
    const nextTargetMin = (Math.floor(currentMinute / 15) + 1) * 15;
    const targetDate = new Date(now);
    targetDate.setMinutes(nextTargetMin, 0, 0);
    nextTradeSlot = targetDate.getTime();

    const remainingSec = Math.max(0, Math.ceil((nextTradeSlot - now) / 1000));
    const countdownStr = formatCountdown(remainingSec);

    // Target check
    if (dailyProfit >= target) {
      console.log(`[Worker] Target $${target} hit! Auto-stopping...`);
      self.postMessage({
        type: 'TARGET_HIT',
        profit: dailyProfit,
        target,
        timestamp: now,
      });
      stopEngine('Target Hit');
      return;
    }

    // Stop Loss check
    if (dailyProfit <= stoploss) {
      console.log(`[Worker] Stoploss $${stoploss} hit! Auto-stopping...`);
      self.postMessage({
        type: 'STOPLOSS_HIT',
        profit: dailyProfit,
        stoploss,
        timestamp: now,
      });
      stopEngine('Stoploss Hit');
      return;
    }

    // Tab sleep catch-up check: If tab slept and missed boundary (> 16 min elapsed without slot execution)
    const timeSinceLastSlot = now - lastSlotTimestamp;
    const isCatchUpSlot = timeSinceLastSlot > 16 * 60 * 1000 && lastForcedSlot !== currentSlot;

    // Check if at 15M boundary (:00, :15, :30, :45) with 60s grace period for background tab wake-up
    const is15MMinute = currentMinute % 15 === 0;
    const isClock15MSlot = (is15MMinute && seconds < 60 && lastForcedSlot !== currentSlot) || isCatchUpSlot;
    const isTimerExpired = remainingSec === 0 && lastForcedSlot !== currentSlot;

    // Regular pulse to main UI (every 1 second)
    self.postMessage({
      type: 'WORKER_PULSE',
      timestamp: now,
      remainingSec,
      diffSec: remainingSec,
      countdownStr,
      currentSlot,
      dailyProfit,
      target,
      stoploss,
      stake,
      userStake,
      symbol,
      nextTradeSlot,
      completedBlocks,
      skippedBlocks,
      isRunning: true,
      lastAction: isClock15MSlot
        ? (isCatchUpSlot ? 'TAB SLEEP WAKE - CATCH-UP TRADE NOW' : '15M SLOT HIT - FORCING TRADE NOW')
        : `Waiting for ${new Date(nextTradeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} slot`,
    });

    // Check if 15M slot arrived for execution
    if (isClock15MSlot || isTimerExpired) {
      lastForcedSlot = currentSlot;
      lastSlotTimestamp = now;
      console.log(`[Worker] 15M SLOT HIT (Slot #${currentSlot}, CatchUp: ${isCatchUpSlot}) - FORCING TRADE NOW (${dateObj.toLocaleTimeString()})`);
      self.postMessage({
        type: 'SLOT_READY',
        force: true,
        slotId: currentSlot,
        isCatchUp: isCatchUpSlot,
        log: isCatchUpSlot ? 'TAB SLEEP CATCH-UP - FORCING TRADE' : '15M SLOT HIT - FORCING TRADE NOW',
        timestamp: now,
        symbol,
        dailyProfit,
      });
    }
  }, 1000);

  console.log(`[Worker] Background Trading Worker initialized: Symbol=${symbol}, Target=$${target}, SL=$${stoploss}, NextSlot in ${Math.round((nextTradeSlot - Date.now())/1000)}s`);
  self.postMessage({
    type: 'WORKER_STARTED',
    startTime,
    nextTradeSlot,
    dailyProfit,
    target,
    stoploss,
    symbol,
  });
}

function stopEngine(reason = 'User Stopped') {
  isRunning = false;
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
  console.log(`[Worker] Background Worker stopped. Reason: ${reason}. Final Profit: $${dailyProfit}`);
  self.postMessage({
    type: 'WORKER_STOPPED',
    reason,
    finalProfit: dailyProfit,
    timestamp: Date.now(),
  });
}

function recordTradeResult(tradeProfit, isWin) {
  dailyProfit = Number((dailyProfit + tradeProfit).toFixed(2));
  lastTradeTime = Date.now();
  if (isWin) {
    completedBlocks++;
  }
  // Schedule next 15-minute slot lock
  nextTradeSlot = Date.now() + 15 * 60 * 1000;

  console.log(`[Worker] Trade result recorded: Profit $${tradeProfit}, Cumulative Daily Profit $${dailyProfit}`);

  if (dailyProfit >= target) {
    self.postMessage({
      type: 'TARGET_HIT',
      profit: dailyProfit,
      target,
      timestamp: Date.now(),
    });
    stopEngine('Target Profit Reached');
    return;
  }

  if (dailyProfit <= stoploss) {
    self.postMessage({
      type: 'STOPLOSS_HIT',
      profit: dailyProfit,
      stoploss,
      timestamp: Date.now(),
    });
    stopEngine('Stop Loss Limit Triggered');
    return;
  }

  self.postMessage({
    type: 'TRADE_ACK',
    dailyProfit,
    target,
    stoploss,
    nextTradeSlot,
    completedBlocks,
    isWin,
  });
}

self.onmessage = function (e) {
  const msg = e.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'START':
      startEngine(msg.config || {});
      break;

    case 'STOP':
      stopEngine(msg.reason || 'User Stopped');
      break;

    case 'TRADE_RESULT':
      recordTradeResult(Number(msg.profit) || 0, Boolean(msg.isWin));
      break;

    case 'UPDATE_CONFIG':
      if (typeof msg.target === 'number') target = msg.target;
      if (typeof msg.stoploss === 'number') stoploss = msg.stoploss > 0 ? -msg.stoploss : msg.stoploss;
      if (typeof msg.stake === 'number') stake = msg.stake;
      if (typeof msg.userStake === 'number') userStake = msg.userStake;
      if (msg.symbol) symbol = msg.symbol;
      if (typeof msg.dailyProfit === 'number') dailyProfit = msg.dailyProfit;
      if (typeof msg.nextTradeSlot === 'number') nextTradeSlot = msg.nextTradeSlot;
      self.postMessage({
        type: 'CONFIG_UPDATED',
        target,
        stoploss,
        stake,
        userStake,
        symbol,
        dailyProfit,
      });
      break;

    case 'SYNC_STATE':
      if (msg.state) {
        if (typeof msg.state.dailyProfit === 'number') dailyProfit = msg.state.dailyProfit;
        if (typeof msg.state.target === 'number') target = msg.state.target;
        if (typeof msg.state.stoploss === 'number') stoploss = msg.state.stoploss;
        if (typeof msg.state.nextTradeSlot === 'number') nextTradeSlot = msg.state.nextTradeSlot;
      }
      break;

    case 'PING':
      self.postMessage({
        type: 'PONG',
        timestamp: Date.now(),
        isRunning,
        dailyProfit,
      });
      break;

    default:
      console.warn('[Worker] Unknown message type:', msg.type);
  }
};
