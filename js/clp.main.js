// clp.main.js
import { initNavbarTabs } from '../../SGS PLP/js/navbar.js';
import './clp_carousel.js';
import './clp_collapsibles.js';

// ✅ Función que asegura que el layout esté 100% pintado
function waitForLayout(callback) {
  requestAnimationFrame(() => {
    setTimeout(callback, 50); // ⏱️ Espera a que todo se pinte
  });
}

document.addEventListener("DOMContentLoaded", () => {
  waitForLayout(() => {
    console.log("🔁 Ejecutando initNavbarTabs() con layout estabilizado");
    initNavbarTabs();
  });
});
