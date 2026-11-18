/* GEB Hub: ব্যাচ ২৫-২৬ গ্যালারি + একাডেমিক ক্যালেন্ডার
   কোনো সার্ভার বা API লাগে না। ছবি বদলাতে/যোগ করতে নিচের GALLERY তালিকা, ছুটি বদলাতে CAL_EVENTS তালিকা এডিট করুন।
   ছবির ফাইল থাকে public/gallery/ ফোল্ডারে। */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var bn = function (n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };

  /* =====================================================
     ১. গ্যালারি
     f = ফাইলের নাম, w/h = ছবির মাপ, k = ক্যাটাগরি, t = ক্যাপশন
     ===================================================== */
  var CATS = ['ব্যাচ', 'ক্লাস ও ল্যাব', 'ফিল্ড ট্রিপ', 'ফুটবল'];
  var GALLERY = [
    { f: "g01.jpg", w: 1210, h: 902, k: "ফিল্ড ট্রিপ", t: "ANS Field Trip 2026" },
    { f: "g02.jpg", w: 1210, h: 908, k: "ফিল্ড ট্রিপ", t: "Field Trip" },
    { f: "g03.jpg", w: 1210, h: 908, k: "ক্লাস ও ল্যাব", t: "PLS Last Class" },
    { f: "g04.jpg", w: 1210, h: 908, k: "ফুটবল", t: "In Football Tournament 2026" },
    { f: "g05.jpg", w: 1210, h: 952, k: "ফুটবল", t: "Genesis 22 Football Team" },
    { f: "g06.jpg", w: 1600, h: 895, k: "ফিল্ড ট্রিপ", t: "New Zeeland Tour" },
    { f: "g07.jpg", w: 1210, h: 682, k: "ক্লাস ও ল্যাব", t: "Last Chemistry Lab" },
    { f: "g08.jpg", w: 1210, h: 682, k: "ফুটবল", t: "Friendly Football match in Turf" },
    { f: "g09.jpg", w: 1210, h: 910, k: "ব্যাচ", t: "Genesis 22th Batch" },
    { f: "g10.jpg", w: 1210, h: 909, k: "ফুটবল", t: "Genesis Football Team" },
    { f: "g11.jpg", w: 1210, h: 767, k: "ব্যাচ", t: "GEB-22th Batch" }
  ];

  var gCat = 'all', gList = [], lbIx = -1, lastFocus = null;

  function renderGallery() {
    var chips = $('#galChips'), grid = $('#galGrid'); if (!chips || !grid) return;
    chips.innerHTML = '<button class="fc" data-gc="all" aria-pressed="' + (gCat === 'all') + '">সব (' + bn(GALLERY.length) + ')</button>' +
      CATS.map(function (c) {
        var n = GALLERY.filter(function (g) { return g.k === c; }).length; if (!n) return '';
        return '<button class="fc" data-gc="' + esc(c) + '" aria-pressed="' + (gCat === c) + '">' + esc(c) + ' (' + bn(n) + ')</button>';
      }).join('');
    gList = GALLERY.filter(function (g) { return gCat === 'all' || g.k === gCat; });
    grid.innerHTML = gList.map(function (g, i) {
      return '<figure class="gi"><button type="button" class="gb" data-i="' + i + '" aria-label="' + esc(g.t) + ' — বড় করে দেখুন">' +
        '<img src="/gallery/' + esc(g.f) + '" width="' + g.w + '" height="' + g.h + '" alt="' + esc(g.t) + '" loading="lazy" decoding="async">' +
        '<figcaption><span>' + esc(g.t) + '</span><em>' + esc(g.k) + '</em></figcaption></button></figure>';
    }).join('');
  }

  function openLb(i) {
    if (!gList.length) return;
    lbIx = (i + gList.length) % gList.length;
    var g = gList[lbIx], lb = $('#lb');
    if (!lb.classList.contains('on')) { lastFocus = document.activeElement; }
    $('#lbImg').src = '/gallery/' + g.f; $('#lbImg').alt = g.t;
    $('#lbCap').textContent = g.t; $('#lbCat').textContent = g.k;
    $('#lbN').textContent = bn(lbIx + 1) + ' / ' + bn(gList.length);
    lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('lb-open');
    $('#lbClose').focus();
    var nx = gList[(lbIx + 1) % gList.length]; if (nx) { var p = new Image(); p.src = '/gallery/' + nx.f; }
  }
  function closeLb() {
    var lb = $('#lb'); lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lb-open');
    $('#lbImg').removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* =====================================================
     ২. একাডেমিক ক্যালেন্ডার (নভেম্বর ২০২৬ – জুন ২০২৭)
     s/e = শুরু/শেষ তারিখ (YYYY-MM-DD), t = নাম,
     moon = true হলে চাঁদ দেখার উপর নির্ভর (তারিখ বদলাতে পারে)
     k: 'off' = অফিস + ক্লাস ছুটি, 'class' = শুধু ক্লাস ছুটি
     ===================================================== */
  var CAL_EVENTS = [
    { s: '2026-11-07', e: '2026-11-07', t: 'জাতীয় বিপ্লব ও সংহতি দিবস', k: 'off' },
    { s: '2026-12-14', e: '2026-12-14', t: 'শহীদ বুদ্ধিজীবী দিবস', k: 'off' },
    { s: '2026-12-16', e: '2026-12-16', t: 'বিজয় দিবস', k: 'off' },
    { s: '2026-12-20', e: '2026-12-31', t: 'শীতকালীন অবকাশ, বড়দিন', k: 'off' },
    { s: '2027-01-10', e: '2027-01-10', t: 'শব-ই-মিরাজ', k: 'off', moon: true },
    { s: '2027-01-24', e: '2027-01-24', t: 'শব-ই-বরাত', k: 'off', moon: true },
    { s: '2027-02-11', e: '2027-02-11', t: 'সরস্বতী পূজা', k: 'off', moon: true },
    { s: '2027-02-21', e: '2027-02-21', t: 'আন্তর্জাতিক মাতৃভাষা দিবস', k: 'off' },
    { s: '2027-02-28', e: '2027-03-16', t: 'শব-ই-ক্বদর, ঈদ-উল-ফিতর (অফিস ও ক্লাস ছুটি)', k: 'off', moon: true },
    { s: '2027-03-26', e: '2027-03-26', t: 'মহান স্বাধীনতা দিবস', k: 'off' },
    { s: '2027-03-28', e: '2027-03-28', t: 'ইস্টার সানডে', k: 'off' },
    { s: '2027-04-14', e: '2027-04-14', t: 'বাংলা নববর্ষ', k: 'off' },
    { s: '2027-04-26', e: '2027-04-26', t: 'হযরত শাহজালাল (র.) এর ওফাত দিবস', k: 'off', moon: true },
    { s: '2027-05-01', e: '2027-05-01', t: 'মে দিবস', k: 'off' },
    { s: '2027-05-11', e: '2027-05-20', t: 'ঈদ-উল-আযহা', k: 'off', moon: true },
    { s: '2027-05-20', e: '2027-05-20', t: 'বৌদ্ধ পূর্ণিমা', k: 'off', moon: true },
    { s: '2027-05-23', e: '2027-06-03', t: 'গ্রীষ্মকালীন ছুটি (অফিস ও ক্লাস ছুটি)', k: 'off' },
    { s: '2027-06-26', e: '2027-06-26', t: 'পবিত্র আশুরা (মহরম)', k: 'off', moon: true }
  ];
  var MONTHS = [[2026, 11], [2026, 12], [2027, 1], [2027, 2], [2027, 3], [2027, 4], [2027, 5], [2027, 6]];
  var MN = ['', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  var WD = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];      // সাপ্তাহিক ছুটি: শুক্র ও শনি
  var WDF = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (y, m, d) { return y + '-' + p2(m) + '-' + p2(d); };
  var fromIso = function (s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); };
  var todayIso = function () { var d = new Date(); return iso(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
  var dayDiff = function (a, b) { return Math.round((fromIso(b) - fromIso(a)) / 86400000); };
  var isWeekend = function (dt) { var w = dt.getDay(); return w === 5 || w === 6; };
  var evOn = function (d) { return CAL_EVENTS.filter(function (e) { return e.s <= d && d <= e.e; }); };
  var rangeTxt = function (e) {
    var a = fromIso(e.s), b = fromIso(e.e);
    if (e.s === e.e) return bn(a.getDate()) + ' ' + MN[a.getMonth() + 1];
    return bn(a.getDate()) + ' ' + MN[a.getMonth() + 1] + ' – ' + bn(b.getDate()) + ' ' + MN[b.getMonth() + 1];
  };
  var evDays = function (e) { return dayDiff(e.s, e.e) + 1; };

  var cur = 0;               // MONTHS-এর ইনডেক্স
  (function pickStart() {
    var t = todayIso(), y = +t.slice(0, 4), m = +t.slice(5, 7);
    for (var i = 0; i < MONTHS.length; i++) if (MONTHS[i][0] === y && MONTHS[i][1] === m) { cur = i; return; }
    cur = t < iso(MONTHS[0][0], MONTHS[0][1], 1) ? 0 : MONTHS.length - 1;
  })();

  function monthEvents(y, m) {
    var a = iso(y, m, 1), b = iso(y, m, 31);
    return CAL_EVENTS.filter(function (e) { return e.s <= b && e.e >= a; });
  }

  function renderMonthTabs() {
    $('#calTabs').innerHTML = MONTHS.map(function (x, i) {
      var short = MN[x[1]];
      var sub = (i === 0 || x[1] === 1) ? '<small>' + bn(x[0]) + '</small>' : '';
      return '<button role="tab" data-mi="' + i + '" aria-selected="' + (i === cur) + '" tabindex="' + (i === cur ? 0 : -1) + '">' + short + sub + '</button>';
    }).join('');
  }

  function renderMonth() {
    var y = MONTHS[cur][0], m = MONTHS[cur][1], t = todayIso();
    var first = new Date(y, m - 1, 1), n = new Date(y, m, 0).getDate(), lead = first.getDay();
    var h = '<table class="cgrid" aria-label="' + MN[m] + ' ' + bn(y) + '"><thead><tr>' +
      WD.map(function (w, i) { return '<th scope="col" class="' + (i > 4 ? 'wk' : '') + '"><abbr title="' + WDF[i] + '">' + w + '</abbr></th>'; }).join('') + '</tr></thead><tbody>';
    var d = 1;
    for (var r = 0; d <= n; r++) {
      h += '<tr>';
      for (var c = 0; c < 7; c++) {
        if ((r === 0 && c < lead) || d > n) { h += '<td class="e"></td>'; continue; }
        var key = iso(y, m, d), ev = evOn(key), wk = c > 4, cls = [];
        if (ev.length) cls.push(ev.some(function (e) { return e.k === 'off'; }) ? 'hol' : 'cls');
        if (wk) cls.push('wk');
        if (key === t) cls.push('today');
        if (key < t) cls.push('past');
        var lab = bn(d) + ' ' + MN[m] + ', ' + WDF[c] + (key === t ? ', আজ' : '') + (ev.length ? ': ' + ev.map(function (e) { return e.t; }).join(', ') : (wk ? ': সাপ্তাহিক ছুটি' : ''));
        h += '<td class="' + cls.join(' ') + '"' + (key === t ? ' aria-current="date"' : '') + '><span class="cd" aria-label="' + esc(lab) + '" title="' + esc(lab) + '">' + bn(d) + '</span></td>';
        d++;
      }
      h += '</tr>';
    }
    h += '</tbody></table>';
    $('#calHead').textContent = MN[m] + ', ' + bn(y);
    $('#calMonth').innerHTML = h;
    $('#calPrev').disabled = cur === 0; $('#calNext').disabled = cur === MONTHS.length - 1;

    var evs = monthEvents(y, m);
    $('#calList').innerHTML = evs.length ? evs.map(function (e) {
      var days = evDays(e);
      return '<li class="ev ' + e.k + '"><span class="eb" aria-hidden="true"></span><div><b>' + esc(e.t) + (e.moon ? ' <i class="mn" title="চাঁদ দেখার উপর নির্ভর">*</i>' : '') + '</b><span>' + rangeTxt(e) + (days > 1 ? ' · ' + bn(days) + ' দিন' : '') + '</span></div></li>';
    }).join('') : '<li class="ev none"><div><b>এই মাসে কোনো সরকারি বা একাডেমিক ছুটি নেই</b><span>শুধু শুক্র ও শনিবার বন্ধ</span></div></li>';
    renderMonthTabs(); renderOverview();
  }

  /* পুরো সেশনের এক নজর: প্রতি মাসে একটি সারি, প্রতি দিন একটি ঘর */
  function renderOverview() {
    var t = todayIso();
    $('#calOver').innerHTML = MONTHS.map(function (x, i) {
      var y = x[0], m = x[1], n = new Date(y, m, 0).getDate(), cells = '';
      for (var d = 1; d <= 31; d++) {
        if (d > n) { cells += '<i class="x"></i>'; continue; }
        var key = iso(y, m, d), dt = fromIso(key), ev = evOn(key), k = ev.length ? 'h' : (isWeekend(dt) ? 'w' : '');
        cells += '<i class="' + k + (key === t ? ' t' : '') + '"></i>';
      }
      var off = 0; for (var q = 1; q <= n; q++) { var kk = iso(y, m, q); if (evOn(kk).length || isWeekend(fromIso(kk))) off++; }
      return '<button type="button" class="orow' + (i === cur ? ' on' : '') + '" data-mi="' + i + '" aria-label="' + MN[m] + ' ' + bn(y) + ', ' + bn(off) + ' দিন বন্ধ, ' + bn(n - off) + ' দিন খোলা"><span class="on1">' + MN[m] + '</span><span class="cells" aria-hidden="true">' + cells + '</span><span class="open">' + bn(n - off) + ' দিন খোলা</span></button>';
    }).join('');
  }

  function renderNext() {
    var t = todayIso(), box = $('#calUp'), i;
    var ongoing = CAL_EVENTS.filter(function (e) { return e.s <= t && t <= e.e; })[0];
    var upcoming = CAL_EVENTS.filter(function (e) { return e.s > t; }).sort(function (a, b) { return a.s.localeCompare(b.s); });
    var wkNow = isWeekend(new Date());
    var h = '';
    if (ongoing) {
      var left = dayDiff(t, ongoing.e) + 1;
      h = '<div class="nx-l">এখন চলছে</div><div class="nx-t">' + esc(ongoing.t) + '</div><div class="nx-d">' + (left > 1 ? 'আরও ' + bn(left) + ' দিন, ' + bn(fromIso(ongoing.e).getDate()) + ' ' + MN[fromIso(ongoing.e).getMonth() + 1] + ' পর্যন্ত' : 'শুধু আজকের দিন') + '</div>';
    } else if (upcoming.length) {
      var nx = upcoming[0], dd = dayDiff(t, nx.s);
      h = '<div class="nx-l">পরের ছুটি</div><div class="nx-t">' + esc(nx.t) + '</div><div class="nx-d"><b>' + (dd === 1 ? 'আগামীকাল' : bn(dd) + ' দিন পরে') + '</b> · ' + WDF[fromIso(nx.s).getDay()] + ', ' + rangeTxt(nx) + (nx.moon ? ' *' : '') + '</div>';
    } else {
      h = '<div class="nx-l">পরের ছুটি</div><div class="nx-t">এই ক্যালেন্ডারে আর কোনো ছুটি নেই</div>';
    }
    if (!ongoing && wkNow) h += '<div class="nx-w">আজ সাপ্তাহিক ছুটি (শুক্র/শনি)</div>';
    var nextTwo = upcoming.slice(ongoing ? 0 : 1, ongoing ? 3 : 4);
    if (nextTwo.length) h += '<ul class="nx-more">' + nextTwo.map(function (e) { return '<li><span>' + esc(e.t) + '</span><em>' + rangeTxt(e) + '</em></li>'; }).join('') + '</ul>';
    box.innerHTML = h;
  }

  function stepMonth(d) { var n = cur + d; if (n < 0 || n >= MONTHS.length) return; cur = n; renderMonth(); }

  /* ---------- ইভেন্ট ---------- */
  function bind() {
    var chips = $('#galChips'); if (chips) chips.addEventListener('click', function (e) { var b = e.target.closest('[data-gc]'); if (b) { gCat = b.dataset.gc; renderGallery(); } });
    var grid = $('#galGrid'); if (grid) grid.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) openLb(+b.dataset.i); });
    var lb = $('#lb');
    if (lb) {
      $('#lbClose').addEventListener('click', closeLb);
      $('#lbPrev').addEventListener('click', function () { openLb(lbIx - 1); });
      $('#lbNext').addEventListener('click', function () { openLb(lbIx + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('on')) return;
        if (e.key === 'Escape') { e.stopPropagation(); closeLb(); }
        else if (e.key === 'ArrowLeft') openLb(lbIx - 1);
        else if (e.key === 'ArrowRight') openLb(lbIx + 1);
        else if (e.key === 'Tab') {
          var f = $$('button', lb).filter(function (b) { return !b.disabled; }), a = document.activeElement;
          if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }, true);
      var sx = null;
      lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) openLb(lbIx + (dx < 0 ? 1 : -1)); });
    }
    var ct = $('#calTabs');
    if (ct) {
      ct.addEventListener('click', function (e) { var b = e.target.closest('[data-mi]'); if (b) { cur = +b.dataset.mi; renderMonth(); var nb = $('#calTabs [aria-selected="true"]'); if (nb) nb.focus(); } });
      ct.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); stepMonth(e.key === 'ArrowRight' ? 1 : -1); var nb = $('#calTabs [aria-selected="true"]'); if (nb) nb.focus(); }
      });
      $('#calPrev').addEventListener('click', function () { stepMonth(-1); });
      $('#calNext').addEventListener('click', function () { stepMonth(1); });
      $('#calOver').addEventListener('click', function (e) { var b = e.target.closest('[data-mi]'); if (b) { cur = +b.dataset.mi; renderMonth(); } });
      $('#calToday').addEventListener('click', function () {
        var t = todayIso(), y = +t.slice(0, 4), m = +t.slice(5, 7);
        for (var i = 0; i < MONTHS.length; i++) if (MONTHS[i][0] === y && MONTHS[i][1] === m) { cur = i; renderMonth(); return; }
        cur = t < iso(MONTHS[0][0], MONTHS[0][1], 1) ? 0 : MONTHS.length - 1; renderMonth();
      });
    }
  }

  window.GEBCal = { evOn: evOn, events: CAL_EVENTS };   // planner.js ছুটির দিন চিনতে এটা ব্যবহার করে
  renderGallery();
  if ($('#calMonth')) { renderMonth(); renderNext(); }
  bind();
})();
