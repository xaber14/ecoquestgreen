/* ============================================================
   EcoQuest — Leaderboard switch (Mingguan / Bulanan)
   ============================================================ */

// Data dummy untuk dua kategori
const LEADERBOARD_DATA = {
  weekly: {
    posisi: { rank: 14, pts: 400, need: 501 },
    podium: [
      { place: 2, name: 'Tasya', pts: 1270 },
      { place: 1, name: 'Bayu',  pts: 1590 },
      { place: 3, name: 'Andi',  pts: 900 }
    ],
    rest: [
      { rank: 4,  name: 'Arga H', pts: 250 },
      { rank: 5,  name: 'Arga',   pts: 250 },
      { rank: 6,  name: 'Arga',   pts: 250 },
      { rank: 7,  name: 'Arga',   pts: 250 },
      { rank: 8,  name: 'Arga',   pts: 250 },
      { rank: 9,  name: 'Arga',   pts: 250 },
      { rank: 10, name: 'Arga',   pts: 250 }
    ],
    periode: '6 - 10 April 2026',
    reset: 'Setiap Senin, 00:00 WIB',
    note: 'Weekly Knights'
  },
  monthly: {
    posisi: { rank: 8, pts: 1200, need: 901 },
    podium: [
      { place: 2, name: 'Rani',  pts: 3200 },
      { place: 1, name: 'Dimas', pts: 4100 },
      { place: 3, name: 'Sinta', pts: 2750 }
    ],
    rest: [
      { rank: 4,  name: 'Bagus',  pts: 1800 },
      { rank: 5,  name: 'Citra',  pts: 1650 },
      { rank: 6,  name: 'Dewi',   pts: 1500 },
      { rank: 7,  name: 'Eka',    pts: 1350 },
      { rank: 8,  name: 'Fajar',  pts: 1200 },
      { rank: 9,  name: 'Gita',   pts: 1100 },
      { rank: 10, name: 'Hadi',   pts: 1000 }
    ],
    periode: '1 - 30 April 2026',
    reset: 'Awal bulan, 00:00 WIB',
    note: 'The 3 Barons'
  }
};

function initial(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

function renderLeaderboard(cat) {
  const d = LEADERBOARD_DATA[cat];
  if (!d) return;

  // Posisi kamu
  document.getElementById('posisiRank').textContent = d.posisi.rank;
  document.getElementById('posisiPts').textContent = d.posisi.pts + ' Pts';
  document.getElementById('posisiNeed').innerHTML =
    `Butuh <strong>${d.posisi.need} Pts</strong> untuk naik podium`;

  // Podium (urutan tampil: 2 - 1 - 3)
  const order = [d.podium.find(p=>p.place===2), d.podium.find(p=>p.place===1), d.podium.find(p=>p.place===3)];
  ['Two','One','Three'].forEach((suffix, i) => {
    const p = order[i];
    document.getElementById('podiumPts' + suffix).textContent = p.pts + ' Pts';
    document.getElementById('podiumName' + suffix).textContent = p.name;
  });

  // Ranking list 4-10
  const list = document.getElementById('rankList');
  list.innerHTML = d.rest.map(r => `
    <div class="rank-item">
      <div class="rank-num">${r.rank}</div>
      <div class="rank-avatar">${initial(r.name)}</div>
      <div class="rank-name">${r.name}</div>
      <div class="rank-pts">
        <div class="rank-pts-label">Poin</div>
        <div class="rank-pts-val">${r.pts} Pts</div>
      </div>
    </div>
  `).join('');

  // Ketentuan
  document.getElementById('periodeVal').textContent = d.periode;
  document.getElementById('resetVal').textContent = d.reset;
  document.getElementById('noteText').innerHTML =
    `Pemenang <strong>${d.note}</strong> akan diumumkan pada hari Jumat bulan yang akan datang`;
}

function initLeaderboard() {
  const btns = document.querySelectorAll('.lb-switch-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLeaderboard(btn.dataset.cat);
    });
  });

  // initial render — default Mingguan (weekly)
  renderLeaderboard('weekly');
}
