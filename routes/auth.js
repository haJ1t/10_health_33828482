const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// BASE PATH for Gold server
const BASE = process.env.HEALTH_BASE_PATH || "";

// SAFELY FIX DOUBLE-SLASH ISSUES ON GOLD SERVER
function safe(path) {
    return path.replace(/\/{2,}/g, '/'); // turns // into /
}

// Show login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect(safe(BASE + '/'));
    }
    res.render('login', {
        title: 'Login - FitLife Tracker',
        error: null
    });
});

// Handle login
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

        // FIX LOGIN REDIRECT (no 404, no //)
        res.redirect(safe(BASE + '/'));
    });
});

// Show register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect(safe(BASE + '/'));
    }
    res.render('register', {
        title: 'Register - FitLife Tracker',
        errors: [],
        formData: {}
    });
});

// Handle registration
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
        .isAlpha(),
    body('last_name')
        .trim()
        .notEmpty()
        .isAlpha()
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

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

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

            req.session.user = {
                id: result.insertId,
                username: username,
                email: email,
                first_name: first_name,
                last_name: last_name
            };

            res.redirect(safe(BASE + '/'));
        });
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect(safe(BASE + '/login'));
    });
});

module.exports = router;