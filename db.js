// db.js

const { Pool } = require('pg');
const config = require('/opt/gps/.secrets/config.js');

// Database connection configuration
const pool = new Pool({
    user: config.dbuser,
    host: config.dbhost,
    database: config.database,
    password: config.dbpassword,
    port: config.dbport,
});

module.exports = pool;