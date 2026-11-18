/* GENESIS 22: কমিউনিটি পাতা (সার্ভার ছাড়া)
   আলোচনা হয় গ্রুপে, জমা দেওয়ার কাজ হয় Google Form-এ। নিচের লিংকগুলো বসান।
   url ফাঁকা থাকলে বাটন "শীঘ্রই আসছে" দেখায়। */
(function () {
  'use strict';
  var LINKS = {
    groups: [
      { t: 'Facebook গ্রুপ', d: 'ব্যাচের সবার আলোচনা, নোটিস ও আড্ডা।', url: '', b: 'গ্রুপে যোগ দিন' },
      { t: 'Telegram / WhatsApp গ্রুপ', d: 'দ্রুত খবর ও ফাইল শেয়ার।', url: '', b: 'গ্রুপে যোগ দিন' }
    ],
    forms: [
      { t: 'নোট বা প্রশ্ন জমা দিন', d: 'লেকচার শিট, নোট বা প্রশ্নের ছবি পাঠান। যাচাই করে সাইটে যোগ হবে।', url: '', b: 'ফর্ম খুলুন' },
      { t: 'হারানো-প্রাপ্তি', d: 'কিছু হারালে বা পেলে জানান।', url: '', b: 'ফর্ম খুলুন' },
      { t: 'মতামত ও পরামর্শ', d: 'সাইট বা ব্যাচ নিয়ে যেকোনো মতামত।', url: '', b: 'ফর্ম খুলুন' }
    ]
  };
  window.GENESIS_LINKS = LINKS;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function item(x) {
    return '<article class="cn"><h3>' + esc(x.t) + '</h3><p>' + esc(x.d) + '</p>' +
      (x.url ? '<a class="btn pri" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.b) + '</a>' : '<span class="btn ghost off" aria-disabled="true">শীঘ্রই আসছে</span>') + '</article>';
  }
  var m = document.getElementById('commMount');
  if (m) m.innerHTML = '<h3 class="cn-h">গ্রুপ</h3><div class="cn-grid">' + LINKS.groups.map(item).join('') + '</div><h3 class="cn-h">Google Form</h3><div class="cn-grid">' + LINKS.forms.map(item).join('') + '</div>';
})();
