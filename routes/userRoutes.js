const express = require('express');
const { addUser, getUsers,loginUser } = require('../controllers/userController');
const router = express.Router();

router.post('/', addUser);
router.get('/', getUsers);
// Endpoint pour connecter un utilisateur
router.post('/login', loginUser);

module.exports = router;
