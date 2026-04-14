const mongoose = require('mongoose');

/**
 * Hub — a major transport node in Addis Ababa.
 * Used as waypoints in route calculation.
 */
const hubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hub name is required'],
      unique: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be >= -90'],
      max: [90, 'Latitude must be <= 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be >= -180'],
      max: [180, 'Longitude must be <= 180'],
    },
    // Higher score = more important hub (used to prefer well-connected hubs)
    importanceScore: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
hubSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Hub', hubSchema);
