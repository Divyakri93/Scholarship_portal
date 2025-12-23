const Document = require('../models/Document');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const cloudinary = require('../config/cloudinary'); // Removed unused/missing import
const NotificationService = require('../utils/notificationService');

exports.uploadDocument = catchAsync(async (req, res, next) => {
    // Check if file exists
    if (!req.file) {
        console.error("Upload failed: No file received in req.file");
        return next(new AppError('No file uploaded', 400));
    }
    console.log("File uploaded to Cloudinary:", req.file);

    // Cloudinary upload handled by multer-storage-cloudinary or manual
    // If using stream/admin SDK or middleware:
    // In our uploadMiddleware, we set up storage which writes to cloudinary.
    // So req.file.path is the URL, req.file.filename is the public_id.

    const newDoc = await Document.create({
        owner: req.user.id,
        name: req.body.name || req.file.originalname,
        type: req.body.type || 'Other',
        url: req.file.path,
        publicId: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'pending' // Reset/Default
    });

    res.status(201).json({
        status: 'success',
        data: {
            document: newDoc
        }
    });
});

exports.getDocument = catchAsync(async (req, res, next) => {
    const document = await Document.findById(req.params.id);
    // ... auth check ...
    res.status(200).json({ status: 'success', data: { document } });
});

// ... delete ...
exports.getMyDocuments = catchAsync(async (req, res, next) => {
    const documents = await Document.find({ owner: req.user.id });
    res.status(200).json({
        status: 'success',
        results: documents.length,
        data: { documents }
    });
});

exports.deleteDocument = catchAsync(async (req, res, next) => {
    const document = await Document.findById(req.params.id);
    if (!document) return next(new AppError('Document not found', 404));

    // Auth check
    if (document.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized', 403));
    }

    await Document.findByIdAndDelete(req.params.id);
    // Should also delete from Cloudinary/Disk if real

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.verifyDocument = catchAsync(async (req, res, next) => {
    const { status, comments } = req.body; // status: 'verified' | 'rejected'

    const document = await Document.findByIdAndUpdate(req.params.id, {
        status,
        verificationComments: comments
    }, { new: true });

    if (!document) return next(new AppError('Document not found', 404));

    // Notify Owner
    const title = status === 'verified' ? 'Document Verified' : 'Document Rejected';
    const msg = `Your document "${document.name}" has been ${status}.${comments ? ` Comment: ${comments}` : ''}`;

    await NotificationService.createNotification({
        recipient: document.owner,
        title,
        message: msg,
        type: 'alert'
    });

    res.status(200).json({
        status: 'success',
        data: { document }
    });
});
