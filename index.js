const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static(__dirname));

// Configurar multer para que mantenga los archivos subidos en la memoria RAM 
// (en lugar de guardarlos en el disco duro, ya que solo necesitamos leer su metadata para el test)
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Endpoint POST para analizar el archivo. 
// "upload.single('upfile')" intercepta el archivo que viene en el input con name="upfile"
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  // Verificamos si se subió un archivo
  if (!req.file) {
    return res.json({ error: 'Please upload a file' });
  }

  // Devolver el nombre, el tipo (MIME) y el tamaño en bytes
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`La API File Metadata está corriendo en http://localhost:${PORT}`);
});
