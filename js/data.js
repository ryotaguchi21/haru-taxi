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
  { id:'zoo',        jp:'どうぶつえん',  en:'Zoo',        emoji:'🦒', dc:'#eafbe0', dsh:'#d3f0c2', pos:{x:132,y:120}, scene:'zoo',       km:9 },
  { id:'aquarium',   jp:'すいぞくかん',  en:'Aquarium',   emoji:'🐠', dc:'#e0f4ff', dsh:'#c2e6f7', pos:{x:238,y:110}, scene:'aquarium',  km:11 },
  { id:'airport',    jp:'くうこう',      en:'Airport',    emoji:'✈️', dc:'#eef1f6', dsh:'#d7dde6', pos:{x:250,y:168}, scene:'airport',   km:20 },
  { id:'grandma',    jp:'おばあちゃんち', en:"Grandma's",  emoji:'👵', dc:'#fff0e6', dsh:'#f2d9c4', pos:{x:150,y:170}, scene:'houses',    km:16 },
  { id:'space',      jp:'うちゅうステーション', en:'Space Stn', emoji:'🛰️', dc:'#ece2ff', dsh:'#d6c8f2', pos:{x:70,y:56}, scene:'space',   km:99999 },
];
const PINCOLOR = { shibuya:'#ff4b3e', daikanyama:'#4fc06a', komaba:'#ffab2e', fujisawa:'#3d8bff', kakio:'#ff7a45', chiba:'#9b6bff', kohei:'#ff8a3d', inter:'#2f9bff', yochien:'#ff5fa2', singapore:'#12b886', zoo:'#6fb536', aquarium:'#2aa6d8', airport:'#7a8aa0', grandma:'#ff9a6b', space:'#8b6bff' };

/* The fleet. `art` tells art.js how to draw each one. Add more here anytime.
   mult = price multiplier vs baseFare · wait = pickup minutes · tier = label shown in the ride list
   selfDriving = no human driver (robo-taxi) */
const CARS = [
  { id:'taxi',      jp:'タクシー',         en:'Taxi',        art:{kind:'taxi'},                                        mult:1.0, wait:3, tier:'ふつう'    },
  { id:'sedan',     jp:'セダンタクシー',   en:'Sedan Taxi',  art:{kind:'sedan-taxi'},                                  mult:1.2, wait:4, tier:'ゆったり'  },
  { id:'robotaxi',  jp:'じどう うんてんタクシー', en:'Robo-Taxi', art:{kind:'robotaxi', body:'#e3e9f2'}, selfDriving:true, mult:2.2, wait:2, tier:'じどう'    },
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
  { id:'bus',       jp:'バス',             en:'Bus',         art:{kind:'bus', body:'#31a3d8'},                         mult:1.4, wait:6, tier:'みんなで'  },
  { id:'train',     jp:'でんしゃ',         en:'Train',       art:{kind:'train', body:'#3aae5a'},                       mult:1.5, wait:5, tier:'せんろ'    },
  { id:'shinkansen', jp:'しんかんせん',    en:'Shinkansen',  art:{kind:'shinkansen', body:'#eef2f6'},                  mult:2.4, wait:3, tier:'こうそく'  },
  { id:'firetruck', jp:'しょうぼうしゃ',   en:'Fire Truck',  art:{kind:'firetruck'}, sound:'siren',                    mult:0,   wait:2, tier:'とくべつ'  },
  { id:'dump',      jp:'ダンプカー',       en:'Dump Truck',  art:{kind:'dump', body:'#ffb020'},                        mult:1.7, wait:6, tier:'はたらく'  },
  { id:'goldtaxi',  jp:'ゴールドタクシー', en:'Gold Taxi',   art:{kind:'taxi', body:'#ffd24d', emblem:'#b8860b'}, shopCost:300, mult:3.5, wait:2, tier:'デラックス' },
  { id:'police',    jp:'パトカー',         en:'Police Car',  art:{kind:'police'},    sound:'siren',                    mult:0,   wait:2, tier:'とくべつ'  },
  { id:'ambulance', jp:'きゅうきゅうしゃ', en:'Ambulance',   art:{kind:'ambulance'}, sound:'siren',                    mult:0,   wait:2, tier:'とくべつ'  },
  { id:'uchusen',   jp:'うちゅうせん',     en:'Spaceship',   art:{kind:'spaceship'}, locked:true, unlockRides:5,       mult:3.0, wait:1, tier:'ひみつ'    },
];

/* Estimated fare shown in the ride list (rounded to a friendly ¥50). Free rides read ¥0. */
function estFare(car){ return car.mult ? Math.round(CONFIG.baseFare * car.mult / 50) * 50 : 0; }

/* Is a car available to pick yet? (bought in shop, or ride-unlocked) */
function carUnlocked(car){
  if(PROFILE.owned && PROFILE.owned['car:'+car.id]) return true;   // bought in the shop
  if(car.shopCost) return false;                                   // shop-only, not yet bought
  return !car.locked || PROFILE.rides >= (car.unlockRides||0);
}

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

/* ---- drivers (collect them all in the Driver-Dex!) ---- */
const DRIVERS = [
  { id:'taro',     jp:'たろう',       en:'Taro',     face:'👨', rating:4.9 },
  { id:'hanako',   jp:'はなこ',       en:'Hanako',   face:'👩', rating:5.0 },
  { id:'kenta',    jp:'けんた',       en:'Kenta',    face:'🧑', rating:4.8 },
  { id:'yuki',     jp:'ゆき',         en:'Yuki',     face:'👧', rating:4.9 },
  { id:'robo',     jp:'ロボくん',     en:'Robo',     face:'🤖', rating:5.0 },
  { id:'grandpa',  jp:'おじいちゃん', en:'Grandpa',  face:'👴', rating:4.7 },
  { id:'neko',     jp:'ねこドライバー', en:'Cat',    face:'🐱', rating:5.0 },
  { id:'inu',      jp:'いぬドライバー', en:'Dog',    face:'🐶', rating:4.9 },
  { id:'kuma',     jp:'くまさん',     en:'Bear',     face:'🐻', rating:4.8 },
  { id:'panda',    jp:'パンダ',       en:'Panda',    face:'🐼', rating:4.9 },
  { id:'penguin',  jp:'ペンギン',     en:'Penguin',  face:'🐧', rating:4.9 },
  { id:'unicorn',  jp:'ユニコーン',   en:'Unicorn',  face:'🦄', rating:5.0 },
  { id:'santa',    jp:'サンタさん',   en:'Santa',    face:'🎅', rating:5.0 },
  { id:'ninja',    jp:'にんじゃ',     en:'Ninja',    face:'🥷', rating:4.9 },
  { id:'fox',      jp:'きつね',       en:'Fox',      face:'🦊', rating:4.8 },
  { id:'princess', jp:'おひめさま',   en:'Princess', face:'👸', rating:5.0 },
  { id:'hero',     jp:'ヒーロー',     en:'Hero',     face:'🦸', rating:5.0 },
  { id:'wizard',   jp:'まほうつかい', en:'Wizard',   face:'🧙', rating:4.9 },
];
/* specials tied to particular cars — also collectible */
const SPECIAL_DRIVERS = [
  { id:'alien', jp:'エイリアン',       en:'Alien',           face:'👽', rating:5.0, special:true },
  { id:'auto',  jp:'じどう うんてん', en:'Self-driving AI', face:'🚗', rating:5.0, special:true },
];
function allDrivers(){ return DRIVERS.concat(SPECIAL_DRIVERS); }
function driverById(id){ return allDrivers().find(d=>d.id===id); }
const PLATES = ['しながわ 500 あ 12-34','せたがや 300 は 88-88','ねりま 501 の 7-77','よこはま 300 ら 21-09','なにわ 500 き 55-51','とちぎ 480 め 3-14'];

function driverFor(carId, seed){
  const car = CARS.find(c=>c.id===carId);
  if(car && car.selfDriving) return { ...SPECIAL_DRIVERS[1], plate:'AI ★ 00-00' };  // auto
  if(carId==='uchusen')      return { ...SPECIAL_DRIVERS[0], plate:'うちゅう ★★ 00-01' }; // alien
  const s = Math.abs(seed||0);
  const d = DRIVERS[s % DRIVERS.length];
  return { ...d, plate: PLATES[s % PLATES.length] };
}
/* soft background tint for the driver avatar bubble (deterministic pastel fallback) */
function driverColor(drv){
  const map = { '👨':'#cfe3ff','👩':'#ffd6e6','🧑':'#d6f0d8','👧':'#ffe1cf','🤖':'#d8dee8','👴':'#eee0cf',
    '🐱':'#ffe3c2','🐶':'#e7dcc7','🐻':'#e8d6bf','🐼':'#e6e9ee','🐧':'#cfe6f5','🦄':'#f3dcff','🎅':'#ffd4d4',
    '🥷':'#d7dbe2','🦊':'#ffdcc0','👸':'#ffd9ec','🦸':'#d6e3ff','🧙':'#e0d6f2','👽':'#dce9c9','🚗':'#d6e6f5' };
  if(drv && map[drv.face]) return map[drv.face];
  const pastels=['#ffe0ef','#e2f0ff','#e7f7d9','#fff0d6','#efe6ff','#d9f5ee'];
  const c = drv && drv.id ? drv.id.charCodeAt(0) : 0;
  return pastels[c % pastels.length];
}

/* ---- pets that ride along ---- */
const PETS = [
  { id:'dog',     jp:'いぬ',       en:'Dog',     emoji:'🐶' },
  { id:'cat',     jp:'ねこ',       en:'Cat',     emoji:'🐱' },
  { id:'rabbit',  jp:'うさぎ',     en:'Rabbit',  emoji:'🐰' },
  { id:'bear',    jp:'くま',       en:'Bear',    emoji:'🐻' },
  { id:'panda',   jp:'パンダ',     en:'Panda',   emoji:'🐼' },
  { id:'penguin', jp:'ペンギン',   en:'Penguin', emoji:'🐧' },
  { id:'dino',    jp:'きょうりゅう', en:'Dino',   emoji:'🦖' },
  { id:'unicorn', jp:'ユニコーン', en:'Unicorn', emoji:'🦄' },
  { id:'lion',    jp:'ライオン',   en:'Lion',    emoji:'🦁', premium:true },
  { id:'tiger',   jp:'トラ',       en:'Tiger',   emoji:'🐯', premium:true },
  { id:'dragon',  jp:'ドラゴン',   en:'Dragon',  emoji:'🐉', premium:true },
];
function petById(id){ return PETS.find(p=>p.id===id); }
/* premium items must be bought in the shop before they show up */
function owns(key){ return !!(PROFILE.owned && PROFILE.owned[key]); }
function availablePets(){ return PETS.filter(p=>!p.premium || owns('pet:'+p.id)); }
function availableAccessories(){ return DECOR_ACCESSORIES.filter(a=>!a.premium || owns('acc:'+a.id)); }

/* ---- taxi decorations ---- */
const DECOR_ACCESSORIES = [
  { id:'none',    jp:'なし',       en:'None',    emoji:'' },
  { id:'crown',   jp:'おうかん',   en:'Crown',   emoji:'👑' },
  { id:'flag',    jp:'はた',       en:'Flag',    emoji:'🚩' },
  { id:'balloon', jp:'ふうせん',   en:'Balloon', emoji:'🎈' },
  { id:'star',    jp:'ほし',       en:'Star',    emoji:'⭐' },
  { id:'flower',  jp:'おはな',     en:'Flower',  emoji:'🌸' },
  { id:'ribbon',  jp:'リボン',     en:'Ribbon',  emoji:'🎀' },
  { id:'sparkle', jp:'ぴかぴか',   en:'Sparkle', emoji:'✨' },
  { id:'rainbow', jp:'にじ',       en:'Rainbow', emoji:'🌈', premium:true },
  { id:'wings',   jp:'つばさ',     en:'Wings',   emoji:'🪽', premium:true },
  { id:'fire',    jp:'ファイヤー', en:'Fire',    emoji:'🔥', premium:true },
];
const DECOR_STICKERS = ['❤️','⭐','🌈','🌼','🔥','⚡','🎵','😄','🐾','⚽','🏁','💖'];
const DECOR_MAX_STICKERS = 3;

/* ---- world: time of day + weather ---- */
const WORLDS = [
  { id:'day',    jp:'ひるま',   en:'Day',    emoji:'☀️', time:'day',    weather:'none' },
  { id:'sunset', jp:'ゆうがた', en:'Sunset', emoji:'🌇', time:'sunset', weather:'none' },
  { id:'night',  jp:'よる',     en:'Night',  emoji:'🌙', time:'night',  weather:'none' },
  { id:'rain',   jp:'あめ',     en:'Rain',   emoji:'🌧️', time:'day',    weather:'rain' },
  { id:'snow',   jp:'ゆき',     en:'Snow',   emoji:'❄️', time:'day',    weather:'snow' },
];
function worldFor(id){ return WORLDS.find(w=>w.id===id) || WORLDS[0]; }
function currentWorld(){ return worldFor(PROFILE.world); }

/* ---- compliments given when rating a driver ---- */
const COMPLIMENTS = [
  { id:'fun',    jp:'たのしかった',       en:'Fun!',          emoji:'😄' },
  { id:'kind',   jp:'しんせつ',           en:'Kind',          emoji:'💛' },
  { id:'smooth', jp:'うんてん じょうず',  en:'Great driving', emoji:'👍' },
  { id:'fast',   jp:'はやい',             en:'Fast',          emoji:'⚡' },
  { id:'clean',  jp:'きれい',             en:'Clean car',     emoji:'✨' },
  { id:'cool',   jp:'かっこいい',         en:'Cool',          emoji:'😎' },
];

/* ---- missions ---- */
const MISSIONS = [
  { id:'ride3',    icon:'🚕', jp:'3かい のろう',            en:'Ride 3 times',        goal:3,             reward:50,  prog:()=>PROFILE.rides },
  { id:'places',   icon:'📍', jp:'ぜんぶの ばしょへ いこう', en:'Visit every place',  goal:DESTS.length,  reward:200, prog:()=>Object.keys(PROFILE.places).length },
  { id:'cars5',    icon:'🚗', jp:'くるまを 5だい あつめよう', en:'Collect 5 cars',    goal:5,             reward:100, prog:()=>Object.keys(PROFILE.seenCars).length },
  { id:'drivers5', icon:'🧑', jp:'ドライバー 5にんに あおう', en:'Meet 5 drivers',    goal:5,             reward:100, prog:()=>Object.keys(PROFILE.seenDrivers||{}).length },
  { id:'snack',    icon:'🍪', jp:'おやつを ちゅうもんしよう', en:'Order a snack',     goal:1,             reward:30,  prog:()=>PROFILE.snacksOrdered||0 },
  { id:'streak3',  icon:'🔥', jp:'3にち つづけて のろう',    en:'Ride 3 days in a row', goal:3,          reward:120, prog:()=>PROFILE.streak?PROFILE.streak.count:0 },
  { id:'ride10',   icon:'🏆', jp:'10かい のろう',           en:'Ride 10 times',       goal:10,            reward:150, prog:()=>PROFILE.rides },
];
function missionProgress(m){ return Math.min(m.goal, m.prog()); }
function missionDone(m){ return m.prog() >= m.goal; }

/* ---- daily streak ---- */
function todayKey(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function yesterdayKey(){ const d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function updateStreak(){
  const t=todayKey(); const s=PROFILE.streak||{count:0,last:null};
  if(s.last!==t){ s.count = (s.last===yesterdayKey()) ? (s.count+1) : 1; s.last=t; }
  PROFILE.streak=s; return s;
}

/* ---- coin shop (spend coins earned from rides & missions) ---- */
const SHOP = [
  { id:'car:goldtaxi', kind:'car', ref:'goldtaxi', jp:'ゴールドタクシー', emoji:'🚕', cost:300 },
  { id:'car:uchusen',  kind:'car', ref:'uchusen',  jp:'うちゅうせん',     emoji:'🛸', cost:250 },
  { id:'acc:rainbow',  kind:'acc', ref:'rainbow',  jp:'にじの かざり',   emoji:'🌈', cost:80  },
  { id:'acc:wings',    kind:'acc', ref:'wings',    jp:'つばさ',           emoji:'🪽', cost:120 },
  { id:'acc:fire',     kind:'acc', ref:'fire',     jp:'ファイヤー',       emoji:'🔥', cost:100 },
  { id:'pet:lion',     kind:'pet', ref:'lion',     jp:'ライオン',         emoji:'🦁', cost:90  },
  { id:'pet:tiger',    kind:'pet', ref:'tiger',    jp:'トラ',             emoji:'🐯', cost:90  },
  { id:'pet:dragon',   kind:'pet', ref:'dragon',   jp:'ドラゴン',         emoji:'🐉', cost:150 },
];
function canBuy(item){ return !owns(item.id) && PROFILE.coins>=item.cost; }
function buyItem(item){
  if(owns(item.id) || PROFILE.coins<item.cost) return false;
  PROFILE.coins-=item.cost; PROFILE.owned=PROFILE.owned||{}; PROFILE.owned[item.id]=true; saveProfile(); return true;
}

/* ---- in-car music (melodies live in sound.js, keyed by id) ---- */
const MUSIC = [
  { id:'none',    jp:'なし',       emoji:'🔇' },
  { id:'happy',   jp:'ハッピー',   emoji:'🎵' },
  { id:'drive',   jp:'ドライブ',   emoji:'🎶' },
  { id:'lullaby', jp:'ゆったり',   emoji:'🌙' },
];

/* ---- engine / vehicle sound chosen per car (played in sound.js) ---- */
function engineSound(car){
  if(!car) return 'engine';
  const k=car.art&&car.art.kind;
  if(car.id==='uchusen') return 'warp';
  if(car.sound==='siren') return 'siren';
  if(k==='sport') return 'vroom';
  if(k==='shinkansen') return 'whoosh';
  if(k==='train') return 'traintoot';
  if(k==='bus') return 'bushorn';
  if(k==='robotaxi') return 'robo';
  return 'engine';
}

/* ---- achievements (badge wall) ---- */
const ACHIEVEMENTS = [
  { id:'first',     icon:'🚕', jp:'はじめての ドライブ', en:'First ride',      cond:()=>PROFILE.rides>=1 },
  { id:'rides5',    icon:'⭐', jp:'5かい のった',        en:'5 rides',         cond:()=>PROFILE.rides>=5 },
  { id:'rides20',   icon:'👑', jp:'20かい のった',       en:'20 rides',        cond:()=>PROFILE.rides>=20 },
  { id:'cars10',    icon:'🚗', jp:'くるま 10だい',       en:'10 cars',         cond:()=>Object.keys(PROFILE.seenCars).length>=10 },
  { id:'carsall',   icon:'🏆', jp:'くるま ぜんぶ',       en:'All cars',        cond:()=>Object.keys(PROFILE.seenCars).length>=CARS.length },
  { id:'placesall', icon:'🗺️', jp:'ばしょ ぜんぶ',       en:'All places',      cond:()=>Object.keys(PROFILE.places).length>=DESTS.length },
  { id:'drivers10', icon:'🧑', jp:'ドライバー 10にん',   en:'10 drivers',      cond:()=>Object.keys(PROFILE.seenDrivers).length>=10 },
  { id:'coins500',  icon:'🪙', jp:'コイン 500 ためた',   en:'500 coins',       cond:()=>(PROFILE.coinsEver||0)>=500 },
  { id:'streak7',   icon:'🔥', jp:'7にち れんぞく',      en:'7-day streak',    cond:()=>(PROFILE.streak&&PROFILE.streak.count>=7) },
  { id:'space',     icon:'🛰️', jp:'うちゅうへ いった',   en:'To space',        cond:()=>!!PROFILE.places.space },
  { id:'driver',    icon:'🎓', jp:'うんてんしゅに なった', en:'Became a driver', cond:()=>(PROFILE.drives||0)>=1 },
  { id:'wash',      icon:'🫧', jp:'せんしゃ した',        en:'Washed a car',    cond:()=>(PROFILE.washes||0)>=1 },
];
function achievementDone(a){ try{ return !!a.cond(); }catch(e){ return false; } }

/* ---- passengers for driver mode (Haru is the driver) ---- */
const PASSENGERS = [
  { emoji:'🧑', jp:'おにいさん' }, { emoji:'👩', jp:'おねえさん' }, { emoji:'👦', jp:'おとこのこ' },
  { emoji:'👧', jp:'おんなのこ' }, { emoji:'👴', jp:'おじいちゃん' }, { emoji:'🐱', jp:'ねこさん' },
  { emoji:'🐶', jp:'いぬさん' }, { emoji:'🎅', jp:'サンタさん' }, { emoji:'👽', jp:'うちゅうじん' },
];
/* ---- friends you can pick up on the way ---- */
const FRIENDS = [
  { id:'none',  jp:'ひとりで', emoji:'🚫' },
  { id:'kohei', jp:'こうへいくん', emoji:'👦' },
  { id:'yuka',  jp:'ゆかちゃん',   emoji:'👧' },
  { id:'baby',  jp:'あかちゃん',   emoji:'👶' },
  { id:'mama',  jp:'ママ',         emoji:'👩' },
];
function friendById(id){ return FRIENDS.find(f=>f.id===id); }

/* Player profile — accumulates during the session and (in Claude Code / a real
   project) is saved to localStorage so it survives a refresh. */
const PROFILE_DEFAULT = () => ({
  name: CONFIG.name, nameEn: CONFIG.nameEn, age: CONFIG.age,
  rides:0, points:0, coins:0, coinsEver:0, drives:0, washes:0,
  places:{}, carCounts:{}, seenCars:{},
  seenDrivers:{}, driverCounts:{}, driverStars:{},
  decor:{ accessory:'none', stickers:[] }, world:'day', lastPet:'',
  streak:{ count:0, last:null }, missionsDone:{}, snacksOrdered:0,
  owned:{}, music:'none', readAloud:true
});
const PROFILE = PROFILE_DEFAULT();
/* add coins AND track lifetime total (for the coin achievement) */
function earnCoins(n){ PROFILE.coins+=n; PROFILE.coinsEver=(PROFILE.coinsEver||0)+n; }

/* ---- persistence (localStorage; silently no-ops where storage is blocked) ---- */
const SAVE_KEYS = ['name','nameEn','age','rides','points','coins','coinsEver','drives','washes',
  'places','carCounts','seenCars','seenDrivers','driverCounts','driverStars','decor','world','lastPet',
  'streak','missionsDone','snacksOrdered','owned','music','readAloud'];
function loadProfile(){
  try{
    const raw = localStorage.getItem(CONFIG.storeKey);
    if(!raw) return;
    const saved = JSON.parse(raw);
    const def = PROFILE_DEFAULT();
    SAVE_KEYS.forEach(k=>{ PROFILE[k] = (saved[k]!==undefined) ? saved[k] : def[k]; });
    if(!PROFILE.decor) PROFILE.decor={ accessory:'none', stickers:[] };
    if(!PROFILE.streak) PROFILE.streak={ count:0, last:null };
    if(!PROFILE.owned) PROFILE.owned={};
  }catch(e){ /* storage unavailable — run in-memory only */ }
}
function saveProfile(){
  try{
    const out={}; SAVE_KEYS.forEach(k=>out[k]=PROFILE[k]);
    localStorage.setItem(CONFIG.storeKey, JSON.stringify(out));
  }catch(e){ /* ignore */ }
}
function resetProfile(){ Object.assign(PROFILE, PROFILE_DEFAULT()); saveProfile(); }

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
