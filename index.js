const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Bases de datos en memoria para el testeo local
const users = [];
const exercises = [];

// Función para generar un ID aleatorio simple (simulando a MongoDB)
const generateId = () => Math.random().toString(36).substring(2, 15);

// 1. Crear un usuario
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = {
    username: username,
    _id: generateId()
  };
  users.push(newUser);
  res.json(newUser);
});

// 2. Obtener la lista de usuarios
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 3. Añadir un ejercicio a un usuario
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Parsear la fecha. Si no hay fecha provista, usar la fecha de hoy.
  let exerciseDate = date ? new Date(date) : new Date();
  
  // Guardar en la "base de datos"
  const newExercise = {
    userId: user._id,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString() // Formato estricto que pide FCC: "Mon Jan 01 1990"
  };
  exercises.push(newExercise);

  // El test requiere devolver el objeto del usuario más los campos del ejercicio
  res.json({
    _id: user._id,
    username: user.username,
    date: newExercise.date,
    duration: newExercise.duration,
    description: newExercise.description
  });
});

// 4. Obtener el log de ejercicios de un usuario
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Filtrar solo los ejercicios pertenecientes a este usuario
  let userExercises = exercises.filter(e => e.userId === userId);

  // Aplicar filtros de fecha si existen en la query string (?from=...&to=...)
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  // Aplicar límite si existe (?limit=2)
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  // Formatear el log tal cual como espera freeCodeCamp
  const log = userExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`La API Exercise Tracker está corriendo en http://localhost:${PORT}`);
});
