const Scholarship = require('../models/Scholarship');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createScholarship = catchAsync(async (req, res, next) => {
    // If user is provider, force provider field to be them
    if (req.user.role === 'provider') {
        req.body.provider = req.user.id;
    }

    const newScholarship = await Scholarship.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            scholarship: newScholarship
        }
    });
});

exports.getAllScholarships = catchAsync(async (req, res, next) => {
    // Execute Query
    const features = new APIFeatures(Scholarship.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const scholarships = await features.query;

    // Total count for pagination
    // Note: This countDocuments doesn't account for filters in APIFeatures (which is complex to extract).
    // For simple pagination, we usually do a separate count query or ignore exact total if filtering.
    // Let's keep it simple: Scholarship.countDocuments() counts all. 
    // If strict match needed, we would need: Scholarship.countDocuments(features.query.getFilter())
    const total = await Scholarship.countDocuments(); // Simplification

    res.status(200).json({
        status: 'success',
        results: scholarships.length,
        total,
        data: {
            scholarships
        }
    });
});

exports.getScholarship = catchAsync(async (req, res, next) => {
    const scholarship = await Scholarship.findById(req.params.id).populate('provider', 'name email organizationDetails');

    if (!scholarship) {
        return next(new AppError('No scholarship found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            scholarship
        }
    });
});

exports.updateScholarship = catchAsync(async (req, res, next) => {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
        return next(new AppError('No scholarship found with that ID', 404));
    }

    // Check permissions
    if (req.user.role === 'provider' && scholarship.provider.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to edit this scholarship', 403));
    }

    const updatedScholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            scholarship: updatedScholarship
        }
    });
});

exports.deleteScholarship = catchAsync(async (req, res, next) => {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
        return next(new AppError('No scholarship found with that ID', 404));
    }

    await Scholarship.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

const { calculateEligibility } = require('../utils/eligibilityCalculator');

exports.checkEligibility = catchAsync(async (req, res, next) => {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
        return next(new AppError('Scholarship not found', 404));
    }

    const result = calculateEligibility(req.user, scholarship);

    res.status(200).json({
        status: 'success',
        data: {
            ...result
        }
    });
});

exports.getEligibleScholarships = catchAsync(async (req, res, next) => {
    const user = req.user;

    // Check if user or academic profile is missing
    if (!user || !user.academicProfile) {
        // Return empty list instead of error to avoid frontend crash if profile is just new
        return res.status(200).json({
            status: 'success',
            results: 0,
            data: { scholarships: [] },
            message: 'Please complete your academic profile to see matched scholarships'
        });
    }

    const { gpa, course } = user.academicProfile;
    const income = user.financialProfile?.annualIncome;

    const query = {
        isActive: true,
        $and: [
            { 'eligibility.minGPA': { $lte: gpa || 0 } },
        ]
    };

    // Income Check logic
    if (income !== undefined) {
        query.$and.push({
            $or: [
                { 'eligibility.maxIncome': { $exists: false } },
                { 'eligibility.maxIncome': { $gte: income } },
                { 'eligibility.maxIncome': null }
            ]
        });
    }

    // Course Check logic
    if (course) {
        query.$or = [
            { 'eligibility.allowedCourses': { $in: [course] } },
            { 'eligibility.allowedCourses': { $size: 0 } },
            { 'eligibility.allowedCourses': { $exists: false } }
        ];
    }

    const scholarships = await Scholarship.find(query);

    res.status(200).json({
        status: 'success',
        results: scholarships.length,
        data: {
            scholarships
        }
    });
});

// Search is handled by getAllScholarships via APIFeatures (text search support)
