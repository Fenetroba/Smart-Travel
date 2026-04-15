const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');

/** Sign a JWT for a user */
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Create and send token as cookie */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cookie cannot be accessed or modified by browser JavaScript
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'lax', // Protect against CSRF
    path: '/'
  };

  // Send cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token, // Also send in body for backward compatibility
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

/**
 * POST /api/auth/register
 * Creates a new admin user. Only superadmins can create other superadmins.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'admin' });
    createSendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT + user info.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (requires protect middleware).
 */
async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

/**
 * PUT /api/auth/change-password
 * Allows an authenticated user to change their own password.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const match = await user.comparePassword(currentPassword);

    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Clears the JWT cookie
 */
async function logout(req, res) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/'
  });
  
  res.json({ success: true, message: 'Logged out successfully' });
}

// Validation rules (used in routes)
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { register, login, getMe, changePassword, logout, registerValidation, loginValidation };