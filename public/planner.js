/* GENESIS 22: Today Strip (#todayStrip) + Student Planner (#plMount) */
(function () {
  'use strict';
  const KEY = 'geb_planner_v1';
  const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const MON_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return { exams: Array.isArray(s && s.exams) ? s.exams : [], att: (s && s.att) || {} };
    } catch (_) {
      return { exams: [], att: {} };
    }
  }
  function saveState(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {}
  }

  function startPlanner(D) {
    const strip = document.getElementById('todayStrip');
    const mount = document.getElementById('plMount');
    const sem = (D.curriculum || []).find(s => s.y === 1 && s.s === 2) || (D.curriculum || [])[0];
    const courses = sem ? sem.courses : [];
    const rt = D.routine;
    const st = loadState();

    function todaySummary() {
      const now = new Date();
      const dateStr = `আজ, ${DAYS_BN[now.getDay()]}, ${bn(now.getDate())} ${MON_BN[now.getMonth()]} ${bn(now.getFullYear())}`;
      const todayIso = now.toISOString().slice(0, 10);
      const daySlots = rt && Array.isArray(rt.slots) ? rt.slots.filter(x => x[0] === now.getDay()) : [];
      const calEv = window.GEBCal && window.GEBCal.evOn ? window.GEBCal.evOn(todayIso) : [];
      let classTitle = 'ক্লাস রুটিন দেখুন', classSub = 'আজ কোনো নির্ধারিত ক্লাস নেই।';
      if (calEv.length) {
        classTitle = calEv[0].t;
        classSub = 'একাডেমিক ক্যালেন্ডার অনুযায়ী আজ ছুটি।';
      } else if (daySlots.length) {
        classTitle = `আজ ${bn(daySlots.length)}টি ক্লাস আছে`;
        classSub = daySlots.map(s => `${s[3]} (${bn(s[1])})`).join(' · ');
      } else if (!rt || !rt.slots) {
        classTitle = 'ক্লাস রুটিন যোগ করুন';
        classSub = 'আজ কোন ক্লাস, কখন, সেটা এখানেই দেখাবে।';
      }

      const upcomingExams = st.exams
        .filter(e => e.date >= todayIso)
        .sort((a, b) => a.date.localeCompare(b.date));
      let exTitle = 'কোনো পরীক্ষা যোগ করা নেই', exSub = 'CT বা ফাইনালের তারিখ দিলে কাউন্টডাউন চলবে।';
      if (upcomingExams.length) {
        const nx = upcomingExams[0];
        const diff = Math.round((new Date(nx.date + 'T00:00:00') - new Date(todayIso + 'T00:00:00')) / 86400000);
        exTitle = `${nx.title} — ${diff === 0 ? 'আজ!' : bn(diff) + ' দিন বাকি'}`;
        exSub = `${nx.course ? nx.course + ' · ' : ''}${nx.date}`;
      }

      if (strip) {
        strip.innerHTML = `<div class="wrap"><div class="pl-ts">
          <div class="pl-ts-col"><div class="pl-ts-k">${esc(dateStr)}</div><div class="pl-ts-v">${esc(classTitle)}</div><div class="pl-ts-s">${esc(classSub)}</div></div>
          <div class="pl-ts-col"><div class="pl-ts-k">পরের পরীক্ষা</div><div class="pl-ts-v">${esc(exTitle)}</div><div class="pl-ts-s">${esc(exSub)}</div></div>
          <a class="btn pri sm" href="#planner">প্ল্যানার খুলুন</a>
        </div></div>`;
      }
    }

    function renderPlanner() {
      if (!mount) return;
      const todayIso = new Date().toISOString().slice(0, 10);
      const exams = [...st.exams].sort((a, b) => a.date.localeCompare(b.date));
      const examRows = exams.length
        ? `<ul class="pl-list">${exams.map((ex, i) => {
            const diff = Math.round((new Date(ex.date + 'T00:00:00') - new Date(todayIso + 'T00:00:00')) / 86400000);
            const badge = diff < 0 ? 'শেষ' : diff === 0 ? 'আজ' : bn(diff) + ' দিন বাকি';
            return `<li class="pl-item"><div><b>${esc(ex.title)}</b><small>${esc(ex.course || 'সাধারণ')} · ${esc(ex.date)}</small></div>
              <div class="frow"><span class="chip${diff <= 3 && diff >= 0 ? ' sig' : ''}">${badge}</span>
              <button type="button" class="btn ghost sm" data-ex-del="${i}" aria-label="পরীক্ষা মুছুন">×</button></div></li>`;
          }).join('')}</ul>`
        : '<p class="count" style="margin:12px 0 0">এখনো কোনো পরীক্ষার তারিখ যোগ করা হয়নি।</p>';

      const attRows = courses.map(c => {
        const rec = st.att[c.code] || { p: 0, t: 0 };
        const pct = rec.t ? Math.round((rec.p / rec.t) * 100) : 100;
        return `<div class="pl-att-row">
          <div class="pl-att-name"><b>${esc(c.title)}</b><small>${esc(c.code)} · উপস্থিত ${bn(rec.p)} / ${bn(rec.t)} (${bn(pct)}%)</small></div>
          <button type="button" class="btn ghost sm" data-att-p="${esc(c.code)}">+উপস্থিত</button>
          <button type="button" class="btn ghost sm" data-att-a="${esc(c.code)}">+অনুপস্থিত</button>
          <button type="button" class="btn ghost sm" data-att-r="${esc(c.code)}" aria-label="রিসেট">↺</button>
        </div>`;
      }).join('');

      mount.innerHTML = `<div class="pl-grid">
        <section class="pl-card">
          <div class="pl-hd"><h3>পরীক্ষার কাউন্টডাউন</h3></div>
          <form id="plExForm" class="frow">
            <input class="fld" id="plExTitle" type="text" placeholder="যেমন: CT-1 (Biochemistry)" required style="flex:1;min-width:160px">
            <input class="fld" id="plExDate" type="date" required>
            <button type="submit" class="btn ink sm">যোগ করুন</button>
          </form>
          ${examRows}
        </section>
        <section class="pl-card">
          <div class="pl-hd"><h3>ক্লাস উপস্থিতি ট্র্যাকার</h3><span class="count">লক্ষ্য: ৭৫%+</span></div>
          <div>${attRows || '<p class="count">কোর্স তালিকা পাওয়া যায়নি।</p>'}</div>
        </section>
      </div>`;
    }

    if (mount) {
      mount.addEventListener('submit', e => {
        if (e.target.id !== 'plExForm') return;
        e.preventDefault();
        const title = (document.getElementById('plExTitle').value || '').trim();
        const date = document.getElementById('plExDate').value;
        if (!title || !date) return;
        st.exams.push({ title, date });
        saveState(st);
        renderPlanner();
        todaySummary();
      });
      mount.addEventListener('click', e => {
        const del = e.target.closest('[data-ex-del]');
        if (del) {
          st.exams.splice(+del.dataset.exDel, 1);
          saveState(st); renderPlanner(); todaySummary(); return;
        }
        const p = e.target.closest('[data-att-p]');
        if (p) {
          const c = p.dataset.attP;
          const r = st.att[c] || { p: 0, t: 0 }; r.p++; r.t++; st.att[c] = r;
          saveState(st); renderPlanner(); return;
        }
        const a = e.target.closest('[data-att-a]');
        if (a) {
          const c = a.dataset.attA;
          const r = st.att[c] || { p: 0, t: 0 }; r.t++; st.att[c] = r;
          saveState(st); renderPlanner(); return;
        }
        const r = e.target.closest('[data-att-r]');
        if (r) {
          delete st.att[r.dataset.attR];
          saveState(st); renderPlanner();
        }
      });
    }

    todaySummary();
    renderPlanner();
  }

  window.GEBReady = window.GEBReady || [];
  window.GEBReady.push(startPlanner);
})();
