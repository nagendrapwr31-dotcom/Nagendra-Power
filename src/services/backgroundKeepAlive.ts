/**
 * Nexora Strong Background Persistence + KeepAlive Engine
 * - Layer 1: State Persistence (localStorage 5-second interval + auto-resume on load)
 * - Layer 2: Web Worker Bridge + Screen WakeLock API + Silent Web Audio KeepAlive
 * - Layer 3: Visibility Change & Screen-Off Handling (background notifications, auto-reacquire)
 * - Layer 4: Target ($40 default) / Stop Loss Auto-Stop system
 * - Layer 5: Clean User Stop Handlers
 */

export interface BackgroundTradingState {
  isRunning: boolean;
  startTime: number;
  dailyProfit: number;
  target: number;
  stoploss: number;
  stake: number;
  userStake: number;
  lastTradeTime: number;
  symbol: string;
  nextTradeSlot: number;
  accountType: 'demo' | 'real';
  completedBlocks: number;
  skippedBlocks: number;
  statusMessage?: string;
}

const BG_STATE_KEY = 'nexora_bg_state';
const IS_RUNNING_KEY = 'isRunning';

class BackgroundKeepAliveService {
  private wakeLock: any = null;
  private audioCtx: AudioContext | null = null;
  private audioKeepAliveInterval: any = null;
  private worker: Worker | null = null;
  private persistenceTimer: any = null;
  private isKeepAliveActive: boolean = false;
  private lastNotificationTime: number = 0;
  private backgroundModeEnabled: boolean = true;

  // Listeners for UI updates
  private pulseListeners: Set<(data: any) => void> = new Set();
  private targetHitListeners: Set<(data: { profit: number; target: number }) => void> = new Set();
  private stoplossHitListeners: Set<(data: { profit: number; stoploss: number }) => void> = new Set();
  private slotReadyListeners: Set<(data: any) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVisibilityListener();
      this.initBeforeUnloadListener();
    }
  }

  // ==========================================
  // LAYER 1: STATE PERSISTENCE (localStorage)
  // ==========================================

  public saveState(state: Partial<BackgroundTradingState>): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getState();
      const merged: BackgroundTradingState = {
        isRunning: state.isRunning !== undefined ? state.isRunning : (current?.isRunning ?? false),
        startTime: state.startTime || current?.startTime || Date.now(),
        dailyProfit: state.dailyProfit !== undefined ? Number(state.dailyProfit.toFixed(2)) : (current?.dailyProfit ?? 0),
        target: state.target !== undefined ? state.target : (current?.target ?? 40),
        stoploss: state.stoploss !== undefined ? state.stoploss : (current?.stoploss ?? -20),
        stake: state.stake !== undefined ? state.stake : (current?.stake ?? 10.49),
        userStake: state.userStake !== undefined ? state.userStake : (current?.userStake ?? 10.0),
        lastTradeTime: state.lastTradeTime || current?.lastTradeTime || 0,
        symbol: state.symbol || current?.symbol || 'R_100',
        nextTradeSlot: state.nextTradeSlot || current?.nextTradeSlot || (Date.now() + 15 * 60 * 1000),
        accountType: state.accountType || current?.accountType || 'real',
        completedBlocks: state.completedBlocks !== undefined ? state.completedBlocks : (current?.completedBlocks ?? 0),
        skippedBlocks: state.skippedBlocks !== undefined ? state.skippedBlocks : (current?.skippedBlocks ?? 0),
        statusMessage: state.statusMessage || current?.statusMessage,
      };

      localStorage.setItem(BG_STATE_KEY, JSON.stringify(merged));
      localStorage.setItem(IS_RUNNING_KEY, merged.isRunning ? 'true' : 'false');
      localStorage.setItem('dailyProfit', String(merged.dailyProfit));
    } catch (e) {
      console.warn('[BackgroundKeepAlive] Failed to save state to localStorage:', e);
    }
  }

  public getState(): BackgroundTradingState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(BG_STATE_KEY);
      const isRunningRaw = localStorage.getItem(IS_RUNNING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isRunningRaw !== null) {
          parsed.isRunning = isRunningRaw === 'true';
        }
        return parsed;
      }
      if (isRunningRaw === 'true') {
        return {
          isRunning: true,
          startTime: Date.now(),
          dailyProfit: parseFloat(localStorage.getItem('dailyProfit') || '0'),
          target: 40,
          stoploss: -20,
          stake: 10.49,
          userStake: 10.0,
          lastTradeTime: 0,
          symbol: 'R_100',
          nextTradeSlot: Date.now() + 15 * 60 * 1000,
          accountType: 'real',
          completedBlocks: 0,
          skippedBlocks: 0,
        };
      }
    } catch (e) {
      console.warn('[BackgroundKeepAlive] Failed to read state from localStorage:', e);
    }
    return null;
  }

  public isEngineMarkedRunning(): boolean {
    if (typeof window === 'undefined') return false;
    const isRunning = localStorage.getItem(IS_RUNNING_KEY);
    if (isRunning === 'true') return true;
    const state = this.getState();
    return Boolean(state?.isRunning);
  }

  public startPeriodicPersistence(getStateFn: () => Partial<BackgroundTradingState>): void {
    if (this.persistenceTimer) clearInterval(this.persistenceTimer);
    // Every 5 seconds update localStorage as requested
    this.persistenceTimer = setInterval(() => {
      if (this.isEngineMarkedRunning()) {
        const latest = getStateFn();
        this.saveState(latest);
      }
    }, 5000);
  }

  public stopPeriodicPersistence(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
      this.persistenceTimer = null;
    }
  }

  // ==========================================
  // LAYER 2: WEB WORKER + WAKELOCK + AUDIO
  // ==========================================

  public initWorker(): Worker | null {
    if (typeof window === 'undefined') return null;
    if (this.worker) return this.worker;

    try {
      this.worker = new Worker('/tradingWorker.js');
      this.worker.onmessage = (e) => {
        const data = e.data;
        if (!data || !data.type) return;

        switch (data.type) {
          case 'WORKER_PULSE':
            this.pulseListeners.forEach((cb) => cb(data));
            break;

          case 'TARGET_HIT':
            console.log(`[BackgroundKeepAlive] TARGET HIT: $${data.profit} >= Target $${data.target}`);
            this.showNotification(
              '🎯 Target Hit - Auto-Stopped!',
              `Daily Target +$${data.profit.toFixed(2)} achieved with Zero Loss! Engine safely stopped.`,
              'target-hit'
            );
            this.targetHitListeners.forEach((cb) => cb(data));
            this.handleAutoStop('Target Hit');
            break;

          case 'STOPLOSS_HIT':
            console.log(`[BackgroundKeepAlive] STOP LOSS HIT: $${data.profit} <= SL $${data.stoploss}`);
            this.showNotification(
              '🛑 Stop Loss Hit - Auto-Stopped!',
              `Daily Stop Loss limit ($${data.profit.toFixed(2)}) reached. Engine stopped to protect capital.`,
              'stoploss-hit'
            );
            this.stoplossHitListeners.forEach((cb) => cb(data));
            this.handleAutoStop('Stoploss Hit');
            break;

          case 'SLOT_READY':
            console.log('[BackgroundKeepAlive] 15-Minute Slot Ready from Worker. Triggering trade evaluation.');
            this.slotReadyListeners.forEach((cb) => cb(data));
            break;
        }
      };

      console.log('[BackgroundKeepAlive] Web Worker initialized successfully.');
      return this.worker;
    } catch (err) {
      console.warn('[BackgroundKeepAlive] Failed to initialize Web Worker:', err);
      return null;
    }
  }

  public postMessageToWorker(msg: any): void {
    if (!this.worker) {
      this.initWorker();
    }
    if (this.worker) {
      this.worker.postMessage(msg);
    }
  }

  public async acquireWakeLock(): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }
    try {
      if (this.wakeLock !== null) {
        return true;
      }
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('[WakeLock] WakeLock ACTIVE');
      (window as any).wakeLock = this.wakeLock;

      this.wakeLock.addEventListener('release', () => {
        console.log('[WakeLock] Screen WakeLock was released.');
        this.wakeLock = null;
        (window as any).wakeLock = null;
      });
      return true;
    } catch (e) {
      console.warn('[WakeLock] Failed to acquire screen wake lock:', e);
      return false;
    }
  }

  public releaseWakeLock(): void {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
      if (typeof window !== 'undefined') {
        (window as any).wakeLock = null;
      }
      console.log('[WakeLock] WakeLock released by user/system.');
    }
  }

  /**
   * Silent Web Audio KeepAlive:
   * Plays a silent (0-volume) 0.1s audio loop every 20 seconds using AudioContext.
   * Prevents Android Chrome / WebViews from suspending the background tab process.
   */
  public startAudioKeepAlive(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      if (this.audioKeepAliveInterval) clearInterval(this.audioKeepAliveInterval);

      const playSilentPulse = () => {
        try {
          if (!this.audioCtx || this.audioCtx.state === 'closed') return;
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }

          // Create 0.1-second silent buffer
          const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.1, this.audioCtx.sampleRate);
          const source = this.audioCtx.createBufferSource();
          source.buffer = buffer;

          // Gain node set to zero volume
          const gainNode = this.audioCtx.createGain();
          gainNode.gain.setValueAtTime(0.00001, this.audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.000001, this.audioCtx.currentTime + 0.09);

          source.connect(gainNode);
          gainNode.connect(this.audioCtx.destination);

          source.start();
          source.stop(this.audioCtx.currentTime + 0.1);
        } catch {}
      };

      // Play immediately once, then repeat every 20 seconds
      playSilentPulse();
      this.audioKeepAliveInterval = setInterval(playSilentPulse, 20000);
      this.isKeepAliveActive = true;
      console.log('[AudioKeepAlive] Silent Audio KeepAlive loop active (20s interval).');
    } catch (e) {
      console.warn('[AudioKeepAlive] Failed to start audio keepalive:', e);
    }
  }

  public stopAudioKeepAlive(): void {
    if (this.audioKeepAliveInterval) {
      clearInterval(this.audioKeepAliveInterval);
      this.audioKeepAliveInterval = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close().catch(() => {});
      } catch {}
      this.audioCtx = null;
    }
    this.isKeepAliveActive = false;
    console.log('[AudioKeepAlive] Audio KeepAlive stopped.');
  }

  public getIsKeepAliveActive(): boolean {
    return this.isKeepAliveActive;
  }

  // ==========================================
  // LAYER 3: VISIBILITY & SCREEN-OFF HANDLING
  // ==========================================

  private initVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden;
      const isRunning = this.isEngineMarkedRunning();

      if (isHidden) {
        console.log('[Visibility] App in background, Worker still trading');
        if (isRunning && this.backgroundModeEnabled) {
          const state = this.getState();
          const target = state?.target || 40;
          const profit = state?.dailyProfit || 0;
          const nextSlot = state?.nextTradeSlot || (Date.now() + 15 * 60 * 1000);
          const remSec = Math.max(0, Math.ceil((nextSlot - Date.now()) / 1000));
          const m = Math.floor(remSec / 60);
          const s = remSec % 60;
          const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

          this.showNotification(
            'Nexora Running in Background 🔒',
            `Profit: $${profit.toFixed(2)} | Target: $${target} | Next trade in ${timeStr}`,
            'nexora-bg-status'
          );
        }
      } else {
        console.log('[Visibility] App returned to foreground. Syncing UI with Worker & Deriv WS.');
        // Re-acquire screen wakeLock if running
        if (isRunning) {
          this.acquireWakeLock();
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
        }
      }
    });
  }

  private initBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', () => {
      // Mandate: "On beforeunload: DON'T stop. Just save state. Remove warning. Let it run."
      const current = this.getState();
      if (current) {
        this.saveState(current);
      }
    });
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
    } catch {}
    return false;
  }

  public showNotification(title: string, body: string, tag: string = 'nexora'): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const now = Date.now();
      // Throttle notifications slightly unless critical tag
      if (tag === 'nexora-bg-status' && now - this.lastNotificationTime < 8000) {
        return;
      }
      this.lastNotificationTime = now;

      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          tag,
          icon: '/favicon.ico',
        });
      }
    } catch {}
  }

  // ==========================================
  // LAYER 4 & 5: START, STOP, & AUTO-STOP LOGIC
  // ==========================================

  public startBackgroundSession(config: {
    target?: number;
    stoploss?: number;
    stake?: number;
    userStake?: number;
    symbol?: string;
    dailyProfit?: number;
    accountType?: 'demo' | 'real';
  }): void {
    const target = config.target || 40;
    const stoploss = config.stoploss ? (config.stoploss > 0 ? -config.stoploss : config.stoploss) : -20;
    const userStake = config.userStake || 10;
    const stake = config.stake || (userStake / 0.953);
    const symbol = config.symbol || 'R_100';
    const now = Date.now();
    const nextSlot = now + 15 * 60 * 1000;

    const state: BackgroundTradingState = {
      isRunning: true,
      startTime: now,
      dailyProfit: config.dailyProfit || 0,
      target,
      stoploss,
      stake,
      userStake,
      lastTradeTime: 0,
      symbol,
      nextTradeSlot: nextSlot,
      accountType: config.accountType || 'real',
      completedBlocks: 0,
      skippedBlocks: 0,
      statusMessage: `LIVE (15M Sniper • Symbol: ${symbol} • Target: $${userStake.toFixed(2)} per 15M)`,
    };

    // 1. Save state immediately
    this.saveState(state);

    // 2. Request Notification Permission
    this.requestNotificationPermission();

    // 3. Acquire Screen WakeLock
    this.acquireWakeLock();

    // 4. Start Silent Audio KeepAlive
    this.startAudioKeepAlive();

    // 5. Initialize & Start Worker
    this.initWorker();
    this.postMessageToWorker({
      type: 'START',
      config: state,
    });

    // 6. Start 5s Periodic Persistence
    this.startPeriodicPersistence(() => this.getState() || state);

    console.log('[BackgroundKeepAlive] Background Session STARTED successfully.');
  }

  public stopBackgroundSession(reason: string = 'Stopped by User'): void {
    console.log(`[BackgroundKeepAlive] Stopping background session: ${reason}`);

    // 1. Terminate / Stop Worker
    if (this.worker) {
      this.postMessageToWorker({ type: 'STOP', reason });
      setTimeout(() => {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
      }, 300);
    }

    // 2. Release WakeLock
    this.releaseWakeLock();

    // 3. Stop Audio KeepAlive
    this.stopAudioKeepAlive();

    // 4. Stop Periodic Persistence
    this.stopPeriodicPersistence();

    // 5. Update state to isRunning = false
    const current = this.getState();
    const finalProfit = current?.dailyProfit || 0;
    this.saveState({
      isRunning: false,
      statusMessage: `${reason} - Final Profit: $${finalProfit.toFixed(2)}`,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(IS_RUNNING_KEY, 'false');
    }

    console.log(`[BackgroundKeepAlive] Engine stopped. Final Profit: $${finalProfit.toFixed(2)}`);
  }

  private handleAutoStop(reason: string): void {
    this.stopBackgroundSession(reason);
  }

  public recordTradeResult(profit: number, isWin: boolean): void {
    const current = this.getState();
    const currentProfit = current?.dailyProfit || 0;
    const newProfit = Number((currentProfit + profit).toFixed(2));
    const nextSlot = Date.now() + 15 * 60 * 1000;

    this.saveState({
      dailyProfit: newProfit,
      lastTradeTime: Date.now(),
      nextTradeSlot: nextSlot,
      completedBlocks: isWin ? (current?.completedBlocks || 0) + 1 : current?.completedBlocks,
    });

    // Notify worker
    this.postMessageToWorker({
      type: 'TRADE_RESULT',
      profit,
      isWin,
    });

    const target = current?.target || 40;
    const stoploss = current?.stoploss || -20;

    if (newProfit >= target) {
      this.showNotification(
        '🎯 Target Hit - Auto-Stopped!',
        `Profit target +$${newProfit.toFixed(2)} achieved with Zero Loss!`,
        'target-hit'
      );
      this.handleAutoStop('Target Hit');
    } else if (newProfit <= stoploss) {
      this.showNotification(
        '🛑 Stoploss Hit - Auto-Stopped!',
        `Stop loss limit reached ($${newProfit.toFixed(2)}). Capital protected.`,
        'stoploss-hit'
      );
      this.handleAutoStop('Stoploss Hit');
    }
  }

  // Toggle Background Mode
  public setBackgroundMode(enabled: boolean): void {
    this.backgroundModeEnabled = enabled;
    if (enabled && this.isEngineMarkedRunning()) {
      this.acquireWakeLock();
      this.startAudioKeepAlive();
    } else if (!enabled) {
      this.releaseWakeLock();
      this.stopAudioKeepAlive();
    }
  }

  public getBackgroundMode(): boolean {
    return this.backgroundModeEnabled;
  }

  // Subscriptions
  public onPulse(cb: (data: any) => void): () => void {
    this.pulseListeners.add(cb);
    return () => this.pulseListeners.delete(cb);
  }

  public onTargetHit(cb: (data: { profit: number; target: number }) => void): () => void {
    this.targetHitListeners.add(cb);
    return () => this.targetHitListeners.delete(cb);
  }

  public onStoplossHit(cb: (data: { profit: number; stoploss: number }) => void): () => void {
    this.stoplossHitListeners.add(cb);
    return () => this.stoplossHitListeners.delete(cb);
  }

  public onSlotReady(cb: (data: any) => void): () => void {
    this.slotReadyListeners.add(cb);
    return () => this.slotReadyListeners.delete(cb);
  }
}

export const backgroundKeepAlive = new BackgroundKeepAliveService();
