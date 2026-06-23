/* ============================================================
   EcoQuest — Tab switcher for Hadiah page
   ============================================================ */
function initTabs() {
  const tabs   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  function activateTab(target) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    // scroll tab bar horizontally only (tanpa menggeser halaman vertikal)
    const activeTab = document.querySelector(`.tab-btn[data-tab="${target}"]`);
    const bar = document.querySelector('.tab-bar');
    if (activeTab && bar) {
      const targetLeft = activeTab.offsetLeft - (bar.clientWidth - activeTab.clientWidth) / 2;
      bar.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }

  // klik tab
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  // baca URL param ?tab= untuk deep link dari homepage
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (tabParam) activateTab(tabParam);
}
