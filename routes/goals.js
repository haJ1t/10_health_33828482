const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// List all goals
router.get('/', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    
    const query = `
        SELECT * FROM goals 
        WHERE user_id = ? 
        ORDER BY 
            CASE status 
                WHEN 'active' THEN 1 
                WHEN 'completed' THEN 2 
                WHEN 'abandoned' THEN 3 
            END,
            target_date ASC
    `;
    
    db.query(query, [userId], (err, goals) => {
        if (err) {
            console.error(err);
            return res.render('goals', {
                title: 'My Goals - FitLife Tracker',
                goals: [],
                error: 'Failed to load goals'
            });
        }
        
        res.render('goals', {
            title: 'My Goals - FitLife Tracker',
            goals: goals,
            error: null
        });
    });
});

// Show add goal form
router.get('/add', requireLogin, (req, res) => {
    res.render('add-goal', {
        title: 'Add Goal - FitLife Tracker',
        errors: [],
        formData: {}
    });
});

// Handle add goal
router.post('/add', requireLogin, [
    body('goal_type')
        .isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'])
        .withMessage('Invalid goal type'),
    body('goal_description')
        .trim()
        .notEmpty()
        .withMessage('Goal description is required')
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('target_value')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Target value must be a positive number'),
    body('current_value')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Current value must be a positive number'),
    body('unit')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Unit must be less than 20 characters'),
    body('target_date')
        .optional({ checkFalsy: true })
        .isDate()
        .withMessage('Please enter a valid date')
], (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('add-goal', {
            title: 'Add Goal - FitLife Tracker',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    const userId = req.session.user.id;
    const { goal_type, goal_description, target_value, current_value, unit, target_date } = req.body;
    
    const sanitizedDescription = req.sanitize(goal_description);
    const sanitizedUnit = req.sanitize(unit || '');
    
    const query = `
        INSERT INTO goals (user_id, goal_type, goal_description, target_value, current_value, unit, target_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [userId, goal_type, sanitizedDescription, target_value || null, current_value || null, sanitizedUnit, target_date || null], (err, result) => {
        if (err) {
            console.error(err);
            return res.render('add-goal', {
                title: 'Add Goal - FitLife Tracker',
                errors: [{ msg: 'Failed to add goal. Please try again.' }],
                formData: req.body
            });
        }
        
        res.redirect('/goals');
    });
});

// Update goal status
router.post('/update-status/:id', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const goalId = req.params.id;
    const { status } = req.body;
    
    if (!['active', 'completed', 'abandoned'].includes(status)) {
        return res.redirect('/goals');
    }
    
    const query = 'UPDATE goals SET status = ? WHERE id = ? AND user_id = ?';
    
    db.query(query, [status, goalId, userId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/goals');
    });
});

// Update goal progress
router.post('/update-progress/:id', requireLogin, [
    body('current_value')
        .isFloat({ min: 0 })
        .withMessage('Progress value must be a positive number')
], (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.redirect('/goals');
    }
    
    const userId = req.session.user.id;
    const goalId = req.params.id;
    const { current_value } = req.body;
    
    const query = 'UPDATE goals SET current_value = ? WHERE id = ? AND user_id = ?';
    
    db.query(query, [current_value, goalId, userId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/goals');
    });
});

// Delete goal
router.post('/delete/:id', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const goalId = req.params.id;
    
    const query = 'DELETE FROM goals WHERE id = ? AND user_id = ?';
    
    db.query(query, [goalId, userId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/goals');
    });
});

module.exports = router;
