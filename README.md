
# Project Title

A brief description of what this project does and who it's for

# 🏋️ FitLife Tracker

A modern web application for tracking exercises, nutrition, and fitness goals.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

---

## 📖 Overview

FitLife Tracker is a comprehensive health and fitness management platform that helps users track workouts, monitor nutrition, set goals, and visualize progress through interactive charts.

---

## ✨ Features

- **User Authentication** - Secure login/register with password encryption
- **Exercise Tracking** - Log workouts with duration, calories, and notes
- **Nutrition Monitoring** - Track meals with macronutrients (protein, carbs, fats)
- **Goal Management** - Set and track fitness goals with progress bars
- **Advanced Search** - Find exercises and meals with filters
- **Data Visualization** - Interactive charts powered by Chart.js
- **AJAX Live Search** - Real-time search results
- **Weather Recommendations** - Get exercise suggestions based on weather
- **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🛠️ Technology Stack

**Backend:** Node.js, Express.js, MySQL, bcrypt, express-session  
**Frontend:** EJS, CSS3, Vanilla JavaScript, Chart.js, Font Awesome  
**Security:** express-validator, express-sanitizer, prepared statements

---

## 📦 Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)
- npm (v9+)

---

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install

2. Setup Database

# Start MySQL
mysql.server start

# Create database
mysql -u root -p < database/create_db.sql

# Insert test data
mysql -u root -p health < database/insert_test_data.sql


3. Configure Environment
Create .env file:

HEALTH_HOST=localhost
HEALTH_USER=root
HEALTH_PASSWORD=your_mysql_password
HEALTH_DATABASE=health
PORT=8000
HEALTH_BASE_PATH=http://localhost:8000
SESSION_SECRET=your_random_secret_key
NODE_ENV=development


4. Run Application
node index.js
Visit: http://localhost:8000

Demo Account
Username: gold
Password: smiths

##Project Structure

10_health_33828482/
├── index.js                    # Main server file
├── package.json                # Dependencies
├── .env                        # Configuration
├── database/
│   ├── create_db.sql          # Database schema
│   └── insert_test_data.sql   # Test data
├── routes/
│   ├── main.js                # Home, about, search
│   ├── auth.js                # Login, register
│   ├── exercises.js           # Exercise CRUD
│   ├── nutrition.js           # Nutrition CRUD
│   ├── goals.js               # Goal management
│   └── api.js                 # API endpoints
├── views/
│   ├── partials/              # Header, nav, footer
│   ├── index.ejs              # Dashboard
│   ├── login.ejs              # Login page
│   ├── register.ejs           # Register page
│   ├── exercises.ejs          # Exercise list
│   ├── nutrition.ejs          # Nutrition list
│   ├── goals.ejs              # Goals list
│   └── ...                    # Other pages
└── public/
    ├── css/style.css          # Styles
    └── js/main.js             # Client-side JS


API Endpoints
Authentication
POST /auth/login - User login
POST /auth/register - User registration
GET /auth/logout - User logout
Exercises
GET /exercises - List exercises
POST /exercises/add - Add exercise
POST /exercises/delete/:id - Delete exercise
GET /exercises/search-result - Search exercises
Nutrition
GET /nutrition - List meals
POST /nutrition/add - Add meal
POST /nutrition/delete/:id - Delete meal
Goals
GET /goals - List goals
POST /goals/add - Add goal
POST /goals/update-progress/:id - Update progress
POST /goals/delete/:id - Delete goal
API (JSON)
GET /api/exercises - Get exercises as JSON
GET /api/nutrition/stats?days=7 - Nutrition statistics
GET /api/goals?status=active - Get filtered goals
GET /api/weather/:city - Weather recommendations
GET /api/search?q=keyword - AJAX search
💾 Database Schema
Tables
users - User accounts (id, username, email, hashedPassword, first_name, last_name)
exercises - Workout logs (id, user_id, exercise_name, exercise_type, duration_minutes, calories_burned, date, notes)
nutrition - Meal logs (id, user_id, meal_name, meal_type, calories, protein_grams, carbs_grams, fat_grams, date)
goals - Fitness goals (id, user_id, goal_type, goal_description, target_value, current_value, unit, target_date, status)
🔒 Security Features
Password Hashing - bcrypt with 10 salt rounds
SQL Injection Prevention - Prepared statements
XSS Protection - Input sanitization
Session Security - Secure cookies, CSRF protection
Authorization - Users can only access their own data
🐛 Troubleshooting
Database Connection Error
Copy
# Check MySQL is running
mysql.server status

# Verify credentials in .env
# Test connection: mysql -u root -p
Port Already in Use
Copy
# Find and kill process
lsof -i :8000
kill -9 <PID>

# Or change port in .env
PORT=3000
Module Not Found
Copy
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
Session Not Persisting
Check SESSION_SECRET in .env
Clear browser cookies
Restart server
📊 Features Breakdown
Core Features
✅ User registration and login

✅ Password encryption (bcrypt)

✅ Session management

✅ Exercise tracking with charts

✅ Nutrition monitoring with macros

✅ Goal management with progress bars

✅ Search functionality

✅ Input validation and sanitization

Advanced Features
✅ AJAX live search

✅ Data visualization (Chart.js)

✅ Weather-based recommendations

✅ RESTful API endpoints

✅ Responsive design

✅ Real-time form validation

✅ Calorie calculators

✅ Table sorting

🧪 Testing
Test Accounts
gold / smiths (main account with data)
testuser / smiths123ABC$
admin / smiths
Sample Data
8 exercises (cardio, strength, flexibility, sports)
13 meals (breakfast, lunch, dinner, snacks)
5 goals (weight loss, muscle gain, endurance)
🚀 Deployment
Production Checklist
 Change SESSION_SECRET to random string
 Update MySQL password
 Set NODE_ENV=production
 Enable HTTPS
 Setup database backups
Deployment Options
VPS: DigitalOcean, Linode (use PM2)
PaaS: Heroku (with JawsDB addon)
Cloud: Railway, Render
📈 Project Statistics
Total Files: 30+
Lines of Code: ~5,000
Technologies: Node.js, Express, MySQL, EJS, Chart.js
API Endpoints: 25+
Features: 20+

👨‍💻 Author
Student ID: 33828482

Project: FitLife Tracker


🙏 Acknowledgments
Express.js - Web framework
MySQL - Database
Chart.js - Data visualization
bcrypt - Password hashing
Font Awesome - Icons


Check Troubleshooting section
Review error messages in terminal
Check browser console (F12)
Verify .env configuration
Built with ❤️ using Node.js, Express, and MySQL

Stay fit, stay healthy! 💪