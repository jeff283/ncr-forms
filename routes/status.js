const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET route for fetching all NCR statuses
router.get('/', (req, res) => {
    const ncrStatusFilePath = path.join(__dirname, '../public/assets/data/ncr_status.json');
    
    fs.readFile(ncrStatusFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading NCR statuses file:', err);
            return res.status(500).json({ message: 'Error reading NCR statuses data.' });
        }
        
        try {
            const ncrStatuses = JSON.parse(data);
            res.json(ncrStatuses);
        } catch (parseError) {
            console.error('Error parsing NCR statuses data:', parseError);
            return res.status(500).json({ message: 'Error parsing NCR statuses data.' });
        }
    });
});

// GET route for fetching a specific NCR status by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const ncrStatusFilePath = path.join(__dirname, '../public/assets/data/ncr_status.json');
    
    fs.readFile(ncrStatusFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading NCR statuses file:', err);
            return res.status(500).json({ message: 'Error reading NCR statuses data.' });
        }

        try {
            const ncrStatuses = JSON.parse(data);
            const status = ncrStatuses.find(status => status.ncrStatusID == id);

            if (!status) {
                return res.status(404).json({ message: `NCR status with ID ${id} not found` });
            }

            res.json(status);
        } catch (parseError) {
            console.error('Error parsing NCR statuses data:', parseError);
            return res.status(500).json({ message: 'Error parsing NCR statuses data.' });
        }
    });
});

module.exports = router;
