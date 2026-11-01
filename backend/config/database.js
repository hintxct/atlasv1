const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Run npm start from the project root to set up local development.');
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
