/* ============================================================
   EcoQuest — State Management (localStorage)
   Semua halaman import file ini untuk baca/tulis data game
   ============================================================ */

const EQ = (() => {

  const KEY = 'ecoquest_state';

  // EXP yang dibutuhkan untuk naik ke level berikutnya
  const LEVEL_THRESHOLDS = [10, 25, 50, 100, 200, 350, 550, 800, 1100, 1500];

  // Data default (new user)
  const DEFAULT_STATE = {
    user: {
      name:  'Leon Kennedy',
      rank:  'Rookie',
      level: 0,
      exp:   0,
      poinMinggu: 0,
      poinTotal:  0,
    },
    missions: [
      { id: 1, title: 'Pilah Sampah',    difficulty: 'medium', pts: 20, exp: 20, status: 'open' },
      { id: 2, title: 'Save Energy',     difficulty: 'easy',   pts: 5,  exp: 5,  status: 'open' },
      { id: 3, title: 'No Gorengan',     difficulty: 'easy',   pts: 5,  exp: 5,  status: 'open' },
      { id: 4, title: 'Running at GBK',  difficulty: 'medium', pts: 25, exp: 20, status: 'open' },
      { id: 5, title: 'Bike to Work',    difficulty: 'hard',   pts: 40, exp: 40, status: 'open' },
    ],
    // Timestamp mulai periode (Senin terakhir 00:00)
    periodStart: null,
    // Reset tiap Senin
    lastResetWeek: null,
  };

  /* ── Baca & Tulis ── */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return deepClone(DEFAULT_STATE);
      const saved = JSON.parse(raw);
      // merge: kalau ada field baru di DEFAULT_STATE yang belum ada di saved
      return deepMerge(deepClone(DEFAULT_STATE), saved);
    } catch { return deepClone(DEFAULT_STATE); }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(KEY);
    return deepClone(DEFAULT_STATE);
  }

  /* ── Level helpers ── */
  function expForNextLevel(level) {
    return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  }

  function expProgress(state) {
    const needed = expForNextLevel(state.user.level);
    return { current: state.user.exp, needed, pct: Math.min(state.user.exp / needed, 1) };
  }

  /* ── Selesaikan misi ── */
  function completeMission(missionId) {
    const state = load();
    const mission = state.missions.find(m => m.id === missionId);
    if (!mission || mission.status === 'done') return { state, levelUp: false, alreadyDone: true };

    mission.status = 'done';
    mission.completedAt = Date.now();

    // tambah poin
    state.user.poinMinggu += mission.pts;
    state.user.poinTotal  += mission.pts;

    // tambah EXP & cek level up
    state.user.exp += mission.exp;
    let levelUp = false;
    while (state.user.exp >= expForNextLevel(state.user.level)) {
      state.user.exp   -= expForNextLevel(state.user.level);
      state.user.level += 1;
      levelUp = true;
      // update rank
      state.user.rank = getRank(state.user.level);
    }

    save(state);
    return { state, mission, levelUp, alreadyDone: false };
  }

  function getRank(level) {
    if (level < 2)  return 'Rookie';
    if (level < 5)  return 'Explorer';
    if (level < 10) return 'Warrior';
    if (level < 20) return 'Champion';
    return 'Legend';
  }

  /* ── Periode waktu (Senin–Jumat) ── */
  function getPeriodInfo() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun,1=Mon,...,6=Sat

    // Cari Senin minggu ini (00:00)
    const diffToMon = (day === 0) ? -6 : 1 - day;
    let monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);

    // Jumat = Senin + 4 hari, jam 23:59:59
    let friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    // Jika sudah lewat Jumat 23:59 (weekend), roll ke periode minggu DEPAN
    if (now > friday) {
      monday = new Date(monday); monday.setDate(monday.getDate() + 7);
      friday = new Date(friday); friday.setDate(friday.getDate() + 7);
    }

    const totalMs = friday - monday;          // durasi penuh (~120 jam)

    // msLeft selalu dihitung dari WAKTU SEKARANG ke deadline Jumat,
    // jadi angkanya bergerak turun tiap detik (live) kapan pun dibuka.
    const msLeft = friday - now;

    // Bar: proporsi sisa waktu vs durasi penuh, dibatasi 0–100%.
    // Saat weekend (sisa > 120 jam) bar tetap penuh 100%.
    const pctRemaining = Math.min(Math.max(msLeft / totalMs, 0), 1);
    const pct = 1 - pctRemaining;             // proporsi waktu terpakai

    return { monday, friday, msLeft: Math.max(msLeft, 0), pct, isActive: true };
  }

  function formatCountdown(ms) {
    if (ms <= 0) return '0 Jam 0 Menit';
    const totalSec = Math.floor(ms / 1000);
    const hours    = Math.floor(totalSec / 3600);
    const minutes  = Math.floor((totalSec % 3600) / 60);
    const seconds  = totalSec % 60;
    if (hours >= 1) return `${hours} Jam ${minutes} Menit`;
    if (minutes >= 1) return `${minutes} Menit ${seconds} Detik`;
    return `${seconds} Detik`;
  }

  function formatDate(date) {
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember'];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  }

  /* ── Weekly reset ── */
  function checkWeeklyReset() {
    const state = load();
    const { monday } = getPeriodInfo();
    const mondayKey = monday.toISOString().slice(0, 10);

    if (state.lastResetWeek !== mondayKey) {
      // reset misi & poin mingguan
      state.missions.forEach(m => { m.status = 'open'; delete m.completedAt; });
      state.user.poinMinggu = 0;
      state.lastResetWeek = mondayKey;
      save(state);
    }
    return load();
  }

  /* ── Statistik misi ── */
  function missionStats(state) {
    const done = state.missions.filter(m => m.status === 'done').length;
    const total = state.missions.length;
    return { done, remaining: total - done, total };
  }

  /* ── Utils ── */
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (Array.isArray(source[key])) {
        // untuk array missions: update status dari saved ke default
        if (key === 'missions' && Array.isArray(target[key])) {
          source[key].forEach(sm => {
            const tm = target[key].find(m => m.id === sm.id);
            if (tm) Object.assign(tm, sm);
          });
        } else {
          target[key] = source[key];
        }
      } else if (source[key] && typeof source[key] === 'object') {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  return {
    load, save, reset,
    completeMission,
    expForNextLevel, expProgress,
    getRank, missionStats,
    getPeriodInfo, formatCountdown, formatDate,
    checkWeeklyReset,
    LEVEL_THRESHOLDS,
  };
})();
