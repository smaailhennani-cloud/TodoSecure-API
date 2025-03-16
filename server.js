const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:4200', 'https://smaail-hennani.github.io'] }));

app.use(express.json());

app.use('', routes);

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
