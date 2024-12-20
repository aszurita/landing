// Función para mostrar toasts (evita duplicación de código)
function showToast(message, isSuccess = true) {
  const toastHTML = `
    <div class="position-fixed top-50 start-50 translate-middle" style="z-index: 1070;">
      <div class="toast show ${isSuccess ? 'bg-success text-white' : 'bg-light text-dark'}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-body text-center p-3">
          <i class="fas fa-check-circle me-2"></i>
          ${message}
        </div>
      </div>
    </div>
  `;

  const toastContainer = document.createElement('div');
  toastContainer.innerHTML = toastHTML;
  document.body.appendChild(toastContainer);
  setTimeout(() => toastContainer.remove(), 3000);
}

async function subscribeAndSuggestProducts() {
  const email = document.getElementById('emailInput').value.toLowerCase();
  const productSuggestion = document.getElementById('productSuggestion').value;

  if (!email || !productSuggestion) {
    showToast('¡Por favor, complete todos los campos!', false);
    return;
  }

  try {
    const newSuggestion = {
      email,
      suggestion: productSuggestion
    };

    const response = await fetch('https://usuarioproductos-c2968-default-rtdb.firebaseio.com/suggestions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newSuggestion)
    });

    if (!response.ok) {
      throw new Error('Error al enviar los datos');
    }

    document.getElementById('suggestionForm').reset();
    showToast('¡Gracias por tu sugerencia!', true);

  } catch (error) {
    console.error('Error:', error);
    showToast('Hubo un error al enviar tu sugerencia. Por favor, intenta de nuevo.', false);
  }
}


let lastWordState = null;
async function fetchAndGenerateWordCloud() {
  try {
    const response = await fetch('https://usuarioproductos-c2968-default-rtdb.firebaseio.com/suggestions.json');
    const data = await response.json();
    
    if (!data) return;
    
    const currentWordCounts = {};
    for (let key in data) {
      const suggestion = data[key].suggestion.toLowerCase();
      currentWordCounts[suggestion] = (currentWordCounts[suggestion] || 0) + 1;
    }

    const currentWordState = JSON.stringify(currentWordCounts);
    if (currentWordState === lastWordState) return;
    lastWordState = currentWordState;

    const wordList = Object.keys(currentWordCounts).map(word => ({
      text: word,
      weight: currentWordCounts[word]
    }));

    const container = document.getElementById('wordCloud');
    container.innerHTML = '';
    
    WordCloud(container, {
      list: wordList.map(item => [item.text, item.weight]),
      gridSize: 16,
      weightFactor: 10,
      fontFamily: 'Arial',
      color: function(word, weight) {
        // Paleta de colores azules
        const blueColors = [
          '#000080', // Azul marino
          '#0000CD', // Azul medio
          '#0000FF', // Azul
          '#1E90FF', // Azul dodger
          '#4169E1', // Azul real
          '#4682B4', // Azul acero
          '#6495ED'  // Azul cadete
        ];
        // Usar un color aleatorio de la paleta azul
        return blueColors[Math.floor(Math.random() * blueColors.length)];
      },
      backgroundColor: 'transparent',
      drawOutOfBound: false,
      shrinkToFit: true
    });
  } catch (error) {
    console.error('Error al actualizar la nube de palabras:', error);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  await subscribeAndSuggestProducts();
  await fetchAndGenerateWordCloud();
}

// Iniciar actualización automática
setInterval(fetchAndGenerateWordCloud, 5000);


document.addEventListener('DOMContentLoaded', () => {
  fetchAndGenerateWordCloud()
});
