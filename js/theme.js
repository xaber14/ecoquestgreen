/* ============================================================
   EcoQuest — Theme Switcher
   Nature  : tema hijau (default)
   KG Media: tema biru original
   ============================================================ */

const THEME_KEY = 'eq_theme';

const THEMES = {
  nature: {
    dataAttr: null,             // default, tidak butuh data-theme
    bodyBg: '#ECF8E6',
    phoneClass: 'phone--nature',
  },
  'kg-media': {
    dataAttr: 'kg-media',
    bodyBg: '#e9eef2',
    phoneClass: null,
  }
};

/* ── Terapkan tema ke dokumen ── */
function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES['nature'];
  const root  = document.documentElement;
  const phone = document.getElementById('phoneWrap') || document.querySelector('.phone');

  // data-theme pada <html>
  if (theme.dataAttr) {
    root.setAttribute('data-theme', theme.dataAttr);
  } else {
    root.removeAttribute('data-theme');
  }

  // class phone--nature
  if (phone) {
    if (theme.phoneClass) {
      phone.classList.add(theme.phoneClass);
    } else {
      phone.classList.remove('phone--nature');
    }
  }

  // simpan ke localStorage
  localStorage.setItem(THEME_KEY, themeKey);

  // swap logo
  const logo = document.querySelector('.logo-bar img');
  if (logo) {
    logo.src = themeKey === 'kg-media'
      ? 'assets/logo-kg-media.png'
      : 'assets/logo-ecoquest.png';
  }
}

/* ── Load tema saat halaman dibuka ── */
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'nature';
  applyTheme(saved);
  return saved;
}

/* ── Init Theme Switcher (hanya di Homepage) ── */
function initTheme() {
  // apply tema tersimpan saat load
  let currentTheme = loadTheme();

  const btn        = document.getElementById('themeBtn');
  const overlay    = document.getElementById('themeOverlay');
  const loading    = document.getElementById('themeLoading');
  const applyBtn   = document.getElementById('themeApplyBtn');
  const options    = document.querySelectorAll('.theme-option');

  if (!btn || !overlay) return;

  let selectedTheme = currentTheme;

  // ── Tandai opsi yang aktif ──
  function refreshOptions() {
    options.forEach(opt => {
      opt.classList.toggle('is-selected', opt.dataset.theme === selectedTheme);
    });
  }
  refreshOptions();

  // ── Buka bottom sheet ──
  btn.addEventListener('click', () => {
    selectedTheme = localStorage.getItem(THEME_KEY) || 'nature';
    refreshOptions();
    overlay.classList.add('is-open');
  });

  // ── Tutup saat klik backdrop ──
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSheet();
  });

  function closeSheet() {
    overlay.classList.remove('is-open');
  }

  // ── Pilih opsi ──
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      selectedTheme = opt.dataset.theme;
      refreshOptions();
    });
  });

  // ── Terapkan ──
  applyBtn.addEventListener('click', () => {
    if (selectedTheme === (localStorage.getItem(THEME_KEY) || 'nature')) {
      closeSheet();
      return;
    }

    closeSheet();

    // Loading state
    setTimeout(() => {
      loading.classList.add('is-visible');

      setTimeout(() => {
        applyTheme(selectedTheme);
        currentTheme = selectedTheme;

        setTimeout(() => {
          loading.classList.remove('is-visible');
        }, 400);
      }, 900);
    }, 200);
  });
}
