const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/gpsController');
const { tokenMiddleware, requireLogin } = require('../middleware/authMiddleware'); // Assuming you have an authMiddleware.js for these

// Define the route for submitting GPS data
router.post('/gps', tokenMiddleware, gpsController.submitGpsData);

// Define the route for getting locations
router.get('/locations', requireLogin, gpsController.getLocations);

module.exports = router;