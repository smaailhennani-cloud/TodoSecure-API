// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
app.use(cors({ origin: ['http://localhost:4200', 'https://gylgamesh34.github.io'] }));

app.use(express.json()); // Middleware pour le parsing JSON

// Routes
app.use('/users', userRoutes);
app.use('/todos', todoRoutes);

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
