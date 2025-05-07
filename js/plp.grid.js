// plp.grid.js
// Lógica de grid de productos: visibilidad por lotes y botón “Ver más”

// 🔁 Lleva el progreso de productos mostrados por categoría/tab
export const visibleCardsByCategory = {};
import { renderProductSwatches } from './js/plp.swatches.js';


function getCardsPerLoad() {
  return window.innerWidth < 992 ? 24 : 36;
}

export function showNextBatch() {
  const activeTab = document.querySelector(".tab.selected");
  const category = activeTab?.dataset.category;
  if (!category) {
    console.warn("⛔ No se encontró la categoría activa.");
    return;
  }

  const allCards = Array.from(document.querySelectorAll(".product-card"));
  const ctaContainer = document.querySelector(".cta-container");
  const cardsPerLoad = getCardsPerLoad();
  const filteredCards = allCards.filter(card => card.dataset.visible === "true");

  console.log(`🟢 Tab activo: ${category}`);
  console.log(`🧮 Total de product-cards visibles: ${filteredCards.length}`);
  console.log(`📦 Productos ya mostrados: ${visibleCardsByCategory[category] || 0}`);
  console.log(`📤 Cards por lote: ${cardsPerLoad}`);

  if (!visibleCardsByCategory[category]) {
    visibleCardsByCategory[category] = 0;
  }

  const start = visibleCardsByCategory[category];
  const nextBatch = filteredCards.slice(start, start + cardsPerLoad);

  console.log(`🔜 Mostrando siguiente lote desde ${start} hasta ${start + cardsPerLoad}`);
  console.log(`🔢 Cantidad en este batch: ${nextBatch.length}`);

  nextBatch.forEach(card => {
    card.style.display = "flex";
    renderProductSwatches();
  });

  visibleCardsByCategory[category] += nextBatch.length;

  const remaining = filteredCards.length - visibleCardsByCategory[category];
  console.log(`🧾 Quedan ${remaining} productos por mostrar`);

  if (ctaContainer) {
    ctaContainer.style.display = remaining <= 0 ? "none" : "flex";
    console.log(`📎 CTA container ahora está: ${ctaContainer.style.display}`);
  }
}



// 📐 Ajusta dinámicamente el layout en grid de 12 columnas según breakpoint y visibilidad del sidebar
export function adjustGridLayout() {
  const filtersSidebar = document.getElementById("filtersSidebar");
  const productGrid = document.getElementById("productGrid");

  if (!filtersSidebar || !productGrid) return;

  const width = window.innerWidth;
  const sidebarVisible = filtersSidebar.classList.contains("visible");

  // 🧼 Limpiar estilos previos
  filtersSidebar.style.gridColumn = "";
  productGrid.style.gridColumn = "";
  filtersSidebar.style.display = "";
  productGrid.style.gridTemplateColumns = "";

  if (width >= 1400) {
    // XXL
    if (sidebarVisible) {
      filtersSidebar.style.gridColumn = "span 2";
      productGrid.style.gridColumn = "span 10";
      productGrid.style.gridTemplateColumns = "repeat(6, 1fr)";
    } else {
      filtersSidebar.style.display = "none";
      productGrid.style.gridColumn = "span 12";
      productGrid.style.gridTemplateColumns = "repeat(6, 1fr)";
    }
  } else if (width >= 1200) {
    // XL
    if (sidebarVisible) {
      filtersSidebar.style.gridColumn = "span 3";
      productGrid.style.gridColumn = "span 9";
      productGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
    } else {
      filtersSidebar.style.display = "none";
      productGrid.style.gridColumn = "span 12";
      productGrid.style.gridTemplateColumns = "repeat(6, 1fr)";
    }
  } else if (width >= 992) {
    // LG
    if (sidebarVisible) {
      filtersSidebar.style.gridColumn = "span 3";
      productGrid.style.gridColumn = "span 9";
      productGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
    } else {
      filtersSidebar.style.display = "none";
      productGrid.style.gridColumn = "span 12";
      productGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
    }
  }
}

export function initGrid() {
  console.log("Inicializando grid de productos...");

  const initialTab = document.querySelector(".tab.selected");
  if (!initialTab) return;

  const category = initialTab.dataset.category;
  if (category) {
    visibleCardsByCategory[category] = 0; // ← inicializa progreso por tab
    showNextBatch();                      // ← muestra los primeros productos
  }

  const seeMoreBtn = document.querySelector(".see-more-button");
  seeMoreBtn?.addEventListener("click", showNextBatch);
}
