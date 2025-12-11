// Import required modules
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

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
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON data (for AJAX)
app.use(express.static('public')); // Serve static files
app.use(expressSanitizer()); // Sanitize inputs

// Session middleware (Lab 8a)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Make user session available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.basePath = process.env.HEALTH_BASE_PATH || '';
    next();
});

// Import routes
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const nutritionRoutes = require('./routes/nutrition');
const goalRoutes = require('./routes/goals');
const apiRoutes = require('./routes/api');

// Use routes
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/goals', goalRoutes);
app.use('/api', apiRoutes);

// 404 Error handler
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Global error handler (Advanced feature)
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
    console.log(`🚀 FitLife Tracker running on ${process.env.HEALTH_BASE_PATH}`);
    console.log(`📊 Server started at: ${new Date().toLocaleString()}`);
});
