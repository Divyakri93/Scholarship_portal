const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'application_update', 'deadline'],
        default: 'info'
    },
    relatedLink: {
        type: String // e.g., "/applications/123"
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    // TTL index to automatically delete old notifications after 30 days
    expireAfterSeconds: 2592000
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
