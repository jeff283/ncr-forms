const express = require('express');
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');

const router = express.Router();

router.post('/generate-ncr-report', async (req, res) => {
    const { ncrData, productData, supplierData, qualityData, engineeringData, purchasingData } = req.body;

    try {
        const templatePath = path.join(__dirname, '..', 'public', 'views', 'templates', 'ncr-report.html');
        console.log('Template Path:', templatePath);

        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const mergedData = {
            ...ncrData,
            ...productData,
            ...supplierData,
            ...qualityData,
            ...engineeringData,
            ...purchasingData,
        };

        mergedData.currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        htmlTemplate = htmlTemplate.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
            return mergedData[key] || 'N/A';
        });

        // Set PDF options
        const options = {
            format: 'A4',
            border: '10mm',
            base: `file://${path.join(__dirname, '..', 'public')}/`, // Base URL for loading local resources (if any)
        };

        // Generate PDF from template
        pdf.create(htmlTemplate, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                return res.status(500).send('Error generating NCR report');
            }

            // Send PDF to client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="ncr-report.pdf"');
            res.send(buffer);
            console.log('PDF Sent to Client');
        });
    } catch (error) {
        console.error('Error generating NCR report:', error);
        res.status(500).send('Error generating NCR report');
    }
});

module.exports = router;
