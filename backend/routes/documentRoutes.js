const express = require('express');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post(
    '/',
    upload.single('file'),
    documentController.uploadDocument
);

router.get('/', documentController.getMyDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);
router.patch(
    '/:id/verify',
    authMiddleware.restrictTo('admin', 'provider'),
    documentController.verifyDocument
);

module.exports = router;
