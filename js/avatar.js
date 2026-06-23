/* ============================================================
   EcoQuest — Foto Profil + Crop Circle (ala LinkedIn)
   - Klik edit → pilih foto dari gallery
   - Modal crop: zoom (slider) + geser (drag)
   - Simpan → render lingkaran ke canvas → localStorage
   ============================================================ */

function initAvatar() {
  const editBtn   = document.getElementById('avatarEditBtn');
  const input     = document.getElementById('avatarInput');
  const overlay   = document.getElementById('cropOverlay');
  const closeBtn  = document.getElementById('cropClose');
  const stage     = document.getElementById('cropStage');
  const img       = document.getElementById('cropImage');
  const zoom      = document.getElementById('cropZoom');
  const saveBtn   = document.getElementById('cropSave');
  if (!editBtn) return;

  const CIRCLE = 220;           // diameter lingkaran mask (sesuai CSS)
  const OUTPUT = 320;           // ukuran output foto (px)

  let natW = 0, natH = 0;       // ukuran asli gambar
  let baseScale = 1;            // skala minimum (cover lingkaran)
  let scale = 1;                // skala aktif
  let posX = 0, posY = 0;       // posisi gambar (top-left) relatif stage
  let stageW = 0, stageH = 0;

  // muat foto tersimpan saat halaman dibuka
  loadSavedAvatar();

  /* ── Buka file picker ── */
  editBtn.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('File harus berupa gambar.'); return; }

    const url = URL.createObjectURL(file);
    img.onload = () => {
      natW = img.naturalWidth;
      natH = img.naturalHeight;
      openCrop();
      URL.revokeObjectURL(url);
    };
    img.src = url;
    input.value = '';
  });

  /* ── Setup crop modal ── */
  function openCrop() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    stageW = stage.clientWidth;
    stageH = stage.clientHeight;

    // baseScale = skala minimal supaya gambar menutupi lingkaran sepenuhnya
    baseScale = Math.max(CIRCLE / natW, CIRCLE / natH);
    scale = baseScale;

    // konfigurasi slider zoom (1x = baseScale, 3x = 3*baseScale)
    zoom.min = '1';
    zoom.max = '3';
    zoom.step = '0.01';
    zoom.value = '1';

    // posisikan gambar di tengah stage
    centerImage();
    render();
  }

  function centerImage() {
    const w = natW * scale;
    const h = natH * scale;
    posX = (stageW - w) / 2;
    posY = (stageH - h) / 2;
  }

  /* ── Render posisi & skala gambar ── */
  function render() {
    img.style.width  = (natW * scale) + 'px';
    img.style.height = (natH * scale) + 'px';
    img.style.transform = `translate(${posX}px, ${posY}px)`;
  }

  /* ── Batasi gambar supaya lingkaran selalu tertutup penuh ── */
  function clamp() {
    const w = natW * scale;
    const h = natH * scale;
    // batas lingkaran (kotak yang mengelilingi lingkaran di tengah stage)
    const circleLeft = (stageW - CIRCLE) / 2;
    const circleTop  = (stageH - CIRCLE) / 2;
    const circleRight = circleLeft + CIRCLE;
    const circleBottom = circleTop + CIRCLE;

    if (posX > circleLeft) posX = circleLeft;
    if (posY > circleTop)  posY = circleTop;
    if (posX + w < circleRight)  posX = circleRight - w;
    if (posY + h < circleBottom) posY = circleBottom - h;
  }

  /* ── Zoom via slider ── */
  zoom.addEventListener('input', () => {
    const newScale = baseScale * parseFloat(zoom.value);
    // zoom dari titik tengah lingkaran
    const cx = stageW / 2, cy = stageH / 2;
    const ratio = newScale / scale;
    posX = cx - (cx - posX) * ratio;
    posY = cy - (cy - posY) * ratio;
    scale = newScale;
    clamp();
    render();
  });

  /* ── Drag geser gambar ── */
  let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;

  function dragStart(x, y) {
    dragging = true;
    stage.classList.add('dragging');
    startX = x; startY = y;
    origX = posX; origY = posY;
  }
  function dragMove(x, y) {
    if (!dragging) return;
    posX = origX + (x - startX);
    posY = origY + (y - startY);
    clamp();
    render();
  }
  function dragEnd() { dragging = false; stage.classList.remove('dragging'); }

  stage.addEventListener('mousedown', (e) => { e.preventDefault(); dragStart(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => dragMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', dragEnd);

  stage.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; dragStart(t.clientX, t.clientY);
  }, { passive: true });
  stage.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; dragMove(t.clientX, t.clientY);
  }, { passive: true });
  stage.addEventListener('touchend', dragEnd);

  /* ── Simpan → render lingkaran ke canvas ── */
  saveBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');

    // clip lingkaran
    ctx.beginPath();
    ctx.arc(OUTPUT/2, OUTPUT/2, OUTPUT/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();

    // hitung area gambar yang berada di dalam lingkaran mask
    const circleLeft = (stageW - CIRCLE) / 2;
    const circleTop  = (stageH - CIRCLE) / 2;
    // koordinat sumber di gambar asli
    const sx = (circleLeft - posX) / scale;
    const sy = (circleTop  - posY) / scale;
    const sSize = CIRCLE / scale;

    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    saveAvatar(dataUrl);
    applyAvatar(dataUrl);
    closeCrop();
  });

  /* ── Tutup modal ── */
  function closeCrop() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  closeBtn.addEventListener('click', closeCrop);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCrop(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeCrop();
  });

  /* ── Simpan / muat avatar dari state ── */
  function saveAvatar(dataUrl) {
    const state = EQ.load();
    state.user.avatar = dataUrl;
    EQ.save(state);
  }
  function loadSavedAvatar() {
    const state = EQ.load();
    if (state.user.avatar) applyAvatar(state.user.avatar);
  }
  function applyAvatar(dataUrl) {
    const avatarEl = document.getElementById('hpAvatar');
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="${dataUrl}" alt="Foto Profil" style="width:100%;height:100%;object-fit:cover;" />`;
    }
  }
}
