const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  fullName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // User Type
  userType: { 
    type: String, 
    required: true,
    enum: ['driver', 'field_official', 'district_admin', 'state_admin']
  },
  
  // Driver-specific fields
  driverLicense: { type: String },
  vehicleRegistration: { type: String },
  vehicleType: { type: String },
  vehicleCapacity: { type: Number }, // in tons
  vehicleFuelCapacity: { type: Number }, // in liters
  companyName: { type: String },
  emergencyContact: {
    name: String,
    phone: String
  },
  
  // Field Official-specific fields
  designation: { type: String },
  department: { 
    type: String,
    enum: ['PWD', 'Police', 'BRO', 'DDMA', 'Other']
  },
  employeeId: { type: String },
  
  // Admin fields
  district: { type: String },
  state: { 
    type: String,
    enum: ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Sikkim']
  },
  
  // Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Profile
  photoUrl: { type: String },
  idProofUrl: { type: String },
  
  // Performance (for drivers)
  rating: { type: Number, default: 5.0 },
  totalDeliveries: { type: Number, default: 0 },
  onTimeDeliveries: { type: Number, default: 0 },
  
  // Bonus earnings (for field officials and drivers)
  totalBonus: { type: Number, default: 0 },
  
  // GPS tracking consent
  gpsTrackingConsent: { type: Boolean, default: false },
  
  // Last active
  lastActive: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
