const express = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

// Student Routes
router.post('/', authMiddleware.restrictTo('student'), applicationController.submitApplication);
router.get('/my-applications', authMiddleware.restrictTo('student'), applicationController.getMyApplications);
router.post('/:id/documents',
    authMiddleware.restrictTo('student'),
    upload.single('document'),
    applicationController.uploadDocument
);
router.put('/:id', authMiddleware.restrictTo('student'), applicationController.updateApplication);

// Shared Routes (Viewing)
router.get('/:id', applicationController.getApplication);

// Admin/Provider Routes
router.use(authMiddleware.restrictTo('admin', 'provider'));

router.get('/admin/all', applicationController.getAllApplications);
router.patch('/:id/status', applicationController.updateStatus);
router.post('/:id/comments', applicationController.addComment);

module.exports = router;
