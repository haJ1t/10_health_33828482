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

// List all nutrition entries
router.get('/', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    
    // Get nutrition entries with daily totals (Advanced SQL - JOIN/Aggregation)
    const query = `
        SELECT * FROM nutrition 
        WHERE user_id = ? 
        ORDER BY date DESC, created_at DESC
    `;
    
    const summaryQuery = `
        SELECT 
            DATE(date) as day,
            SUM(calories) as total_calories,
            SUM(protein_grams) as total_protein,
            SUM(carbs_grams) as total_carbs,
            SUM(fat_grams) as total_fat
        FROM nutrition
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(date)
        ORDER BY day DESC
    `;
    
    db.query(query, [userId], (err, nutrition) => {
        if (err) {
            console.error(err);
            return res.render('nutrition', {
                title: 'My Nutrition - FitLife Tracker',
                nutrition: [],
                summary: [],
                error: 'Failed to load nutrition data'
            });
        }
        
        db.query(summaryQuery, [userId], (err, summary) => {
            if (err) {
                console.error(err);
                summary = [];
            }
            
            res.render('nutrition', {
                title: 'My Nutrition - FitLife Tracker',
                nutrition: nutrition,
                summary: summary,
                error: null
            });
        });
    });
});

// Show add nutrition form
router.get('/add', requireLogin, (req, res) => {
    res.render('add-nutrition', {
        title: 'Add Meal - FitLife Tracker',
        errors: [],
        formData: {}
    });
});

// Handle add nutrition (Lab 5c + Lab 8b)
router.post('/add', requireLogin, [
    body('meal_name')
        .trim()
        .notEmpty()
        .withMessage('Meal name is required')
        .isLength({ max: 100 })
        .withMessage('Meal name must be less than 100 characters'),
    body('meal_type')
        .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
        .withMessage('Invalid meal type'),
    body('calories')
        .isInt({ min: 0, max: 10000 })
        .withMessage('Calories must be between 0 and 10000'),
    body('protein_grams')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Protein must be a positive number'),
    body('carbs_grams')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Carbs must be a positive number'),
    body('fat_grams')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Fat must be a positive number'),
    body('date')
        .isDate()
        .withMessage('Please enter a valid date')
], (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('add-nutrition', {
            title: 'Add Meal - FitLife Tracker',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    const userId = req.session.user.id;
    const { meal_name, meal_type, calories, protein_grams, carbs_grams, fat_grams, date } = req.body;
    
    const sanitizedName = req.sanitize(meal_name);
    
    const query = `
        INSERT INTO nutrition (user_id, meal_name, meal_type, calories, protein_grams, carbs_grams, fat_grams, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [userId, sanitizedName, meal_type, calories, protein_grams || null, carbs_grams || null, fat_grams || null, date], (err, result) => {
        if (err) {
            console.error(err);
            return res.render('add-nutrition', {
                title: 'Add Meal - FitLife Tracker',
                errors: [{ msg: 'Failed to add meal. Please try again.' }],
                formData: req.body
            });
        }
        
        res.redirect('/nutrition');
    });
});

// Delete nutrition entry
router.post('/delete/:id', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const nutritionId = req.params.id;
    
    const query = 'DELETE FROM nutrition WHERE id = ? AND user_id = ?';
    
    db.query(query, [nutritionId, userId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/nutrition');
    });
});

module.exports = router;
