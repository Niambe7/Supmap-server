const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion à PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Création des tables avec relations
const initializeDatabase = async () => {
  try {
    await pool.query(`
      -- Table USERS
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        provider VARCHAR(50),
        provider_id VARCHAR(100),
        role VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Table INCIDENTS
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50),
        latitude FLOAT,
        longitude FLOAT,
        description TEXT,
        status VARCHAR(20),
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Table ITINERARIES
      CREATE TABLE IF NOT EXISTS itineraries (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        start_location VARCHAR(255),
        end_location VARCHAR(255),
        route_points TEXT,
        duration INT,
        distance FLOAT,
        cost FLOAT,
        toll_free BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Table ALERTS
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        itinerary_id INT REFERENCES itineraries(id) ON DELETE CASCADE,
        type VARCHAR(50),
        description TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );

      -- Table CONTRIBUTIONS
      CREATE TABLE IF NOT EXISTS contributions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
        validation BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Table TRAFFIC_DATA
      CREATE TABLE IF NOT EXISTS traffic_data (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255),
        time_of_day TIME,
        day_of_week VARCHAR(50),
        traffic_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Base de données initialisée avec relations 🚀');
  } catch (err) {
    console.error('Erreur lors de l’initialisation de la base de données :', err);
  }
};

module.exports = { pool, initializeDatabase };