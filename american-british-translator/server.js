'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

require('./routes/api.js')(app);

app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`American/British Translator listening on port ${port}`);
  });
}

module.exports = app;
