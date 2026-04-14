const Hub = require('../models/Hub');

/** GET /api/hubs */
async function getAll(req, res, next) {
  try {
    const hubs = await Hub.find({}).sort({ importanceScore: -1 });
    res.json({ success: true, count: hubs.length, data: hubs });
  } catch (err) {
    next(err);
  }
}

/** GET /api/hubs/:id */
async function getOne(req, res, next) {
  try {
    const hub = await Hub.findById(req.params.id);
    if (!hub) return res.status(404).json({ success: false, message: 'Hub not found' });
    res.json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}

/** POST /api/hubs */
async function create(req, res, next) {
  try {
    const hub = await Hub.create(req.body);
    res.status(201).json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/hubs/:id */
async function update(req, res, next) {
  try {
    const hub = await Hub.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hub) return res.status(404).json({ success: false, message: 'Hub not found' });
    res.json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/hubs/:id */
async function remove(req, res, next) {
  try {
    const hub = await Hub.findByIdAndDelete(req.params.id);
    if (!hub) return res.status(404).json({ success: false, message: 'Hub not found' });
    res.json({ success: true, message: 'Hub deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
