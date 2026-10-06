/* ============ web demo: sample data, a demo ribbon, language switch ============ */
(function(){
  const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  window.confirm=()=>true;
  const AR=LANG==='ar';
  function rnd(seed){let x=seed%2147483647;if(x<=0)x+=2147483646;return()=>(x=x*16807%2147483647)/2147483647}
  function at(k,hm){const [h,m]=hm.split(':').map(Number);const d=keyToDate(k);d.setHours(h,m,0,0);return d.getTime()}
  function seed(){const r=rnd(750),tk=todayKey(),now=Date.now();
    S.setupDone=true;S.tourDone=true;S.welcomed=1;S.pageTips={quran:1,cal:1,brief:1,boards:1,set:1};S.plSince=dKey(addDays(keyToDate(tk),-30));
    const T=AR?{t1:'تسليم مشهد الافتتاحية للعميل',t2:'مراجعة درس After Effects: التعابير',t3:'تصميم لوحة ألوان المشروع',t4:'قراءة 20 صفحة من كتاب',t5:'الاتصال بالمطبعة',ny:'أعمل بإتقان وأصلّي في وقتها',n1:'أفكار لمشهد الشعار',b1:'حركة الشعار تبدأ من نقطة ضوء، ثم تتفتح الحروف من الوسط.\n- مدة 3 ثوانٍ\n- موسيقى هادئة',n2:'تدبّر: ﴿ألا بذكر الله تطمئن القلوب﴾',b2:'الطمأنينة ثمرة الذكر، لا ثمرة كثرة الإنجاز.',n3:'ملخّص دورة التحريك',b3:'1. التوقيت أهم من الحركة\n2. الـ Easing يصنع الإحساس\n3. قلّل عدد العناصر المتحركة',e1:'مقابلة عمل',e2:'اجتماع مع العميل',p1:'فيديو تعريفي لشركة ناشئة',p2:'محفظة أعمالي',g1:'ختمات القرآن',g2:'كتب',u1:'ختمة',u2:'كتاب'}
      :{t1:'Deliver the opening scene to the client',t2:'Review the After Effects expressions lesson',t3:'Design the project colour palette',t4:'Read 20 pages of a book',t5:'Call the print shop',ny:'Work with excellence and pray on time',n1:'Logo animation ideas',b1:'The logo starts from a point of light, then the letters open from the centre.\n- 3 seconds\n- calm music',n2:'Reflection: “Verily, in the remembrance of Allah do hearts find rest”',b2:'Calm is the fruit of remembrance, not of doing more.',n3:'Animation course summary',b3:'1. Timing matters more than motion\n2. Easing creates the feeling\n3. Fewer moving elements',e1:'Job interview',e2:'Client meeting',p1:'Explainer video for a start-up',p2:'My portfolio',g1:'Quran khatmas',g2:'Books',u1:'khatma',u2:'book'};
    PJ().push({id:'pj1',name:T.p1,cat:'work',due:dKey(addDays(keyToDate(tk),5))},{id:'pj2',name:T.p2,cat:'course',due:dKey(addDays(keyToDate(tk),16))});
    const plan=[['work','09:00',150,'pj1'],['course','11:45',70,'pj2'],['q-wird','13:05',25],['study','14:10',80],['work','16:20',95,'pj1'],['gym','18:30',45],['q-hifz','20:15',30]];
    for(let i=21;i>=0;i--){const k=dKey(addDays(keyToDate(tk),-i)),d=day(k),wd=keyToDate(k).getDay();
      plan.forEach(([cat,hm,min,pj])=>{if(r()<(wd===5?.45:.82)){const s=at(k,hm)+Math.round(r()*20-10)*6e4,e=s+Math.round(min*(.7+r()*.5))*6e4;if(e<now)addSession(cat,s,e,pj?{pj}:undefined)}});
      if(i>0){d.prayLog={};PRAYERS.forEach(p=>{d.prayLog[p]=r()<.86?'on':'late'});d.sunnah={fajr:2,dhuhr:r()<.6?6:4,maghrib:r()<.7?2:0,isha:r()<.7?2:0};d.jama={};if(r()<.5)d.jama.maghrib=1;if(r()<.4)d.jama.isha=1;
        qDay(k).read=Math.round(4+r()*10);if(r()<.7)qDay(k).wird=true;d.energy=Math.min(5,Math.max(2,Math.round(2+r()*3.4)));const sl=6+Math.round(r()*4)/2;d.sleep3={p:[{f:'23:'+(r()<.5?'00':'30'),t:sl>=7.5?'06:30':'05:45'}],h:sl};
        d.hb={sleep:sl,sport:r()<.55,read:Math.round(r()*20)};if(r()<.5)d.sport3=[{ic:['🏃','🏋️','🚶'][Math.floor(r()*3)],min:30+Math.round(r()*4)*10}];d.distr=Math.round(r()*4);d.screen3=90+Math.round(r()*150)}}
    const d=day(tk);d.niyya=T.ny;d.sleep3={p:[{f:'23:15',t:'05:40'},{f:'14:30',t:'14:55'}],h:6.8};d.hb=Object.assign(d.hb||{},{sleep:6.8});d.energy=4;
    const now0=new Date().toTimeString().slice(0,5),later=String(Math.min(22,new Date().getHours()+2)).padStart(2,'0')+':00';
    d.tasks.push({id:'dt1',text:T.t1,done:false,created:1,frog:true},{id:'dt2',text:T.t2,done:true,doneAt:now-36e5,created:2},{id:'dt3',text:T.t3,done:false,created:3,doing:true},{id:'dt4',text:T.t4,done:true,doneAt:now-72e5,created:4},{id:'dt5',text:T.t5,done:false,created:5,at:later});
    PRAYERS.forEach(p=>{if(prayerTimes(new Date())[p]<now){(d.prayed=d.prayed||{})[p]=prayerTimes(new Date())[p]+8*6e4}});
    NOTES().push({id:'dn1',title:T.n1,body:T.b1,day:tk,created:now-2*864e5,updated:now-2*864e5},{id:'dn2',title:T.n2,body:T.b2,day:dKey(addDays(keyToDate(tk),-3)),created:now-3*864e5,updated:now-3*864e5},{id:'dn3',title:T.n3,body:T.b3,day:dKey(addDays(keyToDate(tk),-6)),created:now-6*864e5,updated:now-6*864e5});
    EVS().push({id:'de1',title:T.e1,date:dKey(addDays(keyToDate(tk),2)),time:'10:00',end:'11:00',color:'#0ea5e9',rep:'none',rem:60,notes:'',big:true},{id:'de2',title:T.e2,date:dKey(addDays(keyToDate(tk),6)),time:'15:00',end:'',color:'#8b5cf6',rep:'none',rem:null,notes:'',big:false});
    S.quran.page=236;S.quran.khatmas=[{start:dKey(addDays(keyToDate(tk),-95)),end:dKey(addDays(keyToDate(tk),-40))}];S.quran.kStart=dKey(addDays(keyToDate(tk),-39));S.quran.memorized=[582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604];S.quran.hifzAt='78:1';S.quran.view=235;S.quran.pv=236;
    const y=String(new Date().getFullYear());S.ygoals={[y]:[{id:'yg1',name:T.g1,target:3,unit:T.u1,done:2},{id:'yg2',name:T.g2,target:12,unit:T.u2,done:7}]};
    S.demoSeeded=1;save()}
  if(!S.demoSeeded){try{seed()}catch(e){console.error('demo seed',e)}renderAll()}
  /* the demo ribbon */
  const css=document.createElement('style');css.textContent=`.demorb{position:fixed;z-index:60;inset-inline-end:16px;bottom:14px;display:flex;align-items:center;gap:8px;padding:5px 6px 5px 12px;border-radius:999px;background:color-mix(in srgb,var(--panel) 92%,transparent);border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));box-shadow:0 6px 20px rgba(0,0,0,.25);font-size:12px;color:var(--text);max-width:calc(100vw - 140px)}
  .demorb b{color:var(--accent);white-space:nowrap}.demorb span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.demorb button{border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:999px;padding:3px 10px;font-size:12px;cursor:pointer;white-space:nowrap}
  @media (max-width:700px){.demorb{inset-inline-end:auto;inset-inline-start:50%;transform:translateX(50%);bottom:calc(70px + env(safe-area-inset-bottom,0px));font-size:11px}html[dir=ltr] .demorb{transform:translateX(-50%)}.demorb span{display:none}}`;document.head.append(css);
  const rb=document.createElement('div');rb.className='demorb';rb.innerHTML=`<b>${AR?'نسخة عرض':'Demo'}</b><span>${AR?'بيانات تجريبية · <bdi dir="ltr">created by jake750_</bdi>':'sample data · <bdi dir="ltr">created by jake750_</bdi>'}</span><button id="demoLang">${AR?'English':'العربية'}</button><button id="demoReset" title="${AR?'إعادة البيانات التجريبية':'Reset sample data'}">↺</button>`;document.body.append(rb);
  $('#demoLang').onclick=()=>{lsSet('thabat.demoLang',AR?'en':'ar');lsSet('thabat.demoReset','1');location.reload()};
  $('#demoReset').onclick=()=>{lsSet('thabat.demoReset','1');location.reload()};
})();
