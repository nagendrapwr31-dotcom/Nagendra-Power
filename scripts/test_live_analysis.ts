import { liveAnalysisEngine } from '../src/services/derivLiveAnalysisEngine.js';

console.log('=============================================');
console.log('   DERIV LIVE DATA ANALYSIS CLONE RUNNER     ');
console.log('=============================================\n');

liveAnalysisEngine.start();

setTimeout(() => {
  const status = liveAnalysisEngine.getStatus();
  console.log('\nFinal Market Status:');
  console.log(JSON.stringify(status, null, 2));
  liveAnalysisEngine.stop();
  process.exit(0);
}, 6000);
