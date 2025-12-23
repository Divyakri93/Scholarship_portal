const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const AppError = require('../utils/appError');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'scholarship-portal',
        allowed_formats: ['jpg', 'png', 'pdf'],
        resource_type: 'auto', // Auto-detect (important for PDFs)
        public_id: (req, file) => {
            const userId = req.user ? req.user.id : 'anonymous';
            return `doc-${userId}-${Date.now()}`;
        }
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Not an image or PDF! Please upload only images or PDF.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = {
    upload,
    cloudinary
};
