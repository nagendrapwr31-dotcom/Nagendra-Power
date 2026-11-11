import { calculateAnalysis } from '../src/services/analysisIndicators.js';

console.log('====================================================');
console.log('   TESTING REAL calculateAnalysis (RSI & SMA)       ');
console.log('====================================================\n');

// 1. Insufficient data (< 14)
const fewPrices = [10, 11, 12, 11, 10];
console.log('Case 1: Insufficient Data (< 14 prices):');
console.log(calculateAnalysis(fewPrices));

// 2. Normal / Neutral market prices
const normalPrices = [
  100, 101, 102, 101, 100, 99, 100, 101, 102, 101, 100, 101, 102, 101, 100, 101
];
console.log('\nCase 2: Neutral Trend (16 prices):');
console.log(calculateAnalysis(normalPrices));

// 3. Strong Uptrend / Overbought (RSI > 70)
const uptrendPrices = [
  100, 102, 104, 106, 108, 110, 113, 116, 120, 124, 128, 133, 138, 144, 150, 156
];
console.log('\nCase 3: Strong Uptrend (RSI > 70 -> OVERBOUGHT / SELL):');
console.log(calculateAnalysis(uptrendPrices));

// 4. Strong Downtrend / Oversold (RSI < 30)
const downtrendPrices = [
  150, 146, 142, 138, 134, 130, 125, 120, 114, 108, 102, 96, 90, 84, 78, 72
];
console.log('\nCase 4: Strong Downtrend (RSI < 30 -> OVERSOLD / BUY):');
console.log(calculateAnalysis(downtrendPrices));
