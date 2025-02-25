require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

console.log("✅ GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Vérifier si l'utilisateur existe
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);

        if (result.rows.length === 0) {
          // Insérer l'utilisateur s'il n'existe pas
          result = await pool.query(
            'INSERT INTO users (name, email, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [profile.displayName, profile.emails[0].value, 'google', profile.id]
          );
        }

        const user = result.rows[0];

        // Générer un token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, 'SECRET_KEY', { expiresIn: '1h' });

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Sérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
