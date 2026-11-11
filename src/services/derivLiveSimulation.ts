export interface SimulatedTick {
  price: number;
  digit: number;
  timestamp: string;
}

export interface MarketAnalysisInsight {
  trend: 'RISE 📈' | 'FALL 📉';
  moving_avg_5pt: number;
  dominant_digit_10pt: number;
}

export interface SimulationTradeResult {
  tradeNumber: number;
  contractType: 'rise' | 'fall';
  stake: number;
  entryPrice: number;
  exitPrice: number;
  isWin: boolean;
  profit: number;
  balance: number;
  currency: string;
}

export class DerivLiveSimulationTS {
  public balance: number;
  public initialBalance: number;
  public currency: string;
  public currentPrice: number = 2500.0;
  public tickHistory: SimulatedTick[] = [];

  public totalTrades: number = 0;
  public totalWins: number = 0;
  public totalLosses: number = 0;
  public cycleTrades: number = 0;
  public cycleLosses: number = 0;
  public maxCycleLosses: number = 1; // Strictly 1 or 2 losses maximum per 10-trade cycle

  constructor(initialBalance: number = 1000.0, targetCurrency: string = 'USD') {
    this.balance = initialBalance;
    this.initialBalance = initialBalance;
    this.currency = targetCurrency;
  }

  public streamLiveTick(): { price: number; digit: number } {
    const priceChange = (Math.random() - 0.49) * 9.0;
    this.currentPrice = parseFloat((this.currentPrice + priceChange).toFixed(2));
    const priceStr = this.currentPrice.toFixed(2);
    const lastDigit = parseInt(priceStr.slice(-1), 10);

    this.tickHistory.push({
      price: this.currentPrice,
      digit: lastDigit,
      timestamp: new Date().toISOString(),
    });

    if (this.tickHistory.length > 100) {
      this.tickHistory.shift();
    }

    return { price: this.currentPrice, digit: lastDigit };
  }

  public analyzeMarketData(): MarketAnalysisInsight | 'Awaiting Data Collection' {
    if (this.tickHistory.length < 5) {
      return 'Awaiting Data Collection';
    }

    const recentPrices = this.tickHistory.slice(-5).map((t) => t.price);
    const recentDigits = this.tickHistory.slice(-10).map((t) => t.digit);

    const movingAverage = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

    // Calculate dominant digit frequency
    const freqMap: Record<number, number> = {};
    recentDigits.forEach((d) => {
      freqMap[d] = (freqMap[d] || 0) + 1;
    });

    let dominantDigit = recentDigits[0];
    let maxFreq = 0;
    for (const [digitStr, freq] of Object.entries(freqMap)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        dominantDigit = parseInt(digitStr, 10);
      }
    }

    const trend: 'RISE 📈' | 'FALL 📉' =
      this.currentPrice > movingAverage ? 'RISE 📈' : 'FALL 📉';

    return {
      trend,
      moving_avg_5pt: parseFloat(movingAverage.toFixed(2)),
      dominant_digit_10pt: dominantDigit,
    };
  }

  public executeSimulatedContract(
    contractType: 'rise' | 'fall',
    stake: number
  ): SimulationTradeResult | null {
    if (stake > this.balance) {
      console.warn(`[Deriv Simulation] Insufficient balance: $${this.balance} < $${stake}`);
      return null;
    }

    const entryPrice = this.currentPrice;
    this.totalTrades++;
    this.cycleTrades++;
    const currentPosInCycle = ((this.cycleTrades - 1) % 10) + 1;
    if (currentPosInCycle === 1) {
      this.cycleLosses = 0;
    }

    // Tick forward
    this.streamLiveTick();

    // Enforce Rule: "Only profit make 1 or 2 loss kk"
    // Max 1 or 2 losses in 10-trade cycle
    const allowLoss =
      this.cycleLosses < this.maxCycleLosses &&
      (currentPosInCycle === 4 || currentPosInCycle === 7) &&
      Math.random() < 0.25;

    let isWin = false;
    let exitPrice = this.currentPrice;

    if (allowLoss) {
      isWin = false;
      this.cycleLosses++;
      this.totalLosses++;
      exitPrice =
        contractType === 'rise'
          ? parseFloat((entryPrice - 0.45).toFixed(2))
          : parseFloat((entryPrice + 0.45).toFixed(2));
      this.currentPrice = exitPrice;
      this.balance = parseFloat((this.balance - stake).toFixed(2));
    } else {
      isWin = true;
      this.totalWins++;
      exitPrice =
        contractType === 'rise'
          ? parseFloat((entryPrice + 0.65).toFixed(2))
          : parseFloat((entryPrice - 0.65).toFixed(2));
      this.currentPrice = exitPrice;
      const netProfit = parseFloat((stake * 0.95).toFixed(2));
      this.balance = parseFloat((this.balance + netProfit).toFixed(2));
    }

    const result: SimulationTradeResult = {
      tradeNumber: this.totalTrades,
      contractType,
      stake,
      entryPrice,
      exitPrice,
      isWin,
      profit: isWin ? parseFloat((stake * 0.95).toFixed(2)) : -stake,
      balance: this.balance,
      currency: this.currency,
    };

    return result;
  }

  public dispatchBalanceUpdate(): { msg_type: string; balance: { balance: number; currency: string; timestamp: number } } {
    return {
      msg_type: 'balance',
      balance: {
        balance: this.balance,
        currency: this.currency,
        timestamp: Math.floor(Date.now() / 1000),
      },
    };
  }
}
