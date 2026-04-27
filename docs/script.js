// ==================== AI LOGIC ENGINE ====================
class AirQualityAI {
    constructor() {
        // Thresholds for rule-based classification
        this.thresholds = {
            co2: {
                good: 800,    // Below 800 ppm = Good
                moderate: 1000 // 800-1000 = Moderate, Above 1000 = Poor
            },
            temperature: {
                min: 18,  // Below 18°C = Poor
                max: 26   // Above 26°C = Poor
            },
            humidity: {
                min: 30,  // Below 30% = Poor
                max: 60   // Above 60% = Poor
            }
        };
        
        // Weight scores for ML-like pattern recognition
        this.weights = {
            co2: 0.5,        // CO₂ has highest weight (most important)
            temperature: 0.25, // Temperature medium weight
            humidity: 0.25    // Humidity medium weight
        };
    }

    // Main AI classification function
    classifyAirQuality(co2, temperature, humidity) {
        let score = 0;
        let factors = [];
        
        // CO₂ Analysis
        if (co2 < this.thresholds.co2.good) {
            score += this.weights.co2 * 1; // Good
            factors.push({ factor: 'CO₂', status: 'good', value: co2 });
        } else if (co2 < this.thresholds.co2.moderate) {
            score += this.weights.co2 * 0.6; // Moderate
            factors.push({ factor: 'CO₂', status: 'moderate', value: co2 });
        } else {
            score += this.weights.co2 * 0.2; // Poor
            factors.push({ factor: 'CO₂', status: 'poor', value: co2 });
        }
        
        // Temperature Analysis
        if (temperature >= this.thresholds.temperature.min && 
            temperature <= this.thresholds.temperature.max) {
            score += this.weights.temperature * 1; // Good
            factors.push({ factor: 'Temperature', status: 'good', value: temperature });
        } else {
            score += this.weights.temperature * 0.3; // Poor
            factors.push({ factor: 'Temperature', status: 'poor', value: temperature });
        }
        
        // Humidity Analysis
        if (humidity >= this.thresholds.humidity.min && 
            humidity <= this.thresholds.humidity.max) {
            score += this.weights.humidity * 1; // Good
            factors.push({ factor: 'Humidity', status: 'good', value: humidity });
        } else {
            score += this.weights.humidity * 0.3; // Poor
            factors.push({ factor: 'Humidity', status: 'poor', value: humidity });
        }
        
        // Final classification based on weighted score
        let status;
        if (score >= 0.8) status = 'Good';
        else if (score >= 0.5) status = 'Moderate';
        else status = 'Poor';
        
        return {
            status: status,
            score: score,
            factors: factors
        };
    }
    
    // Generate smart recommendations
    generateRecommendations(analysis, co2, temperature, humidity) {
        let recommendations = [];
        
        // CO₂ specific recommendations
        if (co2 > this.thresholds.co2.good) {
            recommendations.push('🪟 Open windows immediately for ventilation');
            recommendations.push('🌿 Consider adding indoor plants to absorb CO₂');
        }
        
        if (co2 > this.thresholds.co2.moderate) {
            recommendations.push('⚠️ Limit number of people in the room');
            recommendations.push('🔄 Check ventilation system functionality');
        }
        
        // Temperature recommendations
        if (temperature > this.thresholds.temperature.max) {
            recommendations.push('❄️ Turn on AC or fan to reduce temperature');
            recommendations.push('🪟 Open windows for cross-ventilation');
        } else if (temperature < this.thresholds.temperature.min) {
            recommendations.push('🔥 Turn on heater to increase temperature');
            recommendations.push('🚪 Close windows to retain warmth');
        }
        
        // Humidity recommendations
        if (humidity > this.thresholds.humidity.max) {
            recommendations.push('💨 Use dehumidifier to reduce moisture');
            recommendations.push('🌬️ Improve ventilation to reduce humidity');
        } else if (humidity < this.thresholds.humidity.min) {
            recommendations.push('💧 Use humidifier to add moisture to air');
            recommendations.push('🪴 Place water bowls near heat sources');
        }
        
        // Good conditions recommendations
        if (analysis.status === 'Good') {
            recommendations.push('✅ Air quality is optimal. Maintain current conditions.');
            recommendations.push('📊 Continue regular monitoring for best results.');
        }
        
        return recommendations.slice(0, 4); // Return top 4 recommendations
    }
}

// ==================== DATA STORAGE ====================
class DataStorage {
    constructor() {
        this.storageKey = 'airQualityHistory';
    }
    
    saveReading(reading) {
        let history = this.getHistory();
        history.unshift(reading);
        
        // Keep only last 5 readings
        if (history.length > 5) {
            history = history.slice(0, 5);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }
    
    getHistory() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
}

// ==================== DATA SIMULATION ====================
class SensorSimulator {
    generateReading() {
        return {
            co2: Math.floor(Math.random() * 1100) + 400, // 400-1500 ppm
            temperature: (Math.random() * 20 + 10).toFixed(1), // 10-30°C
            humidity: Math.floor(Math.random() * 60) + 20, // 20-80%
            timestamp: new Date().toLocaleTimeString()
        };
    }
}

// ==================== MAIN APPLICATION ====================
class AirQualityMonitor {
    constructor() {
        this.ai = new AirQualityAI();
        this.storage = new DataStorage();
        this.simulator = new SensorSimulator();
        this.autoRefreshInterval = null;
        
        this.initializeEventListeners();
        this.refreshData(); // Load initial data
    }
    
    initializeEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
        
        document.getElementById('autoRefreshBtn').addEventListener('click', () => {
            this.startAutoRefresh();
        });
        
        document.getElementById('stopAutoBtn').addEventListener('click', () => {
            this.stopAutoRefresh();
        });
    }
    
    refreshData() {
        // Get simulated sensor data
        const reading = this.simulator.generateReading();
        
        // Process with AI
        const analysis = this.ai.classifyAirQuality(
            reading.co2, 
            reading.temperature, 
            reading.humidity
        );
        
        // Generate recommendations
        const recommendations = this.ai.generateRecommendations(
            analysis, 
            reading.co2, 
            reading.temperature, 
            reading.humidity
        );
        
        // Save to storage
        this.storage.saveReading(reading);
        
        // Update display
        this.updateDisplay(reading, analysis, recommendations);
        this.updateHistory();
    }
    
    updateDisplay(reading, analysis, recommendations) {
        // Update sensor values
        document.getElementById('co2Value').textContent = reading.co2;
        document.getElementById('tempValue').textContent = reading.temperature;
        document.getElementById('humidityValue').textContent = reading.humidity;
        
        // Update status indicator
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const statusCard = document.getElementById('statusCard');
        
        statusText.textContent = `AI Classification: ${analysis.status} (Score: ${(analysis.score * 100).toFixed(0)}%)`;
        
        // Update status colors
        statusIndicator.style.color = 'white';
        switch(analysis.status) {
            case 'Good':
                statusIndicator.style.backgroundColor = '#28a745';
                statusIndicator.innerHTML = '✓';
                statusCard.style.borderColor = '#28a745';
                break;
            case 'Moderate':
                statusIndicator.style.backgroundColor = '#ffc107';
                statusIndicator.innerHTML = '⚠';
                statusCard.style.borderColor = '#ffc107';
                break;
            case 'Poor':
                statusIndicator.style.backgroundColor = '#dc3545';
                statusIndicator.innerHTML = '✗';
                statusCard.style.borderColor = '#dc3545';
                break;
        }
        
        // Update recommendations
        const recList = document.getElementById('recommendationsList');
        recList.innerHTML = recommendations.map(rec => `<p>${rec}</p>`).join('');
    }
    
    updateHistory() {
        const history = this.storage.getHistory();
        const historyList = document.getElementById('historyList');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="no-data">No readings yet</p>';
            return;
        }
        
        historyList.innerHTML = history.map((reading, index) => `
            <div class="history-item">
                <span>
                    <strong>CO₂:</strong> ${reading.co2} ppm | 
                    <strong>Temp:</strong> ${reading.temperature}°C | 
                    <strong>Hum:</strong> ${reading.humidity}%
                </span>
                <span class="timestamp">${reading.timestamp}</span>
            </div>
        `).join('');
    }
    
    startAutoRefresh() {
        document.getElementById('autoRefreshBtn').style.display = 'none';
        document.getElementById('stopAutoBtn').style.display = 'block';
        document.getElementById('refreshBtn').disabled = true;
        
        this.refreshData(); // Immediate update
        this.autoRefreshInterval = setInterval(() => {
            this.refreshData();
        }, 3000); // Refresh every 3 seconds
    }
    
    stopAutoRefresh() {
        document.getElementById('autoRefreshBtn').style.display = 'block';
        document.getElementById('stopAutoBtn').style.display = 'none';
        document.getElementById('refreshBtn').disabled = false;
        
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
}

// Initialize the application when page loads
window.addEventListener('DOMContentLoaded', () => {
    new AirQualityMonitor();
});
