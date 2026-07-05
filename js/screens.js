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
      <button class="menubtn" onclick="goMyPage()"><span class="mpi">👦</span><b>マイページ</b><span>My Page</span></button>
      <button class="menubtn" onclick="goGarage()"><span class="mpi">🚗</span><b>くるまずかん</b><span>Garage</span></button>
      <button class="menubtn" onclick="goDriverDex()"><span class="mpi">🧑</span><b>ドライバーずかん</b><span>Drivers</span></button>
      <button class="menubtn" onclick="goMissions()"><span class="mpi">🎯</span><b>ミッション</b><span>Missions</span></button>
      <button class="menubtn" onclick="goDecorate()"><span class="mpi">🎨</span><b>デコる</b><span>Decorate</span></button>
    </div>
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
  const cells=[{id:'',jp:'なし',emoji:'🚫'}].concat(PETS).map(p=>{
    const sel=(state.pet||'')===p.id?' sel':'';
    return `<button class="petchip${sel}" onclick="pickPet('${p.id}')"><span class="pe">${p.emoji}</span><span>${p.jp}</span></button>`;
  }).join('');
  return `<div class="sechead sm"><h2>いっしょに のる<span class="en">Bring a pet</span></h2></div><div class="petstrip">${cells}</div>`;
}
function carsScreen(){
  const d=DESTS.find(x=>x.id===state.dest);
  const rows=CARS.map(c=>{
    const unlocked=carUnlocked(c);
    const sel=state.car===c.id?' selected':'';
    const est=estFare(c);
    const price = est ? `¥${est.toLocaleString()}` : 'むりょう';
    const priceEn = est ? `~¥${est.toLocaleString()}` : 'free';
    if(!unlocked){
      const left=(c.unlockRides||0)-PROFILE.rides;
      return `<div class="ride locked"><div class="rart">${carSVG(c.id)}</div>
        <div class="rinfo"><b>？？？ <span class="rtier">ひみつ</span></b><span class="rsub">🔒 あと ${left} かい のると あける / ${left} more rides</span></div>
        <div class="rprice"><span class="lockbig">🔒</span></div></div>`;
    }
    const badge = c.selfDriving ? '<span class="rtier auto">🤖 じどう</span>' : `<span class="rtier">${c.tier}</span>`;
    return `<button class="ride${sel}" onclick="pickCar('${c.id}')"><div class="rart">${carSVG(c.id)}</div>
      <div class="rinfo"><b>${c.jp} ${badge}</b><span class="rsub">🕐 ${c.wait}ふん で くるよ · ${c.wait} min</span></div>
      <div class="rprice"><b>${price}</b><span>${priceEn}</span></div></button>`;
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
    <div class="ridelist">${rows}</div>
    ${petStripHTML()}
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
  const sd = c.selfDriving ? `<div class="selfdrive"><div class="sdbadge">🤖 じどう うんてん ちゅう <span>self-driving</span></div>
    <div class="sdbtns"><button class="sdbtn" onclick="honk()">📣<span>クラクション</span></button><button class="sdbtn stop" onclick="pullOver()">✋<span>とまって</span></button></div></div>` : '';
  return `<div class="screen"><div class="topbar green"><p class="hello">${c.jp} 🚕💨</p><h1 class="title">ドライブ ちゅう！<span class="en">Riding to ${d.en}</span></h1></div>
    <div class="scroll">
      <div class="ridestage"><div class="ridescene">${sceneSVG(d.scene, w)}</div>${weatherOverlayHTML(w)}
        <div class="ridecar idlecar">${carSVG(c.id,{decor:true,pet:state.pet})}</div><div class="roadstrip"></div>
        <div class="arrbadge" id="arrbadge">とうちゃく！ 🎉</div></div>
      <div class="livewrap"><div class="mapcard slim">${navMapSVG({pins:'dest',dest:state.dest,route:true,live:true,carId:c.id})}</div>
        <div class="etachip live"><b id="etamin">${etaMinutes(d)}</b><span>ふん<br>min</span></div></div>
      <div class="meterbox"><span class="mlab">メーター<small>meter</small></span><b id="meter">¥${CONFIG.baseFare}</b></div>
      <div class="progwrap"><div class="progbar" id="progbar"></div></div>
      ${sd}
      <div class="orderrow">
        <button class="orderbtn" onclick="openOrder()">🍽️ たべもの・のみものを ちゅうもんする<span class="en">Order snacks &amp; drinks</span></button>
        <div class="ordertray" id="ordertray">${orderTrayHTML()}</div>
      </div>
      <p class="maphint">${d.emoji} ${d.jp} まで あと ちょっと！ almost at ${d.en}</p>
      <div class="gobar"><button class="gobtn yellow" id="offbtn" onclick="goPay()">おりて はらう <span class="en">Get off &amp; pay →</span></button></div>
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
      <div class="gobar" style="width:100%;max-width:360px"><button class="gobtn yellow" onclick="finishRate()">おくる！ <span class="en">Send &amp; finish →</span></button></div>
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
  const acc=DECOR_ACCESSORIES.map(a=>`<button class="decoropt${decor.accessory===a.id?' on':''}" onclick="setAccessory('${a.id}')"><span class="doe">${a.emoji||'🚫'}</span><span>${a.jp}</span></button>`).join('');
  const stk=DECOR_STICKERS.map(em=>`<button class="stickeropt${(decor.stickers||[]).includes(em)?' on':''}" onclick="toggleSticker('${em}')">${em}</button>`).join('');
  return `<div class="screen"><div class="topbar purple"><button class="backbtn" onclick="goTop()">◀ トップ Top</button><p class="hello">デコる / Decorate</p><h1 class="title">じぶんの タクシー<span class="en">Make it yours</span></h1></div>
    <div class="scroll"><div class="decorprev">${carSVG(previewCar,{decor:true})}</div>
    <div class="sechead sm"><h2>かざり<span class="en">Accessory</span></h2></div><div class="decorgrid">${acc}</div>
    <div class="sechead sm"><h2>シール <small>(3こまで)</small><span class="en">Stickers · max 3</span></h2></div><div class="stickergrid">${stk}</div>
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
      <div class="statgrid">
        <div class="stat"><span class="sv">${p.rides}</span><span class="sl">🚕 のった<small>rides</small></span></div>
        <div class="stat"><span class="sv">${p.points}</span><span class="sl">⭐ ポイント<small>points</small></span></div>
        <div class="stat"><span class="sv">${placesVisited}</span><span class="sl">📍 ばしょ<small>places</small></span></div>
      </div>
      <div class="streakcard sm"><span class="fire">🔥</span><div><b>${s.count}にち れんぞく</b><span>${s.count}-day streak</span></div></div>
      <div class="favcard"><div class="favlab">おきにいりの くるま / favorite car</div>
        ${ fav ? `<div class="favart">${carSVG(fav.id)}</div><b class="favname">${fav.jp} <span>${fav.en}</span></b>` : `<div class="favnone">🚕 まだ ないよ！<span>のると きまるよ / ride to unlock</span></div>` }</div>
      <button class="linkcard" onclick="goGarage()"><span class="lci">🚗</span><span class="lct"><b>くるまずかん</b><span>${CARS.filter(c=>PROFILE.seenCars[c.id]).length} / ${CARS.length} あつめた · Garage</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goDriverDex()"><span class="lci">🧑</span><span class="lct"><b>ドライバーずかん</b><span>${driversMet} / ${allDrivers().length} あった · Drivers</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goMissions()"><span class="lci">🎯</span><span class="lct"><b>ミッション</b><span>${MISSIONS.filter(missionDone).length} / ${MISSIONS.length} クリア · Missions</span></span><span class="lcarr">▶</span></button>
      <button class="linkcard" onclick="goDecorate()"><span class="lci">🎨</span><span class="lct"><b>デコる</b><span>タクシーを かざろう · Decorate</span></span><span class="lcarr">▶</span></button>
      <div class="sechead"><h2>スタンプカード<span class="en">Place stamps</span></h2></div>
      <div class="stampcard">${stamps}</div>
      <div class="gobar"><button class="gobtn" onclick="goPlaces()">🚕 タクシーにのる<span class="en">Ride now</span></button></div>
    </div></div></div>`;
}
