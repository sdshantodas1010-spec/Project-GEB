/* GEB Hub: সিকোয়েন্স টুল (v3.3): প্রাইমার ডিজাইন, রিস্ট্রিকশন ম্যাপ, কোডন ট্রান্সলেটর। */
(function () {
  'use strict';
  var T = window.GEBBT; if (!T) return;
  var U = T.u, $ = U.$, $$ = U.$$, esc = U.esc, fmt = U.fmt, B = window.GEBBio, D = window.GEBData;

  function seqBox(id, rows) {
    return '<label class="bt-lb" for="' + id + '">সিকোয়েন্স (FASTA বা শুধু বেস; DNA বা RNA)</label>' +
      '<textarea class="bt-ta bt-mono" id="' + id + '" rows="' + (rows || 6) + '" spellcheck="false" placeholder=">নাম&#10;ATGCGT…">' + esc(U.getSeq()) + '</textarea>' +
      '<div class="bt-info" id="' + id + 'Info"></div>' +
      '<div class="bt-row"><button type="button" class="btn ghost sm" data-a="sample">নমুনা সিকোয়েন্স</button><button type="button" class="btn ghost sm" data-a="clear">মুছুন</button></div>';
  }
  function bindSeq(root, id, onChange) {
    var ta = $('#' + id, root), info = $('#' + id + 'Info', root);
    function upd() { U.setSeq(ta.value); info.innerHTML = U.seqInfo(ta.value).html; if (onChange) onChange(); }
    info.innerHTML = U.seqInfo(ta.value).html;
    ta.addEventListener('input', U.debounce(upd, 300));
    $$('[data-a="sample"]', root).forEach(function (b) { b.addEventListener('click', function () { ta.value = U.sampleFasta(); upd(); }); });
    $$('[data-a="clear"]', root).forEach(function (b) { b.addEventListener('click', function () { ta.value = ''; upd(); }); });
  }
  function copyBind(root) { root.addEventListener('click', function (e) { var b = e.target.closest('[data-copy]'); if (b) U.copy(b.dataset.copy); }); }
  var chips = function (list) { return list.map(function (i) { return '<span class="bt-chip ' + i.lvl + '">' + esc(i.msg) + '</span>'; }).join(''); };
  var cleanSeq = function () { return B.cleanSeq(U.getSeq()); };

  /* ================= প্রাইমার ডিজাইন ================= */
  var PS = { start: '', end: '', minLen: 18, maxLen: 25, tmOpt: 60, win: 20, gcMin: 40, gcMax: 60, na: 50, mg: 1.5, dntp: 0.2, conc: 250, tf: '', tr: '', sel: 0, res: null };
  var PF = [['start', 'শুরু (bp)', 'পুরোটা'], ['end', 'শেষ (bp)', 'পুরোটা'], ['minLen', 'সর্বনিম্ন দৈর্ঘ্য'], ['maxLen', 'সর্বোচ্চ দৈর্ঘ্য'], ['tmOpt', 'কাঙ্ক্ষিত Tm (°C)'], ['win', 'ভেতরে সরার সীমা (bp)']];
  var PA = [['gcMin', 'GC সর্বনিম্ন %'], ['gcMax', 'GC সর্বোচ্চ %'], ['na', 'Na⁺ (mM)'], ['mg', 'Mg²⁺ (mM)'], ['dntp', 'dNTP (mM)'], ['conc', 'প্রাইমার (nM)']];
  var fld = function (k, l, ph) { return '<label class="bt-f"><span>' + l + '</span><input class="fld" type="number" data-k="' + k + '" value="' + esc(PS[k]) + '"' + (ph ? ' placeholder="' + ph + '"' : '') + ' step="any"></label>'; };

  function pHtml() {
    return '<div class="bt-two"><div class="pl-card"><h3>প্রাইমার ডিজাইন</h3><p class="bt-mut">সিকোয়েন্স দিন, যে অংশ বাড়াতে চান তার শুরু-শেষ দিন। Tm (nearest-neighbour), GC%, GC ক্ল্যাম্প, হেয়ারপিন ও ডাইমারের সতর্কতাসহ সেরা জোড়া দেওয়া হবে।</p>' +
      seqBox('pSeq', 6) +
      '<div class="bt-form">' + PF.map(function (f) { return fld(f[0], f[1], f[2]); }).join('') + '</div>' +
      '<details class="bt-det"><summary>উন্নত সেটিং ও ৫′ এক্সটেনশন</summary><div class="bt-form">' + PA.map(function (f) { return fld(f[0], f[1]); }).join('') + '</div>' +
      '<div class="bt-form"><label class="bt-f wide"><span>ফরওয়ার্ডের ৫′ এক্সটেনশন (যেমন রেস্ট্রিকশন সাইট)</span><input class="fld bt-mono" data-k="tf" value="' + esc(PS.tf) + '" placeholder="GGATCC"></label>' +
      '<label class="bt-f wide"><span>রিভার্সের ৫′ এক্সটেনশন</span><input class="fld bt-mono" data-k="tr" value="' + esc(PS.tr) + '" placeholder="AAGCTT"></label></div></details>' +
      '<div class="bt-row"><button type="button" class="btn pri" id="pRun">প্রাইমার ডিজাইন করুন</button></div></div>' +
      '<div class="pl-card"><h3>নিজের প্রাইমার পরীক্ষা করুন</h3><p class="bt-mut">নিজের প্রাইমার (৫′→৩′) বসান, Tm, GC ও সমস্যা দেখুন। উপরে সিকোয়েন্স থাকলে প্রাইমার কোথায় বসে তাও বলবে।</p>' +
      '<input class="fld bt-mono" id="pOwn" placeholder="যেমন GGATCCATGACACGGGGCATC" autocomplete="off" spellcheck="false"><div id="pOwnOut" class="bt-res"></div></div></div>' +
      '<div id="pOut"></div>';
  }
  function primerCard(lbl, p, tail, strand) {
    var full = (tail || '') + p.seq;
    return '<div class="bt-pm"><div class="bt-pm-h"><b>' + lbl + '</b><span class="bt-mut">' + strand + '</span><button type="button" class="pl-lk" data-copy="' + full + '">কপি</button></div>' +
      '<code class="bt-seq">5′-' + (tail ? '<span class="bt-tail">' + esc(tail) + '</span>' : '') + esc(p.seq) + '-3′</code>' +
      '<div class="bt-stats"><span>' + p.len + ' nt</span><span>Tm <b>' + p.tm.toFixed(1) + '°C</b></span><span>GC <b>' + p.gc.toFixed(0) + '%</b></span><span>সহজ সূত্রে Tm ' + p.tmBasic.toFixed(1) + '°C</span><span>টেমপ্লেটে ' + p.from + '–' + p.to + '</span></div>' +
      '<div class="bt-chips">' + (p.issues.length ? chips(p.issues) : '<span class="bt-chip ok">কোনো সতর্কতা নেই</span>') + '</div></div>';
  }
  function pMap(L, f, r, s0, e0) {
    var x = function (p) { return 20 + (p / L) * 560; };
    var fx1 = x(f.from - 1), fx2 = Math.max(fx1 + 8, x(f.to)), rx2 = x(r.from - 1), rx1 = Math.max(rx2 + 8, x(r.to));
    return '<svg class="bt-svg" viewBox="0 0 600 78" role="img" aria-label="টেমপ্লেটে প্রাইমারের অবস্থান"><rect x="20" y="34" width="560" height="8" rx="4" class="bt-tpl"/>' +
      '<rect x="' + x(s0) + '" y="32" width="' + Math.max(2, x(e0) - x(s0)) + '" height="12" rx="3" class="bt-reg"/>' +
      '<polygon points="' + fx1 + ',14 ' + (fx2 - 7) + ',14 ' + (fx2 - 7) + ',9 ' + (fx2 + 3) + ',17 ' + (fx2 - 7) + ',25 ' + (fx2 - 7) + ',20 ' + fx1 + ',20" class="bt-af"/>' +
      '<polygon points="' + rx1 + ',58 ' + (rx2 + 7) + ',58 ' + (rx2 + 7) + ',53 ' + (rx2 - 3) + ',61 ' + (rx2 + 7) + ',69 ' + (rx2 + 7) + ',64 ' + rx1 + ',64" class="bt-ar2"/>' +
      '<text x="20" y="76" class="bt-t">1</text><text x="580" y="76" text-anchor="end" class="bt-t">' + L + ' bp</text></svg>';
  }
  function pRender(root) {
    var out = $('#pOut', root), res = PS.res;
    if (!res) { out.innerHTML = ''; return; }
    if (res.error) { out.innerHTML = '<div class="pl-ban bad">' + esc(res.error) + '</div>'; return; }
    if (!res.pairs.length) { out.innerHTML = '<div class="pl-ban bad">কোনো উপযুক্ত প্রাইমার জোড়া পাওয়া যায়নি। অঞ্চল বড় করুন বা ভেতরে সরার সীমা বাড়ান।</div>'; return; }
    var p = res.pairs[Math.min(PS.sel, res.pairs.length - 1)], L = PS.L;
    var pairNotes = p.notes.length ? '<div class="bt-chips">' + chips(p.notes) + '</div>' : '';
    out.innerHTML = '<div class="pl-card"><div class="pl-hd"><div><h3>সেরা জোড়া' + (PS.sel ? ' (বিকল্প #' + (PS.sel + 1) + ')' : '') + '</h3><p class="bt-mut">প্রোডাক্ট <b>' + p.size + ' bp</b> · Tm-এর পার্থক্য ' + p.diff.toFixed(1) + '°C' + ((PS.tf || PS.tr) ? ' (এক্সটেনশনসহ প্রোডাক্ট ' + (p.size + PS.tf.length + PS.tr.length) + ' bp)' : '') + '</p></div>' +
      '<button type="button" class="btn ghost sm" data-copy="Forward: 5′-' + PS.tf + p.f.seq + '-3′\nReverse: 5′-' + PS.tr + p.r.seq + '-3′">দুটোই কপি</button></div>' +
      pMap(L, p.f, p.r, PS.s0, PS.e0) + pairNotes +
      '<div class="bt-two">' + primerCard('Forward', p.f, PS.tf, 'উপরের স্ট্র্যান্ড') + primerCard('Reverse', p.r, PS.tr, 'নিচের স্ট্র্যান্ড (reverse complement)') + '</div>' +
      '<div class="bt-tw"><table class="bt-tb"><thead><tr><th>#</th><th>Forward</th><th>Reverse</th><th>প্রোডাক্ট</th><th>ΔTm</th><th></th></tr></thead><tbody>' +
      res.pairs.map(function (q, i) { return '<tr' + (i === PS.sel ? ' class="on"' : '') + '><td>' + (i + 1) + '</td><td class="bt-mono">' + esc(q.f.seq) + '<small> ' + q.f.tm.toFixed(1) + '°</small></td><td class="bt-mono">' + esc(q.r.seq) + '<small> ' + q.r.tm.toFixed(1) + '°</small></td><td>' + q.size + ' bp</td><td>' + q.diff.toFixed(1) + '°</td><td><button type="button" class="pl-lk" data-pick="' + i + '">দেখুন</button></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="bt-mut sm">' + res.tried + 'টি প্রার্থীর মধ্য থেকে বাছা। র‍্যাঙ্কিং হয় Tm কাঙ্ক্ষিত মানের কাছে কত, GC%, ক্ল্যাম্প, হেয়ারপিন ও ডাইমারের ওপর।</p></div>';
  }
  function pRun(root) {
    var c = cleanSeq(), L = c.seq.length, out = $('#pOut', root);
    if (L < 40) { PS.res = { error: 'অন্তত ৪০ বেসের সিকোয়েন্স লাগবে।' }; pRender(root); return; }
    var s = Math.max(1, +PS.start || 1), e = Math.min(L, +PS.end || L);
    var o = { start: s, end: e, minLen: +PS.minLen || 18, maxLen: +PS.maxLen || 25, tmOpt: +PS.tmOpt || 60, window: Math.max(0, +PS.win || 0), gcMin: +PS.gcMin, gcMax: +PS.gcMax, na: +PS.na, mg: +PS.mg, dntp: +PS.dntp, conc: +PS.conc };
    o.tmMin = o.tmOpt - 3; o.tmMax = o.tmOpt + 3;
    if (o.minLen > o.maxLen) { PS.res = { error: 'সর্বনিম্ন দৈর্ঘ্য সর্বোচ্চের চেয়ে বড় হতে পারে না।' }; pRender(root); return; }
    PS.tf = PS.tf.replace(/[^ACGTacgt]/g, '').toUpperCase(); PS.tr = PS.tr.replace(/[^ACGTacgt]/g, '').toUpperCase();
    PS.res = B.design(c.seq, o); PS.sel = 0; PS.L = L; PS.s0 = s - 1; PS.e0 = e;
    pRender(root); if (out && !PS.res.error) out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function pOwn(root) {
    var v = $('#pOwn', root).value.replace(/[^ACGTacgtUu]/g, '').toUpperCase().replace(/U/g, 'T'), o = $('#pOwnOut', root);
    if (!v) { o.innerHTML = ''; return; }
    if (v.length < 8) { o.innerHTML = '<p class="bt-mut">অন্তত ৮ বেস দিন।</p>'; return; }
    var r = B.primerReport(v, { na: +PS.na, mg: +PS.mg, dntp: +PS.dntp, conc: +PS.conc, gcMin: +PS.gcMin, gcMax: +PS.gcMax }), c = cleanSeq(), where = '';
    if (c.seq) { var i = c.seq.indexOf(v), j = c.seq.indexOf(B.revComp(v)); where = i >= 0 ? '<p>উপরের সিকোয়েন্সে ফরওয়ার্ড হিসেবে ' + (i + 1) + '–' + (i + v.length) + ' এ বসে।</p>' : (j >= 0 ? '<p>রিভার্স প্রাইমার হিসেবে ' + (j + 1) + '–' + (j + v.length) + ' এ বসে।</p>' : '<p class="bt-mut">উপরের সিকোয়েন্সে হুবহু মেলেনি।</p>'); }
    o.innerHTML = '<div class="bt-stats"><span>' + r.len + ' nt</span><span>Tm <b>' + r.tm.toFixed(1) + '°C</b></span><span>GC <b>' + r.gc.toFixed(0) + '%</b></span><span>সহজ সূত্রে Tm ' + r.tmBasic.toFixed(1) + '°C</span></div><div class="bt-chips">' + (r.issues.length ? chips(r.issues) : '<span class="bt-chip ok">কোনো সতর্কতা নেই</span>') + '</div>' + where;
  }
  T.register('primer', {
    html: pHtml,
    bind: function (root) {
      bindSeq(root, 'pSeq'); copyBind(root);
      $$('[data-k]', root).forEach(function (el) { el.addEventListener('input', function () { PS[el.dataset.k] = el.value; if (el.dataset.k !== 'tf' && el.dataset.k !== 'tr') pOwn(root); }); });
      $('#pRun', root).addEventListener('click', function () { pRun(root); });
      $('#pOwn', root).addEventListener('input', function () { pOwn(root); }); pOwn(root); pRender(root);
      root.addEventListener('click', function (e) { var b = e.target.closest('[data-pick]'); if (b) { PS.sel = +b.dataset.pick; pRender(root); } });
    }
  });

  /* ================= রিস্ট্রিকশন ম্যাপ ================= */
  var RS = { circ: false, set: 'common', filter: '1', sub: 'table', sel: [], key: '', r: null };
  function enzList() { return D.ENZYMES.filter(function (e) { return RS.set === 'all' || e.c; }); }
  function rCompute() {
    var c = cleanSeq(), key = c.seq.length + ':' + c.seq.slice(0, 30) + c.seq.slice(-30) + RS.circ + RS.set;
    if (RS.key !== key) { RS.r = c.seq ? B.findSites(c.seq, enzList(), RS.circ) : []; RS.key = key; }
    return { c: c, r: RS.r };
  }
  function niceStep(L) { var s = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000]; for (var i = 0; i < s.length; i++) if (L / s[i] <= 10) return s[i]; return 1000000; }
  function linMap(L, items) {
    var W = 900, pad = 30, x = function (p) { return pad + (p / L) * (W - 2 * pad); }, ends = [], rows = [];
    items.sort(function (a, b) { return a.pos - b.pos; });
    items.forEach(function (it) {
      var w = (it.name.length + String(it.pos).length + 3) * 6 + 8, xl = x(it.pos), r = 0;
      while (ends[r] !== undefined && ends[r] + 4 > xl) r++;
      ends[r] = xl + w; rows.push(r);
    });
    var nr = Math.max(1, ends.length), base = 22 + nr * 15, H = base + 44, s = '<svg class="bt-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="লিনিয়ার রিস্ট্রিকশন ম্যাপ"><rect x="' + pad + '" y="' + (base - 3) + '" width="' + (W - 2 * pad) + '" height="6" rx="3" class="bt-tpl"/>';
    items.forEach(function (it, i) { var xx = x(it.pos), yy = base - 12 - rows[i] * 15; s += '<line x1="' + xx + '" y1="' + base + '" x2="' + xx + '" y2="' + (yy + 3) + '" class="bt-ld"/><text x="' + (xx + 3) + '" y="' + yy + '" class="bt-t b">' + esc(it.name) + ' <tspan class="bt-pos">' + it.pos + '</tspan></text>'; });
    var st = niceStep(L); for (var p = 0; p <= L; p += st) s += '<line x1="' + x(p) + '" y1="' + (base + 5) + '" x2="' + x(p) + '" y2="' + (base + 10) + '" class="bt-ld"/><text x="' + x(p) + '" y="' + (base + 24) + '" text-anchor="middle" class="bt-t">' + (p >= 1000 ? (p / 1000) + 'k' : p) + '</text>';
    return s + '</svg>';
  }
  function circMap(L, items) {
    var S = 560, cx = S / 2, cy = S / 2, R = 140, side = { r: [], l: [] };
    items.forEach(function (it) {
      var a = 2 * Math.PI * it.pos / L - Math.PI / 2, o = { it: it, a: a, px: cx + R * Math.cos(a), py: cy + R * Math.sin(a), ex: cx + (R + 16) * Math.cos(a), ey: cy + (R + 16) * Math.sin(a) };
      o.y = o.ey; (Math.cos(a) >= 0 ? side.r : side.l).push(o);
    });
    var s = '<svg class="bt-svg sq" viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="বৃত্তাকার রিস্ট্রিকশন ম্যাপ"><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="bt-circ"/><text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="bt-t b">' + L.toLocaleString('en-US') + ' bp</text><text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" class="bt-t">circular</text>';
    ['r', 'l'].forEach(function (k) {
      var a = side[k].sort(function (p, q) { return p.y - q.y; }), i;
      for (i = 1; i < a.length; i++) if (a[i].y < a[i - 1].y + 14) a[i].y = a[i - 1].y + 14;
      var over = a.length ? a[a.length - 1].y - (S - 10) : 0; if (over > 0) for (i = 0; i < a.length; i++) a[i].y -= over;
      a.forEach(function (o) {
        var lx = k === 'r' ? cx + R + 46 : cx - R - 46, anc = k === 'r' ? 'start' : 'end';
        s += '<polyline points="' + o.px + ',' + o.py + ' ' + o.ex + ',' + o.ey + ' ' + (lx + (k === 'r' ? -4 : 4)) + ',' + (o.y - 4) + '" class="bt-ld" fill="none"/><text x="' + lx + '" y="' + o.y + '" text-anchor="' + anc + '" class="bt-t b">' + esc(o.it.name) + ' <tspan class="bt-pos">' + o.it.pos + '</tspan></text>';
      });
    });
    return s + '</svg>';
  }
  function gel(sizes, L) {
    var H = 300, top = 20, lo = Math.log10(80), hi = Math.log10(12000), y = function (n) { n = Math.max(80, Math.min(12000, n)); return top + (hi - Math.log10(n)) / (hi - lo) * (H - top - 14); };
    var s = '<svg class="bt-gel" viewBox="0 0 300 ' + (H + 22) + '" role="img" aria-label="ভার্চুয়াল জেল"><rect width="300" height="' + (H + 22) + '" rx="10" fill="#0A1626"/>', lanes = [['M', 50], ['Uncut', 150], ['Digest', 240]];
    lanes.forEach(function (l) { s += '<rect x="' + (l[1] - 24) + '" y="8" width="48" height="6" rx="2" fill="#243747"/><text x="' + l[1] + '" y="' + (H + 16) + '" text-anchor="middle" fill="#93A6B5" font-size="10">' + l[0] + '</text>'; });
    var band = function (x, n, bright, lab, left) { var yy = y(n); return '<rect x="' + (x - 20) + '" y="' + yy + '" width="40" height="3.5" rx="1.5" fill="#38F5B4" opacity="' + bright + '"/>' + (lab ? '<text x="' + (left ? x - 24 : x + 24) + '" y="' + (yy + 4) + '" text-anchor="' + (left ? 'end' : 'start') + '" fill="#93A6B5" font-size="8.5">' + n + '</text>' : ''); };
    D.LADDER.forEach(function (n) { s += band(50, n, .7, true, false); });
    s += band(150, L, .9, true, false);
    sizes.forEach(function (n) { s += band(240, n, .95, true, false); });
    return s + '</svg>';
  }
  function rHtml() {
    return '<div class="pl-card"><h3>রিস্ট্রিকশন ম্যাপ ও ডাইজেস্ট</h3><p class="bt-mut">DNA সিকোয়েন্সে কোন এনজাইম কোথায় কাটে (দুই স্ট্র্যান্ডই খোঁজা হয়), কতবার কাটে আর টুকরোর আকার কত হবে তা দেখুন।</p>' +
      seqBox('rSeq', 5) +
      '<div class="bt-form"><label class="bt-f"><span>আকার</span><select class="fld" id="rCirc"><option value="0">লিনিয়ার</option><option value="1"' + (RS.circ ? ' selected' : '') + '>বৃত্তাকার (প্লাজমিড)</option></select></label>' +
      '<label class="bt-f"><span>এনজাইম তালিকা</span><select class="fld" id="rSet"><option value="common">সাধারণ ২০টি</option><option value="all"' + (RS.set === 'all' ? ' selected' : '') + '>সব (' + D.ENZYMES.length + 'টি)</option></select></label></div></div>' +
      '<div id="rOut"></div>';
  }
  function rRender(root) {
    var o = $('#rOut', root), q = rCompute(), r = q.r, L = q.c.seq.length;
    if (!L) { o.innerHTML = ''; return; }
    var n0 = r.filter(function (x) { return x.n === 0; }).length, n1 = r.filter(function (x) { return x.n === 1; }).length, n2 = r.filter(function (x) { return x.n === 2; }).length, n3 = r.filter(function (x) { return x.n >= 3; }).length;
    var F = { '1': ['একবার কাটে', n1], '2': ['দুইবার', n2], '3': ['৩+ বার', n3], '0': ['কাটে না', n0], all: ['সব', r.length] };
    var list = r.filter(function (x) { return RS.filter === 'all' || (RS.filter === '3' ? x.n >= 3 : x.n === +RS.filter); });
    var h = '<div class="pl-card"><div class="fchips" role="group" aria-label="ফিল্টার">' + Object.keys(F).map(function (k) { return '<button type="button" class="fc sm" data-rf="' + k + '" aria-pressed="' + (RS.filter === k) + '">' + F[k][0] + ' <b>' + F[k][1] + '</b></button>'; }).join('') + '</div>' +
      '<div class="seg tabs bt-sub" role="tablist">' + [['table', 'তালিকা'], ['map', 'ম্যাপ'], ['dig', 'ডাইজেস্ট ও জেল']].map(function (t) { return '<button type="button" role="tab" data-rs="' + t[0] + '" aria-selected="' + (RS.sub === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>';
    if (RS.sub === 'table') {
      h += list.length ? '<div class="bt-tw"><table class="bt-tb"><thead><tr><th>ডাইজেস্ট</th><th>এনজাইম</th><th>সাইট (^ = কাটা)</th><th>কাটে</th><th>কাটার জায়গা (এই বেসের পরে)</th><th>প্রান্ত</th></tr></thead><tbody>' +
        list.map(function (x) { var cs = x.cuts.length > 8 ? x.cuts.slice(0, 8).join(', ') + ' … (+' + (x.cuts.length - 8) + ')' : x.cuts.join(', ');
          return '<tr><td><input type="checkbox" data-sel="' + x.e.n + '"' + (RS.sel.indexOf(x.e.n) >= 0 ? ' checked' : '') + ' aria-label="' + x.e.n + ' বাছুন"></td><td><b>' + x.e.n + '</b></td><td class="bt-mono">' + esc(B.siteLabel(x.e)) + '</td><td>' + x.n + '</td><td>' + (cs || '–') + '</td><td>' + B.overhang(x.e) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="bt-mut">এই ফিল্টারে কোনো এনজাইম নেই।</p>';
      h += '<p class="bt-mut sm">কিছু এনজাইম টিক দিয়ে “ডাইজেস্ট ও জেল” ট্যাবে টুকরোর আকার দেখুন। “প্রান্ত”: 5′/3′ ওভারহ্যাং (nt) বা blunt।</p>';
    } else if (RS.sub === 'map') {
      var items = []; list.forEach(function (x) { x.cuts.forEach(function (c) { items.push({ name: x.e.n, pos: c }); }); });
      if (!items.length) h += '<p class="bt-mut">দেখানোর মতো কাটার জায়গা নেই।</p>';
      else if (items.length > 60) h += '<p class="bt-mut">কাটার জায়গা ' + items.length + 'টি, ম্যাপে ভিড় হবে। ওপর থেকে “একবার কাটে” ফিল্টার বাছুন।</p>';
      else h += '<div class="bt-mapw">' + (RS.circ ? circMap(L, items) : linMap(L, items)) + '</div><p class="bt-mut sm">সংখ্যা = ওই বেসের পরে কাটে। শুধু ফিল্টারে থাকা এনজাইম দেখানো হচ্ছে।</p>';
    } else {
      if (!RS.sel.length) h += '<p class="bt-mut">“তালিকা” ট্যাবে এক বা একাধিক এনজাইমে টিক দিন (ডাবল ডাইজেস্টের জন্য দুটি), তারপর এখানে আসুন।</p>';
      else {
        var cuts = []; r.forEach(function (x) { if (RS.sel.indexOf(x.e.n) >= 0) cuts = cuts.concat(x.cuts); });
        cuts = cuts.filter(function (v, i, a) { return a.indexOf(v) === i; });
        var fr = B.fragments(cuts, L, RS.circ), sizes = fr.map(function (f) { return f.size; }).sort(function (a, b) { return b - a; });
        h += '<p><b>' + RS.sel.join(' + ') + '</b> দিয়ে ' + (cuts.length ? cuts.length + 'টি জায়গায় কাটে, ' + fr.length + 'টি টুকরো' : 'কোথাও কাটে না') + '।</p><div class="bt-two"><div class="bt-tw"><table class="bt-tb"><thead><tr><th>#</th><th>থেকে</th><th>পর্যন্ত</th><th>আকার (bp)</th></tr></thead><tbody>' +
          fr.slice().sort(function (a, b) { return b.size - a.size; }).map(function (f, i) { return '<tr><td>' + (i + 1) + '</td><td>' + f.from + '</td><td>' + f.to + '</td><td><b>' + f.size + '</b></td></tr>'; }).join('') + '</tbody></table></div><div>' + gel(sizes, L) + '<p class="bt-mut sm">ভার্চুয়াল জেল (লগ স্কেল, আনুমানিক)। M = নমুনা মার্কার।</p></div></div>';
      }
    }
    o.innerHTML = h + '</div>';
  }
  T.register('restr', {
    html: rHtml,
    bind: function (root) {
      bindSeq(root, 'rSeq', function () { rRender(root); });
      $('#rCirc', root).addEventListener('change', function (e) { RS.circ = e.target.value === '1'; rRender(root); });
      $('#rSet', root).addEventListener('change', function (e) { RS.set = e.target.value; RS.sel = []; rRender(root); });
      root.addEventListener('click', function (e) {
        var f = e.target.closest('[data-rf]'); if (f) { RS.filter = f.dataset.rf; rRender(root); return; }
        var s = e.target.closest('[data-rs]'); if (s) { RS.sub = s.dataset.rs; rRender(root); }
      });
      root.addEventListener('change', function (e) { var c = e.target.closest('[data-sel]'); if (!c) return; var n = c.dataset.sel, i = RS.sel.indexOf(n); if (c.checked && i < 0) RS.sel.push(n); else if (!c.checked && i >= 0) RS.sel.splice(i, 1); });
      rRender(root);
    }
  });

  /* ================= কোডন ট্রান্সলেটর ================= */
  var CS = { table: 1, min: 30, three: false };
  function colorAA(s) { return s.replace(/M/g, '<b class="m">M</b>').replace(/\*/g, '<b class="s">*</b>'); }
  function aaLines(aa, three) {
    var per = three ? 15 : 60, out = '';
    for (var i = 0; i < aa.length; i += per) {
      var seg = aa.substr(i, per), body = three ? B.to3(seg).map(function (a) { return a === 'Met' ? '<b class="m">Met</b>' : (a === 'Stop' ? '<b class="s">Stop</b>' : a); }).join(' ') : colorAA(seg);
      out += '<div class="bt-ln"><i>' + (i + 1) + '</i><span>' + body + '</span></div>';
    }
    return out || '<span class="bt-mut">–</span>';
  }
  function codonTable() {
    var b = 'TCAG', h = '<div class="bt-tw"><table class="bt-tb bt-ct"><thead><tr><th>1st</th>' + b.split('').map(function (x) { return '<th>2nd ' + x + '</th>'; }).join('') + '<th>3rd</th></tr></thead><tbody>';
    for (var i = 0; i < 4; i++) for (var k = 0; k < 4; k++) {
      h += '<tr>' + (k === 0 ? '<th rowspan="4">' + b[i] + '</th>' : '');
      for (var j = 0; j < 4; j++) { var c = b[i] + b[j] + b[k], a = B.codonAA(c, CS.table); h += '<td class="' + (a === '*' ? 's' : (c === 'ATG' ? 'm' : '')) + '"><span class="bt-mono">' + c + '</span> ' + (a === '*' ? 'Stop' : B.AA3[a] + ' (' + a + ')') + '</td>'; }
      h += '<th>' + b[k] + '</th></tr>';
    }
    return h + '</tbody></table></div>';
  }
  function cHtml() {
    return '<div class="pl-card"><h3>কোডন ট্রান্সলেটর</h3><p class="bt-mut">DNA বা mRNA থেকে অ্যামিনো অ্যাসিড, ছয়টি রিডিং ফ্রেম ও ORF সহ। ইনপুটকে কোডিং স্ট্র্যান্ড (৫′→৩′) ধরা হয়।</p>' + seqBox('cSeq', 5) +
      '<div class="bt-form"><label class="bt-f"><span>জেনেটিক কোড</span><select class="fld" id="cTab">' + Object.keys(B.TABLES).map(function (k) { return '<option value="' + k + '"' + (+k === CS.table ? ' selected' : '') + '>' + B.TABLES[k].name + '</option>'; }).join('') + '</select></label>' +
      '<label class="bt-f"><span>ORF-এর ন্যূনতম দৈর্ঘ্য (aa)</span><input class="fld" type="number" id="cMin" min="1" value="' + CS.min + '"></label>' +
      '<label class="bt-f"><span>অ্যামিনো অ্যাসিড লেখা</span><select class="fld" id="cStyle"><option value="1">১ অক্ষর (M)</option><option value="3"' + (CS.three ? ' selected' : '') + '>৩ অক্ষর (Met)</option></select></label></div></div><div id="cOut"></div>';
  }
  function cRender(root) {
    var o = $('#cOut', root), c = cleanSeq(), seq = c.seq, notice = '';
    if (seq.length < 3) { o.innerHTML = ''; return; }
    if (seq.length > 30000) { seq = seq.slice(0, 30000); notice = '<div class="pl-ban">সিকোয়েন্স বড়, প্রথম ৩০,০০০ বেস নেওয়া হয়েছে।</div>'; }
    var cnt = B.baseCount(seq), L = seq.length, rc = B.revComp(seq), mrna = seq.replace(/T/g, 'U');
    var short = function (s) { return s.length > 240 ? esc(s.slice(0, 240)) + '… (' + s.length + ' nt)' : esc(s); };
    var h = notice + '<div class="pl-card"><h3>সিকোয়েন্সের তথ্য</h3><div class="bt-stats"><span><b>' + L + '</b> nt</span><span>GC <b>' + B.gcPct(seq).toFixed(1) + '%</b></span><span>A ' + cnt.A + '</span><span>T ' + cnt.T + '</span><span>G ' + cnt.G + '</span><span>C ' + cnt.C + '</span>' + (cnt.other ? '<span>অন্য ' + cnt.other + '</span>' : '') + '</div>' +
      '<p class="bt-lb">mRNA (কোডিং স্ট্র্যান্ড ধরে T → U) <button type="button" class="pl-lk" data-copy="' + mrna + '">কপি</button></p><code class="bt-seq wrap">5′-' + short(mrna) + '-3′</code>' +
      '<p class="bt-lb">Reverse complement <button type="button" class="pl-lk" data-copy="' + rc + '">কপি</button></p><code class="bt-seq wrap">5′-' + short(rc) + '-3′</code></div>';
    var orfs = B.findORFs(seq, CS.table, +CS.min || 1);
    h += '<div class="pl-card"><h3>ORF (ATG থেকে stop)</h3>' + (orfs.length ? '<div class="bt-tw"><table class="bt-tb"><thead><tr><th>স্ট্র্যান্ড</th><th>ফ্রেম</th><th>অবস্থান (nt)</th><th>দৈর্ঘ্য (aa)</th><th>আনুমানিক ভর</th><th>প্রোটিন</th></tr></thead><tbody>' +
      orfs.slice(0, 20).map(function (x) { return '<tr><td>' + (x.strand === '+' ? 'উপরের (+)' : 'নিচের (−)') + '</td><td>' + x.strand + x.frame + '</td><td>' + x.from + '–' + x.to + (x.partial ? ' <small>(stop নেই)</small>' : '') + '</td><td><b>' + x.aa + '</b></td><td>' + (B.protMW(x.prot) / 1000).toFixed(1) + ' kDa</td><td><button type="button" class="pl-lk" data-copy="' + x.prot + '">কপি</button> <small class="bt-mono">' + x.prot.slice(0, 10) + '…</small></td></tr>'; }).join('') + '</tbody></table></div>' + (orfs.length > 20 ? '<p class="bt-mut sm">সবচেয়ে লম্বা ২০টি দেখানো হলো।</p>' : '') : '<p class="bt-mut">' + CS.min + ' aa বা তার বেশি লম্বা ORF পাওয়া যায়নি। ন্যূনতম দৈর্ঘ্য কমিয়ে দেখুন।</p>') + '</div>';
    h += '<div class="pl-card"><h3>ছয় রিডিং ফ্রেম</h3><p class="bt-mut">সবুজ <b class="m">M</b> = শুরু কোডন, লাল <b class="s">*</b> = stop।</p>' +
      B.sixFrames(seq, CS.table).map(function (f) { return '<div class="bt-fr"><div class="bt-fr-h"><b>' + f.strand + f.frame + '</b><span class="bt-mut">' + (f.strand === '+' ? 'উপরের স্ট্র্যান্ড' : 'নিচের স্ট্র্যান্ড') + ', ফ্রেম ' + f.frame + ' · ' + f.aa.length + ' aa</span><button type="button" class="pl-lk" data-copy="' + f.aa + '">কপি</button></div>' + aaLines(f.aa, CS.three) + '</div>'; }).join('') + '</div>';
    h += '<details class="bt-det pl-card"><summary>জেনেটিক কোড টেবিল (' + B.TABLES[CS.table].name + ')</summary>' + codonTable() + '</details>';
    o.innerHTML = h;
  }
  T.register('codon', {
    html: cHtml,
    bind: function (root) {
      bindSeq(root, 'cSeq', function () { cRender(root); }); copyBind(root);
      $('#cTab', root).addEventListener('change', function (e) { CS.table = +e.target.value; cRender(root); });
      $('#cMin', root).addEventListener('input', function (e) { CS.min = Math.max(1, +e.target.value || 1); cRender(root); });
      $('#cStyle', root).addEventListener('change', function (e) { CS.three = e.target.value === '3'; cRender(root); });
      cRender(root);
    }
  });
})();
