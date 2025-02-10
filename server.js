const express = require('express');
const { initializeDatabase } = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialiser la base de données au démarrage
initializeDatabase();

// Exemple de route
app.get('/', (req, res) => {
  res.send('Bienvenue sur SUPMAP API 🚀');
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const itineraryRoutes = require('./routes/itineraryRoutes');
app.use('/api/itineraries', itineraryRoutes);

const incidentRoutes = require('./routes/incidentRoutes');
app.use('/api/incidents', incidentRoutes);


// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
