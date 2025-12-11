/* ========================================
   FitLife Tracker - Main JavaScript
   ======================================== */

// === MOBILE NAVIGATION TOGGLE ===
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Change icon
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});

// === FORM VALIDATION ENHANCEMENT ===
// Add real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateInput(this);
                }
            });
        });
    });
});

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    // Remove previous validation classes
    input.classList.remove('is-valid', 'is-invalid');
    
    // Check if empty
    if (input.hasAttribute('required') && !value) {
        input.classList.add('is-invalid');
        return false;
    }
    
    // Email validation
    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            input.classList.add('is-invalid');
            return false;
        }
    }
    
    // Number validation
    if (type === 'number') {
        const min = input.getAttribute('min');
        const max = input.getAttribute('max');
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
            input.classList.add('is-invalid');
            return false;
        }
        
        if (min && numValue < parseFloat(min)) {
            input.classList.add('is-invalid');
            return false;
        }
        
        if (max && numValue > parseFloat(max)) {
            input.classList.add('is-invalid');
            return false;
        }
    }
    
    // Password confirmation
    if (input.name === 'confirm_password') {
        const password = document.querySelector('input[name="password"]');
        if (password && value !== password.value) {
            input.classList.add('is-invalid');
            return false;
        }
    }
    
    input.classList.add('is-valid');
    return true;
}

// === LIVE SEARCH (AJAX) - Lab 9a ===
document.addEventListener('DOMContentLoaded', function() {
    const liveSearchInput = document.getElementById('liveSearch');
    const liveSearchResults = document.getElementById('liveSearchResults');
    
    if (liveSearchInput && liveSearchResults) {
        let searchTimeout;
        
        liveSearchInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            // Clear previous timeout
            clearTimeout(searchTimeout);
            
            // Clear results if query is empty
            if (!query) {
                liveSearchResults.innerHTML = '';
                return;
            }
            
            // Show loading state
            liveSearchResults.innerHTML = '<div class="loading">Searching...</div>';
            
            // Debounce search (wait 300ms after user stops typing)
            searchTimeout = setTimeout(() => {
                performLiveSearch(query);
            }, 300);
        });
    }
});

async function performLiveSearch(query) {
    const liveSearchResults = document.getElementById('liveSearchResults');
    
    try {
        // Get base path from page
        const basePath = document.querySelector('body').dataset.basePath || '';
        
        // Make AJAX request to API
        const response = await fetch(`${basePath}/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const data = await response.json();
        
        // Display results
        if (data.results && data.results.length > 0) {
            let html = '<div class="live-results-list">';
            
            data.results.forEach(result => {
                const icon = result.type === 'exercise' ? 'fa-dumbbell' : 'fa-utensils';
                const date = new Date(result.date).toLocaleDateString();
                
                html += `
                    <div class="live-result-item">
                        <i class="fas ${icon}"></i>
                        <div class="live-result-info">
                            <strong>${escapeHtml(result.name)}</strong>
                            <small>${date} - ${result.value} calories</small>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            liveSearchResults.innerHTML = html;
        } else {
            liveSearchResults.innerHTML = '<div class="no-results">No results found</div>';
        }
    } catch (error) {
        console.error('Live search error:', error);
        liveSearchResults.innerHTML = '<div class="error">Search failed. Please try again.</div>';
    }
}

// === CONFIRMATION DIALOGS ===
document.addEventListener('DOMContentLoaded', function() {
    const deleteForms = document.querySelectorAll('form[action*="/delete/"]');
    
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const confirmed = confirm('Are you sure you want to delete this item? This action cannot be undone.');
            if (!confirmed) {
                e.preventDefault();
            }
        });
    });
});

// === AUTO-HIDE ALERTS ===
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert-success, .alert-info');
    
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000); // Hide after 5 seconds
    });
});

// === CALORIE CALCULATOR (Advanced Feature) ===
document.addEventListener('DOMContentLoaded', function() {
    const durationInput = document.querySelector('input[name="duration_minutes"]');
    const exerciseTypeSelect = document.querySelector('select[name="exercise_type"]');
    const caloriesInput = document.querySelector('input[name="calories_burned"]');
    
    if (durationInput && exerciseTypeSelect && caloriesInput) {
        // Approximate calories per minute by exercise type
        const caloriesPerMinute = {
            'cardio': 8,
            'strength': 5,
            'flexibility': 3,
            'sports': 7
        };
        
        function calculateCalories() {
            const duration = parseFloat(durationInput.value);
            const type = exerciseTypeSelect.value;
            
            if (duration && type && caloriesPerMinute[type]) {
                const estimated = Math.round(duration * caloriesPerMinute[type]);
                
                // Only auto-fill if calories field is empty
                if (!caloriesInput.value) {
                    caloriesInput.value = estimated;
                    caloriesInput.placeholder = `Estimated: ${estimated}`;
                }
            }
        }
        
        durationInput.addEventListener('input', calculateCalories);
        exerciseTypeSelect.addEventListener('change', calculateCalories);
    }
});

// === NUTRITION CALCULATOR (Advanced Feature) ===
document.addEventListener('DOMContentLoaded', function() {
    const proteinInput = document.querySelector('input[name="protein_grams"]');
    const carbsInput = document.querySelector('input[name="carbs_grams"]');
    const fatInput = document.querySelector('input[name="fat_grams"]');
    const caloriesInput = document.querySelector('input[name="calories"]');
    
    if (proteinInput && carbsInput && fatInput && caloriesInput) {
        // Calories per gram: Protein=4, Carbs=4, Fat=9
        function calculateTotalCalories() {
            const protein = parseFloat(proteinInput.value) || 0;
            const carbs = parseFloat(carbsInput.value) || 0;
            const fat = parseFloat(fatInput.value) || 0;
            
            const totalCalories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
            
            if (totalCalories > 0 && !caloriesInput.value) {
                caloriesInput.value = totalCalories;
                caloriesInput.placeholder = `Calculated: ${totalCalories}`;
            }
        }
        
        proteinInput.addEventListener('input', calculateTotalCalories);
        carbsInput.addEventListener('input', calculateTotalCalories);
        fatInput.addEventListener('input', calculateTotalCalories);
    }
});

// === GOAL PROGRESS ANIMATION ===
document.addEventListener('DOMContentLoaded', function() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 100);
    });
});

// === DATE PICKER ENHANCEMENT ===
document.addEventListener('DOMContentLoaded', function() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set max date to today if not already set
        if (!input.hasAttribute('max') && !input.hasAttribute('min')) {
            const today = new Date().toISOString().split('T')[0];
            input.setAttribute('max', today);
        }
        
        // Set default value to today if empty
        if (!input.value && input.name === 'date') {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
    });
});

// === TABLE SORTING (Advanced Feature) ===
document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            // Skip action columns
            if (header.textContent.toLowerCase().includes('action')) {
                return;
            }
            
            header.style.cursor = 'pointer';
            header.title = 'Click to sort';
            
            header.addEventListener('click', function() {
                sortTable(table, index);
            });
        });
    });
});

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Determine sort direction
    const currentDirection = table.dataset.sortDirection || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    table.dataset.sortDirection = newDirection;
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        // Try to parse as number
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        return newDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
    
    // Update header indicators
    const headers = table.querySelectorAll('th');
    headers.forEach(h => {
        h.classList.remove('sorted-asc', 'sorted-desc');
    });
    headers[columnIndex].classList.add(`sorted-${newDirection}`);
}

// === STATISTICS DASHBOARD (Advanced Feature) ===
document.addEventListener('DOMContentLoaded', function() {
    // Animate stat numbers on page load
    const statValues = document.querySelectorAll('.stat-info h3');
    
    statValues.forEach(stat => {
        const target = parseInt(stat.textContent);
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 20);
    });
});

// === WEATHER-BASED RECOMMENDATIONS (Lab 9a - External API) ===
document.addEventListener('DOMContentLoaded', function() {
    const weatherWidget = document.getElementById('weatherWidget');
    
    if (weatherWidget) {
        const city = weatherWidget.dataset.city || 'London';
        fetchWeatherRecommendations(city);
    }
});

async function fetchWeatherRecommendations(city) {
    const weatherWidget = document.getElementById('weatherWidget');
    
    try {
        const basePath = document.querySelector('body').dataset.basePath || '';
        const response = await fetch(`${basePath}/api/weather/${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error('Weather fetch failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            let html = `
                <div class="weather-info">
                    <h3>Weather in ${escapeHtml(data.weather.city)}</h3>
                    <p><strong>${data.weather.temperature}°C</strong> - ${data.weather.condition}</p>
                    <h4>Recommended Exercises:</h4>
                    <ul>
            `;
            
            data.recommendations.forEach(rec => {
                html += `<li>${escapeHtml(rec)}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
            
            weatherWidget.innerHTML = html;
        }
    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherWidget.innerHTML = '<p class="error">Unable to load weather data</p>';
    }
}

// === EXPORT DATA FUNCTIONALITY (Advanced Feature) ===
function exportToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        
        cols.forEach(col => {
            // Skip action columns
            if (!col.textContent.toLowerCase().includes('action')) {
                csvRow.push('"' + col.textContent.trim().replace(/"/g, '""') + '"');
            }
        });
        
        csv.push(csvRow.join(','));
    });
    
    // Download CSV
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"][name="keyword"]') || 
                           document.getElementById('liveSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape: Close mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
});

// === UTILITY FUNCTIONS ===

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Show toast notification (Advanced Feature)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .is-valid {
        border-color: #4CAF50 !important;
    }
    
    .is-invalid {
        border-color: #f44336 !important;
    }
    
    .loading {
        text-align: center;
        padding: 1rem;
        color: #666;
    }
    
    .no-results, .error {
        text-align: center;
        padding: 1rem;
        color: #666;
    }
    
    .live-results-list {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .live-result-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .live-result-item:hover {
        background: #f4f4f4;
    }
    
    .live-result-item i {
        font-size: 1.2rem;
        color: #4CAF50;
    }
    
    .live-result-info {
        flex: 1;
    }
    
    .live-result-info strong {
        display: block;
        margin-bottom: 0.2rem;
    }
    
    .live-result-info small {
        color: #666;
        font-size: 0.85rem;
    }
    
    th.sorted-asc::after {
        content: ' ↑';
    }
    
    th.sorted-desc::after {
        content: ' ↓';
    }
`;
document.head.appendChild(style);

// === CONSOLE WELCOME MESSAGE ===
console.log('%c🏋️ FitLife Tracker', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
console.log('%cWelcome to FitLife Tracker! Track your fitness journey.', 'font-size: 12px; color: #666;');
console.log('%cDeveloped with ❤️ using Node.js, Express, MySQL', 'font-size: 10px; color: #999;');
