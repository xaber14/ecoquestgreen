/* ============================================================
   EcoQuest — Bottom Sheet controller
   ============================================================ */

const MISSION_DETAILS = {
  1: { title: "Pilah Sampah",   instruksi: "Buanglah sampah pada tempat sampah yang sudah disediakan disekitar area KG. Dan jangan lupa pisahkan sampah tertentu sesuai dengan keterangannya.", contoh: ["🗑️","♻️","🌿"] },
  2: { title: "Save Energy",    instruksi: "Matikan lampu dan peralatan elektronik setelah selesai menggunakan ruang meeting untuk menghemat energi.", contoh: ["💡","🔌","🌱"] },
  3: { title: "No Gorengan",    instruksi: "Pilih makanan sehat tanpa gorengan hari ini. Konsumsi makanan yang dikukus, direbus, atau dipanggang.", contoh: ["🥗","🥦","🍎"] },
  4: { title: "Running at GBK", instruksi: "Lari di kawasan GBK dan bagikan afirmasi positifmu. Ajak teman untuk hidup lebih sehat dan aktif.", contoh: ["🏃","🏟️","💪"] },
  5: { title: "Bike to Work",   instruksi: "Kurangi polusi dengan bersepeda ke kantor. Hemat bahan bakar dan jaga lingkungan tetap bersih.", contoh: ["🚲","🌍","🛣️"] },
};

let activeMissionId = null;

function getActiveMissionId() { return activeMissionId; }

function initBottomSheet() {
  const overlay    = document.getElementById('sheetOverlay');
  const sheet      = document.getElementById('bottomSheet');
  const closeBtn   = document.getElementById('sheetClose');
  const titleEl    = document.getElementById('sheetTitle');
  const instrEl    = document.getElementById('sheetInstruksi');
  const examplesEl = document.getElementById('sheetExamples');
  if (!overlay || !sheet) return;

  function openSheet(missionId) {
    const data = MISSION_DETAILS[missionId];
    if (!data) return;

    // Cek apakah misi sudah selesai
    const state = EQ.load();
    const mission = state.missions.find(m => m.id === Number(missionId));

    activeMissionId = Number(missionId);
    titleEl.textContent = data.title;
    instrEl.textContent = data.instruksi;
    examplesEl.innerHTML = data.contoh.map(e => `<div class="sheet-example">${e}</div>`).join('');

    // Kalau misi sudah done — tampilkan badge selesai di sheet
    const doneNotice = document.getElementById('sheetDoneNotice');
    if (mission && mission.status === 'done') {
      if (!doneNotice) {
        const notice = document.createElement('div');
        notice.id = 'sheetDoneNotice';
        notice.className = 'sheet-done-notice';
        notice.innerHTML = `<i class="ph ph-check-circle"></i> Misi ini sudah kamu selesaikan!`;
        sheet.querySelector('.sheet-body').prepend(notice);
      }
    } else {
      doneNotice?.remove();
    }

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Open on card click (ignore drag)
  document.querySelectorAll('.mission-card').forEach(card => {
    let downX = 0;
    card.addEventListener('mousedown', (e) => { downX = e.pageX; });
    card.addEventListener('click', (e) => {
      if (Math.abs(e.pageX - downX) > 6) return;
      openSheet(card.dataset.mission);
    });
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });
  closeBtn.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  const handle = document.getElementById('sheetHandle');
  if (handle) {
    let startY = null;
    handle.addEventListener('mousedown', (e) => { startY = e.clientY; });
    window.addEventListener('mouseup', (e) => {
      if (startY !== null && e.clientY - startY > 40) closeSheet();
      startY = null;
    });
    handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    handle.addEventListener('touchend', (e) => {
      if (startY !== null && e.changedTouches[0].clientY - startY > 40) closeSheet();
      startY = null;
    });
  }
}
