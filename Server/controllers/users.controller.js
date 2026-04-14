/**
 * Users controller — superadmin-only operations.
 * Manage admin accounts: list, view, activate/deactivate, delete.
 */

const User = require('../models/User');

/** GET /api/users — list all admins (superadmin only) */
async function getAll(req, res, next) {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/:id */
async function getOne(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/** POST /api/users — superadmin creates a new admin */
async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Create user with specified role (default to admin)
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role || 'admin' 
    });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/:id — update user details */
async function update(req, res, next) {
  try {
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/:id/toggle-active — activate or deactivate an admin */
async function toggleActive(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent superadmin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Admin ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { id: user._id, name: user.name, isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:id — soft delete (deactivate) user */
async function remove(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    res.json({ success: true, message: 'User deactivated', data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, toggleActive, remove };
