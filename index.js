const express = require('express');
const app = express();
const cors = require('cors');

// CORS middleware para que la API sea accesible por freeCodeCamp
app.use(cors({ optionsSuccessStatus: 200 }));

// Servir la vista principal
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Endpoint principal del Request Header Parser
app.get('/api/whoami', (req, res) => {
  // Extraemos la información de los headers y del request
  const ipaddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];

  // Devolvemos el JSON solicitado
  res.json({
    ipaddress: ipaddress,
    language: language,
    software: software
  });
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`La API de Header Parser está corriendo en http://localhost:${PORT}`);
});
