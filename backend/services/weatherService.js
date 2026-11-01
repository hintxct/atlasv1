const axios = require('axios');

/**
 * Weather Service - Integration with OpenWeatherMap API
 */

class WeatherService {
  constructor() {
    this.API_KEY = process.env.WEATHER_API_KEY;
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Get current weather for coordinates
   */
  async getCurrentWeather(lat, lng) {
    try {
      if (!this.API_KEY || this.API_KEY === 'demo-key-replace-with-real-openweathermap-key') {
        // Return mock data for demo
        return this.getMockWeather(lat, lng);
      }

      const response = await axios.get(`${this.BASE_URL}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: this.API_KEY,
          units: 'metric'
        }
      });

      return this.formatWeatherData(response.data);
    } catch (error) {
      console.error('Weather API Error:', error.message);
      return this.getMockWeather(lat, lng);
    }
  }

  /**
   * Get weather forecast
   */
  async getWeatherForecast(lat, lng) {
    try {
      if (!this.API_KEY || this.API_KEY === 'demo-key-replace-with-real-openweathermap-key') {
        return this.getMockForecast(lat, lng);
      }

      const response = await axios.get(`${this.BASE_URL}/forecast`, {
        params: {
          lat,
          lon: lng,
          appid: this.API_KEY,
          units: 'metric'
        }
      });

      return this.formatForecastData(response.data);
    } catch (error) {
      console.error('Weather API Error:', error.message);
      return this.getMockForecast(lat, lng);
    }
  }

  /**
   * Calculate weather risk for route
   */
  async calculateWeatherRisk(routePath) {
    let maxRisk = 0;
    
    // Sample 3 points along the route
    const samplePoints = [
      routePath[0],
      routePath[Math.floor(routePath.length / 2)],
      routePath[routePath.length - 1]
    ];

    for (const point of samplePoints) {
      const weather = await this.getCurrentWeather(point.lat, point.lng);
      const risk = this.assessWeatherRisk(weather);
      maxRisk = Math.max(maxRisk, risk);
    }

    return maxRisk;
  }

  /**
   * Assess weather risk (0-100)
   */
  assessWeatherRisk(weather) {
    let risk = 0;

    // Rain risk
    if (weather.rainfall > 50) risk += 40;
    else if (weather.rainfall > 20) risk += 25;
    else if (weather.rainfall > 10) risk += 15;

    // Visibility risk (fog)
    if (weather.visibility < 100) risk += 35;
    else if (weather.visibility < 500) risk += 20;
    else if (weather.visibility < 1000) risk += 10;

    // Wind risk
    if (weather.windSpeed > 50) risk += 25;
    else if (weather.windSpeed > 30) risk += 15;

    return Math.min(risk, 100);
  }

  /**
   * Format weather data
   */
  formatWeatherData(data) {
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility,
      windSpeed: data.wind.speed,
      rainfall: data.rain ? data.rain['1h'] || 0 : 0,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  }

  /**
   * Format forecast data
   */
  formatForecastData(data) {
    return data.list.slice(0, 8).map(item => ({
      timestamp: item.dt,
      temperature: item.main.temp,
      rainfall: item.rain ? item.rain['3h'] || 0 : 0,
      condition: item.weather[0].main,
      description: item.weather[0].description
    }));
  }

  /**
   * Get mock weather data for demo
   */
  getMockWeather(lat, lng) {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Fog'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temperature: 15 + Math.random() * 15,
      feelsLike: 15 + Math.random() * 15,
      humidity: 50 + Math.random() * 40,
      pressure: 1000 + Math.random() * 30,
      visibility: randomCondition === 'Fog' ? 500 : 5000 + Math.random() * 5000,
      windSpeed: Math.random() * 30,
      rainfall: randomCondition === 'Rain' ? 10 + Math.random() * 40 : 0,
      condition: randomCondition,
      description: randomCondition.toLowerCase(),
      icon: '01d'
    };
  }

  /**
   * Get mock forecast for demo
   */
  getMockForecast(lat, lng) {
    const forecast = [];
    for (let i = 0; i < 8; i++) {
      forecast.push({
        timestamp: Date.now() / 1000 + (i * 3 * 3600),
        temperature: 15 + Math.random() * 15,
        rainfall: Math.random() > 0.7 ? Math.random() * 30 : 0,
        condition: Math.random() > 0.7 ? 'Rain' : 'Clear',
        description: Math.random() > 0.7 ? 'light rain' : 'clear sky'
      });
    }
    return forecast;
  }
}

module.exports = new WeatherService();
