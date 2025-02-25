const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Endpoint pour gérer la connexion avec Google
router.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    // Vérifier le token avec Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub } = ticket.getPayload(); // Récupérer les infos utilisateur

    // Vérifier si l'utilisateur existe déjà en base
    let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      // Si l'utilisateur n'existe pas, l'ajouter
      result = await pool.query(
        "INSERT INTO users (name, email, provider, provider_id) VALUES ($1, $2, 'google', $3) RETURNING *",
        [name, email, sub]
      );
    }

    const user = result.rows[0];

    // Générer un token JWT pour l'authentification
    const jwtToken = jwt.sign({ id: user.id, email: user.email }, "SECRET_KEY", { expiresIn: "1h" });

    res.json({ token: jwtToken });
  } catch (error) {
    console.error("Erreur lors de l'auth Google :", error);
    res.status(401).json({ error: "Authentification Google échouée" });
  }
});

module.exports = router;
