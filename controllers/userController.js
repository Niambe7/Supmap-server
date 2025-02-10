const { pool } = require('../db'); // Connexion à la base de données
const bcrypt = require('bcrypt'); // Importer bcrypt

// Ajouter un utilisateur avec chiffrement du mot de passe
const addUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Vérification des champs obligatoires
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Les champs name, email et password sont requis.' });
  }

  try {
    // Générer un hash pour le mot de passe
    const saltRounds = 10; // Nombre de tours pour le sel
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insérer l'utilisateur avec le mot de passe chiffré
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      // Gérer les doublons d'email
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Lister tous les utilisateurs
const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fonction pour connecter un utilisateur
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Vérification des champs obligatoires
  if (!email || !password) {
    return res.status(400).json({ error: 'Les champs email et password sont requis.' });
  }

  try {
    // Récupérer l'utilisateur par email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = result.rows[0];

    // Comparer le mot de passe fourni avec le hash stocké
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Si la connexion est réussie
    res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};

module.exports = { addUser, getUsers, loginUser };
