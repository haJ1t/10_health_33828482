const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// Show login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', {
        title: 'Login - FitLife Tracker',
        error: null
    });
});

// Handle login (Lab 8a)
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('login', {
            title: 'Login - FitLife Tracker',
            error: errors.array()[0].msg
        });
    }
    
    const { username, password } = req.body;
    
    // Find user in database
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.render('login', {
                title: 'Login - FitLife Tracker',
                error: 'An error occurred. Please try again.'
            });
        }
        
        if (results.length === 0) {
            return res.render('login', {
                title: 'Login - FitLife Tracker',
                error: 'Invalid username or password'
            });
        }
        
        const user = results[0];
        
        // Compare password with hash (Lab 7)
        const match = await bcrypt.compare(password, user.hashedPassword);
        
        if (!match) {
            return res.render('login', {
                title: 'Login - FitLife Tracker',
                error: 'Invalid username or password'
            });
        }
        
        // Create session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        };
        
        res.redirect('/');
    });
});

// Show register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', {
        title: 'Register - FitLife Tracker',
        errors: [],
        formData: {}
    });
});

// Handle registration (Lab 7 + Lab 8b)
router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .isAlphanumeric()
        .withMessage('Username must contain only letters and numbers'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isAlpha()
        .withMessage('First name must contain only letters'),
    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isAlpha()
        .withMessage('Last name must contain only letters')
], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('register', {
            title: 'Register - FitLife Tracker',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    const { username, email, password, first_name, last_name } = req.body;
    
    // Check if username or email already exists
    const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    
    db.query(checkQuery, [username, email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.render('register', {
                title: 'Register - FitLife Tracker',
                errors: [{ msg: 'An error occurred. Please try again.' }],
                formData: req.body
            });
        }
        
        if (results.length > 0) {
            return res.render('register', {
                title: 'Register - FitLife Tracker',
                errors: [{ msg: 'Username or email already exists' }],
                formData: req.body
            });
        }
        
        // Hash password (Lab 7)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const insertQuery = 'INSERT INTO users (username, email, hashedPassword, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
        
        db.query(insertQuery, [username, email, hashedPassword, first_name, last_name], (err, result) => {
            if (err) {
                console.error(err);
                return res.render('register', {
                    title: 'Register - FitLife Tracker',
                    errors: [{ msg: 'An error occurred. Please try again.' }],
                    formData: req.body
                });
            }
            
            // Auto-login after registration
            req.session.user = {
                id: result.insertId,
                username: username,
                email: email,
                first_name: first_name,
                last_name: last_name
            };
            
            res.redirect('/');
        });
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
