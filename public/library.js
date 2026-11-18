/* GENESIS 22: Course Library (#libMount) */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

  window.GEBReady = window.GEBReady || [];
  window.GEBReady.push(function (D) {
    const mount = document.getElementById('libMount');
    if (!mount) return;
    const lib = D.library || {};
    const sem = (D.curriculum || []).find(s => s.y === 1 && s.s === 2) || (D.curriculum || [])[0];
    const courses = sem ? sem.courses : [];
    const CM = D.subjects || {};
    let q = '';

    const groupHtml = (title, items) => {
      const list = Array.isArray(items) ? items : [];
      return `<div class="lb-g"><h4><span>${title}</span><em>${bn(list.length)}</em></h4>${
        list.length
          ? `<ul>${list.map(x => `<li class="lb-item"><div class="lb-t"><b>${esc(x.title || x.t || 'ফাইল')}</b>${x.by ? `<small>${esc(x.by)}</small>` : ''}</div>${x.url ? `<a class="lb-open" href="${esc(x.url)}" target="_blank" rel="noopener">খুলুন</a>` : '<span class="lb-tag">শীঘ্রই</span>'}</li>`).join('')}</ul>`
          : '<p class="lb-empty">এখনো কিছু যোগ হয়নি</p>'
      }</div>`;
    };

    function render() {
      const term = q.trim().toLowerCase();
      const filtered = courses.filter(c => !term || (c.code + ' ' + c.title).toLowerCase().includes(term));
      let totalItems = 0;
      courses.forEach(c => {
        const entry = lib[c.code] || {};
        totalItems += (entry.lectures || []).length + (entry.books || []).length + (entry.notes || []).length;
      });
      const keep = document.activeElement && document.activeElement.id === 'lbQ';
      mount.innerHTML = `<div class="lb-bar">
          <p class="lb-sum">${bn(courses.length)}টি কোর্স · মোট ${bn(totalItems)}টি রিসোর্স</p>
          <input class="fld" id="lbQ" type="search" placeholder="কোর্স বা কোড খুঁজুন…" value="${esc(q)}" aria-label="লাইব্রেরিতে খুঁজুন">
        </div>` +
        (filtered.length
          ? filtered.map((c, idx) => {
              const entry = lib[c.code] || {};
              const count = (entry.lectures || []).length + (entry.books || []).length + (entry.notes || []).length;
              const color = (c.id && CM[c.id] && CM[c.id].c) || 'var(--accent)';
              return `<details class="lb-course"${idx < 2 || term ? ' open' : ''}><summary>
                <span class="lb-dot" style="--c:${esc(color)}"></span>
                <span class="lb-name"><b>${esc(c.title)}</b><small>${esc(c.code)} · ${bn(c.cr)} ক্রেডিট</small></span>
                <span class="lb-count">${bn(count)}টি ফাইল</span>
              </summary><div class="lb-body">
                ${groupHtml('লেকচার শিট', entry.lectures)}
                ${groupHtml('বই ও রেফারেন্স', entry.books)}
                ${groupHtml('হ্যান্ডনোট', entry.notes)}
              </div></details>`;
            }).join('')
          : '<div class="empty-state"><b>কোনো কোর্স মেলেনি</b><span>অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।</span></div>') +
        `<div class="lb-add"><div><b>নোট বা বই শেয়ার করতে চান?</b><span>কমিউনিটি অংশের ফর্মের মাধ্যমে নোট বা লেকচার শিট জমা দিলে যাচাই করে এখানে যোগ করা হবে।</span></div><a class="btn ghost sm" href="#community">কমিউনিটিতে যান</a></div>`;
      if (keep) { const inp = document.getElementById('lbQ'); inp.focus(); inp.setSelectionRange(q.length, q.length); }
    }

    mount.addEventListener('input', e => {
      if (e.target.id === 'lbQ') { q = e.target.value; render(); }
    });
    render();
  });
})();
