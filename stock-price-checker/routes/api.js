'use strict';

const crypto = require('crypto');
const https = require('https');

const STOCK_PROXY = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock';
const runtimeSalt = process.env.IP_HASH_SALT || crypto.randomBytes(32).toString('hex');

// Runtime-only store: symbol -> Set of anonymized IP hashes.
// No raw IP address is persisted.
const likesByStock = new Map();

function anonymizeIp(ip) {
  return crypto
    .createHash('sha256')
    .update(runtimeSalt + ':' + String(ip || 'unknown'))
    .digest('hex');
}

function getLikeSet(symbol) {
  if (!likesByStock.has(symbol)) {
    likesByStock.set(symbol, new Set());
  }
  return likesByStock.get(symbol);
}

function requestJson(url, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'freeCodeCamp-stock-price-checker'
        },
        timeout: 10000
      },
      response => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location &&
          redirectsLeft > 0
        ) {
          response.resume();
          const redirected = new URL(response.headers.location, url).toString();
          resolve(requestJson(redirected, redirectsLeft - 1));
          return;
        }

        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error('Stock proxy returned HTTP ' + response.statusCode));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error('Stock proxy returned invalid JSON'));
          }
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('Stock proxy request timed out'));
    });
    request.on('error', reject);
  });
}

async function fetchStock(symbol) {
  const url = STOCK_PROXY + '/' + encodeURIComponent(symbol) + '/quote';
  const data = await requestJson(url);
  const price = Number(data.latestPrice ?? data.price ?? data.close);

  if (!Number.isFinite(price)) {
    throw new Error('No valid price returned for ' + symbol);
  }

  return {
    stock: String(data.symbol || symbol).toUpperCase(),
    price
  };
}

function normalizeStocks(queryValue) {
  const values = Array.isArray(queryValue) ? queryValue : [queryValue];

  return values
    .filter(value => typeof value === 'string')
    .map(value => value.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 2);
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    const symbols = normalizeStocks(req.query.stock);

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'A stock symbol is required' });
    }

    const shouldLike = req.query.like === true || String(req.query.like).toLowerCase() === 'true';
    const ipHash = anonymizeIp(req.ip || req.socket.remoteAddress);

    try {
      const quotes = await Promise.all(symbols.map(fetchStock));

      const records = quotes.map(quote => {
        const likeSet = getLikeSet(quote.stock);
        if (shouldLike) {
          likeSet.add(ipHash);
        }

        return {
          stock: quote.stock,
          price: quote.price,
          likes: likeSet.size
        };
      });

      if (records.length === 1) {
        return res.json({ stockData: records[0] });
      }

      const difference = records[0].likes - records[1].likes;
      return res.json({
        stockData: [
          {
            stock: records[0].stock,
            price: records[0].price,
            rel_likes: difference
          },
          {
            stock: records[1].stock,
            price: records[1].price,
            rel_likes: -difference
          }
        ]
      });
    } catch (error) {
      console.error(error.message);
      return res.status(502).json({ error: 'Unable to retrieve stock price data' });
    }
  });
};

module.exports._test = {
  anonymizeIp,
  likesByStock,
  normalizeStocks
};
