import { RSI, SMA } from 'technicalindicators';

export interface AnalysisResult {
  rsi: number | null;
  sma: number | null;
  signal: 'NEUTRAL' | 'OVERBOUGHT / SELL' | 'OVERSOLD / BUY';
  status?: string;
}

/**
 * Calculates RSI and SMA for a given array of close prices.
 * @param prices - Array of historical closing prices
 * @returns Calculated indicators and trading signal
 */
export function calculateAnalysis(prices: number[]): AnalysisResult {
  if (!prices || prices.length < 14) {
    return { rsi: null, sma: null, signal: 'NEUTRAL', status: 'Insufficient Data' };
  }

  const rsiValues = RSI.calculate({ values: prices, period: 14 });
  const smaValues = SMA.calculate({ values: prices, period: 14 });

  const currentRSI = rsiValues && rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;
  const currentSMA = smaValues && smaValues.length > 0 ? smaValues[smaValues.length - 1] : null;

  let signal: 'NEUTRAL' | 'OVERBOUGHT / SELL' | 'OVERSOLD / BUY' = 'NEUTRAL';
  if (currentRSI !== null && currentRSI > 70) signal = 'OVERBOUGHT / SELL';
  if (currentRSI !== null && currentRSI < 30) signal = 'OVERSOLD / BUY';

  return {
    rsi: currentRSI !== null ? parseFloat(currentRSI.toFixed(2)) : null,
    sma: currentSMA !== null ? parseFloat(currentSMA.toFixed(4)) : null,
    signal,
  };
}
