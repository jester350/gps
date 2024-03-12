// routes/gpsRoutes.js

const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/gpsController');
const requireLogin = require('../middlewares/requireLogin'); // assuming you have a requireLogin.js file for the middleware

router.get('/locations', requireLogin, gpsController.getLocations);

module.exports = router;