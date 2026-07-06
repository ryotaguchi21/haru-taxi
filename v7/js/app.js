/* ============================================================
   app.js — state, screen router, ride loop, and all the
   navigation handlers wired to the buttons.
   ============================================================ */

const RIDE_MS = CONFIG.rideMs;
const state = { screen:'top', dest:null, car:null, driver:null, pet:'', friend:'none', fare:CONFIG.baseFare, pay:null,
                points:0, order:{}, paidTotal:0, justUnlocked:false, rating:5, compliments:[], newMissions:[],
                mode:'rider', passenger:'', requests:[], driveReward:0, colorGame:null };
let ride=null, navTimer=null, etaTimer=null, gameTimer=null;
function clearRide(){ if(ride){ clearInterval(ride); ride=null; } }
function clearNav(){ if(navTimer){ clearTimeout(navTimer); navTimer=null; } }
function clearEta(){ if(etaTimer){ clearInterval(etaTimer); etaTimer=null; } }
function clearGame(){ if(gameTimer){ clearInterval(gameTimer); gameTimer=null; } }

const SCREENS = {
  top:topScreen, home:homeScreen, cars:carsScreen, searching:searchingScreen, found:foundScreen,
  coming:comingScreen, riding:ridingScreen, pay:payScreen, rate:rateScreen, done:doneScreen,
  mypage:myPageScreen, garage:garageScreen, driverdex:driverDexScreen, decorate:decorateScreen,
  missions:missionsScreen, shop:shopScreen, achievements:achievementsScreen, settings:settingsScreen,
  games:gamesScreen, drivermode:driverModeScreen, driverdone:driverDoneScreen,
  freedrive:freeDriveScreen, carwash:carWashScreen, colorgame:colorGameScreen, showroom:showroomScreen
};

/* pick a real Japanese voice when one exists (iOS otherwise reads JP text in English) */
let jaVoice=null;
function pickJaVoice(){ try{ const vs=window.speechSynthesis.getVoices(); const v=vs.find(x=>/^ja/i.test(x.lang)||/japan/i.test(x.name)); if(v) jaVoice=v; }catch(e){} }
if(window.speechSynthesis){ pickJaVoice(); try{ window.speechSynthesis.onvoiceschanged=pickJaVoice; }catch(e){} }

/* speak a word aloud (early-reading help) — respects the read-aloud + mute toggles */
function speak(text){
  try{
    if(!PROFILE.readAloud || sfx.isMuted() || !window.speechSynthesis) return;
    const u=new SpeechSynthesisUtterance(text); u.lang='ja-JP'; u.rate=0.9; u.pitch=1.15;
    if(jaVoice) u.voice=jaVoice;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }catch(e){}
}

let lastScreen=null;
function render(){
  clearRide(); clearNav(); clearEta(); clearGame();
  if(state.screen!=='riding') sfx.stopMusic();
  const v=document.getElementById('view');
  // B1: keep scroll position when re-rendering the SAME screen (e.g. picking a car mid-list)
  const prevSc=v.querySelector('.scroll'), keep=(state.screen===lastScreen && prevSc);
  const savedTop=keep?prevSc.scrollTop:0;
  v.innerHTML=(SCREENS[state.screen]||topScreen)();
  lastScreen=state.screen;
  const sc=v.querySelector('.scroll'); if(sc) sc.scrollTop = keep?savedTop:0;
  if(state.screen==='cars')      setTimeout(initSlider,60);
  if(state.screen==='searching'){ sfx.go(); navTimer=setTimeout(goFound,2300); }
  if(state.screen==='found'){ setTimeout(()=>{ sfx.points(); const dv=state.driver||{}; speak('こんにちは！'+(dv.jp||'')+'です'); },140); }
  if(state.screen==='coming')     setTimeout(startComingEta,90);
  if(state.screen==='riding'){ setTimeout(startRide,60); sfx.startMusic(PROFILE.music); }
  if(state.screen==='done')       setTimeout(()=>sfx.points(),120);
  if(state.screen==='driverdone') setTimeout(()=>sfx.points(),120);
  if(state.screen==='freedrive')  setTimeout(startFreeDrive,80);
  if(state.screen==='carwash')    setTimeout(initCarWash,80);
}

/* meter + progress + live-map navigation + ticking ETA while riding */
function startRide(){
  state.fare=CONFIG.baseFare;
  const bar=document.getElementById('progbar'); if(bar) requestAnimationFrame(()=>{ bar.style.width='100%'; });
  const m0=document.getElementById('meter'); if(m0) m0.textContent='¥'+CONFIG.baseFare;
  sfx.horn();
  // live-map references + geometry
  const d=DESTS.find(x=>x.id===state.dest);
  const route=document.getElementById('liveroute'), token=document.getElementById('livecar'),
        done=document.getElementById('livedone'), etaEl=document.getElementById('etamin');
  const totalMin=etaMinutes(d); let len=0; try{ len=route?route.getTotalLength():0; }catch(_){}
  if(done && len){ done.style.strokeDasharray=len; done.style.strokeDashoffset=len; }
  let facing=1;
  function updateLive(pr){           // absolute (idempotent) — safe to call from rAF + interval
    if(route && token && len){
      const at=len*pr, pt=route.getPointAtLength(at), ah=route.getPointAtLength(Math.min(len, at+3));
      if(ah.x-pt.x>0.5) facing=1; else if(ah.x-pt.x<-0.5) facing=-1;     // face left/right of travel
      token.setAttribute('transform','translate('+pt.x.toFixed(1)+','+pt.y.toFixed(1)+') scale('+facing+',1)');
      if(done) done.style.strokeDashoffset=(len*(1-pr)).toFixed(1);        // reveal the road behind the car
    }
    if(etaEl) etaEl.textContent=Math.max(0,Math.ceil(totalMin*(1-pr)));
  }
  const t0=performance.now();
  // interval drives the meter AND the map (keeps advancing even if the tab is backgrounded)
  ride=setInterval(()=>{
    state.fare+=10+Math.floor(Math.random()*18);
    const m=document.getElementById('meter'); if(m) m.textContent='¥'+state.fare.toLocaleString();
    const el=Math.min(1,(performance.now()-t0)/RIDE_MS); updateLive(el);
    if(performance.now()-t0>=RIDE_MS){
      clearInterval(ride); ride=null; updateLive(1); sfx.ding();
      const b=document.getElementById('arrbadge'); if(b) b.classList.add('show');
      const ob=document.getElementById('offbtn'); if(ob) ob.classList.add('pulse');
    }
  },250);
  // rAF makes the car glide smoothly while the tab is visible
  (function frame(){
    if(state.screen!=='riding') return;
    const pr=Math.min(1,(performance.now()-t0)/RIDE_MS); updateLive(pr);
    if(pr<1) requestAnimationFrame(frame);
  })();
}

/* pickup screen: tick the ETA minutes down while the car drives in */
function startComingEta(){
  const c=CARS.find(x=>x.id===state.car), el=document.getElementById('etamin'); if(!c||!el) return;
  let m=c.wait; const step=Math.max(300, Math.round(2600/Math.max(1,c.wait)));
  etaTimer=setInterval(()=>{ m--; if(m<=0){ el.textContent='0'; clearEta();
      const chip=el.closest('.etachip'); if(chip) chip.classList.add('arrived');
      const b=document.getElementById('getinbtn'); if(b) b.classList.add('pulse');
    } else el.textContent=m; }, step);
}

/* ---- slide-to-confirm (Pointer Events → works by touch) ---- */
function initSlider(){
  const wrap=document.getElementById('slideconfirm'), knob=document.getElementById('slknob'), fill=document.getElementById('slfill');
  if(!wrap||!knob) return;
  const pad=5; let x=0, max=0, dragging=false, startX=0;
  function layout(){ max=Math.max(0, wrap.clientWidth - knob.offsetWidth - pad*2); }
  function setX(v){ x=Math.max(0,Math.min(max,v)); knob.style.transform='translateX('+x+'px)'; if(fill) fill.style.width=(x+knob.offsetWidth)+'px'; }
  function down(e){ dragging=true; layout(); startX=(e.clientX!=null?e.clientX:0)-x; try{ knob.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); }
  function move(e){ if(!dragging) return; setX((e.clientX!=null?e.clientX:0)-startX); }
  function up(){ if(!dragging) return; dragging=false;
    if(x>=max-6){ setX(max); if(fill) fill.style.width='100%'; wrap.classList.add('slidedone'); knob.textContent='✅'; goSearching(); }
    else { knob.style.transition='transform .2s'; if(fill) fill.style.transition='width .2s'; setX(0); if(fill) fill.style.width='0';
      setTimeout(()=>{ knob.style.transition=''; if(fill) fill.style.transition=''; },220); }
  }
  knob.addEventListener('pointerdown',down);
  knob.addEventListener('pointermove',move);
  knob.addEventListener('pointerup',up);
  knob.addEventListener('pointercancel',up);
}

/* ---- food & drink order (overlay so the ride meter keeps running) ---- */
let pendingOrder={};
function openOrder(){ if(document.getElementById('ordersheet')) return; sfx.tap();
  pendingOrder=Object.assign({}, state.order||{});
  (document.querySelector('.app')||document.body).insertAdjacentHTML('beforeend', orderSheetHTML(pendingOrder));
  requestAnimationFrame(()=>{ const el=document.getElementById('ordersheet'); if(el) el.classList.add('open'); });
}
function closeOrder(){ const el=document.getElementById('ordersheet'); if(!el) return; sfx.tap();
  el.classList.remove('open'); setTimeout(()=>el.remove(),200);
}
function toggleOrder(id){ pendingOrder[id]=!pendingOrder[id]; sfx.select();
  const btn=document.querySelector('#ordersheet .oitem[data-id="'+id+'"]'); if(btn) btn.classList.toggle('sel',!!pendingOrder[id]);
  const cnt=document.getElementById('ocount'); if(cnt) cnt.textContent=orderCountLabel(pendingOrder);
}
function confirmOrder(){ state.order=Object.assign({}, pendingOrder); sfx.pay();
  const tray=document.getElementById('ordertray'); if(tray) tray.innerHTML=orderTrayHTML();
  closeOrder();
}

/* ---- self-driving controls + toast ---- */
function honk(){ sfx.horn(); toast('📣 プップー！'); }
function pullOver(){ sfx.ding(); toast('✋ とまったよ！ / Stopped'); }
function toast(msg){ const el=document.createElement('div'); el.className='toast'; el.textContent=msg;
  (document.querySelector('.app')||document.body).appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),250); }, 1100);
}

/* ---- world / pet / decorate setters ---- */
function setWorld(id){ PROFILE.world=id; saveProfile(); sfx.select(); render(); }
function pickPet(id){ state.pet=id; if(id) PROFILE.lastPet=id; sfx.select(); render(); }
function setAccessory(id){ PROFILE.decor.accessory=id; saveProfile(); sfx.select(); render(); }
function toggleSticker(em){ const st=PROFILE.decor.stickers||(PROFILE.decor.stickers=[]);
  const i=st.indexOf(em);
  if(i>=0) st.splice(i,1);
  else { if(st.length>=DECOR_MAX_STICKERS){ sfx.tap(); return; } st.push(em); }
  saveProfile(); sfx.select(); render();
}

/* ---- rating ---- */
function setRating(n){ state.rating=n; sfx.select(); render(); }
function toggleCompliment(id){ state.compliments=state.compliments||[];
  const i=state.compliments.indexOf(id); if(i>=0) state.compliments.splice(i,1); else state.compliments.push(id);
  sfx.tap(); render();
}
function finishRate(){ sfx.points();
  if(state.driver && state.driver.id) PROFILE.driverStars[state.driver.id]=state.rating||5;
  saveProfile(); state.screen='done'; render();
}

/* newly-completed missions get their reward once */
function checkMissions(){
  const newly=[];
  MISSIONS.forEach(m=>{ if(missionDone(m) && !PROFILE.missionsDone[m.id]){
    PROFILE.missionsDone[m.id]=true; PROFILE.points+=m.reward; earnCoins(Math.round(m.reward/10)); newly.push(m);
  }});
  return newly;
}

/* ---- navigation ---- */
function goTop(){ clearRide(); sfx.tap(); state.screen='top'; render(); }
function goPlaces(){ clearRide(); sfx.tap();
  state.screen='home'; state.dest=null; state.car=null; state.driver=null; state.pet=''; state.friend='none'; state.pay=null;
  state.mode='rider'; state.passenger='';
  state.order={}; state.paidTotal=0; state.justUnlocked=false; state.rating=5; state.compliments=[]; state.newMissions=[]; render();
}
function goMyPage(){ sfx.tap(); state.screen='mypage'; render(); }
function goGarage(){ sfx.tap(); state.screen='garage'; render(); }
function goDriverDex(){ sfx.tap(); state.screen='driverdex'; render(); }
function goDecorate(){ sfx.tap(); state.screen='decorate'; render(); }
function goMissions(){ sfx.tap(); state.screen='missions'; render(); }
function pick(id){ const d=DESTS.find(x=>x.id===id); sfx.select(); speak(d?d.jp:'');
  state.dest=id; state.car=null; state.driver=null; state.mode='rider'; state.order={}; state.screen='cars'; render(); }
function pickCar(id){ const c=CARS.find(x=>x.id===id);
  if(c && !carUnlocked(c)) return;                       // locked: ignore taps
  sfx.play(engineSound(c)); speak(c?c.jp:'');
  state.car=id; state.driver=null;
  if(!PROFILE.seenCars[id]){ PROFILE.seenCars[id]=true; saveProfile(); }  // garage: mark discovered
  render();
}
function pickFriend(id){ state.friend=id; sfx.select(); render(); }
function assignDriver(){
  if(!state.driver){ const seed=PROFILE.rides+CARS.findIndex(x=>x.id===state.car); state.driver=driverFor(state.car,seed); }
  if(state.driver && state.driver.id && !PROFILE.seenDrivers[state.driver.id]){ PROFILE.seenDrivers[state.driver.id]=true; saveProfile(); }
}
function goSearching(){ if(!state.car) return; assignDriver(); state.screen='searching'; render(); }
function goFound(){ clearNav(); sfx.ding(); state.screen='found'; render(); }
function goComing(){ if(!state.car) return; sfx.tap(); assignDriver(); state.screen='coming'; render(); }
function goFoundBack(){ sfx.tap(); state.screen='found'; render(); }
function goRiding(){ sfx.horn(); state.screen='riding'; render(); }
function goPay(){ clearRide(); sfx.tap(); state.screen='pay'; render(); }
function pickPay(id){
  sfx.pay(); state.pay=id;
  const snacks=orderTotal(state.order), total=state.fare+snacks;
  state.paidTotal=total; state.points=Math.max(20,Math.round(total/10));
  const before = CARS.filter(carUnlocked).length;
  PROFILE.rides++; PROFILE.points+=state.points; earnCoins(Math.round(state.points/10));
  PROFILE.places[state.dest]=true;
  PROFILE.carCounts[state.car]=(PROFILE.carCounts[state.car]||0)+1;
  if(state.driver && state.driver.id){ PROFILE.driverCounts[state.driver.id]=(PROFILE.driverCounts[state.driver.id]||0)+1; PROFILE.seenDrivers[state.driver.id]=true; }
  if(orderList(state.order).length) PROFILE.snacksOrdered=(PROFILE.snacksOrdered||0)+1;
  updateStreak();
  state.newMissions=checkMissions();
  const after = CARS.filter(carUnlocked).length;
  state.justUnlocked = after>before;
  if(state.justUnlocked) setTimeout(()=>sfx.warp(),700);
  saveProfile();
  state.rating=5; state.compliments=[];
  state.screen='rate'; render();                         // rate the driver, then done
}
function goCars(){ sfx.tap(); state.screen='cars'; render(); }
function goHome(){ goPlaces(); }               // Back from car picker -> place picker
function toggleMute(btn){ const m=sfx.toggle(); btn.textContent = m?'🔇':'🔊'; if(m) sfx.stopMusic(); else if(state.screen==='riding') sfx.startMusic(PROFILE.music); }

/* ---- hubs ---- */
function goShop(){ sfx.tap(); state.screen='shop'; render(); }
function goAchievements(){ sfx.tap(); state.screen='achievements'; render(); }
function goSettings(){ sfx.tap(); state.screen='settings'; render(); }
function goGames(){ sfx.tap(); state.screen='games'; render(); }

/* ---- showroom (モーターショー) ---- */
function goShowroom(){ sfx.tap(); state.showroomIdx=0; state.screen='showroom'; render(); setTimeout(()=>speak(CARS[showroomIndex()].jp),300); }
function showroomNext(){ state.showroomIdx=(state.showroomIdx||0)+1; sfx.select(); render(); speak(CARS[showroomIndex()].jp); }
function showroomPrev(){ state.showroomIdx=(state.showroomIdx||0)-1; sfx.select(); render(); speak(CARS[showroomIndex()].jp); }
function showroomSpeak(){ const c=CARS[showroomIndex()]; sfx.tap(); speak(c.jp+'。'+carFact(c.id)); }
function showroomEngine(){ const c=CARS[showroomIndex()]; sfx.play(engineSound(c)); }

/* ---- shop ---- */
function buy(id){ const it=SHOP.find(x=>x.id===id); if(!it) return;
  if(buyItem(it)){ sfx.pay(); toast('🪙 かった！ '+it.jp); } else sfx.tap();
  render();
}

/* ---- settings ---- */
function setMusic(id){ PROFILE.music=id; saveProfile(); sfx.select(); render();
  if(id!=='none'){ sfx.startMusic(id); setTimeout(()=>{ if(state.screen==='settings') sfx.stopMusic(); },2600); } }
function setName(v){ PROFILE.name=(v&&v.trim())||CONFIG.name; saveProfile(); }
function setNameEn(v){ PROFILE.nameEn=(v&&v.trim())||CONFIG.nameEn; saveProfile(); }
function setAge(v){ const n=parseInt(v,10); if(n>=1&&n<=12){ PROFILE.age=n; saveProfile(); } }
function toggleReadAloud(btn){ PROFILE.readAloud=!PROFILE.readAloud; saveProfile();
  if(btn){ btn.textContent=PROFILE.readAloud?'ON':'OFF'; btn.classList.toggle('on',PROFILE.readAloud); }
  if(PROFILE.readAloud) speak('こんにちは'); }
function doReset(){ try{ if(window.confirm && !window.confirm('データを けしても いい？ / Reset all progress?')) return; }catch(e){}
  resetProfile(); sfx.tap(); goTop(); }

/* ---- driver mode (Haru is the driver) ---- */
function goDriverMode(){ sfx.tap(); state.mode='rider';
  const reqs=[], base=PROFILE.rides+(PROFILE.drives||0);
  for(let i=0;i<3;i++){ const p=PASSENGERS[(base+i*2)%PASSENGERS.length], d=DESTS[(base+i*3+1)%DESTS.length];
    reqs.push({ passenger:p.emoji, pjp:p.jp, dest:d.id, djp:d.jp, demoji:d.emoji }); }
  state.requests=reqs; state.screen='drivermode'; render();
}
function acceptRide(i){ const r=state.requests&&state.requests[i]; if(!r) return; sfx.go();
  state.mode='driver'; state.dest=r.dest; state.car=(favoriteCar()&&favoriteCar().id)||'taxi'; state.driver=null;
  state.passenger=r.passenger; state.pet=''; state.friend='none'; state.order={};
  state.screen='riding'; render();
}
function goDriverDrop(){ clearRide(); sfx.points();
  PROFILE.drives=(PROFILE.drives||0)+1; const reward=50+Math.round(Math.random()*30); state.driveReward=reward; earnCoins(reward);
  PROFILE.places[state.dest]=true; saveProfile(); state.mode='rider'; state.screen='driverdone'; render();
}

/* ---- free-drive mini-game (drag to steer, collect coins) ---- */
function goFreeDrive(){ sfx.tap(); state.screen='freedrive'; render(); }
function startFreeDrive(){
  const stage=document.getElementById('fdstage'), car=document.getElementById('fdcar');
  const scoreEl=document.getElementById('fdscore'), timeEl=document.getElementById('fdtime');
  if(!stage||!car) return;
  let score=0, timeLeft=20, carX=0.5, dragging=false; const items=[];
  function setCar(){ car.style.left=(carX*100)+'%'; }
  function move(e){ const r=stage.getBoundingClientRect(); carX=Math.max(0.07,Math.min(0.93,((e.clientX||0)-r.left)/r.width)); setCar(); }
  setCar();
  stage.addEventListener('pointerdown',e=>{ dragging=true; move(e); });
  stage.addEventListener('pointermove',e=>{ if(dragging) move(e); });
  stage.addEventListener('pointerup',()=>{ dragging=false; });
  stage.addEventListener('pointerleave',()=>{ dragging=false; });
  let spawn=0;
  gameTimer=setInterval(()=>{
    if(state.screen!=='freedrive'){ clearGame(); return; }
    if((++spawn)%3===0){ const isCoin=Math.random()<0.76, el=document.createElement('span');
      el.className='fditem '+(isCoin?'coin':'cone'); el.textContent=isCoin?'🪙':'🚧';
      const x=0.09+Math.random()*0.82; el.dataset.coin=isCoin?'1':'0'; el.style.left=(x*100)+'%'; el.style.top='-10%';
      stage.appendChild(el); items.push({el,y:-10,x}); }
    for(let k=items.length-1;k>=0;k--){ const it=items[k]; it.y+=7; it.el.style.top=it.y+'%';
      if(it.y>=74 && it.y<=90 && Math.abs(it.x-carX)<0.15){
        if(it.el.dataset.coin==='1'){ score++; sfx.tap(); } else { score=Math.max(0,score-1); sfx.horn(); }
        it.el.remove(); items.splice(k,1); if(scoreEl) scoreEl.textContent=score; continue; }
      if(it.y>104){ it.el.remove(); items.splice(k,1); }
    }
  },100);
  const cd=setInterval(()=>{
    if(state.screen!=='freedrive'){ clearInterval(cd); return; }
    timeLeft--; if(timeEl) timeEl.textContent=Math.max(0,timeLeft);
    if(timeLeft<=0){ clearInterval(cd); clearGame(); earnCoins(score); saveProfile();
      toast('🪙 +'+score+' ゲット！'); setTimeout(()=>{ if(state.screen==='freedrive') goGames(); },1300); }
  },1000);
}

/* ---- car wash mini-game (rub away the dirt) ---- */
function goCarWash(){ sfx.tap(); state.screen='carwash'; render(); }
function initCarWash(){
  const stage=document.getElementById('washstage'); if(!stage) return;
  const dirts=[].slice.call(stage.querySelectorAll('.dirt'));
  let remaining=dirts.length, finished=false;
  function remove(d){ if(finished || d.classList.contains('gone')) return;
    d.classList.add('gone'); sfx.tap(); remaining--;
    if(remaining<=0){ finished=true; const done=document.getElementById('washdone'); if(done) done.classList.add('show'); sfx.points();
      PROFILE.washes=(PROFILE.washes||0)+1; earnCoins(40); saveProfile(); toast('🪙 +40 ピカピカ！');
      setTimeout(()=>{ if(state.screen==='carwash') goGames(); },1600); }
  }
  dirts.forEach(d=>{
    d.addEventListener('pointerdown',()=>remove(d));               // tap
    d.addEventListener('pointerenter',e=>{ if(e.buttons||e.pressure>0) remove(d); }); // drag-scrub
  });
}

/* ---- colour-learning mini-game ---- */
const COLORS=[
  {jp:'あか',en:'red',hex:'#e8362b',body:'#e8362b'},{jp:'あお',en:'blue',hex:'#2f6fd8',body:'#2f6fd8'},
  {jp:'きいろ',en:'yellow',hex:'#e5a712',body:'#ffd24d'},{jp:'みどり',en:'green',hex:'#2f9b4a',body:'#4fc06a'},
  {jp:'むらさき',en:'purple',hex:'#8b3fd6',body:'#8b3fd6'},{jp:'ピンク',en:'pink',hex:'#ff5fa2',body:'#ff8ab5'}
];
function newColorRound(){ const g=state.colorGame; const target=COLORS[Math.floor(Math.random()*COLORS.length)];
  const pool=COLORS.filter(c=>c.en!==target.en); const a=pool[Math.floor(Math.random()*pool.length)];
  let b; do{ b=pool[Math.floor(Math.random()*pool.length)]; }while(b.en===a.en);
  const choices=[target,a,b];
  for(let i=choices.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=choices[i]; choices[i]=choices[j]; choices[j]=t; }
  g.target=target; g.jp=target.jp; g.en=target.en; g.hex=target.hex; g.choices=choices; g.answer=choices.indexOf(target);
}
function goColorGame(){ sfx.tap(); state.colorGame={round:1,score:0}; newColorRound(); state.screen='colorgame'; render();
  setTimeout(()=>speak(state.colorGame.jp+'の くるまは どれ？'),300); }
function colorPick(i){ const g=state.colorGame; if(!g) return;
  if(i===g.answer){ sfx.points(); g.score++;
    const msg=document.getElementById('colormsg'); if(msg) msg.textContent='せいかい！ 🎉 correct!';
    if(g.round>=5){ earnCoins(g.score*10); saveProfile(); toast('🪙 +'+(g.score*10)+'！');
      setTimeout(()=>{ if(state.screen==='colorgame') goGames(); },1400); return; }
    g.round++; setTimeout(()=>{ if(state.screen==='colorgame'){ newColorRound(); render(); speak(state.colorGame.jp+'の くるまは どれ？'); } },900);
  } else { sfx.horn(); const msg=document.getElementById('colormsg'); if(msg) msg.textContent='ちがうよ！ もういちど / try again'; }
}

/* expose to window for inline handlers */
Object.assign(window, { goTop, goPlaces, goMyPage, goGarage, goDriverDex, goDecorate, goMissions,
  pick, pickCar, pickPet, pickFriend, setWorld, setAccessory, toggleSticker, setRating, toggleCompliment, finishRate,
  goSearching, goFound, goComing, goFoundBack, goRiding, goPay, pickPay, goCars, goHome, toggleMute,
  openOrder, closeOrder, toggleOrder, confirmOrder, honk, pullOver,
  goShop, goAchievements, goSettings, goGames, buy, setMusic, setName, setNameEn, setAge, toggleReadAloud, doReset,
  goDriverMode, acceptRide, goDriverDrop, goFreeDrive, goCarWash, goColorGame, colorPick,
  goShowroom, showroomNext, showroomPrev, showroomSpeak, showroomEngine });

/* start: restore saved profile, then draw */
loadProfile();
render();
