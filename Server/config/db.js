const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Exits the process on failure so the server doesn't start in a broken state.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_travel_addis';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
