const express = require('express');
const router = express.Router();

// Home page - Dashboard
router.get('/', (req, res) => {
    // If user is logged in, show personalized dashboard
    if (req.session.user) {
        const userId = req.session.user.id;
        
        // Get user statistics
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM exercises WHERE user_id = ?) as total_exercises,
                (SELECT COUNT(*) FROM nutrition WHERE user_id = ?) as total_meals,
                (SELECT COUNT(*) FROM goals WHERE user_id = ? AND status = 'active') as active_goals,
                (SELECT SUM(calories_burned) FROM exercises WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as weekly_calories
        `;
        
        db.query(statsQuery, [userId, userId, userId, userId], (err, stats) => {
            if (err) {
                console.error(err);
                return res.render('index', { stats: null });
            }
            
            // Get recent activities
            const recentQuery = `
                SELECT 'exercise' as type, exercise_name as name, date, calories_burned as value
                FROM exercises 
                WHERE user_id = ?
                UNION ALL
                SELECT 'nutrition' as type, meal_name as name, date, calories as value
                FROM nutrition 
                WHERE user_id = ?
                ORDER BY date DESC
                LIMIT 5
            `;
            
            db.query(recentQuery, [userId, userId], (err, activities) => {
                if (err) {
                    console.error(err);
                    activities = [];
                }
                
                res.render('index', {
                    title: 'Dashboard - FitLife Tracker',
                    stats: stats[0],
                    activities: activities
                });
            });
        });
    } else {
        // Guest user - show welcome page
        res.render('index', {
            title: 'Welcome - FitLife Tracker',
            stats: null,
            activities: []
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About - FitLife Tracker'
    });
});

// Search page
router.get('/search', (req, res) => {
    res.render('search', {
        title: 'Search - FitLife Tracker',
        results: null,
        keyword: ''
    });
});

// Search results (GET request - Lab 5)
router.get('/search-result', (req, res) => {
    const keyword = req.query.keyword || '';
    const sanitizedKeyword = req.sanitize(keyword);
    
    if (!sanitizedKeyword) {
        return res.render('search', {
            title: 'Search - FitLife Tracker',
            results: null,
            keyword: '',
            message: 'Please enter a search term'
        });
    }
    
    // Search in exercises and nutrition
    const searchQuery = `
        SELECT 'exercise' as type, id, exercise_name as name, date, calories_burned as calories
        FROM exercises
        WHERE exercise_name LIKE ?
        UNION ALL
        SELECT 'nutrition' as type, id, meal_name as name, date, calories
        FROM nutrition
        WHERE meal_name LIKE ?
        ORDER BY date DESC
    `;
    
    const searchTerm = `%${sanitizedKeyword}%`;
    
    db.query(searchQuery, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error(err);
            return res.render('search', {
                title: 'Search - FitLife Tracker',
                results: null,
                keyword: sanitizedKeyword,
                message: 'An error occurred during search'
            });
        }
        
        res.render('search', {
            title: 'Search Results - FitLife Tracker',
            results: results,
            keyword: sanitizedKeyword,
            message: results.length === 0 ? 'No results found' : null
        });
    });
});

module.exports = router;
