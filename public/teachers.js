/* GENESIS 22: Department & Faculty Directory (#tcMount) */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CONTACTS = [
    {
      name: 'Department of Genetic Engineering & Biotechnology (GEB)',
      role: 'SUST Official Department Office',
      room: 'Academic Building E, SUST, Sylhet-3114',
      web: 'https://www.sust.edu/departments/geb',
      note: 'অফিসিয়াল নোটিস, ক্লাস রুটিন ও অনুষদ তালিকার জন্য বিভাগের ওয়েবসাইট দেখুন।'
    }
  ];

  window.GEBReady = window.GEBReady || [];
  window.GEBReady.push(function () {
    const mount = document.getElementById('tcMount');
    if (!mount) return;
    let q = '';
    function render() {
      const term = q.trim().toLowerCase();
      const list = CONTACTS.filter(t => !term || (t.name + ' ' + t.role + ' ' + t.room).toLowerCase().includes(term));
      const keep = document.activeElement && document.activeElement.id === 'tcQ';
      mount.innerHTML = `<div class="tc-bar">
          <input class="fld" id="tcQ" type="search" placeholder="নাম বা পদবি দিয়ে খুঁজুন…" value="${esc(q)}" aria-label="শিক্ষক খুঁজুন">
          <span class="count">তথ্য যাচাইয়ের পর ব্যক্তিগত শিক্ষক প্রোফাইল এখানে যুক্ত হবে</span>
        </div>
        <div class="tc-grid">${list.length ? list.map(t => `<article class="tc">
          <div class="tc-top">
            <div class="tc-av" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8z"/><path d="M4 21a8 8 0 0116 0"/></svg></div>
            <div class="tc-id"><h3>${esc(t.name)}</h3><p>${esc(t.role)}</p></div>
          </div>
          <dl class="tc-meta">
            <div><dt>অবস্থান</dt><dd>${esc(t.room)}</dd></div>
            <div><dt>ওয়েব</dt><dd><a href="${esc(t.web)}" target="_blank" rel="noopener">sust.edu/departments/geb</a></dd></div>
          </dl>
          <p class="count" style="margin:0">${esc(t.note)}</p>
        </article>`).join('') : '<div class="empty-state"><b>কোনো তথ্য মেলেনি</b><span>অন্য শব্দ দিয়ে খুঁজুন।</span></div>'}</div>`;
      if (keep) { const inp = document.getElementById('tcQ'); inp.focus(); inp.setSelectionRange(q.length, q.length); }
    }
    mount.addEventListener('input', e => { if (e.target.id === 'tcQ') { q = e.target.value; render(); } });
    render();
  });
})();
