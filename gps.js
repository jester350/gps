const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
config = require('/opt/gps/.secrets/config.js')
const app = express();
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const port = 8000;
// Database connection configuration
const pool = new Pool({
    user: config.dbuser,
    host: config.dbhost,
    database: config.database,
    password: config.dbpassword,
    port: config.dbport,
});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));
const morgan = require('morgan');
app.use(morgan('combined'));

app.use(session({
    secret: config.token,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Simple token-based authentication middleware
const tokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Replace 'your_secret_token' with your actual secret token
    if (token == null || token !== 'judys_hot_ass') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next(); // Proceed to the next middleware or route handler
};

app.get('/register', (req, res) => {
    res.render('register');
});

// Serve the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// User registration endpoint
app.post('/register', async (req, res) => {
console.log("BOOBS")
    try {
console.log(req.body)
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering new user');
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (await bcrypt.compare(password, user.password_hash)) {
                req.session.userId = user.id; // Set user ID in session
                // res.send('Login successful');
                res.redirect('/locations')
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// Route to receive GPS coordinates, now protected with tokenMiddleware
app.post('/gps', tokenMiddleware, async (req, res) => {
    const { timestamp, latitude, longitude, altitude, speed, acu, gmap } = req.body;
 try {
    const result = await pool.query(
      'INSERT INTO gps_site_gps (time, latitude, longitude,altitude, speed, acu, gmap) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [timestamp, latitude, longitude,altitude, speed, acu, gmap] // Use the provided timestamp
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving location data');
  }
});

const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send('You must be logged in to access this page');
    }
    next();
};

// Use the requireLogin middleware on the /locations route
app.get('/locations', requireLogin, async (req, res) => {
    console.log("Accessing locations");
    try {
        const result = await pool.query('SELECT * FROM gps_site_gps ORDER BY time DESC');
        res.render('locations', { locations: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving location data');
    }
});

app.get('/currenttime', (req, res) => {
  // Get the current date and time
  const now = new Date().toLocaleString(); // Adjust the format as needed

  // Send the current date and time as a response
  res.send(`Current Date and Time: ${now}`);
});

app.listen(port,'0.0.0.0', () => {
    console.log(`GPS ass listening at http://localhost:${port}`);
});