/* Shared helpers for social/DNA modules */
(function () {
  'use strict';
  const BN = '০১২৩৪৫৬৭৮৯', listeners = [], starters = [];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => BN[d]);
  const X = window.GEBX = {
    esc, bn, me: undefined, CM: {}, D: null, tabs: [], settings: { batches: [] },
    toast: m => window.__gebToast && window.__gebToast(m),
    async api(method, url, body) {
      let r;
      try {
        r = await fetch(url, {
          method,
          headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
          body: body !== undefined ? JSON.stringify(body) : undefined,
          credentials: 'same-origin'
        });
      } catch (_) {
        throw new Error('ইন্টারনেট নেই। এই কাজে নেট লাগে।');
      }
      const j = await r.json().catch(() => ({}));
      if (r.status === 401 && X.me) X.setMe(null);
      if (!r.ok) throw new Error(j.error || 'সমস্যা হয়েছে');
      return j;
    },
    setMe(u, cfg) {
      X.me = u;
      if (cfg) X.settings = cfg;
      listeners.forEach(f => { try { f(u); } catch (e) { console.error(e); } });
    },
    onAuth(fn) { listeners.push(fn); if (X.me !== undefined) fn(X.me); },
    ago(ts) {
      const s = (Date.now() - ts) / 1000;
      if (s < 60) return 'এইমাত্র';
      if (s < 3600) return bn(Math.floor(s / 60)) + ' মিনিট আগে';
      if (s < 86400) return bn(Math.floor(s / 3600)) + ' ঘণ্টা আগে';
      if (s < 604800) return bn(Math.floor(s / 86400)) + ' দিন আগে';
      return new Date(ts).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    av(u, sz) {
      sz = sz || 40;
      return u && u.avatar
        ? `<img class="cav" style="width:${sz}px;height:${sz}px" src="${esc(u.avatar)}" alt="">`
        : `<span class="cav ph" style="width:${sz}px;height:${sz}px;font-size:${sz * 0.45}px">${esc(((u && u.name) || '?').trim()[0] || '?')}</span>`;
    },
    size(n) { return n > 1048576 ? bn((n / 1048576).toFixed(1)) + ' MB' : bn(Math.max(1, Math.round(n / 1024))) + ' KB'; },
    toBase64(blob) {
      return new Promise((ok, no) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result).split(',')[1] || '');
        r.onerror = () => no(new Error('ফাইল পড়া যায়নি'));
        r.readAsDataURL(blob);
      });
    },
    goto(id) { const el = document.getElementById(id); if (el) el.scrollIntoView(); },
    needLogin(box, what) {
      box.innerHTML = `<div class="miss">${esc(what)} কমিউনিটির অ্যাকাউন্টে লগইন করতে হবে।<br><a class="btn ink sm" href="#community">কমিউনিটিতে লগইন / নিবন্ধন করুন</a></div>`;
    },
    register(fn) { starters.push(fn); },
    start(D) { X.D = D; X.CM = D.subjects || {}; starters.forEach(f => { try { f(D); } catch (e) { console.error(e); } }); }
  };
})();
