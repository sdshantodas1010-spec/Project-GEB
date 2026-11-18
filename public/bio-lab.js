/* GEB Hub: ল্যাব টুল (v3.3): PCR মিক্স ক্যালকুলেটর, ল্যাব নোটবুক, গ্লসারি, প্রোটোকল ও ফর্মুলা লাইব্রেরি। */
(function () {
  'use strict';
  var T = window.GEBBT; if (!T) return;
  var U = T.u, $ = U.$, $$ = U.$$, esc = U.esc, fmt = U.fmt, D = window.GEBData;

  /* ================= PCR মিক্স ক্যালকুলেটর ================= */
  var PRE = {
    taq: ['সাধারণ Taq (১০× বাফার)', [['10× Taq buffer', 10, 1, '×'], ['dNTP mix (প্রতিটির)', 10, 0.2, 'mM'], ['Forward primer', 10, 0.4, 'µM'], ['Reverse primer', 10, 0.4, 'µM'], ['Taq polymerase', 5, 0.025, 'U/µl']]],
    mm2: ['২× PCR মাস্টার মিক্স', [['2× PCR master mix', 2, 1, '×'], ['Forward primer', 10, 0.4, 'µM'], ['Reverse primer', 10, 0.4, 'µM']]],
    hf: ['High-fidelity (৫× বাফার)', [['5× HF buffer', 5, 1, '×'], ['dNTP mix (প্রতিটির)', 10, 0.2, 'mM'], ['Forward primer', 10, 0.5, 'µM'], ['Reverse primer', 10, 0.5, 'µM'], ['High-fidelity polymerase', 2, 0.02, 'U/µl']]]
  };
  var PC = { n: 8, ctrl: 1, vol: 25, over: 10, tpl: 1, pre: 'taq', rows: [], nid: 1 };
  function pcLoad(k) { PC.pre = k; PC.rows = PRE[k][1].map(function (r) { return { id: PC.nid++, name: r[0], stock: r[1], final: r[2], unit: r[3] }; }); }
  pcLoad('taq');
  function pcRowsHtml() {
    return PC.rows.map(function (r) {
      return '<tr><td><input class="fld" data-r="' + r.id + '" data-f="name" value="' + esc(r.name) + '" aria-label="উপাদান"></td>' +
        '<td><input class="fld sm" type="number" step="any" data-r="' + r.id + '" data-f="stock" value="' + r.stock + '" aria-label="স্টক"></td>' +
        '<td><input class="fld sm" type="number" step="any" data-r="' + r.id + '" data-f="final" value="' + r.final + '" aria-label="চূড়ান্ত"></td>' +
        '<td><input class="fld sm" data-r="' + r.id + '" data-f="unit" value="' + esc(r.unit) + '" aria-label="একক"></td>' +
        '<td><button type="button" class="pl-lk" data-del="' + r.id + '" aria-label="সারি মুছুন">×</button></td></tr>';
    }).join('');
  }
  function pcHtml() {
    var f = function (k, l, st) { return '<label class="bt-f"><span>' + l + '</span><input class="fld" type="number" data-pc="' + k + '" value="' + PC[k] + '" min="0" step="' + (st || 1) + '"></label>'; };
    return '<div class="pl-card"><h3>PCR মাস্টার মিক্স ক্যালকুলেটর</h3><p class="bt-mut">কয়টি রিঅ্যাকশন করবেন তা দিন। প্রতিটি উপাদান মাস্টার মিক্সে কত µl লাগবে তা হিসাব হবে (C₁V₁ = C₂V₂)। স্টক ও চূড়ান্ত ঘনত্ব নিজের কিট অনুযায়ী বদলাতে পারেন।</p>' +
      '<div class="bt-form">' + f('n', 'নমুনার সংখ্যা') + f('ctrl', 'কন্ট্রোল (NTC ইত্যাদি)') + f('vol', 'প্রতি রিঅ্যাকশন (µl)', 'any') + f('over', 'বাড়তি % (পাইপেটিং ক্ষতি)', 'any') + f('tpl', 'টেমপ্লেট প্রতি টিউবে (µl)', 'any') + '</div>' +
      '<div class="fchips" role="group" aria-label="প্রিসেট">' + Object.keys(PRE).map(function (k) { return '<button type="button" class="fc sm" data-pre="' + k + '" aria-pressed="' + (PC.pre === k) + '">' + PRE[k][0] + '</button>'; }).join('') + '</div>' +
      '<div class="bt-tw"><table class="bt-tb bt-ed"><thead><tr><th>উপাদান</th><th>স্টক</th><th>চূড়ান্ত</th><th>একক</th><th></th></tr></thead><tbody id="pcRows">' + pcRowsHtml() + '</tbody></table></div>' +
      '<div class="bt-row"><button type="button" class="btn ghost sm" id="pcAdd">+ উপাদান যোগ (যেমন MgCl₂, DMSO)</button></div></div><div id="pcOut"></div>';
  }
  function pcCalc(root) {
    var o = $('#pcOut', root), N = (PC.n + PC.ctrl) * (1 + PC.over / 100), vol = PC.vol, rows = [], sum = 0, small = false;
    if (!(vol > 0) || !(N > 0)) { o.innerHTML = '<div class="pl-ban bad">রিঅ্যাকশনের সংখ্যা ও আয়তন দিন।</div>'; return; }
    PC.rows.forEach(function (r) { var v = (+r.stock > 0) ? vol * r.final / r.stock : NaN; if (isFinite(v)) sum += v; rows.push({ r: r, v: v, m: v * N }); });
    var water = vol - sum - PC.tpl, bad = water < -1e-9;
    var line = function (n, a, b, w) { return '<tr' + (w ? ' class="bt-w2"' : '') + '><td>' + esc(n) + '</td><td>' + a + '</td><td><b>' + b + '</b></td></tr>'; };
    var h = '<div class="pl-card"><div class="pl-hd"><div><h3>ফলাফল</h3><p class="bt-mut">মোট ' + (PC.n + PC.ctrl) + 'টি টিউব + ' + PC.over + '% বাড়তি = <b>' + fmt(N, 3) + '</b> রিঅ্যাকশনের মিক্স বানাতে হবে।</p></div><button type="button" class="btn ghost sm" id="pcCopy">তালিকা কপি</button></div>' +
      (bad ? '<div class="pl-ban bad">উপাদানগুলো মিলে ' + fmt(sum + PC.tpl) + ' µl, যা রিঅ্যাকশন আয়তন ' + vol + ' µl-এর চেয়ে বেশি। স্টক বেশি ঘন নিন বা টেমপ্লেট কমান।</div>' : '') +
      '<div class="bt-tw"><table class="bt-tb"><thead><tr><th>উপাদান</th><th>১ রিঅ্যাকশনে (µl)</th><th>মাস্টার মিক্সে (µl)</th></tr></thead><tbody>' +
      rows.map(function (x) { if (isFinite(x.m) && x.m < 0.5) small = true; return line(x.r.name, fmt(x.v, 3), fmt(x.m, 3)); }).join('') +
      line('Nuclease-free water', bad ? '–' : fmt(water, 3), bad ? '–' : fmt(water * N, 3)) +
      '<tr class="bt-sum"><td>মাস্টার মিক্স মোট</td><td>' + fmt(vol - PC.tpl, 3) + '</td><td><b>' + fmt((vol - PC.tpl) * N, 3) + '</b></td></tr></tbody></table></div>' +
      '<ol class="bt-steps"><li>মাস্টার মিক্স বানিয়ে ভালো করে মেশান, সামান্য স্পিন করুন।</li><li>প্রতি টিউবে <b>' + fmt(vol - PC.tpl, 3) + ' µl</b> মাস্টার মিক্স দিন।</li><li>তারপর প্রতি টিউবে আলাদা করে <b>' + fmt(PC.tpl, 3) + ' µl</b> টেমপ্লেট দিন (NTC-তে টেমপ্লেটের বদলে পানি)।</li></ol>' +
      (small ? '<p class="bt-mut sm">⚠ কিছু উপাদান মাস্টার মিক্সে ০.৫ µl-এর কম লাগছে। সঠিক পাইপেটিংয়ের জন্য স্টক পাতলা করে নিন বা বেশি টিউবের মিক্স বানান।</p>' : '') + '</div>';
    o.innerHTML = h;
    var txt = 'PCR master mix: ' + (PC.n + PC.ctrl) + ' tubes + ' + PC.over + '% extra; ' + vol + ' µl per reaction\n' + rows.map(function (x) { return x.r.name + ': ' + fmt(x.m, 3) + ' µl'; }).join('\n') + '\nWater: ' + fmt(water * N, 3) + ' µl\nPer tube: ' + fmt(vol - PC.tpl, 3) + ' µl mix + ' + fmt(PC.tpl, 3) + ' µl template';
    $('#pcCopy', root).addEventListener('click', function () { U.copy(txt); });
  }
  T.register('pcr', {
    html: pcHtml,
    bind: function (root) {
      $$('[data-pc]', root).forEach(function (el) { el.addEventListener('input', function () { PC[el.dataset.pc] = parseFloat(el.value) || 0; pcCalc(root); }); });
      root.addEventListener('input', function (e) {
        var el = e.target.closest('[data-r]'); if (!el) return; var r = PC.rows.filter(function (x) { return x.id === +el.dataset.r; })[0]; if (!r) return;
        r[el.dataset.f] = (el.dataset.f === 'name' || el.dataset.f === 'unit') ? el.value : (parseFloat(el.value) || 0); pcCalc(root);
      });
      root.addEventListener('click', function (e) {
        var p = e.target.closest('[data-pre]'); if (p) { pcLoad(p.dataset.pre); T.go('pcr', {}, false); return; }
        var d = e.target.closest('[data-del]'); if (d) { PC.rows = PC.rows.filter(function (x) { return x.id !== +d.dataset.del; }); $('#pcRows', root).innerHTML = pcRowsHtml(); pcCalc(root); }
      });
      $('#pcAdd', root).addEventListener('click', function () { PC.rows.push({ id: PC.nid++, name: 'নতুন উপাদান', stock: 25, final: 1.5, unit: 'mM' }); $('#pcRows', root).innerHTML = pcRowsHtml(); pcCalc(root); });
      pcCalc(root);
    }
  });

  /* ================= ল্যাব নোটবুক ================= */
  var NK = 'geb_notebook_v1', TYPES = ['PCR', 'Gel electrophoresis', 'Cloning', 'Protein', 'Microbiology', 'Tissue culture', 'Other'];
  var NB = U.lsGet(NK) || { entries: [], meta: {}, nid: 1 };
  NB.entries = NB.entries || []; NB.meta = NB.meta || {}; NB.nid = NB.nid || 1;
  var NS = { cur: null, q: '', type: 'all' };
  var nbSave = function () { if (!U.lsSet(NK, NB)) { U.toast('সেভ হয়নি: ব্রাউজারের জায়গা ভরে গেছে। ছবি কমান বা ব্যাকআপ নিয়ে পুরনো এন্ট্রি মুছুন।'); return false; } return true; };
  var byId = function (id) { return NB.entries.filter(function (e) { return e.id === id; })[0]; };
  var dateFmt = function (s) { var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], a = String(s || '').split('-'); return a.length === 3 ? a[2] + ' ' + M[+a[1] - 1] + ' ' + a[0] : (s || ''); };
  function newEntry(init) {
    var e = { id: 'n' + (NB.nid++), date: U.todayIso(), title: '', type: 'PCR', course: '', tags: '', aim: '', method: '', results: '', concl: '', imgs: [] };
    for (var k in (init || {})) e[k] = init[k]; NB.entries.unshift(e); nbSave(); return e;
  }
  function protoText(p) { return p.t + '\n' + p.steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'); }
  function nbList(root) {
    var q = NS.q.toLowerCase(), l = NB.entries.filter(function (e) { return (NS.type === 'all' || e.type === NS.type) && (!q || (e.title + ' ' + e.tags + ' ' + e.course + ' ' + e.aim).toLowerCase().indexOf(q) >= 0); })
      .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    $('#nbList', root).innerHTML = l.length ? l.map(function (e) { return '<button type="button" class="bt-li' + (e.id === NS.cur ? ' on' : '') + '" data-open="' + e.id + '"><b>' + esc(e.title || '(শিরোনাম নেই)') + '</b><small>' + dateFmt(e.date) + ' · ' + esc(e.type) + '</small></button>'; }).join('') : '<p class="bt-mut">' + (NB.entries.length ? 'কোনো এন্ট্রি মেলেনি।' : 'এখনো কোনো এন্ট্রি নেই। “নতুন এন্ট্রি” চাপুন।') + '</p>';
    var kb = Math.round(JSON.stringify(NB).length / 1024);
    $('#nbUse', root).textContent = NB.entries.length + 'টি এন্ট্রি · প্রায় ' + kb + ' KB ব্যবহৃত (ব্রাউজারের সীমা সাধারণত ~৫ MB)';
  }
  function nbEditor(root) {
    var e = byId(NS.cur), box = $('#nbEd', root);
    if (!e) { box.innerHTML = '<p class="bt-mut">বাঁ দিক থেকে এন্ট্রি বাছুন, অথবা নতুন এন্ট্রি বানান।</p>'; return; }
    var ta = function (k, l, r, ph) { return '<label class="bt-f wide"><span>' + l + '</span><textarea class="bt-ta" rows="' + r + '" data-nb="' + k + '" placeholder="' + (ph || '') + '">' + esc(e[k]) + '</textarea></label>'; };
    var inp = function (k, l, t) { return '<label class="bt-f"><span>' + l + '</span><input class="fld" type="' + (t || 'text') + '" data-nb="' + k + '" value="' + esc(e[k]) + '"></label>'; };
    box.innerHTML = '<div class="bt-form">' + inp('title', 'শিরোনাম (Experiment title)') + inp('date', 'তারিখ', 'date') +
      '<label class="bt-f"><span>ধরন</span><select class="fld" data-nb="type">' + TYPES.map(function (t) { return '<option' + (t === e.type ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' + inp('course', 'কোর্স কোড') + inp('tags', 'ট্যাগ (কমা দিয়ে)') + '</div>' +
      ta('aim', 'উদ্দেশ্য (Aim)', 2) +
      '<div class="bt-form"><label class="bt-f wide"><span>প্রোটোকল ঢোকান (পদ্ধতি অংশে যোগ হবে)</span><span class="bt-uf"><select class="fld" id="nbProto">' + D.PROTOCOLS.map(function (p) { return '<option value="' + p.id + '">' + esc(p.t) + '</option>'; }).join('') + '</select><button type="button" class="btn ghost sm" id="nbIns">ঢোকান</button></span></label></div>' +
      ta('method', 'উপকরণ ও পদ্ধতি (Materials and Methods)', 7) + ta('results', 'পর্যবেক্ষণ ও ফলাফল (Results / Observations)', 5) + ta('concl', 'আলোচনা ও সিদ্ধান্ত (Discussion / Conclusion)', 3) +
      '<div class="bt-lb">ছবি (সর্বোচ্চ ৪টি; জেল, প্লেট ইত্যাদি। নিজে ছোট করে সেভ হয়)</div><div class="bt-imgs">' + e.imgs.map(function (s, i) { return '<figure><img src="' + s + '" alt="এন্ট্রির ছবি ' + (i + 1) + '"><button type="button" class="bt-x" data-rmimg="' + i + '" aria-label="ছবি সরান">×</button></figure>'; }).join('') +
      (e.imgs.length < 4 ? '<label class="bt-add">+ ছবি<input type="file" accept="image/*" id="nbImg" multiple hidden></label>' : '') + '</div>' +
      '<div class="bt-row"><button type="button" class="btn ink sm" id="nbPrint">এই এন্ট্রি PDF / প্রিন্ট</button><button type="button" class="btn ghost sm" id="nbDel">এন্ট্রি মুছুন</button><span class="bt-mut sm" id="nbSt">নিজে নিজে সেভ হয়</span></div>';
  }
  function shrink(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () { var m = 900, s = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.72)); };
      im.onerror = function () { U.toast('ছবিটি পড়া যায়নি'); }; im.src = r.result;
    }; r.readAsDataURL(file);
  }
  function printNb(list) {
    var root = $('#btPrint'); if (!root) { root = document.createElement('div'); root.id = 'btPrint'; document.body.appendChild(root); }
    var m = NB.meta, nl = function (s) { return esc(s).replace(/\n/g, '<br>'); }, blk = function (t, s) { return s ? '<h4>' + t + '</h4><p>' + nl(s) + '</p>' : ''; };
    root.innerHTML = '<div class="nbp"><div class="nbp-h"><b>Laboratory Notebook</b><span>' + esc(m.name || '') + (m.roll ? ' · Roll ' + esc(m.roll) : '') + '</span><span>Dept. of Genetic Engineering and Biotechnology, SUST</span></div>' +
      list.map(function (e) { return '<section><h3>' + esc(e.title || 'Untitled experiment') + '</h3><p class="nbp-m">' + dateFmt(e.date) + ' · ' + esc(e.type) + (e.course ? ' · ' + esc(e.course) : '') + (e.tags ? ' · ' + esc(e.tags) : '') + '</p>' +
        blk('Aim', e.aim) + blk('Materials and Methods', e.method) + blk('Results and Observations', e.results) + (e.imgs.length ? '<div class="nbp-i">' + e.imgs.map(function (s) { return '<img src="' + s + '" alt="">'; }).join('') + '</div>' : '') + blk('Discussion / Conclusion', e.concl) + '</section>'; }).join('') + '</div>';
    document.body.classList.add('printing-bt');
    var done = function () { document.body.classList.remove('printing-bt'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done); setTimeout(function () { window.print(); }, 60);
  }
  function nbHtml() {
    return '<div class="pl-card"><div class="pl-hd"><div><h3>ডিজিটাল ল্যাব নোটবুক</h3><p class="bt-mut">তারিখ, প্রোটোকল, ফলাফল ও ছবিসহ এন্ট্রি রাখুন, পরে PDF করে ল্যাব রিপোর্টে লাগান। তথ্য ডিফল্টে শুধু এই ব্রাউজারে থাকে, তাই কমিউনিটি প্রোফাইল থেকে সিঙ্ক চালু করুন বা মাঝে মাঝে ব্যাকআপ নিন।</p></div><button type="button" class="btn pri" id="nbNew">+ নতুন এন্ট্রি</button></div>' +
      '<details class="bt-det"><summary>আমার তথ্য (প্রিন্টের মাথায় বসবে)</summary><div class="bt-form"><label class="bt-f"><span>নাম</span><input class="fld" data-meta="name" value="' + esc(NB.meta.name || '') + '"></label><label class="bt-f"><span>রোল / রেজি.</span><input class="fld" data-meta="roll" value="' + esc(NB.meta.roll || '') + '"></label></div></details></div>' +
      '<div class="bt-nb"><div class="pl-card bt-nb-l"><input class="fld" id="nbQ" type="search" placeholder="এন্ট্রি খুঁজুন" aria-label="এন্ট্রি খুঁজুন"><select class="fld" id="nbT" aria-label="ধরন"><option value="all">সব ধরন</option>' + TYPES.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select><div id="nbList" class="bt-lis"></div>' +
      '<div class="bt-row"><button type="button" class="pl-lk" id="nbAll">সব এন্ট্রি PDF</button><button type="button" class="pl-lk" id="nbExp">ব্যাকআপ নামান</button><label class="pl-lk">ফেরত আনুন<input type="file" accept="application/json,.json" id="nbImp" hidden></label></div><p class="bt-mut sm" id="nbUse"></p></div>' +
      '<div class="pl-card bt-nb-r" id="nbEd"></div></div>';
  }
  T.register('nb', {
    html: nbHtml,
    bind: function (root, opts) {
      if (opts && opts.open && byId(opts.open)) NS.cur = opts.open;
      nbList(root); nbEditor(root);
      var autosave = U.debounce(function () { if (nbSave()) { var s = $('#nbSt', root); if (s) s.textContent = 'সেভ হয়েছে'; } nbList(root); }, 500);
      $('#nbNew', root).addEventListener('click', function () { NS.cur = newEntry().id; nbList(root); nbEditor(root); });
      $('#nbQ', root).addEventListener('input', function (e) { NS.q = e.target.value; nbList(root); });
      $('#nbT', root).addEventListener('change', function (e) { NS.type = e.target.value; nbList(root); });
      $$('[data-meta]', root).forEach(function (el) { el.addEventListener('input', function () { NB.meta[el.dataset.meta] = el.value; autosave(); }); });
      $('#nbAll', root).addEventListener('click', function () { if (!NB.entries.length) { U.toast('প্রিন্ট করার মতো এন্ট্রি নেই'); return; } printNb(NB.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; })); });
      $('#nbExp', root).addEventListener('click', function () { U.download('geb-notebook-' + U.todayIso() + '.json', JSON.stringify(NB)); });
      $('#nbImp', root).addEventListener('change', function (e) {
        var f = e.target.files[0]; if (!f) return; var r = new FileReader();
        r.onload = function () { try { var v = JSON.parse(r.result); if (!v || !Array.isArray(v.entries)) throw 0; if (!confirm('বর্তমান নোটবুক এই ব্যাকআপ দিয়ে বদলে যাবে। চালিয়ে যাবেন?')) return; NB = v; NB.meta = NB.meta || {}; NB.nid = NB.nid || (v.entries.length + 1); NS.cur = null; nbSave(); T.go('nb', {}, false); U.toast('ব্যাকআপ ফেরত এসেছে'); } catch (x) { U.toast('ফাইলটি ঠিক নেই, GEB নোটবুকের ব্যাকআপ দিন'); } };
        r.readAsText(f);
      });
      root.addEventListener('click', function (e) {
        var o = e.target.closest('[data-open]'); if (o) { NS.cur = o.dataset.open; nbList(root); nbEditor(root); return; }
        var en = byId(NS.cur); if (!en) return;
        if (e.target.closest('#nbIns')) { var p = D.PROTOCOLS.filter(function (x) { return x.id === $('#nbProto', root).value; })[0]; if (p) { en.method = (en.method ? en.method + '\n\n' : '') + protoText(p); nbSave(); nbEditor(root); U.toast('প্রোটোকল যোগ হয়েছে'); } }
        else if (e.target.closest('#nbPrint')) printNb([en]);
        else if (e.target.closest('#nbDel')) { if (!confirm('এই এন্ট্রি মুছে যাবে। মুছবেন?')) return; NB.entries = NB.entries.filter(function (x) { return x.id !== en.id; }); NS.cur = null; nbSave(); nbList(root); nbEditor(root); }
        else { var rm = e.target.closest('[data-rmimg]'); if (rm) { en.imgs.splice(+rm.dataset.rmimg, 1); nbSave(); nbEditor(root); nbList(root); } }
      });
      root.addEventListener('input', function (e) { var k = e.target.dataset && e.target.dataset.nb, en = byId(NS.cur); if (!k || !en) return; en[k] = e.target.value; var s = $('#nbSt', root); if (s) s.textContent = 'সেভ হচ্ছে…'; autosave(); });
      root.addEventListener('change', function (e) {
        var en = byId(NS.cur); if (!en) return;
        if (e.target.dataset && e.target.dataset.nb === 'type') { en.type = e.target.value; autosave(); }
        if (e.target.id === 'nbImg') { var files = Array.prototype.slice.call(e.target.files).slice(0, 4 - en.imgs.length), left = files.length; files.forEach(function (f) { shrink(f, function (d) { en.imgs.push(d); if (--left === 0) { nbSave(); nbEditor(root); nbList(root); } }); }); }
      });
    }
  });
  /* অন্য ট্যাব (প্রোটোকল) থেকে নোটবুকে নেওয়ার জন্য */
  T.nbFromProtocol = function (p) { var e = newEntry({ title: p.t, type: ({ DNA: 'PCR', Cloning: 'Cloning', Protein: 'Protein', Micro: 'Microbiology', Plant: 'Tissue culture' })[p.cat] || 'Other', aim: p.aim, method: protoText(p) }); NS.cur = e.id; T.go('nb', { open: e.id }); };

  /* ================= গ্লসারি ================= */
  var GS = { q: '', cat: 'all' }, GL = (D.GLOSSARY || []).slice().sort(function (a, b) { return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1; });
  function gList(root) {
    var q = GS.q.toLowerCase(), l = GL.filter(function (g) { return (GS.cat === 'all' || g[1] === GS.cat) && (!q || (g[0] + ' ' + g[2] + ' ' + g[3]).toLowerCase().indexOf(q) >= 0); });
    $('#gCount', root).textContent = l.length + 'টি টার্ম';
    $('#gList', root).innerHTML = l.length ? l.map(function (g) { return '<article class="bt-gt"><h4>' + esc(g[0]) + ' <span class="chip gray">' + esc(g[1]) + '</span></h4><p class="bt-en">' + esc(g[2]) + '</p><p class="bt-bn">' + esc(g[3]) + '</p></article>'; }).join('') : '<p class="bt-mut">কোনো টার্ম মেলেনি।</p>';
  }
  T.register('gloss', {
    html: function (opts) { if (opts && opts.q != null) { GS.q = opts.q; GS.cat = 'all'; } var cats = []; GL.forEach(function (g) { if (cats.indexOf(g[1]) < 0) cats.push(g[1]); }); cats.sort();
      return '<div class="pl-card"><div class="pl-hd"><div><h3>বায়োটেক গ্লসারি</h3><p class="bt-mut">ইংরেজি সংজ্ঞা (পরীক্ষার উত্তর লেখার জন্য) ও বাংলা ব্যাখ্যা পাশাপাশি। উপরের “আজকের টার্ম” প্রতিদিন নিজে বদলায়।</p></div><span class="count" id="gCount"></span></div>' +
        '<input class="fld bt-wide" id="gQ" type="search" placeholder="টার্ম বা শব্দ খুঁজুন, যেমন plasmid, প্রাইমার" value="' + esc(GS.q) + '" aria-label="গ্লসারিতে খুঁজুন">' +
        '<div class="fchips" role="group" aria-label="ক্যাটাগরি"><button type="button" class="fc sm" data-gc="all" aria-pressed="' + (GS.cat === 'all') + '">সব</button>' + cats.map(function (c) { return '<button type="button" class="fc sm" data-gc="' + esc(c) + '" aria-pressed="' + (GS.cat === c) + '">' + esc(c) + '</button>'; }).join('') + '</div></div><div class="bt-gl" id="gList"></div>'; },
    bind: function (root) {
      gList(root);
      $('#gQ', root).addEventListener('input', function (e) { GS.q = e.target.value; gList(root); });
      root.addEventListener('click', function (e) { var c = e.target.closest('[data-gc]'); if (!c) return; GS.cat = c.dataset.gc; $$('[data-gc]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b === c)); }); gList(root); });
    }
  });

  /* ================= প্রোটোকল ও ফর্মুলা লাইব্রেরি ================= */
  var LS2 = { sub: 'pro', cat: 'all', q: '', rec: 'tae50', vol: null, calc: null };
  var CATL = {}; D.PROTO_CATS.forEach(function (c) { CATL[c[0]] = c[1]; });
  function proHtml(p) {
    var go = '';
    if (p.go) { var g = p.go.split(':'); go = g[0] === 'pcr' ? '<button type="button" class="btn ghost sm" data-gt="pcr">PCR মিক্স ক্যালকুলেটর</button>' : g[0] === 'restr' ? '<button type="button" class="btn ghost sm" data-gt="restr">রিস্ট্রিকশন ম্যাপ</button>' : g[0] === 'gel' ? '<button type="button" class="btn ghost sm" data-gc2="gel">জেল ক্যালকুলেটর</button>' : g[0] === 'calc' ? '<button type="button" class="btn ghost sm" data-gc2="' + g[1] + '">ক্যালকুলেটর খুলুন</button>' : g[0] === 'recipe' ? '<button type="button" class="btn ghost sm" data-gr="' + g[1] + '">সলিউশন রেসিপি</button>' : g[0] === 'ligation' ? '<button type="button" class="btn ghost sm" data-gc2="ligation">লাইগেশন ক্যালকুলেটর</button>' : ''; }
    return '<details class="bt-pro" id="pro-' + p.id + '"><summary><b>' + esc(p.t) + '</b><span class="chip">' + esc(CATL[p.cat] || p.cat) + '</span></summary><div class="bt-pb"><p><b>Aim.</b> ' + esc(p.aim) + '</p>' +
      '<h5>Materials</h5><ul>' + p.mat.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul><h5>Procedure</h5><ol class="bt-steps">' + p.steps.map(function (s) { return '<li><label><input type="checkbox"> <span>' + esc(s) + '</span></label></li>'; }).join('') + '</ol>' +
      '<h5>টিপস ও সমস্যা সমাধান</h5><ul>' + p.tips.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' + (p.safe ? '<div class="pl-ban bad">⚠ ' + esc(p.safe) + '</div>' : '') +
      '<div class="bt-row"><button type="button" class="btn ghost sm" data-pcopy="' + p.id + '">কপি</button><button type="button" class="btn ghost sm" data-pnb="' + p.id + '">নোটবুকে নিন</button>' + go + '</div></div></details>';
  }
  function proList(root) {
    var q = LS2.q.toLowerCase(), l = D.PROTOCOLS.filter(function (p) { return (LS2.cat === 'all' || p.cat === LS2.cat) && (!q || (p.t + ' ' + p.aim + ' ' + p.mat.join(' ')).toLowerCase().indexOf(q) >= 0); });
    $('#proList', root).innerHTML = l.length ? l.map(proHtml).join('') : '<p class="bt-mut">কোনো প্রোটোকল মেলেনি।</p>';
  }
  function recHtml() {
    var r = D.RECIPES.filter(function (x) { return x.id === LS2.rec; })[0] || D.RECIPES[0], vol = LS2.vol || r.base, k = vol / r.base;
    return '<div class="pl-card"><h3>সলিউশন রেসিপি (স্কেল করা)</h3><p class="bt-mut">রেসিপি বেছে যত আয়তন বানাতে চান দিন, উপাদানের পরিমাণ নিজে হিসাব হবে।</p><div class="bt-form"><label class="bt-f wide"><span>রেসিপি</span><select class="fld" id="rcSel">' + D.RECIPES.map(function (x) { return '<option value="' + x.id + '"' + (x.id === r.id ? ' selected' : '') + '>' + esc(x.t) + '</option>'; }).join('') + '</select></label>' +
      '<label class="bt-f"><span>চূড়ান্ত আয়তন (ml)</span><input class="fld" type="number" id="rcVol" min="0" step="any" value="' + vol + '"></label></div>' +
      '<div class="fchips">' + [10, 50, 100, 250, 500, 1000].map(function (v) { return '<button type="button" class="fc sm" data-rv="' + v + '">' + v + ' ml</button>'; }).join('') + '<button type="button" class="fc sm" data-rv="' + r.base + '">মূল (' + r.base + ' ml)</button></div>' +
      '<div class="bt-tw"><table class="bt-tb"><thead><tr><th>উপাদান</th><th>পরিমাণ</th></tr></thead><tbody>' + r.items.map(function (i) { var q = i[1] * k, u = i[2]; if (u === 'g' && q < 1) { q *= 1000; u = 'mg'; } else if (u === 'ml' && q < 1) { q *= 1000; u = 'µl'; } else if (u === 'mg' && q >= 1000) { q /= 1000; u = 'g'; } return '<tr><td>' + esc(i[0]) + '</td><td><b>' + fmt(q, 3) + '</b> ' + u + '</td></tr>'; }).join('') + '<tr class="bt-sum"><td>পানি যোগ করে মোট আয়তন</td><td><b>' + fmt(vol, 4) + '</b> ml</td></tr></tbody></table></div>' +
      '<p class="bt-mut sm">' + esc(r.note) + '</p></div>';
  }
  /* ---- ক্যালকুলেটর ---- */
  var rd = function (c, n) { var e = c.querySelector('[data-n="' + n + '"]'); return (!e || e.value === '') ? NaN : parseFloat(e.value); };
  var rs = function (c, n) { var e = c.querySelector('[data-n="' + n + '"]'); return e ? e.value : ''; };
  var F = function (n, l, v, x) { return '<label class="bt-f"><span>' + l + '</span><input class="fld" type="number" step="any" data-n="' + n + '" value="' + (v == null ? '' : v) + '" ' + (x || '') + '></label>'; };
  var UF = function (n, l, v, units) { return '<label class="bt-f"><span>' + l + '</span><span class="bt-uf"><input class="fld" type="number" step="any" data-n="' + n + '" value="' + (v == null ? '' : v) + '"><select class="fld" data-n="' + n + 'U">' + units.map(function (u) { return '<option>' + u + '</option>'; }).join('') + '</select></span></label>'; };
  var SL = function (n, l, opts) { return '<label class="bt-f"><span>' + l + '</span><select class="fld" data-n="' + n + '">' + opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></label>'; };
  var out = function (c, h) { c.querySelector('.bt-res').innerHTML = h; };
  var hint = function (t) { return '<p class="bt-mut sm">' + t + '</p>'; };
  var oneBlank = function (a) { var b = a.filter(function (x) { return isNaN(x); }).length; return b === 1; };
  var FM = { M: 1, mM: 1e-3, 'µM': 1e-6 }, FV = { ml: 1e-3, L: 1, 'µl': 1e-6 }, FG = { g: 1, mg: 1e-3, 'µg': 1e-6 };
  var CALCS = [
    { id: 'mol', t: 'মোলারিটি ⇄ ভর', d: 'ফাঁকা রাখা ঘরটি (ভর, মোলারিটি বা আয়তন) বের হবে। সূত্র: ভর = M × V × MW ÷ বিশুদ্ধতা।',
      h: function () { return SL('rg', 'রিএজেন্ট (MW বসাতে)', [['', '— বাছুন —']].concat(D.REAGENTS.map(function (r) { return [r[1], r[0] + ' (' + r[1] + ')']; }))) + F('mw', 'MW (g/mol)') + F('pur', 'বিশুদ্ধতা %', 100) + UF('m', 'ভর', null, ['g', 'mg', 'µg']) + UF('M', 'মোলারিটি', null, ['M', 'mM', 'µM']) + UF('V', 'আয়তন', null, ['ml', 'L', 'µl']); },
      r: function (c) {
        var mw = rd(c, 'mw'), pu = rd(c, 'pur') / 100 || 1, m = rd(c, 'm'), M = rd(c, 'M'), V = rd(c, 'V'), um = rs(c, 'mU'), uM = rs(c, 'MU'), uV = rs(c, 'VU');
        if (!(mw > 0)) return out(c, hint('MW দিন (বা রিএজেন্ট বাছুন)।')); if (!oneBlank([m, M, V])) return out(c, hint('ভর, মোলারিটি ও আয়তনের মধ্যে ঠিক একটি ঘর ফাঁকা রাখুন।'));
        var r, s;
        if (isNaN(m)) { r = M * FM[uM] * V * FV[uV] * mw / pu; s = 'প্রয়োজনীয় ভর = <b>' + fmt(r / FG[um]) + ' ' + um + '</b> (= ' + fmt(r) + ' g = ' + fmt(r * 1000) + ' mg)'; }
        else if (isNaN(M)) { r = m * FG[um] * pu / (mw * V * FV[uV]); s = 'মোলারিটি = <b>' + fmt(r / FM[uM]) + ' ' + uM + '</b> (= ' + fmt(r) + ' M)'; }
        else { r = m * FG[um] * pu / (mw * M * FM[uM]); s = 'আয়তন = <b>' + fmt(r / FV[uV]) + ' ' + uV + '</b> (= ' + fmt(r * 1000) + ' ml)'; }
        out(c, '<p>' + s + '</p>' + hint('ভর মেপে প্রায় ৮০% পানিতে গুলুন, pH ঠিক করুন, তারপর আয়তন পূর্ণ করুন।'));
      } },
    { id: 'dilution', t: 'ডাইলুশন (C₁V₁ = C₂V₂)', d: 'চারটির যেকোনো একটি ফাঁকা রাখুন। একক দুই দিকে একই হতে হবে। 50× স্টক থেকে 1× করতে C₁ = 50, C₂ = 1।',
      h: function () { return F('c1', 'C₁ (স্টক ঘনত্ব)') + F('v1', 'V₁ (স্টকের আয়তন)') + F('c2', 'C₂ (চূড়ান্ত ঘনত্ব)') + F('v2', 'V₂ (চূড়ান্ত আয়তন)'); },
      r: function (c) {
        var a = { c1: rd(c, 'c1'), v1: rd(c, 'v1'), c2: rd(c, 'c2'), v2: rd(c, 'v2') };
        if (!oneBlank([a.c1, a.v1, a.c2, a.v2])) return out(c, hint('চারটির মধ্যে ঠিক একটি ঘর ফাঁকা রাখুন।'));
        if (isNaN(a.c1)) a.c1 = a.c2 * a.v2 / a.v1; else if (isNaN(a.v1)) a.v1 = a.c2 * a.v2 / a.c1; else if (isNaN(a.c2)) a.c2 = a.c1 * a.v1 / a.v2; else a.v2 = a.c1 * a.v1 / a.c2;
        var w = a.v2 - a.v1, nm = { c1: 'C₁', v1: 'V₁', c2: 'C₂', v2: 'V₂' }, k = ['c1', 'v1', 'c2', 'v2'].filter(function (x) { return isNaN(rd(c, x)); })[0];
        out(c, '<p>' + nm[k] + ' = <b>' + fmt(a[k]) + '</b></p>' + (w >= 0 ? '<p>ডাইলুয়েন্ট (পানি/বাফার) = V₂ − V₁ = <b>' + fmt(w) + '</b></p>' : '<p class="bt-w">V₁ বেশি হয়ে গেছে, ঘনত্ব বাড়ানো যায় না (C₂ > C₁)।</p>'));
      } },
    { id: 'serial', t: 'সিরিয়াল ডাইলুশন', d: 'প্রতি ধাপের ডাইলুয়েন্ট আয়তন ও মোট ডাইলুশন। শুরুর ঘনত্ব দিলে প্রতি টিউবের ঘনত্বও আসবে।',
      h: function () { return F('f', 'ডাইলুশন ফ্যাক্টর (যেমন ১০)', 10) + F('n', 'ধাপ সংখ্যা', 6) + F('vt', 'প্রতি ধাপে স্থানান্তর (ml)', 1) + F('c0', 'শুরুর ঘনত্ব (ঐচ্ছিক)'); },
      r: function (c) {
        var f = rd(c, 'f'), n = Math.min(12, Math.round(rd(c, 'n'))), vt = rd(c, 'vt'), c0 = rd(c, 'c0');
        if (!(f > 1) || !(n > 0) || !(vt > 0)) return out(c, hint('ফ্যাক্টর (১-এর বেশি), ধাপ ও আয়তন দিন।'));
        var h = '<p>প্রতি টিউবে ডাইলুয়েন্ট = <b>' + fmt(vt * (f - 1)) + ' ml</b>, মোট আয়তন ' + fmt(vt * f) + ' ml (এর মধ্যে ' + fmt(vt) + ' ml আগের টিউব থেকে)।</p><div class="bt-tw"><table class="bt-tb"><thead><tr><th>টিউব</th><th>ডাইলুশন</th><th>' + (f === 10 ? '10<sup>-n</sup>' : 'মোট ফ্যাক্টর') + '</th>' + (isNaN(c0) ? '' : '<th>ঘনত্ব</th>') + '</tr></thead><tbody>';
        for (var i = 1; i <= n; i++) h += '<tr><td>' + i + '</td><td>1 : ' + fmt(Math.pow(f, i)) + '</td><td>' + (f === 10 ? '10<sup>-' + i + '</sup>' : fmt(Math.pow(f, i))) + '</td>' + (isNaN(c0) ? '' : '<td>' + fmt(c0 / Math.pow(f, i)) + '</td>') + '</tr>';
        out(c, h + '</tbody></table></div>');
      } },
    { id: 'pct', t: 'শতকরা (%) দ্রবণ', d: 'w/v: প্রতি ১০০ ml-এ কত g। v/v: প্রতি ১০০ ml-এ কত ml।',
      h: function () { return SL('t', 'ধরন', [['wv', 'w/v (g / 100 ml)'], ['vv', 'v/v (ml / 100 ml)']]) + F('p', 'শতকরা (%)') + F('v', 'চূড়ান্ত আয়তন (ml)'); },
      r: function (c) { var p = rd(c, 'p'), v = rd(c, 'v'), wv = rs(c, 't') === 'wv'; if (!(p > 0) || !(v > 0)) return out(c, hint('শতকরা ও আয়তন দিন।')); var q = p * v / 100; out(c, '<p><b>' + fmt(q) + (wv ? ' g' : ' ml') + '</b> ' + (wv ? 'দ্রব' : 'তরল') + ' নিয়ে পানি দিয়ে মোট <b>' + fmt(v) + ' ml</b> করুন।</p>' + (wv ? hint('যেমন ১% অ্যাগারোজ জেল = ১০০ ml বাফারে ১ g।') : '')); } },
    { id: 'stock', t: 'ঘন অ্যাসিড/স্টক থেকে দ্রবণ', d: 'বোতলের % ও ঘনত্ব (density) থেকে স্টকের মোলারিটি বের করে কত ml লাগবে তা হিসাব করে।',
      h: function () { return SL('a', 'রিএজেন্ট', D.ACIDS.map(function (a, i) { return [i, a[0]]; }).concat([['x', 'নিজে দিন']])) + F('pc', '% (w/w)', D.ACIDS[0][1]) + F('dn', 'Density (g/ml)', D.ACIDS[0][2]) + F('mw', 'MW (g/mol)', D.ACIDS[0][3]) + F('M', 'চান: মোলারিটি (M)') + F('V', 'চান: আয়তন (ml)'); },
      r: function (c, e) {
        if (e && e.target.dataset.n === 'a' && e.target.value !== 'x') { var a = D.ACIDS[+e.target.value]; c.querySelector('[data-n="pc"]').value = a[1]; c.querySelector('[data-n="dn"]').value = a[2]; c.querySelector('[data-n="mw"]').value = a[3]; }
        var pc = rd(c, 'pc'), dn = rd(c, 'dn'), mw = rd(c, 'mw'), M = rd(c, 'M'), V = rd(c, 'V'); if (!(pc > 0 && dn > 0 && mw > 0)) return out(c, hint('% , density ও MW দিন।'));
        var M0 = pc * dn * 10 / mw; if (!(M > 0) || !(V > 0)) return out(c, '<p>স্টকের মোলারিটি ≈ <b>' + fmt(M0) + ' M</b></p>' + hint('চাওয়া মোলারিটি ও আয়তন দিলে কত ml স্টক লাগবে বলে দেবে।'));
        var v1 = M * V / M0; out(c, '<p>স্টকের মোলারিটি ≈ ' + fmt(M0) + ' M</p>' + (v1 > V ? '<p class="bt-w">চাওয়া ঘনত্ব স্টকের চেয়ে বেশি।</p>' : '<p><b>' + fmt(v1) + ' ml</b> স্টক নিয়ে মোট <b>' + fmt(V) + ' ml</b> করুন (পানি ≈ ' + fmt(V - v1) + ' ml)।</p>') + '<p class="bt-w">⚠ সব সময় পানিতে অ্যাসিড ধীরে ধীরে ঢালুন (উল্টো নয়), ফিউম হুডে, গ্লাভস-গগলস পরে।</p>');
      } },
    { id: 'a260', t: 'DNA/RNA ঘনত্ব (A260)', d: 'শোষণ (absorbance) থেকে ঘনত্ব ও বিশুদ্ধতার হিসাব।',
      h: function () { return SL('t', 'ধরন', [['50', 'dsDNA (50 µg/ml)'], ['40', 'RNA (40 µg/ml)'], ['33', 'ssDNA (33 µg/ml)']]) + F('a', 'A260') + F('df', 'ডাইলুশন ফ্যাক্টর', 1) + F('a280', 'A280 (ঐচ্ছিক)') + F('a230', 'A230 (ঐচ্ছিক)'); },
      r: function (c) {
        var a = rd(c, 'a'), df = rd(c, 'df') || 1, t = +rs(c, 't'), a280 = rd(c, 'a280'), a230 = rd(c, 'a230'); if (!(a > 0)) return out(c, hint('A260 দিন।'));
        var h = '<p>ঘনত্ব = <b>' + fmt(a * df * t) + ' µg/ml</b> (সংখ্যায় একই = ' + fmt(a * df * t) + ' ng/µl)</p>';
        if (a280 > 0) { var r = a / a280, ex = t === 40 ? 2.0 : 1.8; h += '<p>A260/A280 = <b>' + r.toFixed(2) + '</b> (আদর্শ ≈ ' + ex + ')' + (r < ex - 0.15 ? ' <span class="bt-w">কম: প্রোটিন/ফেনল থাকতে পারে</span>' : (r > ex + 0.25 ? ' <span class="bt-w">বেশি: RNA বা অন্য দূষণ থাকতে পারে</span>' : ' ✓')) + '</p>'; }
        if (a230 > 0) { var r2 = a / a230; h += '<p>A260/A230 = <b>' + r2.toFixed(2) + '</b> (আদর্শ ২.০–২.২)' + (r2 < 1.8 ? ' <span class="bt-w">কম: লবণ/ফেনল/কার্বোহাইড্রেট থাকতে পারে</span>' : ' ✓') + '</p>'; }
        if (a < 0.1 || a > 1.5) h += hint('A260 ০.১–১.০-এর মধ্যে হলে রিডিং বেশি নির্ভরযোগ্য; নমুনা পাতলা বা ঘন করে আবার মাপুন।');
        out(c, h);
      } },
    
    
    { id: 'rcf', t: 'সেন্ট্রিফিউজ: rpm ⇄ g', d: 'RCF = 1.118 × 10⁻⁵ × r(cm) × rpm²। rpm বা g-এর একটি ফাঁকা রাখুন।',
      h: function () { return F('r', 'রোটরের ব্যাসার্ধ (cm)') + F('rpm', 'rpm') + F('g', '× g (RCF)'); },
      r: function (c) { var r = rd(c, 'r'), rpm = rd(c, 'rpm'), g = rd(c, 'g'); if (!(r > 0) || !oneBlank([rpm, g])) return out(c, hint('ব্যাসার্ধ দিন এবং rpm/g-এর একটি ফাঁকা রাখুন।')); out(c, isNaN(g) ? '<p><b>' + fmt(1.118e-5 * r * rpm * rpm) + ' × g</b></p>' : '<p><b>' + fmt(Math.sqrt(g / (1.118e-5 * r))) + ' rpm</b></p>'); } },
    { id: 'gel', t: 'অ্যাগারোজ জেলের রেসিপি', d: 'শতকরা ও আয়তন দিলে কত g অ্যাগারোজ লাগবে।',
      h: function () { return F('p', 'জেল %', 1) + F('v', 'বাফার আয়তন (ml)', 50); },
      r: function (c) { var p = rd(c, 'p'), v = rd(c, 'v'); if (!(p > 0 && v > 0)) return out(c, hint('দুটি ঘর পূরণ করুন।')); out(c, '<p>অ্যাগারোজ = <b>' + fmt(p * v / 100) + ' g</b>, 1× TAE/TBE = ' + fmt(v) + ' ml</p>' + hint('আলাদা করতে পারা DNA-র মাপ (প্রায়): ০.৭% → ০.৮–১০ kb · ১% → ০.৫–৭ kb · ১.৫% → ০.২–৩ kb · ২% → ০.১–২ kb।')); } }
  ];
  function calcHtml() {
    return '<div class="bt-cg">' + CALCS.map(function (c) { return '<div class="pl-card bt-calc" id="calc-' + c.id + '" data-calc="' + c.id + '"><h3>' + c.t + '</h3><p class="bt-mut sm">' + c.d + '</p><div class="bt-form">' + c.h() + '</div><div class="bt-res"></div></div>'; }).join('') + '</div>';
  }
  function libHtml(opts) {
    if (opts && opts.sub) LS2.sub = opts.sub; if (opts && opts.recipe) LS2.rec = opts.recipe; if (opts && opts.calc) LS2.calc = opts.calc;
    var body = LS2.sub === 'pro' ? '<div class="pl-card"><input class="fld bt-wide" id="proQ" type="search" placeholder="প্রোটোকল খুঁজুন (PCR, gel, Gram…)" value="' + esc(LS2.q) + '" aria-label="প্রোটোকল খুঁজুন"><div class="fchips" role="group" aria-label="ধরন">' + D.PROTO_CATS.map(function (c) { return '<button type="button" class="fc sm" data-pc2="' + c[0] + '" aria-pressed="' + (LS2.cat === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div><p class="bt-mut sm">ধাপগুলো সাধারণ পাঠ্যবই-মানের নমুনা। আপনার ল্যাবের ম্যানুয়াল ও শিক্ষকের নির্দেশ সব সময় আগে।</p></div><div id="proList"></div>' : LS2.sub === 'rec' ? '<div id="recBox">' + recHtml() + '</div>' : calcHtml();
    return '<div class="seg tabs bt-sub" role="tablist">' + [['pro', 'প্রোটোকল'], ['rec', 'সলিউশন রেসিপি'], ['calc', 'ফর্মুলা ক্যালকুলেটর']].map(function (t) { return '<button type="button" role="tab" data-ls="' + t[0] + '" aria-selected="' + (LS2.sub === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' + body;
  }
  T.register('lib', {
    html: libHtml,
    bind: function (root) {
      if (LS2.sub === 'pro') proList(root);
      if (LS2.sub === 'calc') { $$('.bt-calc', root).forEach(function (c) { CALCS.filter(function (x) { return x.id === c.dataset.calc; })[0].r(c); }); if (LS2.calc) { var t = $('#calc-' + LS2.calc, root); LS2.calc = null; if (t) setTimeout(function () { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('flash'); }, 80); } }
      var pq = $('#proQ', root); if (pq) pq.addEventListener('input', function (e) { LS2.q = e.target.value; proList(root); });
      function recRedraw() { $('#recBox', root).innerHTML = recHtml(); }
      root.addEventListener('input', function (e) {
        var c = e.target.closest('.bt-calc'); if (c) { CALCS.filter(function (x) { return x.id === c.dataset.calc; })[0].r(c, e); return; }
        if (e.target.id === 'rcVol') { LS2.vol = parseFloat(e.target.value) || null; var pos = e.target.selectionStart; recRedraw(); var v = $('#rcVol', root); v.focus(); try { v.setSelectionRange(pos, pos); } catch (x) { } }
      });
      root.addEventListener('change', function (e) {
        var c = e.target.closest('.bt-calc'); if (c) { CALCS.filter(function (x) { return x.id === c.dataset.calc; })[0].r(c, e); return; }
        if (e.target.id === 'rcSel') { LS2.rec = e.target.value; LS2.vol = null; recRedraw(); }
      });
      root.addEventListener('click', function (e) {
        var b;
        if ((b = e.target.closest('[data-ls]'))) { LS2.sub = b.dataset.ls; T.go('lib', {}, false); return; }
        if ((b = e.target.closest('[data-pc2]'))) { LS2.cat = b.dataset.pc2; $$('[data-pc2]', root).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); proList(root); return; }
        if ((b = e.target.closest('[data-rv]'))) { LS2.vol = +b.dataset.rv; recRedraw(); return; }
        if ((b = e.target.closest('[data-pcopy]'))) { var p = D.PROTOCOLS.filter(function (x) { return x.id === b.dataset.pcopy; })[0]; if (p) U.copy(protoText(p)); return; }
        if ((b = e.target.closest('[data-pnb]'))) { var q = D.PROTOCOLS.filter(function (x) { return x.id === b.dataset.pnb; })[0]; if (q) T.nbFromProtocol(q); return; }
        if ((b = e.target.closest('[data-gt]'))) { T.go(b.dataset.gt, {}); return; }
        if ((b = e.target.closest('[data-gc2]'))) { LS2.sub = 'calc'; T.go('lib', { calc: b.dataset.gc2 }, false); return; }
        if ((b = e.target.closest('[data-gr]'))) { LS2.sub = 'rec'; LS2.vol = null; T.go('lib', { recipe: b.dataset.gr }, false); }
      });
    }
  });
})();
