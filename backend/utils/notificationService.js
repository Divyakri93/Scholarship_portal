const Notification = require('../models/Notification');
const emailService = require('./emailService');
const User = require('../models/User');

class NotificationService {
    constructor(io) {
        this.io = io;
    }

    async createNotification({ userId, title, message, type, relatedLink, sendEmail = false }) {
        // 1. Save to Database
        const notification = await Notification.create({
            recipient: userId,
            title,
            message,
            type,
            relatedLink
        });

        // 2. Send Real-time Update (Socket.io)
        // Ensure client joins room 'user-{userId}' on connection
        if (this.io) {
            this.io.to(`user-${userId}`).emit('notification', notification);
        }

        // 3. Send Email (Optional)
        if (sendEmail) {
            const user = await User.findById(userId);
            if (user && user.email) {
                await emailService.sendEmail({
                    email: user.email,
                    subject: `Notification: ${title}`,
                    message: message
                });
            }
        }

        return notification;
    }
}

module.exports = NotificationService;
