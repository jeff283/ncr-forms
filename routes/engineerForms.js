const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/ncr_engineer_form.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// GET all Engineering forms
router.get('/', (req, res) => {
    try {
        const data = readJsonFile(filename);
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// GET an Engineering form by engFormID
router.get('/:engFormID', (req, res) => {
    const engFormID = req.params.engFormID;

    try {
        const existingData = readJsonFile(filename);
        const form = existingData.find(item => item.engFormID === parseInt(engFormID));

        if (!form) {
            return res.status(404).json({ status: 'error', message: 'Engineering form not found' });
        }

        res.json(form); // Return the specific engineering form
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST a new Engineering form
router.post('/', (req, res) => {
    const newEngineerForm = req.body;

    // Step 1: Read the existing forms from the data file
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading data file' });

        let engineerForms = JSON.parse(data);

        const nextEngFormID = engineerForms.length > 0 ? Math.max(...engineerForms.map(form => form.engFormID)) + 1 : 1;
        
        newEngineerForm.engFormID = nextEngFormID;

        engineerForms.push(newEngineerForm);

        // Step 5: Write the updated array back to the file
        fs.writeFile(filename, JSON.stringify(engineerForms, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error writing to data file' });

            res.status(201).json({
                engFormID: newEngineerForm.engFormID, 
                message: 'Engineering form created successfully'
            });
        });
    });
});

// PUT (Update) an Engineering form by engFormID
router.put('/:engFormID', (req, res) => {
    const engFormID = req.params.engFormID;
    const updatedData = req.body;

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.engFormID === parseInt(engFormID));

        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Engineering form not found' });
        }

        existingData[index] = { ...existingData[index], ...updatedData };
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Engineering form updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE an Engineering form by engFormID
router.delete('/:engFormID', (req, res) => {
    const engFormID = req.params.engFormID;

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.engFormID !== parseInt(engFormID));

        if (updatedData.length === existingData.length) {
            return res.status(404).json({ status: 'error', message: 'Engineering form not found' });
        }

        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Engineering form deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

module.exports = router;
