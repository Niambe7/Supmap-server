const express = require('express');
const { searchItinerary, recalculateItinerary } = require('../controllers/itineraryController');

const router = express.Router();

// Route pour rechercher un itinéraire
router.post('/search', searchItinerary);

// Route pour recalculer un itinéraire
router.post('/recalculate', recalculateItinerary);

module.exports = router;