// Import required modules
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// Base path for Gold server
const BASE = process.env.HEALTH_BASE_PATH || "";

// Database connection
const db = mysql.createConnection({
    host: process.env.HEALTH_HOST,
    user: process.env.HEALTH_USER,
    password: process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL database');
});

// Make db accessible to routes
global.db = db;

// Set up view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(expressSanitizer());

// --- STATIC FILE FIX FOR GOLD SERVER ---
app.use(BASE, express.static(__dirname + '/public'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Make user session & base path available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.basePath = BASE;
    next();
});

// Import routes
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const nutritionRoutes = require('./routes/nutrition');
const goalRoutes = require('./routes/goals');
const apiRoutes = require('./routes/api');

// --- APPLY BASE PATH TO ALL ROUTES ---
app.use(BASE + '/', mainRoutes);
app.use(BASE + '/auth', authRoutes);
app.use(BASE + '/exercises', exerciseRoutes);
app.use(BASE + '/nutrition', nutritionRoutes);
app.use(BASE + '/goals', goalRoutes);
app.use(BASE + '/api', apiRoutes);

// 404 Error handler
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 FitLife running at BASE PATH: ${BASE}`);
    console.log(`📊 Server started at: ${new Date().toLocaleString()}`);
});