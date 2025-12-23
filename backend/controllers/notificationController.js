const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const query = Notification.find({ recipient: req.user.id });

    const features = new APIFeatures(query, req.query)
        .filter()
        .sort() // Default is -createdAt
        .paginate();

    const notifications = await features.query;
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        unreadCount,
        data: {
            notifications
        }
    });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            notification
        }
    });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
    await Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
    });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user.id
    });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
