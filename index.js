const express = require('express');
const app = express();
const cors = require('cors');
const dns = require('dns');
const url = require('url');

// CORS middleware
app.use(cors({ optionsSuccessStatus: 200 }));

// Body parsing middleware para poder leer req.body.url de los POST requests
// (¡Requerido por freeCodeCamp como indicaba el Hint!)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos (la vista principal)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// "Base de datos" en memoria para este microservicio
// Nota: en producción usaríamos MongoDB, pero esto funciona perfecto para el test
const urlDatabase = {};
let shortUrlCounter = 1;

// Endpoint POST para acortar una URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // 1. Verificar formato general de la URL
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // 2. Extraer el hostname usando el módulo nativo de URL
  let hostname;
  try {
    const parsedUrl = new URL(originalUrl);
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // 3. Validar DNS como pide freeCodeCamp (dns.lookup)
  dns.lookup(hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    }

    // 4. Si es válida, guardar y responder
    const shortUrl = shortUrlCounter;
    urlDatabase[shortUrl] = originalUrl;
    shortUrlCounter++;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// Endpoint GET para redirigir desde la URL corta a la original
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl); // Redirección HTTP 302 hacia la original
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`La API Shortener está corriendo en http://localhost:${PORT}`);
});
