/* GENESIS 22: App Shell navigation, Home dashboard, i18n, Notifications & View Router */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICONS = {
    home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
    academic: '<path d="M2 5a2 2 0 012-2h6a3 3 0 013 3v14a2 2 0 00-2-2H4a2 2 0 01-2-2z"/><path d="M22 5a2 2 0 00-2-2h-6a3 3 0 00-3 3v14a2 2 0 012-2h7a2 2 0 002-2z"/>',
    board: '<path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
    library: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
    lab: '<path d="M9 3h6"/><path d="M10 3v6L4.5 18.5A2 2 0 006.3 21.5h11.4a2 2 0 001.8-3L14 9V3"/>',
    dnacard: '<path d="M7 3c0 6 10 6 10 12v6M17 3c0 6-10 6-10 12v6M7 7h10M8 17h8"/>',
    teachers: '<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    community: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    gallery: '<polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.5 5.8 21 7 14 2 9.3 9 8.5 12 2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.79 1 1.44 1.07H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>'
  };

  const NAV = [
    { id: 'home', en: 'Home', bn: 'হোম' },
    { id: 'academic', en: 'Academic Tools', bn: 'একাডেমিক টুলস' },
    { id: 'board', en: 'Notice Board', bn: 'নোটিস বোর্ড' },
    { id: 'library', en: 'Library', bn: 'লাইব্রেরি' },
    { id: 'lab', en: 'Virtual Lab', bn: 'ভার্চুয়াল ল্যাব' },
    { id: 'dnacard', en: 'DNA Card', bn: 'DNA কার্ড' },
    { id: 'teachers', en: 'Teachers', bn: 'শিক্ষকবৃন্দ' },
    { id: 'community', en: 'Community', bn: 'কমিউনিটি' },
    { id: 'gallery', en: 'Gallery', bn: 'গ্যালারি' },
    { id: 'settings', en: 'Settings', bn: 'সেটিংস' }
  ];

  const ACAD_TABS = [
    { id: 'syllabus', en: 'Syllabus', bn: 'সিলেবাস' },
    { id: 'routine', en: 'Class routine', bn: 'ক্লাস রুটিন' },
    { id: 'calendar', en: 'Calendar', bn: 'ক্যালেন্ডার' },
    { id: 'hot', en: 'Hot topics', bn: 'হট টপিক' },
    { id: 'questions', en: 'Question bank', bn: 'প্রশ্নব্যাংক' },
    { id: 'exam', en: 'Exams & progress', bn: 'পরীক্ষা ও অগ্রগতি' },
    { id: 'planner', en: 'My planner', bn: 'আমার প্ল্যানার' },
    { id: 'gpa', en: 'GPA calculator', bn: 'GPA ক্যালকুলেটর' },
    { id: 'program', en: 'Program', bn: 'প্রোগ্রাম' }
  ];

  const LAB_TABS = [
    { id: 'vlab', en: 'Virtual lab', bn: 'ভার্চুয়াল ল্যাব' },
    { id: 'biotools', en: 'Biotech tools', bn: 'বায়োটেক টুলবক্স' }
  ];

  let lang = 'en';
  try { lang = JSON.parse(localStorage.getItem('geb_lang')) || 'en'; } catch (_) {}
  if (lang !== 'en' && lang !== 'bn') lang = 'en';

  let currentView = 'home';
  let currentAcad = 'syllabus';
  let currentLab = 'vlab';

  function initBrands() {
    const logo = $('#brandLogo');
    if (logo && !logo.querySelector('img')) {
      logo.innerHTML = '<img src="/img/genesis22-avatar.jpg" width="46" height="46" alt="">';
    }
    const av = $('#avatarBtn');
    if (av && !av.querySelector('img')) {
      av.innerHTML = '<img src="/img/genesis22-avatar.jpg" width="40" height="40" alt="Profile">';
      av.addEventListener('click', () => navigate('settings'));
    }
  }

  function buildHomeView() {
    const main = $('#main');
    if (!main || $('#v-home')) return;

    const todayIso = new Date().toISOString().slice(0, 10);
    const evs = (window.GEBCal && window.GEBCal.events ? window.GEBCal.events : [])
      .filter(e => e.e >= todayIso)
      .slice(0, 4);

    const fmtDate = iso => {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const qaItems = [
      { href: '#routine', icon: 'academic', en: 'Class routine', bn: 'ক্লাস রুটিন', subEn: 'Weekly routine, next class', subBn: 'সাপ্তাহিক রুটিন ও পরের ক্লাস' },
      { href: '#library', icon: 'library', en: 'Library', bn: 'লাইব্রেরি', subEn: 'Lectures, books and notes by course', subBn: 'কোর্স অনুযায়ী লেকচার ও নোট' },
      { href: '#board', icon: 'board', en: 'Notice board', bn: 'নোটিস বোর্ড', subEn: 'Latest notices and updates', subBn: 'সাম্প্রতিক নোটিস ও আপডেট' },
      { href: '#syllabus', icon: 'academic', en: 'Syllabus', bn: 'সিলেবাস', subEn: 'Courses and credits by semester', subBn: 'সেমিস্টার অনুযায়ী কোর্স তালিকা' },
      { href: '#teachers', icon: 'teachers', en: 'Teachers', bn: 'শিক্ষকবৃন্দ', subEn: 'Contacts of all faculty members', subBn: 'বিভাগীয় যোগাযোগ তথ্য' },
      { href: '#gallery', icon: 'gallery', en: 'Gallery', bn: 'গ্যালারি', subEn: 'Moments from our batch', subBn: 'ব্যাচের ছবি ও স্মৃতি' }
    ];

    const vHome = document.createElement('div');
    vHome.id = 'v-home';
    vHome.innerHTML = `<div id="dash" class="dash">
      <section class="g-hero" aria-label="GENESIS 22">
        <div class="g-tx">
          <svg class="botany" viewBox="0 0 600 440" aria-hidden="true">
            <g class="ln"><path d="M40 380 Q180 260 320 280 T560 100"/><path d="M80 420 Q220 220 380 250 T590 180"/></g>
            <g class="rg"><circle cx="480" cy="320" r="70"/><circle cx="480" cy="320" r="48"/></g>
          </svg>
          <h1><span>GENES</span><svg class="tube" viewBox="0 0 28 48" aria-hidden="true"><path d="M9 4h10M11 4v14l-5 19a4 4 0 003.8 5h8.4a4 4 0 003.8-5l-5-19V4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 29h12l2 8a2 2 0 01-2 3H8a2 2 0 01-2-3z" fill="var(--glow)" opacity=".85"/></svg><span>S</span><span class="g-22">22</span></h1>
          <p class="g-b">SUST 36th Batch</p>
          <p class="g-d">Department of Genetic Engineering and Biotechnology</p>
          <div class="g-cta">
            <a class="go" href="#academic" data-i18n-key="cta1">Open academic tools</a>
            <a class="go sec" href="#gallery" data-i18n-key="cta2">Batch gallery</a>
          </div>
        </div>
        <figure class="g-ph">
          <img src="/img/batch-photo.jpg" alt="GENESIS 22, SUST 36th Batch, group photo">
        </figure>
      </section>
      <section class="g-qa" aria-label="Quick access">
        <h2 class="panel-h" data-i18n-key="qa">Quick access</h2>
        <div class="qgrid2">
          ${qaItems.map(q => `<a class="qt" href="${q.href}">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[q.icon]}</svg>
            <span><b data-en="${esc(q.en)}" data-bn="${esc(q.bn)}">${esc(lang === 'bn' ? q.bn : q.en)}</b><small data-en="${esc(q.subEn)}" data-bn="${esc(q.subBn)}">${esc(lang === 'bn' ? q.subBn : q.subEn)}</small></span>
          </a>`).join('')}
        </div>
      </section>
      <aside class="g-ev" aria-label="Upcoming holidays">
        <h2 class="panel-h" data-i18n-key="hol">Upcoming holidays</h2>
        <ul class="evl">${evs.map(e => `<li><div><b>${esc(e.t)}</b><span>${e.s === e.e ? fmtDate(e.s) : `${fmtDate(e.s)} – ${fmtDate(e.e)}`}</span></div></li>`).join('')}</ul>
        <a class="vall" href="#calendar" data-i18n-key="fcal">Full calendar</a>
      </aside>
    </div>`;

    main.insertBefore(vHome, main.firstChild);

    // Build Academic subtabs bar
    const acadBar = document.createElement('div');
    acadBar.id = 'acadTabs';
    acadBar.className = 'subtabs';
    acadBar.setAttribute('role', 'tablist');
    acadBar.innerHTML = ACAD_TABS.map(t => `<button type="button" role="tab" data-acad="${t.id}" aria-selected="${t.id === currentAcad}">${esc(lang === 'bn' ? t.bn : t.en)}</button>`).join('');
    const syl = $('#syllabus');
    if (syl) main.insertBefore(acadBar, syl);

    // Build Lab subtabs bar
    const labBar = document.createElement('div');
    labBar.id = 'labTabs';
    labBar.className = 'subtabs';
    labBar.setAttribute('role', 'tablist');
    labBar.innerHTML = LAB_TABS.map(t => `<button type="button" role="tab" data-lab="${t.id}" aria-selected="${t.id === currentLab}">${esc(lang === 'bn' ? t.bn : t.en)}</button>`).join('');
    const bt = $('#biotools');
    if (bt) main.insertBefore(labBar, bt);

    // Build Settings section
    if (!$('#settings')) {
      const sec = document.createElement('section');
      sec.className = 'blk';
      sec.id = 'settings';
      sec.innerHTML = `<div class="wrap"><div class="sh"><div><h2>সেটিংস</h2><p>থিম, ভাষা ও ব্রাউজারে সেভ করা লোকাল ডেটা নিয়ন্ত্রণ করুন।</p></div></div>
        <div class="panel"><h3>পছন্দসমূহ</h3>
          <div class="frow">
            <button type="button" class="btn ghost sm" id="setThemeBtn">থিম বদলান (Light / Dark)</button>
            <button type="button" class="btn ghost sm" id="setLangBtn">ভাষা বদলান (EN / বাংলা)</button>
          </div>
        </div></div>`;
      main.appendChild(sec);
    }

    acadBar.addEventListener('click', e => {
      const b = e.target.closest('[data-acad]');
      if (b) { currentAcad = b.dataset.acad; location.hash = '#' + currentAcad; }
    });
    labBar.addEventListener('click', e => {
      const b = e.target.closest('[data-lab]');
      if (b) { currentLab = b.dataset.lab; location.hash = '#' + currentLab; }
    });
  }

  function renderNav() {
    const nav = $('#snav');
    if (!nav) return;
    nav.innerHTML = NAV.map(item => `<a href="#${item.id}" class="${currentView === item.id ? 'on' : ''}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[item.id]}</svg>
      <span>${esc(lang === 'bn' ? item.bn : item.en)}</span>
    </a>`).join('');
  }

  function applyLang(l) {
    lang = l === 'bn' ? 'bn' : 'en';
    try { localStorage.setItem('geb_lang', JSON.stringify(lang)); } catch (_) {}
    $$('#langSw button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === lang)));
    renderNav();
    const s = $('.search span');
    if (s) s.textContent = lang === 'bn' ? 'কোর্স, টুল বা যেকোনো কিছু খুঁজুন…' : 'Search courses, tools or anything…';
    $$('#acadTabs [data-acad]').forEach(b => {
      const t = ACAD_TABS.find(x => x.id === b.dataset.acad);
      if (t) b.textContent = lang === 'bn' ? t.bn : t.en;
    });
    $$('#labTabs [data-lab]').forEach(b => {
      const t = LAB_TABS.find(x => x.id === b.dataset.lab);
      if (t) b.textContent = lang === 'bn' ? t.bn : t.en;
    });
    $$('#v-home [data-en]').forEach(el => { el.textContent = lang === 'bn' ? el.dataset.bn : el.dataset.en; });
    const map = {
      cta1: lang === 'bn' ? 'একাডেমিক টুলস খুলুন' : 'Open academic tools',
      cta2: lang === 'bn' ? 'ব্যাচ গ্যালারি' : 'Batch gallery',
      qa: lang === 'bn' ? 'দ্রুত অ্যাক্সেস' : 'Quick access',
      hol: lang === 'bn' ? 'আসন্ন ছুটি' : 'Upcoming holidays',
      fcal: lang === 'bn' ? 'পূর্ণ ক্যালেন্ডার' : 'Full calendar'
    };
    Object.keys(map).forEach(k => { const el = $(`[data-i18n-key="${k}"]`); if (el) el.textContent = map[k]; });
  }

  function updateVisibility() {
    const vHome = $('#v-home');
    const acadBar = $('#acadTabs');
    const labBar = $('#labTabs');
    const notices = $('#notices');
    const todayStrip = $('#todayStrip');

    const acadIds = ACAD_TABS.map(t => t.id);
    const labIds = LAB_TABS.map(t => t.id);
    const singleViews = ['board', 'library', 'dnacard', 'teachers', 'community', 'gallery', 'settings'];

    if (vHome) vHome.hidden = currentView !== 'home';
    if (notices) notices.hidden = currentView !== 'home';
    if (todayStrip) todayStrip.hidden = currentView !== 'home';
    if (acadBar) acadBar.hidden = currentView !== 'academic';
    if (labBar) labBar.hidden = currentView !== 'lab';

    acadIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = !(currentView === 'academic' && currentAcad === id);
    });
    labIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = !(currentView === 'lab' && currentLab === id);
    });
    singleViews.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = currentView !== id;
    });

    $$('#acadTabs [role="tab"]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.acad === currentAcad)));
    $$('#labTabs [role="tab"]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.lab === currentLab)));
    renderNav();
  }

  function navigate(target) {
    const clean = String(target || 'home').replace(/^#/, '') || 'home';
    if (clean === 'home') { currentView = 'home'; }
    else if (clean === 'academic') { currentView = 'academic'; }
    else if (ACAD_TABS.some(t => t.id === clean)) { currentView = 'academic'; currentAcad = clean; }
    else if (clean === 'lab') { currentView = 'lab'; }
    else if (LAB_TABS.some(t => t.id === clean)) { currentView = 'lab'; currentLab = clean; }
    else if (['board', 'library', 'dnacard', 'teachers', 'community', 'gallery', 'settings'].includes(clean)) { currentView = clean; }
    else { currentView = 'home'; }

    updateVisibility();
    document.body.classList.remove('nav-open');
    window.scrollTo({ top: 0 });
  }

  function initBell() {
    const D = window.GEB_D || {};
    const notices = D.notices || [];
    const btn = $('#bellBtn'), pop = $('#bellPop'), cnt = $('#bellN');
    if (cnt && notices.length) {
      cnt.textContent = String(notices.length);
      cnt.hidden = false;
    }
    if (pop) {
      pop.innerHTML = `<h3>সাম্প্রতিক নোটিস</h3><ul>${notices.length ? notices.map(n => `<li><b>${esc(n.date || '')} · ${esc(n.cat || 'সাধারণ')}</b><span>${esc(n.text || '')}</span></li>`).join('') : '<li>কোনো নতুন নোটিস নেই</li>'}</ul>`;
    }
    if (btn && pop) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = pop.hidden;
        pop.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', e => {
        if (!pop.hidden && !e.target.closest('.popwrap')) {
          pop.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function bindGlobal() {
    const menu = $('#menuBtn'), scrim = $('#sideScrim');
    if (menu) menu.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    if (scrim) scrim.addEventListener('click', () => document.body.classList.remove('nav-open'));

    const ls = $('#langSw');
    if (ls) ls.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) applyLang(b.dataset.l); });

    document.addEventListener('click', e => {
      if (e.target.id === 'setThemeBtn') { const tb = $('#themeBtn'); if (tb) tb.click(); }
      if (e.target.id === 'setLangBtn') { applyLang(lang === 'en' ? 'bn' : 'en'); }
    });

    window.addEventListener('hashchange', () => navigate(location.hash));
  }

  window.GEBShell = {
    ready() {
      initBrands();
      buildHomeView();
      initBell();
      bindGlobal();
      applyLang(lang);
      navigate(location.hash || '#home');
    }
  };
})();
