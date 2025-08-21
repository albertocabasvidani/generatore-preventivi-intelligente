let currentQuoteData = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quoteForm');
    const quoteResult = document.getElementById('quoteResult');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const generateBtn = document.getElementById('generateBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        data.estimatedHours = parseInt(data.estimatedHours);
        data.hourlyRate = parseInt(data.hourlyRate) || 50;

        setLoading(true);

        try {
            const response = await fetch('/api/quotes/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore nella generazione del preventivo');
            }

            currentQuoteData = await response.json();
            displayQuote(currentQuoteData);
            
            form.classList.add('hidden');
            quoteResult.classList.remove('hidden');
            
        } catch (error) {
            console.error('Errore:', error);
            alert('Errore nella generazione del preventivo: ' + error.message);
        } finally {
            setLoading(false);
        }
    });

    downloadPdfBtn.addEventListener('click', async () => {
        if (!currentQuoteData) return;

        try {
            const response = await fetch('/api/quotes/download-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentQuoteData)
            });

            if (!response.ok) {
                throw new Error('Errore nel download del PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preventivo-${currentQuoteData.quoteNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Errore download PDF:', error);
            alert('Errore nel download del PDF: ' + error.message);
        }
    });

    newQuoteBtn.addEventListener('click', () => {
        form.reset();
        form.classList.remove('hidden');
        quoteResult.classList.add('hidden');
        currentQuoteData = null;
    });

    function setLoading(loading) {
        if (loading) {
            loadingSpinner.classList.remove('hidden');
            generateBtn.classList.add('hidden');
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = true;
            });
        } else {
            loadingSpinner.classList.add('hidden');
            generateBtn.classList.remove('hidden');
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = false;
            });
        }
    }

    function displayQuote(data) {
        document.getElementById('quoteNumber').textContent = data.quoteNumber;
        document.getElementById('quoteDate').textContent = data.date;
        document.getElementById('quoteValidity').textContent = data.validUntil;
        document.getElementById('totalAmount').textContent = data.totalCost.toLocaleString('it-IT');
        
        const quoteDetails = document.getElementById('quoteDetails');
        const formattedQuote = data.detailedQuote
            .split('\n')
            .map(line => {
                if (line.trim().startsWith('##')) {
                    return `<h3>${line.replace('##', '').trim()}</h3>`;
                } else if (line.trim().startsWith('#')) {
                    return `<h2>${line.replace('#', '').trim()}</h2>`;
                } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return `<li>${line.replace(/^[-•]\s*/, '').trim()}</li>`;
                } else if (line.trim().match(/^\d+\./)) {
                    return `<li>${line.trim()}</li>`;
                } else if (line.trim()) {
                    return `<p>${line.trim()}</p>`;
                }
                return '';
            })
            .join('');
        
        quoteDetails.innerHTML = formattedQuote;
        
        const lists = quoteDetails.innerHTML.split('<li>');
        if (lists.length > 1) {
            let newHtml = lists[0];
            let inList = false;
            
            for (let i = 1; i < lists.length; i++) {
                const item = '<li>' + lists[i];
                const nextItem = lists[i + 1];
                
                if (!inList) {
                    newHtml += '<ul>' + item;
                    inList = true;
                } else {
                    newHtml += item;
                }
                
                if (!nextItem || !item.match(/<\/li>$/)) {
                    if (inList && (!nextItem || !nextItem.startsWith('<li>'))) {
                        newHtml += '</ul>';
                        inList = false;
                    }
                }
            }
            
            quoteDetails.innerHTML = newHtml;
        }
    }
});