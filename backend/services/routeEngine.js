/**
 * Route Engine - AI-powered route optimization
 * Calculates 3 route options with risk scoring based on 7 factors
 */

class RouteEngine {
  constructor() {
    this.RISK_WEIGHTS = {
      landslideRisk: 0.20,
      floodRisk: 0.15,
      fogRisk: 0.10,
      weatherRisk: 0.15,
      terrainDifficulty: 0.15,
      roadCondition: 0.15,
      historicalIncidents: 0.10
    };
  }

  /**
   * Calculate 3 route options between two points
   * @param {Object} start - {lat, lng}
   * @param {Object} end - {lat, lng}
   * @returns {Array} - Array of 3 route objects
   */
  async calculateRoutes(start, end) {
    // Generate 3 different route options
    const routes = [
      await this.generateRoute(start, end, 'recommended'),
      await this.generateRoute(start, end, 'fastest'),
      await this.generateRoute(start, end, 'safest')
    ];

    return routes;
  }

  /**
   * Generate a single route based on type
   */
  async generateRoute(start, end, type) {
    const distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
    
    // Generate path (simplified - in production, use OSRM or Google Maps API)
    const path = this.generatePath(start, end, type);
    
    // Calculate risk factors
    const riskFactors = await this.calculateRiskFactors(path, type);
    
    // Calculate overall risk score
    const riskScore = this.calculateOverallRisk(riskFactors);
    
    // Adjust distance and duration based on route type
    let adjustedDistance = distance;
    let duration = distance / 50; // Assume 50 km/h average
    
    if (type === 'fastest') {
      adjustedDistance = distance * 0.9; // Shorter but riskier
      duration = distance / 65; // Faster speed
    } else if (type === 'safest') {
      adjustedDistance = distance * 1.3; // Longer but safer
      duration = distance / 45; // Slower due to safer roads
    }

    return {
      routeName: this.getRouteName(type),
      distance: Math.round(adjustedDistance),
      duration: Math.round(duration * 10) / 10,
      riskScore: Math.round(riskScore),
      riskFactors,
      routePath: path,
      description: this.getRouteDescription(type, riskScore)
    };
  }

  /**
   * Calculate risk factors for a route
   */
  async calculateRiskFactors(path, type) {
    // Simplified risk calculation - in production, integrate with weather API, terrain data, etc.
    let factors = {
      landslideRisk: Math.random() * 100,
      floodRisk: Math.random() * 100,
      fogRisk: Math.random() * 100,
      weatherRisk: Math.random() * 100,
      terrainDifficulty: Math.random() * 100,
      roadCondition: Math.random() * 100,
      historicalIncidents: Math.random() * 100
    };

    // Adjust based on route type
    if (type === 'safest') {
      Object.keys(factors).forEach(key => {
        factors[key] = factors[key] * 0.3; // Reduce all risks
      });
    } else if (type === 'fastest') {
      Object.keys(factors).forEach(key => {
        factors[key] = factors[key] * 1.5; // Increase all risks
      });
    }

    // Round values
    Object.keys(factors).forEach(key => {
      factors[key] = Math.min(Math.round(factors[key]), 100);
    });

    return factors;
  }

  /**
   * Calculate overall risk score using weighted average
   */
  calculateOverallRisk(riskFactors) {
    let totalRisk = 0;
    
    Object.keys(this.RISK_WEIGHTS).forEach(factor => {
      totalRisk += riskFactors[factor] * this.RISK_WEIGHTS[factor];
    });

    return Math.min(totalRisk, 100);
  }

  /**
   * Generate path points between start and end
   */
  generatePath(start, end, type) {
    const points = [];
    const steps = 10; // Number of waypoints

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      
      // Add some variation based on route type
      let deviation = 0;
      if (type === 'fastest') {
        deviation = (Math.random() - 0.5) * 0.02;
      } else if (type === 'safest') {
        deviation = (Math.random() - 0.5) * 0.05;
      } else {
        deviation = (Math.random() - 0.5) * 0.03;
      }

      points.push({
        lat: start.lat + (end.lat - start.lat) * ratio + deviation,
        lng: start.lng + (end.lng - start.lng) * ratio + deviation
      });
    }

    return points;
  }

  /**
   * Calculate distance using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  getRouteName(type) {
    const names = {
      recommended: 'Route A (Recommended)',
      fastest: 'Route B (Fastest)',
      safest: 'Route C (Safest)'
    };
    return names[type] || 'Route';
  }

  getRouteDescription(type, riskScore) {
    if (riskScore < 30) return 'Low risk, good road conditions';
    if (riskScore < 65) return 'Medium risk, some weather concerns';
    return 'High risk, hazardous conditions expected';
  }

  /**
   * Check if route passes through blockage
   */
  isRouteBlocked(route, blockages) {
    // Simplified - check if any blockage is near the route
    for (const blockage of blockages) {
      for (const point of route.routePath) {
        const distance = this.calculateDistance(
          point.lat, point.lng,
          blockage.location.coordinates.lat,
          blockage.location.coordinates.lng
        );
        
        if (distance < 5) { // Within 5km
          return true;
        }
      }
    }
    return false;
  }
}

module.exports = new RouteEngine();
