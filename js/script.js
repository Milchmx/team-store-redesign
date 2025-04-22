document.addEventListener("DOMContentLoaded", () => {
    const productCards = document.querySelectorAll(".product-card");
    const tabs = document.querySelectorAll(".tab");
    const currentCategory = "basketball";
  
    function filterProductsByTab(selectedSubcategory) {
      let visibleCount = 0;
      productCards.forEach(card => {
        const visibleIn = card.dataset.visibleIn.split(",").map(s => s.trim());
        const subcategory = card.dataset.subcategory;
        const isVisible = visibleIn.includes(currentCategory) && subcategory === selectedSubcategory;
  
        card.style.display = isVisible ? "block" : "none";
        if (isVisible) visibleCount++;
      });
  
      const resultsCount = document.querySelector("#results-count");
      if (resultsCount) resultsCount.textContent = visibleCount;
    }
  
    const initialTab = document.querySelector(".tab.selected");
    if (initialTab) filterProductsByTab(initialTab.dataset.category);
  
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("selected"));
        tab.classList.add("selected");
  
        tab.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  
        const selectedCategory = tab.dataset.category;
        filterProductsByTab(selectedCategory);
      });
    });
  
    // === GENERAR PRODUCT SWATCH ===
    productCards.forEach(card => {
      const customizationMode = card.dataset.customizationMode;
      const colorsRaw = card.dataset.color;
      const colors = colorsRaw ? colorsRaw.split(",").map(c => c.trim()) : [];
  
      // Crear elementos base
      const swatchWrapper = document.createElement("div");
      swatchWrapper.className = "product-swatch";
  
      const swatchesContainer = document.createElement("div");
      swatchesContainer.className = "swatches-container";
  
      let description = null;
  
      if (customizationMode === "full") {
        // Variante: Fully editable colors
        const swatch = document.createElement("div");
        swatch.className = "swatch";
  
        const circle = document.createElement("div");
        circle.className = "swatch-circle";
        circle.style.background = "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)";
  
        swatch.appendChild(circle);
        swatchesContainer.appendChild(swatch);
  
        description = document.createElement("div");
        description.className = "swatch-description";
        description.textContent = "Choose any color";
  
      } else if (colors.length <= 5) {
        // Variante: Less than 5 colors
        colors.forEach(color => {
          const swatch = document.createElement("div");
          swatch.className = "swatch";
  
          const circle = document.createElement("div");
          circle.className = "swatch-circle";
          circle.style.color = color;
  
          swatch.appendChild(circle);
          swatchesContainer.appendChild(swatch);
        });
  
      } else {
        // Variante: More than 5 colors
        colors.slice(0, 5).forEach(color => {
          const swatch = document.createElement("div");
          swatch.className = "swatch";
  
          const circle = document.createElement("div");
          circle.className = "swatch-circle";
          circle.style.color = color;
  
          swatch.appendChild(circle);
          swatchesContainer.appendChild(swatch);
        });
  
        description = document.createElement("div");
        description.className = "swatch-description";
        description.textContent = `+${colors.length - 5}`;
      }
  
      swatchWrapper.appendChild(swatchesContainer);
      if (description) swatchWrapper.appendChild(description);
  
      // Insertar en el lugar correcto
      const heading = card.querySelector(".product-heading");
      const label = card.querySelector(".product-label");
      if (heading && label) {
        label.parentNode.insertBefore(swatchWrapper, label);
      }
    });
  });
