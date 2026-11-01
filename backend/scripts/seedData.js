const mongoose = require('mongoose');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Blockage = require('../models/Blockage');

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Sample data for seeding
const users = [
  {
    fullName: 'Ravi Kumar',
    phone: '9876543210',
    password: 'password123',
    userType: 'driver',
    driverLicense: 'AS12345678',
    vehicleRegistration: 'AS01AB1234',
    vehicleType: '10-ton Truck',
    vehicleCapacity: 10,
    vehicleFuelCapacity: 100,
    district: 'Kamrup',
    state: 'Assam',
    approvalStatus: 'approved',
    isVerified: true,
    gpsTrackingConsent: true,
    rating: 4.8,
    totalDeliveries: 47
  },
  {
    fullName: 'Priya Sharma',
    phone: '9876543211',
    password: 'password123',
    userType: 'field_official',
    designation: 'Engineer',
    department: 'PWD',
    employeeId: 'PWD-AS-1234',
    district: 'Kamrup',
    state: 'Assam',
    approvalStatus: 'approved',
    isVerified: true
  },
  {
    fullName: 'Amit Singh',
    phone: '9876543212',
    password: 'password123',
    userType: 'district_admin',
    designation: 'Logistics Manager',
    district: 'Kamrup',
    state: 'Assam',
    approvalStatus: 'approved',
    isVerified: true
  },
  {
    fullName: 'Dr. Rajesh Verma',
    phone: '9876543213',
    password: 'password123',
    userType: 'state_admin',
    designation: 'Secretary',
    state: 'Assam',
    approvalStatus: 'approved',
    isVerified: true
  }
];

const blockages = [
  {
    location: {
      name: 'NH-37, KM 145',
      coordinates: { lat: 26.1445, lng: 91.7362 },
      roadType: 'National Highway',
      roadNumber: 'NH-37',
      kmMarker: 'KM 145'
    },
    blockageType: 'Landslide',
    severity: 'complete',
    district: 'Kamrup',
    state: 'Assam',
    status: 'active',
    estimatedClearanceTime: 4,
    clearanceAgency: 'PWD',
    isVerified: true
  }
];

async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Delivery.deleteMany({});
    await Blockage.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Update blockages with reporter IDs
    const officialUser = createdUsers.find(u => u.userType === 'field_official');
    blockages[0].reportedBy = officialUser._id;
    blockages[0].reporterType = 'field_official';
    blockages[0].verifiedBy = officialUser._id;
    blockages[0].verifiedAt = new Date();

    // Insert blockages
    const createdBlockages = await Blockage.insertMany(blockages);
    console.log(`✅ Created ${createdBlockages.length} blockages`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Sample Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Driver:');
    console.log('  Phone: 9876543210');
    console.log('  Password: password123');
    console.log('');
    console.log('Field Official:');
    console.log('  Phone: 9876543211');
    console.log('  Password: password123');
    console.log('');
    console.log('District Admin:');
    console.log('  Phone: 9876543212');
    console.log('  Password: password123');
    console.log('');
    console.log('State Admin:');
    console.log('  Phone: 9876543213');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
