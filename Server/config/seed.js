/**
 * Database seeder — populates Hubs, Transports, and Places
 * with realistic Addis Ababa data.
 *
 * Run: node config/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Hub = require('../models/Hub');
const Transport = require('../models/Transport');
const Place = require('../models/Place');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_travel_addis';

const hubs = [
  { name: 'Kality',        latitude: 8.9806,  longitude: 38.7578, importanceScore: 3 },
  { name: 'Megenagna',     latitude: 9.0272,  longitude: 38.7969, importanceScore: 5 },
  { name: 'Sarbet',        latitude: 9.0054,  longitude: 38.7636, importanceScore: 4 },
  { name: 'Bole',          latitude: 8.9956,  longitude: 38.7894, importanceScore: 5 },
  { name: 'Piassa',        latitude: 9.0300,  longitude: 38.7469, importanceScore: 4 },
  { name: 'Merkato',       latitude: 9.0350,  longitude: 38.7300, importanceScore: 4 },
  { name: 'Kazanchis',     latitude: 9.0150,  longitude: 38.7700, importanceScore: 3 },
  { name: 'Mexico Square', latitude: 9.0200,  longitude: 38.7550, importanceScore: 3 },
  { name: 'Arat Kilo',     latitude: 9.0450,  longitude: 38.7600, importanceScore: 3 },
  { name: 'Lebu',          latitude: 8.9600,  longitude: 38.7400, importanceScore: 2 },
];

const transports = [
  { type: 'taxi', label: 'Taxi',  pricePerKm: 15, speedKmPerHour: 35, description: 'Fast, expensive' },
  { type: 'bus',  label: 'Bus',   pricePerKm: 2,  speedKmPerHour: 20, description: 'Cheap, slow'     },
  { type: 'walk', label: 'Walk',  pricePerKm: 0,  speedKmPerHour: 5,  description: 'Free, very slow' },
];

const places = [
  { name: 'Yod Abyssinia Restaurant', category: 'restaurant', latitude: 9.0280, longitude: 38.7980, popularityScore: 9, entryFee: 0 },
  { name: 'Friendship Park',          category: 'park',       latitude: 9.0260, longitude: 38.7950, popularityScore: 7, entryFee: 0 },
  { name: 'National Museum of Ethiopia', category: 'museum',  latitude: 9.0380, longitude: 38.7620, popularityScore: 9, entryFee: 10 },
  { name: 'Edna Mall',                category: 'market',     latitude: 8.9970, longitude: 38.7900, popularityScore: 8, entryFee: 0 },
  { name: 'Bole International Hotel', category: 'hotel',      latitude: 8.9960, longitude: 38.7890, popularityScore: 8, entryFee: 0 },
  { name: 'Merkato Open Market',      category: 'market',     latitude: 9.0360, longitude: 38.7310, popularityScore: 8, entryFee: 0 },
  { name: 'Entoto Natural Park',      category: 'park',       latitude: 9.0700, longitude: 38.7600, popularityScore: 8, entryFee: 0 },
  { name: 'St. George Cathedral',     category: 'museum',     latitude: 9.0310, longitude: 38.7480, popularityScore: 7, entryFee: 5 },
  { name: 'Taitu Hotel',              category: 'hotel',      latitude: 9.0290, longitude: 38.7460, popularityScore: 6, entryFee: 0 },
  { name: 'Sarbet Square Restaurant', category: 'restaurant', latitude: 9.0060, longitude: 38.7640, popularityScore: 6, entryFee: 0 },
  { name: 'Kazanchis Business Hotel', category: 'hotel',      latitude: 9.0160, longitude: 38.7710, popularityScore: 6, entryFee: 0 },
  { name: 'Addis Ababa University Museum', category: 'museum', latitude: 9.0460, longitude: 38.7610, popularityScore: 7, entryFee: 5 },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([Hub.deleteMany({}), Transport.deleteMany({}), Place.deleteMany({}), User.deleteMany({})]);
  console.log('Cleared existing data');

  // Create default superadmin user
  const superadmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@smarttravel.com',
    password: 'admin123',
    role: 'superadmin'
  });
  console.log(`✅ Created superadmin user: ${superadmin.email}`);

  // Create a regular admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@smarttravel.com', 
    password: 'admin123',
    role: 'admin'
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  await Hub.insertMany(hubs);
  console.log(`✅ Seeded ${hubs.length} hubs`);

  await Transport.insertMany(transports);
  console.log(`✅ Seeded ${transports.length} transport modes`);

  await Place.insertMany(places);
  console.log(`✅ Seeded ${places.length} places`);

  await mongoose.disconnect();
  console.log('Done. Database seeded successfully.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
