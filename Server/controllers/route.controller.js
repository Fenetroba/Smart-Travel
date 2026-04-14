const { calculateRoute } = require('../services/routing.service');

/**
 * POST /api/route/calculate
 * Body: { start, destination }
 */
async function calculate(req, res, next) {
  try {
    const { start, destination } = req.body;
    const result = await calculateRoute(start, destination);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { calculate };
