/* ============================================================
   EcoQuest — Mission Page renderer
   ============================================================ */

let countdownTimer = null;

function initMisiPage() {
  EQ.checkWeeklyReset();
  renderMisiPage();
  startCountdown();
}

/* ── Render semua elemen misi ── */
function renderMisiPage() {
  const state = EQ.load();
  const stats = EQ.missionStats(state);

  // counter
  document.getElementById('misiSelesai').textContent  = stats.done;
  document.getElementById('misiTersisa').textContent  = stats.remaining;

  // render tiap card
  state.missions.forEach(m => renderMissionCard(m));
}

function renderMissionCard(mission) {
  const card = document.querySelector(`.mission-card[data-mission="${mission.id}"]`);
  if (!card) return;

  const isDone = mission.status === 'done';
  card.querySelector('.mc-done-overlay')?.remove();
  card.classList.toggle('is-done', isDone);

  // Thumbnail: foto submission jika ada, fallback ke emoji
  const thumbEl = card.querySelector('.mc-thumb');
  if (thumbEl) {
    if (isDone && mission.photo) {
      thumbEl.innerHTML = `<img src="${mission.photo}" alt="Foto Misi"
        style="width:100%;height:100%;object-fit:cover;border-radius:8px;display:block;" />`;
    } else {
      // pastikan kembali ke emoji jika reset
      if (!thumbEl.querySelector('img')) {/* biarkan emoji tetap ada */}
    }
  }

  if (isDone) {
    // Tidak bisa diklik lagi
    card.style.pointerEvents = 'none';
    card.style.cursor = 'default';

    // Badge Selesai
    const badge = document.createElement('div');
    badge.className = 'mc-done-overlay';
    badge.innerHTML = `
      <div class="mc-done-badge">
        <i class="ph ph-check-circle"></i>
        <span>Selesai</span>
      </div>`;
    card.appendChild(badge);
  } else {
    card.style.pointerEvents = '';
    card.style.cursor = 'pointer';
  }
}

/* ── Countdown sisa waktu ── */
function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);

  function tick() {
    const { msLeft, friday, pct } = EQ.getPeriodInfo();
    const el  = document.getElementById('sisaWaktuVal');
    const bar = document.getElementById('sisaWaktuBar');
    const sub = document.getElementById('sisaWaktuSub');

    // Bar: mulai full (100%) lalu mengecil ke kiri seiring waktu habis
    const barPct = (1 - pct) * 100;
    if (bar) {
      // transisi linear 1 detik → bar mengalir mulus antar tiap update detik
      bar.style.transition = 'width 1s linear';
      bar.style.width = barPct + '%';
    }

    if (el) el.innerHTML = formatCountdownWithSeconds(msLeft);
    if (sub) {
      sub.innerHTML = `Akan berakhir pada <strong>${EQ.formatDate(friday)}</strong>, pukul <strong>23:59 WIB</strong>`;
    }
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

/* ── Dipanggil setelah submit foto berhasil ── */
function onMissionSubmitted(missionId) {
  const { state, mission, levelUp, alreadyDone } = EQ.completeMission(missionId);
  if (alreadyDone) return;

  // update card
  renderMissionCard(mission);

  // update counter
  const stats = EQ.missionStats(state);
  document.getElementById('misiSelesai').textContent = stats.done;
  document.getElementById('misiTersisa').textContent = stats.remaining;

  // update estimasi bonus time
  updateTimeBonus(state);

  // kalau level up → tampilkan popup celebrasi
  if (levelUp) showLevelUpPopup(state.user);
}

/* ── Format countdown: angka di atas, satuan di bawah ── */
function formatCountdownWithSeconds(ms) {
  const totalSec = Math.max(Math.floor(ms / 1000), 0);
  const hours   = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const seg = (num, unit) => `
    <span class="cd-seg">
      <span class="cd-num">${String(num).padStart(2, '0')}</span>
      <span class="cd-unit">${unit}</span>
    </span>`;

  // selalu tampilkan jam, menit, detik
  return seg(hours, 'Jam') + seg(minutes, 'Menit') + seg(seconds, 'Detik');
}

function updateTimeBonus(state) {
  const { msLeft } = EQ.getPeriodInfo();
  const hoursLeft = msLeft / 3_600_000;
  // Semakin cepat selesai, bonus lebih besar
  const bonus = hoursLeft > 30 ? 50 : hoursLeft > 15 ? 30 : hoursLeft > 5 ? 20 : 10;
  const el = document.getElementById('timeBonusVal');
  if (el) el.textContent = '+' + bonus + ' Pts';
}

/* ── Level-Up Popup ── */
function showLevelUpPopup(user) {
  const overlay = document.getElementById('levelupOverlay');
  if (!overlay) return;

  // Isi konten
  document.getElementById('levelupBadge').textContent = 'Lv.' + user.level;
  document.getElementById('levelupTitle').textContent  = 'Selamat, kamu naik ke Level ' + user.level + '!';
  document.getElementById('levelupRank').textContent   = user.rank;
  document.getElementById('levelupPts').textContent    = user.poinTotal + ' Pts';
  document.getElementById('levelupExp').textContent    = user.exp + ' EXP';

  // Tampilkan overlay
  overlay.classList.add('is-open');

  // Jalankan efek setelah modal terbuka
  setTimeout(() => {
    spawnConfetti();
    spawnStars();
  }, 120);

  // Tombol tutup
  document.getElementById('levelupClose').onclick = closeLevelUpPopup;

  // Klik backdrop juga tutup
  overlay.addEventListener('click', function onBg(e) {
    if (e.target === overlay) { closeLevelUpPopup(); overlay.removeEventListener('click', onBg); }
  });
}

function closeLevelUpPopup() {
  const overlay = document.getElementById('levelupOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  // Bersihkan confetti setelah animasi selesai
  setTimeout(() => {
    const conf = document.getElementById('levelupConfetti');
    const stars = document.getElementById('levelupStars');
    if (conf) conf.innerHTML = '';
    if (stars) stars.innerHTML = '';
  }, 400);
}

function spawnConfetti() {
  const container = document.getElementById('levelupConfetti');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#0a5388', '#429cdd', '#e55225', '#fbbf24', '#34d399', '#a78bfa'];
  const count  = 28;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';

    const color    = colors[Math.floor(Math.random() * colors.length)];
    const left     = Math.random() * 100;
    const delay    = Math.random() * 0.5;
    const duration = 0.9 + Math.random() * 0.8;
    const size     = 6 + Math.random() * 6;
    const isCircle = Math.random() > 0.5;

    el.style.cssText = `
      left: ${left}%;
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${isCircle ? '50%' : '2px'};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(el);
  }
}

function spawnStars() {
  const container = document.getElementById('levelupStars');
  if (!container) return;
  container.innerHTML = '';

  const emojis    = ['⭐', '✨', '🌟', '💫'];
  const positions = [
    { top: 10, left: 10 }, { top: 5, left: 85 },
    { top: 35, left: 0  }, { top: 40, left: 95 },
    { top: 0,  left: 50 }, { top: 20, left: 30 },
    { top: 15, left: 70 },
  ];

  positions.forEach((pos, i) => {
    const el = document.createElement('div');
    el.className = 'star-burst';
    el.textContent = emojis[i % emojis.length];

    const angle    = (Math.random() - 0.5) * 60;
    const distance = 30 + Math.random() * 50;
    const tx = Math.cos((angle * Math.PI) / 180) * distance;
    const ty = -(Math.abs(Math.sin((angle * Math.PI) / 180)) * distance + 20);

    el.style.cssText = `
      top: ${pos.top}%;
      left: ${pos.left}%;
      animation-delay: ${0.1 + i * 0.06}s;
      animation-duration: 0.8s;
    `;
    // override keyframe end position per element
    el.style.setProperty('--tx', tx + 'px');
    el.style.setProperty('--ty', ty + 'px');
    el.style.animation = `star-pop 0.8s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s forwards`;

    container.appendChild(el);

    // manual keyframe karena CSS var di @keyframes tidak selalu didukung
    el.animate([
      { transform: 'translate(0,0) scale(0)', opacity: 0 },
      { transform: `translate(${tx}px, ${ty}px) scale(1.2)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${tx * 1.3}px, ${ty * 1.3}px) scale(0.8)`, opacity: 0 },
    ], {
      duration: 800,
      delay: (0.1 + i * 0.06) * 1000,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    });
  });
}
