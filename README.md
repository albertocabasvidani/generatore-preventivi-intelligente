# Generatore Preventivi Intelligente

Un'applicazione web per generare preventivi professionali utilizzando l'intelligenza artificiale di **GPT-5-nano** (OpenAI).

## Funzionalità

- Generazione automatica di preventivi professionali
- Integrazione con **GPT-5-nano** di OpenAI per contenuti intelligenti e veloci
- Esportazione in PDF
- Interfaccia responsive e moderna
- Calcolo automatico dei costi

## Installazione

1. Clona il repository:
```bash
git clone https://github.com/albertocabasvidani/generatore-preventivi-intelligente.git
cd generatore-preventivi-intelligente
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente:
   - Copia `.env.example` in `.env`
   - Aggiungi la tua API key di OpenAI

4. Avvia il server:
```bash
npm run dev
```

5. Apri il browser su `http://localhost:3000`

## Utilizzo

1. Compila il form con i dati del cliente (opzionali)
2. Seleziona il tipo di servizio
3. Inserisci le ore stimate e la tariffa oraria
4. Descrivi le specifiche del progetto
5. Clicca su "Genera Preventivo"
6. Scarica il PDF del preventivo generato

## Tecnologie Utilizzate

- **Backend**: Node.js, Express
- **AI**: GPT-5-nano API (OpenAI)
- **PDF**: PDFKit
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Stile**: CSS moderno con variabili custom

## Vantaggi di GPT-5-nano

- **Costo ridotto**: $1.25 per 1M token input (vs $10 di GPT-4-turbo)
- **Velocità superiore**: Ottimizzato per risposte rapide
- **Cache efficiency**: 90% di sconto per contenuti ripetuti
- **Context window**: 400K token per progetti complessi

## API Endpoints

- `POST /api/quotes/generate` - Genera un nuovo preventivo
- `POST /api/quotes/download-pdf` - Scarica il PDF del preventivo

## Struttura del Progetto

```
├── public/           # File statici frontend
│   ├── index.html   # Pagina principale
│   ├── app.js       # Logica frontend
│   └── styles.css   # Stili CSS
├── routes/          # Route Express
│   └── quotes.js    # Endpoint preventivi
├── services/        # Servizi backend
│   └── quoteService.js  # Logica generazione preventivi
├── server.js        # Server Express principale
├── .env             # Variabili d'ambiente (non versionato)
├── .env.example     # Template variabili d'ambiente
└── package.json     # Dipendenze e script
```

## Licenza

ISC