const express = require('express');
const router = express.Router();
const { generateQuote, generatePDF } = require('../services/quoteService');

router.post('/generate', async (req, res) => {
  try {
    const {
      serviceType,
      estimatedHours,
      hourlyRate = 50,
      projectSpecs,
      clientName,
      clientEmail,
      companyName
    } = req.body;

    if (!serviceType || !estimatedHours || !projectSpecs) {
      return res.status(400).json({
        error: 'Campi obbligatori mancanti'
      });
    }

    const quoteData = await generateQuote({
      serviceType,
      estimatedHours,
      hourlyRate,
      projectSpecs,
      clientName,
      clientEmail,
      companyName
    });

    res.json(quoteData);
  } catch (error) {
    console.error('Errore generazione preventivo:', error);
    res.status(500).json({ 
      error: 'Errore nella generazione del preventivo',
      details: error.message 
    });
  }
});

router.post('/download-pdf', async (req, res) => {
  try {
    const quoteData = req.body;
    
    const pdfBuffer = await generatePDF(quoteData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="preventivo-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    res.status(500).json({ 
      error: 'Errore nella generazione del PDF',
      details: error.message 
    });
  }
});

module.exports = router;