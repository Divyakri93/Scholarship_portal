const express = require('express');
const scholarshipController = require('../controllers/scholarshipController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware for creating/updating scholarships
const validateScholarship = [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('deadline').isISO8601().toDate().withMessage('Valid deadline date is required'),
    // Add more specific validations as needed
];

// Public Routes
router.get('/', scholarshipController.getAllScholarships);
router.get('/search', scholarshipController.getAllScholarships); // Alias for clarity
router.route('/:id')
    .get(authMiddleware.protect, scholarshipController.getScholarship) // Optional protect if public? Assuming mixed
    .patch(authMiddleware.protect, authMiddleware.restrictTo('provider', 'admin'), scholarshipController.updateScholarship)
    .delete(authMiddleware.protect, authMiddleware.restrictTo('provider', 'admin'), scholarshipController.deleteScholarship);

router.get('/:id/eligibility', authMiddleware.protect, scholarshipController.checkEligibility);

// Protected Routes
router.use(authMiddleware.protect); // Login required for all below

// Student Routes
router.get('/my/eligible', authMiddleware.restrictTo('student'), scholarshipController.getEligibleScholarships);

// Provider/Admin Routes
router.use(authMiddleware.restrictTo('admin', 'provider'));

router.post(
    '/',
    validateScholarship,
    scholarshipController.createScholarship
);

router.put(
    '/:id',
    scholarshipController.updateScholarship
);

// Admin Only
router.delete(
    '/:id',
    authMiddleware.restrictTo('admin'),
    scholarshipController.deleteScholarship
);

module.exports = router;
