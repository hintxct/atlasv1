const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  // Route Details
  name: { type: String, required: true },
  
  // Start and End Points
  startPoint: {
    name: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  
  endPoint: {
    name: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  
  // Path (array of coordinates)
  path: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  
  // Route Metrics
  distance: { type: Number, required: true }, // in km
  estimatedDuration: { type: Number, required: true }, // in hours
  
  // Risk Analysis
  riskScore: { type: Number, default: 0 }, // 0-100
  riskFactors: {
    landslideRisk: { type: Number, default: 0 },
    floodRisk: { type: Number, default: 0 },
    fogRisk: { type: Number, default: 0 },
    weatherRisk: { type: Number, default: 0 },
    terrainDifficulty: { type: Number, default: 0 },
    roadCondition: { type: Number, default: 0 },
    historicalIncidents: { type: Number, default: 0 }
  },
  
  // Roads Used
  roadsUsed: [{
    roadType: String,
    roadNumber: String,
    length: Number // km on this road
  }],
  
  // Historical Data
  successRate: { type: Number, default: 100 }, // percentage
  totalUses: { type: Number, default: 0 },
  averageDelay: { type: Number, default: 0 }, // in minutes
  
  // Current Status
  isBlocked: { type: Boolean, default: false },
  activeBlockages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blockage'
  }],
  
  // Weather Conditions
  currentWeatherRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  // Alternative Routes
  alternativeRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
