const Route = require('../models/Route');

/** GET /api/routes - fetch all routes sorted by createdAt */
async function getAll(req, res, next) {
  try {
    const routes = await Route.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: routes });
  } catch (err) {
    next(err);
  }
}

/** GET /api/routes/:id - fetch single route by ID */
async function getOne(req, res, next) {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
}

/** POST /api/routes - create new route */
async function create(req, res, next) {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/routes/:id - update route */
async function update(req, res, next) {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/routes/:id - delete route */
async function remove(req, res, next) {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.json({ success: true, message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
