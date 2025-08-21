const OpenAI = require('openai');
const PDFDocument = require('pdfkit');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

  const prompt = `GENERA PREVENTIVO PROFESSIONALE

## DATI PROGETTO
- Servizio: ${serviceType}
- Ore stimate: ${estimatedHours}h
- Tariffa: €${hourlyRate}/h
- TOTALE: €${totalCost}
- Cliente: ${clientName || 'Da definire'}
- Azienda: ${companyName || 'Da definire'}

## SPECIFICHE
${projectSpecs}

## STRUTTURA RICHIESTA
1. **Descrizione Servizio** - panoramica chiara del lavoro
2. **Fasi del Progetto** - suddivisione con ore per fase
3. **Deliverables** - cosa verrà consegnato
4. **Timeline** - tempistiche di realizzazione  
5. **Termini e Condizioni** - modalità di lavoro e pagamento

Genera un preventivo professionale, strutturato e completo in italiano.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Sei un esperto nella creazione di preventivi professionali per servizi IT e digitali. Genera preventivi strutturati, dettagliati e professionali in italiano. Usa sezioni chiare e formattazione consistente.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const quoteText = response.choices[0].message.content;

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
    console.error('Errore API OpenAI:', error);
    throw new Error('Impossibile generare il preventivo con GPT-5-nano');
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