'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./db');
const apiRoutes = require('./routes/api');
const fccTestingRoutes = require('./routes/fcctesting');
const runner = require('./test-runner');

const app = express();

app.disable('x-powered-by');
app.use(helmet({
  referrerPolicy: {
    policy: 'same-origin'
  }
}));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/b/:board/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'board.html'));
});

app.get('/b/:board/:threadid', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'thread.html'));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

fccTestingRoutes(app);
apiRoutes(app);

app.use(function (req, res) {
  res.status(404).type('text').send('Not Found');
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('SQLite database: ' + db.name);
  console.log('Your app is listening on port ' + listener.address().port);

  if (process.env.NODE_ENV === 'test' && require.main === module) {
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.error('Tests are not valid:', error);
      }
    }, 1500);
  }
});

module.exports = app;
