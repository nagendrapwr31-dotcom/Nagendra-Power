import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

// Deriv API configuration (ws.binaryws.com requires numeric app_id, e.g. 1089)
const APP_ID = /^\d+$/.test(process.env.DERIV_APP_ID || '') ? process.env.DERIV_APP_ID : '1089';
const API_TOKEN =
  process.argv[2] ||
  process.env.DERIV_TOKEN ||
  process.env.livedataanalysis ||
  process.env.LIVEDATAANALYSIS ||
  'YOUR_API_TOKEN';

// Official Deriv WebSocket Endpoint (fixing the wss://:// typo)
const WS_URL = `wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`;

console.log('========================================================');
console.log('   DERIV LIVE BALANCE WEBSOCKET LISTENER               ');
console.log('========================================================');
console.log(`Connecting to: ${WS_URL}`);
console.log(`App ID:        ${APP_ID}`);
console.log(`Token:         ${API_TOKEN ? API_TOKEN.slice(0, 4) + '...' + API_TOKEN.slice(-4) : 'None'}\n`);

const ws = new WebSocket(WS_URL);

ws.on('open', function open() {
  console.log('Connected to Deriv API. Authorizing...');

  // Authorize first using your API token (required for balance data)
  if (API_TOKEN && API_TOKEN !== 'YOUR_API_TOKEN') {
    ws.send(JSON.stringify({ authorize: API_TOKEN }));
  } else {
    console.log('No live token provided, requesting public ping/active symbols...');
    ws.send(JSON.stringify({ ping: 1 }));
  }
});

ws.on('message', function message(data) {
  try {
    const response = JSON.parse(data.toString());
    const msgType = response.msg_type;

    // Once authorization succeeds, subscribe to live balance updates
    if (msgType === 'authorize') {
      if (response.error) {
        console.error('Authorization failed:', response.error.message);
      } else {
        console.log('Authorized successfully for user:', response.authorize.loginid);
        console.log(`Email:       ${response.authorize.email || 'N/A'}`);
        console.log(`Currency:    ${response.authorize.currency}`);
        console.log(`Initial Bal: ${response.authorize.balance} ${response.authorize.currency}\n`);

        // Send balance request with subscription enabled (subscribe: 1)
        console.log('Subscribing to live balance stream: { balance: 1, subscribe: 1 }');
        ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
      }
    }

    // Handle incoming live balance data stream
    if (msgType === 'balance') {
      if (response.error) {
        console.error('Balance error:', response.error.message);
      } else {
        const balanceData = response.balance;
        const subId = response.subscription ? response.subscription.id : 'N/A';
        console.log('\n--- Live Balance Update ---');
        console.log('Login ID:        ', balanceData.loginid);
        console.log('Balance:         ', balanceData.balance);
        console.log('Currency:        ', balanceData.currency);
        console.log('Subscription ID: ', subId);
        console.log('Timestamp:       ', new Date().toISOString());
        console.log('---------------------------');
      }
    }

    if (msgType === 'ping') {
      console.log('Deriv API Ping Response: Pong acknowledged.');
    }
  } catch (err) {
    console.error('Error parsing WebSocket message:', err.message);
  }
});

ws.on('error', function error(err) {
  console.error('WebSocket Error:', err.message || err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed.');
});

// Run for 5 seconds during test and gracefully close
setTimeout(() => {
  console.log('\nGracefully closing balance subscription...');
  ws.close();
  process.exit(0);
}, 5000);
