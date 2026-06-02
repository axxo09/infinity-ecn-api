const https = require('https');

const API_KEY = '9c5f42a1906f4614b2f41caa055ee551';

const SYMBOLS = [
  'EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','USD/CAD',
  'NZD/USD','EUR/GBP','EUR/JPY','GBP/JPY',
  'XAU/USD','XAG/USD',
  'WTI/USD','XBR/USD','NGAS/USD',
  'BTC/USD','ETH/USD','XRP/USD',
].join(',');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
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

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/prices') {
    try {
      const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(SYMBOLS)}&apikey=${API_KEY}`;
      const data = await fetchUrl(url);
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch(e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'Infinity ECN API running' }));
  }
}

const PORT = process.env.PORT || 3000;
require('http').createServer(handler).listen(PORT, () => {
  console.log('Infinity ECN API running on port ' + PORT);
});
