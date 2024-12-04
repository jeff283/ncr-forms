const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper function to read notifications from the JSON file
function readNotifications(callback) {
    const filename = path.join(__dirname, '../public/assets/data/notifications.json'); // Updated path
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }
        const notifications = JSON.parse(data);
        callback(null, notifications);
    });
}

// Helper function to write notifications to the JSON file
function writeNotifications(notifications, callback) {
    const filename = path.join(__dirname, '../public/assets/data/notifications.json'); // Updated path
    fs.writeFile(filename, JSON.stringify(notifications, null, 2), (err) => {
        if (err) {
            console.error('Error writing to notifications file:', err); // Log the error
        }
        callback(err);
    });
}

// Route 1: Add a new notification
router.post('/add', (req, res) => {
    const { user_id, message, ncrFormID } = req.body;  
    console.log('Received notification data:', req.body); // Log the received data

    if (!user_id || !message) {
        return res.status(400).json({ error: 'User ID and message are required.' });
    }

    // Read current notifications
    readNotifications((err, notifications) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading notifications file.' });
        }

        console.log('Current notifications:', notifications); // Log the current notifications

        // Create a new notification
        const newNotification = {
            user_id,
            message,
            status: 'unread',
            created_at: new Date().toISOString(),
            id: notifications.length + 1,  // Simple incremental ID
            ncrFormID  // Add the ncrFormID to the notification
        };

        // Add the new notification to the list
        notifications.push(newNotification);

        // Log the updated notifications list
        console.log('Updated notifications:', notifications);

        // Write back the updated notifications to the file
        writeNotifications(notifications, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to notifications file.' });
            }
            res.status(201).json({ message: 'Notification added successfully.' });
        });
    });
});

// Route 2: Get notifications for a specific user
router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    // Read notifications from the file
    readNotifications((err, notifications) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading notifications file.' });
        }

        // Filter notifications for the user
        const userNotifications = notifications.filter(n => n.user_id === userId);

        res.json(userNotifications);
    });
});

// Route 3: Mark a notification as read
router.post('/read/:notificationId', (req, res) => {
    const notificationId = parseInt(req.params.notificationId);

    // Read current notifications
    readNotifications((err, notifications) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading notifications file.' });
        }

        // Find the notification and mark it as read
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        notification.status = 'read';

        // Write back the updated notifications to the file
        writeNotifications(notifications, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to notifications file.' });
            }
            res.json({ message: 'Notification marked as read.' });
        });
    });
});

// Route 4: Delete a notification
router.delete('/:notificationId', (req, res) => {
    const notificationId = parseInt(req.params.notificationId);

    // Read current notifications
    readNotifications((err, notifications) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading notifications file.' });
        }

        // Find the notification and remove it
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        notifications.splice(notificationIndex, 1);

        // Write back the updated notifications to the file
        writeNotifications(notifications, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to notifications file.' });
            }
            res.json({ message: 'Notification deleted successfully.' });
        });
    });
});

module.exports = router;
