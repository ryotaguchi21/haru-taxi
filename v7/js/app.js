/* ============================================================
   app.js — state, screen router, ride loop, and all the
   navigation handlers wired to the buttons.
   ============================================================ */

const RIDE_MS = CONFIG.rideMs;
const state = { screen:'top', dest:null, car:null, driver:null, pet:'', friend:'none', fare:CONFIG.baseFare, pay:null,
                points:0, order:{}, paidTotal:0, justUnlocked:false, rating:5, compliments:[], newMissions:[],
                mode:'rider', passenger:'', requests:[], driveReward:0, colorGame:null,
                coinsEarned:0, newCard:false, spot:null, showRear:false };
let ride=null, navTimer=null, etaTimer=null, gameTimer=null, cdTimer=null, rideCtl=null;
function clearRide(){ if(ride){ clearInterval(ride); ride=null; } if(rideCtl){ rideCtl.dead=true; clearTimeout(rideCtl.boardT); rideCtl=null; } }
function clearNav(){ if(navTimer){ clearTimeout(navTimer); navTimer=null; } }
function clearEta(){ if(etaTimer){ clearInterval(etaTimer); etaTimer=null; } }
function clearGame(){ if(gameTimer){ clearInterval(gameTimer); gameTimer=null; } if(cdTimer){ clearInterval(cdTimer); cdTimer=null; } }

/* navToken bumps on every render; later() drops a delayed action if the screen changed in the
   meantime — stops stale "back to the games menu" jumps and double round-advances */
let navToken=0;
function later(ms, fn){ const tk=navToken; return setTimeout(()=>{ if(tk===navToken) fn(); }, ms); }

const SCREENS = {
  top:topScreen, home:homeScreen, cars:carsScreen, searching:searchingScreen, found:foundScreen,
  coming:comingScreen, riding:ridingScreen, pay:payScreen, rate:rateScreen, done:doneScreen,
  mypage:myPageScreen, garage:garageScreen, driverdex:driverDexScreen, decorate:decorateScreen,
  missions:missionsScreen, shop:shopScreen, achievements:achievementsScreen, settings:settingsScreen,
  games:gamesScreen, drivermode:driverModeScreen, driverdone:driverDoneScreen,
  freedrive:freeDriveScreen, carwash:carWashScreen, colorgame:colorGameScreen, showroom:showroomScreen,
  spotgame:spotGameScreen, gate:gateScreen
};
/* English sub-labels on/off (settings) — one body class hides every .en */
function applyLang(){ try{ document.body.classList.toggle('noen', PROFILE.showEn===false); }catch(e){} }

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
  navToken++;
  clearRide(); clearNav(); clearEta(); clearGame();
  if(state.screen!=='riding') sfx.stopMusic();
  const v=document.getElementById('view');
  // B1: keep scroll position when re-rendering the SAME screen (e.g. picking a car mid-list)
  const prevSc=v.querySelector('.scroll'), keep=(state.screen===lastScreen && prevSc);
  const savedTop=keep?prevSc.scrollTop:0;
  v.innerHTML=(SCREENS[state.screen]||topScreen)();
  const changed=(state.screen!==lastScreen);
  lastScreen=state.screen;
  const sc=v.querySelector('.scroll'); if(sc) sc.scrollTop = keep?savedTop:0;
  // a new screen always starts at the top (belt-and-braces for any page-level scroll)
  if(changed){ try{ window.scrollTo(0,0); }catch(e){} }
  applyLang();
  if(state.screen==='cars'){     setTimeout(initSlider,60); if(changed && state.car) setTimeout(scrollToChosen,30); }
  if(state.screen==='gate')      setTimeout(initHold,40);
  if(state.screen==='searching'){ sfx.go(); navTimer=setTimeout(goFound,2300); }
  if(state.screen==='found'){ setTimeout(()=>{ sfx.points(); const dv=state.driver||{}; speak('こんにちは！'+(dv.jp||'')+'です'); },140); }
  if(state.screen==='coming')     setTimeout(startComingEta,90);
  if(state.screen==='riding'){ state.arrived=false; setTimeout(startRide,60); sfx.startMusic(PROFILE.music); }
  if(state.screen==='done')       setTimeout(()=>sfx.points(),120);
  if(state.screen==='driverdone') setTimeout(()=>sfx.points(),120);
  if(state.screen==='freedrive')  setTimeout(startFreeDrive,80);
  if(state.screen==='carwash')    setTimeout(initCarWash,80);
}

/* ============================================================
   The ride, as ONE state machine that drives everything at once
   (Astra review U04/V01/V02/V05 + the 呼ぶ→乗る→走る→着く→降りる sequence):
     board  – car parked, door open, Haru (or the passenger) walks in, door shuts
     drive  – cruise, then brake over the last 20% (the car visibly slows)
     arrive – map car, big car, wheels, road, scenery all stop TOGETHER; the passenger
              steps out and waves; the button becomes 「ついた！ おりる」
     loop   – 「もっと ドライブ」: one more lap around the block, then arrive again
   「すぐ とうちゃく」 fast-forwards the current leg but still ends in a proper stop.
   Everything is recomputed from the clock, so rAF (smooth) and the 250 ms interval
   (keeps going in a hidden tab) can both call tick() safely.
   ============================================================ */
const BOARD_MS=1500, FF_MS=1400, MORE_FARE=300;
function startRide(){
  // the meter ends exactly on the fare the car picker promised (estFare); むりょう cars are free
  const car=CARS.find(x=>x.id===state.car)||{mult:1};
  const free=!car.mult, base=free?0:CONFIG.baseFare;
  const d=DESTS.find(x=>x.id===state.dest);
  const driverMode=state.mode==='driver';
  const ctl={ dead:false, phase:'board', target:free?0:Math.max(base, estFare(car)), extra:0, seg:null, boardT:null };
  rideCtl=ctl; state.fare=base; state.arrived=false;
  const $=id=>document.getElementById(id);
  const stage=$('ridestage'), bar=$('progbar'), meter=$('meter'), etaEl=$('etamin'), gate=$('destgate'),
        walker=$('walker'), route=$('liveroute'), token=$('livecar'), done=$('livedone');
  let len=0; try{ len=route?route.getTotalLength():0; }catch(_){}
  if(done && len){ done.style.strokeDasharray=len; done.style.strokeDashoffset=len; }
  if(bar) bar.style.transition='none';
  if(meter) meter.textContent='¥'+base.toLocaleString();
  const totalMin=etaMinutes(d);
  let heading=-90;
  // top-down map car: position on the path + heading from the path's tangent (turns WITH the road)
  function place(el, L, pr){
    if(!el||!token||!L) return;
    const at=L*pr, pt=el.getPointAtLength(at);
    const a=el.getPointAtLength(Math.max(0,at-2)), b=el.getPointAtLength(Math.min(L,at+2));
    if(Math.hypot(b.x-a.x,b.y-a.y)>0.5) heading=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    token.setAttribute('transform','translate('+pt.x.toFixed(1)+','+pt.y.toFixed(1)+') rotate('+heading.toFixed(1)+')');
  }
  function show(pr){
    const looping=ctl.phase==='loop';
    if(looping) place(ctl.loopEl, ctl.loopLen, pr);
    else { place(route,len,pr); if(done&&len) done.style.strokeDashoffset=(len*(1-pr)).toFixed(1); }
    const fare = looping ? ctl.target+ctl.extra*pr : base+(ctl.target-base)*pr;
    state.fare=Math.round(fare/10)*10;                                  // climbs in ¥10 steps like a real meter
    if(meter) meter.textContent='¥'+state.fare.toLocaleString();
    if(etaEl) etaEl.textContent=Math.max(0,Math.ceil((looping?2:totalMin)*(1-pr)));
    if(bar) bar.style.width=(pr*100).toFixed(1)+'%';
    // the destination building glides in over the last stretch and is there when the car stops
    if(gate){ const g=Math.max(0,Math.min(1,(pr-0.68)/0.32)); gate.style.transform='translateX('+((1-g)*170).toFixed(1)+'%)'; gate.style.opacity=g>0?'1':'0'; }
  }
  function progress(now){
    const s=ctl.seg, t=Math.min(1,(now-s.t0)/s.dur);
    if(s.ff) return { t, p:s.p0+(1-s.p0)*(1-(1-t)*(1-t)) };           // skip-ahead: quick, then brake
    // steady speed for 80% of the time, then a linear brake to 0 (distance: .8/.9 + .1/.9)
    const p = t<=0.8 ? t/0.9 : (0.8+(t-0.8)-(t-0.8)*(t-0.8)/0.4)/0.9;
    return { t, p:Math.min(1,p) };
  }
  function tick(){
    if(ctl.dead || !ctl.seg || state.arrived) return;
    const r=progress(performance.now()); show(r.p);
    if(stage) stage.classList.toggle('slowing', ctl.seg.ff ? r.t>0.4 : r.t>0.8);
    if(r.t>=1) arrive();
  }
  function setHint(t){ const h=$('ridehint'); if(h) h.textContent=t; }
  function setTitle(jp,en){ const h=$('ridetitle'); if(h) h.innerHTML=jp+'<span class="en">'+en+'</span>'; }
  function drive(){
    if(ctl.dead) return;
    clearTimeout(ctl.boardT); ctl.boardT=null;
    if(ctl.phase==='board') ctl.phase='drive';
    if(stage){ stage.classList.remove('parked','arrived','slowing'); }
    if(walker) walker.className='walker';
    ctl.seg={ t0:performance.now(), dur:RIDE_MS, p0:0, ff:false };
    sfx.horn();
    setHint(ctl.phase==='loop' ? '🔁 ぐるっと ひとまわり！ / one more lap'
                               : `${d.emoji} ${d.jp} へ むかって いるよ / heading to ${d.en}`);
    if(!driverMode && ctl.phase==='drive') setTitle('ドライブ ちゅう！', 'Riding to '+d.en);
    if(ride) clearInterval(ride);
    ride=setInterval(tick,250);
    (function frame(){ if(ctl.dead||state.arrived||!ctl.seg||state.screen!=='riding') return; tick(); requestAnimationFrame(frame); })();
  }
  function arrive(){
    if(state.arrived || ctl.dead) return;
    state.arrived=true;
    if(ride){ clearInterval(ride); ride=null; }
    show(1);
    if(ctl.phase==='loop'){ ctl.target+=ctl.extra; ctl.extra=0; }
    state.fare=Math.round(ctl.target/10)*10; if(meter) meter.textContent='¥'+state.fare.toLocaleString();
    sfx.ding();
    if(stage){ stage.classList.remove('slowing'); stage.classList.add('arrived'); }
    if(walker){ walker.className='walker'; void walker.offsetWidth; walker.className='walker alighting'; }
    const b=$('arrbadge'); if(b) b.classList.add('show');
    const chip=etaEl&&etaEl.closest('.etapill'); if(chip) chip.classList.add('arrived');
    const ob=$('offbtn'); if(ob){ ob.className='gobtn yellow pulse';
      ob.innerHTML = driverMode ? 'とうちゃく！ おろす <span class="en">Drop off →</span>' : 'ついた！ おりる <span class="en">Get off →</span>'; }
    const mb=$('morebtn'); if(mb) mb.hidden=false;
    setTitle('ついた！', 'Arrived at '+d.en);
    setHint(`${d.emoji} ${d.jp} に ついた！ / we're here`);
    speak(d.jp+' に ついたよ！');
  }
  ctl.fastForward=function(){
    if(ctl.dead || state.arrived) return;
    if(ctl.phase==='board') drive();
    const r=progress(performance.now());
    ctl.seg={ t0:performance.now(), dur:FF_MS, p0:r.p, ff:true }; sfx.go();
  };
  ctl.more=function(){
    if(ctl.dead || !state.arrived) return;
    const le=$('liveloop'); let L=0; try{ L=le?le.getTotalLength():0; }catch(_){}
    if(!le||!L) return;
    ctl.loopEl=le; ctl.loopLen=L; le.setAttribute('opacity','1');
    ctl.phase='loop'; ctl.extra=MORE_FARE; state.arrived=false;
    const b=$('arrbadge'); if(b) b.classList.remove('show');
    const chip=etaEl&&etaEl.closest('.etapill'); if(chip) chip.classList.remove('arrived');
    const ob=$('offbtn'); if(ob){ ob.className='gobtn skip'; ob.innerHTML='⏩ すぐ とうちゃく <span class="en">Skip ahead</span>'; }
    const mb=$('morebtn'); if(mb) mb.hidden=true;
    setTitle('もっと ドライブ！', 'Keep driving');
    drive();
  };
  // ---- board: door open, passenger walks in, door shuts, then go ----
  setHint(driverMode ? '🚪 おきゃくさんが のるよ…' : '🚪 のるよ… シートベルト カチッ！');
  if(!driverMode) setTitle('のるよ！', 'Getting in…');
  setTimeout(()=>{ if(!ctl.dead && ctl.phase==='board') sfx.tap(); }, 250);   // door opens
  setTimeout(()=>{ if(!ctl.dead && ctl.phase==='board') sfx.tap(); }, 1150);  // …and shuts
  ctl.boardT=setTimeout(drive, BOARD_MS);
  show(0);
}
/* the one sticky button: fast-forward while driving, get off once stopped */
function rideButton(){
  if(!state.arrived){ if(rideCtl && rideCtl.fastForward) rideCtl.fastForward(); return; }
  if(state.mode==='driver') goDriverDrop(); else goPay();
}
function moreDrive(){ if(rideCtl && rideCtl.more){ sfx.tap(); rideCtl.more(); } }

/* pickup screen: tick the ETA minutes down while the car drives in */
function startComingEta(){
  const c=CARS.find(x=>x.id===state.car), el=document.getElementById('etamin'); if(!c||!el) return;
  let m=c.wait; const step=Math.max(300, Math.round(2600/Math.max(1,c.wait)));
  etaTimer=setInterval(()=>{ m--; if(m<=0){ el.textContent='0'; clearEta();
      const chip=el.closest('.etapill,.etachip'); if(chip) chip.classList.add('arrived');
      const b=document.getElementById('getinbtn'); if(b) b.classList.add('pulse');
    } else el.textContent=m; }, step);
}

/* ---- slide-to-confirm (Pointer Events → works by touch) ---- */
function initSlider(){
  const wrap=document.getElementById('slideconfirm'), knob=document.getElementById('slknob'), fill=document.getElementById('slfill');
  if(!wrap||!knob) return;
  // scale = on-screen px per layout px (≠1 when the tablet layout zooms the app) — pointer
  // positions are divided by it so the knob tracks the finger exactly
  const pad=5; let x=0, max=0, dragging=false, startX=0, scale=1, fired=false, downX=0;
  function layout(){ max=Math.max(0, wrap.clientWidth - knob.offsetWidth - pad*2);
    const r=wrap.getBoundingClientRect(); scale=(wrap.offsetWidth && r.width) ? r.width/wrap.offsetWidth : 1; }
  function px(e){ return (e.clientX!=null?e.clientX:0)/scale; }
  function setX(v){ x=Math.max(0,Math.min(max,v)); knob.style.transform='translateX('+x+'px)'; if(fill) fill.style.width=(x+knob.offsetWidth)+'px'; }
  function down(e){ if(fired) return; dragging=true; layout();
    // re-grabbed while it was still springing back? start from where the knob visibly IS
    knob.style.transition=''; if(fill) fill.style.transition='';
    const cur=(knob.getBoundingClientRect().left - wrap.getBoundingClientRect().left)/scale - pad;
    setX(cur);
    downX=px(e); startX=downX-x; try{ knob.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); }
  function move(e){ if(!dragging) return; setX(px(e)-startX); }
  function up(e){ if(!dragging) return; dragging=false;
    if(x>=max-6){ fired=true; setX(max); if(fill) fill.style.width='100%'; wrap.classList.add('slidedone'); knob.textContent='✅'; goSearching(); }
    else if(e && e.type==='pointerup' && Math.abs(px(e)-downX)<10) autoSlide();   // a plain TAP calls the car too
    else { knob.style.transition='transform .2s'; if(fill) fill.style.transition='width .2s'; setX(0); if(fill) fill.style.width='0';
      setTimeout(()=>{ knob.style.transition=''; if(fill) fill.style.transition=''; },220); }
  }
  // Astra U02: a tap anywhere on the bar glides the taxi across by itself, then calls it
  function autoSlide(){ if(fired) return; fired=true; layout(); sfx.go();
    knob.style.transition='transform .45s cubic-bezier(.4,0,.2,1)'; if(fill) fill.style.transition='width .45s cubic-bezier(.4,0,.2,1)';
    setX(max); if(fill) fill.style.width='100%';
    later(480, ()=>{ wrap.classList.add('slidedone'); knob.textContent='✅'; goSearching(); }); }
  knob.addEventListener('pointerdown',down);
  knob.addEventListener('pointermove',move);
  knob.addEventListener('pointerup',up);
  knob.addEventListener('pointercancel',up);
  wrap.addEventListener('click',e=>{ if(e.target!==knob && !dragging) autoSlide(); });
}
/* entering the car picker with a car already chosen (showroom 「この くるまに のる」): bring it into view */
function scrollToChosen(){
  const sc=document.querySelector('.carsscroll'), card=document.querySelector('.carcard.selected'); if(!sc||!card) return;
  const shelf=card.parentElement;
  shelf.scrollLeft=Math.max(0, card.offsetLeft-(shelf.clientWidth-card.offsetWidth)/2);
  const top=shelf.offsetTop-44; if(top>sc.clientHeight*0.35) sc.scrollTop=top;
}
/* grown-ups gate in front of settings: hold for 3 s (a tap does nothing) — Astra Q5 */
function initHold(){
  const b=document.getElementById('holdbtn'), f=document.getElementById('holdfill'); if(!b||!f) return;
  let t=null; const HOLD=3000;
  function down(e){ e.preventDefault(); f.style.transition='width '+HOLD+'ms linear'; f.style.width='100%';
    clearTimeout(t); t=later(HOLD, ()=>{ sfx.ding(); state.screen='settings'; render(); }); }
  function up(){ clearTimeout(t); t=null; f.style.transition='width .2s'; f.style.width='0'; }
  b.addEventListener('pointerdown',down);
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,up));
  b.addEventListener('contextmenu',e=>e.preventDefault());
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
/* msg is always our own template text (may include the COIN icon markup) — never user input */
function toast(msg){ const el=document.createElement('div'); el.className='toast'; el.innerHTML=msg;
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
    PROFILE.missionsDone[m.id]=true; PROFILE.points+=m.reward*10; earnCoins(m.reward); newly.push(m);   // reward is in coins
  }});
  return newly;
}

/* ---- navigation ---- */
function goTop(){ clearRide(); sfx.tap(); state.preferCar=null; state.returnTo=null; state.screen='top'; render(); }
function goPlaces(){ clearRide(); sfx.tap();
  state.screen='home'; state.dest=null; state.car=null; state.driver=null; state.pet=''; state.friend='none'; state.pay=null;
  state.mode='rider'; state.passenger='';
  state.order={}; state.paidTotal=0; state.justUnlocked=false; state.rating=5; state.compliments=[]; state.newMissions=[];
  state.coinsEarned=0; state.newCard=false; render();
}
function goMyPage(){ sfx.tap(); state.screen='mypage'; render(); }
function goGarage(){ sfx.tap(); state.screen='garage'; render(); }
function goDriverDex(){ sfx.tap(); state.screen='driverdex'; render(); }
function goDecorate(){ sfx.tap(); state.screen='decorate'; render(); }
function goMissions(){ sfx.tap(); state.screen='missions'; render(); }
function pick(id){ const d=DESTS.find(x=>x.id===id); sfx.select(); speak(d?d.jp:'');
  state.dest=id; state.car=null; state.driver=null; state.mode='rider'; state.order={}; state.screen='cars';
  // came from the showroom's 「この くるまに のる」? pre-select that car
  const pc=state.preferCar&&CARS.find(x=>x.id===state.preferCar); state.preferCar=null;
  if(pc && carUnlocked(pc)){ state.car=pc.id; if(!PROFILE.seenCars[pc.id]){ PROFILE.seenCars[pc.id]=true; saveProfile(); } }
  render(); }
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
  // every ride pays the same coins whatever the car costs (Astra: don't punish picking a favourite);
  // points are still tallied for the rank but no longer shown to the child
  PROFILE.rides++; PROFILE.points+=state.points; earnCoins(CONFIG.rideCoins);
  PROFILE.places[state.dest]=true;
  state.newCard = !(PROFILE.carCounts[state.car]>0);           // first ride in this car → its card
  PROFILE.carCounts[state.car]=(PROFILE.carCounts[state.car]||0)+1;
  if(state.driver && state.driver.id){ PROFILE.driverCounts[state.driver.id]=(PROFILE.driverCounts[state.driver.id]||0)+1; PROFILE.seenDrivers[state.driver.id]=true; }
  if(orderList(state.order).length) PROFILE.snacksOrdered=(PROFILE.snacksOrdered||0)+1;
  updateStreak();
  state.newMissions=checkMissions();
  state.coinsEarned = CONFIG.rideCoins + state.newMissions.reduce((t,m)=>t+m.reward,0);
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
/* the shop remembers where it was opened from, so ◀ returns there (e.g. back to the car
   picker mid-ride instead of dropping the whole ride at the top page) */
function goShop(){ sfx.tap(); if(state.screen!=='shop') state.returnTo=state.screen; state.screen='shop'; render(); }
function goBack(){ sfx.tap(); let t=state.returnTo||'top'; state.returnTo=null;
  if(t==='cars' && !state.dest) t='top';
  if(!SCREENS[t]) t='top';
  state.screen=t; render(); }
function goAchievements(){ sfx.tap(); state.screen='achievements'; render(); }
function goSettings(){ sfx.tap(); state.screen='gate'; render(); }     // grown-ups gate first
function goGames(){ sfx.tap(); state.screen='games'; render(); }

/* ---- showroom (モーターショー) ---- */
function goShowroom(){ sfx.tap(); state.showroomIdx=0; state.screen='showroom'; render(); setTimeout(()=>speak(CARS[showroomIndex()].jp),300); }
function showroomNext(){ state.showroomIdx=(state.showroomIdx||0)+1; state.showRear=false; sfx.select(); render(); speak(CARS[showroomIndex()].jp); }
function showroomPrev(){ state.showroomIdx=(state.showroomIdx||0)-1; state.showRear=false; sfx.select(); render(); speak(CARS[showroomIndex()].jp); }
function showroomFlip(){ state.showRear=!state.showRear; sfx.select(); render(); speak(state.showRear?'うしろ':'まえ'); }
/* respray: stored per car, shown everywhere that car is drawn (ride, wash, garage…) */
function paintCar(id, hex){ const c=CARS.find(x=>x.id===id); if(!canPaint(c)) return;
  PROFILE.paint=PROFILE.paint||{}; if(hex) PROFILE.paint[id]=hex; else delete PROFILE.paint[id];
  saveProfile(); sfx.select(); render();
  const p=PAINTS.find(x=>x.hex===hex); speak(p ? p.jp+' に ぬったよ' : 'もとの いろ'); }
function showroomSpeak(){ const c=CARS[showroomIndex()]; sfx.tap(); speak(c.jp+'。'+carFact(c.id)); }
function showroomEngine(){ const c=CARS[showroomIndex()]; sfx.play(engineSound(c)); }
function rideThisCar(id){ const keep=id; goPlaces(); state.preferCar=keep; }

/* ---- shop ---- */
function buy(id){ const it=SHOP.find(x=>x.id===id); if(!it) return;
  if(buyItem(it)){ sfx.pay(); toast(COIN+' かった！ '+it.jp); } else sfx.tap();
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
function doReset(){ try{ if(window.confirm && !window.confirm('データを けしても いい？ / Reset all progress?\n(あとで「もとに もどす」で とりけせます / can be undone)')) return; }catch(e){}
  stashForUndo(); resetProfile(); sfx.tap(); goTop(); }
function doUndoReset(){ if(undoReset()){ sfx.points(); toast('↩️ もとに もどしたよ'); } render(); }
function toggleEnglish(btn){ PROFILE.showEn = (PROFILE.showEn===false); saveProfile(); applyLang();
  if(btn){ btn.textContent=PROFILE.showEn?'ON':'OFF'; btn.classList.toggle('on',PROFILE.showEn); } }

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
function goDriverDrop(){ if(!state.arrived) return;      // only after the trip actually finishes
  clearRide(); sfx.points();
  // ~ the same as a normal ride pays, so driver mode isn't a two-tap coin farm
  PROFILE.drives=(PROFILE.drives||0)+1; const reward=CONFIG.gameCoins; state.driveReward=reward; earnCoins(reward);
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
      el.className='fditem '+(isCoin?'coin':'cone'); el.innerHTML=isCoin?COIN:'🚧';
      const x=0.09+Math.random()*0.82; el.dataset.coin=isCoin?'1':'0'; el.style.left=(x*100)+'%'; el.style.top='-10%';
      stage.appendChild(el); items.push({el,y:-10,x}); }
    for(let k=items.length-1;k>=0;k--){ const it=items[k]; it.y+=7; it.el.style.top=it.y+'%';
      if(it.y>=74 && it.y<=90 && Math.abs(it.x-carX)<0.15){
        if(it.el.dataset.coin==='1'){ score++; sfx.tap(); } else { score=Math.max(0,score-1); sfx.horn(); }
        it.el.remove(); items.splice(k,1); if(scoreEl) scoreEl.textContent=score; continue; }
      if(it.y>104){ it.el.remove(); items.splice(k,1); }
    }
  },100);
  // countdown lives in the global cdTimer so render() stops it — a leftover countdown used to
  // end (and pay out) the NEXT game if the kid backed out and re-entered quickly
  cdTimer=setInterval(()=>{
    timeLeft--; if(timeEl) timeEl.textContent=Math.max(0,timeLeft);
    if(timeLeft<=0){ clearGame(); earnCoins(score); saveProfile();
      toast(COIN+' +'+score+' ゲット！'); later(1300, goGames); }
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
      PROFILE.washes=(PROFILE.washes||0)+1; earnCoins(CONFIG.gameCoins); saveProfile(); toast(COIN+' +'+CONFIG.gameCoins+' ピカピカ！');
      later(1600, goGames); }
  }
  dirts.forEach(d=>{
    d.addEventListener('pointerdown',()=>remove(d));               // tap
    d.addEventListener('pointerenter',e=>{ if(e.buttons||e.pressure>0) remove(d); }); // mouse drag-scrub
  });
  // finger drag-scrub: a touch is captured by the first element it lands on, so pointerenter never
  // fires on the other spots — hit-test under the finger on every move instead
  let scrubbing=false;
  stage.addEventListener('pointerdown',()=>{ scrubbing=true; });
  ['pointerup','pointercancel','pointerleave'].forEach(t=>stage.addEventListener(t,()=>{ scrubbing=false; }));
  stage.addEventListener('pointermove',e=>{ if(!scrubbing) return;
    const t=document.elementFromPoint(e.clientX,e.clientY); if(t && t.classList && t.classList.contains('dirt')) remove(t); });
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
  g.locked=false; g.missed=false;
}
function goColorGame(){ sfx.tap(); state.colorGame={round:1,score:0}; newColorRound(); state.screen='colorgame'; render();
  setTimeout(()=>speak(state.colorGame.jp+'の くるまは どれ？'),300); }
/* locked after a correct tap (double-taps used to pay the prize twice / skip rounds);
   a round only scores if it was right first try */
function colorPick(i){ const g=state.colorGame; if(!g || g.locked) return;
  if(i===g.answer){ g.locked=true; sfx.points(); if(!g.missed) g.score++;
    const msg=document.getElementById('colormsg'); if(msg) msg.textContent='せいかい！ 🎉 correct!';
    if(g.round>=5){ const coins=CONFIG.gameCoins; earnCoins(coins); saveProfile(); toast(COIN+' +'+coins+'！');
      later(1400, goGames); return; }
    g.round++; later(900, ()=>{ newColorRound(); render(); speak(state.colorGame.jp+'の くるまは どれ？'); });
  } else { g.missed=true; sfx.horn(); const msg=document.getElementById('colormsg'); if(msg) msg.textContent='ちがうよ！ もういちど / try again'; }
}

/* ---- みつけっこ / spot the car (Astra Q1): the name is SPOKEN, the cars are shown without
   names. Starts with 2 parked cars, later 3; no timer; 🔊 replays the question; a wrong tap
   says which car that was (still learning). Pays the same 10 coins as every other game. ---- */
const SPOT_POOL=['benz','tesla','ferrari','lambo','porsche','nissan','alphard','shinkansen','taxi','police',
  'bus','mazda','volvo','toyota','firetruck','challenger','train','ambulance','dump','priusalpha'];
function shuffled(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function newSpotRound(){ const g=state.spot;
  const ans=shuffled(SPOT_POOL.filter(id=>id!==g.last))[0];
  const n = g.round<=2 ? 2 : 3;
  g.answer=ans; g.last=ans; g.choices=shuffled([ans].concat(shuffled(SPOT_POOL.filter(id=>id!==ans)).slice(0,n-1)));
  g.locked=false; g.missed=false; }
function goSpotGame(){ sfx.tap(); state.spot={round:1,score:0}; newSpotRound(); state.screen='spotgame'; render(); later(350,spotSay); }
function spotSay(){ const g=state.spot; const c=g&&CARS.find(x=>x.id===g.answer); if(c) speak(c.jp+' は どれ？'); }
function spotPick(i){ const g=state.spot; if(!g||g.locked) return;
  const id=g.choices[i], c=CARS.find(x=>x.id===id), btn=document.querySelectorAll('.spotcar')[i], msg=document.getElementById('spotmsg');
  if(id===g.answer){ g.locked=true; sfx.points(); if(!g.missed) g.score++;
    if(btn) btn.classList.add('right'); if(msg) msg.textContent='せいかい！ 🎉 '+c.jp; speak('せいかい！ '+c.jp+'！');
    if(g.round>=5){ earnCoins(CONFIG.gameCoins); saveProfile(); toast(COIN+' +'+CONFIG.gameCoins+' みつけた！'); later(1700, goGames); return; }
    g.round++; later(1400, ()=>{ newSpotRound(); render(); spotSay(); });
  } else { g.missed=true; sfx.horn(); if(btn) btn.classList.add('wrong');
    if(msg) msg.textContent='それは '+c.jp+' だよ！ もういちど'; speak('それは '+c.jp+' だよ'); }
}

/* expose to window for inline handlers */
Object.assign(window, { goTop, goPlaces, goMyPage, goGarage, goDriverDex, goDecorate, goMissions,
  pick, pickCar, pickPet, pickFriend, setWorld, setAccessory, toggleSticker, setRating, toggleCompliment, finishRate,
  goSearching, goFound, goComing, goFoundBack, goRiding, goPay, pickPay, goCars, goHome, toggleMute,
  openOrder, closeOrder, toggleOrder, confirmOrder, honk, pullOver,
  goShop, goAchievements, goSettings, goGames, buy, setMusic, setName, setNameEn, setAge, toggleReadAloud, doReset,
  goDriverMode, acceptRide, goDriverDrop, goFreeDrive, goCarWash, goColorGame, colorPick,
  goShowroom, showroomNext, showroomPrev, showroomSpeak, showroomEngine, rideThisCar, goBack,
  rideButton, moreDrive, showroomFlip, paintCar, doUndoReset, toggleEnglish, goSpotGame, spotSay, spotPick });

/* start: restore saved profile, reflect a remembered mute, then draw */
loadProfile();
applyLang();
(function(){ const mb=document.getElementById('muteBtn'); if(mb && sfx.isMuted()) mb.textContent='🔇'; })();
render();
