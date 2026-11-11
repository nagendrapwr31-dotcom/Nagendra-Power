const { RSI, SMA } = require('technicalindicators');

/**
 * Calculates RSI and SMA for a given array of close prices.
 * @param {Array<number>} prices - Array of historical closing prices
 * @returns {Object} Calculated indicators
 */
function calculateAnalysis(prices) {
  if (!prices || prices.length < 14) {
    return { rsi: null, sma: null, signal: 'NEUTRAL', status: 'Insufficient Data' };
  }

  const rsiValues = RSI.calculate({ values: prices, period: 14 });
  const smaValues = SMA.calculate({ values: prices, period: 14 });

  const currentRSI = rsiValues[rsiValues.length - 1] || null;
  const currentSMA = smaValues[smaValues.length - 1] || null;

  let signal = 'NEUTRAL';
  if (currentRSI > 70) signal = 'OVERBOUGHT / SELL';
  if (currentRSI < 30) signal = 'OVERSOLD / BUY';

  return {
    rsi: currentRSI ? parseFloat(currentRSI.toFixed(2)) : null,
    sma: currentSMA ? parseFloat(currentSMA.toFixed(4)) : null,
    signal,
  };
}

module.exports = { calculateAnalysis };
