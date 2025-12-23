const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);

module.exports = router;
