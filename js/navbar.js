// navbar.js

const gap = 8; // 👈 importante: mantenlo sincronizado con el CSS
const isLgOrLarger = () => window.innerWidth >= 992;

export function initNavbarTabs() {
  if (!isLgOrLarger()) return; // ⛔️ Detener todo si estamos en mobile al cargar

  const tabsWrapper = document.querySelector('.navbar-tabs-dynamic');
  if (!tabsWrapper) return;

  function updateNavbarTabsVisibility() {
    if (!isLgOrLarger()) {
      tabsWrapper.style.display = 'none';
      return;
    }

    tabsWrapper.style.display = 'flex';

    const allTabs = Array.from(tabsWrapper.querySelectorAll('.category-tab'));

    // 🔒 Paso 1: Oculta todos antes de medir
    allTabs.forEach(tab => {
      tab.style.display = 'none';
    });

    // 🔍 Paso 2: Forzar reflow para asegurar medidas correctas
    tabsWrapper.offsetHeight;

    const wrapperRect = tabsWrapper.getBoundingClientRect();
    const wrapperRightEdge = wrapperRect.left + wrapperRect.width;

    let shownCount = 0;
    allTabs.forEach((tab, index) => {
      tab.style.display = 'inline-flex';

      const tabRect = tab.getBoundingClientRect();
      const tabRightEdge = tabRect.right;
      const fits = tabRightEdge <= wrapperRightEdge;

      if (fits) {
        shownCount++;
      } else {
        tab.style.display = 'none';
      }
    });

    console.log(`✅ Mostrando ${shownCount} tabs de ${allTabs.length}`);
  }

  // ✅ Escuchar resize SOLO si se inició en desktop
  window.addEventListener('resize', () => {
    if (isLgOrLarger()) {
      updateNavbarTabsVisibility();
    }
  });

  // ✅ Ejecutar inicial
  updateNavbarTabsVisibility();
}
