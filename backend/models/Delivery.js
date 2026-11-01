const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  // Delivery ID
  deliveryId: { type: String, unique: true },
  
  // Cargo Details
  cargoType: {
    type: String,
    required: true,
    enum: ['Medicine', 'Food', 'Construction', 'General', 'Emergency']
  },
  cargoWeight: { type: Number, required: true }, // in tons
  cargoDescription: { type: String },
  
  // Priority
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  // Locations
  pickupLocation: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String
  },
  
  deliveryLocation: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String
  },
  
  // Route
  selectedRoute: {
    distance: { type: Number }, // in km
    duration: { type: Number }, // in hours
    riskScore: { type: Number }, // 0-100
    routePath: [{ lat: Number, lng: Number }],
    routeName: String
  },
  
  // Assigned Driver
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Created By (Admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Progress
  progress: { type: Number, default: 0 }, // 0-100%
  
  // Current Location (updated via GPS)
  currentLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  
  // Timing
  scheduledDepartureTime: { type: Date },
  actualDepartureTime: { type: Date },
  estimatedArrivalTime: { type: Date },
  actualArrivalTime: { type: Date },
  
  // Payment
  payment: {
    baseAmount: { type: Number },
    bonusAmount: { type: Number, default: 0 },
    totalAmount: { type: Number },
    fuelEstimate: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    }
  },
  
  // Special Instructions
  specialInstructions: { type: String },
  isTemperatureControlled: { type: Boolean, default: false },
  isFragile: { type: Boolean, default: false },
  
  // Delivery Confirmation
  deliveryProof: {
    photoUrl: String,
    signatureUrl: String,
    otp: String,
    recipientName: String,
    timestamp: Date
  },
  
  // Rerouting History
  reroutingHistory: [{
    reason: String,
    oldRoute: Object,
    newRoute: Object,
    timestamp: Date
  }],
  
  // District
  district: { type: String },
  state: { type: String }
}, {
  timestamps: true
});

// Auto-generate delivery ID
deliverySchema.pre('save', async function(next) {
  if (!this.deliveryId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Delivery').countDocuments();
    this.deliveryId = `DLV-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);
