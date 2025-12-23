const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const Document = require('../models/Document');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const NotificationService = require('../utils/notificationService');
const { calculateApplicationScore } = require('../utils/eligibilityCalculator');

exports.submitApplication = catchAsync(async (req, res, next) => {
    // 1. Check if scholarship exists
    const scholarship = await Scholarship.findById(req.body.scholarship);
    if (!scholarship) {
        return next(new AppError('Scholarship not found', 404));
    }

    // 2. Check for duplicate application
    const existingApp = await Application.findOne({
        student: req.user.id,
        scholarship: req.body.scholarship
    });

    if (existingApp) {
        return next(new AppError('You have already applied for this scholarship', 400));
    }

    // 3. Calculate Score (Automated Ranking)
    const score = calculateApplicationScore(req.user, scholarship);

    // 4. Create Application
    const newApplication = await Application.create({
        student: req.user.id,
        scholarship: req.body.scholarship,
        customAnswers: req.body.customAnswers,
        status: 'submitted',
        score: score, // Saved here
        timeline: [{
            status: 'submitted',
            comment: 'Application submitted',
            updatedBy: req.user.id
        }]
    });

    // Notification Trigger
    const notifService = new NotificationService(req.app.get('io'));
    await notifService.createNotification({
        userId: req.user.id,
        title: 'Application Submitted',
        message: `Your application for ${scholarship.title} has been successfully submitted.`,
        type: 'success',
        relatedLink: `/applications/${newApplication._id}`,
        sendEmail: true
    });

    res.status(201).json({
        status: 'success',
        data: {
            application: newApplication
        }
    });
});

exports.getMyApplications = catchAsync(async (req, res, next) => {
    const applications = await Application.find({ student: req.user.id })
        .populate('scholarship', 'title amount deadline status')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: applications.length,
        data: {
            applications
        }
    });
});

exports.getApplication = catchAsync(async (req, res, next) => {
    let query = Application.findById(req.params.id)
        .populate('student', 'name email academicProfile financialProfile') // Populated profile for review
        .populate('scholarship')
        .populate('submittedDocuments.document');

    const application = await query;

    if (!application) {
        return next(new AppError('No application found with that ID', 404));
    }

    // Access Control
    const isOwner = application.student._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProvider = req.user.role === 'provider';

    if (!isOwner && !isAdmin && !isProvider) {
        return next(new AppError('You do not have permission to view this application', 403));
    }

    // If provider, ensure they own the scholarship
    if (isProvider) {
        const scholarship = await Scholarship.findById(application.scholarship._id);
        if (scholarship.provider.toString() !== req.user.id) {
            return next(new AppError('You do not have permission to view this application', 403));
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            application
        }
    });
});

exports.updateApplication = catchAsync(async (req, res, next) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        return next(new AppError('No application found', 404));
    }

    if (application.student.toString() !== req.user.id) {
        return next(new AppError('Not authorized', 403));
    }

    // Only allow updating if status is draft or similar initial state
    if (application.status !== 'draft' && application.status !== 'received') {
        return next(new AppError('Cannot update application after it is under review', 400));
    }

    const updatedApp = await Application.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            application: updatedApp
        }
    });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
    const { status, comment } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    // Permission: Admin or Provider (owner)
    const isProvider = req.user.role === 'provider';
    if (isProvider) {
        const scholarship = await Scholarship.findById(application.scholarship);
        if (scholarship.provider.toString() !== req.user.id) {
            return next(new AppError('Not authorized', 403));
        }
    }

    application.status = status;
    application.timeline.push({
        status,
        comment: comment || `Status updated to ${status}`,
        updatedBy: req.user.id,
        date: Date.now()
    });

    await application.save();

    // Notify student
    const notifService = new NotificationService(req.app.get('io'));
    await notifService.createNotification({
        userId: application.student,
        title: 'Application Status Updated',
        message: `Your application status for scholarship has been updated to: ${status}`,
        type: 'application_update',
        relatedLink: `/applications/${application._id}`,
        sendEmail: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            application
        }
    });
});

exports.uploadDocument = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload a file', 400));
    }

    const { documentType } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    const newDoc = await Document.create({
        owner: req.user.id,
        name: req.file.originalname,
        type: documentType || 'Other',
        url: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size
    });

    application.submittedDocuments.push({
        documentType: documentType || 'Other',
        document: newDoc._id
    });

    await application.save();

    res.status(200).json({
        status: 'success',
        data: {
            document: newDoc,
            application
        }
    });
});

exports.getAllApplications = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.user.role === 'provider') {
        const myScholarships = await Scholarship.find({ provider: req.user.id }).select('_id');
        const scholarshipIds = myScholarships.map(s => s._id);
        filter = { scholarship: { $in: scholarshipIds } };
    }

    const features = new APIFeatures(Application.find(filter), req.query)
        .filter()
        .sort() // Users can sort by 'score' now if they want!
        .paginate();

    const applications = await features.query
        .populate('student', 'name email academicProfile')
        .populate('scholarship', 'title');

    res.status(200).json({
        status: 'success',
        results: applications.length,
        data: {
            applications
        }
    });
});

exports.addComment = catchAsync(async (req, res, next) => {
    const { comment } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return next(new AppError('Application not found', 404));

    application.timeline.push({
        status: application.status,
        comment: comment,
        updatedBy: req.user.id
    });

    await application.save();

    res.status(200).json({
        status: 'success',
        data: {
            application
        }
    });
});
