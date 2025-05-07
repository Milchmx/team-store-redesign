// plp.ui.js
// Comportamiento visual: toggles, collapsibles, sidebar, aria

import { isDesktop, renderDynamicFilters, selectedFiltersByCategory, applySelectedFilters } from '/plp.filters.js';
import { adjustGridLayout } from '/plp.grid.js'; // 📐 Control de layout responsivo

// Buffer temporal para checkboxes seleccionados visualmente
const visualFilterBuffer = {};

export function setupCollapsibles() {
  console.log("Collapsibles configurados");

  // 🟢 Soporte para collapsibles globales (como SEO)
  const globalCollapsibles = document.querySelectorAll("[data-collapsible]");
  globalCollapsibles.forEach(wrapper => {
    const heading = wrapper.querySelector(".collapsible-heading");
    if (!heading) return;

    heading.addEventListener("click", () => {
      const isOpen = wrapper.classList.contains("open");
      wrapper.classList.toggle("open", !isOpen);
      wrapper.classList.toggle("collapsed", isOpen); // por compatibilidad visual
      heading.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // 🟠 Soporte específico para filtros (como ya lo tenías)
  const containers = [
    document.getElementById("filtersBody"),
    document.querySelector("#filtersModal #filtersBody")
  ];

  containers.forEach(container => {
    container?.addEventListener("click", (e) => {
      const btn = e.target.closest(".collapsible-heading");
      if (!btn) return;

      const wrapper = btn.closest(".collapsible");
      if (!wrapper) return;

      const isOpen = wrapper.classList.contains("open");
      wrapper.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });
}


export function initCheckboxListeners() {
  const filtersBody = document.getElementById("filtersBody");
  if (!filtersBody) return;

  filtersBody.addEventListener("change", (e) => {
    const input = e.target;
    if (input.type !== "checkbox") return;

    const attr = input.getAttribute("data-attribute");
    const val = input.value;
    const category = document.querySelector(".tab.selected")?.dataset.category;
    if (!category || !attr || !val) return;

    // Crea la estructura del buffer si no existe
    if (!visualFilterBuffer[category]) {
      visualFilterBuffer[category] = {};
    }
    if (!visualFilterBuffer[category][attr]) {
      visualFilterBuffer[category][attr] = new Set();
    }

    const set = visualFilterBuffer[category][attr];

    if (input.checked) {
      set.add(val);
    } else {
      set.delete(val);
    }

    console.log(`🔍 Checkbox cambiado → attr: ${attr}, val: ${val}, checked: ${input.checked}`);
    console.log("📦 Estado actual del visualFilterBuffer:", structuredClone(visualFilterBuffer));
    console.log("📦 Buffer visual actualizado:", visualFilterBuffer);

    // ✅ NUEVO: aplicar filtros de inmediato si estamos en desktop
    if (isDesktop()) {
      console.log("🖥️ Desktop detectado → aplicando filtros en vivo");
      const filters = selectedFiltersByCategory[category];

      // Limpia el estado global y sincroniza con el buffer visual
      Object.keys(filters).forEach(attr => filters[attr].clear());
      Object.entries(visualFilterBuffer[category]).forEach(([attr, bufferSet]) => {
        bufferSet.forEach(val => filters[attr].add(val));
      });

      applySelectedFilters();
    }
  });
}

export function toggleSidebar() {
  const sidebar = document.getElementById("filtersSidebar");
  const filtersBtn = document.querySelector("[data-filters-trigger]");
  if (!sidebar || !filtersBtn) return;

  const isVisible = sidebar.classList.contains("visible");

  if (isVisible) {
    sidebar.classList.remove("fade-in");
    sidebar.classList.add("fade-out");
    sidebar.classList.remove("visible");
    filtersBtn.setAttribute("aria-pressed", "false");
    console.log("🔻 Sidebar ocultado con fade-out");

    adjustGridLayout(); // 📐 Reajustar layout tras ocultar el sidebar
  } else {
    sidebar.classList.remove("fade-out");
    sidebar.classList.add("fade-in");
    sidebar.classList.add("visible");
    filtersBtn.setAttribute("aria-pressed", "true");
    console.log("🔺 Sidebar mostrado con fade-in");

    adjustGridLayout(); // 📐 Reajustar layout tras mostrar el sidebar
  }
}

// 🧹 Botón "Clear Filters"
export function setupClearFiltersButton() {
  const clearBtn = document.getElementById("clearFilters");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    console.log("🧼 Click en botón Clear Filters");

    const category = document.querySelector(".tab.selected")?.dataset.category;
    console.log("📂 Categoría activa:", category);
    if (!category) return;

    // 1. Restaurar todos los productos a visible
    document.querySelectorAll(".product-card").forEach(card => {
      card.dataset.visible = "true";
    });
    console.log("✅ Todos los productos marcados como visibles");

    // 2. Vaciar los filtros seleccionados de esta categoría
    const filters = selectedFiltersByCategory[category];
    console.log("🗑️ Filtros antes de limpiar:", filters);
    if (filters) {
      Object.keys(filters).forEach(attr => filters[attr].clear());
    }
    console.log("✅ Filtros después de limpiar:", filters);

    // 3. Desmarcar todos los checkboxes
    const checkboxes = document.querySelectorAll('#filtersModal input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    console.log("☑️ Checkboxes desmarcados");

    // 4. Renderizar filtros desde el estado limpio
    renderDynamicFilters();
    console.log("🎛️ Filtros renderizados de nuevo");

    applySelectedFilters();
    console.log("🔁 Filtros aplicados a los productos");

    // ✅ También actualiza el contador de productos visibles
    const count = Array.from(document.querySelectorAll('.product-card'))
      .filter(card => card.dataset.visible === "true").length;
    const resultsCount = document.getElementById("results-count");
    if (resultsCount) resultsCount.textContent = count;
    console.log("🔢 Contador actualizado:", count);
  });
}


// 🎛️ Inicializa la UI del modal de filtros
export function initFiltersUI() {
  const filtersModal = document.getElementById("filtersModal");
  const filtersBtn = document.querySelector("[data-filters-trigger]");
  const closeFiltersBtn = document.getElementById("closeFiltersModal");

  if (!filtersModal || !filtersBtn) {
    console.warn("⚠️ Falta el botón de filtros o el modal.");
    return;
  }

  filtersBtn.addEventListener("click", () => {
    if (isDesktop()) {
      // Desktop → toggle del sidebar
      toggleSidebar();
    } else {
      // Mobile → abrir modal como siempre
      filtersModal.classList.add("active");
      setTimeout(() => filtersModal.classList.add("visible"), 50);
      document.body.style.overflow = "hidden";
      renderDynamicFilters();
      setupCollapsibles();
      // (El resto del código actual sigue aquí…)
    }
  
    renderDynamicFilters();
    setupCollapsibles(); // 💡 Re-enlaza collapsibles en filtros recién renderizados
  
    // ⬇️ NUEVO: Imprime el estado actual de los filtros globales
    const category = document.querySelector(".tab.selected")?.dataset.category;
    const filters = selectedFiltersByCategory[category];
    console.log("🪞 Estado global de filtros al abrir modal:", JSON.parse(JSON.stringify(filters)));
  
    // 🔁 Limpiar visualmente todos los checkboxes
    const allCheckboxes = filtersModal.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = false);
  
    // ✅ Marcar solo los filtros activos desde el estado global
    if (filters) {
      Object.entries(filters).forEach(([attr, set]) => {
        set.forEach(val => {
          const matchingCheckbox = filtersModal.querySelector(
            `input[type="checkbox"][data-attribute="${attr}"][value="${val}"]`
          );
          if (matchingCheckbox) matchingCheckbox.checked = true;
        });
      });
    }
  
    const firstFocusable = filtersModal.querySelector("button, [tabindex]:not([tabindex='-1'])");
    if (firstFocusable) firstFocusable.focus();
  });
  

  closeFiltersBtn?.addEventListener("click", () => {
    filtersModal.classList.remove("visible");
    setTimeout(() => filtersModal.classList.remove("active"), 150);
    document.body.style.overflow = "";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && filtersModal.classList.contains("active")) {
      filtersModal.classList.remove("visible");
      setTimeout(() => filtersModal.classList.remove("active"), 150);
      document.body.style.overflow = "";
    }
  });

  filtersModal.addEventListener("click", (e) => {
    if (e.target === filtersModal) {
      filtersModal.classList.remove("visible");
      setTimeout(() => filtersModal.classList.remove("active"), 150);
      document.body.style.overflow = "";
    }
  });

  console.log("🎛️ UI de filtros inicializada");
}

export function renderSidebar() {
  console.log("🔧 Ejecutando renderSidebar()");

  const container = document.getElementById("productGridContainer");
  if (!container) {
    console.warn("🚫 No se encontró el contenedor productGridContainer");
    return;
  }

  const existingSidebar = document.getElementById("filtersSidebar");
  if (existingSidebar) {
    console.log("🔁 Sidebar ya existe, se omite render");
    return;
  }

  const sidebar = document.createElement("aside");
  sidebar.id = "filtersSidebar";
  sidebar.className = "filters-sidebar";
  sidebar.innerHTML = `
    <div class="filters-body" id="filtersBody">
      <!-- Filtros se renderizan aquí -->
    </div>
    <div class="filters-footer">
      <button class="secondary-button" id="clearFilters">Clear Filters</button>
    </div>
  `;

  const grid = document.getElementById("productGrid");
  if (grid) {
    container.insertBefore(sidebar, grid);
    console.log("✅ Sidebar inyectado correctamente");

    renderDynamicFilters("sidebar");
    setupClearFiltersButton();
    setupCollapsibles();
    initCheckboxListeners();
  } else {
    console.warn("🚫 No se encontró el grid para insertar el sidebar");
  }
}

