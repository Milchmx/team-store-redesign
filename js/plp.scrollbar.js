// plp.scrollbar.js
// Lógica del scrollbar visual horizontal sincronizado con los tabs

export function initScrollbar() {
    const slider = document.querySelector(".tabs-slider");
    const thumb = document.querySelector(".scrollbar-thumb");
    const wrapper = document.querySelector(".scrollbar-wrapper");
    const track = document.querySelector(".scrollbar-track");
  
    if (!slider || !thumb || !wrapper || !track) {
      console.warn("⚠️ Elementos de scrollbar no encontrados");
      return;
    }
  
    function updateScrollbarThumbWidth() {
      const visibleWidth = slider.clientWidth;
      const totalWidth = slider.scrollWidth;
  
      const proportion = visibleWidth / totalWidth;
      const thumbWidth = Math.max(proportion * track.clientWidth, 24);
      thumb.style.width = `${thumbWidth}px`;
  
      // Posición inicial
      const scrollLeft = slider.scrollLeft;
      const scrollWidth = totalWidth - visibleWidth;
      const maxThumbLeft = track.clientWidth - thumb.clientWidth;
      const thumbLeft = (scrollLeft / scrollWidth) * maxThumbLeft;
      thumb.style.left = `${thumbLeft}px`;
    }
  
    function toggleScrollbarVisibility() {
      const hasOverflow = slider.scrollWidth > slider.clientWidth;
  
      if (hasOverflow) {
        wrapper.style.display = "block";
        updateScrollbarThumbWidth();
      } else {
        wrapper.style.display = "none";
      }
    }
  
    slider.addEventListener("scroll", () => {
      const scrollLeft = slider.scrollLeft;
      const scrollWidth = slider.scrollWidth - slider.clientWidth;
      const maxThumbLeft = track.clientWidth - thumb.clientWidth;
      const thumbLeft = (scrollLeft / scrollWidth) * maxThumbLeft;
      thumb.style.left = `${thumbLeft}px`;
    });
  
    window.addEventListener("resize", toggleScrollbarVisibility);
  
    // Llamar inmediatamente en inicialización
    toggleScrollbarVisibility();
  
    console.log("📏 Scrollbar dinámico inicializado");
  }
  
