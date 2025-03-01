const express = require('express');
const { searchItinerary, recalculateItinerary } = require('../controllers/itineraryController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = express.Router();

// Route pour rechercher un itinéraire
router.post('/search', authenticateUser, searchItinerary);

// Route pour recalculer un itinéraire
router.post('/recalculate', recalculateItinerary);

module.exports = router;