const Place = require('../models/Place');

/** GET /api/places */
async function getAll(req, res, next) {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const places = await Place.find(filter).sort({ popularityScore: -1 });
    res.json({ success: true, count: places.length, data: places });
  } catch (err) {
    next(err);
  }
}

/** GET /api/places/:id */
async function getOne(req, res, next) {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, data: place });
  } catch (err) {
    next(err);
  }
}

/** POST /api/places */
async function create(req, res, next) {
  try {
    const place = await Place.create(req.body);
    res.status(201).json({ success: true, data: place });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/places/:id */
async function update(req, res, next) {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, data: place });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/places/:id */
async function remove(req, res, next) {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, message: 'Place deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
