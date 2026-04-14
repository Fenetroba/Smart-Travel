const { analyzeTransport } = require('../services/transport.service');
const Transport = require('../models/Transport');

/**
 * GET /api/transport/analyze?distance=10
 */
async function analyze(req, res, next) {
  try {
    const distance = parseFloat(req.query.distance);
    if (isNaN(distance) || distance <= 0) {
      return res.status(400).json({ success: false, message: 'distance must be a positive number' });
    }
    const options = await analyzeTransport(distance);
    res.json({ success: true, distance, data: options });
  } catch (err) {
    next(err);
  }
}

/** GET /api/transports */
async function getAll(req, res, next) {
  try {
    const transports = await Transport.find({});
    res.json({ success: true, data: transports });
  } catch (err) {
    next(err);
  }
}

/** POST /api/transports */
async function create(req, res, next) {
  try {
    const transport = await Transport.create(req.body);
    res.status(201).json({ success: true, data: transport });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/transports/:id */
async function update(req, res, next) {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!transport) return res.status(404).json({ success: false, message: 'Transport not found' });
    res.json({ success: true, data: transport });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/transports/:id */
async function remove(req, res, next) {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);
    if (!transport) return res.status(404).json({ success: false, message: 'Transport not found' });
    res.json({ success: true, message: 'Transport deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze, getAll, create, update, remove };
