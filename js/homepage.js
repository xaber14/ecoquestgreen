/* ============================================================
   EcoQuest — Homepage UI renderer
   ============================================================ */

function initHomepage() {
  renderHomepage();
  initResetProgress();
}

function initResetProgress() {
  const btn        = document.getElementById('resetProgressBtn');
  const overlay    = document.getElementById('resetOverlay');
  const confirmBtn = document.getElementById('resetConfirmBtn');
  const cancelBtn  = document.getElementById('resetCancelBtn');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    overlay.classList.add('is-open');
  });

  cancelBtn.addEventListener('click', () => {
    overlay.classList.remove('is-open');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('is-open');
  });

  confirmBtn.addEventListener('click', () => {
    EQ.reset();
    overlay.classList.remove('is-open');
    // render ulang homepage dengan state kosong + animasi singkat
    setTimeout(() => {
      renderHomepage();
      // flash tipis untuk feedback visual
      document.body.style.opacity = '0.5';
      setTimeout(() => { document.body.style.opacity = '1'; }, 200);
    }, 150);
  });
}

function renderHomepage() {
  const state = EQ.checkWeeklyReset();
  const { current, needed, pct } = EQ.expProgress(state);
  const stats = EQ.missionStats(state);

  // ── Bio ──
  document.getElementById('hpName').textContent  = state.user.name;
  document.getElementById('hpRank').textContent  = state.user.rank;
  document.getElementById('hpLevel').textContent = 'Lv.' + state.user.level;

  // ── EXP bar ──
  document.getElementById('hpExp').textContent  = current + ' EXP';
  document.getElementById('hpExpNext').innerHTML = `<strong>${needed}</strong> exp untuk naik level`;
  const bar = document.getElementById('hpExpBar');
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 1s ease';
    bar.style.width = (pct * 100) + '%';
  });

  // ── Poin ──
  document.getElementById('hpPoinMinggu').textContent = state.user.poinMinggu + ' pts';
  document.getElementById('hpPoinTotal').textContent  = state.user.poinTotal;

  // ── Misi counts ──
  document.getElementById('hpMisiSelesai').textContent = stats.done + ' Selesai';
  document.getElementById('hpMisiBelum').textContent   = stats.remaining + ' Belum';

  // ── Step circles + konektor ──
  const stepsEl = document.getElementById('hpMissionSteps');
  if (stepsEl) {
    const missions = state.missions;
    stepsEl.innerHTML = missions.map((m, i) => {
      const isDone = m.status === 'done';
      // konektor antara step ini dan berikutnya — biru kalau KEDUA misi selesai
      const nextDone = missions[i + 1] && missions[i + 1].status === 'done';
      const connectorDone = isDone && nextDone;
      const connector = i < missions.length - 1
        ? `<div class="step-connector${connectorDone ? ' done' : ''}"></div>`
        : '';

      return `
        <div class="step-item-wrap">
          <div class="step-circle${isDone ? ' done' : ''}">
            ${isDone ? '' : `<span class="step-num">${m.id}</span>`}
          </div>
          ${connector}
        </div>`;
    }).join('');
  }
}
