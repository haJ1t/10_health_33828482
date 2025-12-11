USE health;

-- Clear existing data (optional, for testing)
DELETE FROM goals;
DELETE FROM nutrition;
DELETE FROM exercises;
DELETE FROM users;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE exercises AUTO_INCREMENT = 1;
ALTER TABLE nutrition AUTO_INCREMENT = 1;
ALTER TABLE goals AUTO_INCREMENT = 1;

-- Insert default users
-- User 1: username: gold, password: smiths
-- User 2: username: gold, password: smiths123ABC$ (alternative password)
INSERT INTO users (username, email, hashedPassword, first_name, last_name) VALUES
('gold', 'gold@fitlife.com', '$2b$10$1TfVNxpBqJDwgQB688vl3uJhgOWr.AxA9.r0XWw5ugaqPtBWqGzLi', 'Gold', 'Smith'),
('testuser', 'test@fitlife.com', '$2b$10$louQPvC.IGyFqPtOVMgn4uTM3S5v7jc7E4yVJDi9tBPKQnqDDs9Mq', 'Test', 'User'),
('admin', 'admin@fitlife.com', '$2b$10$1TfVNxpBqJDwgQB688vl3uJhgOWr.AxA9.r0XWw5ugaqPtBWqGzLi', 'Admin', 'User');

-- Insert sample exercises for user 'gold' (id=1)
INSERT INTO exercises (user_id, exercise_name, exercise_type, duration_minutes, calories_burned, date, notes) VALUES
(1, 'Morning Run', 'cardio', 30, 300, '2024-01-15', 'Great run in the park'),
(1, 'Gym Workout - Upper Body', 'strength', 45, 250, '2024-01-15', 'Bench press, shoulder press, bicep curls'),
(1, 'Evening Yoga', 'flexibility', 60, 150, '2024-01-16', 'Relaxing session, focused on stretching'),
(1, 'Swimming', 'cardio', 40, 400, '2024-01-16', 'Freestyle and backstroke'),
(1, 'Weight Training - Legs', 'strength', 50, 280, '2024-01-17', 'Squats, lunges, leg press'),
(1, 'Basketball Game', 'sports', 90, 600, '2024-01-17', 'Friendly match with friends'),
(2, 'Cycling', 'cardio', 40, 350, '2024-01-16', 'Outdoor cycling, 15km distance'),
(2, 'Pilates Class', 'flexibility', 55, 180, '2024-01-17', 'Core strengthening exercises');

-- Insert sample nutrition data
INSERT INTO nutrition (user_id, meal_name, meal_type, calories, protein_grams, carbs_grams, fat_grams, date) VALUES
-- Day 1 meals for user 'gold'
(1, 'Oatmeal with Berries and Honey', 'breakfast', 350, 12.5, 55.0, 8.5, '2024-01-15'),
(1, 'Grilled Chicken Salad', 'lunch', 450, 35.0, 25.0, 18.0, '2024-01-15'),
(1, 'Apple and Almonds', 'snack', 200, 6.0, 25.0, 10.0, '2024-01-15'),
(1, 'Salmon with Roasted Vegetables', 'dinner', 550, 40.0, 30.0, 25.0, '2024-01-15'),

-- Day 2 meals for user 'gold'
(1, 'Greek Yogurt with Granola', 'breakfast', 320, 18.0, 42.0, 9.0, '2024-01-16'),
(1, 'Turkey Sandwich', 'lunch', 420, 28.0, 45.0, 12.0, '2024-01-16'),
(1, 'Protein Bar', 'snack', 180, 15.0, 20.0, 6.0, '2024-01-16'),
(1, 'Stir-fry Chicken with Rice', 'dinner', 580, 38.0, 62.0, 16.0, '2024-01-16'),

-- Day 3 meals for user 'gold'
(1, 'Scrambled Eggs with Toast', 'breakfast', 380, 22.0, 35.0, 16.0, '2024-01-17'),
(1, 'Quinoa Buddha Bowl', 'lunch', 480, 18.0, 58.0, 18.0, '2024-01-17'),
(1, 'Banana with Peanut Butter', 'snack', 220, 7.0, 28.0, 10.0, '2024-01-17'),

-- Meals for testuser
(2, 'Protein Smoothie', 'breakfast', 280, 25.0, 35.0, 5.0, '2024-01-16'),
(2, 'Tuna Salad', 'lunch', 380, 32.0, 18.0, 16.0, '2024-01-16'),
(2, 'Beef Steak with Sweet Potato', 'dinner', 620, 45.0, 48.0, 24.0, '2024-01-16');

-- Insert sample goals
INSERT INTO goals (user_id, goal_type, goal_description, target_value, current_value, unit, target_date, status) VALUES
(1, 'weight_loss', 'Lose 10kg by summer for beach season', 75.0, 85.0, 'kg', '2024-06-01', 'active'),
(1, 'endurance', 'Run 10km without stopping', 10.0, 5.0, 'km', '2024-03-01', 'active'),
(1, 'muscle_gain', 'Increase bench press to 100kg', 100.0, 80.0, 'kg', '2024-04-01', 'active'),
(2, 'muscle_gain', 'Gain 5kg muscle mass', 75.0, 70.0, 'kg', '2024-12-31', 'active'),
(2, 'general_fitness', 'Exercise 5 times per week', 5.0, 3.0, 'days/week', '2024-02-28', 'active');

-- Display inserted data counts
SELECT 'Database populated successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_exercises FROM exercises;
SELECT COUNT(*) AS total_nutrition_entries FROM nutrition;
SELECT COUNT(*) AS total_goals FROM goals;
