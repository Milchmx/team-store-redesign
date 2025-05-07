// plp.filters.js
// Lógica de filtros: estado, render dinámico, aplicación
console.log("🟢 plp.filters.js cargado correctamente");

import { visibleCardsByCategory, showNextBatch } from './js/plp.grid.js';
import { renderProductSwatches } from './js/plp.swatches.js';


// Utilidad global para distinguir modo desktop
export function isDesktop() {
  return window.innerWidth >= 992;
}

export const selectedFiltersByCategory = {
  uniforms: {
    "data-template-style": new Set(),
    "data-silhouette": new Set(),
    "data-sleeve-type": new Set()
  },
  "shirts-tanks": {
    "data-template-style": new Set(),
    "data-silhouette": new Set(),
    "data-sleeve-type": new Set()
  },
  "polos": { // 👈 Nuevo alias
    "data-template-style": new Set(),
    "data-silhouette": new Set(),
    "data-sleeve-type": new Set()
  },
  // Agrega aquí más categorías si las necesitas
};

// 🔁 Versión optimizada de renderDynamicFilters() basada en reglas oficiales
export function renderDynamicFilters() {
  const allCards = document.querySelectorAll(".product-card");
  const activeTab = document.querySelector(".tab.selected");
  const category = activeTab?.dataset.category;
  if (!category) return;

  const aliasConditions = {
    "shirts-tanks": card =>
      card.dataset.subcategory === "shirts" &&
      ["sleeveless", "short-sleeve", "3/4-sleeve", "long-sleeve"].includes(card.dataset.sleeveType) &&
      ["racerback", "tank-top", "boxy-tank", "regular-tee", "track", "polo", "pinnies", "compression-shirts"].includes(card.dataset.silhouette),

      "polos": card =>
        card.dataset.subcategory === "shirts" &&
        card.dataset.silhouette === "polo"
  };

  const tabCards = Array.from(allCards).filter(card => {
    const visibleIn = card.dataset.visibleIn.split(",").map(s => s.trim());
    if (aliasConditions[category]) {
      return visibleIn.includes("basketball") && aliasConditions[category](card);
    } else {
      return visibleIn.includes("basketball") && card.dataset.subcategory === category;
    }
  });

  const visibleCards = tabCards.filter(card => card.dataset.visible === "true");
  const filtersBody = isDesktop()
  ? document.querySelector("#filtersSidebar #filtersBody")
  : document.querySelector("#filtersModal #filtersBody");
  
  if (!filtersBody) return;
  filtersBody.innerHTML = "";

  const attributes = [
    { key: "data-template-style", label: "Template Style" },
    { key: "data-silhouette", label: "Silhouette" },
    { key: "data-sleeve-type", label: "Sleeve Type" }
  ];

  const userSelections = getActiveTabFilters();

  attributes.forEach(attr => {
    const valueCountMap = new Map();
    const visibleValues = new Set();

    // Extraer todos los valores existentes y visibles
    tabCards.forEach(card => {
      const raw = card.getAttribute(attr.key);
      if (!raw) return;
      raw.split(",").map(v => v.trim()).forEach(val => {
        valueCountMap.set(val, (valueCountMap.get(val) || 0) + 1);
      });
    });

    visibleCards.forEach(card => {
      const raw = card.getAttribute(attr.key);
      if (!raw) return;
      raw.split(",").map(v => v.trim()).forEach(val => visibleValues.add(val));
    });

    const selectedSet = userSelections?.[attr.key] || new Set();
    const combinedValues = new Set([...visibleValues, ...selectedSet]);

    // REGLA: Ocultar bloque si solo hay 1 valor y no hay selección previa
    const shouldRender =
      combinedValues.size > 1 ||
      (combinedValues.size === 1 && selectedSet.size > 0) ||
      selectedSet.size > 0;

    if (!shouldRender) return;

    // Crear bloque collapsible
    const wrapper = document.createElement("div");
    wrapper.className = "collapsible open";
    wrapper.dataset.attribute = attr.key;

    const allRelevantValues = new Set([...valueCountMap.keys(), ...selectedSet]);

    const contentHTML = Array.from(allRelevantValues).map(value => {
      const count = valueCountMap.get(value) || 0;
      const checked = selectedSet.has(value);
    
      return `
        <label class="checkbox-text">
          <input type="checkbox" value="${value}" data-attribute="${attr.key}" ${checked ? "checked" : ""}>
          <span class="checkbox-label">${value}</span>
        </label>
      `;
    }).join("");
    

    wrapper.innerHTML = `
      <div class="collapsible-heading">
        <h2 class="collapsible-title">${attr.label}</h2>
        <button class="collapsible-toggle" aria-expanded="false" data-toggle-collapse>
          <svg class="chevron-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.29 6.71a1 1 0 0 0 0 1.42L13.17 12l-3.88 3.88a1 1 0 0 0 1.42 1.42l4.59-4.59a1 1 0 0 0 0-1.42L10.71 6.7a1 1 0 0 0-1.42 0Z" fill="#212529"/>
          </svg>
        </button>
      </div>
      <div class="collapsible-content">
        ${contentHTML}
      </div>
    `;

    filtersBody.appendChild(wrapper);
  });

  // Mostrar/ocultar botón de filtros según si hay bloques
  const filtersWereRendered = filtersBody.querySelectorAll(".collapsible").length > 0;
  const filtersTrigger = document.querySelector("[data-filters-trigger]");
  if (filtersTrigger) {
    filtersTrigger.style.display = filtersWereRendered ? "flex" : "none";
    filtersTrigger.setAttribute("aria-pressed", filtersWereRendered ? "false" : "true");
  }
}

// 🔁 Aplica los filtros activos al grid: oculta/muestra product-cards
export function applySelectedFilters() {
  const cards = document.querySelectorAll(".product-card");
  const activeTab = document.querySelector(".tab.selected");
  const category = activeTab?.dataset.category;

  const aliasConditions = {
    "shirts-tanks": card =>
      card.dataset.subcategory === "shirts" &&
      ["sleeveless", "short-sleeve", "3/4-sleeve", "long-sleeve"].includes(card.dataset.sleeveType) &&
      ["racerback", "tank-top", "boxy-tank", "regular-tee", "track", "polo", "pinnies", "compression-shirts"].includes(card.dataset.silhouette),

      "polos": card =>
        card.dataset.subcategory === "shirts" &&
        card.dataset.silhouette === "polo"
  };

  let visibleCount = 0;

  cards.forEach(card => {
    const visibleIn = card.dataset.visibleIn.split(",").map(s => s.trim());
    let isVisible = false;

    if (aliasConditions[category]) {
      isVisible = visibleIn.includes("basketball") && aliasConditions[category](card);
    } else {
      isVisible = visibleIn.includes("basketball") && card.dataset.subcategory === category;
    }

    const currentFilters = getActiveTabFilters();
    if (isVisible && currentFilters) {
      for (const attr in currentFilters) {
        const selectedSet = currentFilters[attr];
        if (!selectedSet || selectedSet.size === 0) continue;

        const cardValues = (card.getAttribute(attr) || "")
          .split(",")
          .map(v => v.trim());

        const matches = cardValues.some(val => selectedSet.has(val));
        if (!matches) {
          isVisible = false;
          break;
        }
      }
    }

    card.dataset.visible = isVisible ? "true" : "false";
    card.style.display = isVisible ? "flex" : "none";
    if (isVisible) visibleCount++;
  });

  const cardsPerLoad = window.innerWidth < 992 ? 24 : 36;
  const filtered = Array.from(cards).filter(c => c.dataset.visible === "true");

  filtered.forEach(card => card.style.display = "none");
  const nextBatch = filtered.slice(0, cardsPerLoad);
  nextBatch.forEach(card => card.style.display = "flex");

  const seeMoreBtn = document.querySelector(".see-more-button");
  if (seeMoreBtn) {
    seeMoreBtn.style.display = (filtered.length > cardsPerLoad) ? "block" : "none";
  }

  // Actualizar contador después de aplicar filtros manuales
  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    const count = Array.from(document.querySelectorAll('.product-card'))
      .filter(card => card.dataset.visible === "true").length;
    resultsCount.textContent = count;
  }
  // Reiniciar contador y volver a mostrar primer lote
  if (category) {
    visibleCardsByCategory[category] = 0;
    showNextBatch();
    renderProductSwatches();

  }
}

// 📦 Obtiene el objeto de filtros para el tab actualmente seleccionado
export function getActiveTabFilters() {
  const activeTab = document.querySelector(".tab.selected");
  const category = activeTab?.dataset.category;
  return selectedFiltersByCategory[category];
}

