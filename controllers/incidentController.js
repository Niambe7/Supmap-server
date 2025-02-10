const { pool } = require('../db'); // Connexion à PostgreSQL

// Signaler un incident
const reportIncident = async (req, res) => {
  const { type, latitude, longitude, description, user_id } = req.body;

  // Vérification des champs obligatoires
  if (!type || !latitude || !longitude || !user_id) {
    return res.status(400).json({ error: "Les champs 'type', 'latitude', 'longitude' et 'user_id' sont requis." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO incidents (type, latitude, longitude, description, user_id, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [type, latitude, longitude, description || '', user_id]
    );

    res.status(201).json({
      message: "Incident signalé avec succès",
      incident: result.rows[0]
    });

  } catch (error) {
    console.error("Erreur lors du signalement de l'incident :", error.message);
    res.status(500).json({ error: "Erreur lors du signalement de l'incident." });
  }
};

module.exports = { reportIncident };
