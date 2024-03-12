const express = require('express');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const config = require('/opt/gps/.secrets/config.js')
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('winston');
const gpsRoutes = require('./routes/gpsRoutes');
const { Pool } = require('pg');
const port = 8068;
const hostname = '0.0.0.0'

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
    ],
});
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const pool = require('./db'); // assuming db.js is in the same directory

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));
app.use(morgan('combined'));

app.use(session({
    secret: config.token,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

let key, cert;
try {
    key = fs.readFileSync('/opt/.certs/redzed.webhop.me.key');
    cert = fs.readFileSync('/opt/.certs/redzed_webhop_me.pem');
} catch (err) {
    console.error('Error reading SSL certificate files:', err);
    process.exit(1);
}

const options = { key, cert };
const httpsServer = https.createServer(options,app);

console.log("ASS")
// Middleware to parse JSON bodies
app.use(bodyParser.json());

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

app.use(gpsRoutes);

app.get('/currenttime', (req, res) => {
  // Get the current date and time
  const now = new Date().toLocaleString(); // Adjust the format as needed

  // Send the current date and time as a response
  res.send(`Current Date and Time: ${now}`);
});

httpsServer.listen(port,hostname, () => {
    console.log(`GPS ass listening at http://localhost:${port}`);
});

