const { pool } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ✅ Importer JWT

// Fonction de connexion
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Les champs email et password sont requis.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'SECRET_KEY',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token, // ✅ Le token est ajouté ici
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};

// Assurer que la fonction est bien exportée
module.exports = {loginUser };
