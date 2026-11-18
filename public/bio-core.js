/* GEB Hub: বায়োটেক টুলবক্সের হিসাব-নিকাশ (v3.3)
   Tm, প্রাইমার ডিজাইন, রিস্ট্রিকশন সাইট, কোডন অনুবাদ, ORF, প্রোটিনের ভর।
   এখানে কোনো DOM নেই, তাই Node-এও টেস্ট করা যায় (require('./bio-core.js'))।
   UI আছে biotools.js-এ, ডেটা (এনজাইম, গ্লসারি, প্রোটোকল) আছে bio-data.js-এ। */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GEBBio = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- সিকোয়েন্স হেল্পার ---------- */
  var COMP = { A: 'T', T: 'A', G: 'C', C: 'G', R: 'Y', Y: 'R', K: 'M', M: 'K', S: 'S', W: 'W', B: 'V', V: 'B', D: 'H', H: 'D', N: 'N' };
  var IUPAC = { R: '[AG]', Y: '[CT]', K: '[GT]', M: '[AC]', S: '[CG]', W: '[AT]', B: '[CGT]', D: '[AGT]', H: '[ACT]', V: '[ACG]', N: '[ACGT]' };
  function extend(a, b) { for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }

  function revComp(s) { var o = ''; for (var i = s.length - 1; i >= 0; i--) o += COMP[s.charAt(i)] || 'N'; return o; }

  /* FASTA হেডার, সংখ্যা, স্পেস বাদ দিয়ে শুধু বৈধ বেস রাখে। U কে T ধরা হয় (RNA দিলেও চলবে)। */
  function cleanSeq(raw) {
    var header = '', body = [];
    String(raw || '').split(/\r?\n/).forEach(function (l) {
      if (l.charAt(0) === '>') { if (!header) header = l.slice(1).trim(); } else body.push(l);
    });
    var letters = body.join('').toUpperCase().replace(/[^A-Z]/g, '');
    var hadU = letters.indexOf('U') >= 0;
    letters = letters.replace(/U/g, 'T');
    var seq = letters.replace(/[^ACGTRYKMSWBDHVN]/g, '');
    return { seq: seq, header: header, bad: letters.length - seq.length, hadU: hadU };
  }

  function gcPct(s) {
    if (!s.length) return 0;
    var n = 0; for (var i = 0; i < s.length; i++) { var c = s.charAt(i); if (c === 'G' || c === 'C' || c === 'S') n++; }
    return n / s.length * 100;
  }
  function baseCount(s) {
    var o = { A: 0, T: 0, G: 0, C: 0, other: 0 };
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i); if (o[c] !== undefined) o[c]++; else o.other++; }
    return o;
  }

  /* ---------- Tm ---------- */
  /* SantaLucia (1998) nearest-neighbour; লবণ সংশোধনসহ। Mg থাকলে Na-সমতুল্য: Na + 120*sqrt(Mg - dNTP) (mM)। */
  var NN = {
    AA: [-7.9, -22.2], TT: [-7.9, -22.2], AT: [-7.2, -20.4], TA: [-7.2, -21.3], CA: [-8.5, -22.7], TG: [-8.5, -22.7],
    GT: [-8.4, -22.4], AC: [-8.4, -22.4], CT: [-7.8, -21.0], AG: [-7.8, -21.0], GA: [-8.2, -22.2], TC: [-8.2, -22.2],
    CG: [-10.6, -27.2], GC: [-9.8, -24.4], GG: [-8.0, -19.9], CC: [-8.0, -19.9]
  };
  function tmNN(s, o) {
    o = o || {};
    if (s.length < 8 || /[^ACGT]/.test(s)) return NaN;
    var na = (o.na == null ? 50 : o.na), mg = (o.mg == null ? 1.5 : o.mg), dntp = (o.dntp == null ? 0.2 : o.dntp), conc = (o.conc == null ? 250 : o.conc);
    var naEq = (na + 120 * Math.sqrt(Math.max(0, mg - dntp))) / 1000;   // mol/L
    var dH = 0, dS = 0, i;
    for (i = 0; i < s.length - 1; i++) { var p = NN[s.substr(i, 2)]; dH += p[0]; dS += p[1]; }
    var ends = [s.charAt(0), s.charAt(s.length - 1)];
    ends.forEach(function (c) { if (c === 'G' || c === 'C') { dH += 0.1; dS += -2.8; } else { dH += 2.3; dS += 4.1; } });
    if (s === revComp(s)) dS += -1.4;                                   // স্বয়ং-পরিপূরক হলে
    dS += 0.368 * (s.length - 1) * Math.log(naEq);
    var ct = conc * 1e-9, R = 1.987;
    var x = (s === revComp(s)) ? 1 : 4;
    return dH * 1000 / (dS + R * Math.log(ct / x)) - 273.15;
  }
  /* সহজ সূত্র: ১৪ বেসের কম হলে Wallace (2(A+T)+4(G+C)), নইলে 64.9 + 41(G+C−16.4)/N */
  function tmBasic(s) {
    var c = baseCount(s), gc = c.G + c.C, at = c.A + c.T, n = s.length;
    if (n < 14) return 2 * at + 4 * gc;
    return 64.9 + 41 * (gc - 16.4) / n;
  }

  /* ---------- হেয়ারপিন ও ডাইমার ---------- */
  /* সবচেয়ে লম্বা স্টেম (লুপ অন্তত ৩), at3 = স্টেম ৩' প্রান্ত ছুঁয়েছে কি না */
  function hairpin(s) {
    var n = s.length, kmax = Math.min(10, Math.floor((n - 3) / 2));
    for (var k = kmax; k >= 3; k--) {
      for (var i = 0; i + k <= n; i++) {
        var a = s.substr(i, k), rc = revComp(a);
        for (var j = i + k + 3; j + k <= n; j++) if (s.substr(j, k) === rc) return { k: k, at3: (j + k === n) };
      }
    }
    return { k: 0, at3: false };
  }
  /* a-র কোনো অংশ b-র পরিপূরক হলে সবচেয়ে লম্বা মিলের দৈর্ঘ্য; k3 = ৩' প্রান্ত জড়িত এমন মিল */
  function dimer(a, b) {
    var rb = revComp(b), n = a.length, m = rb.length, best = 0, best3 = 0;
    for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) {
      var k = 0; while (i + k < n && j + k < m && a.charAt(i + k) === rb.charAt(j + k)) k++;
      if (k > best) best = k;
      if (k > 0 && (i + k === n || j === 0) && k > best3) best3 = k;
    }
    return { k: best, k3: best3 };
  }

  /* ---------- একটি প্রাইমারের রিপোর্ট ---------- */
  function primerReport(s, o) {
    o = o || {};
    var gcMin = o.gcMin == null ? 40 : o.gcMin, gcMax = o.gcMax == null ? 60 : o.gcMax;
    var tmMin = o.tmMin == null ? 57 : o.tmMin, tmMax = o.tmMax == null ? 63 : o.tmMax, tmOpt = o.tmOpt == null ? 60 : o.tmOpt;
    var gc = gcPct(s), tm = tmNN(s, o), n = s.length, issues = [], pen = 0;
    var last = s.charAt(n - 1), last5 = s.slice(-5), gc5 = (last5.match(/[GC]/g) || []).length;
    function add(lvl, msg, p) { issues.push({ lvl: lvl, msg: msg }); pen += p; }

    if (isNaN(tm)) { add('bad', 'Tm হিসাব করা যায়নি (অন্তত ৮ বেস ও শুধু A/T/G/C লাগবে)', 20); tm = 0; }
    pen += 2 * Math.abs(tm - tmOpt);
    if (tm && (tm < tmMin || tm > tmMax)) add('warn', 'Tm ' + tm.toFixed(1) + '°C, কাঙ্ক্ষিত ' + tmMin + '–' + tmMax + '°C-এর বাইরে', 4);
    pen += 0.3 * Math.abs(gc - 50);
    if (gc < gcMin || gc > gcMax) add('warn', 'GC ' + gc.toFixed(0) + '%, ভালো পরিসর ' + gcMin + '–' + gcMax + '%-এর বাইরে', 5);
    if (last !== 'G' && last !== 'C') add('warn', "৩' প্রান্তে GC ক্ল্যাম্প নেই (শেষ বেস G বা C হলে ভালো)", 3);
    if (gc5 >= 4) add('warn', "শেষ ৫ বেসে " + gc5 + "টা G/C, ৩' প্রান্ত বেশি আঁটো, ভুল জায়গায় জুড়তে পারে", 3);
    if (/(.)\1{3,}/.test(s)) add('warn', 'একই বেস ৪+ বার পরপর (slippage-এর ঝুঁকি)', 4);
    if (/([ACGT]{2})\1{3,}/.test(s)) add('warn', 'দুই-বেসের পুনরাবৃত্তি ৪+ বার (যেমন ATATATAT)', 3);
    var hp = hairpin(s);
    if (hp.k >= 4) { if (hp.at3 || hp.k >= 6) add('bad', "হেয়ারপিন: " + hp.k + " বেসের স্টেম" + (hp.at3 ? " (৩' প্রান্ত জড়িত)" : ''), 5); else add('warn', 'হেয়ারপিন: ' + hp.k + ' বেসের স্টেম', 3); }
    var sd = dimer(s, s);
    if (sd.k3 >= 3 || sd.k >= 5) add(sd.k3 >= 4 ? 'bad' : 'warn', 'সেলফ-ডাইমার: ' + sd.k + ' বেস মিলে যায়' + (sd.k3 >= 3 ? " (৩' প্রান্ত জড়িত)" : ''), sd.k3 >= 3 ? 4 : 2);
    pen += 0.05 * n;
    return { seq: s, len: n, gc: gc, tm: tm, tmBasic: tmBasic(s), hp: hp, sd: sd, issues: issues, pen: pen };
  }

  /* ---------- প্রাইমার জোড়া ডিজাইন ----------
     seq: পরিষ্কার DNA; o.start/o.end: যে অঞ্চল বাড়াতে চান (১-ভিত্তিক, দুই প্রান্তসহ);
     o.window: প্রান্ত থেকে কত বেস ভেতরে প্রাইমার সরতে পারবে। */
  function design(seq, o) {
    var d = { minLen: 18, maxLen: 25, tmOpt: 60, tmMin: 57, tmMax: 63, gcMin: 40, gcMax: 60, window: 20, top: 5, na: 50, mg: 1.5, dntp: 0.2, conc: 250 };
    o = extend(d, o || {});
    var L = seq.length, s0 = Math.max(0, (o.start || 1) - 1), e0 = Math.min(L, o.end || L);
    if (/[^ACGT]/.test(seq)) { /* অস্পষ্ট বেস থাকলে ওই অংশ বাদ যায় */ }
    if (e0 - s0 < o.minLen * 2 + 2) return { error: 'অঞ্চলটি অন্তত ' + (o.minLen * 2 + 2) + ' বেস লম্বা হতে হবে' };
    var fwd = [], rev = [], seenF = {}, seenR = {}, sh, len, p, q, s, r;
    for (sh = 0; sh <= o.window; sh++) {
      for (len = o.minLen; len <= o.maxLen; len++) {
        p = s0 + sh;
        if (p + len <= e0) {
          s = seq.substr(p, len);
          if (!/[^ACGT]/.test(s) && !seenF[s]) { seenF[s] = 1; r = primerReport(s, o); r.from = p + 1; r.to = p + len; fwd.push(r); }
        }
        q = e0 - sh;
        if (q - len >= s0) {
          s = revComp(seq.substring(q - len, q));
          if (!/[^ACGT]/.test(s) && !seenR[s]) { seenR[s] = 1; r = primerReport(s, o); r.from = q - len + 1; r.to = q; rev.push(r); }
        }
      }
    }
    var byPen = function (a, b) { return a.pen - b.pen; };
    fwd.sort(byPen); rev.sort(byPen);
    var F = fwd.slice(0, 8), R = rev.slice(0, 8), pairs = [];
    F.forEach(function (f) {
      R.forEach(function (rr) {
        var diff = Math.abs(f.tm - rr.tm), x = dimer(f.seq, rr.seq), pen = f.pen + rr.pen + 2 * diff, notes = [];
        if (diff > 3) { pen += 4; notes.push({ lvl: 'warn', msg: 'দুই প্রাইমারের Tm-এর পার্থক্য ' + diff.toFixed(1) + '°C (৩°C-এর মধ্যে থাকা ভালো)' }); }
        if (x.k3 >= 3) { pen += 5; notes.push({ lvl: 'bad', msg: "প্রাইমার-ডাইমারের ঝুঁকি: ৩' প্রান্ত জড়িয়ে " + x.k3 + " বেস মেলে" }); }
        else if (x.k >= 5) { pen += 2; notes.push({ lvl: 'warn', msg: 'ফরওয়ার্ড ও রিভার্সের মধ্যে ' + x.k + ' বেস মেলে (ক্রস-ডাইমার)' }); }
        pairs.push({ f: f, r: rr, size: rr.to - f.from + 1, diff: diff, cross: x, notes: notes, pen: pen });
      });
    });
    pairs.sort(byPen);
    return { fwd: fwd.slice(0, o.top), rev: rev.slice(0, o.top), pairs: pairs.slice(0, o.top), tried: fwd.length + rev.length };
  }

  /* ---------- রিস্ট্রিকশন সাইট ----------
     এনজাইম: { n: নাম, s: সাইট (IUPAC), t: সাইটের শুরু থেকে উপরের স্ট্র্যান্ডে কোথায় কাটে, b: নিচের স্ট্র্যান্ড (একই মাপে) } */
  function siteRegex(site) { return site.split('').map(function (c) { return IUPAC[c] || c; }).join(''); }
  function siteLabel(e) {
    var l = e.s.length;
    if (e.t >= 0 && e.t <= l) return e.s.slice(0, e.t) + '^' + e.s.slice(e.t);
    return e.s + '(' + (e.t - l) + '/' + (e.b - l) + ')';
  }
  function overhang(e) { var d = e.b - e.t; return d === 0 ? 'blunt' : (d > 0 ? "5' " + d + 'nt' : "3' " + (-d) + 'nt'); }

  function findSites(seq, enzymes, circular) {
    var L = seq.length, out = [];
    enzymes.forEach(function (e) {
      var sl = e.s.length, rc = revComp(e.s), pal = (rc === e.s), cuts = {}, txt = circular ? seq + seq.slice(0, sl - 1) : seq, m, re;
      function put(c) {
        if (circular) c = (((c - 1) % L) + L) % L + 1; else if (c < 1 || c > L - 1) return;
        cuts[c] = 1;
      }
      re = new RegExp(siteRegex(e.s), 'g');
      while ((m = re.exec(txt))) { if (circular && m.index >= L) break; put(m.index + e.t); re.lastIndex = m.index + 1; }
      if (!pal) {
        re = new RegExp(siteRegex(rc), 'g');
        while ((m = re.exec(txt))) { if (circular && m.index >= L) break; put(m.index + sl - e.b); re.lastIndex = m.index + 1; }
      }
      var pos = Object.keys(cuts).map(Number).sort(function (a, b) { return a - b; });
      out.push({ e: e, cuts: pos, n: pos.length });
    });
    return out;
  }
  /* কাটা জায়গা থেকে টুকরো। কাট = "ওই বেসের পরে কাটে" */
  function fragments(cuts, L, circular) {
    var c = cuts.slice().sort(function (a, b) { return a - b; }), out = [], i;
    c = c.filter(function (x, i2) { return !i2 || x !== c[i2 - 1]; });
    if (!c.length) return [{ from: 1, to: L, size: L }];
    if (circular) {
      for (i = 0; i < c.length; i++) {
        var a = c[i], b = c[(i + 1) % c.length], size = (i === c.length - 1) ? (L - a + c[0]) : (b - a);
        if (c.length === 1) size = L;
        out.push({ from: a + 1 > L ? 1 : a + 1, to: b, size: size });
      }
    } else {
      var prev = 0; c.forEach(function (x) { out.push({ from: prev + 1, to: x, size: x - prev }); prev = x; });
      out.push({ from: prev + 1, to: L, size: L - prev });
    }
    return out;
  }

  /* ---------- অনুবাদ ---------- */
  var BASES = 'TCAG';
  var TABLES = {
    1: { name: 'Standard (নিউক্লিয়ার জিন)', aa: 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG' },
    2: { name: 'Vertebrate mitochondrial', aa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSS**VVVVAAAADDEEGGGG' }
  };
  var AA3 = { A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', Q: 'Gln', E: 'Glu', G: 'Gly', H: 'His', I: 'Ile', L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val', '*': 'Stop', X: 'Xaa' };
  function codonAA(c, table) {
    var a = BASES.indexOf(c.charAt(0)), b = BASES.indexOf(c.charAt(1)), d = BASES.indexOf(c.charAt(2));
    if (a < 0 || b < 0 || d < 0) return 'X';
    return TABLES[table || 1].aa.charAt(a * 16 + b * 4 + d);
  }
  function translate(seq, frame, table) {
    var o = '';
    for (var i = (frame || 0); i + 3 <= seq.length; i += 3) o += codonAA(seq.substr(i, 3), table);
    return o;
  }
  /* ছয় ফ্রেম: +1,+2,+3, −1,−2,−3 */
  function sixFrames(seq, table) {
    var rc = revComp(seq), out = [], f;
    for (f = 0; f < 3; f++) out.push({ strand: '+', frame: f + 1, aa: translate(seq, f, table) });
    for (f = 0; f < 3; f++) out.push({ strand: '-', frame: f + 1, aa: translate(rc, f, table) });
    return out;
  }
  /* ATG দিয়ে শুরু হওয়া ORF। প্রতিটি stop-এর আগের সবচেয়ে বাইরের ATG ধরা হয়। stop ছাড়া শেষ হলে partial=true */
  function findORFs(seq, table, minAA) {
    var L = seq.length, out = [];
    [['+', seq], ['-', revComp(seq)]].forEach(function (sv) {
      for (var f = 0; f < 3; f++) {
        var aa = translate(sv[1], f, table), i = 0;
        while (i < aa.length) {
          var m = aa.indexOf('M', i); if (m < 0) break;
          var st = aa.indexOf('*', m), partial = st < 0, end = partial ? aa.length : st;
          var ntS = f + 3 * m, ntE = f + 3 * (partial ? end : end + 1);          // [ntS, ntE)
          var len = end - m;
          if (len >= minAA) {
            var from = sv[0] === '+' ? ntS + 1 : L - ntE + 1, to = sv[0] === '+' ? ntE : L - ntS;
            out.push({ strand: sv[0], frame: f + 1, from: from, to: to, aa: len, prot: aa.slice(m, end), partial: partial });
          }
          if (partial) break;
          i = st + 1;
        }
      }
    });
    out.sort(function (a, b) { return b.aa - a.aa; });
    return out;
  }
  var RES = { G: 57.0519, A: 71.0788, S: 87.0782, P: 97.1167, V: 99.1326, T: 101.1051, C: 103.1388, L: 113.1594, I: 113.1594, N: 114.1038, D: 115.0886, Q: 128.1307, K: 128.1741, E: 129.1155, M: 131.1926, H: 137.1411, F: 147.1766, R: 156.1875, Y: 163.1760, W: 186.2132 };
  function protMW(p) {
    var m = 18.01528, any = false;
    for (var i = 0; i < p.length; i++) { var r = RES[p.charAt(i)]; if (r) { m += r; any = true; } }
    return any ? m : 0;
  }
  function to3(aa) { var o = []; for (var i = 0; i < aa.length; i++) o.push(AA3[aa.charAt(i)] || 'Xaa'); return o; }

  return {
    revComp: revComp, cleanSeq: cleanSeq, gcPct: gcPct, baseCount: baseCount,
    tmNN: tmNN, tmBasic: tmBasic, hairpin: hairpin, dimer: dimer, primerReport: primerReport, design: design,
    siteLabel: siteLabel, overhang: overhang, findSites: findSites, fragments: fragments,
    TABLES: TABLES, AA3: AA3, codonAA: codonAA, translate: translate, sixFrames: sixFrames, findORFs: findORFs, protMW: protMW, to3: to3
  };
});
