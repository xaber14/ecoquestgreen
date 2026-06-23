/* ============================================================
   EcoQuest — Upload Foto Misi flow
   ============================================================ */

function initUploadFoto() {
  const ambilBlock    = document.getElementById('ambilFotoBlock');
  const btnGallery    = document.getElementById('btnGallery');
  const btnCamera     = document.getElementById('btnCamera');
  const inputGallery  = document.getElementById('inputGallery');
  const preview       = document.getElementById('uploadedPreview');
  const thumb         = document.getElementById('uploadedThumb');
  const nameEl        = document.getElementById('uploadedName');
  const removeBtn     = document.getElementById('uploadedRemove');
  const cta           = document.getElementById('sheetCta');
  const submitBtn     = document.getElementById('submitFotoBtn');
  const popupOverlay  = document.getElementById('popupOverlay');
  const popupImage    = document.getElementById('popupImage');
  const popupTime     = document.getElementById('popupTime');
  const popupContinue = document.getElementById('popupContinue');
  if (!ambilBlock) return;

  const MAX_SIZE = 3 * 1024 * 1024;
  let currentObjectUrl = null;

  function handleFile(file) {
    if (!file) return;
    if (file.size > MAX_SIZE) { alert('Ukuran foto melebihi 3MB.'); return; }
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    thumb.src = currentObjectUrl;
    popupImage.src = currentObjectUrl;
    nameEl.textContent = file.name;
    ambilBlock.classList.add('has-upload');
    preview.classList.add('is-visible');
    cta.classList.add('is-visible');
  }

  function handleBlob(blob, filename) {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(blob);
    thumb.src = currentObjectUrl;
    popupImage.src = currentObjectUrl;
    nameEl.textContent = filename;
    ambilBlock.classList.add('has-upload');
    preview.classList.add('is-visible');
    cta.classList.add('is-visible');
  }

  function resetUpload() {
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
    thumb.src = ''; popupImage.src = ''; inputGallery.value = '';
    ambilBlock.classList.remove('has-upload');
    preview.classList.remove('is-visible');
    cta.classList.remove('is-visible');
  }

  btnGallery.addEventListener('click', () => inputGallery.click());
  inputGallery.addEventListener('change', (e) => handleFile(e.target.files[0]));

  btnCamera.addEventListener('click', () => {
    if (typeof window.__openCamera === 'function') {
      window.__openCamera();
    } else {
      const tmp = document.createElement('input');
      tmp.type = 'file'; tmp.accept = 'image/*'; tmp.capture = 'environment';
      tmp.addEventListener('change', (e) => handleFile(e.target.files[0]));
      tmp.click();
    }
  });

  window.__onCameraCapture = handleBlob;
  removeBtn.addEventListener('click', resetUpload);

  submitBtn.addEventListener('click', () => {
    // ── Selesaikan misi via state ──
    const missionId = getActiveMissionId();
    if (missionId && typeof onMissionSubmitted === 'function') {
      onMissionSubmitted(missionId);
    }

    popupTime.textContent = 'Telah disubmit pada ' + formatNow();
    popupOverlay.classList.add('is-open');
  });

  popupContinue.addEventListener('click', () => {
    popupOverlay.classList.remove('is-open');
    const sheetOverlay = document.getElementById('sheetOverlay');
    if (sheetOverlay) sheetOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    resetUpload();
  });

  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) popupOverlay.classList.remove('is-open');
  });

  document.querySelectorAll('.mission-card').forEach(card => {
    card.addEventListener('click', () => setTimeout(resetUpload, 0));
  });

  function formatNow() {
    const d = new Date();
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} WIB`;
  }
}
