// plp.tabs.js
// Manejo de tabs para filtrar productos por subcategoría y scroll visual

import { applySelectedFilters, renderDynamicFilters } from '.js/plp.filters.js';
import { visibleCardsByCategory, showNextBatch } from '.js/plp.grid.js'
import { renderProductSwatches } from '.js/plp.swatches.js';


export function filterProductsByTab(category) {
  const cards = document.querySelectorAll(".product-card");
  let visibleCount = 0;

  const aliasConditions = {
    "shirts-tanks": card =>
      card.dataset.subcategory === "shirts" &&
      ["sleeveless", "short-sleeve", "3/4-sleeve", "long-sleeve"].includes(card.dataset.sleeveType) &&
      ["racerback", "tank-top", "boxy-tank", "regular-tee", "track", "polo", "pinnies", "compression-shirts"].includes(card.dataset.silhouette),

    "polos": card =>
      card.dataset.subcategory === "shirts" && card.dataset.silhouette === "polo"
  };

  cards.forEach(card => {
    const visibleIn = card.dataset.visibleIn.split(",").map(s => s.trim());
    let isVisible = visibleIn.includes("basketball");

    if (isVisible) {
      if (aliasConditions[category]) {
        isVisible = aliasConditions[category](card);
      } else {
        isVisible = card.dataset.subcategory === category;
      }
    }

    card.dataset.visible = isVisible ? "true" : "false";
    card.style.display = "none";
    if (isVisible) visibleCount++;
  });

  // Mostrar primera tanda
  const cardsPerLoad = window.innerWidth < 992 ? 24 : 36;
  const filtered = Array.from(cards).filter(c => c.dataset.visible === "true");
  const nextBatch = filtered.slice(0, cardsPerLoad);
  nextBatch.forEach(card => card.style.display = "flex");

  // Actualizar contador
  const resultsCount = document.getElementById("results-count");
  if (resultsCount) resultsCount.textContent = visibleCount;
}

function filterVisibleTabs() {
    const tabs = document.querySelectorAll(".tab");
    const cards = document.querySelectorAll(".product-card");

    const aliasConditions = {
        "shirts-tanks": card =>
        card.dataset.subcategory === "shirts" &&
        ["sleeveless", "short-sleeve", "3/4-sleeve", "long-sleeve"].includes(card.dataset.sleeveType) &&
        ["racerback", "tank-top", "boxy-tank", "regular-tee", "track", "polo", "pinnies", "compression-shirts"].includes(card.dataset.silhouette),

        "polos": card =>
        card.dataset.subcategory === "shirts" && card.dataset.silhouette === "polo"
    };

    tabs.forEach(tab => {
        const category = tab.dataset.category;

        const hasContent = Array.from(cards).some(card => {
        const visibleIn = card.dataset.visibleIn.split(",").map(s => s.trim());
        if (!visibleIn.includes("basketball")) return false;

        if (aliasConditions[category]) {
            return aliasConditions[category](card);
        } else {
            return card.dataset.subcategory === category;
        }
        });

        tab.style.display = hasContent ? "inline-flex" : "none";
    });
}
  

export function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabsSlider = document.querySelector('.tabs-slider');
  const scrollbarThumb = document.querySelector('.scrollbar-thumb');

  if (!tabs.length || !tabsSlider || !scrollbarThumb) return;

  const defaultCategory = document.querySelector('.tab.selected')?.dataset.category;
  if (defaultCategory) {
    filterProductsByTab(defaultCategory);
    renderDynamicFilters();
    filterVisibleTabs();
  }

// Evento: clic en tab
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelector('.tab.selected')?.classList.remove('selected');
    tab.classList.add('selected');

    const category = tab.dataset.category;
    filterProductsByTab(category);
    renderDynamicFilters();
    applySelectedFilters(); // ← ✅ Aplica los filtros persistentes
    filterVisibleTabs();
    visibleCardsByCategory[category] = 0; // 🧼 Reinicia el contador de productos mostrados
    showNextBatch(); // 👀 Muestra la primera tanda de productos en el nuevo tab
    renderProductSwatches();

    const tabRect = tab.getBoundingClientRect();
    const sliderRect = tabsSlider.getBoundingClientRect();
    const tabFullyVisible =
      tabRect.left >= sliderRect.left && tabRect.right <= sliderRect.right;

    if (!tabFullyVisible) {
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    const offset = tabRect.left - sliderRect.left;
    scrollbarThumb.style.left = `${offset}px`;
  });
});
  
  console.log('🧭 Tabs de subcategoría inicializados');  
}
