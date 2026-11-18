/* নিজের নামের DNA কার্ড: নাম → DNA সিকোয়েন্স → রঙিন ব্যারকোড ও ডাবল হেলিক্স, ছবি হিসেবে ডাউনলোড/শেয়ার।
   এনকোডিং (আসল DNA-স্টোরেজের নীতি): প্রতিটি বেস = ২ বিট (A=00, C=01, G=10, T=11), প্রতি অক্ষর = ১ বাইট = ৪টি বেস।
   সিকোয়েন্স = ATG (স্টার্ট) + অক্ষরগুলো + TAA (স্টপ)। অক্ষরের টেবিল নিচে TABLE, ডিকোডও করা যায়। */
(function () {
  'use strict';
  const BASES = 'ACGT', COL = { A: '#34D399', C: '#38BDF8', G: '#FBBF24', T: '#FB7185' };
  const LAT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-'", EXTRA = { 120: '\u200C', 121: '\u200D' };
  const TABLE = [];
  for (let i = 0; i < LAT.length; i++) TABLE[i] = LAT[i];
  Object.keys(EXTRA).forEach(k => { TABLE[+k] = EXTRA[k]; });
  for (let cp = 0x0980; cp <= 0x09FF; cp++) TABLE[128 + cp - 0x0980] = String.fromCharCode(cp);
  const INDEX = {}; TABLE.forEach((ch, i) => { if (ch) INDEX[ch] = i; });
  const THEMES = {
    neon: { n: 'নিয়ন', bg: ['#07111C', '#0E2A3A'], ink: '#F2FBF8', mute: '#8FB3BE', acc: '#38F5B4' },
    lab: { n: 'ল্যাব', bg: ['#F4FAF7', '#D9EFE7'], ink: '#10243E', mute: '#5A6B7C', acc: '#0B8F73' },
    dusk: { n: 'সূর্যাস্ত', bg: ['#2B1055', '#D4457C'], ink: '#FFF6FA', mute: '#F3C4D8', acc: '#FFD36B' },
    sea: { n: 'সমুদ্র', bg: ['#04293A', '#1B6A8C'], ink: '#EAF9FF', mute: '#A8D5E6', acc: '#7DF3E0' }
  };
  const FORMATS = { sq: ['চৌকো (১:১)', 1080, 1080], pt: ['পোর্ট্রেট (৪:৫)', 1080, 1350], st: ['স্টোরি (৯:১৬)', 1080, 1920] };
  const S = { name: '', tag: '', theme: 'neon', fmt: 'pt', skipped: '' };

  function encode(name) {
    const chars = [...name.normalize('NFC').toUpperCase().replace(/\s+/g, ' ').trim()]; let out = '', skip = '';
    chars.forEach(ch => { const i = INDEX[ch]; if (i === undefined) { skip += ch; return; } for (let sh = 6; sh >= 0; sh -= 2) out += BASES[(i >> sh) & 3]; });
    S.skipped = skip; return 'ATG' + out + 'TAA';
  }
  function decode(seq) {
    const s = seq.toUpperCase().replace(/[^ACGT]/g, ''); if (s.length < 7 || s.slice(0, 3) !== 'ATG') throw new Error('সিকোয়েন্স ATG দিয়ে শুরু হতে হবে');
    const core = s.slice(3, s.endsWith('TAA') ? -3 : undefined); if (core.length % 4) throw new Error('বেসের সংখ্যা ৪-এর গুণিতক নয়');
    let out = ''; for (let i = 0; i < core.length; i += 4) { let v = 0; for (let k = 0; k < 4; k++) v = (v << 2) | BASES.indexOf(core[i + k]); out += TABLE[v] || '?'; }
    return out;
  }
  const font = (w, px, fam) => `${w} ${px}px ${fam}`;
  const HEAD = '"Bricolage Grotesque","Hind Siliguri","Noto Sans Bengali",system-ui,sans-serif', BODY = '"Hind Siliguri","Noto Sans Bengali",system-ui,sans-serif', MONO = '"JetBrains Mono","Consolas","Courier New",monospace';

  function draw(cv) {
    const F = FORMATS[S.fmt], W = F[1], H = F[2], T = THEMES[S.theme], g = cv.getContext('2d'); cv.width = W; cv.height = H;
    const name = S.name.trim() || 'আপনার নাম', seq = encode(S.name.trim() || 'GEB'), M = 70;
    const bg = g.createLinearGradient(0, 0, W * .6, H); bg.addColorStop(0, T.bg[0]); bg.addColorStop(1, T.bg[1]); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.globalAlpha = .06; g.fillStyle = T.ink; for (let i = 0; i < 38; i++) { g.beginPath(); g.arc(((i * 197) % W), ((i * 331) % H), 6 + (i % 5) * 5, 0, 7); g.fill(); } g.globalAlpha = 1;
    // শিরোনাম
    g.textBaseline = 'alphabetic'; g.fillStyle = T.acc; g.font = font(800, 30, HEAD); g.fillText('GEB STUDENT HUB · SUST', M, M + 24);
    g.fillStyle = T.mute; g.font = font(500, 28, BODY); g.fillText('Genetic Engineering & Biotechnology', M, M + 62);
    // নাম (প্রস্থ অনুযায়ী ছোট)
    let px = 150; g.font = font(800, px, HEAD); while (g.measureText(name).width > W - 2 * M && px > 46) { px -= 4; g.font = font(800, px, HEAD); }
    const top = H * (S.fmt === 'st' ? .2 : .17); g.fillStyle = T.ink; g.textAlign = 'center'; g.fillText(name, W / 2, top + px * .8);
    g.fillStyle = T.acc; g.font = font(700, 34, BODY); g.fillText(S.tag.trim() ? S.tag.trim() : 'আমার DNA কোড', W / 2, top + px * .8 + 58); g.textAlign = 'left';
    // ডাবল হেলিক্স
    const hy = top + px * .8 + 120, hh = Math.round(H * (S.fmt === 'st' ? .2 : .2)), cy = hy + hh / 2, n = Math.floor((W - 2 * M) / 12), amp = hh / 2 - 8;
    for (let i = 0; i < n; i++) {
      const x = M + i * 12 + 6, ph = i / 7.2, y1 = cy + Math.sin(ph) * amp, y2 = cy - Math.sin(ph) * amp, b = seq[i % seq.length], d = (Math.cos(ph) + 1) / 2;
      g.strokeStyle = COL[b]; g.globalAlpha = .35 + .65 * d; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y1); g.lineTo(x, (y1 + y2) / 2); g.stroke();
      g.strokeStyle = COL[{ A: 'T', T: 'A', C: 'G', G: 'C' }[b]]; g.beginPath(); g.moveTo(x, (y1 + y2) / 2); g.lineTo(x, y2); g.stroke();
      g.globalAlpha = .55 + .45 * d; g.fillStyle = T.ink; g.beginPath(); g.arc(x, y1, 5 + 3 * d, 0, 7); g.fill(); g.beginPath(); g.arc(x, y2, 5 + 3 * (1 - d), 0, 7); g.fill(); g.globalAlpha = 1;
    }
    // রঙিন ব্যারকোড
    const by = hy + hh + 56, bh = Math.round(H * (S.fmt === 'sq' ? .1 : .13)), rowN = Math.min(seq.length, 120), rows = Math.ceil(seq.length / rowN), bw = (W - 2 * M) / rowN, HT = { A: 1, C: .78, G: .92, T: .62 };
    g.fillStyle = T.mute; g.font = font(600, 24, BODY); g.fillText('DNA BARCODE', M, by - 14);
    for (let r = 0; r < Math.min(rows, 2); r++) for (let i = 0; i < rowN; i++) { const b = seq[r * rowN + i]; if (!b) break; g.fillStyle = COL[b]; const h = bh * HT[b]; g.fillRect(M + i * bw, by + r * (bh + 14) + (bh - h), Math.max(1.5, bw - Math.min(2.2, bw * .28)), h); }
    // সিকোয়েন্স টেক্সট
    const sy = by + Math.min(rows, 2) * (bh + 14) + 54; g.font = font(700, 30, MONO); g.fillStyle = T.mute; g.fillText("5′", M, sy); const lines = []; for (let i = 0; i < seq.length && lines.length < (S.fmt === 'st' ? 9 : S.fmt === 'pt' ? 5 : 3); i += 30) lines.push(seq.slice(i, i + 30));
    lines.forEach((ln, li) => { let x = M + 56; for (let k = 0; k < ln.length; k++) { if (k && k % 10 === 0) x += 18; g.fillStyle = COL[ln[k]]; g.fillText(ln[k], x, sy + li * 44); x += 19.5; } });
    if (seq.length > lines.length * 30) { g.fillStyle = T.mute; g.fillText('… ' + (seq.length) + ' bp', M + 56, sy + lines.length * 44); } else { g.fillStyle = T.mute; g.fillText("3′   " + seq.length + ' bp', M + 56 + 30 * 19.5 + 40, sy + (lines.length - 1) * 44); }
    // ফুটার
    g.fillStyle = T.mute; g.font = font(500, 24, BODY); g.fillText('A=00  C=01  G=10  T=11  ·  প্রতি অক্ষর = ৪টি বেস', M, H - M - 36);
    g.fillStyle = T.acc; g.font = font(700, 30, BODY); g.fillText(location.host + '  ·  তোমার নামের DNA কার্ড বানাও', M, H - M);
    [['A', COL.A], ['C', COL.C], ['G', COL.G], ['T', COL.T]].forEach((x, i) => { g.fillStyle = x[1]; g.beginPath(); g.arc(W - M - 18 - i * 40, H - M - 12, 14, 0, 7); g.fill(); });
  }
  const copy = t => { const f = () => { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); GEBX.toast('কপি হয়েছে'); } catch (_) { GEBX.toast('কপি করা গেল না'); } a.remove(); }; navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t).then(() => GEBX.toast('কপি হয়েছে'), f) : f(); };

  GEBX.register(() => {
    const root = document.getElementById('dnaMount'); if (!root) return; const esc = GEBX.esc;
    root.innerHTML = `<div class="sx-dna"><div class="sx-dna-ctl"><div class="exrow"><label class="exl" for="dName">আপনার নাম</label><input class="fld" id="dName" maxlength="24" placeholder="বাংলা বা ইংরেজিতে লিখুন, যেমন: Tahmid / তাহমিদ" autocomplete="off"></div>
      <div class="exrow"><label class="exl" for="dTag">নিচের লাইন (ঐচ্ছিক)</label><input class="fld" id="dTag" maxlength="40" placeholder="যেমন: GEB ব্যাচ ২৫-২৬"></div>
      <div class="exrow"><span class="exl">রঙ</span><div class="fchips" id="dTheme">${Object.keys(THEMES).map(k => `<button class="fc sm" data-dth="${k}" aria-pressed="${k === S.theme}">${THEMES[k].n}</button>`).join('')}</div></div>
      <div class="exrow"><span class="exl">মাপ</span><div class="fchips" id="dFmt">${Object.keys(FORMATS).map(k => `<button class="fc sm" data-dfm="${k}" aria-pressed="${k === S.fmt}">${FORMATS[k][0]}</button>`).join('')}</div></div>
      <div class="frow"><button class="btn ink" id="dDl">⬇ ছবি ডাউনলোড (PNG)</button><button class="btn ghost" id="dShare">📤 শেয়ার করুন</button><button class="btn ghost" id="dCopy">সিকোয়েন্স কপি</button></div>
      <p class="count" id="dInfo"></p>
      <details class="sx-pp"><summary>কীভাবে নাম DNA হলো? ডিকোডও করুন</summary><p class="count">প্রতিটি বেস দুই বিট (A=00, C=01, G=10, T=11)। একটি অক্ষর এক বাইট, মানে ৪টি বেস। শুরুতে স্টার্ট কোডন <b>ATG</b>, শেষে স্টপ কোডন <b>TAA</b>। এভাবেই বিজ্ঞানীরা সত্যিকারের DNA-তে ডেটা রাখার গবেষণা করেন। বন্ধুর শেয়ার করা সিকোয়েন্স নিচে বসিয়ে নামটি বের করুন:</p>
      <div class="frow"><input class="fld" id="dDec" placeholder="ATG…TAA" style="min-width:240px"><button class="btn ghost sm" id="dDecGo">ডিকোড করুন</button></div><p id="dDecOut" class="sx-dec"></p></details></div>
      <div class="sx-dna-pv"><canvas id="dCv" aria-label="DNA কার্ডের প্রিভিউ"></canvas></div></div>`;
    const cv = root.querySelector('#dCv'), info = root.querySelector('#dInfo'); let raf = 0, fontsDone = false;
    const paint = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { draw(cv); const seq = encode(S.name.trim() || 'GEB'); info.textContent = S.name.trim() ? `সিকোয়েন্স: ${GEBX.bn(seq.length)} বেস` + (S.skipped ? ` (এই চিহ্নগুলো বাদ গেছে: ${S.skipped})` : '') : 'নাম লিখুন, কার্ড সাথে সাথে বদলাবে।'; }); };
    const ready = () => { if (fontsDone || !document.fonts) { paint(); return; } Promise.all(['800 60px "Bricolage Grotesque"', '600 30px "Hind Siliguri"', '800 60px "Hind Siliguri"'].map(f => document.fonts.load(f, 'Aআঅ').catch(() => 0))).then(() => { fontsDone = true; paint(); }); };
    root.addEventListener('input', e => { if (e.target.id === 'dName') { S.name = e.target.value; paint(); } else if (e.target.id === 'dTag') { S.tag = e.target.value; paint(); } });
    root.addEventListener('click', e => {
      const t = e.target, c = s => t.closest(s); let el;
      if ((el = c('[data-dth]'))) { S.theme = el.dataset.dth; root.querySelectorAll('[data-dth]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); paint(); return; }
      if ((el = c('[data-dfm]'))) { S.fmt = el.dataset.dfm; root.querySelectorAll('[data-dfm]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); paint(); return; }
      const blob = () => new Promise(ok => cv.toBlob(ok, 'image/png'));
      if (c('#dDl')) { if (!S.name.trim()) return GEBX.toast('আগে নাম লিখুন'); draw(cv); blob().then(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'dna-card-' + (S.name.trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'geb') + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); GEBX.toast('ছবি নামানো হয়েছে, এবার Facebook/Instagram-এ শেয়ার করুন'); }); return; }
      if (c('#dShare')) { if (!S.name.trim()) return GEBX.toast('আগে নাম লিখুন'); draw(cv); blob().then(async b => { const file = new File([b], 'dna-card.png', { type: 'image/png' }), text = 'আমার নামের DNA কোড বানালাম 🧬 তোমারটা বানাও: ' + location.origin + '/#dnacard'; try { if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text, title: 'আমার DNA কার্ড' }); else if (navigator.share) { await navigator.share({ text, url: location.origin + '/#dnacard' }); GEBX.toast('ছবিটি আলাদা করে ডাউনলোড করে পোস্টে দিন'); } else { copy(text); GEBX.toast('লেখাটি কপি হয়েছে; ছবি ডাউনলোড করে পোস্ট করুন'); } } catch (_) { /* বাতিল */ } }); return; }
      if (c('#dCopy')) { if (!S.name.trim()) return GEBX.toast('আগে নাম লিখুন'); copy(encode(S.name.trim())); return; }
      if (c('#dDecGo')) { const o = root.querySelector('#dDecOut'); try { o.textContent = 'নাম: ' + decode(root.querySelector('#dDec').value); o.classList.remove('err'); } catch (er) { o.textContent = er.message; o.classList.add('err'); } }
    });
    ready(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
    window.GEB_DNA = { encode, decode };
  });
})();
