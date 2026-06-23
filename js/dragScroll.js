/* ============================================================
   EcoQuest — Smooth drag-to-scroll with momentum/inertia
   Used by: misi.html (mission carousel)
   ============================================================ */

function initDragScroll(el) {
  if (!el) return;

  let isDown = false;
  let startX, startScrollLeft;
  let velX = 0;
  let lastX = 0;
  let lastTime = 0;
  let rafId = null;

  function cancelMomentum() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function applyMomentum() {
    velX *= 0.92;                        // friction coefficient (0.88–0.95)
    if (Math.abs(velX) < 0.4) { velX = 0; return; }
    el.scrollLeft -= velX;
    rafId = requestAnimationFrame(applyMomentum);
  }

  el.addEventListener('mousedown', (e) => {
    cancelMomentum();
    isDown = true;
    el.classList.add('is-dragging');
    startX = e.pageX;
    startScrollLeft = el.scrollLeft;
    lastX = e.pageX;
    lastTime = performance.now();
    velX = 0;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    velX = (lastX - e.pageX) / dt * 16;  // px per frame @ ~60fps
    lastX = e.pageX;
    lastTime = now;
    el.scrollLeft = startScrollLeft + (startX - e.pageX);
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    el.classList.remove('is-dragging');
    rafId = requestAnimationFrame(applyMomentum);
  });

  // Smooth vertical-wheel → horizontal scroll
  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal, skip
    e.preventDefault();
    cancelMomentum();
    el.scrollBy({ left: e.deltaY * 2, behavior: 'smooth' });
  }, { passive: false });
}
