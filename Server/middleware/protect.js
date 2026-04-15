const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - check for valid JWT in cookie or Authorization header
 */
async function protect(req, res, next) {
  try {
    let token;

    // 1. Check for token in cookies (preferred)
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // 2. Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorised — no token' 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User no longer exists' 
      });
    }

    // 4. Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account is deactivated' 
      });
    }

    // Grant access
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorised — invalid token' 
    });
  }
}

/**
 * Restrict to specific roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorised — insufficient permissions' 
      });
    }
    next();
  };
}

module.exports = { protect, requireRole };