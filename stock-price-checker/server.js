'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Respect the first trusted reverse proxy so req.ip represents the client
// while avoiding unconditional trust of arbitrary X-Forwarded-For values.
app.set('trust proxy', 1);

// Security headers. Scripts, styles and API calls are restricted to this app.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'https://cdn.freecodecamp.org', 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' }
}));

app.disable('x-powered-by');
app.use('/public', express.static(__dirname + '/public'));
app.use(cors({ origin: '*' })); // Required for freeCodeCamp testing compatibility.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

fccTestingRoutes(app);
apiRoutes(app);

app.use(function (req, res) {
  res.status(404).type('text').send('Not Found');
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);

  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app;
