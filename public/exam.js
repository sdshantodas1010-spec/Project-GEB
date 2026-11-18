/* পরীক্ষা হাব: পরীক্ষা (সেলফ-চেক) · মক পরীক্ষা · ভুল খাতা · অগ্রগতি · ঐচ্ছিক ফ্রি AI */
window.startExam=function(H){
'use strict';
const {PAPERS,CM,esc,bn,fmt,qMarks,$,toast,QUIZ,S}=H, Store=window.GEBStore;
const mount=$('#examMount'); if(!mount) return;
const tfmt=s=>{s=Math.max(0,s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
const MAXF=8, MODE={paper:'পরীক্ষা',mock:'মক',wrong:'ভুল খাতা',ai:'AI'};
const ex={tab:'exam',phase:'setup',course:null,pid:null,only:'all',mins:null,sess:null,files:[],ai:null,aiInfo:null,busy:false,res:null,over:false,h:null,
  mock:{c:'all',mcq:S.mock.mcq,short:S.mock.short,written:S.mock.written,mins:S.mock.mins,ansOnly:true},wf:'all',wopen:{},wres:{},pf:'all',pm:'all'};

fetch('/api/grade-status').then(r=>r.json()).then(j=>{ex.ai=!!j.on;ex.aiInfo=j;if(ex.phase==='setup'||ex.phase==='check')render();}).catch(()=>{ex.ai=false;});

/* ---------- ডেটা হেল্পার ---------- */
const cn=c=>CM[c]?CM[c].n:c;
const coursesWithPapers=()=>Object.keys(CM).filter(c=>PAPERS.some(p=>p.c===c));
const papersOf=c=>PAPERS.filter(p=>p.c===c).sort((a,b)=>(b.y-a.y)||(a.t<b.t?-1:1));
const curP=()=>PAPERS.find(p=>p.id===ex.pid);
const qm=(p,i)=>qMarks(p.qs[i]);
const scopeMarks=()=>{const p=curP();return ex.only==='all'?p.qs.reduce((n,_,i)=>n+qm(p,i),0):qm(p,+ex.only);};
const defMins=()=>Math.max(5,Math.round(scopeMarks()*(S.minsPerMark||3)));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const sum=a=>a.reduce((n,x)=>n+x.mv,0);
const plain=q=>q.main.map(p=>`(${p.l}) ${p.t}${p.m?' ['+p.m+']':''}`).join('\n')+(q.alt?'\n— অথবা —\n'+q.alt.map(p=>`(${p.l}) ${p.t}${p.m?' ['+p.m+']':''}`).join('\n'):'');
function writtenItem(p,i){
  const q=p.qs[i]; let max=qMarks(q); if(!max) max=Math.max(1,Math.round(p.total/p.qs.length));
  return {k:Store.hash(p.c+'|'+p.q[i]),type:'written',c:p.c,qs:q,q:plain(q),max,ans:(p.a&&p.a[i])||'',src:cn(p.c)+' · '+p.title,qn:i+1,user:{text:'',side:'main'},got:null};
}
function quizItem(z){
  return {k:Store.hash(z.c+'|'+z.q),type:z.type,c:z.c,q:z.q,opts:z.opts,correct:z.ans,accept:z.accept,exp:z.exp||'',max:1,src:cn(z.c)+(z.type==='mcq'?' · MCQ':' · ছোট প্রশ্ন'),user:{sel:null,text:''},got:null};
}
const wmax=it=>it.user&&it.user.side==='alt'&&it.qs&&it.qs.alt?(sum(it.qs.alt)||it.max):it.max;
const ansHtml=t=>{const {body}=Store.parseAns(t);return body.split('\n').map(l=>/^\s*[-•]\s+/.test(l)?`<li>${esc(l.replace(/^\s*[-•]\s+/,''))}</li>`:l.trim()?`<p>${esc(l)}</p>`:'').join('').replace(/(<li>.*?<\/li>)+/g,m=>`<ul>${m}</ul>`);};

/* ---------- মূল রেন্ডার ---------- */
function render(){
  clearInterval(ex.h);
  const busyPhase=ex.phase!=='setup'&&ex.tab!=='wrong'&&ex.tab!=='prog';
  const wc=Store.wrong().length;
  const tabs=`<div class="seg extabs" role="tablist" aria-label="পরীক্ষা অংশ">${[['exam','পরীক্ষা'],['mock','মক পরীক্ষা'],['wrong','ভুল খাতা'+(wc?' ('+bn(wc)+')':'')],['prog','অগ্রগতি']].map(t=>`<button role="tab" data-tab="${t[0]}" aria-selected="${ex.tab===t[0]}">${t[1]}</button>`).join('')}</div>`;
  mount.innerHTML=tabs+'<div id="exBody"></div>';
  const body=$('#exBody');
  if(ex.phase==='run'||ex.phase==='check'||ex.phase==='result'||ex.phase==='ai'){ if(ex.phase==='run')return renderRun(body); if(ex.phase==='check')return renderCheck(body); if(ex.phase==='result')return renderResult(body); return renderAi(body); }
  if(ex.tab==='exam') return renderSetup(body);
  if(ex.tab==='mock') return renderMockSetup(body);
  if(ex.tab==='wrong') return renderWrong(body);
  return renderProg(body);
}

/* ---------- পরীক্ষা সেটআপ (বিগত প্রশ্নপত্র) ---------- */
function renderSetup(body){
  const cs=coursesWithPapers();
  if(!cs.length){body.innerHTML='<div class="miss">পরীক্ষা দেওয়ার মতো কোনো প্রশ্নপত্র এখনো যোগ হয়নি।</div>';return;}
  if(!ex.course||!cs.includes(ex.course)) ex.course=cs[0];
  const ps=papersOf(ex.course); if(!ps.some(p=>p.id===ex.pid)){ex.pid=ps[0].id;ex.only='all';ex.mins=null;}
  const p=curP(); if(ex.mins==null) ex.mins=defMins();
  const hasAns=p.a&&p.a.some(Boolean);
  body.innerHTML=`<div class="exbox">
   <div class="exrow"><label class="exl">কোর্স</label><div class="fchips" id="exC">${cs.map(c=>`<button class="fc" data-c="${c}" style="--c:${CM[c].c}" aria-pressed="${ex.course===c}"><span class="dot"></span>${esc(CM[c].n)}</button>`).join('')}</div></div>
   <div class="exrow"><label class="exl" for="exP">প্রশ্নপত্র</label><select class="fld" id="exP">${ps.map(x=>`<option value="${x.id}" ${x.id===ex.pid?'selected':''}>${esc(x.title)} (${x.yl}) — ${bn(x.total)} নম্বর</option>`).join('')}</select></div>
   <div class="exrow"><label class="exl" for="exS">কতটুকু দেবেন</label><select class="fld" id="exS"><option value="all" ${ex.only==='all'?'selected':''}>পুরো প্রশ্নপত্র (${bn(fmt(p.qs.reduce((n,_,i)=>n+qm(p,i),0)))} নম্বর)</option>${p.qs.map((_,i)=>`<option value="${i}" ${String(ex.only)===String(i)?'selected':''}>শুধু প্রশ্ন ${bn(i+1)} (${bn(fmt(qm(p,i)))} নম্বর)</option>`).join('')}</select></div>
   <div class="exrow"><label class="exl" for="exM">সময় (মিনিট)</label><input class="fld" id="exM" type="number" min="1" max="360" value="${ex.mins}" style="width:110px"><span class="count">প্রতি নম্বরে ${bn(S.minsPerMark||3)} মিনিট ধরে ${bn(defMins())} মিনিট দেওয়া হয়েছে</span></div>
   <p class="exhint ${hasAns?'ok':''}">${hasAns?'এই প্রশ্নপত্রে মডেল উত্তর আছে, শেষে নিজের খাতা মিলিয়ে নম্বর দিতে পারবেন।':'এই প্রশ্নপত্রে এখনো মডেল উত্তর যোগ হয়নি। তবু পরীক্ষা দেওয়া যাবে, নম্বর নিজের বিচারে দিতে হবে।'}</p>
   <div class="frow"><button class="btn ink" id="exGo">পরীক্ষা শুরু করুন</button></div>
   <p class="count" style="margin:12px 0 0">কাগজে বা এখানেই লিখে উত্তর দিন। শেষে মডেল উত্তরের সাথে মিলিয়ে নিজে নম্বর দেবেন (সেলফ-চেক)। ফলাফল আপনার ব্রাউজারে সেভ থাকবে।</p>
  </div>`;
}
function startPaper(){
  const p=curP(), idx=ex.only==='all'?p.qs.map((_,i)=>i):[+ex.only];
  const m=Math.max(1,Math.min(360,parseInt($('#exM').value)||defMins()));
  beginSession({mode:'paper',title:cn(p.c)+' · '+p.title,course:p.c,pid:p.id,only:ex.only,mins:m,note:p.note,items:idx.map(i=>writtenItem(p,i))});
}
function beginSession(s){ s.deadline=Date.now()+s.mins*60000; ex.sess=s; ex.files=[]; ex.over=false; ex.res=null; ex.phase='run'; render(); mount.scrollIntoView({block:'start'}); }

/* ---------- মক পরীক্ষা সেটআপ ---------- */
function pools(c){
  const quiz=QUIZ.filter(z=>c==='all'||z.c===c);
  const wr=[]; PAPERS.forEach(p=>{if(c!=='all'&&p.c!==c)return;p.qs.forEach((q,i)=>{wr.push({p,i,has:!!(p.a&&p.a[i])});});});
  return {mcq:quiz.filter(z=>z.type==='mcq'),short:quiz.filter(z=>z.type==='short'),wr};
}
function renderMockSetup(body){
  const m=ex.mock, cs=[...new Set([...PAPERS.map(p=>p.c),...QUIZ.map(z=>z.c)])].filter(c=>CM[c]);
  if(m.c!=='all'&&!cs.includes(m.c)) m.c='all';
  const P=pools(m.c), wp=m.ansOnly?P.wr.filter(x=>x.has):P.wr;
  const cl=(v,mx)=>Math.max(0,Math.min(mx,parseInt(v)||0));
  body.innerHTML=`<div class="exbox">
   <p class="exhint ok" style="margin-top:0">মক পরীক্ষা: বিগত প্রশ্ন ও MCQ/ছোট প্রশ্ন থেকে এলোমেলোভাবে নতুন একটি পরীক্ষা তৈরি হয়। MCQ ও ছোট উত্তর নিজে নিজে চেক হবে, লিখিত প্রশ্নে মডেল উত্তরের সাথে মিলিয়ে নিজে নম্বর দেবেন।</p>
   <div class="exrow"><label class="exl" for="mkC">কোর্স</label><select class="fld" id="mkC"><option value="all">সব কোর্স মিলিয়ে</option>${cs.map(c=>`<option value="${c}" ${m.c===c?'selected':''}>${esc(CM[c].n)} — ${esc(CM[c].t)}</option>`).join('')}</select></div>
   <div class="exrow"><label class="exl">প্রশ্নের সংখ্যা</label><div class="nums">
     <label>MCQ <input class="fld" type="number" id="mkMcq" min="0" max="${P.mcq.length}" value="${cl(m.mcq,P.mcq.length)}"><small>আছে ${bn(P.mcq.length)}টি</small></label>
     <label>ছোট উত্তর <input class="fld" type="number" id="mkShort" min="0" max="${P.short.length}" value="${cl(m.short,P.short.length)}"><small>আছে ${bn(P.short.length)}টি</small></label>
     <label>লিখিত <input class="fld" type="number" id="mkWr" min="0" max="${wp.length}" value="${cl(m.written,wp.length)}"><small>আছে ${bn(wp.length)}টি</small></label></div></div>
   <div class="exrow"><label class="exl"></label><label class="chk"><input type="checkbox" id="mkAns" ${m.ansOnly?'checked':''}> লিখিত প্রশ্নে শুধু মডেল উত্তর আছে এমনগুলো নিন</label></div>
   <div class="exrow"><label class="exl" for="mkMin">সময় (মিনিট)</label><input class="fld" id="mkMin" type="number" min="5" max="360" value="${m.mins}" style="width:110px"></div>
   <div class="frow"><button class="btn ink" id="mkGo">মক পরীক্ষা শুরু করুন</button><button class="btn ghost" id="mkQuick" title="১০টি MCQ, ১০ মিনিট">শুধু MCQ কুইজ</button></div>
   ${!P.mcq.length&&!P.short.length?'<p class="count" style="margin-top:12px">MCQ/ছোট প্রশ্ন এখনো যোগ হয়নি। অ্যাডমিন প্যানেলের “MCQ ও ছোট প্রশ্ন” ট্যাব থেকে যোগ করলে এখানে আসবে।</p>':''}
  </div>`;
}
function startMock(quick){
  const m=ex.mock, P=pools(m.c); let nm=m.mcq,ns=m.short,nw=m.written,mins=m.mins;
  if(quick){nm=Math.min(10,P.mcq.length);ns=0;nw=0;mins=Math.max(5,nm);}
  const wp=m.ansOnly&&!quick?P.wr.filter(x=>x.has):P.wr;
  const items=[...shuffle(P.mcq).slice(0,nm).map(quizItem),...shuffle(P.short).slice(0,ns).map(quizItem),...shuffle(wp).slice(0,nw).map(x=>writtenItem(x.p,x.i))];
  if(!items.length){toast('পরীক্ষার মতো প্রশ্ন নেই, সংখ্যা বাড়ান');return;}
  beginSession({mode:'mock',title:(m.c==='all'?'সব কোর্স':cn(m.c))+' · মক পরীক্ষা',course:m.c==='all'?'mixed':m.c,mins,items});
}

/* ---------- পরীক্ষা চলছে ---------- */
function writtenBlock(it,i){
  const q=it.qs, pl=pt=>`<li><span class="pl">${esc(pt.l)}.</span><span>${esc(pt.t)}</span>${pt.m?`<span class="pm">${bn(esc(pt.m))}</span>`:''}</li>`;
  return `<article class="q"><div class="qh"><span class="qn">লিখিত ${bn(i+1)}</span><span class="qm">${bn(fmt(it.max))} নম্বর</span>${ex.sess.mode!=='paper'?`<span class="chip course" style="--c:${CM[it.c]?CM[it.c].c:'#888'}">${esc(it.src)}</span>`:''}</div>
   <ol class="parts exparts">${q.main.map(pl).join('')}</ol>${q.alt?`<div class="orbar">অথবা</div><ol class="parts exparts">${q.alt.map(pl).join('')}</ol><div class="side">কোনটির উত্তর লিখছেন? <label><input type="radio" name="sd${i}" data-side="${i}" value="main" ${it.user.side==='main'?'checked':''}> প্রথমটি</label> <label><input type="radio" name="sd${i}" data-side="${i}" value="alt" ${it.user.side==='alt'?'checked':''}> দ্বিতীয়টি</label></div>`:''}
   <div class="wbox"><textarea class="fld" data-wt="${i}" rows="3" placeholder="এখানে লিখে রাখতে পারেন (ঐচ্ছিক)। কাগজে লিখলে এটা খালি রাখুন।">${esc(it.user.text)}</textarea></div></article>`;
}
function renderRun(body){
  const s=ex.sess; let nm=0,ns=0,nw=0;
  const blocks=s.items.map((it,i)=>{
    if(it.type==='mcq'){nm++;return `<article class="q"><div class="qh"><span class="qn">MCQ ${bn(nm)}</span><span class="qm">১ নম্বর</span></div><p class="qt">${esc(it.q)}</p><div class="opts">${it.opts.map((o,j)=>`<label class="opt"><input type="radio" name="mc${i}" data-mc="${i}" value="${j}" ${it.user.sel===j?'checked':''}><span class="ol">${'ABCDEFGH'[j]}</span><span>${esc(o)}</span></label>`).join('')}</div></article>`;}
    if(it.type==='short'){ns++;return `<article class="q"><div class="qh"><span class="qn">ছোট প্রশ্ন ${bn(ns)}</span><span class="qm">১ নম্বর</span></div><p class="qt">${esc(it.q)}</p><input class="fld" data-sh="${i}" value="${esc(it.user.text)}" placeholder="উত্তর লিখুন" autocomplete="off"></article>`;}
    nw++;return writtenBlock(it,nw-1).replace(/data-side="\d+"/g,`data-side="${i}"`).replace(/name="sd\d+"/g,`name="sd${i}"`).replace(/data-wt="\d+"/,`data-wt="${i}"`);
  }).join('');
  body.innerHTML=`<div class="exrun"><div class="exbar"><b>${esc(s.title)}</b><span class="timer" id="exT" role="timer" aria-live="off">${tfmt(Math.ceil((s.deadline-Date.now())/1000))}</span></div>
   ${s.note?`<div class="exnote">${esc(s.note)}</div>`:''}<div class="exq">${blocks}</div>
   <div class="exup"><div class="frow"><button class="btn ink" id="exFinish">পরীক্ষা শেষ, উত্তর মেলাব</button><button class="btn ghost" id="exCancel">বাতিল</button></div></div></div>`;
  tick(); ex.h=setInterval(tick,1000);
}
function tick(){
  const t=$('#exT'); if(!t||!ex.sess) return;
  const left=Math.ceil((ex.sess.deadline-Date.now())/1000);
  if(left<=0){t.textContent='সময় শেষ';t.classList.add('low');if(!ex.over){ex.over=true;toast('সময় শেষ! এবার উত্তর মিলিয়ে নিন');}return;}
  t.textContent=tfmt(left); t.classList.toggle('low',left<300);
}

/* ---------- অটো-চেক + সেলফ-চেক ---------- */
function autoGrade(){
  ex.sess.items.forEach(it=>{
    if(it.type==='mcq'){it.got=it.user.sel===it.correct?1:0;}
    else if(it.type==='short'){const r=Store.checkShort(it.user.text,it.accept);it.got=r.ok?1:0;it.near=!!r.near;}
  });
}
function renderCheck(body){
  const s=ex.sess, auto=s.items.filter(x=>x.type!=='written'), wr=s.items.filter(x=>x.type==='written');
  const ag=auto.reduce((n,x)=>n+x.got,0);
  const autoHtml=auto.length?`<h4>MCQ ও ছোট প্রশ্ন (অটো-চেক): ${bn(ag)} / ${bn(auto.length)}</h4>`+auto.map(it=>{
    const ok=it.got===1, mine=it.type==='mcq'?(it.user.sel==null?'উত্তর দেননি':'ABCDEFGH'[it.user.sel]+') '+it.opts[it.user.sel]):(it.user.text||'উত্তর দেননি');
    const right=it.type==='mcq'?'ABCDEFGH'[it.correct]+') '+it.opts[it.correct]:it.accept.join(' / ');
    return `<div class="chk-row ${ok?'good':'bad'}"><div class="ci">${ok?'✔':'✘'}</div><div><p class="qt">${esc(it.q)}</p><div class="cmp"><span>আপনার উত্তর: <b>${esc(mine)}</b>${it.near?' <small>(প্রায় মিলেছে)</small>':''}</span>${ok?'':`<span>সঠিক: <b>${esc(right)}</b></span>`}</div>${it.exp?`<p class="count">${esc(it.exp)}</p>`:''}</div></div>`;}).join(''):'';
  const wrHtml=wr.length?`<h4>লিখিত প্রশ্ন: মডেল উত্তরের সাথে মিলিয়ে নিজে নম্বর দিন</h4><p class="count">সৎভাবে মেলান। মূল পয়েন্টগুলো লিখেছেন কি না দেখুন, তারপর নম্বর দিন।</p>`+wr.map((it,n)=>{
    const i=s.items.indexOf(it), mx=wmax(it), pa=Store.parseAns(it.ans), kh=pa.keys.length&&it.user.text?Store.keyHits(it.user.text,pa.keys):null;
    return `<article class="q selfq" data-i="${i}"><div class="qh"><span class="qn">লিখিত ${bn(n+1)}</span><span class="qm">${bn(fmt(mx))} নম্বর</span></div><pre class="qpre">${esc(it.q)}</pre>
     ${it.user.text?`<div class="mine"><b>আপনার লেখা</b><p>${esc(it.user.text)}</p></div>`:''}
     ${it.ans?`<div class="model"><b>মডেল উত্তর</b>${ansHtml(it.ans)}${pa.keys.length?`<p class="count">মূল পয়েন্ট: ${pa.keys.map(k=>`<span class="chip ${kh&&kh.hit.includes(k)?'':'gray'}">${esc(k)}</span>`).join(' ')}</p>`:''}</div>`:`<div class="model none">এই প্রশ্নের মডেল উত্তর যোগ করা হয়নি। নিজের জ্ঞান বা বই দেখে নম্বর দিন।</div>`}
     <div class="mk"><label for="mk${i}">আপনার নম্বর (০ – ${bn(fmt(mx))})</label><div class="mkrow"><input class="fld" id="mk${i}" type="number" min="0" max="${mx}" step="0.5" value="${it.got==null?0:it.got}" data-mk="${i}"><button class="btn ghost sm" data-q="${i}" data-v="0">০</button><button class="btn ghost sm" data-q="${i}" data-v="half">অর্ধেক</button><button class="btn ghost sm" data-q="${i}" data-v="full">পূর্ণ</button></div></div></article>`;}).join(''):'';
  const aiBtn=(s.mode==='paper'&&ex.ai)?`<div class="aibox"><b>ঐচ্ছিক: ফ্রি AI দিয়ে খাতা দেখান</b><p class="count">খাতার ছবি/PDF দিলে AI নম্বর দেবে ও ভুলের নিচে দাগ দেবে। ফ্রি সীমা থাকায় মাঝে মাঝে কাজ নাও করতে পারে। মূল ভরসা সেলফ-চেকই।</p><button class="btn ghost sm" id="aiOpen">AI দিয়ে দেখান</button></div>`:'';
  body.innerHTML=`<div class="exres"><h3>${esc(s.title)}</h3>${autoHtml}${wrHtml}${aiBtn}<div class="frow" style="margin-top:20px"><button class="btn ink" id="exDone">ফলাফল দেখুন ও সেভ করুন</button></div></div>`;
}
function finalize(){
  const s=ex.sess; s.items.forEach(it=>{if(it.got==null)it.got=0;it.got=Math.max(0,Math.min(it.type==='written'?wmax(it):1,it.got));});
  const out=s.items.reduce((n,it)=>n+(it.type==='written'?wmax(it):1),0), got=s.items.reduce((n,it)=>n+it.got,0);
  const rec=Store.recordResults(s.items.map(it=>({k:it.k,type:it.type,c:it.c,q:it.q,opts:it.opts,correct:it.correct,accept:it.accept,exp:it.exp,ans:it.ans,src:it.src,got:it.got,max:it.type==='written'?wmax(it):1})),S);
  Store.addHist({mode:s.mode,c:s.course,title:s.title,got,out,mins:s.mins,items:s.items.map(it=>({k:it.k,got:it.got,max:it.type==='written'?wmax(it):1}))});
  ex.res={got,out,rec}; ex.phase='result'; render(); mount.scrollIntoView({block:'start'});
}
const pct=(g,o)=>o?Math.round(g/o*100):0;
function renderResult(body){
  const s=ex.sess,r=ex.res,pc=pct(r.got,r.out), bad=s.items.filter(it=>it.got/(it.type==='written'?wmax(it):1)<(S.wrongBelowPct||60)/100);
  const msg=pc>=80?'চমৎকার! এভাবে চালিয়ে যান।':pc>=60?'ভালো হয়েছে। দুর্বল জায়গাগুলো আরেকবার দেখে নিন।':pc>=40?'মোটামুটি। ভুল খাতার প্রশ্নগুলো আবার অনুশীলন করুন।':'আরও অনুশীলন দরকার। ভুল খাতা থেকে শুরু করুন, ধীরে ধীরে উন্নতি হবে।';
  body.innerHTML=`<div class="exres"><div class="rtop"><div class="ring" style="--p:${pc}"><div class="din"><b>${bn(fmt(r.got))}</b><span>/ ${bn(fmt(r.out))}</span></div></div><div><h3>${esc(s.title)}</h3><p>${bn(pc)}%। ${msg}</p><p class="count">${r.rec.added?bn(r.rec.added)+'টি প্রশ্ন ভুল খাতায় যোগ হয়েছে। ':''}${r.rec.removed?bn(r.rec.removed)+'টি প্রশ্ন আয়ত্ত হওয়ায় ভুল খাতা থেকে সরেছে। ':''}ফলাফল আপনার ব্রাউজারে সেভ হয়েছে।</p></div></div>
   ${bad.length?`<h4>যেগুলোতে নম্বর কম এসেছে (${bn(bad.length)}টি)</h4><ul class="plain">${bad.map(it=>`<li>${esc(it.q.split('\n')[0].slice(0,140))} <span class="chip sig">${bn(fmt(it.got))}/${bn(fmt(it.type==='written'?wmax(it):1))}</span></li>`).join('')}</ul>`:'<p class="exhint ok">সবগুলোতে ভালো নম্বর! 🎉</p>'}
   <div class="frow" style="margin-top:18px"><button class="btn ink" id="exAgain">আরেকটি পরীক্ষা দিন</button>${bad.length?'<button class="btn ghost" data-tab="wrong" id="toWrong">ভুল খাতা দেখুন</button>':''}<button class="btn ghost" data-tab="prog" id="toProg">অগ্রগতি দেখুন</button><button class="btn ghost" id="exPrint">প্রিন্ট</button></div></div>`;
}

/* ---------- ঐচ্ছিক ফ্রি AI ---------- */
const readB64=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=no;r.readAsDataURL(f);});
function shrink(file){return new Promise((ok,no)=>{
  const url=URL.createObjectURL(file), im=new Image();
  im.onload=()=>{const M=1600,k=Math.min(1,M/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);
    const d=c.toDataURL('image/jpeg',.82);ok({kind:'img',name:file.name,url:d,data:d.split(',')[1]});};
  im.onerror=()=>{URL.revokeObjectURL(url);no(new Error('ছবি পড়া যায়নি: '+file.name));};im.src=url;});}
async function addFiles(list){
  for(const f of [...list]){
    try{
      if(ex.files.length>=MAXF){toast('সর্বোচ্চ '+bn(MAXF)+'টি ফাইল');break;}
      if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){
        if(ex.files.some(x=>x.kind==='pdf')){toast('একসাথে একটি PDF দেওয়া যায়');continue;}
        if(f.size>15*1048576){toast('PDF ১৫ MB-এর কম হতে হবে');continue;}
        ex.files.push({kind:'pdf',name:f.name,data:await readB64(f)});
      } else if(/^image\//.test(f.type)||/\.(jpe?g|png|webp)$/i.test(f.name)) ex.files.push(await shrink(f));
      else toast('শুধু ছবি বা PDF চলবে');
    }catch(e){toast(e.message||'ফাইল পড়া যায়নি');}
  }
  drawThumbs();
}
function drawThumbs(){
  const th=$('#exTh'); if(!th) return;
  th.innerHTML=ex.files.map((f,i)=>`<div class="th">${f.kind==='pdf'?'<div class="pdfi">PDF</div>':`<img src="${f.url}" alt="পাতা ${i+1}">`}<span class="tn">${bn(i+1)}</span><button class="x" data-rm="${i}" aria-label="সরান">×</button><small>${esc(f.name).slice(0,18)}</small></div>`).join('');
  const sb=$('#exSub'); if(sb) sb.disabled=!ex.files.length||ex.busy||!$('#aiOk').checked;
}
function renderAi(body){
  if(ex.aires) return renderAiResult(body);
  const info=ex.aiInfo||{};
  body.innerHTML=`<div class="exbox"><h3 style="margin:0 0 6px">ফ্রি AI দিয়ে খাতা দেখান</h3>
   <p class="exhint">${esc(info.notice||'')}</p>
   <label class="chk"><input type="checkbox" id="aiOk" ${localStorage.getItem('geb_ai_ok')==='1'?'checked':''}> বুঝেছি, আমার খাতার লেখা AI প্রদানকারীর কাছে যাবে</label>
   <p class="count">খাতার প্রতিটি পাতার স্পষ্ট ছবি (সর্বোচ্চ ${bn(MAXF)}টি) অথবা একটি PDF দিন। ${info.providers&&info.providers.length?'চালু আছে: '+esc(info.providers.join(', '))+'।':''} Groq শুধু ছবি পড়ে (PDF নয়)।</p>
   <label class="drop" id="exDrop"><input type="file" id="exF" accept="image/*,application/pdf" multiple hidden><b>ছবি বা PDF বাছুন</b><span>অথবা এখানে টেনে ছাড়ুন</span></label>
   <div class="thumbs" id="exTh"></div>
   <div class="frow"><button class="btn ink" id="exSub" disabled>জমা দিন ও মূল্যায়ন নিন</button><button class="btn ghost" id="aiBack">ফিরে যান</button></div>
   <p class="count" id="aiWait" hidden>এতে ১ মিনিট পর্যন্ত লাগতে পারে। পাতাটি বন্ধ করবেন না।</p></div>`;
  drawThumbs();
}
async function submitAi(){
  if(ex.busy||!ex.files.length) return; const s=ex.sess;
  ex.busy=true; $('#exSub').disabled=true; $('#exSub').textContent='AI খাতা দেখছে…'; $('#aiWait').hidden=false;
  try{
    const r=await fetch('/api/grade',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paperId:s.pid,only:s.only==='all'?null:+s.only,files:ex.files.map(f=>({data:f.data}))})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(j.error||'জমা দেওয়া যায়নি');
    // ইতিহাস ও ভুল খাতায় AI-এর নম্বর সেভ
    const byQ={}; s.items.forEach(it=>byQ[it.qn]=it);
    const rec=Store.recordResults(j.marks.filter(m=>byQ[m.q]).map(m=>{const it=byQ[m.q];return {k:it.k,type:'written',c:it.c,q:it.q,ans:it.ans,src:it.src,got:m.got,max:m.max};}),S);
    Store.addHist({mode:'ai',c:s.course,title:s.title,got:j.got,out:j.out_of,mins:s.mins,items:j.marks.filter(m=>byQ[m.q]).map(m=>({k:byQ[m.q].k,got:m.got,max:m.max}))});
    ex.aires=j; ex.airec=rec; ex.busy=false; render(); mount.scrollIntoView({block:'start'});
  }catch(e){ex.busy=false;toast(e.message||'সমস্যা হয়েছে');if(ex.phase==='ai'&&!ex.aires){const b=$('#exSub');if(b){b.disabled=false;b.textContent='জমা দিন ও মূল্যায়ন নিন';}const w=$('#aiWait');if(w)w.hidden=true;}}
}
const KIND={wrong:'ভুল তথ্য',missing:'অসম্পূর্ণ',spelling:'বানান',vague:'অস্পষ্ট'};
function renderAiResult(body){
  const r=ex.aires,s=ex.sess; let n=0; const pc=pct(r.got,r.out_of);
  body.innerHTML=`<div class="exres"><div class="rtop"><div class="ring" style="--p:${pc}"><div class="din"><b>${bn(fmt(r.got))}</b><span>/ ${bn(fmt(r.out_of))}</span></div></div>
    <div><h3>${esc(s.title)} <span class="chip gray">AI: ${esc(r.by||'')}</span></h3><p>${esc(r.overall)}</p>${r.legible?'':'<p class="exwarn">লেখার কিছু অংশ পড়তে অসুবিধা হয়েছে। পরিষ্কার ছবি দিলে ফল আরও নির্ভুল হবে।</p>'}<p class="count">ফলাফল ইতিহাসে সেভ হয়েছে${ex.airec&&ex.airec.added?' এবং '+bn(ex.airec.added)+'টি প্রশ্ন ভুল খাতায় গেছে':''}।</p></div></div>
   <h4>প্রশ্ন অনুযায়ী নম্বর</h4><div class="mrows">${r.marks.map(m=>`<div class="mrow"><b>প্রশ্ন ${bn(m.q)}</b><span class="mscore">${bn(fmt(m.got))} / ${bn(fmt(m.max))}</span><p>${esc(m.comment)}</p></div>`).join('')}</div>
   <h4>আপনার উত্তর (ভুলগুলোর নিচে দাগ)</h4><p class="count">এটা AI-এর পড়া লেখা। হাতের লেখা ভুল পড়া হলে সেটা ধরে নেবেন না। দাগ দেওয়া অংশে ক্লিক করলে ব্যাখ্যা দেখাবে।</p>
   <div class="legend"><span class="err wrong">ভুল তথ্য</span><span class="err missing">অসম্পূর্ণ</span><span class="err spelling">বানান</span><span class="err vague">অস্পষ্ট</span></div>
   ${r.transcript.map(t=>{const notes=[];const b=t.segments.map(sg=>{if(!sg.err)return esc(sg.t);n++;notes.push({n,s:sg});return `<u class="err ${sg.err.kind}" tabindex="0" data-n="${n}">${esc(sg.t)}</u><sup>${bn(n)}</sup>`;}).join(' ');
     return `<div class="tq"><b>প্রশ্ন ${bn(t.q)}</b><p class="tbody">${b}</p>${notes.length?`<ol class="notes" start="${notes[0].n}">${notes.map(o=>`<li id="en${o.n}"><span class="chip sig">${KIND[o.s.err.kind]}</span> ${esc(o.s.err.why)}${o.s.err.fix?`<div class="fix">সঠিক: ${esc(o.s.err.fix)}</div>`:''}</li>`).join('')}</ol>`:''}</div>`;}).join('')}
   ${r.missed.length?`<h4>যে গুরুত্বপূর্ণ পয়েন্ট বাদ পড়েছে</h4><ul class="plain">${r.missed.map(x=>`<li><b>প্রশ্ন ${bn(x.q)}:</b> ${esc(x.point)}</li>`).join('')}</ul>`:''}
   ${r.improve.length?`<h4>উন্নতির পরামর্শ</h4><ul class="plain">${r.improve.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
   <p class="count">এই নম্বর AI-এর আনুমানিক মূল্যায়ন, আসল পরীক্ষকের নম্বরের সমান নাও হতে পারে।</p>
   <div class="frow"><button class="btn ink" id="exAgain">আরেকটি পরীক্ষা দিন</button><button class="btn ghost" data-tab="prog" id="toProg">অগ্রগতি দেখুন</button><button class="btn ghost" id="exPrint">প্রিন্ট</button></div></div>`;
}

/* ---------- ভুল খাতা ---------- */
function wrongCard(w){
  const st=ex.wres[w.k], open=ex.wopen[w.k], cc=CM[w.c]?CM[w.c].c:'#888';
  const head=`<div class="qh"><span class="chip course" style="--c:${cc}">${esc(cn(w.c))}</span><span class="chip gray">${w.type==='mcq'?'MCQ':w.type==='short'?'ছোট উত্তর':'লিখিত'}</span><span class="chip sig">${bn(w.wrongCount||1)} বার ভুল</span>${w.streak?`<span class="chip">পরপর ${bn(w.streak)} বার ঠিক</span>`:''}</div>`;
  let mid='';
  if(w.type==='mcq') mid=`<p class="qt">${esc(w.q)}</p><div class="opts">${w.opts.map((o,j)=>`<button class="opt ${st?(j===w.correct?'right':st.pick===j?'wrongopt':''):''}" data-wmc="${esc(w.k)}" data-j="${j}" ${st?'disabled':''}><span class="ol">${'ABCDEFGH'[j]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  else if(w.type==='short') mid=`<p class="qt">${esc(w.q)}</p>${st?`<div class="cmp"><span>আপনার উত্তর: <b>${esc(st.text||'—')}</b></span><span>সঠিক: <b>${esc(w.accept.join(' / '))}</b></span></div>`:`<div class="mkrow"><input class="fld" data-wsh="${esc(w.k)}" placeholder="উত্তর লিখুন" autocomplete="off"><button class="btn ghost sm" data-wchk="${esc(w.k)}">চেক</button></div>`}`;
  else mid=`<pre class="qpre">${esc(w.q)}</pre>${open?`<div class="model"><b>মডেল উত্তর</b>${w.ans?ansHtml(w.ans):'<p>মডেল উত্তর যোগ করা হয়নি।</p>'}</div>${st?'':`<p class="count">এবার নিজেকে জিজ্ঞেস করুন: এটা কি ঠিকঠাক লিখতে পারতেন?</p><div class="mkrow"><button class="btn ghost sm" data-wself="${esc(w.k)}" data-v="1">পারতাম</button><button class="btn ghost sm" data-wself="${esc(w.k)}" data-v="0">পারতাম না</button></div>`}`:`<button class="btn ghost sm" data-wopen="${esc(w.k)}">আগে নিজে মনে করুন, তারপর উত্তর দেখুন</button>`}`;
  const res=st?`<div class="rmsg ${st.good?'good':'bad'}">${st.good?'ঠিক হয়েছে!'+(st.gone?' প্রশ্নটি ভুল খাতা থেকে সরে গেল।':' আরও '+bn((S.masterStreak||2)-(st.streak||0))+' বার ঠিক হলে সরে যাবে।'):'এবার হয়নি, আবার চেষ্টা করবেন।'}</div>`:'';
  const exp=(st||open)&&w.exp?`<p class="count">${esc(w.exp)}</p>`:'';
  return `<article class="q wcard">${head}${mid}${res}${exp}<div class="wfoot"><small>${esc(w.src||'')}</small><button class="btn ghost sm" data-wdel="${esc(w.k)}">মুছুন</button></div></article>`;
}
function renderWrong(body){
  const all=Store.wrong().sort((a,b)=>(b.wrongCount||1)-(a.wrongCount||1)||(b.last||0)-(a.last||0));
  if(!all.length){body.innerHTML=`<div class="miss"><b>ভুল খাতা এখন খালি।</b><br>পরীক্ষা বা মক দিলে যে প্রশ্নে ${bn(S.wrongBelowPct||60)}%-এর কম নম্বর পাবেন, সেগুলো এখানে নিজে নিজে জমা হবে।<br><button class="btn ink sm" data-tab="mock">মক পরীক্ষা দিন</button></div>`;return;}
  const cs=[...new Set(all.map(w=>w.c))]; if(ex.wf!=='all'&&!cs.includes(ex.wf)) ex.wf='all';
  const list=all.filter(w=>ex.wf==='all'||w.c===ex.wf);
  body.innerHTML=`<div class="exbox"><div class="frow" style="justify-content:space-between"><div><h3 style="margin:0">ভুল প্রশ্ন খাতা</h3><span class="count">${bn(all.length)}টি প্রশ্ন জমা আছে। পরপর ${bn(S.masterStreak||2)} বার ঠিক করলে সরে যাবে।</span></div><button class="btn ink sm" id="wExam">এগুলো থেকে পরীক্ষা দিন</button></div>
   <div class="fchips" id="wF" style="margin:14px 0"><button class="fc" data-wf="all" aria-pressed="${ex.wf==='all'}">সব (${bn(all.length)})</button>${cs.map(c=>`<button class="fc" data-wf="${c}" style="--c:${CM[c]?CM[c].c:'#888'}" aria-pressed="${ex.wf===c}"><span class="dot"></span>${esc(cn(c))} (${bn(all.filter(w=>w.c===c).length)})</button>`).join('')}</div>
   <div id="wList">${list.map(wrongCard).join('')}</div></div>`;
}
function startWrongExam(){
  const pick=Store.wrong().filter(w=>ex.wf==='all'||w.c===ex.wf).sort((a,b)=>(b.wrongCount||1)-(a.wrongCount||1)).slice(0,10);
  if(!pick.length) return;
  const items=pick.map(w=>w.type==='written'?{k:w.k,type:'written',c:w.c,qs:{main:[{l:'a',t:w.q,m:null,mv:0}],alt:null},q:w.q,max:w.max,ans:w.ans||'',src:w.src,user:{text:'',side:'main'},got:null}
    :{k:w.k,type:w.type,c:w.c,q:w.q,opts:w.opts,correct:w.correct,accept:w.accept,exp:w.exp||'',max:1,src:w.src,user:{sel:null,text:''},got:null});
  beginSession({mode:'wrong',title:'ভুল খাতা থেকে পরীক্ষা',course:ex.wf==='all'?'mixed':ex.wf,mins:Math.max(5,items.length*3),items});
}

/* ---------- অগ্রগতি ও গ্রাফ ---------- */
const dshort=ts=>new Date(ts).toLocaleDateString('bn-BD',{day:'numeric',month:'short'});
function chartSvg(h){
  const W=720,Hh=280,L=58,R=16,T=16,B=36,n=h.length, iw=W-L-R, ih=Hh-T-B;
  const x=i=>L+(n<2?iw/2:i*iw/(n-1)), y=v=>T+ih-v/100*ih;
  let s=`<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="ফলাফলের শতকরা হার সময়ের সাথে">`;
  [0,25,50,75,100].forEach(g=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(g)}" y2="${y(g)}" class="gl"/><text x="${L-8}" y="${y(g)+7}" text-anchor="end" class="gt">${bn(g)}%</text>`;});
  const pts=h.map((e,i)=>[x(i),y(e.pct)]);
  if(n>1) s+=`<polyline class="ln" points="${pts.map(p=>p.join(',')).join(' ')}"/>`;
  if(n>=3){const ma=h.map((_,i)=>{const a=h.slice(Math.max(0,i-2),i+1);return a.reduce((t,e)=>t+e.pct,0)/a.length;});s+=`<polyline class="ma" points="${ma.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>`;}
  h.forEach((e,i)=>{s+=`<circle class="dt m-${e.mode}" cx="${pts[i][0]}" cy="${pts[i][1]}" r="7"><title>${esc(e.title)}: ${fmt(e.got)}/${fmt(e.out)} (${Math.round(e.pct)}%) — ${dshort(e.ts)}</title></circle>`;});
  const lab=n>1?[0,n-1]:[0]; lab.forEach(i=>{s+=`<text x="${x(i)}" y="${Hh-10}" text-anchor="${i===0&&n>1?'start':n>1?'end':'middle'}" class="gt">${dshort(h[i].ts)}</text>`;});
  return s+'</svg>';
}
function renderProg(body){
  const all=Store.hist();
  if(!all.length){body.innerHTML=`<div class="miss"><b>এখনো কোনো ফলাফল নেই।</b><br>পরীক্ষা, মক বা ভুল খাতা থেকে পরীক্ষা দিলে এখানে অগ্রগতির গ্রাফ আসবে। সব আপনার ব্রাউজারেই থাকবে।<br><button class="btn ink sm" data-tab="exam">পরীক্ষা দিন</button>${backupRow()}</div>`;return;}
  const cs=[...new Set(all.map(e=>e.c))]; if(ex.pf!=='all'&&!cs.includes(ex.pf)) ex.pf='all';
  const h=all.filter(e=>(ex.pf==='all'||e.c===ex.pf)&&(ex.pm==='all'||e.mode===ex.pm));
  const avg=h.length?Math.round(h.reduce((t,e)=>t+e.pct,0)/h.length):0, best=h.length?Math.round(Math.max(...h.map(e=>e.pct))):0;
  const last5=h.slice(-5), prev5=h.slice(-10,-5), la=last5.length?last5.reduce((t,e)=>t+e.pct,0)/last5.length:0, pa=prev5.length?prev5.reduce((t,e)=>t+e.pct,0)/prev5.length:null;
  const trend=pa==null?'':la-pa>=3?`<span class="up">▲ আগের ৫টির চেয়ে ${bn(Math.round(la-pa))}% ভালো</span>`:pa-la>=3?`<span class="dn">▼ আগের ৫টির চেয়ে ${bn(Math.round(pa-la))}% কম</span>`:'<span>আগের মতোই</span>';
  const byC={}; all.forEach(e=>{(byC[e.c]=byC[e.c]||[]).push(e.pct);});
  const bars=Object.keys(byC).map(c=>{const a=Math.round(byC[c].reduce((t,v)=>t+v,0)/byC[c].length);return `<div class="bar"><span class="bl">${esc(c==='mixed'?'মিশ্র':cn(c))}</span><div class="bt"><i style="width:${a}%;background:${CM[c]?CM[c].c:'var(--accent)'}"></i></div><b>${bn(a)}%</b><small>${bn(byC[c].length)}টি</small></div>`;}).join('');
  body.innerHTML=`<div class="exbox"><div class="fchips" id="pF" style="margin-bottom:10px"><button class="fc" data-pf="all" aria-pressed="${ex.pf==='all'}">সব কোর্স</button>${cs.map(c=>`<button class="fc" data-pf="${c}" style="--c:${CM[c]?CM[c].c:'#888'}" aria-pressed="${ex.pf===c}"><span class="dot"></span>${esc(c==='mixed'?'মিশ্র':cn(c))}</button>`).join('')}</div>
   <div class="fchips" id="pM" style="margin-bottom:14px">${[['all','সব ধরন'],['paper','পরীক্ষা'],['mock','মক'],['wrong','ভুল খাতা'],['ai','AI']].map(m=>`<button class="fc sm" data-pm="${m[0]}" aria-pressed="${ex.pm===m[0]}">${m[1]}</button>`).join('')}</div>
   <div class="sumgrid"><div><b>${bn(h.length)}</b><span>মোট পরীক্ষা</span></div><div><b>${bn(avg)}%</b><span>গড়</span></div><div><b>${bn(best)}%</b><span>সর্বোচ্চ</span></div><div class="tr">${trend||'<span>৫টির বেশি দিলে প্রবণতা দেখাবে</span>'}</div></div>
   ${h.length?`<div class="chartw">${chartSvg(h.slice(-40))}</div><p class="count" style="margin:4px 0 14px"><span class="lg a"></span> প্রতিটি পরীক্ষার ফল &nbsp; <span class="lg b"></span> শেষ ৩টির গড় (সর্বশেষ ${bn(Math.min(40,h.length))}টি দেখানো হচ্ছে)</p>`:'<div class="miss">এই ফিল্টারে কোনো ফল নেই।</div>'}
   <h4>কোর্স অনুযায়ী গড়</h4><div class="bars">${bars}</div>
   <h4>সাম্প্রতিক ফলাফল</h4><div class="hlist">${[...h].reverse().slice(0,20).map(e=>`<div class="hrow"><span class="hd">${dshort(e.ts)}</span><span class="chip gray">${MODE[e.mode]||e.mode}</span><span class="ht1">${esc(e.title)}</span><b>${bn(fmt(e.got))}/${bn(fmt(e.out))}</b><span class="hp ${e.pct>=60?'up':e.pct<40?'dn':''}">${bn(Math.round(e.pct))}%</span><button class="x" data-hdel="${e.id}" aria-label="মুছুন">×</button></div>`).join('')}</div>
   ${backupRow()}</div>`;
}
const backupRow=()=>`<div class="bkrow"><button class="btn ghost sm" id="pExp">ব্যাকআপ নামান</button><label class="btn ghost sm" for="pImp" style="cursor:pointer">ব্যাকআপ ফেরত আনুন</label><input type="file" id="pImp" accept=".json,application/json" hidden><button class="btn ghost sm" id="pClr">ইতিহাস মুছুন</button><small class="count">ইতিহাস শুধু এই ব্রাউজারে থাকে। ব্রাউজারের ডেটা মুছলে হারাবে, তাই মাঝে মাঝে ব্যাকআপ রাখুন।</small></div>`;

/* ---------- ইভেন্ট ---------- */
function go(tab){ if(ex.phase!=='setup'&&['run','check','ai'].includes(ex.phase)&&!confirm('চলমান পরীক্ষা ছেড়ে যাবেন? এখনকার উত্তর হারাবে।')) return; ex.tab=tab;ex.phase='setup';ex.sess=null;ex.aires=null;ex.files=[];render(); }
const sid=el=>el.getAttribute('data-wmc')||el.getAttribute('data-wsh')||el.getAttribute('data-wchk')||el.getAttribute('data-wself')||el.getAttribute('data-wopen')||el.getAttribute('data-wdel');
mount.addEventListener('click',e=>{
  const t=e.target, $c=s=>t.closest(s);
  let el;
  if((el=$c('[data-tab]'))){go(el.dataset.tab);return;}
  if((el=$c('#exC [data-c]'))){ex.course=el.dataset.c;ex.pid=null;ex.only='all';ex.mins=null;render();return;}
  if($c('#exGo')){startPaper();return;}
  if($c('#mkGo')){startMock(false);return;}
  if($c('#mkQuick')){startMock(true);return;}
  if($c('#exFinish')){const un=ex.sess.items.filter(x=>x.type==='mcq'&&x.user.sel==null).length;if(un&&!confirm(bn(un)+'টি MCQ-তে উত্তর দেননি। তবু শেষ করবেন?'))return;clearInterval(ex.h);autoGrade();ex.phase='check';render();mount.scrollIntoView({block:'start'});return;}
  if($c('#exCancel')){if(confirm('পরীক্ষা বাতিল করবেন? উত্তর হারাবে।')){ex.phase='setup';ex.sess=null;render();}return;}
  if((el=$c('[data-q][data-v]'))){const i=+el.dataset.q,it=ex.sess.items[i],mx=wmax(it);it.got=el.dataset.v==='full'?mx:el.dataset.v==='half'?mx/2:0;const inp=$('#mk'+i);if(inp)inp.value=it.got;return;}
  if($c('#exDone')){finalize();return;}
  if($c('#aiOpen')){ex.aires=null;ex.files=[];ex.phase='ai';render();return;}
  if($c('#aiBack')){ex.phase='check';ex.files=[];render();return;}
  if($c('#exSub')){submitAi();return;}
  if((el=$c('[data-rm]'))&&!ex.busy){ex.files.splice(+el.dataset.rm,1);drawThumbs();return;}
  if($c('#exAgain')){ex.phase='setup';ex.sess=null;ex.aires=null;ex.files=[];ex.res=null;ex.mins=null;render();return;}
  if($c('#exPrint')){window.print();return;}
  if((el=$c('u.err'))){const li=document.getElementById('en'+el.dataset.n);if(li){li.scrollIntoView({block:'center',behavior:'smooth'});li.classList.add('flash');setTimeout(()=>li.classList.remove('flash'),1400);}return;}
  /* ভুল খাতা */
  if((el=$c('[data-wf]'))){ex.wf=el.dataset.wf;render();return;}
  if($c('#wExam')){startWrongExam();return;}
  if((el=$c('[data-wopen]'))){ex.wopen[sid(el)]=true;render();return;}
  if((el=$c('[data-wdel]'))){if(confirm('এই প্রশ্ন ভুল খাতা থেকে মুছবেন?')){Store.removeWrong(sid(el));render();}return;}
  if((el=$c('[data-wmc]'))){const k=sid(el),w=Store.wrong().find(x=>x.k===k);if(!w)return;const j=+el.dataset.j,good=j===w.correct,r=Store.markWrong(k,good,S);ex.wres[k]={good,pick:j,gone:r.gone,streak:r.streak};render();return;}
  if((el=$c('[data-wchk]'))){const k=sid(el),w=Store.wrong().find(x=>x.k===k),inp=mount.querySelector(`[data-wsh="${CSS.escape(k)}"]`);if(!w)return;const text=inp?inp.value:'',good=Store.checkShort(text,w.accept).ok,r=Store.markWrong(k,good,S);ex.wres[k]={good,text,gone:r.gone,streak:r.streak};render();return;}
  if((el=$c('[data-wself]'))){const k=sid(el),good=el.dataset.v==='1',r=Store.markWrong(k,good,S);ex.wres[k]={good,gone:r.gone,streak:r.streak};render();return;}
  /* অগ্রগতি */
  if((el=$c('[data-pf]'))){ex.pf=el.dataset.pf;render();return;}
  if((el=$c('[data-pm]'))){ex.pm=el.dataset.pm;render();return;}
  if((el=$c('[data-hdel]'))){Store.delHist(el.dataset.hdel);render();return;}
  if($c('#pExp')){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([Store.exportAll()],{type:'application/json'}));a.download='geb-hub-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);return;}
  if($c('#pClr')){if(confirm('সব ফলাফলের ইতিহাস মুছে যাবে (ভুল খাতা থাকবে)। নিশ্চিত?')){Store.clearHist();render();}return;}
});
mount.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('u.err')){e.preventDefault();e.target.click();}
  if(e.key==='Enter'&&e.target.matches('[data-wsh]')){const b=mount.querySelector(`[data-wchk="${CSS.escape(e.target.dataset.wsh)}"]`);if(b)b.click();}
});
mount.addEventListener('input',e=>{
  const t=e.target, s=ex.sess;
  if(t.matches('[data-sh]')) s.items[+t.dataset.sh].user.text=t.value;
  else if(t.matches('[data-wt]')) s.items[+t.dataset.wt].user.text=t.value;
  else if(t.matches('[data-mk]')){const it=s.items[+t.dataset.mk];const v=parseFloat(t.value);it.got=Number.isFinite(v)?Math.max(0,Math.min(wmax(it),v)):0;}
});
mount.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='exP'){ex.pid=+t.value;ex.only='all';ex.mins=null;render();}
  else if(t.id==='exS'){ex.only=t.value;ex.mins=null;render();}
  else if(t.id==='mkC'){ex.mock.c=t.value;render();}
  else if(t.id==='mkAns'){ex.mock.ansOnly=t.checked;render();}
  else if(['mkMcq','mkShort','mkWr','mkMin'].includes(t.id)){const m=ex.mock;m.mcq=+$('#mkMcq').value||0;m.short=+$('#mkShort').value||0;m.written=+$('#mkWr').value||0;m.mins=Math.max(5,+$('#mkMin').value||45);render();}
  else if(t.matches('[data-mc]')) ex.sess.items[+t.dataset.mc].user.sel=+t.value;
  else if(t.matches('[data-side]')){const it=ex.sess.items[+t.dataset.side];it.user.side=t.value;}
  else if(t.id==='aiOk'){localStorage.setItem('geb_ai_ok',t.checked?'1':'0');drawThumbs();}
  else if(t.id==='exF'){addFiles(t.files).then(()=>{t.value='';});}
  else if(t.id==='pImp'){const f=t.files[0];if(!f)return;f.text().then(x=>{const r=Store.importAll(x);toast('ফেরত এসেছে: '+bn(r.hist)+'টি ফলাফল, '+bn(r.wrong)+'টি ভুল প্রশ্ন');render();}).catch(er=>toast(er.message||'ফাইল পড়া যায়নি'));}
});
mount.addEventListener('dragover',e=>{if(e.target.closest('#exDrop'))e.preventDefault();});
mount.addEventListener('drop',e=>{if(e.target.closest('#exDrop')){e.preventDefault();addFiles(e.dataTransfer.files);}});
window.addEventListener('beforeunload',e=>{if(ex.phase==='run'||ex.phase==='check'){e.preventDefault();e.returnValue='';}});
window.__gebExamTab=t=>{if(['exam','mock','wrong','prog'].includes(t)){ex.tab=t;if(ex.phase==='setup')render();}};
render();
};
