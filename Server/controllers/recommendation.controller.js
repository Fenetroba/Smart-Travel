const { getRecommendations } = require('../services/recommendation.service');

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
    res.json({ success: true, location, data: results });
  } catch (err) {
    next(err);
  }
}

module.exports = { recommend };
