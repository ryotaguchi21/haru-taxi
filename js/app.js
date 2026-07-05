/* ============================================================
   app.js — state, screen router, ride loop, and all the
   navigation handlers wired to the buttons.
   ============================================================ */

const RIDE_MS = CONFIG.rideMs;
const state = { screen:'top', dest:null, car:null, driver:null, pet:'', fare:CONFIG.baseFare, pay:null,
                points:0, order:{}, paidTotal:0, justUnlocked:false, rating:5, compliments:[], newMissions:[] };
let ride=null, navTimer=null, etaTimer=null;
function clearRide(){ if(ride){ clearInterval(ride); ride=null; } }
function clearNav(){ if(navTimer){ clearTimeout(navTimer); navTimer=null; } }
function clearEta(){ if(etaTimer){ clearInterval(etaTimer); etaTimer=null; } }

const SCREENS = {
  top:topScreen, home:homeScreen, cars:carsScreen, searching:searchingScreen, found:foundScreen,
  coming:comingScreen, riding:ridingScreen, pay:payScreen, rate:rateScreen, done:doneScreen,
  mypage:myPageScreen, garage:garageScreen, driverdex:driverDexScreen, decorate:decorateScreen,
  missions:missionsScreen
};

function render(){
  clearRide(); clearNav(); clearEta();
  const v=document.getElementById('view');
  v.innerHTML=(SCREENS[state.screen]||topScreen)();
  const sc=v.querySelector('.scroll'); if(sc) sc.scrollTop=0;
  if(state.screen==='cars')      setTimeout(initSlider,60);
  if(state.screen==='searching'){ sfx.go(); navTimer=setTimeout(goFound,2300); }
  if(state.screen==='found')      setTimeout(()=>sfx.points(),140);
  if(state.screen==='coming')     setTimeout(startComingEta,90);
  if(state.screen==='riding')     setTimeout(startRide,60);
  if(state.screen==='done')       setTimeout(()=>sfx.points(),120);
}

/* meter + progress + live-map token + ticking ETA while riding */
function startRide(){
  state.fare=CONFIG.baseFare;
  const bar=document.getElementById('progbar'); if(bar) requestAnimationFrame(()=>{ bar.style.width='100%'; });
  const m0=document.getElementById('meter'); if(m0) m0.textContent='¥'+CONFIG.baseFare;
  sfx.horn();
  const t0=performance.now();
  ride=setInterval(()=>{
    state.fare+=10+Math.floor(Math.random()*18);
    const m=document.getElementById('meter'); if(m) m.textContent='¥'+state.fare.toLocaleString();
    if(performance.now()-t0>=RIDE_MS){
      clearInterval(ride); ride=null; sfx.ding();
      const b=document.getElementById('arrbadge'); if(b) b.classList.add('show');
      const ob=document.getElementById('offbtn'); if(ob) ob.classList.add('pulse');
    }
  },250);
  // animate the live-map car token along the route + tick the ETA down
  const d=DESTS.find(x=>x.id===state.dest);
  const route=document.getElementById('liveroute'), token=document.getElementById('livecar'), etaEl=document.getElementById('etamin');
  const totalMin=etaMinutes(d); let len=0; try{ len=route?route.getTotalLength():0; }catch(_){}
  (function frame(now){
    if(state.screen!=='riding') return;
    const pr=Math.min(1,(now-t0)/RIDE_MS);
    if(route && token && len){ const pt=route.getPointAtLength(len*pr); token.setAttribute('transform','translate('+pt.x+','+pt.y+')'); }
    if(etaEl) etaEl.textContent=Math.max(0,Math.ceil(totalMin*(1-pr)));
    if(pr<1) requestAnimationFrame(frame);
  })(t0);
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
    PROFILE.missionsDone[m.id]=true; PROFILE.points+=m.reward; PROFILE.coins+=Math.round(m.reward/10); newly.push(m);
  }});
  return newly;
}

/* ---- navigation ---- */
function goTop(){ clearRide(); sfx.tap(); state.screen='top'; render(); }
function goPlaces(){ clearRide(); sfx.tap();
  state.screen='home'; state.dest=null; state.car=null; state.driver=null; state.pet=''; state.pay=null;
  state.order={}; state.paidTotal=0; state.justUnlocked=false; state.rating=5; state.compliments=[]; state.newMissions=[]; render();
}
function goMyPage(){ sfx.tap(); state.screen='mypage'; render(); }
function goGarage(){ sfx.tap(); state.screen='garage'; render(); }
function goDriverDex(){ sfx.tap(); state.screen='driverdex'; render(); }
function goDecorate(){ sfx.tap(); state.screen='decorate'; render(); }
function goMissions(){ sfx.tap(); state.screen='missions'; render(); }
function pick(id){ sfx.select(); state.dest=id; state.car=null; state.driver=null; state.order={}; state.screen='cars'; render(); }
function pickCar(id){ const c=CARS.find(x=>x.id===id);
  if(c && !carUnlocked(c)) return;                       // locked: ignore taps
  if(id==='uchusen') sfx.warp(); else if(c && c.sound==='siren') sfx.siren(); else sfx.select();
  state.car=id; state.driver=null;
  if(!PROFILE.seenCars[id]){ PROFILE.seenCars[id]=true; saveProfile(); }  // garage: mark discovered
  render();
}
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
  PROFILE.rides++; PROFILE.points+=state.points; PROFILE.coins+=Math.round(state.points/10);
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
function toggleMute(btn){ const m=sfx.toggle(); btn.textContent = m?'🔇':'🔊'; }

/* expose to window for inline handlers */
Object.assign(window, { goTop, goPlaces, goMyPage, goGarage, goDriverDex, goDecorate, goMissions,
  pick, pickCar, pickPet, setWorld, setAccessory, toggleSticker, setRating, toggleCompliment, finishRate,
  goSearching, goFound, goComing, goFoundBack, goRiding, goPay, pickPay, goCars, goHome, toggleMute,
  openOrder, closeOrder, toggleOrder, confirmOrder, honk, pullOver });

/* start: restore saved profile, then draw */
loadProfile();
render();
