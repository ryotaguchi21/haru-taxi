/* ============================================================
   app.js — state, screen router, ride loop, and all the
   navigation handlers wired to the buttons.
   ============================================================ */

const RIDE_MS = CONFIG.rideMs;
const state = { screen:'top', dest:null, car:null, driver:null, fare:CONFIG.baseFare, pay:null,
                points:0, order:{}, paidTotal:0, justUnlocked:false };
let ride=null, navTimer=null;
function clearRide(){ if(ride){ clearInterval(ride); ride=null; } }
function clearNav(){ if(navTimer){ clearTimeout(navTimer); navTimer=null; } }

const SCREENS = {
  top:topScreen, home:homeScreen, cars:carsScreen, searching:searchingScreen, found:foundScreen,
  coming:comingScreen, riding:ridingScreen, pay:payScreen, done:doneScreen, mypage:myPageScreen,
  garage:garageScreen
};

function render(){
  clearRide(); clearNav();
  const v=document.getElementById('view');
  v.innerHTML=(SCREENS[state.screen]||topScreen)();
  const sc=v.querySelector('.scroll'); if(sc) sc.scrollTop=0;
  if(state.screen==='cars')      setTimeout(initSlider,60);
  if(state.screen==='searching'){ sfx.go(); navTimer=setTimeout(goFound,2300); }
  if(state.screen==='found')      setTimeout(()=>sfx.points(),140);
  if(state.screen==='riding')     setTimeout(startRide,60);
  if(state.screen==='done')       setTimeout(()=>sfx.points(),120);
}

/* meter + progress bar simulation while riding */
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
}

/* ---- slide-to-confirm (works with touch via Pointer Events) ---- */
function initSlider(){
  const wrap=document.getElementById('slideconfirm');
  const knob=document.getElementById('slknob');
  const fill=document.getElementById('slfill');
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

/* ---- navigation (declared as functions so inline onclick can find them) ---- */
function goTop(){ clearRide(); sfx.tap(); state.screen='top'; render(); }
function goPlaces(){ clearRide(); sfx.tap();
  state.screen='home'; state.dest=null; state.car=null; state.driver=null; state.pay=null;
  state.order={}; state.paidTotal=0; state.justUnlocked=false; render();
}
function goMyPage(){ sfx.tap(); state.screen='mypage'; render(); }
function goGarage(){ sfx.tap(); state.screen='garage'; render(); }
function pick(id){ sfx.select(); state.dest=id; state.car=null; state.driver=null; state.order={}; state.screen='cars'; render(); }
function pickCar(id){ const c=CARS.find(x=>x.id===id);
  if(c && !carUnlocked(c)) return;                       // locked: ignore taps
  if(id==='uchusen') sfx.warp(); else if(c && c.sound==='siren') sfx.siren(); else sfx.select();
  state.car=id; state.driver=null;
  if(!PROFILE.seenCars[id]){ PROFILE.seenCars[id]=true; saveProfile(); }  // garage: mark discovered
  render();
}
function assignDriver(){ if(!state.driver){ const seed=PROFILE.rides+CARS.findIndex(x=>x.id===state.car); state.driver=driverFor(state.car,seed); } }
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
  PROFILE.rides++; PROFILE.points+=state.points; PROFILE.places[state.dest]=true;
  PROFILE.carCounts[state.car]=(PROFILE.carCounts[state.car]||0)+1;
  const after = CARS.filter(carUnlocked).length;
  state.justUnlocked = after>before;                     // a locked car just became available
  if(state.justUnlocked) setTimeout(()=>sfx.warp(),700);
  saveProfile();                                         // persist the ride
  state.screen='done'; render();
}
function goCars(){ sfx.tap(); state.screen='cars'; render(); }
function goHome(){ goPlaces(); }               // Back from car picker -> place picker
function toggleMute(btn){ const m=sfx.toggle(); btn.textContent = m?'🔇':'🔊'; }

/* expose to window for inline handlers (safe even though they're already global) */
Object.assign(window, { goTop, goPlaces, goMyPage, goGarage, pick, pickCar, goSearching, goFound,
  goComing, goFoundBack, goRiding, goPay, pickPay, goCars, goHome, toggleMute,
  openOrder, closeOrder, toggleOrder, confirmOrder });

/* start: restore saved profile, then draw */
loadProfile();
render();
