const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/routes.controller');
const { validate } = require('../middleware/validate');

// Validation rules for create/update
const routeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Route name is required'),
  body('hubSequence')
    .isArray({ min: 2 })
    .withMessage('Hub sequence must be an array with at least 2 hubs'),
  body('distanceKm')
    .isFloat({ min: 0.1 })
    .withMessage('Distance must be a positive number'),
];

// CRUD endpoints
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', routeValidation, validate, ctrl.create);
router.put('/:id', routeValidation, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
