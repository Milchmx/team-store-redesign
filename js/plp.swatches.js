// plp.swatches.js
export function renderProductSwatches() {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach(card => {
    const swatchContainer = card.querySelector('.swatches-container');
    const existingSwatch = swatchContainer?.querySelector('.swatch');
    if (!swatchContainer || existingSwatch) return;

    const mode = card.dataset.customizationMode;
    const colorsRaw = card.dataset.color; // ✅ usamos "color" (singular)

    // Variante: FULLY EDITABLE
    if (mode === 'full') {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';

      const circle = document.createElement('span');
      circle.className = 'swatch-circle swatch-generic';
      swatch.appendChild(circle);

      swatchContainer.appendChild(swatch);

      const desc = document.createElement('div');
      desc.className = 'swatch-description';
      desc.textContent = 'Choose any color';
      swatchContainer.parentElement.appendChild(desc);
    }

    // Variante: CON COLORES DEFINIDOS
    else if (colorsRaw) {
      const colors = colorsRaw.split(',').map(c => c.trim());

      colors.slice(0, 5).forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';

        const circle = document.createElement('span');
        circle.className = 'swatch-circle';
        circle.style.backgroundColor = color;

        swatch.appendChild(circle);
        swatchContainer.appendChild(swatch);
      });

      // Texto adicional solo si hay más de 5
      if (colors.length > 5) {
        const remaining = colors.length - 5;
        const desc = document.createElement('div');
        desc.className = 'swatch-description';
        desc.textContent = `+${remaining}`;
        swatchContainer.parentElement.appendChild(desc);
      }
    }
  });
}
