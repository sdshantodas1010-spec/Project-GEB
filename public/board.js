/* GENESIS 22: নোটিস বোর্ড। তথ্য data.json-এর notices থেকে।
   প্রতিটি নোটিস: { id, type: info|new|warn, cat, pinned, date: 'YYYY-MM-DD', title, text, link?, until?: 'YYYY-MM-DD' } */
(function () {
  'use strict';
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var bn = function (n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };
  var MON = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  var KIND = { warn: 'জরুরি', new: 'নতুন', info: 'নোটিস' };
  function fdate(s) { var p = String(s).split('-'); return p.length === 3 ? bn(+p[2]) + ' ' + MON[+p[1] - 1] + ' ' + bn(p[0]) : s; }
  function ago(s) {
    var d = new Date(s + 'T00:00:00'), n = new Date(); n.setHours(0, 0, 0, 0);
    var k = Math.round((n - d) / 864e5);
    return k <= 0 ? 'আজ' : k === 1 ? 'গতকাল' : k < 30 ? bn(k) + ' দিন আগে' : k < 365 ? bn(Math.floor(k / 30)) + ' মাস আগে' : fdate(s);
  }
  window.GEBReady = window.GEBReady || [];
  window.GEBReady.push(function (D) {
    var mount = document.getElementById('boardMount'); if (!mount) return;
    var today = new Date().toISOString().slice(0, 10);
    var all = (D.notices || []).filter(function (n) { return !n.until || n.until >= today; })
      .sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)); });
    var cat = 'all', q = '';
    function card(n) {
      var link = n.link ? (/^#/.test(n.link) ? '<a class="nb-link" href="' + esc(n.link) + '">দেখুন</a>' : '<a class="nb-link" href="' + esc(n.link) + '" target="_blank" rel="noopener">লিংক খুলুন</a>') : '';
      return '<article class="nb-card ' + esc(n.type || 'info') + (n.pinned ? ' pin' : '') + '"><div class="nb-top"><span class="nb-kind">' + (KIND[n.type] || 'নোটিস') + '</span><span class="nb-cat">' + esc(n.cat || 'সাধারণ') + '</span>' + (n.pinned ? '<span class="nb-pin">পিন করা</span>' : '') + '<time datetime="' + esc(n.date) + '">' + esc(fdate(n.date)) + ' · ' + esc(ago(n.date)) + '</time></div>' +
        '<h3>' + esc(n.title || n.text) + '</h3>' + (n.title ? '<p>' + esc(n.text) + '</p>' : '') + link + '</article>';
    }
    function render() {
      var cats = []; all.forEach(function (n) { var c = n.cat || 'সাধারণ'; if (cats.indexOf(c) < 0) cats.push(c); });
      var term = q.trim().toLowerCase();
      var list = all.filter(function (n) { return (cat === 'all' || (n.cat || 'সাধারণ') === cat) && (!term || ((n.title || '') + ' ' + n.text).toLowerCase().indexOf(term) >= 0); });
      var keep = document.activeElement && document.activeElement.id === 'nbQ';
      mount.innerHTML = '<div class="nb-bar"><div class="seg tabs" role="group" aria-label="ক্যাটাগরি"><button type="button" data-nc="all" aria-pressed="' + (cat === 'all') + '">সব (' + bn(all.length) + ')</button>' +
        cats.map(function (c) { return '<button type="button" data-nc="' + esc(c) + '" aria-pressed="' + (cat === c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
        '<input class="fld" id="nbQ" type="search" placeholder="নোটিস খুঁজুন" value="' + esc(q) + '" aria-label="নোটিস খুঁজুন"></div>' +
        '<div class="nb-list">' + (list.length ? list.map(card).join('') : '<div class="empty-state"><b>কোনো নোটিস নেই</b><span>নতুন নোটিস এলে এখানে দেখা যাবে।</span></div>') + '</div>';
      if (keep) { var i = document.getElementById('nbQ'); i.focus(); i.setSelectionRange(q.length, q.length); }
    }
    mount.addEventListener('click', function (e) { var b = e.target.closest('[data-nc]'); if (b) { cat = b.dataset.nc; render(); } });
    mount.addEventListener('input', function (e) { if (e.target.id === 'nbQ') { q = e.target.value; render(); } });
    render();
  });
})();
