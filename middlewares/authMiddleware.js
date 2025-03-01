const jwt = require('jsonwebtoken');
require('dotenv').config(); // Charger la SECRET_KEY depuis `.env`

const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization']; // Récupération du token

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET_KEY);
    req.user = decoded; // Ajouter les infos utilisateur dans `req.user`
    next(); // Passer à l'action suivante
  } catch (error) {
    return res.status(403).json({ error: "Token invalide ou expiré." });
  }
};

module.exports = authenticateUser;
