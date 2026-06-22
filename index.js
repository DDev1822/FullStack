const express = require('express');
const app = express();
const cors = require('cors');

// CORS middleware es requerido por FCC para poder testear tu API
app.use(cors({ optionsSuccessStatus: 200 }));

// Archivos estáticos (la vista principal)
app.use(express.static(__dirname));

// Ruta principal que muestra el index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Endpoint principal del Timestamp Microservice
app.get('/api/:date?', (req, res) => {
  let dateString = req.params.date;
  let date;

  // 1. Si no se proporciona ninguna fecha, usar la fecha actual
  if (!dateString) {
    date = new Date();
  } else {
    // 2. Comprobar si dateString es un timestamp numérico (por ejemplo: "1451001600000")
    // La expresión regular verifica si contiene ÚNICAMENTE dígitos
    if (/^\d+$/.test(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      // 3. De lo contrario, intentar parsear como una fecha normal (ej: "2015-12-25")
      date = new Date(dateString);
    }
  }

  // 4. Si la fecha parseada es inválida
  if (date.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  // 5. Devolver el JSON con los dos formatos solicitados
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`La API está corriendo en http://localhost:${PORT}`);
});
