/* GENESIS 22: Class Routine renderer (#routineMount) */
(function () {
  'use strict';
  const DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const toMins = hhmm => { const [h, m] = String(hhmm).split(':').map(Number); return (h || 0) * 60 + (m || 0); };

  window.GEBReady = window.GEBReady || [];
  window.GEBReady.push(function (D) {
    const mount = document.getElementById('routineMount');
    if (!mount) return;
    const rt = D.routine;
    if (!rt || !Array.isArray(rt.slots) || !rt.slots.length) {
      mount.innerHTML = '<div class="empty-state"><b>ক্লাস রুটিন এখনো যোগ হয়নি</b><span>রুটিন যুক্ত হলে এখানে সপ্তাহের সময়সূচি দেখা যাবে।</span></div>';
      return;
    }

    const courseMap = {};
    (D.curriculum || []).forEach(sem => (sem.courses || []).forEach(c => { courseMap[c.code] = c; }));
    const CM = D.subjects || {};
    const now = new Date();
    const todayIdx = now.getDay(); // 0=Sun .. 4=Thu
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const slotMeta = slot => {
      const [day, start, end, code, kind] = slot;
      const c = courseMap[code];
      const sub = (c && c.id && CM[c.id]) || CM[code] || {};
      return {
        day, start, end, code,
        kind: kind === 'L' ? 'ল্যাব' : 'থিওরি',
        isLab: kind === 'L',
        title: c ? c.title : (sub.t || code),
        color: sub.c || 'var(--accent)'
      };
    };

    const parsed = rt.slots.map(slotMeta);
    const todaySlots = parsed.filter(s => s.day === todayIdx).sort((a, b) => toMins(a.start) - toMins(b.start));
    const live = todaySlots.find(s => nowMins >= toMins(s.start) && nowMins <= toMins(s.end));
    const next = todaySlots.find(s => toMins(s.start) > nowMins);

    let nowBanner = '';
    if (live) {
      nowBanner = `<div class="rt-now live"><b>এখন চলছে</b><span>${esc(live.title)} (${esc(live.code)}) · ${bn(live.start)} – ${bn(live.end)}</span></div>`;
    } else if (next) {
      nowBanner = `<div class="rt-now"><b>পরবর্তী ক্লাস</b><span>${esc(next.title)} (${esc(next.code)}) · ${bn(next.start)} – ${bn(next.end)}</span></div>`;
    } else if (todayIdx >= 5) {
      nowBanner = `<div class="rt-now"><b>সাপ্তাহিক ছুটি</b><span>আজ কোনো নিয়মিত ক্লাস নেই।</span></div>`;
    } else {
      nowBanner = `<div class="rt-now"><b>আজকের ক্লাস শেষ</b><span>আজ আর কোনো নির্ধারিত ক্লাস বাকি নেই।</span></div>`;
    }

    const cols = DAYS.map((name, di) => {
      const daySlots = parsed.filter(s => s.day === di).sort((a, b) => toMins(a.start) - toMins(b.start));
      const isToday = di === todayIdx;
      const items = daySlots.length
        ? daySlots.map(s => {
            const isLive = isToday && nowMins >= toMins(s.start) && nowMins <= toMins(s.end);
            return `<li class="rt-slot${isLive ? ' live' : ''}" style="--c:${esc(s.color)}">
              <div class="rt-time">${bn(s.start)} – ${bn(s.end)}</div>
              <div class="rt-name">${esc(s.title)}</div>
              <div class="rt-meta"><span>${esc(s.code)}</span><span class="rt-k${s.isLab ? ' lab' : ''}">${s.kind}</span></div>
            </li>`;
          }).join('')
        : '<li class="rt-slot" style="--c:var(--line)"><div class="rt-name" style="color:var(--muted)">কোনো ক্লাস নেই</div></li>';
      return `<section class="rt-day${isToday ? ' today' : ''}"><h3><span>${name}</span>${isToday ? '<em>আজ</em>' : ''}<small>${bn(daySlots.length)}টি ক্লাস</small></h3><ul>${items}</ul></section>`;
    }).join('');

    mount.innerHTML = `<div class="rt-head"><div><h3>${esc(rt.title || 'ক্লাস রুটিন')}</h3><p>${esc(rt.period || '')}</p></div>
      <button type="button" class="btn ghost sm" onclick="window.print()">প্রিন্ট</button></div>
      ${nowBanner}<div class="rt-grid">${cols}</div>${rt.note ? `<p class="rt-note">${esc(rt.note)}</p>` : ''}`;
  });
})();
