const mongoose = require('mongoose');

/**
 * Transport — configuration for each transport mode.
 * Drives cost and time calculations.
 */
const transportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['taxi', 'bus', 'walk'],
      required: [true, 'Transport type is required'],
      unique: true,
    },
    pricePerKm: {
      type: Number,
      required: [true, 'Price per km is required'],
      min: [0, 'Price cannot be negative'],
    },
    speedKmPerHour: {
      type: Number,
      required: [true, 'Speed is required'],
      min: [0.1, 'Speed must be positive'],
    },
    // Optional label shown in API responses
    label: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transport', transportSchema);
