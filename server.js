const express = require('express');
const { initializeDatabase } = require('./db');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const cors = require('cors') 
const authRoutes = require("./routes/auth");


const app = express();
app.use(express.json());

// Initialiser la base de données au démarrage
initializeDatabase();

// Exemple de route
app.get('/', (req, res) => {
  res.send('Bienvenue sur SUPMAP API 🚀');
});

app.use(cors());
app.use(session({ secret: 'SECRET_KEY', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
app.use("/api/users", authRoutes);


const itineraryRoutes = require('./routes/itineraryRoutes');
app.use('/api/itineraries', itineraryRoutes);

const incidentRoutes = require('./routes/incidentRoutes');
app.use('/api/incidents', incidentRoutes);


// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
