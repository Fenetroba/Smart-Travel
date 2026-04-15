const { getRecommendations } = require('../services/recommendation.service');
const Analytics = require('../models/Analytics');

/**
 * GET /api/recommendations?location=Sarbet
 */
async function recommend(req, res, next) {
  try {
    const { location, count } = req.query;
    if (!location) {
      return res.status(400).json({ success: false, message: 'location query param is required' });
    }
    const results = await getRecommendations(location, count ? parseInt(count) : 3);
    
    // Track the recommendation request for analytics
    try {
      await Analytics.create({
        eventType: 'recommendation_request',
        data: {
          location,
          resultCount: results.length,
          sessionId: req.sessionID || req.ip + Date.now(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    } catch (analyticsErr) {
      console.error('Analytics tracking failed:', analyticsErr);
    }
    
    res.json({ success: true, location, data: results });
  } catch (err) {
    next(err);
  }
}

module.exports = { recommend };
