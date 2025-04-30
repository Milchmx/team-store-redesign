// === 🧩 MULTI-COLLAPSIBLE FUNCTIONALITY + HEIGHT SYNC ===

document.addEventListener("DOMContentLoaded", () => {
    const collapsibles = document.querySelectorAll("[data-collapsible]");
  
    function isDesktop() {
      return window.innerWidth >= 768; // md+
    }
  
    function syncCollapsibleHeights() {
        if (!isDesktop()) {
          collapsibles.forEach(c => c.style.minHeight = "");
          return;
        }
      
        const opened = Array.from(collapsibles).filter(c => c.classList.contains("open"));
      
        // Limpia primero
        collapsibles.forEach(c => c.style.minHeight = "");
      
        if (opened.length <= 1) return;
      
        // Medimos altura real del contenido de cada open
        const max = Math.max(...opened.map(c => {
          const content = c.querySelector(".collapsible-content");
          return c.scrollHeight;
        }));
      
        opened.forEach(c => {
          c.style.minHeight = `${max}px`;
        });
    }      
  
    // Activación básica + sincronización
    collapsibles.forEach((collapsible) => {
      const toggle = collapsible.querySelector(".collapsible-toggle");
  
      if (!toggle) return;
  
      collapsible.addEventListener("click", (e) => {
        const isOpen = collapsible.classList.contains("open");
  
        const clickedInside = e.target.closest(".collapsible-toggle");
        if (!clickedInside && !collapsible.contains(e.target)) return;
  
        collapsible.classList.toggle("open", !isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));
        
        // Espera que el DOM aplique el cambio de clase antes de medir
        requestAnimationFrame(() => {
          setTimeout(() => {
            syncCollapsibleHeights();
          }, 50); // tiempo justo para que .collapsible-content se haya expandido
        });
      });
    });
  
    // 🔁 Resync on resize
    window.addEventListener("resize", () => {
      syncCollapsibleHeights();
    });
  });
  