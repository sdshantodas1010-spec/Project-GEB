/* PWA: service worker registration, install button, offline badge */
(function () {
  'use strict';
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) window.__gebUpdate && window.__gebUpdate();
        });
      });
    }).catch(() => {}));
  }
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  let deferred = null;
  const slot = () => document.getElementById('installSlot');
  function paint() {
    const s = slot(); if (!s) return;
    if (isStandalone()) { s.innerHTML = ''; return; }
    if (deferred) s.innerHTML = '<button class="ibtn" id="installBtn" title="ফোনে অ্যাপ হিসেবে ইনস্টল করুন"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg><span class="txt">ইনস্টল</span></button>';
    else if (ios) s.innerHTML = '<button class="ibtn" id="iosBtn"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/></svg><span class="txt">ইনস্টল</span></button>';
    else s.innerHTML = '';
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; paint(); });
  window.addEventListener('appinstalled', () => { deferred = null; paint(); window.__gebToast && window.__gebToast('অ্যাপ ইনস্টল হয়েছে'); });
  document.addEventListener('click', async e => {
    if (e.target.closest('#installBtn') && deferred) { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; paint(); }
    else if (e.target.closest('#iosBtn')) {
      window.__gebToast && window.__gebToast('Safari-তে Share বাটন চেপে "Add to Home Screen" বাছুন।');
    }
  });
  function net() { const b = document.getElementById('offBadge'); if (b) b.hidden = navigator.onLine; }
  window.addEventListener('online', net);
  window.addEventListener('offline', net);
  document.addEventListener('DOMContentLoaded', () => { paint(); net(); });
  window.__gebUpdate = () => window.__gebToast && window.__gebToast('সাইটের নতুন সংস্করণ এসেছে, পেজ রিফ্রেশ করুন');
})();
