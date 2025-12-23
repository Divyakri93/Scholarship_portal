const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['student', 'provider', 'admin'])
        .withMessage('Invalid role'),
];

router.post('/register', validateRegister, (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(err => err.msg).join('. ');
        return res.status(400).json({
            status: 'fail',
            message,
            errors: errors.array()
        });
    }
    next();
}, authController.register);

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/refresh-token', authController.refreshToken); // Using cookie

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.get('/me', authController.getMe);

module.exports = router;
