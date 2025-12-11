const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware to check if user is logged in (Lab 8a - Authorization)
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// List all exercises for logged-in user
router.get('/', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    
    const query = `
        SELECT * FROM exercises 
        WHERE user_id = ? 
        ORDER BY date DESC, created_at DESC
    `;
    
    db.query(query, [userId], (err, exercises) => {
        if (err) {
            console.error(err);
            return res.render('exercises', {
                title: 'My Exercises - FitLife Tracker',
                exercises: [],
                error: 'Failed to load exercises'
            });
        }
        
        res.render('exercises', {
            title: 'My Exercises - FitLife Tracker',
            exercises: exercises,
            error: null
        });
    });
});

// Show add exercise form
router.get('/add', requireLogin, (req, res) => {
    res.render('add-exercise', {
        title: 'Add Exercise - FitLife Tracker',
        errors: [],
        formData: {}
    });
});

// Handle add exercise (Lab 5c - Forms + Lab 8b - Validation)
router.post('/add', requireLogin, [
    body('exercise_name')
        .trim()
        .notEmpty()
        .withMessage('Exercise name is required')
        .isLength({ max: 100 })
        .withMessage('Exercise name must be less than 100 characters'),
    body('exercise_type')
        .isIn(['cardio', 'strength', 'flexibility', 'sports'])
        .withMessage('Invalid exercise type'),
    body('duration_minutes')
        .isInt({ min: 1, max: 1440 })
        .withMessage('Duration must be between 1 and 1440 minutes'),
    body('calories_burned')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage('Calories must be a positive number'),
    body('date')
        .isDate()
        .withMessage('Please enter a valid date'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters')
], (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('add-exercise', {
            title: 'Add Exercise - FitLife Tracker',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    const userId = req.session.user.id;
    const { exercise_name, exercise_type, duration_minutes, calories_burned, date, notes } = req.body;
    
    // Sanitize inputs (Lab 8b)
    const sanitizedName = req.sanitize(exercise_name);
    const sanitizedNotes = req.sanitize(notes || '');
    
    const query = `
        INSERT INTO exercises (user_id, exercise_name, exercise_type, duration_minutes, calories_burned, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [userId, sanitizedName, exercise_type, duration_minutes, calories_burned || null, date, sanitizedNotes], (err, result) => {
        if (err) {
            console.error(err);
            return res.render('add-exercise', {
                title: 'Add Exercise - FitLife Tracker',
                errors: [{ msg: 'Failed to add exercise. Please try again.' }],
                formData: req.body
            });
        }
        
        res.redirect('/exercises');
    });
});

// Search exercises
router.get('/search', requireLogin, (req, res) => {
    res.render('search-exercises', {
        title: 'Search Exercises - FitLife Tracker',
        results: null,
        filters: {}
    });
});

// Handle exercise search (Lab 5 - Search functionality)
router.get('/search-result', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const { keyword, exercise_type, date_from, date_to } = req.query;
    
    let query = 'SELECT * FROM exercises WHERE user_id = ?';
    let params = [userId];
    
    // Build dynamic query based on filters
    if (keyword) {
        const sanitizedKeyword = req.sanitize(keyword);
        query += ' AND exercise_name LIKE ?';
        params.push(`%${sanitizedKeyword}%`);
    }
    
    if (exercise_type && exercise_type !== 'all') {
        query += ' AND exercise_type = ?';
        params.push(exercise_type);
    }
    
    if (date_from) {
        query += ' AND date >= ?';
        params.push(date_from);
    }
    
    if (date_to) {
        query += ' AND date <= ?';
        params.push(date_to);
    }
    
    query += ' ORDER BY date DESC';
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.render('search-exercises', {
                title: 'Search Exercises - FitLife Tracker',
                results: [],
                filters: req.query,
                error: 'Search failed. Please try again.'
            });
        }
        
        res.render('search-exercises', {
            title: 'Search Results - FitLife Tracker',
            results: results,
            filters: req.query,
            error: null
        });
    });
});

// Delete exercise
router.post('/delete/:id', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const exerciseId = req.params.id;
    
    // Make sure user owns this exercise (Authorization - Lab 8a)
    const query = 'DELETE FROM exercises WHERE id = ? AND user_id = ?';
    
    db.query(query, [exerciseId, userId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/exercises');
    });
});

module.exports = router;
