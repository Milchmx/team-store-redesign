// === 🎯 SCROLLBAR DINÁMICO PARA CARRUSEL ===

// Elementos clave del carrusel
const slider = document.getElementById("cardSlider");
const thumb = document.getElementById("scrollbarThumb");
const track = document.getElementById("scrollbarTrack");

// Función principal para actualizar tamaño y posición del thumb
function updateThumb() {
  const visibleWidth = slider.offsetWidth;
  const totalScrollWidth = slider.scrollWidth;
  const scrollLeft = slider.scrollLeft;
  const trackWidth = track.offsetWidth;

  // Ancho proporcional del thumb respecto al contenido visible
  const thumbWidth = (visibleWidth / totalScrollWidth) * trackWidth;
  // Posición izquierda proporcional según el scroll actual
  const thumbLeft = (scrollLeft / totalScrollWidth) * trackWidth;

  // Aplicar estilos dinámicos al thumb
  thumb.style.width = `${thumbWidth}px`;
  thumb.style.left = `${thumbLeft}px`;
}

// Escuchar eventos clave
slider.addEventListener("scroll", updateThumb); // en scroll
window.addEventListener("resize", updateThumb); // en resize
window.addEventListener("load", updateThumb);   // al cargar la página

function checkOverflowAndUpdateLayout() {
  const hasHorizontalScroll = slider.scrollWidth > slider.clientWidth;

  if (!hasHorizontalScroll) {
    slider.classList.add("no-scroll");
    track.parentElement.style.display = "none"; // oculta scrollbar-wrapper
  } else {
    slider.classList.remove("no-scroll");
    track.parentElement.style.display = "flex";
  }
}

// Actualiza en carga, resize y cuando se agregan productos
window.addEventListener("load", () => {
  updateThumb();
  checkOverflowAndUpdateLayout();
});
window.addEventListener("resize", () => {
  updateThumb();
  checkOverflowAndUpdateLayout();
});
