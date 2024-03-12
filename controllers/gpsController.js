// Import necessary modules
const pool = require('../db'); // Update the path as necessary

// Define controller for GPS data submission
exports.submitGpsData = async (req, res) => {
    const { timestamp, latitude, longitude, altitude, speed, acu, gmap } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO gps_site_gps (time, latitude, longitude, altitude, speed, acu, gmap) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [timestamp, latitude, longitude, altitude, speed, acu, gmap]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving location data');
    }
};

// Define controller for getting locations
exports.getLocations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gps_site_gps ORDER BY time DESC');
        res.render('locations', { locations: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving location data');
    }
};
