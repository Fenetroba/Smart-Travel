const { calculateRoute } = require('../services/routing.service');
const Analytics = require('../models/Analytics');

/**
 * POST /api/route/calculate
 * Body: { start, destination }
 */
async function calculate(req, res, next) {
  try {
    const { start, destination } = req.body;
    const result = await calculateRoute(start, destination);
    
    // Track the route search for analytics
    try {
      await Analytics.create({
        eventType: 'route_search',
        data: {
          startLocation: start,
          endLocation: destination,
          transportType: result.bestRoute?.transportType,
          distance: result.bestRoute?.distance,
          cost: result.bestRoute?.cost,
          duration: result.bestRoute?.time,
          sessionId: req.sessionID || req.ip + Date.now(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    } catch (analyticsErr) {
      // Don't fail the main request if analytics fails
      console.error('Analytics tracking failed:', analyticsErr);
    }
    
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { calculate };
