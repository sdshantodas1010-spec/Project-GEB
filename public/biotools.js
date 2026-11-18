/* GEB Hub: বায়োটেক টুলবক্স (v3.3), শেল, সাধারণ হেল্পার, "আজকের টার্ম"।
   টুলগুলো (প্রাইমার, রিস্ট্রিকশন, কোডন) আছে bio-seq.js-এ; (PCR মিক্স, নোটবুক, গ্লসারি, প্রোটোকল) আছে bio-lab.js-এ।
   কোনো সার্ভার বা API লাগে না। সব হিসাব ব্রাউজারে হয়। নোটবুক localStorage-এ (key: geb_notebook_v1) সেভ হয়। */
(function () {
  'use strict';
  var mount = document.getElementById('btMount');
  if (!mount || !window.GEBBio || !window.GEBData) return;
  var D = window.GEBData, G = D.GLOSSARY || [];

  /* ---------- হেল্পার ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { } return null; }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function toast(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function debounce(fn, ms) { var h; return function () { var a = arguments, c = this; clearTimeout(h); h = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  /* বৈজ্ঞানিক সংখ্যা: ৪টি অর্থবহ অঙ্ক, ইংরেজি ডিজিটে (ল্যাবের মান পড়তে সুবিধা) */
  function fmt(x, sig) {
    if (x == null || !isFinite(x)) return '–';
    if (x === 0) return '0';
    var a = Math.abs(x);
    if (a >= 1e7 || a < 1e-3) return Number(x).toExponential((sig || 4) - 1).replace(/\.?0+e/, 'e').replace('e+', ' × 10^').replace('e-', ' × 10^-');
    return String(Number(x.toPrecision(sig || 4)));
  }
  function copy(text, msg) {
    var done = function () { toast(msg || 'কপি হয়েছে'); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { fallback(); }); } else fallback();
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('কপি করা যায়নি, হাতে নির্বাচন করে কপি করুন'); } t.remove();
    }
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'application/json' }), u = URL.createObjectURL(blob), l = document.createElement('a');
    l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
  }
  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var todayIso = function () { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };

  /* ---------- সবার জন্য এক সিকোয়েন্স (ট্যাব বদলালেও থাকে) ---------- */
  var SEQ = ss('geb_bt_seq') || '';
  function getSeq() { return SEQ; }
  function setSeq(v) { SEQ = v; ss('geb_bt_seq', v); }
  function sampleFasta() {
    var s = D.SAMPLE_SEQ || '', out = ['>নমুনা সিকোয়েন্স (কৃত্রিম, শুধু শেখার জন্য, আসল জিন নয়)'];
    for (var i = 0; i < s.length; i += 60) out.push(s.substr(i, 60));
    return out.join('\n');
  }
  function seqInfo(raw) {
    var c = GEBBio.cleanSeq(raw), n = c.seq.length;
    if (!n) return { c: c, html: '<span class="bt-mut">সিকোয়েন্স দিন বা “নমুনা” বাটন চাপুন</span>' };
    var bits = ['<b>' + n.toLocaleString('en-US') + ' bp</b>', 'GC ' + GEBBio.gcPct(c.seq).toFixed(1) + '%'];
    if (c.hadU) bits.push('RNA ধরে U → T করা হয়েছে');
    if (c.bad) bits.push('<span class="bt-w">' + c.bad + 'টা অবৈধ অক্ষর বাদ গেছে</span>');
    if (/[^ACGT]/.test(c.seq)) bits.push('অস্পষ্ট বেস (N, R, Y…) আছে');
    return { c: c, html: bits.join(' · ') };
  }

  /* ---------- ভিউ রেজিস্ট্রি ---------- */
  var views = {};
  var TABS = [['codon', 'কোডন ট্রান্সলেটর'], ['nb', 'ল্যাব নোটবুক'], ['gloss', 'গ্লসারি'], ['lib', 'প্রোটোকল ও ফর্মুলা']];
  var tab = ss('geb_bt_tab') || 'codon';
  if (!TABS.some(function (t) { return t[0] === tab; })) tab = 'codon';

  function register(id, view) { views[id] = view; }

  function renderBody(opts) {
    var v = views[tab], body = $('#btBody');
    if (!body) return;
    /* প্রতিবার নতুন কনটেইনার, যাতে আগের ট্যাবের ইভেন্ট লিসেনার জমে না থাকে */
    var fresh = body.cloneNode(false); body.parentNode.replaceChild(fresh, body); body = fresh;
    if (!v) { body.innerHTML = '<p class="bt-mut">এই অংশ লোড হয়নি, পেজ রিফ্রেশ করুন।</p>'; return; }
    body.innerHTML = v.html(opts || {});
    if (v.bind) v.bind(body, opts || {});
    $$('#btTabs [role="tab"]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.t === tab)); });
  }
  function go(id, opts, scroll) {
    if (!views[id]) return;
    tab = id; ss('geb_bt_tab', id); renderBody(opts);
    if (scroll !== false) { var sec = $('#biotools'); if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' }); }
  }

  /* ---------- আজকের টার্ম ---------- */
  var tOff = 0;
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function termIndex(off) {
    var n = G.length; if (!n) return -1;
    var d = new Date(), day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) + off, step = 7;
    while (gcd(step, n) !== 1) step++;
    return (((day * step) % n) + n) % n;
  }
  function todayHtml() {
    var i = termIndex(tOff); if (i < 0) return '';
    var t = G[i], lbl = tOff === 0 ? 'আজকের টার্ম' : (tOff < 0 ? Math.abs(tOff) + ' দিন আগের টার্ম' : tOff + ' দিন পরের টার্ম');
    return '<div class="bt-today" aria-live="polite">' +
      '<div class="bt-td-h"><span class="bt-kick">' + lbl + '</span><span class="chip">' + esc(t[1]) + '</span>' +
      '<span class="bt-td-nav"><button type="button" class="bt-ar" data-td="-1" aria-label="আগের দিনের টার্ম">‹</button><button type="button" class="bt-ar" data-td="0" aria-label="আজকের টার্মে ফিরুন"' + (tOff === 0 ? ' disabled' : '') + '>আজ</button><button type="button" class="bt-ar" data-td="1" aria-label="পরের দিনের টার্ম">›</button></span></div>' +
      '<h3 class="bt-term">' + esc(t[0]) + '</h3>' +
      '<p class="bt-en">' + esc(t[2]) + '</p><p class="bt-bn">' + esc(t[3]) + '</p>' +
      '<button type="button" class="pl-lk" data-td-open="' + esc(t[0]) + '">গ্লসারিতে খুলুন</button></div>';
  }
  function renderToday() { var el = $('#btToday'); if (el) el.innerHTML = todayHtml(); }

  /* ---------- শেল ---------- */
  function renderShell() {
    mount.innerHTML = '<div id="btToday"></div>' +
      '<div class="seg tabs" id="btTabs" role="tablist" aria-label="বায়োটেক টুল">' + TABS.map(function (t) { return '<button type="button" role="tab" data-t="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="bt-body" id="btBody"></div>' +
      '<p class="bt-foot">এই টুলগুলো শেখা ও পরিকল্পনার সহায়ক। ল্যাবে বা রিপোর্টে ব্যবহারের আগে নিজের ল্যাব ম্যানুয়াল ও শিক্ষকের নির্দেশের সাথে মিলিয়ে নিন। প্রাইমার অন্য জায়গায় জুড়ছে কি না (specificity) এখানে যাচাই হয় না, তা <a href="https://www.ncbi.nlm.nih.gov/tools/primer-blast/" target="_blank" rel="noopener">NCBI Primer-BLAST</a>-এ দেখে নিন।</p>';
    renderToday(); renderBody();
    mount.addEventListener('click', function (e) {
      var t = e.target.closest('#btTabs [role="tab"]');
      if (t) { tab = t.dataset.t; ss('geb_bt_tab', tab); renderBody(); return; }
      var n = e.target.closest('[data-td]');
      if (n) { var v = +n.dataset.td; tOff = v === 0 ? 0 : tOff + v; renderToday(); return; }
      var o = e.target.closest('[data-td-open]');
      if (o) go('gloss', { q: o.dataset.tdOpen });
    });
  }

  window.GEBBT = { u: { $: $, $$: $$, esc: esc, fmt: fmt, copy: copy, download: download, toast: toast, debounce: debounce, ss: ss, lsGet: lsGet, lsSet: lsSet, getSeq: getSeq, setSeq: setSeq, sampleFasta: sampleFasta, seqInfo: seqInfo, todayIso: todayIso, p2: p2 }, register: register, go: go };
  /* অন্য ফাইলগুলো রেজিস্টার করার পর শুরু হবে */
  setTimeout(renderShell, 0);
})();
