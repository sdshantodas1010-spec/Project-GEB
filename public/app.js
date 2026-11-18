window.startApp=function(D){
'use strict';
const PAPERS=D.papers, CURRICULUM=D.curriculum, COURSE_DETAILS=D.details, PROGRAM=D.program, CM=D.subjects;
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const fmt=n=>Number.isInteger(n)?String(n):(Math.round(n*100)/100).toString();
const YN=['১ম','২য়','৩য়','৪র্থ'];
const SET=D.settings||{};
if(SET.siteName){document.title=SET.siteName+' — SUST ৩৬তম ব্যাচ, জেনেটিক ইঞ্জিনিয়ারিং ও বায়োটেকনোলজি';const bs=document.querySelector('.brand span');if(bs&&SET.shortName)bs.textContent=SET.shortName;const ft=document.querySelector('footer .wrap>b');if(ft)ft.textContent=SET.siteName;}

/* ---------- কোর্স মেটা ---------- */


/* ---------- প্রশ্ন পার্স ---------- */
function marksVal(m){ if(m==null) return 0; const s=String(m); if(s.includes('=')) return parseFloat(s.split('=').pop())||0; return parseFloat(s)||0; }
function parseQ(str){
  const mk=side=>side.split(' | ').map((p,i)=>{
    let t=p.trim(), m=null, l=String.fromCharCode(97+i);
    const mm=t.match(/\s*\[([^\]]*)\]\s*$/); if(mm){m=mm[1]; t=t.slice(0,mm.index).trim();}
    const op=t.match(/^\(only part ([a-z])\)\s*/i); if(op){l=op[1].toLowerCase(); t=t.slice(op[0].length);}
    return {l,t,m,mv:marksVal(m)};
  });
  const sides=str.split(' // ');
  return {main:mk(sides[0]),alt:sides[1]?mk(sides[1]):null};
}
PAPERS.forEach((p,i)=>{
  p.ix=i; p.qs=p.q.map(parseQ);
  p.title = p.t==='F' ? 'Final '+p.y : (p.l||'Term Test');
  p.yl = p.y>0 ? String(p.y) : 'সাল উল্লেখ নেই';
});
const allParts=q=>[...q.main,...(q.alt||[])];
const qMarks=q=>q.main.reduce((a,x)=>a+x.mv,0);

/* ---------- পুনরাবৃত্তি শনাক্তকরণ ---------- */
const STOP=new Set('the and for with that this are what how from into their have has write briefly discuss describe explain mention state show give list your you can which does between about each these those using used any its not also then than'.split(' '));
const toks=t=>new Set((t.toLowerCase().match(/[a-z][a-z0-9]{2,}/g)||[]).filter(w=>!STOP.has(w)));
(function detectRepeats(){
  const byCourse={};
  PAPERS.forEach(p=>p.qs.forEach((q,qi)=>allParts(q).forEach(pt=>{
    pt.tk=toks(pt.t); pt.rep=[];
    (byCourse[p.c]=byCourse[p.c]||[]).push({p,pt});
  })));
  Object.values(byCourse).forEach(list=>{
    for(let i=0;i<list.length;i++){
      const a=list[i];
      for(let j=i+1;j<list.length;j++){
        const b=list[j]; if(a.p.ix===b.p.ix) continue;
        const A=a.pt.tk,B=b.pt.tk; if(A.size<2||B.size<2) continue;
        let inter=0; A.forEach(w=>{if(B.has(w))inter++;});
        const uni=A.size+B.size-inter, jac=inter/uni;
        const small=A.size<4||B.size<4;
        if((small&&jac===1)||(!small&&jac>=0.6)){
          if(!a.pt.rep.some(r=>r.pid===b.p.ix)) a.pt.rep.push({pid:b.p.ix,y:b.p.y,t:b.p.title});
          if(!b.pt.rep.some(r=>r.pid===a.p.ix)) b.pt.rep.push({pid:a.p.ix,y:a.p.y,t:a.p.title});
        }
      }
    }
  });
})();

/* ---------- হট টপিক ---------- */
const TOPICS=D.topics.map(t=>({l:t.l,c:t.c,re:new RegExp(t.re,'i')}));
TOPICS.forEach((tp,i)=>{
  tp.id=i; tp.papers=new Set();
  PAPERS.forEach(p=>{
    if(!tp.c.includes(p.c)) return;
    if(p.qs.some(q=>allParts(q).some(pt=>tp.re.test(pt.t)))) tp.papers.add(p.ix);
  });
  tp.years=[...new Set([...tp.papers].map(id=>PAPERS[id].y).filter(Boolean))].sort();
  tp.n=tp.papers.size;
});
const topicsFor=c=>TOPICS.filter(t=>t.c.includes(c)&&t.n>0).sort((a,b)=>b.n-a.n);

/* ---------- স্টেট ---------- */
const state={year:1,sem:2,hotCourse:'all',f:{course:'all',year:'all',type:'all',topic:'all',q:'',star:false},stars:new Set(LS.get('geb_stars',[])),open:true,gpa:{sem:0,grades:LS.get('geb_grades',{}),saved:LS.get('geb_saved',[])}};
const byCode={}; CURRICULUM.forEach(s=>s.courses.forEach(c=>{c.s=s;byCode[c.code]=c;}));
const bankCount=id=>PAPERS.filter(p=>p.c===id).length;
const toast=(m)=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),1800);};

/* ---------- থিম ---------- */
const root=document.documentElement;
function setTheme(t,keep){
  root.setAttribute('data-theme',t); if(!keep) LS.set('geb_theme',t);
  $('#themeIco').innerHTML = t==='dark'
    ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
    : '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>';
}
setTheme(LS.get('geb_theme','light'),true);
$('#themeBtn').onclick=()=>setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');

/* ---------- সিলেবাস ---------- */
function semCard(sem){
  const cr=sem.courses.reduce((a,c)=>a+c.cr,0), th=sem.courses.reduce((a,c)=>a+c.th,0), lb=sem.courses.reduce((a,c)=>a+c.lab,0);
  const rows=sem.courses.map(c=>{
    const det=COURSE_DETAILS[c.code]||(c.id&&COURSE_DETAILS[c.id]);
    return `<button class="crow ${c.lab?'lab':''}" data-code="${esc(c.code)}"><span><span class="code">${esc(c.code)}</span><span class="ttl">${esc(c.title)}</span>
      <span class="meta"><span class="chip gray">${c.cat==='Core'?'Core':'GED'}</span><span class="chip gray">${c.th}+${c.lab} ঘণ্টা</span>${det?'<span class="chip">সিলেবাস আছে</span>':''}</span></span>
      <span class="cr">${fmt(c.cr)}<small>ক্রেডিট</small></span></button>`;
  }).join('');
  return `<article class="sem" id="sem-${sem.y}-${sem.s}"><header><h3>${sem.name}</h3><div class="chips"><span class="chip">${bn(fmt(cr))} ক্রেডিট</span><span class="chip gray">থিওরি ${bn(th)} ঘণ্টা</span><span class="chip gray">ল্যাব ${bn(lb)} ঘণ্টা</span></div></header>${rows}</article>`;
}
function renderSyllabus(){
  const pick=$('#semPick');
  if(!pick.options.length) pick.innerHTML=CURRICULUM.map(s=>`<option value="${s.y}-${s.s}">${s.name}</option>`).join('');
  pick.value=state.year+'-'+state.sem;
  const sem=CURRICULUM.find(s=>s.y===state.year&&s.s===state.sem)||CURRICULUM[0];
  $('#semGrid').innerHTML=sem?semCard(sem):'';
}
$('#semPick').addEventListener('change',e=>{const [y,m]=e.target.value.split('-').map(Number);state.year=y;state.sem=m;renderSyllabus();});
$('#semGrid').addEventListener('click',e=>{const b=e.target.closest('.crow');if(b)openCourse(b.dataset.code,b);});

/* ---------- ড্রয়ার ---------- */
let lastFocus=null;
function openCourse(code,from){
  const c=byCode[code]; if(!c) return;
  lastFocus=from||document.activeElement;
  const d=COURSE_DETAILS[c.code]||(c.id&&COURSE_DETAILS[c.id]), n=c.id?bankCount(c.id):0;
  const tps=c.id?topicsFor(c.id).slice(0,6):[];
  let h=`<div class="dh"><div class="row"><div><div class="code">${esc(c.code)}</div><h2 id="dTitle">${esc(c.title)}</h2></div><button class="ibtn" id="dClose" aria-label="বন্ধ করুন">বন্ধ</button></div>
   <div class="chips"><span class="chip">${bn(fmt(c.cr))} ক্রেডিট</span><span class="chip gray">${c.cat==='Core'?'Core':'GED'}</span><span class="chip gray">থিওরি ${c.th} + ল্যাব ${c.lab} ঘণ্টা</span><span class="chip gray">${c.s.name}</span></div></div><div class="db">`;
  if(d){
    h+=`<h4>কেন এই কোর্স</h4><p>${esc(d.rationale)}</p>`;
    if(d.objectives.length) h+=`<h4>কোর্সের উদ্দেশ্য</h4><ul>${d.objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul>`;
    h+=`<h4>কোর্স কনটেন্ট</h4>`+d.contents.map(x=>`<div class="cblk"><b>${esc(x.h)}</b><span>${esc(x.t)}</span></div>`).join('');
    if(d.cos.length) h+=`<h4>শেখার ফলাফল (CO)</h4><ul>${d.cos.map((o,i)=>`<li><b>CO${i+1}</b> ${esc(o)}</li>`).join('')}</ul>`;
    if(d.refs.length) h+=`<h4>রেফারেন্স বই</h4><ul>${d.refs.map(o=>`<li>${esc(o)}</li>`).join('')}</ul>`;
    if(d.partial) h+=`<div class="box warn">এই কোর্সের কনটেন্ট আপলোড করা PDF-এর শেষ পাতায় কেটে গেছে, তাই আংশিক।</div>`;
  } else if(n){
    h+=`<div class="box warn">এই কোর্সের কনটেন্ট কারিকুলাম PDF-এ নেই (এটি অন্য বিভাগের কোর্স)। নিচের প্রশ্ন-বিশ্লেষণ দেখে কোন চ্যাপ্টার বেশি আসে বুঝে নিন।</div>`;
  } else {
    h+=`<div class="box warn">এই কোর্সের বিস্তারিত সিলেবাস আপলোড করা PDF-এ নেই। কোড, ক্রেডিট ও ঘণ্টা কারিকুলামের তালিকা থেকে নেওয়া।</div>`;
  }
  if(n){
    h+=`<h4>প্রশ্নব্যাংক</h4><p>${bn(n)}টি প্রশ্নপত্র আছে (ফাইনাল ও টার্ম টেস্ট)।</p>`;
    if(tps.length) h+=`<div style="margin-top:10px;display:grid;gap:6px">${tps.map(t=>`<button class="ht" style="--c:${CM[c.id].c}" data-topic="${t.id}"><span class="n">${bn(t.n)}</span><span><span class="t">${esc(t.l)}</span><span class="yrs">${t.years.map(y=>`<span class="y">${y}</span>`).join('')}</span></span></button>`).join('')}</div>`;
    h+=`<div style="margin-top:14px"><button class="btn ink" id="dBank" data-c="${c.id}">এই কোর্সের সব প্রশ্ন দেখুন</button></div>`;
  }
  h+='</div>';
  const dr=$('#drawer'); dr.innerHTML=h; dr.classList.add('on'); dr.setAttribute('aria-hidden','false'); $('#scrim').classList.add('on'); dr.scrollTop=0;
  $('#dClose').focus();
}
function closeDrawer(){
  $('#drawer').classList.remove('on');$('#drawer').setAttribute('aria-hidden','true');
  if(!$('#pal').classList.contains('on')) $('#scrim').classList.remove('on');
  if(lastFocus&&lastFocus.focus) lastFocus.focus();
}
$('#drawer').addEventListener('click',e=>{
  if(e.target.closest('#dClose')) return closeDrawer();
  const b=e.target.closest('#dBank'); if(b){closeDrawer();goBank({course:b.dataset.c});return;}
  const t=e.target.closest('[data-topic]'); if(t){const tp=TOPICS[+t.dataset.topic];closeDrawer();goBank({course:tp.c[0],topic:String(tp.id)});}
});
$('#scrim').addEventListener('click',()=>{closeDrawer();closePal();});

/* ---------- হট টপিক UI ---------- */
function renderHot(){
  const courses=Object.keys(CM).filter(c=>topicsFor(c).length);
  $('#hotFilter').innerHTML=`<button class="fc" aria-pressed="${state.hotCourse==='all'}" data-c="all">সব কোর্স</button>`+courses.map(c=>`<button class="fc" style="--c:${CM[c].c}" aria-pressed="${state.hotCourse===c}" data-c="${c}"><span class="dot"></span>${CM[c].n}</button>`).join('');
  let list=TOPICS.filter(t=>t.n>0&&(state.hotCourse==='all'||t.c.includes(state.hotCourse))).sort((a,b)=>b.n-a.n||b.years.length-a.years.length);
  if(state.hotCourse==='all') list=list.slice(0,16);
  const max=Math.max(1,...list.map(t=>t.n));
  $('#hotList').innerHTML=list.map(t=>`<button class="ht" data-topic="${t.id}" style="--c:${CM[t.c[0]].c}"><span class="n">${bn(t.n)}</span><span><span class="t">${esc(t.l)}</span><span class="bar"><i style="width:${t.n/max*100}%"></i></span><span class="yrs"><span>${CM[t.c[0]].n}</span>${t.years.map(y=>`<span class="y">${y}</span>`).join('')}</span></span></button>`).join('');
}
$('#hotFilter').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b){state.hotCourse=b.dataset.c;renderHot();}});
$('#hotList').addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(b){const tp=TOPICS[+b.dataset.topic];goBank({course:tp.c[0],topic:String(tp.id)});}});

function toggleStar(k){state.stars.has(k)?state.stars.delete(k):state.stars.add(k);LS.set('geb_stars',[...state.stars]);}
/* ---------- প্রশ্নব্যাংক ---------- */
function setupFilters(){
  const yrs=[...new Set(PAPERS.map(p=>p.y))].sort((a,b)=>b-a);
  $('#fYear').innerHTML='<option value="all">সব সাল</option>'+yrs.map(y=>`<option value="${y}">${y>0?y:'সাল উল্লেখ নেই'}</option>`).join('');
  $('#qCourse').innerHTML=`<button class="fc" data-c="all" aria-pressed="true">সব কোর্স</button>`+Object.keys(CM).filter(c=>bankCount(c)).map(c=>`<button class="fc" style="--c:${CM[c].c}" data-c="${c}" aria-pressed="false"><span class="dot"></span>${CM[c].n} (${bn(bankCount(c))})</button>`).join('');
  fillTopicSelect();
}
function fillTopicSelect(){
  const c=state.f.course;
  const opts=TOPICS.filter(t=>t.n>0&&(c==='all'||t.c.includes(c))).sort((a,b)=>b.n-a.n);
  $('#fTopic').innerHTML='<option value="all">সব টপিক</option>'+opts.map(t=>`<option value="${t.id}">${esc((c==='all'?CM[t.c[0]].n+': ':'')+t.l)} (${bn(t.n)})</option>`).join('');
  if(!opts.some(t=>String(t.id)===state.f.topic)) state.f.topic='all';
  $('#fTopic').value=state.f.topic;
}
function syncControls(){
  const f=state.f;
  $('#qSearch').value=f.q; $('#fYear').value=f.year; $('#fType').value=f.type;
  $$('#qCourse .fc').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===f.course)));
  fillTopicSelect();
  $('#bStar').setAttribute('aria-pressed',String(f.star)); $('#bStar').textContent='আমার তালিকা'+(state.stars.size?` (${bn(state.stars.size)})`:'');
}
function filterBank(){
  const f=state.f, tp=f.topic!=='all'?TOPICS[+f.topic]:null;
  const terms=f.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const out=[];
  PAPERS.forEach(p=>{
    if(f.course!=='all'&&p.c!==f.course) return;
    if(f.year!=='all'&&String(p.y)!==f.year) return;
    if(f.type!=='all'&&p.t!==f.type) return;
    if(tp&&!tp.c.includes(p.c)) return;
    const qs=[];
    p.qs.forEach((q,qi)=>{
      const key=p.id+':'+qi;
      if(f.star&&!state.stars.has(key)) return;
      const parts=allParts(q);
      if(tp&&!parts.some(pt=>tp.re.test(pt.t))) return;
      if(terms.length){const blob=parts.map(x=>x.t).join(' ').toLowerCase()+' '+p.title.toLowerCase(); if(!terms.every(t=>blob.includes(t))) return;}
      qs.push({q,qi,key});
    });
    if(qs.length) out.push({p,qs});
  });
  out.sort((a,b)=>(b.p.y-a.p.y)||(a.p.t==='F'?-1:1)-(b.p.t==='F'?-1:1));
  return out;
}
function hl(text){
  let s=esc(text); const terms=state.f.q.trim().split(/\s+/).filter(t=>t.length>1);
  if(!terms.length) return s;
  const re=new RegExp('('+terms.map(t=>esc(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');
  return s.replace(re,'<mark>$1</mark>');
}
function partHtml(pt){
  const rep=pt.rep.length?`<span class="rep" title="${esc(pt.rep.map(r=>r.t).join(', '))}">${bn(pt.rep.length+1)} বার এসেছে${pt.rep.some(r=>r.y)?': '+[...new Set(pt.rep.map(r=>r.y).filter(Boolean))].sort().join(', '):''}</span>`:'';
  return `<li><span class="pl">${pt.l}</span><span class="ptx">${hl(pt.t)}${pt.m?`<span class="pm">${esc(pt.m)}</span>`:''}${rep}</span></li>`;
}
const STAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
function modelHtml(t){return String(t).split('\n').filter(l=>!/^\s*keys?\s*[:：]/i.test(l)).map(l=>/^\s*[-•]\s+/.test(l)?'<li>'+esc(l.replace(/^\s*[-•]\s+/,''))+'</li>':l.trim()?'<p>'+esc(l)+'</p>':'').join('').replace(/(<li>.*?<\/li>)+/g,m=>'<ul>'+m+'</ul>');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ma]');if(!b)return;const box=document.getElementById('ma-'+b.dataset.ma);if(!box)return;box.hidden=!box.hidden;b.setAttribute('aria-expanded',String(!box.hidden));b.textContent=box.hidden?'মডেল উত্তর':'উত্তর লুকান';});
function qHtml(it,showSrc){
  const {q,qi,key,p}=it, m=qMarks(q);
  return `<article class="q" data-k="${key}"><div class="qh"><span class="qn">প্রশ্ন ${bn(qi+1)}</span>${m?`<span class="qm">${bn(fmt(m))} নম্বর</span>`:''}${showSrc?`<span class="chip course" style="--c:${CM[p.c].c}">${CM[p.c].n} ${p.title}</span>`:''}
   ${p.a&&p.a[qi]?`<button class="mabtn" data-ma="${key}" aria-expanded="false">মডেল উত্তর</button>`:''}<button class="star" data-star="${key}" aria-pressed="${state.stars.has(key)}" aria-label="তালিকায় রাখুন">${STAR}</button></div>
   <ol class="parts">${q.main.map(partHtml).join('')}</ol>${q.alt?`<div class="orbar">অথবা</div><ol class="parts">${q.alt.map(partHtml).join('')}</ol>`:''}${p.a&&p.a[qi]?`<div class="model mabox" id="ma-${key}" hidden><b>মডেল উত্তর</b>${modelHtml(p.a[qi])}</div>`:''}</article>`;
}
function renderBank(){
  syncControls();
  const res=filterBank(), nq=res.reduce((a,r)=>a+r.qs.length,0);
  $('#qCount').textContent=`${bn(nq)}টি প্রশ্ন, ${bn(res.length)}টি পেপার`;
  const active=state.f.q||state.f.topic!=='all'||state.f.star;
  if(!res.length){
    $('#qList').innerHTML=`<div class="miss"><b>কোনো প্রশ্ন মেলেনি।</b><br>ফিল্টার কমিয়ে বা অন্য কীওয়ার্ড দিয়ে দেখুন।<br><button class="btn ink sm" id="missReset">সব ফিল্টার মুছুন</button></div>`; return;
  }
  $('#qList').innerHTML=res.map((r,i)=>{
    const p=r.p, open=state.open&&(active||i<4);
    const tm=p.qs.reduce((a,q)=>a+qMarks(q),0);
    return `<details class="paper" ${open?'open':''}><summary><span class="chip course" style="--c:${CM[p.c].c}">${CM[p.c].n}</span><span class="pt1">${esc(p.title)}</span><span class="chip gray">${p.t==='F'?'ফাইনাল':'টার্ম টেস্ট/কুইজ'}</span><span class="chip gray">${bn(p.total)} নম্বর</span><span class="pn">${esc(p.code)} — ${esc(p.note||'')}</span></summary>${r.qs.map(x=>qHtml({...x,p:p},false)).join('')}</details>`;
  }).join('');
}
function goBank(patch){
  Object.assign(state.f,{course:'all',year:'all',type:'all',topic:'all',q:'',star:false},patch||{});
  renderBank(); document.getElementById('questions').scrollIntoView();
}
$('#qSearch').addEventListener('input',e=>{state.f.q=e.target.value;renderBank();});
$('#fYear').addEventListener('change',e=>{state.f.year=e.target.value;renderBank();});
$('#fType').addEventListener('change',e=>{state.f.type=e.target.value;renderBank();});
$('#fTopic').addEventListener('change',e=>{state.f.topic=e.target.value;renderBank();});
$('#qCourse').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b){state.f.course=b.dataset.c;renderBank();}});
$('#bStar').onclick=()=>{state.f.star=!state.f.star;renderBank();};
$('#bReset').onclick=()=>{Object.assign(state.f,{course:'all',year:'all',type:'all',topic:'all',q:'',star:false});renderBank();};
$('#bToggle').onclick=()=>{const ds=$$('#qList details.paper');const anyOpen=ds.some(d=>d.open);ds.forEach(d=>d.open=!anyOpen);$('#bToggle').textContent=anyOpen?'সব খুলুন':'সব বন্ধ করুন';};
$('#qList').addEventListener('click',e=>{
  if(e.target.closest('#missReset')) return $('#bReset').click();
  const s=e.target.closest('[data-star]');
  if(s){toggleStar(s.dataset.star);s.setAttribute('aria-pressed',String(state.stars.has(s.dataset.star)));syncControls();if(state.f.star)renderBank();}
});
function listText(){
  const res=filterBank(); let t='';
  res.forEach(r=>{t+=`\n== ${CM[r.p.c].n} | ${r.p.title} ==\n`;r.qs.forEach(x=>{t+=`\nপ্রশ্ন ${x.qi+1}\n`+x.q.main.map(pt=>`  ${pt.l}) ${pt.t}${pt.m?' ['+pt.m+']':''}`).join('\n')+'\n';if(x.q.alt)t+='  অথবা\n'+x.q.alt.map(pt=>`  ${pt.l}) ${pt.t}${pt.m?' ['+pt.m+']':''}`).join('\n')+'\n';});});
  return t.trim();
}
$('#bCopy').onclick=()=>{
  const t=listText(); if(!t) return toast('কপি করার মতো প্রশ্ন নেই');
  const fallback=()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('কপি হয়েছে');}catch(_){toast('কপি করা গেল না, নিজে সিলেক্ট করে নিন');}a.remove();};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(()=>toast('কপি হয়েছে'),fallback); else fallback();
};
$('#bPrint').onclick=()=>{$$('#qList details.paper').forEach(d=>d.open=true);window.print();};

/* ---------- প্র্যাকটিস মোড ---------- */
let pr={on:false,item:null,left:0,run:false,h:null};
function pickRandom(){
  const res=filterBank(), pool=[]; res.forEach(r=>r.qs.forEach(x=>pool.push({...x,p:r.p})));
  if(!pool.length){pr.item=null;return;}
  let it; do{it=pool[Math.floor(Math.random()*pool.length)];}while(pool.length>1&&pr.item&&it.key===pr.item.key);
  pr.item=it; pr.left=Math.max(60,Math.round(qMarks(it.q)*3*60)||600); pr.run=false; clearInterval(pr.h);
}
const tfmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function renderPrac(){
  const m=$('#pracMount');
  $('#bPrac').setAttribute('aria-pressed',String(pr.on)); $('#bPrac').textContent=pr.on?'প্র্যাকটিস বন্ধ করুন':'প্র্যাকটিস মোড';
  if(!pr.on){m.innerHTML='';clearInterval(pr.h);return;}
  if(!pr.item) pickRandom();
  if(!pr.item){m.innerHTML='<div class="prac"><div class="ph"><b>প্র্যাকটিস মোড</b></div><div class="pbody"><div class="miss" style="border:0">বর্তমান ফিল্টারে কোনো প্রশ্ন নেই।</div></div></div>';return;}
  m.innerHTML=`<div class="prac"><div class="ph"><b>র‍্যান্ডম প্রশ্ন</b><span class="chip" style="background:#ffffff22;color:inherit">${CM[pr.item.p.c].n} ${esc(pr.item.p.title)}</span><span class="timer ${pr.left<60?'low':''}" id="tm" aria-live="off">${tfmt(pr.left)}</span></div>
   <div class="pbody">${qHtml(pr.item,false)}</div>
   <div class="pf"><button class="btn ink sm" id="pGo">${pr.run?'থামান':'টাইমার চালু'}</button><button class="btn ghost sm" id="pNext">পরের র‍্যান্ডম প্রশ্ন</button><span class="count" style="align-self:center">প্রতি নম্বরে ৩ মিনিট ধরে সময় দেওয়া হয়েছে (ফাইনালের মতো)।</span></div></div>`;
}
$('#bPrac').onclick=()=>{pr.on=!pr.on;pr.item=null;renderPrac();if(pr.on)$('#pracMount').scrollIntoView({block:'nearest'});};
$('#pracMount').addEventListener('click',e=>{
  if(e.target.closest('#pNext')){pickRandom();renderPrac();return;}
  if(e.target.closest('#pGo')){
    pr.run=!pr.run; clearInterval(pr.h);
    if(pr.run) pr.h=setInterval(()=>{pr.left--;const t=$('#tm');if(t){t.textContent=tfmt(Math.max(0,pr.left));t.classList.toggle('low',pr.left<60);}if(pr.left<=0){clearInterval(pr.h);pr.run=false;toast('সময় শেষ');renderPrac();}},1000);
    $('#pGo').textContent=pr.run?'থামান':'টাইমার চালু';return;
  }
  const s=e.target.closest('[data-star]');
  if(s){toggleStar(s.dataset.star);s.setAttribute('aria-pressed',String(state.stars.has(s.dataset.star)));syncControls();}
});

/* ---------- GPA ---------- */
const GR=[['A+',4.00,'80–100'],['A',3.75,'75–79'],['A−',3.50,'70–74'],['B+',3.25,'65–69'],['B',3.00,'60–64'],['B−',2.75,'55–59'],['C+',2.50,'50–54'],['C',2.25,'45–49'],['D',2.00,'40–44'],['F',0,'০–৩৯']];
function renderGpa(){
  const sem=CURRICULUM[state.gpa.sem];
  $('#gSem').innerHTML=CURRICULUM.map((s,i)=>`<option value="${i}" ${i===state.gpa.sem?'selected':''}>${s.name}</option>`).join('');
  $('#gRows').innerHTML=sem.courses.map((c,i)=>`<div class="grow"><div class="ct">${esc(c.title)}<small>${esc(c.code)}, ${bn(fmt(c.cr))} ক্রেডিট</small></div><select class="fld" data-i="${i}" aria-label="${esc(c.title)} গ্রেড"><option value="">গ্রেড</option>${GR.map((g,gi)=>`<option value="${gi}" ${state.gpa.grades[sem.name+i]==gi&&state.gpa.grades[sem.name+i]!==undefined?'selected':''}>${g[0]} (${g[1].toFixed(2)})</option>`).join('')}</select></div>`).join('');
  $('#gScale').innerHTML=GR.map(g=>`<span>${g[0]}: ${g[2]} → ${g[1].toFixed(2)}</span>`).join('');
  calcGpa();
}
function semGp(){
  const sem=CURRICULUM[state.gpa.sem]; let pts=0,cr=0;
  sem.courses.forEach((c,i)=>{const g=state.gpa.grades[sem.name+i];if(g!==undefined&&g!==''){pts+=GR[g][1]*c.cr;cr+=c.cr;}});
  return {pts,cr,sgpa:cr?pts/cr:null,all:sem.courses.every((c,i)=>state.gpa.grades[sem.name+i]!==undefined&&state.gpa.grades[sem.name+i]!=='')};
}
function calcGpa(){
  LS.set('geb_grades',state.gpa.grades);LS.set('geb_saved',state.gpa.saved);
  const r=semGp(); $('#gS').textContent=r.sgpa===null?'–':r.sgpa.toFixed(2);
  const sv=state.gpa.saved; const tp=sv.reduce((a,x)=>a+x.pts,0), tc=sv.reduce((a,x)=>a+x.cr,0);
  $('#gC').textContent=tc?(tp/tc).toFixed(2):'–';
  $('#gSaved').innerHTML=sv.map((x,i)=>`<div class="sv"><span>${esc(x.name)}: SGPA <b>${x.sgpa.toFixed(2)}</b> (${bn(fmt(x.cr))} ক্রেডিট)</span><button class="x" data-del="${i}" aria-label="মুছুন">×</button></div>`).join('');
}
$('#gSem').addEventListener('change',e=>{state.gpa.sem=+e.target.value;renderGpa();});
$('#gRows').addEventListener('change',e=>{const s=e.target.closest('select[data-i]');if(!s)return;const sem=CURRICULUM[state.gpa.sem];state.gpa.grades[sem.name+s.dataset.i]=s.value===''?undefined:+s.value;calcGpa();});
$('#gAdd').onclick=()=>{const r=semGp();if(!r.cr)return toast('আগে অন্তত একটি কোর্সের গ্রেড দিন');const sem=CURRICULUM[state.gpa.sem];state.gpa.saved=state.gpa.saved.filter(x=>x.name!==sem.name);state.gpa.saved.push({name:sem.name,sgpa:r.sgpa,pts:r.pts,cr:r.cr});calcGpa();toast(r.all?'সেমিস্টার যোগ হয়েছে':'যোগ হয়েছে (কিছু কোর্সে গ্রেড দেওয়া হয়নি)');};
$('#gClr').onclick=()=>{state.gpa.saved=[];state.gpa.grades={};renderGpa();};
$('#gSaved').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(b){state.gpa.saved.splice(+b.dataset.del,1);calcGpa();}});

/* ---------- প্রোগ্রাম ---------- */
function renderProgram(){
  const P=PROGRAM, tot=P.credits.reduce((a,x)=>a+x[1],0);
  const cols=['#0B8F73','#2B6CB0','#7C4DDB','#B7791F','#D6336C']; let acc=0;
  const grad=P.credits.map((x,i)=>{const a=acc/tot*360;acc+=x[1];return `${cols[i]} ${a}deg ${acc/tot*360}deg`;}).join(',');
  $('#progMount').innerHTML=`
   <div class="panel wide"><h3>${esc(P.degree)}</h3><p style="margin:0 0 14px;color:var(--muted)">ডিপার্টমেন্ট অব জেনেটিক ইঞ্জিনিয়ারিং অ্যান্ড বায়োটেকনোলজি (${bn(P.est)} সাল থেকে), শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়।</p>
     <div class="facts">${P.rules.map(r=>`<div class="fact"><b>${bn(r[1])}</b><span>${r[0]}</span></div>`).join('')}</div></div>
   <div class="panel"><h3>ক্রেডিট কাঠামো</h3><div class="donutw"><div class="donut" data-t="${bn(fmt(tot))}" style="background:conic-gradient(${grad})" role="img" aria-label="ক্রেডিট বণ্টন"></div><div class="leg">${P.credits.map((x,i)=>`<span><i style="background:${cols[i]}"></i>${x[0]}: ${bn(fmt(x[1]))}</span>`).join('')}</div></div></div>
   <div class="panel"><h3>ভিশন</h3><p style="margin:0;color:var(--muted)">${esc(P.vision)}</p><h3 style="margin-top:16px">মিশন</h3><ul style="margin:0;padding-left:20px;color:var(--muted)">${P.mission.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
   <div class="panel"><h3>যেসব ক্ষেত্রে দক্ষ হবেন</h3><div class="chips">${P.areas.map(a=>`<span class="chip">${esc(a)}</span>`).join('')}</div></div>
   <div class="panel"><details class="acc" open><summary>Program Educational Objectives (PEO)</summary><ul>${P.peos.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details><details class="acc"><summary>Program Learning Outcomes (PO ১–১০)</summary><ul>${P.pos.map((x,i)=>`<li><b>PO${i+1}</b> ${esc(x)}</li>`).join('')}</ul></details></div>`;
}

/* ---------- কমান্ড প্যালেট ---------- */
let palSel=0,palItems=[];
function openPal(){$('#pal').classList.add('on');$('#scrim').classList.add('on');$('#palIn').value='';buildPal('');$('#palIn').focus();}
function closePal(){$('#pal').classList.remove('on');if(!$('#drawer').classList.contains('on'))$('#scrim').classList.remove('on');}
function buildPal(q){
  q=q.trim().toLowerCase(); palItems=[];
  const codeRes=[];
  CURRICULUM.forEach(s=>s.courses.forEach(c=>{if(!q||(c.code+' '+c.title).toLowerCase().includes(q))codeRes.push(c);}));
  const tRes=TOPICS.filter(t=>t.n>0&&(!q||t.l.toLowerCase().includes(q))).sort((a,b)=>b.n-a.n).slice(0,q?6:3);
  const qRes=[]; if(q.length>1) PAPERS.forEach(p=>p.qs.forEach((x,qi)=>{if(qRes.length<8&&allParts(x).some(pt=>pt.t.toLowerCase().includes(q)))qRes.push({p,qi,x});}));
  let h='';
  const add=(g,arr,fn)=>{if(!arr.length)return;h+=`<li class="g">${g}</li>`;arr.forEach(a=>{const o=fn(a);palItems.push(o);h+=`<li class="r" role="option" data-i="${palItems.length-1}"><span>${o.l}</span><span class="chip gray">${o.r}</span></li>`;});};
  add('কোর্স',codeRes.slice(0,q?8:5),c=>({l:esc(c.title),r:esc(c.code),go:()=>{closePal();document.getElementById('syllabus').scrollIntoView();state.year=c.s.y;state.sem=c.s.s;renderSyllabus();setTimeout(()=>openCourse(c.code),200);}}));
  add('হট টপিক',tRes,t=>({l:esc(t.l),r:bn(t.n)+' পরীক্ষায়',go:()=>{closePal();goBank({course:t.c[0],topic:String(t.id)});}}));
  add('প্রশ্ন',qRes,r=>{const pt=allParts(r.x).find(pt=>pt.t.toLowerCase().includes(q));return {l:esc(pt.t.slice(0,90)),r:CM[r.p.c].n+' '+esc(r.p.title),go:()=>{closePal();goBank({q:$('#palIn').value.trim()});}};});
  $('#palList').innerHTML=h||'<li class="g">কিছু পাওয়া যায়নি</li>'; palSel=0; markSel();
}
function markSel(){$$('#palList li.r').forEach((li,i)=>{li.setAttribute('aria-selected',String(i===palSel));if(i===palSel)li.scrollIntoView({block:'nearest'});});}
$('#openPal').onclick=openPal;
$('#palIn').addEventListener('input',e=>buildPal(e.target.value));
$('#palIn').addEventListener('keydown',e=>{
  const n=palItems.length;
  if(e.key==='ArrowDown'){e.preventDefault();palSel=(palSel+1)%Math.max(n,1);markSel();}
  else if(e.key==='ArrowUp'){e.preventDefault();palSel=(palSel-1+Math.max(n,1))%Math.max(n,1);markSel();}
  else if(e.key==='Enter'){e.preventDefault();if(palItems[palSel])palItems[palSel].go();}
});
$('#palList').addEventListener('click',e=>{const li=e.target.closest('li.r');if(li)palItems[+li.dataset.i].go();});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal();}
  else if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();openPal();}
  else if(e.key==='Escape'){if($('#pal').classList.contains('on'))closePal();else if($('#drawer').classList.contains('on'))closeDrawer();}
});

/* ---------- নেভ হাইলাইট ---------- */
const secs=['syllabus','calendar','hot','questions','exam','community','teachers','files','gpa','program','dnacard','gallery'];
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){$$('#navlinks a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id));}}),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el);});


/* ---------- নোটিস, ফাইল, ভিজিট ---------- */
let resC='all';
const fsz=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
function renderResources(){
  const cs=[...new Set(D.resources.map(r=>r.c).filter(Boolean))];
  $('#resFilter').innerHTML=D.resources.length?`<button class="fc" data-c="all" aria-pressed="${resC==='all'}">সব</button>`+cs.map(c=>`<button class="fc" data-c="${c}" style="--c:${CM[c]?CM[c].c:'#888'}" aria-pressed="${resC===c}"><span class="dot"></span>${CM[c]?CM[c].n:c}</button>`).join(''):'';
  const list=D.resources.filter(r=>resC==='all'||r.c===resC);
  $('#resList').innerHTML=list.length?list.map(r=>`<a class="res" href="/uploads/${encodeURIComponent(r.file)}" target="_blank" rel="noopener"><span class="rt">${esc(r.title)}</span><span class="rm">${r.c&&CM[r.c]?`<span class="chip course" style="--c:${CM[r.c].c}">${CM[r.c].n}</span>`:''}<span class="chip gray">${esc((r.name.split('.').pop()||'').toUpperCase())}</span><span class="chip gray">${fsz(r.size)}</span><span class="chip gray">${esc(r.date)}</span></span></a>`).join(''):`<div class="miss">এখনো কোনো ফাইল যোগ হয়নি। অ্যাডমিন প্যানেল থেকে নোট, লেকচার শিট বা প্রশ্নের PDF আপলোড করলে এখানে দেখা যাবে।</div>`;
}
if($('#resFilter')) $('#resFilter').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b){resC=b.dataset.c;renderResources();}});

if($('#resList')) renderResources();

/* ---------- শুরু ---------- */
renderSyllabus(); renderHot(); setupFilters(); renderBank(); renderGpa(); renderProgram();
if(!PAPERS.length){
  const es=(t,d)=>`<div class="empty-state"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"/><path d="M8 11h8M8 15h5"/></svg><b>${t}</b><span>${d}</span></div>`;
  const f=document.getElementById('filters'); if(f) f.hidden=true;
  $('#qList').innerHTML=es('এখনো কোনো প্রশ্ন যোগ হয়নি','এই সেমিস্টারের প্রশ্ন যোগ হলে এখানে দেখা যাবে।');
  const hf=$('#hotFilter'); if(hf) hf.hidden=true;
  $('#hotList').innerHTML=es('এখনো কোনো হট টপিক নেই','প্রশ্ন যোগ হলে কোন টপিক বারবার আসে তা এখানে দেখা যাবে।');
}
window.__gebToast=toast;
if(window.startCommunity) window.startCommunity(D);
if(window.GEBX) window.GEBX.start(D);
if(window.startExam) window.startExam({PAPERS,CM,esc,bn,fmt,qMarks,$,toast,QUIZ:D.quiz||[],S:D.settings});
};
