const express = require('express');
const { reportIncident } = require('../controllers/incidentController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = express.Router();

// Route pour signaler un incident
router.post('/report', authenticateUser , reportIncident);

module.exports = router;
