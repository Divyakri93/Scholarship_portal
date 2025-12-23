const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    // Allow updating basic info, academic, and financial profiles
    // For nested objects like academicProfile, we might need a deep merge or just replace.
    // Mongoose handles dot notation updates if we format it right, or we just replace the object (safer for profile forms).
    // Let's allow specific top-level fields.
    const filteredBody = filterObj(
        req.body,
        'name',
        'phoneNumber',
        'address',
        'academicProfile',
        'organizationDetails',
        'financialProfile'
    );

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) Update password
    user.password = newPassword; // Hash performed in pre save
    await user.save();

    // 4) Log user in (send JWT)
    // We don't necessarily need to resend token if using cookies, but good practice to clear existing sessions or keep current.
    // Ideally, we should send new token. For now, just success.
    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
    });
});
