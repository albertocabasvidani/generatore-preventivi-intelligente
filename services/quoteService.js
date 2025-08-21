const Anthropic = require('@anthropic-ai/sdk');
const PDFDocument = require('pdfkit');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateQuote(data) {
  const {
    serviceType,
    estimatedHours,
    hourlyRate,
    projectSpecs,
    clientName,
    clientEmail,
    companyName
  } = data;

  const totalCost = estimatedHours * hourlyRate;

  const prompt = `Genera un preventivo professionale in italiano per il seguente progetto:

Tipo di servizio: ${serviceType}
Ore stimate: ${estimatedHours}
Tariffa oraria: €${hourlyRate}
Costo totale: €${totalCost}
Specifiche del progetto: ${projectSpecs}
Cliente: ${clientName || 'Da definire'}
Azienda cliente: ${companyName || 'Da definire'}

Il preventivo deve includere:
1. Una descrizione dettagliata del servizio
2. Suddivisione delle fasi del progetto con ore stimate per fase
3. Deliverables attesi
4. Timeline stimata
5. Termini e condizioni standard
6. Modalità di pagamento

Formatta il preventivo in modo professionale e chiaro. Usa un tono professionale ma amichevole.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const quoteText = response.content[0].text;

    const quoteData = {
      quoteNumber: `PRV-${Date.now()}`,
      date: new Date().toLocaleDateString('it-IT'),
      clientName,
      clientEmail,
      companyName,
      serviceType,
      estimatedHours,
      hourlyRate,
      totalCost,
      projectSpecs,
      detailedQuote: quoteText,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT')
    };

    return quoteData;
  } catch (error) {
    console.error('Errore API Claude:', error);
    throw new Error('Impossibile generare il preventivo con Claude');
  }
}

async function generatePDF(quoteData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(24)
         .text('PREVENTIVO', { align: 'center' })
         .moveDown();

      doc.fontSize(12)
         .text(`Numero Preventivo: ${quoteData.quoteNumber}`)
         .text(`Data: ${quoteData.date}`)
         .text(`Valido fino al: ${quoteData.validUntil}`)
         .moveDown();

      doc.fontSize(14)
         .text('DETTAGLI CLIENTE', { underline: true })
         .fontSize(12)
         .text(`Nome: ${quoteData.clientName || 'Da definire'}`)
         .text(`Email: ${quoteData.clientEmail || 'Da definire'}`)
         .text(`Azienda: ${quoteData.companyName || 'Da definire'}`)
         .moveDown();

      doc.fontSize(14)
         .text('RIEPILOGO SERVIZIO', { underline: true })
         .fontSize(12)
         .text(`Tipo di servizio: ${quoteData.serviceType}`)
         .text(`Ore stimate: ${quoteData.estimatedHours}`)
         .text(`Tariffa oraria: €${quoteData.hourlyRate}`)
         .fontSize(14)
         .text(`TOTALE: €${quoteData.totalCost}`, { align: 'right' })
         .moveDown();

      doc.fontSize(14)
         .text('DESCRIZIONE DETTAGLIATA', { underline: true })
         .fontSize(11)
         .moveDown(0.5);

      const lines = quoteData.detailedQuote.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          doc.text(line, {
            align: 'justify',
            lineGap: 2
          });
        } else {
          doc.moveDown(0.5);
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateQuote,
  generatePDF
};