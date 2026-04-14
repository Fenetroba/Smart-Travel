const express = require('express');
const router = express.Router();
const {
  register, login, getMe, changePassword,
  registerValidation, loginValidation,
} = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/protect');

// Public
router.post('/register', registerValidation, validate, register);
router.post('/login',    loginValidation,    validate, login);

// Protected
router.get('/me',              protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
