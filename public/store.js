/* Browser localStorage persistence for Exam Hub (wrong notebook, history, answer parsing) */
(function () {
  'use strict';
  const KW = 'geb_wrong_v1', KH = 'geb_hist_v1';
  function get(k, d) {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (_) { return d; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {}
  }
  function hash(s) {
    let h = 2166136261;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'q_' + (h >>> 0).toString(36);
  }
  function parseAns(t) {
    const lines = String(t || '').split('\n');
    const keys = [], bodyLines = [];
    lines.forEach(l => {
      const m = l.match(/^\s*keys?\s*[:：]\s*(.+)$/i);
      if (m) m[1].split(/[,;]+/).map(x => x.trim()).filter(Boolean).forEach(k => keys.push(k));
      else bodyLines.push(l);
    });
    return { body: bodyLines.join('\n').trim(), keys };
  }
  function keyHits(txt, keys) {
    const low = String(txt || '').toLowerCase();
    const hit = [], miss = [];
    (keys || []).forEach(k => {
      if (low.includes(String(k).toLowerCase())) hit.push(k);
      else miss.push(k);
    });
    return { hit, miss };
  }
  const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }
  function checkShort(txt, accept) {
    const u = norm(txt);
    if (!u) return { ok: false, near: false };
    const list = (accept || []).map(norm).filter(Boolean);
    if (list.some(a => a === u)) return { ok: true, near: false };
    const near = list.some(a => Math.max(a.length, u.length) >= 4 && lev(u, a) <= Math.max(1, Math.floor(a.length * 0.2)));
    return { ok: near, near };
  }
  function wrong() { return get(KW, []); }
  function hist() { return get(KH, []); }

  function recordResults(items, settings) {
    const thr = ((settings && settings.wrongBelowPct) || 60) / 100;
    const master = (settings && settings.masterStreak) || 2;
    const list = wrong();
    let added = 0, removed = 0;
    (items || []).forEach(it => {
      const ratio = it.max ? it.got / it.max : 0;
      const idx = list.findIndex(w => w.k === it.k);
      if (ratio < thr) {
        if (idx >= 0) {
          list[idx].wrongCount = (list[idx].wrongCount || 1) + 1;
          list[idx].streak = 0;
          list[idx].last = Date.now();
        } else {
          list.push({
            k: it.k, type: it.type, c: it.c, q: it.q, opts: it.opts, correct: it.correct,
            accept: it.accept, exp: it.exp, ans: it.ans, src: it.src, max: it.max,
            wrongCount: 1, streak: 0, last: Date.now()
          });
          added++;
        }
      } else if (idx >= 0) {
        list[idx].streak = (list[idx].streak || 0) + 1;
        if (list[idx].streak >= master) { list.splice(idx, 1); removed++; }
      }
    });
    set(KW, list);
    return { added, removed };
  }

  function markWrong(k, good, settings) {
    const master = (settings && settings.masterStreak) || 2;
    const list = wrong();
    const idx = list.findIndex(w => w.k === k);
    if (idx < 0) return { gone: false, streak: 0 };
    if (good) {
      list[idx].streak = (list[idx].streak || 0) + 1;
      if (list[idx].streak >= master) {
        list.splice(idx, 1);
        set(KW, list);
        return { gone: true, streak: master };
      }
      set(KW, list);
      return { gone: false, streak: list[idx].streak };
    }
    list[idx].streak = 0;
    list[idx].wrongCount = (list[idx].wrongCount || 1) + 1;
    list[idx].last = Date.now();
    set(KW, list);
    return { gone: false, streak: 0 };
  }

  function removeWrong(k) { set(KW, wrong().filter(w => w.k !== k)); }

  function addHist(entry) {
    const list = hist();
    const out = entry.out || 0;
    const got = entry.got || 0;
    list.push({
      id: 'h_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ts: Date.now(),
      mode: entry.mode,
      c: entry.c,
      title: entry.title,
      got, out,
      mins: entry.mins,
      pct: out ? (got / out) * 100 : 0,
      items: entry.items || []
    });
    set(KH, list);
  }
  function delHist(id) { set(KH, hist().filter(h => h.id !== id)); }
  function clearHist() { set(KH, []); }
  function exportAll() { return JSON.stringify({ hist: hist(), wrong: wrong(), exported: new Date().toISOString() }, null, 2); }
  function importAll(jsonStr) {
    const obj = JSON.parse(jsonStr);
    const h = Array.isArray(obj.hist) ? obj.hist : [];
    const w = Array.isArray(obj.wrong) ? obj.wrong : [];
    const curH = hist(), curW = wrong();
    const hIds = new Set(curH.map(x => x.id)), wKeys = new Set(curW.map(x => x.k));
    h.forEach(x => { if (x && x.id && !hIds.has(x.id)) curH.push(x); });
    w.forEach(x => { if (x && x.k && !wKeys.has(x.k)) curW.push(x); });
    set(KH, curH); set(KW, curW);
    return { hist: h.length, wrong: w.length };
  }

  window.GEBStore = {
    hash, parseAns, keyHits, checkShort, wrong, hist,
    recordResults, markWrong, removeWrong, addHist, delHist, clearHist, exportAll, importAll
  };
})();
