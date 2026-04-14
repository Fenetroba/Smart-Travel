const mongoose = require('mongoose');

/**
 * Analytics — tracks system usage and traveler interactions
 */
const analyticsSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        'route_search',
        'recommendation_request', 
        'transport_analysis',
        'page_visit',
        'user_session'
      ]
    },
    data: {
      // Flexible data storage for different event types
      startLocation: String,
      endLocation: String,
      transportType: String,
      distance: Number,
      cost: Number,
      duration: Number,
      userAgent: String,
      ipAddress: String,
      sessionId: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient querying
analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ 'data.sessionId': 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);