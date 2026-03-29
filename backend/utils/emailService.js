const nodemailer = require('nodemailer');
const Settings = require('../models/settingsModel');

const sendEmail = async (options) => {
    try {
        // 1. Check if email notifications are enabled in settings
        const settings = await Settings.findOne();
        if (!settings || !settings.enableEmailNotifications) {
            console.log('Email notifications are disabled by the administrator. Skipping email.');
            return;
        }

        // 2. Check for email credentials in environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials (EMAIL_USER, EMAIL_PASS) are not set in .env file. Email notifications are disabled.');
            return;
        }

        // 3. Create a transporter using Gmail service
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS, // Your Gmail App Password
            },
        });

        // 4. Define email options
        const mailOptions = {
            from: `"${settings.appName}" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        // 5. Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to} with subject "${options.subject}"`);
    } catch (error) {
        console.error('Error sending email:', error);
        // In a real production app, you might want more robust error handling, like a retry queue.
    }
};

module.exports = sendEmail;
