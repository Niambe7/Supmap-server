const express = require('express');
const passport = require('passport');
require('../config/passports')
const { loginUser , registerUser } = require('../controllers/userController');
const router = express.Router();

router.post('/login', loginUser);

router.post('/register', registerUser);

// Démarrer l'authentification Google
router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  // Callback après l'authentification Google
  router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Retourner le token JWT après succès
      const token = req.user.token;
      // 🔹 Remplace `myapp://redirect` par ton schéma d'URL défini dans Expo
      res.redirect(`myapp://redirect?token=${token}`);
    }
  );

module.exports = router;
