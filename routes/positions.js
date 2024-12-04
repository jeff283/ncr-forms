const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET route for fetching positions
router.get('/', (req, res) => {
    const positionsFilePath = path.join(__dirname, '../public/assets/data/positions.json');
    
    fs.readFile(positionsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading positions file:', err);
            return res.status(500).json({ message: 'Error reading positions data.' });
        }
        
        try {
            const positions = JSON.parse(data);
            res.json(positions);
        } catch (parseError) {
            console.error('Error parsing positions data:', parseError);
            return res.status(500).json({ message: 'Error parsing positions data.' });
        }
    });
});

module.exports = router;