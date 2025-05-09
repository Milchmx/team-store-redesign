// plp.sidebarHeight.js

export function adjustSidebarHeight() {
    const sidebar = document.getElementById('filtersSidebar');
    if (!sidebar) return;
  
    const topOffset = sidebar.getBoundingClientRect().top + window.scrollY;
    const viewportHeight = window.innerHeight;
    const availableHeight = viewportHeight - sidebar.getBoundingClientRect().top;
  
    sidebar.style.maxHeight = `${availableHeight}px`;
    sidebar.style.overflowY = 'auto';
  }
  
  // Recalcular al cambiar el tamaño de la ventana
  window.addEventListener('resize', adjustSidebarHeight);
  window.addEventListener('scroll', adjustSidebarHeight);
  
