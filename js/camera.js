/* ============================================================
   EcoQuest — WebRTC Camera Modal
   Mendukung webcam (desktop) dan kamera ponsel (HP).
   Dipanggil dari uploadFoto.js saat user klik "Foto Kamera".
   ============================================================ */

function initCamera() {
  const overlay    = document.getElementById('cameraOverlay');
  const video      = document.getElementById('cameraVideo');
  const canvas     = document.getElementById('cameraCanvas');
  const shutterBtn = document.getElementById('shutterBtn');
  const closeBtn   = document.getElementById('cameraClose');
  const viewfinder = document.querySelector('.camera-viewfinder');
  if (!overlay || !video) return;

  let stream = null;

  // Callback yang dipanggil setelah foto berhasil diambil
  // Didaftarkan oleh uploadFoto.js via window.__onCameraCapture
  function onCapture(blob, filename) {
    if (typeof window.__onCameraCapture === 'function') {
      window.__onCameraCapture(blob, filename);
    }
  }

  // ── Buka modal & mulai stream ──
  async function openCamera() {
    overlay.classList.add('is-open');
    clearError();
    await startStream();
  }

  async function startStream() {
    try {
      // Coba kamera belakang dulu (HP), fallback ke webcam (desktop)
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      video.hidden = false;
      clearError();
    } catch (err) {
      console.warn('Camera error:', err.name, err.message);
      showError(err);
    }
  }

  function showError(err) {
    video.hidden = true;

    // hapus error lama kalau ada
    let errEl = overlay.querySelector('.camera-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'camera-error';
      viewfinder.appendChild(errEl);
    }

    let msg = 'Tidak dapat mengakses kamera.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      msg = 'Akses kamera ditolak.\nSilakan izinkan akses kamera di pengaturan browser lalu coba lagi.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      msg = 'Kamera tidak ditemukan.\nPastikan perangkat kamu memiliki kamera yang terhubung.';
    } else if (err.name === 'NotReadableError') {
      msg = 'Kamera sedang digunakan oleh aplikasi lain.\nTutup aplikasi lain lalu coba lagi.';
    }

    errEl.innerHTML = `
      <i class="ph ph-camera-slash"></i>
      <span>${msg.replace(/\n/g, '<br>')}</span>
      <button class="camera-error-retry" id="cameraRetry">Coba Lagi</button>
    `;
    errEl.classList.add('is-visible');
    document.getElementById('cameraRetry')?.addEventListener('click', () => {
      errEl.classList.remove('is-visible');
      startStream();
    });
  }

  function clearError() {
    const errEl = overlay.querySelector('.camera-error');
    if (errEl) errEl.classList.remove('is-visible');
    video.hidden = false;
  }

  // ── Stop stream & tutup modal ──
  function closeCamera() {
    stopStream();
    overlay.classList.remove('is-open');
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    video.srcObject = null;
  }

  // ── Ambil foto (shutter) ──
  function capturePhoto() {
    if (!stream) return;

    // flash effect
    viewfinder.classList.add('flash');
    viewfinder.addEventListener('animationend', () => {
      viewfinder.classList.remove('flash');
    }, { once: true });

    // gambar frame ke canvas
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // konversi ke Blob JPEG
    canvas.toBlob((blob) => {
      if (!blob) return;
      const now = new Date();
      const filename = `foto_misi_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.jpg`;

      closeCamera();
      onCapture(blob, filename);
    }, 'image/jpeg', 0.9);
  }

  // ── Event listeners ──
  shutterBtn.addEventListener('click', capturePhoto);
  closeBtn.addEventListener('click', closeCamera);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCamera();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeCamera();
  });

  // expose openCamera supaya bisa dipanggil dari uploadFoto.js
  window.__openCamera = openCamera;
}
