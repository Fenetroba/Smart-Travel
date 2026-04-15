const mongoose = require('mongoose');

/**
 * Route — predefined paths between hubs for admin management.
 * Stores route name, hub sequence, distance, and estimated time.
 */
const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    hubSequence: {
      type: [String],
      required: [true, 'Hub sequence is required'],
      validate: {
        validator: (arr) => arr.length >= 2,
        message: 'Route must have at least 2 hubs',
      },
    },
    distanceKm: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0.1, 'Distance must be positive'],
    },
    estimatedTime: {
      type: Number, // minutes
      min: [1, 'Estimated time must be at least 1 minute'],
    },
  },
  { timestamps: true }
);

// Index for efficient queries
routeSchema.index({ name: 1 });

module.exports = mongoose.model('Route', routeSchema);
