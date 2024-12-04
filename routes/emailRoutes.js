const express = require('express');
const sendEmail = require('../utils/mailer');
const router = express.Router();

// POST route to send email
router.post('/send-email', async (req, res) => {
    const { recipient, subject, message } = req.body;
    if (!recipient || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        await sendEmail(recipient, subject, message);
        res.status(200).json({ success: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;
