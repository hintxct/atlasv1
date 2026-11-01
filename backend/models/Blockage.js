const mongoose = require('mongoose');

const blockageSchema = new mongoose.Schema({
  // Location
  location: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    roadType: {
      type: String,
      enum: ['National Highway', 'State Highway', 'District Road'],
      required: true
    },
    roadNumber: { type: String, required: true }, // NH-37, SH-5, etc.
    kmMarker: { type: String }
  },
  
  // Blockage Details
  blockageType: {
    type: String,
    required: true,
    enum: ['Landslide', 'Flooding', 'Bridge Collapse', 'Heavy Fog', 
           'Road Under Repair', 'Accident', 'Animal Crossing', 'Fallen Trees']
  },
  
  severity: {
    type: String,
    required: true,
    enum: ['complete', 'partial', 'minor'],
    default: 'complete'
  },
  
  // Reported By
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reporterType: {
    type: String,
    enum: ['driver', 'field_official'],
    required: true
  },
  
  // Evidence
  photos: [{ type: String }], // URLs
  voiceNote: { type: String }, // URL
  
  // Clearance
  estimatedClearanceTime: { type: Number }, // in hours
  clearanceAgency: {
    type: String,
    enum: ['PWD', 'BRO', 'NHAI', 'Private Contractor', 'Unknown']
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'in_progress', 'cleared', 'false_report'],
    default: 'active'
  },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: { type: Date },
  
  // Clearance
  clearedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clearedAt: { type: Date },
  clearancePhotos: [{ type: String }],
  
  // Impact
  affectedConvoys: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Delivery' 
  }],
  
  // Additional Info
  notes: { type: String },
  weatherConditions: { type: String },
  
  // District/State
  district: { type: String },
  state: { type: String },
  
  // Bonus (for reporting)
  bonusAwarded: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for geospatial queries
blockageSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Blockage', blockageSchema);
