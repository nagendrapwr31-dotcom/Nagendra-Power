import WebSocket from 'ws';

console.log('Connecting to Deriv WebSocket wss://ws.derivws.com/websockets/v3?app_id=1089 ...');
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  console.log('Connected! Sending ping, ticks, history and candles for 1HZ100V...');
  ws.send(JSON.stringify({ ping: 1 }));
  ws.send(JSON.stringify({ ticks: '1HZ100V', subscribe: 1 }));
  ws.send(JSON.stringify({ ticks_history: '1HZ100V', count: 50, end: 'latest', style: 'ticks' }));
  ws.send(JSON.stringify({ ticks_history: '1HZ100V', count: 50, end: 'latest', style: 'candles', granularity: 900 }));
  
  // Also send proposal request for 95% payout contracts to test Deriv proposal response
  ws.send(JSON.stringify({
    proposal: 1,
    amount: 10,
    basis: 'stake',
    contract_type: 'DIGITOVER',
    currency: 'USD',
    duration: 1,
    duration_unit: 't',
    symbol: '1HZ100V',
    barrier: '4'
  }));
  ws.send(JSON.stringify({
    proposal: 1,
    amount: 10,
    basis: 'stake',
    contract_type: 'CALL',
    currency: 'USD',
    duration: 15,
    duration_unit: 'm',
    symbol: '1HZ100V'
  }));
});

let msgCount = 0;
ws.on('message', (raw) => {
  msgCount++;
  const data = JSON.parse(raw.toString());
  console.log(`[MSG #${msgCount}] msg_type: ${data.msg_type}`, {
    error: data.error,
    echo_req: data.echo_req,
    history_count: data.history?.prices?.length,
    candles_count: data.candles?.length,
    tick: data.tick ? { quote: data.tick.quote, symbol: data.tick.symbol } : undefined,
    proposal: data.proposal ? { id: data.proposal.id, payout: data.proposal.payout, ask_price: data.proposal.ask_price } : undefined,
  });
});

setTimeout(() => {
  console.log('Diagnosis completed. Closing.');
  ws.close();
  process.exit(0);
}, 5000);
