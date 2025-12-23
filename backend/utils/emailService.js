const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or configure host/port for SMTP
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.sendEmail = async (options) => {
    // 1) Define the email options
    const mailOptions = {
        from: 'Scholarship Portal <noreply@scholarshipportal.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html
    };

    // 2) Actually send the email
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email send failed:', error);
        // Don't crash app if email fails
    }
};
