// plp.main.js
// Punto de entrada principal

import {  renderDynamicFilters, 
          applySelectedFilters, 
          getActiveTabFilters, 
          selectedFiltersByCategory 
} from './plp.filters.js';

import {  setupCollapsibles, 
          toggleSidebar, 
          initFiltersUI, 
          setupClearFiltersButton, 
          initCheckboxListeners, 
          renderSidebar 
} from './plp.ui.js';

import { initGrid, adjustGridLayout } from './plp.grid.js';
import { initTabs } from './plp.tabs.js'; // ← ✅ NUEVO IMPORT
import { initScrollbar } from './plp.scrollbar.js';
import { renderProductSwatches } from './plp.swatches.js';
import { adjustSidebarHeight } from './plp.sidebarHeight.js';
import { initNavbarTabs } from './navbar.js';

function getTabFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('tab');
}

document.addEventListener("DOMContentLoaded", () => {
  // ⬇️ Listener para detectar resize y renderizar sidebar si pasamos a desktop
  let wasDesktop = window.innerWidth >= 992;

  window.addEventListener("resize", () => {
    const isNowDesktop = window.innerWidth >= 992;

    if (isNowDesktop && !wasDesktop) {
      const sidebar = document.getElementById("filtersSidebar");

      if (!sidebar) {
        console.log("🧩 Sidebar no existe → inyectando desde cero");
        renderSidebar();
      }

      console.log("🔄 Forzando re-render de filtros en sidebar (desde estado global)");
      const filtersBody = document.querySelector("#filtersSidebar #filtersBody");
      if (filtersBody) filtersBody.innerHTML = "";
      renderDynamicFilters("sidebar");
      setupCollapsibles();
      setupClearFiltersButton();
      initCheckboxListeners();

      // 📐 Ajustar distribución inicial del grid según breakpoint y estado del sidebar
      adjustGridLayout();

      // ← ✅ Ajustar altura del sidebar en resize hacia desktop
      adjustSidebarHeight();
    }

    wasDesktop = isNowDesktop;

    // 📐 Ajustar distribución al hacer resize
    adjustGridLayout();

  });


  // Iniciar render de filtros para modal en mobile
  renderDynamicFilters("modal");

  // Configurar UI
  setupCollapsibles();
  toggleSidebar();
  initFiltersUI();

  const tabFromURL = getTabFromURL();
  if (tabFromURL) {
    const targetTab = document.querySelector(`.tab[data-category="${tabFromURL}"]`);
    if (targetTab) {
      document.querySelector('.tab.selected')?.classList.remove('selected');
      targetTab.classList.add('selected');
    }
  }


  // Inicializar tabs de subcategoría
  initTabs(); // ← ✅ NUEVA LÍNEA

  // Cargar grid de productos
  initGrid();

  // Inicializar scrollbar visual
  initScrollbar();

  // ← ✅ AJUSTAR ALTURA DEL SIDEBAR DESPUÉS DE CARGAR GRID Y SCROLLBAR
  adjustSidebarHeight();

  // Inicializar tabs responsivos de navbar
  initNavbarTabs(); // 👈 AGREGAR AQUÍ

  // Renderizar swatches de productos
  renderProductSwatches();

  // Inicializar listeners de checkboxes
  initCheckboxListeners();

  // Activar botón "Clear Filters"
  setupClearFiltersButton();

  // Aplicar filtros al hacer clic en el botón del modal
  const filtersModal = document.getElementById("filtersModal");
  const applyFiltersBtn = document.getElementById("applyFilters");

  applyFiltersBtn?.addEventListener("click", () => {
    filtersModal.classList.remove("active");
    filtersModal.classList.remove("visible");
    document.body.style.overflow = "";

    const activeTab = document.querySelector(".tab.selected");
    const category = activeTab?.dataset.category;
    if (!category) return;

    // Reiniciar estructura para el tab actual
    const newFilters = {
      "data-template-style": new Set(),
      "data-silhouette": new Set(),
      "data-sleeve-type": new Set()
    };

    const allCheckboxes = filtersModal.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(input => {
      const attr = input.getAttribute("data-attribute");
      const val = input.value;
      if (input.checked) {
        newFilters[attr].add(val);
      }
    });

    const logFriendlyFilters = Object.fromEntries(
      Object.entries(newFilters).map(([k, v]) => [k, [...v]])
    );
    console.log("✅ Filtros capturados antes de aplicar:", logFriendlyFilters);

    // Guardar filtros en el estado global
    selectedFiltersByCategory[category] = newFilters;

    // Reaplicar filtros y reconstruir UI
    applySelectedFilters();
    renderDynamicFilters();
      // ✅ Actualizar contador DESPUÉS de aplicar y renderizar
      const count = Array.from(document.querySelectorAll('.product-card'))
        .filter(card => card.dataset.visible === "true").length;
      const resultsCount = document.getElementById("results-count");
      if (resultsCount) resultsCount.textContent = count;
  });
});
