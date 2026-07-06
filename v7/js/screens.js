/* ============================================================
   screens.js — each function returns the HTML for one screen.
   render() in app.js decides which one to show.
   ============================================================ */

function etaMinutes(d){ return Math.max(2, Math.min(9, Math.round((d?d.km:6)/2))); }

/* ---- TOP / landing page ---- */
function topScreen(){
  return `<div class="screen"><div class="scroll toppage">
    <div class="logowrap"><span class="logoemoji">🚕</span><h1 class="applogo">たくしー よぼう！</h1>
      <p class="logosub">${PROFILE.name}の たくしー ・ ${PROFILE.nameEn}'s Taxi</p></div>
    <div class="heroscene">${heroBackdropSVG()}<div class="heroufo">${carSVG('uchusen')}</div><div class="herotaxi">${carSVG('taxi')}</div></div>
    <button class="bigcta" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride a taxi!</span></button>
    <div class="menugrid">
      <button class="menubtn hilite" onclick="goShowroom()"><span class="mpi">🏎️</span><b>モーターショー</b><span>Showroom</span></button>
      <button class="menubtn" onclick="goGames()"><span class="mpi">🎮</span><b>ミニゲーム</b><span>Games</span></button>
      <button class="menubtn" onclick="goShop()"><span class="mpi">🛒</span><b>ショップ</b><span>Shop</span></button>
      <button class="menubtn" onclick="goMyPage()"><span class="mpi">👦</span><b>マイページ</b><span>My Page</span></button>
      <button class="menubtn" onclick="goGarage()"><span class="mpi">🚗</span><b>くるまずかん</b><span>Garage</span></button>
      <button class="menubtn" onclick="goDriverDex()"><span class="mpi">🧑</span><b>ドライバーずかん</b><span>Drivers</span></button>
      <button class="menubtn" onclick="goMissions()"><span class="mpi">🎯</span><b>ミッション</b><span>Missions</span></button>
      <button class="menubtn" onclick="goDecorate()"><span class="mpi">🎨</span><b>デコる</b><span>Decorate</span></button>
      <button class="menubtn" onclick="goSettings()"><span class="mpi">⚙️</span><b>せってい</b><span>Settings</span></button>
    </div>
  </div></div>`;
}

/* ---- SHOWROOM / モーターショー — one car at a time, big, with a spoken fact ---- */
function showroomIndex(){ const n=CARS.length; return ((((state.showroomIdx||0))%n)+n)%n; }
function showroomScreen(){
  const c=CARS[showroomIndex()], i=showroomIndex();
  return `<div class="screen"><div class="topbar blue"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">🏎️ モーターショー / Showroom</p><h1 class="title">${c.jp}<span class="en">${c.en}</span></h1></div>
    <div class="scroll"><div class="showcar">${carSVG(c.id)}</div>
      <div class="showfact">💬 ${carFact(c.id)}</div>
      <div class="showbtns">
        <button class="showbtn" onclick="showroomSpeak()">🔊<span>なまえ</span></button>
        <button class="showbtn" onclick="showroomEngine()">🏁<span>エンジン</span></button>
      </div>
      <div class="shownav"><button class="navbtn" onclick="showroomPrev()">◀</button>
        <span class="showcount">${i+1} / ${CARS.length}</span>
        <button class="navbtn" onclick="showroomNext()">▶</button></div>
      <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 この くるまに のる<span class="en">Ride now</span></button></div>
    </div></div>`;
}

/* ---- HOME / place picker (map + weather) ---- */
function worldChipsHTML(){
  return `<div class="worldrow">${WORLDS.map(w=>`<button class="worldchip${PROFILE.world===w.id?' on':''}" onclick="setWorld('${w.id}')"><span class="we">${w.emoji}</span><span>${w.jp}</span></button>`).join('')}</div>`;
}
function homeScreen(){
  const cards=DESTS.map(d=>`<button class="dcard" style="--dc:${d.dc};--dsh:${d.dsh}" onclick="pick('${d.id}')"><span class="emoji">${d.emoji}</span><span class="txt"><b>${d.jp}</b><span>${d.en}</span></span></button>`).join('');
  return `<div class="screen"><div class="topbar"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">やあ！ Hi! 🚕</p><h1 class="title">どこに いく？<span class="en">Where to?</span></h1></div>
    <div class="scroll"><div class="mapwrap"><div class="mapcard">${navMapSVG({pins:'all'})}
      <div class="melabel">📍 いま ここ / You are here</div></div>
    <p class="maphint">ピン か カード を タップしてね / tap a pin or a card</p></div>
    <div class="sechead sm"><h2>きょうの おてんき<span class="en">Weather</span></h2></div>${worldChipsHTML()}
    <div class="sechead"><h2>いきさき<span class="en">Choose a place</span></h2></div><div class="grid">${cards}</div></div></div>`;
}

/* ---- CARS / ride selector + pet + slide to confirm ---- */
function petStripHTML(){
  const cells=[{id:'',jp:'なし',emoji:'🚫'}].concat(availablePets()).map(p=>{
    const sel=(state.pet||'')===p.id?' sel':'';
    return `<button class="petchip${sel}" onclick="pickPet('${p.id}')"><span class="pe">${p.emoji}</span><span>${p.jp}</span></button>`;
  }).join('');
  return `<div class="sechead sm"><h2>いっしょに のる<span class="en">Bring a pet</span></h2></div><div class="petstrip">${cells}</div>`;
}
function friendStripHTML(){
  const cells=FRIENDS.map(f=>{
    const sel=(state.friend||'none')===f.id?' sel':'';
    return `<button class="petchip${sel}" onclick="pickFriend('${f.id}')"><span class="pe">${f.emoji}</span><span>${f.jp}</span></button>`;
  }).join('');
  return `<div class="sechead sm"><h2>ともだちを のせる<span class="en">Pick up a friend</span></h2></div><div class="petstrip">${cells}</div>`;
}
/* big tappable card for a single car (used in the category shelves) */
function carCard(c){
  const est=estFare(c), price = est?`¥${est.toLocaleString()}`:'むりょう';
  if(!carUnlocked(c)){
    if(c.shopCost) return `<button class="carcard shop" onclick="goShop()"><div class="ccart">${carSVG(c.id)}</div><b>${c.jp}</b><span class="ccbuy">🛒 🪙${c.shopCost}</span></button>`;
    const left=Math.max(0,(c.unlockRides||0)-PROFILE.rides);
    return `<div class="carcard locked"><div class="ccart">${carSVG(c.id)}</div><b>？？？</b><span class="cclock">🔒 あと ${left}かい</span></div>`;
  }
  const sel=state.car===c.id?' selected':'';
  const tag=c.selfDriving?'🤖 じどう':price;
  return `<button class="carcard${sel}" onclick="pickCar('${c.id}')"><div class="ccart">${carSVG(c.id)}</div><b>${c.jp}</b><span class="ccprice">${tag} · ${c.wait}ふん</span></button>`;
}
function carsScreen(){
  const d=DESTS.find(x=>x.id===state.dest);
  const shelves=CAR_CATEGORIES.map(cat=>{
    const cards=cat.ids.map(id=>CARS.find(c=>c.id===id)).filter(Boolean).map(carCard).join('');
    return `<div class="sechead sm shelfhd"><h2>${cat.jp}<span class="en">${cat.en}</span></h2></div><div class="carshelf">${cards}</div>`;
  }).join('');
  const chosen=state.car?CARS.find(x=>x.id===state.car):null;
  const chosenEst=chosen?estFare(chosen):0;
  const confirm = chosen ? `
    <div class="slideconfirm" id="slideconfirm">
      <div class="sltrack"><span class="sllabel">スライドして よぶ / slide to search →</span></div>
      <div class="slfill" id="slfill"></div>
      <button class="slknob" id="slknob" aria-label="スライドして タクシーを よぶ">🚕</button>
    </div>
    <p class="slsub">${chosen.emoji||'🚕'} ${chosen.jp} · ${chosenEst?'¥'+chosenEst.toLocaleString():'むりょう'} · ${d.jp}へ</p>`
    : `<button class="gobtn" disabled>くるまを えらんでね<span class="en">pick a car first</span></button>`;
  return `<div class="screen"><div class="topbar blue"><button class="backbtn" onclick="goHome()">◀ もどる Back</button><p class="hello">${d.emoji} ${d.jp} へ / to ${d.en}</p><h1 class="title">どの くるま？<span class="en">Choose a ride</span></h1></div>
    <div class="scroll"><div class="routemap"><div class="mapcard slim">${navMapSVG({pins:'dest',dest:state.dest,route:true})}</div></div>
    ${shelves}
    ${petStripHTML()}
    ${friendStripHTML()}
    <div class="gobar sticky">${confirm}</div></div></div>`;
}

/* ---- SEARCHING / matching a driver ---- */
function searchingScreen(){
  const d=DESTS.find(x=>x.id===state.dest), c=CARS.find(x=>x.id===state.car);
  return `<div class="screen"><div class="topbar green"><button class="backbtn" onclick="goCars()">◀ もどる Back</button><p class="hello">${d.emoji} ${d.jp} へ</p><h1 class="title">さがして いるよ…<span class="en">Finding your ride…</span></h1></div>
    <div class="scroll"><div class="searching">
      <div class="radar"><span class="rw rw1"></span><span class="rw rw2"></span><span class="rw rw3"></span>
        <div class="radarcar spin">${carSVG(c.id)}</div></div>
      <h2 class="bigmsg">${c.jp}を さがして いるよ<span class="en">Looking for a ${c.en.toLowerCase()}…</span></h2>
      <div class="dots"><span></span><span></span><span></span></div>
      <p class="toline">ちょっと まってね / just a moment…</p>
    </div></div></div>`;
}

/* ---- FOUND / driver matched ---- */
function foundScreen(){
  const d=DESTS.find(x=>x.id===state.dest), c=CARS.find(x=>x.id===state.car);
  const drv=state.driver||driverFor(state.car,0);
  const title = c.selfDriving ? 'AI ドライバー！' : 'みつかった！';
  return `<div class="screen"><div class="topbar green"><p class="hello">${c.jp}</p><h1 class="title">${title}<span class="en">Driver found! 🎉</span></h1></div>
    <div class="scroll"><div class="found">${confettiHTML()}
      <div class="foundcar idlecar">${carSVG(c.id,{decor:true,pet:state.pet})}</div>
      <div class="drivercard pop">
        <div class="dav" style="--df:${driverColor(drv)}">${drv.face}</div>
        <div class="dmeta"><b>${drv.jp} <span class="den">${drv.en}</span></b>
          <span class="drat">⭐ ${drv.rating.toFixed(1)} · ${c.jp}</span>
          <span class="dplate">${drv.plate}</span></div>
        <div class="foundtick">✓</div>
      </div>
      <p class="toline">いきさき / to&nbsp; <b>${d.emoji} ${d.jp}</b></p>
      <div class="gobar" style="width:100%;max-width:360px"><button class="gobtn" onclick="goComing()">むかえに きてもらう <span class="en">Track pickup →</span></button></div>
    </div></div></div>`;
}

/* ---- COMING / pickup tracking (map + driver card + ticking ETA) ---- */
function comingScreen(){
  const d=DESTS.find(x=>x.id===state.dest), c=CARS.find(x=>x.id===state.car);
  const drv=state.driver||driverFor(state.car,0);
  return `<div class="screen"><div class="topbar green"><button class="backbtn" onclick="goFoundBack()">◀ もどる Back</button><p class="hello">${c.jp}</p><h1 class="title">むかえに いくよ！<span class="en">On the way!</span></h1></div>
    <div class="scroll"><div class="trackmap"><div class="mapcard">${navMapSVG({pins:'dest',dest:state.dest,route:true,approach:true,carId:state.car})}</div>
      <div class="etachip"><b id="etamin">${c.wait}</b><span>ふん<br>min</span></div></div>
    <div class="drivercard">
      <div class="dav" style="--df:${driverColor(drv)}">${drv.face}</div>
      <div class="dmeta"><b>${drv.jp} <span class="den">${drv.en}</span></b>
        <span class="drat">⭐ ${drv.rating.toFixed(1)} · ${c.jp}</span>
        <span class="dplate">${drv.plate}</span></div>
      <div class="dbtns"><button class="dbtn" onclick="sfx.tap()" aria-label="メッセージ">💬</button><button class="dbtn" onclick="sfx.horn()" aria-label="でんわ">📞</button></div>
    </div>
    <p class="toline">いきさき / to&nbsp; <b>${d.emoji} ${d.jp}</b></p>
    <div class="gobar"><button class="gobtn" id="getinbtn" onclick="goRiding()">のる！ <span class="en">Get in →</span></button></div></div></div>`;
}

/* ---- RIDING / scene + live map + meter + order + (self-driving controls) ---- */
function ridingScreen(){
  const d=DESTS.find(x=>x.id===state.dest), c=CARS.find(x=>x.id===state.car), w=currentWorld();
  const driverMode = state.mode==='driver';
  const rider = driverMode ? state.passenger : state.pet;   // who's shown in the car
  const fr = (state.friend&&state.friend!=='none') ? friendById(state.friend) : null;
  const friendChip = fr ? `<div class="ridefriend">${fr.emoji} ${fr.jp} も いっしょ！</div>` : '';
  const honk = `<div class="honkrow"><button class="honkbtn" onclick="honk()">📣 クラクション<span class="en">Honk!</span></button>${c.selfDriving?'<button class="honkbtn stop" onclick="pullOver()">✋ とまって<span class="en">Stop</span></button>':''}</div>`;
  const header = driverMode
    ? `<div class="topbar purple"><p class="hello">🎓 うんてんしゅモード</p><h1 class="title">${d.emoji} ${d.jp} へ おくる<span class="en">You're driving!</span></h1></div>`
    : `<div class="topbar green"><p class="hello">${c.jp} 🚕💨</p><h1 class="title">ドライブ ちゅう！<span class="en">Riding to ${d.en}</span></h1></div>`;
  const meterBlock = driverMode ? '' : `
      <div class="meterbox"><span class="mlab">メーター<small>meter</small></span><b id="meter">¥${CONFIG.baseFare}</b></div>
      <div class="orderrow">
        <button class="orderbtn" onclick="openOrder()">🍽️ たべもの・のみものを ちゅうもんする<span class="en">Order snacks &amp; drinks</span></button>
        <div class="ordertray" id="ordertray">${orderTrayHTML()}</div>
      </div>`;
  const bottom = driverMode
    ? `<div class="gobar"><button class="gobtn yellow" id="offbtn" onclick="goDriverDrop()">とうちゃく！ おろす <span class="en">Drop off →</span></button></div>`
    : `<div class="gobar"><button class="gobtn yellow" id="offbtn" onclick="goPay()">おりて はらう <span class="en">Get off &amp; pay →</span></button></div>`;
  return `<div class="screen">${header}
    <div class="scroll">
      <div class="ridestage"><div class="ridescene">${sceneSVG(d.scene, w)}</div>${weatherOverlayHTML(w)}
        <div class="ridecar idlecar">${carSVG(c.id,{decor:true,pet:rider})}</div><div class="roadstrip"></div>
        <div class="arrbadge" id="arrbadge">とうちゃく！ 🎉</div></div>
      ${friendChip}
      <div class="livewrap"><div class="livehead"><span class="navi">🧭 ナビ</span><span class="navto">${d.emoji} ${d.jp}へ</span></div>
        <div class="mapcard live">${navMapSVG({pins:'dest',dest:state.dest,route:true,live:true,carId:c.id})}</div>
        <div class="etachip live"><b id="etamin">${etaMinutes(d)}</b><span>ふん<br>min</span></div></div>
      <div class="progwrap"><div class="progbar" id="progbar"></div></div>
      ${meterBlock}
      ${honk}
      <p class="maphint">${d.emoji} ${d.jp} まで あと ちょっと！ almost at ${d.en}</p>
      ${bottom}
    </div></div>`;
}
function orderTrayHTML(){
  const items=orderList(state.order);
  if(!items.length) return '';
  return `<div class="traychip">${items.map(it=>`<span>${it.emoji}</span>`).join('')}<b>ちゅうもん ちゅう / ordered</b></div>`;
}
function orderSheetHTML(pending){
  const tile = it => `<button class="oitem${pending[it.id]?' sel':''}" data-id="${it.id}" onclick="toggleOrder('${it.id}')"><span class="oemoji">${it.emoji}</span><b>${it.jp}</b><span class="oyen">¥${it.yen}</span></button>`;
  return `<div class="ordersheet" id="ordersheet"><div class="obackdrop" onclick="closeOrder()"></div>
    <div class="opanel">
      <div class="ohandle"></div>
      <div class="ohead"><b>🍽️ ちゅうもん / Order</b><button class="oclose" onclick="closeOrder()" aria-label="とじる">✕</button></div>
      <div class="oscroll">
        <div class="osec">🍪 たべもの <small>Snacks</small></div><div class="ogrid">${SNACKS.map(tile).join('')}</div>
        <div class="osec">🥤 のみもの <small>Drinks</small></div><div class="ogrid">${DRINKS.map(tile).join('')}</div>
      </div>
      <div class="obar"><span class="ocount" id="ocount">${orderCountLabel(pending)}</span><button class="gobtn" onclick="confirmOrder()">これに する！<span class="en">Add to ride →</span></button></div>
    </div></div>`;
}
function orderCountLabel(order){ const items=orderList(order); return items.length ? `${items.length}こ えらんだ · ¥${orderTotal(order).toLocaleString()}` : 'すきなだけ えらんでね'; }

/* ---- PAY / checkout ---- */
function payScreen(){
  const d=DESTS.find(x=>x.id===state.dest);
  const snacks=orderTotal(state.order), total=state.fare+snacks;
  const btns=PAYMENTS.map(p=>`<button class="paybtn" style="background:${p.bg};--psh:${p.psh}" onclick="pickPay('${p.id}')"><span class="pic">${p.pic}</span><b>${p.jp}</b><span>${p.en}</span></button>`).join('');
  const breakdown = snacks ? `<span class="paybreak">🚕 ¥${state.fare.toLocaleString()} ＋ 🍽️ ¥${snacks.toLocaleString()}</span>` : '';
  return `<div class="screen"><div class="topbar pink"><p class="hello">${d.emoji} ${d.jp} に とうちゃく！</p><h1 class="title">おかいけい<span class="en">How to pay?</span></h1></div>
    <div class="scroll"><div class="payfare"><span class="lab">きょうの りょうきん / today's fare</span><b>¥${total.toLocaleString()}</b>${breakdown}</div>
    <div class="sechead"><h2>はらいかた<span class="en">Tap to pay</span></h2></div><div class="pays">${btns}</div></div></div>`;
}

/* ---- RATE / thank the driver ---- */
function rateScreen(){
  const c=CARS.find(x=>x.id===state.car), drv=state.driver||driverFor(state.car,0);
  const stars=[1,2,3,4,5].map(n=>`<button class="star${state.rating>=n?' on':''}" onclick="setRating(${n})" aria-label="${n} star">★</button>`).join('');
  const comps=COMPLIMENTS.map(k=>`<button class="compchip${(state.compliments||[]).includes(k.id)?' on':''}" onclick="toggleCompliment('${k.id}')"><span>${k.emoji}</span>${k.jp}</button>`).join('');
  return `<div class="screen"><div class="topbar blue"><p class="hello">${c.jp}</p><h1 class="title">ドライバーに おれい<span class="en">Rate your driver</span></h1></div>
    <div class="scroll"><div class="rate">
      <div class="ratedriver"><div class="dav big" style="--df:${driverColor(drv)}">${drv.face}</div>
        <b>${drv.jp} <span class="den">${drv.en}</span></b></div>
      <div class="stars" id="stars">${stars}</div>
      <p class="ratehint">ほしを タップ / tap the stars</p>
      <div class="sechead sm"><h2>ありがとうカード<span class="en">Say thanks</span></h2></div>
      <div class="comps">${comps}</div>
      <div class="gobar" style="width:100%;max-width:360px"><button class="gobtn yellow" onclick="finishRate()">おくる！ <span class="en">Send &amp; finish →</span></button>
        <button class="skipbtn" onclick="finishRate()">スキップ ▶ <span class="en">Skip</span></button></div>
    </div></div></div>`;
}

/* ---- DONE / thank you + points + streak + missions ---- */
function confettiHTML(){ const emo=['⭐','🪙','🎉','✨','🌟','💛'];
  let s=''; for(let i=0;i<18;i++){ s+=`<span style="left:${Math.round(Math.random()*100)}%;animation-delay:${(Math.random()*0.9).toFixed(2)}s;font-size:${18+Math.round(Math.random()*18)}px">${emo[i%emo.length]}</span>`; }
  return `<div class="confetti">${s}</div>`; }
function doneScreen(){
  const d=DESTS.find(x=>x.id===state.dest), c=CARS.find(x=>x.id===state.car), p=PAYMENTS.find(x=>x.id===state.pay);
  const total=state.paidTotal||state.fare, items=orderList(state.order), s=PROFILE.streak||{count:1};
  const unlocked = state.justUnlocked ? `<div class="unlockbanner">🎉 うちゅうせん が あいたよ！<span>Spaceship unlocked — try it next!</span></div>` : '';
  const streak = `<div class="streakline">🔥 ${s.count}にち れんぞく！<span>${s.count}-day streak</span></div>`;
  const missions = (state.newMissions&&state.newMissions.length)
    ? state.newMissions.map(m=>`<div class="missionbanner">🎯 ミッション クリア！ ${m.jp} <b>+${m.reward}</b></div>`).join('') : '';
  const ate = items.length ? `<p class="paidline">${items.map(it=>it.emoji).join('')} たべた・のんだ！ yum!</p>` : '';
  const pet = state.pet ? `<p class="paidline">${(petById(state.pet)||{}).emoji} も いっしょ だったね！</p>` : '';
  return `<div class="screen"><div class="topbar green"><p class="hello">${d.emoji} ${d.jp}</p><h1 class="title">ありがとう！<span class="en">Thank you!</span></h1></div>
    <div class="scroll"><div class="done">${confettiHTML()}
      <div class="thanksstage idlecar">${carSVG(c.id,{decor:true,pet:state.pet})}</div>
      <h2 class="bigmsg" style="margin-top:8px">また のってね！<span class="en">See you again!</span></h2>
      ${unlocked}${missions}
      <div class="ptcard"><div class="plab">⭐ ポイント ゲット！</div><div class="pnum">+${state.points}</div><div class="pen">You earned ${state.points} points!</div></div>
      <div class="coinline">🪙 コイン ぜんぶで <b>${(PROFILE.coins||0).toLocaleString()}</b></div>
      ${streak}
      <p class="paidline">${p.pic} ${p.jp} で ¥${total.toLocaleString()} はらったよ</p>
      ${ate}${pet}
      <div class="gobar" style="width:100%;max-width:340px"><button class="gobtn yellow" onclick="goPlaces()">もういちど のる ↺<span class="en">Ride again</span></button></div>
      <div class="menurow" style="width:100%;max-width:340px">
        <button class="menubtn" onclick="goMyPage()"><span class="mpi">👦</span><b>マイページ</b><span>My Page</span></button>
        <button class="menubtn" onclick="goDriverDex()"><span class="mpi">🧑</span><b>ドライバー</b><span>Drivers</span></button>
      </div>
    </div></div></div>`;
}

/* ---- GARAGE / くるまずかん ---- */
function garageScreen(){
  const seen=CARS.filter(c=>PROFILE.seenCars[c.id]).length;
  const cells=CARS.map(c=>{
    const isSeen=!!PROFILE.seenCars[c.id];
    const unlocked=carUnlocked(c);
    const rides=PROFILE.carCounts[c.id]||0;
    if(isSeen){
      return `<div class="gcell got"><div class="gart">${carSVG(c.id)}</div>
        <div class="gname"><b>${c.jp}</b><span>${c.en}</span></div>
        <div class="gtag">${rides>0?`🚕 ×${rides}`:'✨ あたらしい'}</div>
        <span class="gcheck">✓</span></div>`;
    }
    if(!unlocked){
      const left=(c.unlockRides||0)-PROFILE.rides;
      return `<div class="gcell locked"><div class="gart dim">${carSVG(c.id)}</div>
        <div class="gname"><b>？？？</b><span>&nbsp;</span></div>
        <div class="gtag">🔒 あと ${left} かい</div></div>`;
    }
    return `<div class="gcell unseen"><div class="gart dim">${carSVG(c.id)}</div>
      <div class="gname"><b>？</b><span>のって みよう</span></div>
      <div class="gtag">まだ のってない</div></div>`;
  }).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">くるまずかん / Garage</p><h1 class="title">あつめた くるま<span class="en">Cars collected</span></h1></div>
    <div class="scroll"><div class="garagehead"><div class="gcount"><b>${seen}</b> / ${CARS.length}</div><span>ぜんぶ で ${CARS.length}だい あるよ！ collect them all</span></div>
    <div class="garage">${cells}</div>
    <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div></div></div>`;
}

/* ---- DRIVER-DEX / ドライバーずかん ---- */
function driverDexScreen(){
  const list=allDrivers(), seen=list.filter(d=>PROFILE.seenDrivers[d.id]).length;
  const cells=list.map(d=>{
    const isSeen=!!PROFILE.seenDrivers[d.id], cnt=PROFILE.driverCounts[d.id]||0, st=PROFILE.driverStars[d.id];
    if(isSeen){
      return `<div class="dcell got"><div class="dface" style="--df:${driverColor(d)}">${d.face}</div>
        <div class="dgn"><b>${d.jp}</b><span>${d.en}</span></div>
        <div class="dgtag">${cnt>0?`🚕 ×${cnt}`:'✨'}${st?` · ${st}★`:''}</div><span class="gcheck">✓</span></div>`;
    }
    return `<div class="dcell unseen"><div class="dface q">❓</div>
      <div class="dgn"><b>？？？</b><span>&nbsp;</span></div>
      <div class="dgtag">まだ あってない</div></div>`;
  }).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">ドライバーずかん / Drivers</p><h1 class="title">あった ドライバー<span class="en">Drivers met</span></h1></div>
    <div class="scroll"><div class="garagehead"><div class="gcount"><b>${seen}</b> / ${list.length}</div><span>いろんな ドライバーに あおう！ meet them all</span></div>
    <div class="dexgrid">${cells}</div>
    <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div></div></div>`;
}

/* ---- DECORATE / デコる ---- */
function decorateScreen(){
  const decor=PROFILE.decor||{accessory:'none',stickers:[]};
  const previewCar='taxi';
  const acc=availableAccessories().map(a=>`<button class="decoropt${decor.accessory===a.id?' on':''}" onclick="setAccessory('${a.id}')"><span class="doe">${a.emoji||'🚫'}</span><span>${a.jp}</span></button>`).join('');
  const stk=DECOR_STICKERS.map(em=>`<button class="stickeropt${(decor.stickers||[]).includes(em)?' on':''}" onclick="toggleSticker('${em}')">${em}</button>`).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">デコる / Decorate</p><h1 class="title">じぶんの タクシー<span class="en">Make it yours</span></h1></div>
    <div class="scroll"><div class="decorprev">${carSVG(previewCar,{decor:true})}</div>
    <div class="sechead sm"><h2>かざり<span class="en">Accessory</span></h2></div><div class="decorgrid">${acc}</div>
    <div class="sechead sm"><h2>シール <small>(3こまで)</small><span class="en">Stickers · max 3</span></h2></div><div class="stickergrid">${stk}</div>
    <button class="linkcard" onclick="goShop()"><span class="lci">🛒</span><span class="lct"><b>ショップ</b><span>コインで もっと かざりを かおう · Shop</span></span><span class="lcarr">▶</span></button>
    <div class="gobar"><button class="gobtn" onclick="goTop()">できた！ <span class="en">Done</span></button></div></div></div>`;
}

/* ---- MISSIONS / ミッション ---- */
function missionsScreen(){
  const s=PROFILE.streak||{count:0};
  const rows=MISSIONS.map(m=>{ const prog=missionProgress(m), done=missionDone(m), pct=Math.round(prog/m.goal*100);
    return `<div class="mrow${done?' done':''}"><div class="mic">${m.icon}</div>
      <div class="mbody"><b>${m.jp}</b><span>${m.en}</span><div class="mbar"><div class="mfill" style="width:${pct}%"></div></div></div>
      <div class="mright">${done?'<span class="mdone">✓</span>':`<span class="mcount">${prog}/${m.goal}</span>`}<small>+${m.reward}</small></div></div>`;
  }).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">ミッション / Missions</p><h1 class="title">やってみよう！<span class="en">Missions</span></h1></div>
    <div class="scroll"><div class="streakcard"><span class="fire">🔥</span><div><b>${s.count}にち れんぞく</b><span>${s.count}-day streak · まいにち のろう！</span></div></div>
    <div class="missions">${rows}</div>
    <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div></div></div>`;
}

/* ---- MY PAGE / profile ---- */
function myPageScreen(){
  const p=PROFILE, lvl=levelFor(p.rides), placesVisited=Object.keys(p.places).length, fav=favoriteCar(), s=p.streak||{count:0};
  const stamps=DESTS.map(d=>{ const on=!!p.places[d.id]; return `<div class="stamp ${on?'on':''}"><span class="se">${on?d.emoji:'❓'}</span><span class="sn">${d.jp}</span></div>`; }).join('');
  const driversMet=allDrivers().filter(d=>PROFILE.seenDrivers[d.id]).length;
  return `<div class="screen"><div class="topbar blue"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">マイページ / My Page</p><h1 class="title">${p.name}の きろく<span class="en">${p.nameEn}'s profile</span></h1></div>
    <div class="scroll"><div class="mypage">
      <div class="profilecard">
        <div class="avatar">${avatarSVG()}</div>
        <div class="pinfo"><b>${p.name} <span class="pen2">(${p.nameEn})</span></b><span class="age">${p.age}さい / ${p.age} yrs old</span><span class="lvlbadge">${lvl.emoji} ${lvl.jp}</span></div>
      </div>
      <div class="statgrid four">
        <div class="stat"><span class="sv">${p.rides}</span><span class="sl">🚕 のった<small>rides</small></span></div>
        <div class="stat"><span class="sv">${p.points}</span><span class="sl">⭐ ポイント<small>points</small></span></div>
        <div class="stat"><span class="sv">${p.coins||0}</span><span class="sl">🪙 コイン<small>coins</small></span></div>
        <div class="stat"><span class="sv">${placesVisited}</span><span class="sl">📍 ばしょ<small>places</small></span></div>
      </div>
      <div class="streakcard sm"><span class="fire">🔥</span><div><b>${s.count}にち れんぞく</b><span>${s.count}-day streak</span></div></div>
      <div class="favcard"><div class="favlab">おきにいりの くるま / favorite car</div>
        ${ fav ? `<div class="favart">${carSVG(fav.id)}</div><b class="favname">${fav.jp} <span>${fav.en}</span></b>` : `<div class="favnone">🚕 まだ ないよ！<span>のると きまるよ / ride to unlock</span></div>` }</div>
      <button class="linkcard" onclick="goGarage()"><span class="lci">🚗</span><span class="lct"><b>くるまずかん</b><span>${CARS.filter(c=>PROFILE.seenCars[c.id]).length} / ${CARS.length} あつめた · Garage</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goDriverDex()"><span class="lci">🧑</span><span class="lct"><b>ドライバーずかん</b><span>${driversMet} / ${allDrivers().length} あった · Drivers</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goMissions()"><span class="lci">🎯</span><span class="lct"><b>ミッション</b><span>${MISSIONS.filter(missionDone).length} / ${MISSIONS.length} クリア · Missions</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goAchievements()"><span class="lci">🏅</span><span class="lct"><b>トロフィー</b><span>${ACHIEVEMENTS.filter(achievementDone).length} / ${ACHIEVEMENTS.length} · Achievements</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goShop()"><span class="lci">🛒</span><span class="lct"><b>ショップ</b><span>🪙 ${p.coins||0} · Shop</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goDecorate()"><span class="lci">🎨</span><span class="lct"><b>デコる</b><span>タクシーを かざろう · Decorate</span></span><span class="lcarr">▶</span></button>
      <div class="sechead"><h2>スタンプカード<span class="en">Place stamps</span></h2></div>
      <div class="stampcard">${stamps}</div>
      <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div>
    </div></div></div>`;
}

function coinsPill(){ return `<div class="coinspill">🪙 <b>${PROFILE.coins||0}</b></div>`; }

/* ---- SHOP / コインで かおう ---- */
function shopScreen(){
  const cards=SHOP.map(it=>{
    const bought=owns(it.id), afford=PROFILE.coins>=it.cost;
    const btn=bought ? `<span class="owned">✓ もってる</span>`
      : `<button class="buybtn${afford?'':' no'}" ${afford?`onclick="buy('${it.id}')"`:'disabled'}>🪙 ${it.cost}</button>`;
    return `<div class="shopcard${bought?' bought':''}"><div class="shopemoji">${it.emoji}</div><b>${it.jp}</b>${btn}</div>`;
  }).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button>${coinsPill()}<h1 class="title">ショップ<span class="en">Spend your coins</span></h1></div>
    <div class="scroll"><p class="maphint">コインは のると たまるよ！ earn coins by riding &amp; missions</p>
    <div class="shopgrid">${cards}</div>
    <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div></div></div>`;
}

/* ---- ACHIEVEMENTS / トロフィー ---- */
function achievementsScreen(){
  const got=ACHIEVEMENTS.filter(achievementDone).length;
  const cells=ACHIEVEMENTS.map(a=>{ const done=achievementDone(a);
    return `<div class="acell${done?' got':''}"><div class="aic">${done?a.icon:'🔒'}</div><div class="agn"><b>${a.jp}</b><span>${a.en}</span></div>${done?'<span class="gcheck">✓</span>':''}</div>`;
  }).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">トロフィー / Achievements</p><h1 class="title">あつめた トロフィー<span class="en">${got} / ${ACHIEVEMENTS.length}</span></h1></div>
    <div class="scroll"><div class="achlist">${cells}</div>
    <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div></div></div>`;
}

/* ---- SETTINGS (parent) ---- */
function settingsScreen(){
  const p=PROFILE;
  const music=MUSIC.map(m=>`<button class="worldchip${p.music===m.id?' on':''}" onclick="setMusic('${m.id}')"><span class="we">${m.emoji}</span><span>${m.jp}</span></button>`).join('');
  return `<div class="screen"><div class="topbar blue"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">せってい / Settings</p><h1 class="title">おうちの ひと むけ<span class="en">Settings</span></h1></div>
    <div class="scroll"><div class="settings">
      <div class="setrow"><label>なまえ / Name</label><input id="setName" value="${p.name}" oninput="setName(this.value)"></div>
      <div class="setrow"><label>ローマじ / En</label><input id="setNameEn" value="${p.nameEn}" oninput="setNameEn(this.value)"></div>
      <div class="setrow"><label>とし / Age</label><input id="setAge" type="number" min="1" max="12" value="${p.age}" oninput="setAge(this.value)"></div>
      <div class="setrow"><label>🔊 よみあげ / Read aloud</label><button class="toggle${p.readAloud?' on':''}" onclick="toggleReadAloud(this)">${p.readAloud?'ON':'OFF'}</button></div>
      <div class="sechead sm"><h2>おんがく<span class="en">Music</span></h2></div><div class="worldrow">${music}</div>
      <div class="setrow danger"><label>データを けす / Reset</label><button class="resetbtn" onclick="doReset()">リセット</button></div>
    </div></div></div>`;
}

/* ---- GAMES hub / ミニゲーム ---- */
function gamesScreen(){
  const games=[
    {fn:'goDriverMode', emoji:'🎓', jp:'うんてんしゅモード', en:'Be the driver'},
    {fn:'goFreeDrive',  emoji:'🕹️', jp:'フリードライブ',     en:'Free drive'},
    {fn:'goCarWash',    emoji:'🫧', jp:'せんしゃ',           en:'Car wash'},
    {fn:'goColorGame',  emoji:'🎨', jp:'いろあそび',         en:'Colors'},
  ].map(g=>`<button class="gamecard" onclick="${g.fn}()"><span class="gce">${g.emoji}</span><b>${g.jp}</b><span>${g.en}</span></button>`).join('');
  return `<div class="screen"><div class="topbar green"><button class="backbtn" onclick="goTop()">◀ トップ Top</button>${coinsPill()}<h1 class="title">ミニゲーム<span class="en">Mini games</span></h1></div>
    <div class="scroll"><div class="gamesgrid">${games}</div></div></div>`;
}

/* ---- DRIVER MODE (Haru is the driver) ---- */
function driverModeScreen(){
  const reqs=state.requests||[];
  const cards=reqs.map((r,i)=>`<button class="reqcard" onclick="acceptRide(${i})"><div class="reqp" style="--df:#eef3fa">${r.passenger}</div>
    <div class="reqmeta"><b>${r.pjp}</b><span>${r.demoji} ${r.djp} へ いきたい</span></div><span class="reqgo">のせる ▶</span></button>`).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goGames()">◀ もどる</button><p class="hello">🎓 うんてんしゅモード</p><h1 class="title">おきゃくさんを のせよう<span class="en">Pick a passenger</span></h1></div>
    <div class="scroll"><p class="maphint">タップして おきゃくさんを のせてね</p><div class="reqlist">${cards}</div></div></div>`;
}
function driverDoneScreen(){
  return `<div class="screen"><div class="topbar green"><p class="hello">🎓 うんてんしゅモード</p><h1 class="title">とうちゃく！<span class="en">Dropped off!</span></h1></div>
    <div class="scroll"><div class="done">${confettiHTML()}
      <div class="thanksstage">${state.passenger||'🧑'}</div>
      <h2 class="bigmsg">ありがとう！ じょうずだね！<span class="en">Great driving!</span></h2>
      <div class="coinline">🪙 コイン ゲット！ <b>+${state.driveReward||50}</b></div>
      <div class="gobar" style="width:100%;max-width:340px"><button class="gobtn" onclick="goDriverMode()">つぎの おきゃくさん ↺<span class="en">Next passenger</span></button></div>
      <div class="menurow" style="width:100%;max-width:340px"><button class="menubtn" onclick="goGames()"><span class="mpi">🎮</span><b>ミニゲーム</b><span>Games</span></button><button class="menubtn" onclick="goTop()"><span class="mpi">🏠</span><b>トップ</b><span>Home</span></button></div>
    </div></div></div>`;
}

/* ---- FREE DRIVE (steer & collect coins) ---- */
function freeDriveScreen(){
  return `<div class="screen"><div class="topbar green"><button class="backbtn" onclick="goGames()">◀ やめる</button><p class="hello">🕹️ フリードライブ</p><h1 class="title">コインを あつめよう！<span class="en">Drag to steer</span></h1></div>
    <div class="scroll"><div class="fdhud"><span>🪙 <b id="fdscore">0</b></span><span>⏱️ <b id="fdtime">20</b></span></div>
    <div class="fdstage" id="fdstage"><div class="fdlane"></div><div class="fdcar" id="fdcar">${carSVG(favoriteCar()?favoriteCar().id:'taxi')}</div></div>
    <p class="maphint">くるまを うごかして コインを とってね！ / drag the car left & right</p></div></div>`;
}

/* ---- CAR WASH (scrub the car clean) ---- */
function carWashScreen(){
  const spots=[]; for(let i=0;i<8;i++){ spots.push(`<span class="dirt" data-i="${i}" style="left:${18+Math.random()*64}%;top:${30+Math.random()*45}%"></span>`); }
  return `<div class="screen"><div class="topbar blue"><button class="backbtn" onclick="goGames()">◀ もどる</button><p class="hello">🫧 せんしゃ</p><h1 class="title">くるまを ピカピカに！<span class="en">Scrub it clean</span></h1></div>
    <div class="scroll"><div class="washstage" id="washstage"><div class="washcar">${carSVG(favoriteCar()?favoriteCar().id:'taxi')}</div>${spots.join('')}
      <div class="washdone" id="washdone">✨ ピカピカ！ ✨</div></div>
    <p class="maphint">よごれを こすって おとしてね！ / rub the dirt away</p></div></div>`;
}

/* ---- COLOR GAME (tap the right colour) ---- */
function colorGameScreen(){
  const g=state.colorGame||{};
  const cars=(g.choices||[]).map((c,i)=>`<button class="colorcar" onclick="colorPick(${i})">${coloredCarSVG(c.body)}</button>`).join('');
  return `<div class="screen"><div class="topbar green"><button class="backbtn" onclick="goGames()">◀ やめる</button><p class="hello">🎨 いろあそび · ${g.round||1}/5</p><h1 class="title"><span style="color:${g.hex||'#333'}">${g.jp||''}</span> の くるまは？<span class="en">Tap the ${g.en||''} car</span></h1></div>
    <div class="scroll"><div class="colorgrid" id="colorgrid">${cars}</div><p class="maphint" id="colormsg">タップしてね！</p></div></div>`;
}
