const https = require('https');

const API_KEY = '9c5f42a1906f4614b2f41caa055ee551';

const BATCHES = [
  ['EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','USD/CAD','NZD/USD','EUR/GBP'],
  ['EUR/JPY','GBP/JPY','XAU/USD','XAG/USD','BTC/USD','ETH/USD','XRP/USD'],
];

let cache = {};
let batchIndex = 0;

function fetchBatch(symbols) {
  return new Promise((resolve, reject) => {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(','))}&apikey=${API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Parse error')); }
      });
    }).on('error', reject);
  });
}

async function refreshBatch() {
  try {
    const batch = BATCHES[batchIndex];
    const data = await fetchBatch(batch);
    Object.assign(cache, data);
    console.log(`Batch ${batchIndex + 1} updated — ${Object.keys(cache).length} symbols cached`);
    batchIndex = (batchIndex + 1) % BATCHES.length;
  } catch(e) {
    console.error('Batch error:', e.message);
  }
}

// refresh one batch every 65 seconds — full cycle every ~2 minutes
setInterval(refreshBatch, 65000);
refreshBatch(); // load first batch on startup

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url === '/prices') {
    res.writeHead(200);
    res.end(JSON.stringify(cache));
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'Infinity ECN API running', cached: Object.keys(cache).length }));
  }
}

const PORT = process.env.PORT || 3000;
require('http').createServer(handler).listen(PORT, () => {
  console.log('Infinity ECN API running on port ' + PORT);
});
