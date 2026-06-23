/* ============================================================
   EcoQuest — Entrance Animation Orchestrator
   Menambahkan animasi staggered pada komponen utama tiap halaman.
   Cukup panggil initEntrance() setelah konten siap.
   ============================================================ */

function initEntrance(selectors, options = {}) {
  // Hormati prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const stagger = options.stagger ?? 90;   // jeda antar elemen (ms)
  const startDelay = options.startDelay ?? 60;

  // Kumpulkan elemen target (urut sesuai kemunculan di DOM)
  let els = [];
  if (Array.isArray(selectors)) {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => els.push(el));
    });
  } else if (typeof selectors === 'string') {
    els = Array.from(document.querySelectorAll(selectors));
  }

  // Urutkan sesuai posisi di dokumen agar stagger natural (atas → bawah)
  els.sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  els.forEach((el, i) => {
    el.classList.add('eq-animate');
    // terapkan delay bertahap
    el.style.animationDelay = (startDelay + i * stagger) + 'ms';
    // trigger di frame berikutnya
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('eq-in');
        // Setelah animasi selesai, lepas class eq-animate agar opacity
        // tidak kembali ke 0 ketika elemen di-hide/show oleh tab switcher
        const duration = (startDelay + i * stagger) + 600;
        setTimeout(() => {
          el.classList.remove('eq-animate', 'eq-in');
          el.style.animationDelay = '';
        }, duration);
      });
    });
  });
}
