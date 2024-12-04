const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Path to the JSON file
const filename = path.join(__dirname, '../public/assets/data/suppliers.json');

// Read JSON file utility function
const readJsonFile = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
};

// Write JSON file utility function
const writeJsonFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// Utility function to get the next supID
const getNextSupID = (existingData) => {
    const ids = existingData.map(item => item.supID);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1; // Start from 1 if there are no suppliers
};

// GET all suppliers
router.get('/', (req, res) => {
    try {
        const data = readJsonFile(filename);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// GET a supplier by supID
router.get('/:supID', (req, res) => {
    const value = Number(req.params.supID); // Convert to number

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Supplier ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const supplier = existingData.find(item => item.supID === value); // Compare as a number

        if (!supplier) {
            return res.status(404).json({ status: 'error', message: 'Supplier not found' });
        }

        res.json(supplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to read JSON file' });
    }
});

// POST a new supplier
router.post('/', (req, res) => {
    const newSupplier = req.body;

    try {
        const existingData = readJsonFile(filename);
        newSupplier.supID = getNextSupID(existingData); // Assign the next supID
        existingData.push(newSupplier);
        writeJsonFile(filename, existingData);
        res.status(201).json({ status: 'success', message: 'Supplier added successfully', supplier: newSupplier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// DELETE a supplier by supID
router.delete('/:supID', (req, res) => {
    const value = Number(req.params.supID); // Convert to number

    if (isNaN(value)) {
        return res.status(400).json({ status: 'error', message: 'Supplier ID not provided or invalid' });
    }

    try {
        const existingData = readJsonFile(filename);
        const updatedData = existingData.filter(item => item.supID !== value);
        writeJsonFile(filename, updatedData);
        res.json({ status: 'success', message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to write JSON file' });
    }
});

// PUT (update) a supplier by supID
router.put('/:supID', (req, res) => {
    const value = Number(req.params.supID);
    const updatedSupplier = req.body;

    try {
        const existingData = readJsonFile(filename);
        const index = existingData.findIndex(item => item.supID === value);

        if (index === -1) {
            return res.status(404).json({ status: 'error', message: 'Supplier not found' });
        }

        existingData[index] = { ...existingData[index], ...updatedSupplier };
        writeJsonFile(filename, existingData);
        res.json({ status: 'success', message: 'Supplier updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to update JSON file' });
    }
});

// Export the router
module.exports = router;
