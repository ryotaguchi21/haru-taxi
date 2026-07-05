/* ============================================================
   data.js — all editable content lives here (easy to rebrand)
   ============================================================ */

/* App-wide config: change the child's name/age here */
const CONFIG = {
  name:   'はる',
  nameEn: 'Haru',
  age:    4,
  rideMs: 6000,       // how long a ride lasts (ms)
  baseFare: 500,      // starting fare (yen)
  storeKey: 'haruTaxi.v1'  // localStorage key for the saved profile
};

/* Drop-off destinations.
   pos   = pin location on the map SVG (0..360 x, 0..250 y)
   scene = which mini-scene to draw on the riding screen (see sceneSVG in art.js) */
const DESTS = [
  { id:'shibuya',    jp:'しぶや',        en:'Shibuya',    emoji:'🏙️', dc:'#ffe1e1', dsh:'#f2c9d6', pos:{x:268,y:60},  scene:'city',      km:6 },
  { id:'daikanyama', jp:'だいかんやま',   en:'Daikanyama', emoji:'🌳', dc:'#dff5df', dsh:'#c9e6cf', pos:{x:150,y:52},  scene:'forest',    km:4 },
  { id:'komaba',     jp:'こまば',        en:'Komaba',     emoji:'🏫', dc:'#fff0d6', dsh:'#eedec0', pos:{x:60,y:92},   scene:'school',    km:3 },
  { id:'fujisawa',   jp:'ふじさわ',      en:'Fujisawa',   emoji:'🌊', dc:'#d9eeff', dsh:'#c5def2', pos:{x:96,y:200},  scene:'sea',       km:12 },
  { id:'kakio',      jp:'かきお',        en:'Kakio',      emoji:'🏡', dc:'#ffe6d6', dsh:'#f2d3c0', pos:{x:300,y:120}, scene:'houses',    km:8 },
  { id:'chiba',      jp:'ちば',          en:'Chiba',      emoji:'🎡', dc:'#eee2ff', dsh:'#ddcef2', pos:{x:306,y:200}, scene:'park',      km:14 },
  { id:'kohei',      jp:'こうへいくんち', en:"Kohei's",    emoji:'🏠', dc:'#ffeede', dsh:'#f2ddc4', pos:{x:200,y:150}, scene:'houses',    km:5 },
  { id:'inter',      jp:'インター',      en:'Intl School', emoji:'🌍', dc:'#e2f0ff', dsh:'#cbe0f5', pos:{x:214,y:58},  scene:'school',    km:7 },
  { id:'yochien',    jp:'こまばようちえん', en:'Kindergarten', emoji:'🧸', dc:'#fff0f6', dsh:'#f2d6e6', pos:{x:40,y:150}, scene:'kinder',  km:3 },
  { id:'singapore',  jp:'シンガポール',  en:'Singapore',  emoji:'🦁', dc:'#e6fff6', dsh:'#c9f0e2', pos:{x:332,y:70},  scene:'singapore', km:5000 },
];
const PINCOLOR = { shibuya:'#ff4b3e', daikanyama:'#4fc06a', komaba:'#ffab2e', fujisawa:'#3d8bff', kakio:'#ff7a45', chiba:'#9b6bff', kohei:'#ff8a3d', inter:'#2f9bff', yochien:'#ff5fa2', singapore:'#12b886' };

/* The fleet. `art` tells art.js how to draw each one. Add more here anytime.
   mult = price multiplier vs baseFare · wait = pickup minutes · tier = label shown in the ride list */
const CARS = [
  { id:'taxi',      jp:'タクシー',         en:'Taxi',        art:{kind:'taxi'},                                        mult:1.0, wait:3, tier:'ふつう'    },
  { id:'sedan',     jp:'セダンタクシー',   en:'Sedan Taxi',  art:{kind:'sedan-taxi'},                                  mult:1.2, wait:4, tier:'ゆったり'  },
  { id:'ferrari',   jp:'フェラーリ',       en:'Ferrari',     art:{kind:'sport', body:'#ff2a1a', emblem:'#ffd400'},     mult:2.6, wait:6, tier:'スーパーカー' },
  { id:'porsche',   jp:'ポルシェ',         en:'Porsche',     art:{kind:'sport', body:'#d4d8de', stroke:'#c4c9d2', emblem:'#c8102e'}, mult:2.8, wait:6, tier:'スーパーカー' },
  { id:'aston',     jp:'アストンマーティン', en:'Aston Martin', art:{kind:'sport', body:'#17604a', emblem:'#0e3d2e'}, mult:2.9, wait:7, tier:'スーパーカー' },
  { id:'mazda',     jp:'マツダ',           en:'Mazda',       art:{kind:'sedan', body:'#d3061c', emblem:'#7a0410'},     mult:1.3, wait:5, tier:'ゆったり'  },
  { id:'nissan',    jp:'ニッサン',         en:'Nissan',      art:{kind:'sedan', body:'#1f6fd8', emblem:'#0a3f86'},     mult:1.3, wait:5, tier:'ゆったり'  },
  { id:'benz',      jp:'ベンツ',           en:'Benz',        art:{kind:'benz'},                                        mult:2.2, wait:6, tier:'ごうか'    },
  { id:'tesla',     jp:'テスラ',           en:'Tesla',       art:{kind:'tesla'},                                       mult:2.0, wait:5, tier:'でんき'    },
  { id:'alphard',   jp:'アルファード',     en:'Alphard',     art:{kind:'van', body:'#26292f'},                         mult:1.8, wait:7, tier:'おおきい'  },
  { id:'challenger', jp:'ダッジチャレンジャー', en:'Dodge Challenger', art:{kind:'sport', body:'#8b3fd6', emblem:'#efe6ff'}, mult:2.5, wait:6, tier:'マッスル'  },
  { id:'lambo',     jp:'ランボルギーニ',   en:'Lamborghini', art:{kind:'sport', body:'#f0c800', emblem:'#1a1a1a'},     mult:3.0, wait:7, tier:'スーパーカー' },
  { id:'volvo',     jp:'ボルボ',           en:'Volvo',       art:{kind:'sedan', body:'#2e4c6d', emblem:'#c9d4e2'},     mult:1.9, wait:6, tier:'あんぜん'  },
  { id:'toyota',    jp:'トヨタ',           en:'Toyota',      art:{kind:'sedan', body:'#0aa5b5', emblem:'#eafcff'},     mult:1.3, wait:4, tier:'ファミリー' },
  { id:'priusalpha', jp:'プリウスα',       en:'Prius Alpha', art:{kind:'van', body:'#8ec3a8'},                         mult:1.6, wait:5, tier:'ハイブリッド' },
  { id:'police',    jp:'パトカー',         en:'Police Car',  art:{kind:'police'},    sound:'siren',                    mult:0,   wait:2, tier:'とくべつ'  },
  { id:'ambulance', jp:'きゅうきゅうしゃ', en:'Ambulance',   art:{kind:'ambulance'}, sound:'siren',                    mult:0,   wait:2, tier:'とくべつ'  },
  { id:'uchusen',   jp:'うちゅうせん',     en:'Spaceship',   art:{kind:'spaceship'}, locked:true, unlockRides:5,       mult:3.0, wait:1, tier:'ひみつ'    },
];

/* Estimated fare shown in the ride list (rounded to a friendly ¥50). Free rides read ¥0. */
function estFare(car){ return car.mult ? Math.round(CONFIG.baseFare * car.mult / 50) * 50 : 0; }

/* Is a car available to pick yet? (locked cars unlock after N rides) */
function carUnlocked(car){ return !car.locked || PROFILE.rides >= (car.unlockRides||0); }

/* Payment methods shown on the checkout screen */
const PAYMENTS = [
  { id:'paypay', jp:'ペイペイ',         en:'PayPay',    pic:'📱', bg:'#ff2d4b', psh:'#c81834' },
  { id:'suica',  jp:'スイカ',           en:'Suica IC',  pic:'🎫', bg:'#3aae4a', psh:'#2c8a39' },
  { id:'card',   jp:'クレジットカード', en:'Card',      pic:'💳', bg:'#3d8bff', psh:'#2f6fd8' },
  { id:'genkin', jp:'げんきん',         en:'Cash',      pic:'🪙', bg:'#ffab2e', psh:'#dd8a12' },
];

/* In-car snacks & drinks the child can order during the ride. yen adds to the fare. */
const SNACKS = [
  { id:'cookie',   jp:'クッキー',     en:'Cookie',    emoji:'🍪', yen:100 },
  { id:'choco',    jp:'チョコ',       en:'Chocolate', emoji:'🍫', yen:120 },
  { id:'popcorn',  jp:'ポップコーン', en:'Popcorn',   emoji:'🍿', yen:150 },
  { id:'banana',   jp:'バナナ',       en:'Banana',    emoji:'🍌', yen:80  },
  { id:'onigiri',  jp:'おにぎり',     en:'Rice ball', emoji:'🍙', yen:130 },
  { id:'candy',    jp:'あめ',         en:'Candy',     emoji:'🍬', yen:50  },
  { id:'donut',    jp:'ドーナツ',     en:'Donut',     emoji:'🍩', yen:140 },
  { id:'icecream', jp:'アイス',       en:'Ice cream', emoji:'🍦', yen:160 },
];
const DRINKS = [
  { id:'juice',  jp:'ジュース',       en:'Juice', emoji:'🧃', yen:120 },
  { id:'milk',   jp:'ぎゅうにゅう',   en:'Milk',  emoji:'🥛', yen:100 },
  { id:'water',  jp:'おみず',         en:'Water', emoji:'💧', yen:60  },
  { id:'tea',    jp:'おちゃ',         en:'Tea',   emoji:'🍵', yen:90  },
  { id:'ramune', jp:'ラムネ',         en:'Ramune',emoji:'🥤', yen:130 },
  { id:'cocoa',  jp:'ココア',         en:'Cocoa', emoji:'☕', yen:110 },
];
function orderItems(){ return SNACKS.concat(DRINKS); }
function orderList(order){ const all=orderItems(); return Object.keys(order||{}).filter(id=>order[id]).map(id=>all.find(x=>x.id===id)).filter(Boolean); }
function orderTotal(order){ return orderList(order).reduce((t,it)=>t+it.yen,0); }

/* Cute drivers. One is picked (by ride count, so it feels stable within a session)
   whenever a car is on the way. Spaceship gets its own alien driver. */
const DRIVERS = [
  { jp:'たろう',       en:'Taro',    face:'👨',    rating:4.9 },
  { jp:'はなこ',       en:'Hanako',  face:'👩',    rating:5.0 },
  { jp:'けんた',       en:'Kenta',   face:'🧑',    rating:4.8 },
  { jp:'ゆき',         en:'Yuki',    face:'👩‍🦰', rating:4.9 },
  { jp:'ロボくん',     en:'Robo',    face:'🤖',    rating:5.0 },
  { jp:'おじいちゃん', en:'Grandpa', face:'👴',    rating:4.7 },
];
const ALIEN_DRIVER = { jp:'エイリアン', en:'Alien', face:'👽', rating:5.0 };
const PLATES = ['しながわ 500 あ 12-34','せたがや 300 は 88-88','ねりま 501 の 7-77','よこはま 300 ら 21-09','なにわ 500 き 55-51'];

function driverFor(carId, seed){
  if(carId==='uchusen') return { ...ALIEN_DRIVER, plate:'うちゅう ★★ 00-01' };
  const s = Math.abs(seed||0);
  const d = DRIVERS[s % DRIVERS.length];
  return { ...d, plate: PLATES[s % PLATES.length] };
}
/* soft background tint for the driver avatar bubble */
function driverColor(drv){
  const map = { '👨':'#cfe3ff','👩':'#ffd6e6','🧑':'#d6f0d8','👩‍🦰':'#ffe1cf','🤖':'#d8dee8','👴':'#eee0cf','👽':'#dce9c9' };
  return (drv && map[drv.face]) || '#e6ecf5';
}

/* Player profile — accumulates during the session and (in Claude Code / a real
   project) is saved to localStorage so it survives a refresh.
   carCounts[id] = rides in that car · seenCars[id] = true once picked (garage) */
const PROFILE = {
  name: CONFIG.name, nameEn: CONFIG.nameEn, age: CONFIG.age,
  rides: 0, points: 0, places: {}, carCounts: {}, seenCars: {}
};

/* ---- persistence (localStorage; silently no-ops where storage is blocked) ---- */
function loadProfile(){
  try{
    const raw = localStorage.getItem(CONFIG.storeKey);
    if(!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(PROFILE, {
      rides:  saved.rides  || 0,
      points: saved.points || 0,
      places: saved.places || {},
      carCounts: saved.carCounts || {},
      seenCars:  saved.seenCars  || {},
    });
    // keep name/age in sync with the current CONFIG (child may have been renamed)
    PROFILE.name = CONFIG.name; PROFILE.nameEn = CONFIG.nameEn; PROFILE.age = CONFIG.age;
  }catch(e){ /* storage unavailable — run in-memory only */ }
}
function saveProfile(){
  try{
    localStorage.setItem(CONFIG.storeKey, JSON.stringify({
      rides: PROFILE.rides, points: PROFILE.points,
      places: PROFILE.places, carCounts: PROFILE.carCounts, seenCars: PROFILE.seenCars
    }));
  }catch(e){ /* ignore */ }
}
function resetProfile(){
  PROFILE.rides=0; PROFILE.points=0; PROFILE.places={}; PROFILE.carCounts={}; PROFILE.seenCars={};
  saveProfile();
}

/* Driver ranks by number of rides (used on MyPage) */
function levelFor(rides){
  if(rides>=8) return { jp:'でんせつの うんてんしゅ', en:'Legend',   emoji:'👑' };
  if(rides>=5) return { jp:'たくしー マスター',       en:'Master',   emoji:'🏆' };
  if(rides>=3) return { jp:'たくしー たいちょう',     en:'Captain',  emoji:'⭐' };
  if(rides>=1) return { jp:'ドライバー',             en:'Driver',   emoji:'🚕' };
  return          { jp:'しんまい',                 en:'Rookie',   emoji:'🌱' };
}
function favoriteCar(){
  let best=null, bc=0;
  for(const id in PROFILE.carCounts){ if(PROFILE.carCounts[id]>bc){ bc=PROFILE.carCounts[id]; best=id; } }
  return best ? CARS.find(c=>c.id===best) : null;
}
