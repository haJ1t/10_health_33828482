const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// API: Get all exercises (Lab 9b - Providing APIs)
router.get('/exercises', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    
    const query = 'SELECT * FROM exercises WHERE user_id = ? ORDER BY date DESC';
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            count: results.length,
            data: results
        });
    });
});

// API: Get exercise statistics
router.get('/exercises/stats', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    
    const query = `
        SELECT 
            exercise_type,
            COUNT(*) as count,
            SUM(duration_minutes) as total_minutes,
            SUM(calories_burned) as total_calories,
            AVG(calories_burned) as avg_calories
        FROM exercises
        WHERE user_id = ?
        GROUP BY exercise_type
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            data: results
        });
    });
});

// API: Get nutrition data
router.get('/nutrition', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    
    const query = 'SELECT * FROM nutrition WHERE user_id = ? ORDER BY date DESC';
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            count: results.length,
            data: results
        });
    });
});

// API: Get nutrition statistics by date range
router.get('/nutrition/stats', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const { days = 7 } = req.query;
    
    const query = `
        SELECT 
            DATE(date) as day,
            SUM(calories) as total_calories,
            SUM(protein_grams) as total_protein,
            SUM(carbs_grams) as total_carbs,
            SUM(fat_grams) as total_fat,
            COUNT(*) as meal_count
        FROM nutrition
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(date)
        ORDER BY day DESC
    `;
    
    db.query(query, [userId, parseInt(days)], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            period: `${days} days`,
            data: results
        });
    });
});

// API: Get goals
router.get('/goals', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const { status } = req.query;
    
    let query = 'SELECT * FROM goals WHERE user_id = ?';
    let params = [userId];
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            count: results.length,
            data: results
        });
    });
});

// API: External API - Weather (Lab 9a - Calling APIs)
// This provides weather-based exercise recommendations
router.get('/weather/:city', requireLogin, async (req, res) => {
    const city = req.params.city;
    
    try {
        // Using OpenWeatherMap API (you need to sign up for free API key)
        // For demo purposes, we'll return mock data
        // In production, use: const apiKey = process.env.WEATHER_API_KEY;
        // const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        // Mock weather data for demonstration
        const mockWeather = {
            city: city,
            temperature: Math.floor(Math.random() * 30) + 10,
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 50) + 30
        };
        
        // Provide exercise recommendations based on weather
        let recommendations = [];
        
        if (mockWeather.condition === 'Sunny' && mockWeather.temperature > 15) {
            recommendations = ['Running', 'Cycling', 'Outdoor Yoga', 'Swimming'];
        } else if (mockWeather.condition === 'Rainy') {
            recommendations = ['Gym Workout', 'Indoor Cycling', 'Yoga', 'Swimming'];
        } else if (mockWeather.temperature < 10) {
            recommendations = ['Gym Workout', 'Indoor Sports', 'Treadmill Running'];
        } else {
            recommendations = ['Walking', 'Light Jogging', 'Stretching'];
        }
        
        res.json({
            success: true,
            weather: mockWeather,
            recommendations: recommendations
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch weather data' 
        });
    }
});

// API: AJAX search (Advanced feature)
router.get('/search', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const { q, type } = req.query;
    
    if (!q) {
        return res.json({ success: true, results: [] });
    }
    
    const searchTerm = `%${q}%`;
    let query = '';
    let params = [];
    
    if (type === 'exercises' || !type) {
        query = `
            SELECT 'exercise' as type, id, exercise_name as name, date, calories_burned as value
            FROM exercises
            WHERE user_id = ? AND exercise_name LIKE ?
            ORDER BY date DESC
            LIMIT 10
        `;
        params = [userId, searchTerm];
    } else if (type === 'nutrition') {
        query = `
            SELECT 'nutrition' as type, id, meal_name as name, date, calories as value
            FROM nutrition
            WHERE user_id = ? AND meal_name LIKE ?
            ORDER BY date DESC
            LIMIT 10
        `;
        params = [userId, searchTerm];
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Search failed' });
        }
        
        res.json({
            success: true,
            query: q,
            count: results.length,
            results: results
        });
    });
});

module.exports = router;
