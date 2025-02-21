require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

(async () => {
    try {
        await sendEmail({
            email: 'recipient@example.com',
            subject: 'Test Email',
            message: 'This is a test email sent from Nodemailer.',
        });
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email:', error);
    }
})();
