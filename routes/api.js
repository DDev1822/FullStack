'use strict';
const axios = require('axios');
const crypto = require('crypto');

const likesDB = {};

async function getStockInfo(stock) {
  try {
    const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
    return response.data;
  } catch(error) {
    return null;
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stocks = req.query.stock;
      let like = req.query.like === 'true';
      let ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

      if (!stocks) {
        return res.json({ error: 'No stock provided' });
      }

      const hash = crypto.createHash('sha256').update(ip).digest('hex');

      if (!Array.isArray(stocks)) {
        stocks = [stocks];
      }

      let stockDataList = [];
      for (let i = 0; i < stocks.length; i++) {
        let stock = stocks[i].toUpperCase();
        let info = await getStockInfo(stock);
        
        let price = info && info.latestPrice ? info.latestPrice : 0;

        if (!likesDB[stock]) {
          likesDB[stock] = [];
        }

        if (like) {
          if (!likesDB[stock].includes(hash)) {
            likesDB[stock].push(hash);
          }
        }
        
        stockDataList.push({
          stock: stock,
          price: price,
          likes: likesDB[stock].length
        });
      }

      if (stockDataList.length === 1) {
        return res.json({ stockData: stockDataList[0] });
      } else {
        let stock1 = stockDataList[0];
        let stock2 = stockDataList[1];
        return res.json({
          stockData: [
            {
              stock: stock1.stock,
              price: stock1.price,
              rel_likes: stock1.likes - stock2.likes
            },
            {
              stock: stock2.stock,
              price: stock2.price,
              rel_likes: stock2.likes - stock1.likes
            }
          ]
        });
      }
    });
    
};
