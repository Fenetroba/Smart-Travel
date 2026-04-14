const mongoose = require('mongoose');

/**
 * RouteHistory — logs every route calculation.
 * Used for analytics and future AI/ML training.
 */
const routeHistorySchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    // Array of hub names representing the chosen path
    selectedRoute: {
      type: [String],
      required: true,
    },
    totalTime: {
      type: Number, // minutes
      required: true,
    },
    totalCost: {
      type: Number, // ETB
      required: true,
    },
    transportType: {
      type: String,
      enum: ['taxi', 'bus', 'walk'],
      default: 'bus',
    },
    score: {
      type: Number,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Index for analytics queries
routeHistorySchema.index({ start: 1, destination: 1 });
routeHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('RouteHistory', routeHistorySchema);
