const mongoose = require('mongoose');

/**
 * Place — a point of interest used for destination recommendations.
 */
const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['restaurant', 'park', 'museum', 'transport', 'hotel', 'market', 'other'],
      required: [true, 'Category is required'],
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    // 0–10 scale; higher = more popular
    popularityScore: {
      type: Number,
      default: 5,
      min: 0,
      max: 10,
    },
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

placeSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Place', placeSchema);
