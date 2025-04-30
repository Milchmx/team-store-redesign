// === 🧩 BLOQUE: Inicialización global ===
let selectedFiltersByCategory = {
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
  }
};

function getActiveTabFilters() {
  const activeTab = document.querySelector(".tab.selected");
  const category = activeTab?.dataset.category;
  return selectedFiltersByCategory[category];
}

function applySelectedFilters() {
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

  visibleCards = 0;

  const cardsPerLoad = window.innerWidth < 992 ? 24 : 36;
  const filtered = Array.from(cards).filter(c => c.dataset.visible === "true");

  filtered.forEach(card => card.style.display = "none");
  const nextBatch = filtered.slice(0, cardsPerLoad);
  nextBatch.forEach(card => card.style.display = "flex");
  visibleCards = nextBatch.length;

  const seeMoreBtn = document.querySelector(".see-more-button");
  if (seeMoreBtn) {
    seeMoreBtn.style.display = (filtered.length > cardsPerLoad) ? "block" : "none";
  }

  const resultsCount = document.querySelector("#results-count");
  if (resultsCount) resultsCount.textContent = visibleCount;
}


document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const slider = document.querySelector(".tabs-slider");
  const thumb = document.querySelector(".scrollbar-thumb");
  const productCards = document.querySelectorAll(".product-card");
  const currentCategory = "basketball";
  const collapsible = document.querySelector("[data-collapsible]");
  const collapsibleContent = document.getElementById("seo-content");
  const filtersButton = document.querySelector("[data-filters-trigger]");
  const filtersModal = document.getElementById("filtersModal");
  const closeFiltersBtn = document.getElementById("closeFiltersModal");
  const applyFiltersBtn = document.getElementById("applyFilters");
  
  // === 🧩 BLOQUE: Click en Apply Filters ===
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
  
    // Guardar en selectedFiltersByCategory
    selectedFiltersByCategory[category] = newFilters;
  
    applySelectedFilters();
    renderDynamicFilters();
  });
  
  
// === ✅ Fin BLOQUE: Click en Apply Filters ===

  const allCards = Array.from(document.querySelectorAll(".product-card"));
  const ctaContainer = document.querySelector(".cta-container");
  const seeMoreButton = document.querySelector(".see-more-button");

  // === 🧩 BLOQUE: Ocultar tabs sin productos ===
const aliasConditions = {
  "shirts-tanks": card =>
    card.dataset.subcategory === "shirts" &&
  // === Aqui se agregan los data-sleeve-type necesarios y tambien en el siguiente mensaje ===
    ["sleeveless", "short-sleeve", "3/4-sleeve", "long-sleeve"].includes(card.dataset.sleeveType) &&
    ["racerback", "tank-top", "boxy-tank", "regular-tee", "track","polo","pinnies","compression-shirts"].includes(card.dataset.silhouette),
//Revisar lo que puse aqui abajo
    "polos": card =>
    card.dataset.subcategory === "shirts" &&
    card.dataset.silhouette === "polo"
};

tabs.forEach(tab => {
  const category = tab.dataset.category;
  const hasContent = aliasConditions[category]
    ? Array.from(productCards).some(aliasConditions[category])
    : Array.from(productCards).some(card => card.dataset.subcategory === category);

  if (!hasContent) {
    tab.style.display = "none";
  }
});
// === ✅ Fin BLOQUE: Ocultar tabs sin productos ===

toggleScrollbarVisibility(); // ⬅️ recalcula el scroll una vez que ya ocultaste los tabs vacíos


  let visibleCards = 0;

  // === 🧩 BLOQUE: Filtrar productos según tab ===
  function filterProductsByTab(category) {
    const aliasConditions = {
      "shirts-tanks": card =>
        card.dataset.subcategory === "shirts" &&
      // === Aqui tambien se agregan los data-sleeve-type necesarios ===
        ["sleeveless", "short-sleeve", "3/4-sleeve", "long-sleeve"].includes(card.dataset.sleeveType) &&
        ["racerback", "tank-top", "boxy-tank", "regular-tee", "track", "polo", "pinnies", "compression-shirts"].includes(card.dataset.silhouette),

        "polos": card =>
          card.dataset.subcategory === "shirts" &&
          card.dataset.silhouette === "polo"
    };
  
    let visibleCount = 0;
  
    productCards.forEach(card => {
      const visibleIn = card.dataset.visibleIn.split(",").map(s => s.trim());
      let isVisible = false;
  
      if (aliasConditions[category]) {
        isVisible = visibleIn.includes(currentCategory) && aliasConditions[category](card);
      } else {
        isVisible = visibleIn.includes(currentCategory) && card.dataset.subcategory === category;
      }
  
      card.dataset.visible = isVisible ? "true" : "false";
      if (isVisible) visibleCount++;
    });
  
    const resultsCount = document.querySelector("#results-count");
    if (resultsCount) resultsCount.textContent = visibleCount;
  
    // 🧼 Oculta todas las tarjetas sin importar su estado anterior
    allCards.forEach(card => {
      card.style.display = "none";
    });

  
    visibleCards = 0;
    showNextBatch();
  }
  
  // === ✅ Fin BLOQUE: Filtrar productos según tab ===


// === 🧩 BLOQUE: Mostrar productos por lotes ===
function getCardsPerLoad() {
  return window.innerWidth < 992 ? 24 : 36;
}

function showNextBatch() {
  const cardsPerLoad = getCardsPerLoad();
  const filteredCards = allCards.filter(card => card.dataset.visible === "true");
  const nextBatch = filteredCards.slice(visibleCards, visibleCards + cardsPerLoad);

  nextBatch.forEach(card => {
    card.style.display = "flex";
  });

  visibleCards += nextBatch.length;

  // ✅ Mostrar u ocultar el botón según si aún hay más productos que mostrar
  if (visibleCards >= filteredCards.length) {
    ctaContainer.style.display = "none"; // Ya se mostraron todos → ocultar botón
  } else {
    ctaContainer.style.display = "flex"; // Aún hay más productos → mostrar botón
  }
}
// === ✅ Fin BLOQUE: Mostrar productos por lotes ===



  // === 🧩 BLOQUE: Aplicar filtro en la primera carga ===
  const initialTab = document.querySelector(".tab.selected");
  if (initialTab) {
    filterProductsByTab(initialTab.dataset.category);

    renderDynamicFilters(); // 🧠 Evalúa los filtros en la primera carga

  }
  // === ✅ Fin BLOQUE: Aplicar filtro en la primera carga ===


  // === 🧩 BLOQUE: Scrollbar dinámico ===
function updateScrollbarThumbWidth() {
const track = document.querySelector(".scrollbar-track");
if (!slider || !thumb || !track) return;

const visibleWidth = slider.clientWidth;
const totalWidth = slider.scrollWidth;

const proportion = visibleWidth / totalWidth;
const thumbWidth = Math.max(proportion * track.clientWidth, 24);
thumb.style.width = `${thumbWidth}px`;

// Sincronizar posición inicial
const scrollLeft = slider.scrollLeft;
const scrollWidth = totalWidth - visibleWidth;
const maxThumbLeft = track.clientWidth - thumb.clientWidth;
const thumbLeft = (scrollLeft / scrollWidth) * maxThumbLeft;
thumb.style.left = `${thumbLeft}px`;
}

function toggleScrollbarVisibility() {
const wrapper = document.querySelector(".scrollbar-wrapper");
if (!slider || !wrapper) return;

const hasOverflow = slider.scrollWidth > slider.clientWidth;

if (hasOverflow) {
  wrapper.style.display = "block";
  updateScrollbarThumbWidth();
} else {
  wrapper.style.display = "none";
}
}

slider.addEventListener("scroll", () => {
const track = document.querySelector(".scrollbar-track");
if (!track) return;

const scrollLeft = slider.scrollLeft;
const scrollWidth = slider.scrollWidth - slider.clientWidth;
const maxThumbLeft = track.clientWidth - thumb.clientWidth;
const thumbLeft = (scrollLeft / scrollWidth) * maxThumbLeft;
thumb.style.left = `${thumbLeft}px`;
});

toggleScrollbarVisibility();
window.addEventListener("resize", toggleScrollbarVisibility);
// === ✅ Fin BLOQUE: Scrollbar dinámico ===



  // === 🧩 BLOQUE: Tabs y navegación ===
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("selected"));
      tab.classList.add("selected");
      tab.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  
      // 🧼 Resetear lote visible
      visibleCards = 0;
  
      // 🧠 Reaplicar filtro y mostrar batch
      filterProductsByTab(tab.dataset.category);
      renderDynamicFilters(); // ✅ Evaluar visibilidad del botón después de cambiar tab

  
      // 🧩 Recalcular filtros disponibles (esto ya está bien aplicado dentro del modal)
    });
  });
  
  seeMoreButton.addEventListener("click", showNextBatch);
  // === ✅ Fin BLOQUE: Tabs y navegación ===


  // === 🧩 BLOQUE: Acordeón SEO ===
  collapsible?.addEventListener("click", () => {
    const isExpanded = collapsibleContent.classList.contains("expanded");
    collapsibleContent.classList.toggle("expanded", !isExpanded);
    collapsible.classList.toggle("open", !isExpanded);
  });
  // === ✅ Fin BLOQUE: Acordeón SEO ===


  // === 🧩 BLOQUE: Modal de filtros ===
  filtersButton?.addEventListener("click", () => {
    filtersModal.classList.add("active");
    document.body.style.overflow = "hidden";
    renderDynamicFilters(); // ✅ Llama al render justo aquí
    const firstFocusable = filtersModal.querySelector("button, [tabindex]:not([tabindex='-1'])");
    if (firstFocusable) firstFocusable.focus();
  });

  closeFiltersBtn?.addEventListener("click", () => {
    filtersModal.classList.remove("active");
    document.body.style.overflow = "";
  });
  

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && filtersModal.classList.contains("active")) {
      filtersModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
  // === ✅ Fin BLOQUE: Modal de filtros ===


  // === 🧩 BLOQUE: Render de swatches ===
  function renderProductSwatches() {
    productCards.forEach(card => {
      const swatchContainer = card.querySelector('.swatches-container');
      const existingSwatch = swatchContainer?.querySelector('.swatch');
      if (!swatchContainer || existingSwatch) return;

      const mode = card.dataset.customizationMode;
      const colorsRaw = card.dataset.color;

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

      } else if (colorsRaw) {
        const colors = colorsRaw.split(',').map(c => c.trim());

        colors.slice(0, 5).forEach(color => {
          const swatch = document.createElement('div');
          swatch.className = 'swatch';
          const circle = document.createElement('span');
          circle.className = 'swatch-circle';
          circle.style.color = color;
          swatch.appendChild(circle);
          swatchContainer.appendChild(swatch);
        });

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
  renderProductSwatches();
  // === ✅ Fin BLOQUE: Render de swatches ===

// 🔁 Versión optimizada de renderDynamicFilters() basada en reglas oficiales
function renderDynamicFilters() {
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
  const filtersBody = document.getElementById("filtersBody");
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
      const checked = selectedSet.size === 0 || selectedSet.has(value);
    
      return `
        <label class="checkbox-text">
          <input type="checkbox" value="${value}" data-attribute="${attr.key}" ${checked ? "checked" : ""}>
          <span class="checkbox-label">${value}</span>
          <span class="checkbox-count">(${count})</span>
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





// === 🧩 BLOQUE: Delegación de eventos para collapsibles ===
document.getElementById("filtersBody")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".collapsible-heading");
  if (!btn) return;

  const wrapper = btn.closest(".collapsible");
  if (!wrapper) return;

  const isOpen = wrapper.classList.contains("open");
  wrapper.classList.toggle("open", !isOpen);
  btn.setAttribute("aria-expanded", String(!isOpen));
});
// === ✅ Fin BLOQUE: Delegación de eventos para collapsibles ===

// === 🧩 BLOQUE: Capturar cambios en checkboxes ===
document.getElementById("filtersBody")?.addEventListener("change", (e) => {
  const input = e.target;
  if (input.type === "checkbox") {
    const attr = input.getAttribute("data-attribute");
    const val = input.value;

    const currentFilters = getActiveTabFilters();
    if (!currentFilters) return;

    if (input.checked) {
      currentFilters[attr].add(val);
    } else {
      currentFilters[attr].delete(val);
    }

    console.log("🎯 Filtros actualizados para tab actual:", currentFilters);
  }
});

// === ✅ Fin BLOQUE: Capturar cambios en checkboxes ===


});
// === ✅ Fin BLOQUE: Inicialización global ===
