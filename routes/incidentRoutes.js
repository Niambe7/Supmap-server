const express = require('express');
const { reportIncident } = require('../controllers/incidentController');

const router = express.Router();

// Route pour signaler un incident
router.post('/report', reportIncident);

module.exports = router;
