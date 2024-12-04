const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/ncr_quality_form.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// GET all Quality forms
router.get('/', (req, res) => {
    try {
        const data = readJsonFile(filename);
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// Get quality form by ID
router.get('/:qualFormID', (req, res) => {
    const qualFormID = parseInt(req.params.qualFormID);

    try{
        const existingData = readJsonFile(filename);
        const form = existingData.find(item => item.qualFormID === qualFormID);

        if(!form){
            return res.status(404).json({status: 'error', message: 'Quality form not found'});
        }

        res.json(form);
    }
    catch(error){{
        res.status(500).json({status: 'error', message: 'Failed to read JSON file'});
    }}
});

// POST a new Quality form
router.post('/', (req, res) => {
    const newQualityForm = req.body;

    // Read existing data
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading data file' });

        let qualityForms = JSON.parse(data);
        qualityForms.push(newQualityForm); // Add new form to array

        // Write updated data back to file
        fs.writeFile(filename, JSON.stringify(qualityForms, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error writing to data file' });
            res.status(201).json({ message: 'Quality form created successfully' });
        });
    });
});

router.put('/:qualFormID', (req, res) => {
    const value = Number(req.params.qualFormID); // Get the qualFormID from the URL as a number
    const updatedData = req.body; // Get the updated data from the request body

    try {
        // Read the existing data from the JSON file
        const existingData = readJsonFile(filename);

        // Find the index of the item with the matching qualFormID
        const index = existingData.findIndex(item => item.qualFormID === value);

        // If the qualFormID is not found, return a 404 error
        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Quality form not found' });
        }

        // Update the existing data at the found index with the updated data
        existingData[index] = { ...existingData[index], ...updatedData };

        // Write the updated data back to the JSON file
        writeJsonFile(filename, existingData);

        // Return success response
        res.json({ status: 'success', message: 'Quality form updated successfully' });
    } catch (error) {
        console.error(error);
        // Return error response if something goes wrong with the file operation
        res.status(500).json({ status: 'error', message: 'Failed to update JSON file' });
    }
});
// DELETE a Quality form by qualFormID
router.delete('/:qualFormID', (req, res) => {
    const qualFormID = req.params.qualFormID;

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.qualFormID !== parseInt(qualFormID));

        if (updatedData.length === existingData.length) {
            return res.status(404).json({ status: 'error', message: 'Quality form not found' });
        }

        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Quality form deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

module.exports = router;
