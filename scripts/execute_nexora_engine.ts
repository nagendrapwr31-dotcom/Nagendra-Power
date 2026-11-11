import { ExactNexoraBackendScanner } from '../src/services/backendScanner.js';
import dotenv from 'dotenv';
dotenv.config();

const API_TOKEN =
  process.env.livedataanalysis ||
  process.env.LIVEDATAANALYSIS ||
  process.env.DERIV_TOKEN ||
  '';

console.log('================================================================');
console.log('       NEXORA AI ALGORITHMIC TRADING ENGINE (DERIV WS)         ');
console.log('       Target: Volatility 100 (1s) Index [R_100]               ');
console.log('================================================================\n');

// Configure: baseStake = $1.00, profitTarget = $3.00 (to demonstrate clean auto-stop), maxLoss = $20.00
const engine = new ExactNexoraBackendScanner(API_TOKEN, 1.0, 3.0, 20.0);

engine.start();

// Guard against indefinite runs
setTimeout(() => {
  const status = engine.getStatus();
  if (status.isRunning) {
    console.log('\n[INFO] Timeout limit reached for demonstration run. Finalizing...');
    engine.stop();
  }
  process.exit(0);
}, 28000);
