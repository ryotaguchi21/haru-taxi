/* ============================================================
   art.js — every picture in the app is inline SVG built here
   ============================================================ */

/* ---- shared car parts ----
   wheels(rim): 'sport' = 5-spoke alloy, 'steel' = taxi/work hubcap, default = simple.
   Each wheel is wrapped in <g class="wheel"> so CSS can spin it while driving. */
function wheels(rim){ const cy=124,r=22,hub=11;
  function rimArt(cx){
    if(rim==='sport'){ let s=''; for(let i=0;i<5;i++){ const a=i*72*Math.PI/180; s+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*(hub-1)).toFixed(1)}" y2="${(cy+Math.sin(a)*(hub-1)).toFixed(1)}" stroke="#6b7688" stroke-width="3.4" stroke-linecap="round"/>`; }
      return `<circle cx="${cx}" cy="${cy}" r="${hub}" fill="#e6ebf2"/>${s}<circle cx="${cx}" cy="${cy}" r="3.4" fill="#8b96a8"/>`; }
    if(rim==='steel'){ let s=''; for(let i=0;i<4;i++){ const a=i*90*Math.PI/180; s+=`<circle cx="${(cx+Math.cos(a)*6).toFixed(1)}" cy="${(cy+Math.sin(a)*6).toFixed(1)}" r="1.6" fill="#9aa4b3"/>`; }
      return `<circle cx="${cx}" cy="${cy}" r="${hub}" fill="#c3ccd8"/>${s}<circle cx="${cx}" cy="${cy}" r="3.4" fill="#8b96a8"/>`; }
    // default: two spokes so rotation is still visible
    return `<circle cx="${cx}" cy="${cy}" r="${hub}" fill="#cfd7e2"/><rect x="${cx-1.6}" y="${cy-hub}" width="3.2" height="${hub*2}" rx="1.6" fill="#a9b3c1"/><rect x="${cx-hub}" y="${cy-1.6}" width="${hub*2}" height="3.2" rx="1.6" fill="#a9b3c1"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="#8b96a8"/>`;
  }
  const w=(cx)=>`<g class="wheel"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2f3a"/>${rimArt(cx)}</g>`;
  return `<g class="wheels">${w(64)}${w(158)}</g>`; }
/* trains ride on small steel bogie wheels, not car tyres */
function railWheels(){ const cy=135,r=8.5;
  const w=(cx)=>`<g class="wheel"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#4a505c"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="#aab3c1"/><rect x="${cx-1.2}" y="${cy-r+1}" width="2.4" height="${2*r-2}" rx="1.2" fill="#8b96a8"/></g>`;
  return `<g class="wheels"><rect x="24" y="124" width="46" height="8" rx="3" fill="#3a3f4a"/><rect x="142" y="124" width="46" height="8" rx="3" fill="#3a3f4a"/>${w(34)}${w(60)}${w(152)}${w(178)}</g>`; }
/* darken (amt<0) / lighten (amt>0) a #rrggbb colour */
function shade(hex, amt){ const n=parseInt(String(hex).replace('#',''),16); if(isNaN(n)) return hex;
  const f=c=>Math.max(0,Math.min(255,Math.round(c+(amt<0?c*amt:(255-c)*amt))));
  const r=f(n>>16&255), g=f(n>>8&255), b=f(n&255); return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1); }
function face(ex,ey,gap){ gap=gap||22;
  const e=(x)=>`<circle cx="${x}" cy="${ey}" r="10.5" fill="#fff"/><circle cx="${x+2}" cy="${ey+2}" r="5.4" fill="#2b2f3a"/><circle cx="${x+4}" cy="${ey-1}" r="1.9" fill="#fff"/>`;
  return `<g>${e(ex-gap/2)}${e(ex+gap/2)}</g>`; }
function smileCheeks(cx,cy){ return `<path d="M ${cx-13} ${cy} Q ${cx} ${cy+11} ${cx+13} ${cy}" stroke="#2b2f3a" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="${cx-22}" cy="${cy+1}" r="5" fill="#ff9bb0" opacity=".75"/><circle cx="${cx+22}" cy="${cy+1}" r="5" fill="#ff9bb0" opacity=".75"/>`; }
function lowerBody(color,stroke){ return `<rect x="14" y="84" width="192" height="40" rx="20" fill="${color}" stroke="${stroke||'rgba(0,0,0,.06)'}" stroke-width="2"/><rect x="188" y="92" width="14" height="12" rx="5" fill="#fff4c2"/><rect x="18" y="96" width="8" height="9" rx="4" fill="#ff6a6a"/>`; }
function cabinSedan(c,s){ return `<rect x="56" y="52" width="104" height="40" rx="16" fill="${c}" stroke="${s||'rgba(0,0,0,.06)'}" stroke-width="2"/><rect x="66" y="58" width="86" height="26" rx="9" fill="#bfe9ff"/>`; }
function cabinVan(c,s){ return `<rect x="48" y="34" width="122" height="58" rx="15" fill="${c}" stroke="${s||'rgba(0,0,0,.06)'}" stroke-width="2"/><rect x="58" y="42" width="104" height="34" rx="10" fill="#bfe9ff"/>`; }
function cabinSleek(c,s){ return `<path d="M 46 90 Q 60 56 108 54 Q 150 54 172 90 Z" fill="${c}" stroke="${s||'rgba(0,0,0,.06)'}" stroke-width="2"/><path d="M 66 82 Q 78 64 108 63 Q 140 64 152 82 Z" fill="#bfe9ff"/>`; }
function cabinSport(c,s){ return `<path d="M 44 92 Q 62 62 108 60 Q 156 62 176 92 Z" fill="${c}" stroke="${s||'rgba(0,0,0,.06)'}" stroke-width="2"/><path d="M 64 84 Q 78 68 108 67 Q 140 68 150 84 Z" fill="#bfe9ff"/>`; }
function spoiler(color){ return `<rect x="18" y="74" width="20" height="6" rx="2" fill="${color}"/><rect x="20" y="76" width="4" height="12" fill="${color}"/><rect x="32" y="76" width="4" height="12" fill="${color}"/>`; }
function emblem(cx,cy,color){ return `<circle cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="${color}" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="3" fill="${color}"/>`; }

/* ---- spaceship (no wheels, floats) ---- */
function spaceshipInner(){
  let s=`<ellipse cx="110" cy="142" rx="66" ry="8" fill="rgba(0,0,0,.10)"/><g class="body">`;
  s+=`<ellipse cx="110" cy="130" rx="30" ry="10" fill="#ffd36e" opacity=".65"/>`;              // thruster glow
  s+=`<ellipse cx="110" cy="104" rx="86" ry="24" fill="#c3cad6"/>`;                             // saucer underside
  s+=`<ellipse cx="110" cy="98"  rx="86" ry="20" fill="#e6ebf3"/>`;                             // saucer top
  const lc=['#ff5a4d','#ffd400','#4fc06a','#3d8bff','#c07bff','#ffd400','#ff5a4d'];
  for(let i=0;i<7;i++){ s+=`<circle cx="${40+i*23}" cy="106" r="5" fill="${lc[i]}"/>`; }         // rim lights
  s+=`<path d="M 62 96 Q 68 50 110 48 Q 152 50 158 96 Z" fill="#bfe9ff" stroke="#e6ebf3" stroke-width="4"/>`; // dome
  s+=`<path d="M 76 90 Q 84 60 110 58 Q 136 60 144 90 Z" fill="#d8f2ff" opacity=".7"/>`;
  s+=face(110,80,24);
  s+=`<path d="M 98 96 Q 110 106 122 96" stroke="#2b2f3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  s+=`<circle cx="88" cy="90" r="5" fill="#ff9bb0" opacity=".7"/><circle cx="132" cy="90" r="5" fill="#ff9bb0" opacity=".7"/>`;
  s+=`<line x1="110" y1="48" x2="110" y2="33" stroke="#9aa3b2" stroke-width="3"/><circle cx="110" cy="31" r="5" fill="#ff5a4d"/>`; // antenna
  s+=`</g>`; return s;
}

/* ---- main car builder (data-driven via CARS[].art) ---- */
/* carInner() returns just the drawing (shadow + body group) so it can be dropped
   into any <svg> (e.g. nested inside the map). carSVG() wraps it in a full <svg>.
   opts: { decor:true (apply PROFILE.decor), pet:'<petId or emoji>' } */
function carSVG(id, opts){
  opts = opts || {};
  let extra = '';
  if(opts.door) extra += doorInner(id);
  if(opts.decor) extra += decorInner(PROFILE.decor);
  if(opts.pet){ const p = petById(opts.pet); extra += petInner(p ? p.emoji : opts.pet); }
  return `<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${carInner(id)}${extra}</svg>`;
}
/* the body colour a car is drawn in (respray > data colour > kind default) */
const KIND_COLOR = { taxi:'#ffc531', 'sedan-taxi':'#2f333d', benz:'#d3d8e0', tesla:'#f4f6f9', robotaxi:'#e3e9f2',
  police:'#ffffff', ambulance:'#ffffff', firetruck:'#e8362b', bus:'#31a3d8', train:'#e9edf2', shinkansen:'#f4f6f9',
  ferrari:'#ff2a1a', porsche:'#d4d8de', lambo:'#f0c800', muscle:'#8b3fd6', gtr:'#1f6fd8', alphard:'#26292f',
  van:'#26292f', dump:'#ffb020', spaceship:'#c3cad6', mazda:'#c8102e', volvo:'#2e4c6d', toyota:'#0aa5b5' };
function carBodyColor(car){ if(!car) return '#ffc531'; const a=car.art||{};
  return (canPaint(car) && paintFor(car.id)) || a.body || KIND_COLOR[a.kind] || '#ffc531'; }
/* boarding door: an "open" door panel that swings shut and disappears into the car (ride start) */
function doorInner(id){
  const car=CARS.find(c=>c.id===id); const k=car&&car.art?car.art.kind:'taxi';
  if(['spaceship','train','shinkansen'].indexOf(k)>=0) return '';
  const col=carBodyColor(car);
  return `<g class="door"><path d="M 72 62 L 110 60 L 112 116 L 74 120 Z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`
    + `<path d="M 78 66 L 106 65 L 106 84 L 79 86 Z" fill="#bfe9ff"/><rect x="98" y="92" width="9" height="3.5" rx="1.7" fill="rgba(0,0,0,.35)"/></g>`;
}
/* a plain sedan in any body colour (used by the colour-learning game) */
function coloredCarSVG(body){
  let s=`<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
  s+=`<ellipse cx="110" cy="142" rx="90" ry="9" fill="rgba(0,0,0,.10)"/>`+wheels()+`<g class="body">`;
  s+=lowerBody(body)+cabinSedan(body)+face(122,70)+smileCheeks(150,100)+`</g></svg>`;
  return s;
}
/* decorations: an accessory on the roof + up to 3 stickers on the body */
function decorInner(decor){
  if(!decor) return '';
  let s='';
  const acc = DECOR_ACCESSORIES.find(a=>a.id===decor.accessory);
  if(acc && acc.emoji) s += `<text x="110" y="40" font-size="26" text-anchor="middle">${acc.emoji}</text>`;
  const slots=[[70,116],[92,116],[114,116]];
  (decor.stickers||[]).slice(0,3).forEach((em,i)=>{ const [x,y]=slots[i]; s+=`<text x="${x}" y="${y}" font-size="16" text-anchor="middle">${em}</text>`; });
  return s;
}
/* a pet peeking out of the window */
function petInner(emoji){ return emoji ? `<text x="150" y="80" font-size="22" text-anchor="middle">${emoji}</text>` : ''; }

function carInner(id){
  const car = CARS.find(c=>c.id===id); const a0 = car ? car.art : {kind:'taxi'};
  if(a0.kind==='spaceship') return spaceshipInner();
  // a showroom respray replaces the body colour (never on police/ambulance/taxis/trains)
  const pb = (car && canPaint(car)) ? paintFor(id) : null;
  const a = pb ? Object.assign({}, a0, {body:pb}) : a0;

  const sportKinds=['sport','ferrari','porsche','lambo','muscle','gtr','tesla','benz','robotaxi','mazda','volvo'];
  const steelKinds=['taxi','police','ambulance','bus','dump','firetruck'];
  const rim = sportKinds.indexOf(a.kind)>=0?'sport':(steelKinds.indexOf(a.kind)>=0?'steel':undefined);
  const onRail = (a.kind==='train' || a.kind==='shinkansen');
  // wheels sit OUTSIDE the .body group: the body can rock on its springs while the tyres stay on the road
  let s=`<ellipse cx="110" cy="142" rx="${onRail?102:90}" ry="9" fill="rgba(0,0,0,.10)"/>`+(onRail?railWheels():wheels(rim))+`<g class="body">`;

  switch(a.kind){
    case 'taxi': {
      const body=a.body||'#ffc531', em=a.emblem;
      s+=lowerBody(body);
      let ch=''; for(let i=0;i<11;i++){ ch+=`<rect x="${20+i*16}" y="108" width="16" height="9" fill="${i%2?'#2b2f3a':'#fff'}"/>`; }
      s+=`<clipPath id="cb_${id}"><rect x="14" y="84" width="192" height="40" rx="20"/></clipPath><g clip-path="url(#cb_${id})">${ch}</g>`;
      s+=cabinSedan(body);
      // roof lamp (行灯) up top + JPN fender mirror
      s+=`<rect x="94" y="39" width="44" height="15" rx="5" fill="#fff" stroke="${em||'#e5a712'}" stroke-width="2"/><text x="116" y="50" font-family="Fredoka,sans-serif" font-size="9" font-weight="700" fill="${em?'#8a6a00':'#e5941c'}" text-anchor="middle">TAXI</text>`; // sits ON the roof
      s+=`<rect x="48" y="70" width="5" height="11" rx="2" fill="#2b2f3a"/>`;
      s+=`<rect x="188" y="94" width="12" height="8" rx="3" fill="#fff4c2"/>`;
      s+=face(122,70)+smileCheeks(150,100); break;
    }
    case 'sedan-taxi': {
      s+=lowerBody('#2f333d')+cabinSedan('#2f333d');
      s+=`<rect x="98" y="38" width="40" height="16" rx="4" fill="#ffe45e" stroke="#e5a712" stroke-width="2"/><text x="118" y="50" font-family="Fredoka,sans-serif" font-size="9.5" font-weight="700" fill="#8a6a00" text-anchor="middle">TAXI</text>`;
      s+=`<rect x="70" y="98" width="26" height="12" rx="3" fill="#2fd06a"/>`+face(122,70)+smileCheeks(150,100); break;
    }
    case 'sport': {
      const st=a.stroke; s+=lowerBody(a.body,st)+spoiler(a.emblem)+cabinSport(a.body,st)+emblem(100,104,a.emblem)+face(108,76,20)+smileCheeks(150,102); break;
    }
    case 'sedan': {
      s+=lowerBody(a.body)+cabinSedan(a.body)+emblem(100,104,a.emblem||'#fff')+face(122,70)+smileCheeks(150,100); break;
    }
    case 'benz': {
      // S-Class-style three-box saloon: long bonnet, set-back cabin, separate boot, chrome
      // beltline, and the stand-up three-pointed star on the bonnet (the Benz tell)
      const b=a.body||'#d3d8e0', st=shade(b,-0.18);
      s+=`<path d="M 12 114 L 12 98 Q 14 88 30 87 L 196 86 Q 209 88 209 100 L 209 114 Q 209 122 200 122 L 20 122 Q 12 122 12 114 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
      s+=`<path d="M 48 88 L 76 60 Q 82 54 94 54 L 134 54 Q 145 54 153 62 L 178 88 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
      s+=`<path d="M 60 86 L 81 64 Q 85 59 93 59 L 111 59 L 111 86 Z" fill="#bfe9ff"/><path d="M 116 59 L 134 59 Q 142 59 148 66 L 167 86 L 116 86 Z" fill="#bfe9ff"/>`;
      s+=`<line x1="46" y1="91" x2="180" y2="91" stroke="#f4f6f9" stroke-width="2.4"/>`;                      // chrome beltline
      s+=`<path d="M 199 92 L 209 93 L 209 110 L 201 111 Z" fill="#eef1f6" stroke="#9aa4b3" stroke-width="1.4"/>`; // chrome grille
      s+=`<g stroke="#9aa4b3" stroke-width="1">${[0,1,2].map(i=>`<line x1="${202+i*2.5}" y1="94" x2="${202+i*2.5}" y2="109"/>`).join('')}</g>`;
      s+=`<path d="M 188 90 L 200 91 L 199 96 L 190 95 Z" fill="#fff4c2"/>`;                                   // slim headlight
      s+=`<path d="M 13 95 L 26 94 L 26 101 L 13 102 Z" fill="#c40000"/>`;                                     // tail-light
      s+=`<line x1="190" y1="86" x2="190" y2="79" stroke="#9aa4b3" stroke-width="2"/>`;
      s+=`<g transform="translate(190,72)"><circle r="7.5" fill="#fff" stroke="#8b96a8" stroke-width="2"/><g stroke="#3a3f4a" stroke-width="2" stroke-linecap="round"><line x1="0" y1="0" x2="0" y2="-6"/><line x1="0" y1="0" x2="5.2" y2="3"/><line x1="0" y1="0" x2="-5.2" y2="3"/></g></g>`; // hood star
      s+=face(124,72,22)+smileCheeks(150,104); break;
    }
    case 'tesla': {
      // Model 3/Y-style fastback: ONE smooth arc from nose to tail, no grille, flush handles,
      // swept headlight, full-width thin tail-light, T badge
      const b=a.body||'#f4f6f9', st=shade(b,-0.14);
      s+=`<path d="M 12 114 L 12 100 Q 16 90 32 87 Q 60 52 110 50 Q 150 50 178 80 L 198 86 Q 210 90 210 104 L 210 114 Q 210 122 201 122 L 20 122 Q 12 122 12 114 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
      s+=`<path d="M 56 84 Q 74 60 109 58 L 109 84 Z" fill="#bfe9ff"/><path d="M 114 58 Q 146 59 166 82 L 114 84 Z" fill="#bfe9ff"/>`;
      s+=`<path d="M 40 80 Q 66 55 110 54 Q 148 54 172 78" stroke="#2a3444" stroke-width="3" fill="none" opacity=".55"/>`; // glass roof edge
      s+=`<rect x="92" y="92" width="12" height="3" rx="1.5" fill="${st}"/><rect x="146" y="92" width="12" height="3" rx="1.5" fill="${st}"/>`; // flush handles
      s+=`<path d="M 190 88 Q 202 89 208 94 L 199 95 Z" fill="#eaf6ff" stroke="#9fb6cc" stroke-width="1"/>`;   // swept headlight
      s+=`<path d="M 12 96 L 34 93 L 34 97 L 12 100 Z" fill="#e8362b"/>`;                                     // thin tail-light
      s+=`<text x="203" y="108" font-family="Fredoka,sans-serif" font-size="9" font-weight="700" fill="#c8102e" text-anchor="middle">T</text>`;
      s+=`<circle cx="22" cy="106" r="3.5" fill="#7cf3ff"/>`;                                                   // charge-port glow
      s+=face(112,72,22)+smileCheeks(150,104); break;
    }
    case 'mazda': {
      // MX-5 Roadster: tiny open two-seater, long nose, windscreen frame, roll hoops, no roof
      const b=a.body||'#c8102e', st=shade(b,-0.2);
      s+=`<path d="M 16 114 L 16 100 Q 18 90 34 88 L 150 86 Q 180 86 198 94 Q 209 99 209 108 L 209 114 Q 209 122 200 122 L 24 122 Q 16 122 16 114 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
      s+=`<path d="M 64 88 Q 66 72 78 70 Q 88 72 90 88 Z" fill="#2b2f3a"/><path d="M 92 88 Q 94 72 106 70 Q 116 72 118 88 Z" fill="#2b2f3a"/>`; // roll hoops / headrests
      s+=`<path d="M 128 88 L 116 62 L 121 61 L 136 88 Z" fill="#bfe9ff" stroke="#2b2f3a" stroke-width="2.2" stroke-linejoin="round"/>`; // windscreen
      s+=`<path d="M 186 91 Q 198 92 205 98 L 193 99 Z" fill="#fff4c2"/>`;
      s+=`<ellipse cx="20" cy="99" rx="4" ry="3" fill="#c40000"/>`;
      s+=`<path d="M 196 104 q 5 -4 10 0" stroke="#e6ebf2" stroke-width="1.8" fill="none"/>`;                  // wing badge
      s+=face(128,102,20)+smileCheeks(170,108); break;
    }
    case 'volvo': {
      // XC90-style SUV: tall and boxy, roof rails, vertical tail-lights up the back pillar,
      // "Thor's hammer" T headlight and the diagonal iron-mark badge
      const b=a.body||'#2e4c6d', st=shade(b,-0.2);
      s+=`<path d="M 12 114 L 12 50 Q 13 38 28 38 L 138 37 Q 150 37 158 47 L 176 72 L 198 78 Q 209 82 209 94 L 209 114 Q 209 122 200 122 L 20 122 Q 12 122 12 114 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
      s+=`<g fill="#bfe9ff"><rect x="22" y="45" width="38" height="28" rx="4"/><rect x="66" y="45" width="42" height="28" rx="4"/><path d="M 114 45 L 146 45 Q 152 45 156 51 L 170 73 L 114 73 Z"/></g>`;
      s+=`<line x1="30" y1="33" x2="140" y2="33" stroke="#1d2129" stroke-width="3" stroke-linecap="round"/>`;   // roof rails
      s+=`<g stroke="#1d2129" stroke-width="2"><line x1="40" y1="33" x2="40" y2="37"/><line x1="130" y1="33" x2="130" y2="37"/></g>`;
      s+=`<rect x="12" y="48" width="6" height="42" rx="3" fill="#d6231e"/>`;                                   // tall tail-light
      s+=`<path d="M 190 80 L 206 84 L 206 94 L 190 92 Z" fill="#fff4c2"/><g stroke="#f7f7f7" stroke-width="2"><line x1="193" y1="86" x2="204" y2="88"/><line x1="198" y1="86" x2="198" y2="92"/></g>`; // Thor's hammer
      s+=`<circle cx="203" cy="104" r="4.5" fill="none" stroke="#dfe4ea" stroke-width="1.8"/><line x1="199" y1="108" x2="207" y2="100" stroke="#dfe4ea" stroke-width="1.8"/>`; // iron mark
      s+=face(136,58,22)+smileCheeks(150,102); break;
    }
    case 'toyota': {
      // compact hatch (Aqua/Yaris-like): short stubby body, tall rounded roof, black roof two-tone,
      // Toyota oval badge on the nose
      const b=a.body||'#0aa5b5', st=shade(b,-0.2);
      s+=`<path d="M 28 114 L 28 72 Q 28 50 50 48 L 120 46 Q 136 46 146 58 L 164 80 L 186 84 Q 198 88 198 100 L 198 114 Q 198 122 190 122 L 36 122 Q 28 122 28 114 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
      s+=`<path d="M 36 56 Q 40 47 52 46 L 120 45 Q 134 45 142 54" stroke="#1d2129" stroke-width="5" fill="none" stroke-linecap="round"/>`; // black roof
      s+=`<g fill="#bfe9ff"><path d="M 38 76 L 40 60 Q 42 54 50 54 L 84 53 L 84 76 Z"/><path d="M 89 53 L 128 52 Q 136 52 142 60 L 156 78 L 89 78 Z"/></g>`;
      s+=`<path d="M 176 84 L 194 88 L 192 94 L 178 92 Z" fill="#fff4c2"/><rect x="29" y="80" width="6" height="14" rx="3" fill="#c40000"/>`;
      s+=`<g transform="translate(192,104)" fill="none" stroke="#eef1f6" stroke-width="1.5"><ellipse rx="5.6" ry="3.8"/><ellipse rx="2" ry="3.8"/><ellipse cy="-1.4" rx="5" ry="1.6"/></g>`;
      s+=face(114,66,22)+smileCheeks(140,102); break;
    }
    case 'robotaxi': {
      const rb=a.body||'#e3e9f2';
      s+=lowerBody(rb,'#cfd6e0')+cabinSleek(rb,'#cfd6e0');
      s+=`<rect x="186" y="92" width="12" height="10" rx="4" fill="#28d07a"/>`;               // "go" light
      s+=`<g class="lidar" transform="translate(108,50)"><rect x="-11" y="-1" width="22" height="8" rx="3" fill="#2b2f3a"/><circle cx="0" cy="-6" r="7.5" fill="#3a4150"/><circle cx="0" cy="-6" r="3.4" fill="#7cf3ff"/></g>`; // rooftop sensor
      s+=`<rect x="150" y="66" width="20" height="12" rx="3" fill="#1e2634"/><rect x="153" y="69" width="14" height="6" rx="2" fill="#7cf3ff" opacity=".85"/>`; // screen
      s+=face(104,76,20)+smileCheeks(148,102); break;
    }
    case 'van': {
      s+=lowerBody(a.body||'#26292f')+cabinVan(a.body||'#26292f');
      s+=`<rect x="176" y="94" width="6" height="22" rx="2" fill="#c9cfd8"/><rect x="184" y="94" width="6" height="22" rx="2" fill="#c9cfd8"/>`+face(128,58,24)+smileCheeks(150,102); break;
    }
    case 'police': {
      s+=lowerBody('#ffffff','#d7dde6');
      s+=`<clipPath id="pb_${id}"><rect x="14" y="84" width="192" height="40" rx="20"/></clipPath><g clip-path="url(#pb_${id})"><rect x="14" y="106" width="192" height="18" fill="#1d2129"/></g>`;
      s+=cabinSedan('#ffffff','#d7dde6');
      s+=`<rect x="92" y="40" width="24" height="12" rx="4" fill="#ff3b30"/><rect x="116" y="40" width="24" height="12" rx="4" fill="#2f6bff"/>`+face(122,70)+smileCheeks(150,98); break;
    }
    case 'ambulance': {
      s+=lowerBody('#ffffff','#d7dde6')+cabinVan('#ffffff','#d7dde6');
      s+=`<rect x="14" y="100" width="192" height="9" fill="#ff4b3e"/>`;
      s+=`<g transform="translate(150,102)"><rect x="-4" y="-11" width="8" height="22" rx="2" fill="#ff3b30"/><rect x="-11" y="-4" width="22" height="8" rx="2" fill="#ff3b30"/></g>`;
      s+=`<rect x="100" y="24" width="22" height="11" rx="5" fill="#ff3b30"/>`+face(128,58,24)+smileCheeks(112,102); break;
    }
    case 'bus': {
      const b=a.body||'#31a3d8';
      s+=lowerBody(b);
      s+=`<rect x="18" y="44" width="184" height="48" rx="14" fill="${b}"/>`;
      s+=`<g fill="#bfe9ff">${[0,1,2,3].map(i=>`<rect x="${30+i*42}" y="52" width="32" height="24" rx="4"/>`).join('')}</g>`;
      s+=`<rect x="18" y="96" width="188" height="6" fill="#ffd84d"/>`;
      s+=`<rect x="188" y="60" width="8" height="12" rx="2" fill="#fff4c2"/>`;
      s+=face(172,64,18)+smileCheeks(166,92); break;   // face on the front pane (headlight side)
    }
    case 'train': {
      // commuter EMU (Yamanote-style): long silver box on bogies, coloured stripe, 3 doors,
      // pantograph on the roof, flat cab front with the face in the cab window
      const b=a.body||'#3aae5a';
      s+=`<rect x="6" y="46" width="208" height="80" rx="10" fill="#e9edf2" stroke="#cfd6e0" stroke-width="2"/>`;
      s+=`<g stroke="#5a6272" stroke-width="2.4" fill="none"><path d="M 96 46 L 106 30 L 116 46"/><line x1="92" y1="30" x2="120" y2="30"/></g>`; // pantograph
      s+=`<rect x="6" y="54" width="208" height="5" fill="${b}"/><rect x="6" y="94" width="208" height="9" fill="${b}"/>`;
      s+=`<g fill="#bfe9ff">${[0,1,2].map(i=>`<rect x="${16+i*52}" y="64" width="26" height="22" rx="4"/>`).join('')}</g>`;
      s+=`<g fill="#d7dde6" stroke="#aab3c1" stroke-width="1.4">${[0,1,2].map(i=>`<rect x="${46+i*52}" y="62" width="16" height="56" rx="2"/>`).join('')}</g>`; // doors
      s+=`<g fill="#bfe9ff">${[0,1,2].map(i=>`<rect x="${48.5+i*52}" y="66" width="11" height="18" rx="2"/>`).join('')}</g>`;
      s+=`<rect x="176" y="62" width="32" height="28" rx="5" fill="#bfe9ff"/>`;                                   // cab window
      s+=`<rect x="206" y="104" width="6" height="8" rx="2" fill="#fff4c2"/>`;
      s+=face(192,76,15)+smileCheeks(190,108); break;
    }
    case 'shinkansen': {
      // N700-style: very long, very low, with a long duck-bill nose, blue stripe and many small windows
      const b=a.body||'#f4f6f9';
      s+=`<path d="M 4 126 L 4 80 Q 4 66 18 66 L 132 66 Q 176 68 206 104 Q 216 116 208 126 Z" fill="${b}" stroke="#cfd6e0" stroke-width="2"/>`;
      s+=`<path d="M 140 70 Q 164 72 182 86 L 158 86 Z" fill="#1d2a44"/>`;                                         // cockpit
      s+=`<path d="M 4 112 L 202 112 Q 206 115 207 118 L 4 118 Z" fill="#2f6fd8"/><rect x="4" y="120" width="200" height="2" fill="#2f6fd8"/>`;
      s+=`<g fill="#9fd3f2">${[0,1,2,3,4,5,6].map(i=>`<rect x="${14+i*16}" y="76" width="10" height="9" rx="2.5"/>`).join('')}</g>`;
      s+=`<rect x="126" y="74" width="10" height="30" rx="2" fill="none" stroke="#b7c0cc" stroke-width="1.6"/>`;   // door
      s+=`<path d="M 196 104 Q 204 108 207 112 L 199 111 Z" fill="#fff4c2"/>`;
      s+=face(170,93,18)+smileCheeks(172,104); break;   // face on the long nose, not the tail
    }
    case 'firetruck': {
      s+=lowerBody('#e8362b');
      s+=cabinVan('#e8362b');
      s+=`<rect x="26" y="62" width="96" height="16" rx="4" fill="#c02318"/>`;
      s+=`<rect x="34" y="42" width="120" height="6" rx="3" fill="#c9cfd8" transform="rotate(-7 34 42)"/>`;
      s+=`<rect x="92" y="24" width="24" height="11" rx="5" fill="#ff3b30"/>`;
      s+=`<circle cx="150" cy="70" r="7" fill="#fff" stroke="#c9cfd8" stroke-width="2"/>`;
      s+=face(128,58,24)+smileCheeks(132,100); break;   // smile under the eyes
    }
    case 'dump': {
      const b=a.body||'#ffb020';
      s+=lowerBody('#4a4f57');
      s+=`<path d="M 22 86 L 128 86 L 138 52 L 40 52 Z" fill="${b}" stroke="#d99400" stroke-width="2"/>`;
      s+=`<rect x="44" y="58" width="82" height="22" fill="#c98a10" opacity=".45"/>`;
      s+=`<path d="M 150 86 L 150 58 Q 150 52 158 52 L 178 52 L 196 76 L 196 86 Z" fill="${b}" stroke="#d99400" stroke-width="2"/>`;
      s+=`<rect x="160" y="60" width="18" height="14" rx="3" fill="#bfe9ff"/>`;
      s+=face(176,72,16)+smileCheeks(168,98); break;
    }
    case 'ferrari': {
      const b=a.body||'#ff2a1a';
      s+=`<path d="M 16 110 L 28 92 Q 58 80 108 78 Q 150 78 182 88 L 202 100 Q 206 110 198 114 L 22 114 Q 14 112 16 110 Z" fill="${b}" stroke="rgba(0,0,0,.08)" stroke-width="2"/>`;
      s+=`<path d="M 74 80 Q 98 64 126 66 Q 150 68 160 84 L 78 84 Z" fill="${b}"/>`;
      s+=`<path d="M 80 80 Q 100 68 124 70 Q 144 72 152 82 L 82 82 Z" fill="#bfe9ff"/>`;
      // details kept clear of the cartoon face (eyes ~x103-121, smile ~x137-163)
      s+=`<path d="M 50 96 L 72 91 L 70 102 L 52 102 Z" fill="#7a0f08"/>`;         // side intake over the rear wheel
      s+=`<rect x="178" y="89" width="10" height="11" rx="2.5" fill="#ffd400" stroke="#c9a400" stroke-width="1.2"/>`; // small shield on the front fender
      s+=`<path d="M 192 96 l 9 3 -9 4 z" fill="#fff4c2"/>`;                        // headlight inside the nose
      s+=`<rect x="24" y="99" width="8" height="7" rx="2" fill="#8a0f08"/>`;       // tail-light inside the bumper
      s+=face(112,80,18)+smileCheeks(150,104); break;
    }
    case 'porsche': {
      const b=a.body||'#d4d8de';
      s+=`<path d="M 18 112 L 24 96 Q 42 86 74 84 L 150 84 Q 186 86 200 104 Q 204 112 196 114 L 24 114 Q 14 114 18 112 Z" fill="${b}" stroke="#c4c9d2" stroke-width="2"/>`;
      s+=`<path d="M 60 84 Q 78 60 118 60 Q 162 62 186 100 L 186 84 Z" fill="${b}" stroke="#c4c9d2" stroke-width="2"/>`; // 911 fastback hump
      s+=`<path d="M 74 82 Q 90 66 118 66 Q 148 68 168 82 Z" fill="#bfe9ff"/>`;
      s+=`<ellipse cx="190" cy="98" rx="4.5" ry="5.5" fill="#fff4c2"/>`;           // round headlight (inside the nose)
      s+=`<rect x="24" y="98" width="12" height="5" rx="2.5" fill="#c40000"/>`;    // tail-light strip inside the bumper
      s+=emblem(108,98,'#c8102e')+face(112,78,20)+smileCheeks(150,104); break;
    }
    case 'lambo': {
      const b=a.body||'#f0c800';
      s+=`<path d="M 16 112 L 42 90 L 98 82 L 150 82 L 190 92 L 204 108 L 200 114 L 20 114 Z" fill="${b}" stroke="#c9a400" stroke-width="2"/>`;
      s+=`<path d="M 80 82 L 100 68 L 132 68 L 152 82 Z" fill="#1a1a1a"/>`;
      s+=`<path d="M 86 80 L 102 70 L 128 70 L 144 80 Z" fill="#7cf3ff" opacity=".85"/>`;
      s+=`<path d="M 50 97 L 70 90 L 72 102 L 52 102 Z" fill="#1a1a1a"/>`;         // big intake over the rear wheel (clear of the face)
      s+=`<path d="M 184 95 l 11 2 -11 4 z" fill="#fff4c2"/>`;                      // headlight inside the nose
      s+=`<path d="M 32 100 l 12 0 -2 6 -12 0 z" fill="#8a0f08"/>`;                  // Y tail-light inside the bumper
      s+=face(114,75,16)+smileCheeks(150,104); break;
    }
    case 'muscle': {
      const b=a.body||'#8b3fd6';
      s+=lowerBody(b);
      s+=`<rect x="26" y="76" width="158" height="16" rx="6" fill="${b}"/>`;       // long hood/deck line
      s+=cabinSedan(b);
      s+=`<rect x="88" y="72" width="34" height="9" rx="3" fill="#1a1a1a"/>`;      // hood scoop
      s+=`<rect x="14" y="100" width="30" height="10" rx="2" fill="#8a0f08"/><rect x="14" y="102" width="30" height="3" fill="#ff3b30" opacity=".7"/>`; // wide tail band
      s+=face(122,70)+smileCheeks(150,100); break;
    }
    case 'gtr': {
      const b=a.body||'#1f6fd8';
      s+=lowerBody(b);
      s+=`<path d="M 52 84 L 66 58 L 150 58 L 168 84 Z" fill="${b}" stroke="rgba(0,0,0,.06)" stroke-width="2"/>`; // boxy angular cabin
      s+=`<path d="M 66 80 L 76 64 L 146 64 L 156 80 Z" fill="#bfe9ff"/>`;
      s+=`<g fill="#ff3b30">${[18,32].map(x=>`<circle cx="${x}" cy="100" r="5"/>`).join('')}</g>`; // round quad tail lights
      s+=`<circle cx="19" cy="100" r="2" fill="#ffd0cb"/><circle cx="33" cy="100" r="2" fill="#ffd0cb"/>`;
      s+=emblem(102,102,'#c40000')+face(110,70,20)+smileCheeks(150,100); break;
    }
    case 'alphard': {
      // one long tall box end to end (a big minivan, not a tall small car): three side windows,
      // sliding-door rail, short steep bonnet and the HUGE chrome grille that is the Alphard's face
      const b=a.body||'#26292f', hi=shade(b,0.35);
      s+=`<path d="M 10 114 L 10 40 Q 10 26 26 26 L 158 26 Q 171 26 177 37 L 190 70 Q 209 73 209 88 L 209 114 Q 209 122 200 122 L 18 122 Q 10 122 10 114 Z" fill="${b}" stroke="${hi}" stroke-width="2"/>`;
      s+=`<g fill="#9fcbe8"><rect x="20" y="36" width="42" height="32" rx="5"/><rect x="68" y="36" width="50" height="32" rx="5"/><path d="M 124 36 L 160 36 Q 167 36 171 44 L 183 68 L 124 68 Z"/></g>`;
      s+=`<line x1="18" y1="74" x2="186" y2="74" stroke="#dfe4ea" stroke-width="2"/>`;                               // chrome beltline
      s+=`<line x1="66" y1="80" x2="120" y2="80" stroke="${hi}" stroke-width="2" stroke-linecap="round"/>`;        // sliding-door rail
      s+=`<rect x="108" y="84" width="10" height="3.5" rx="1.7" fill="${hi}"/>`;
      s+=`<path d="M 193 76 L 209 80 L 209 116 L 193 118 Z" fill="#3a3f4a" stroke="#eef1f6" stroke-width="2.4"/>`;   // giant grille
      s+=`<g stroke="#dfe4ea" stroke-width="1.6">${[0,1,2,3,4,5,6].map(i=>`<line x1="195" y1="${82+i*5}" x2="208" y2="${82+i*5}"/>`).join('')}</g>`;
      s+=`<path d="M 178 70 L 204 74 L 200 80 L 182 78 Z" fill="#fff4c2"/>`;                                          // headlight
      s+=`<rect x="11" y="40" width="6" height="30" rx="3" fill="#d6231e"/>`;                                           // tall tail-light
      s+=face(146,52,22)+smileCheeks(150,100); break;
    }
    default: { s+=lowerBody('#ffc531')+cabinSedan('#ffc531')+face(122,70)+smileCheeks(150,100); }
  }
  s+=`</g>`; return s;
}

/* ---- rear views (showroom 「うしろ」) for cars whose tell is at the back ---- */
const REAR_VIEWS = ['porsche','nissan','ferrari','lambo','tesla'];
function hasRearView(id){ return REAR_VIEWS.indexOf(id)>=0; }
function carRearSVG(id){
  const car=CARS.find(c=>c.id===id); if(!car) return carSVG(id);
  const b=carBodyColor(car), st=shade(b,-0.2), k=car.art.kind;
  const tyres=`<rect x="24" y="110" width="32" height="34" rx="9" fill="#2b2f3a"/><rect x="164" y="110" width="32" height="34" rx="9" fill="#2b2f3a"/>`;
  let s=`<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="110" cy="143" rx="94" ry="7" fill="rgba(0,0,0,.12)"/>${tyres}`;
  if(k==='porsche'){   // 911: round hump, full-width light bar, lettering, twin exhausts
    s+=`<path d="M 18 122 L 18 96 Q 20 80 40 76 Q 70 42 110 40 Q 150 42 180 76 Q 200 80 202 96 L 202 122 Q 202 130 190 130 L 30 130 Q 18 130 18 122 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
    s+=`<path d="M 62 74 Q 80 52 110 51 Q 140 52 158 74 Z" fill="#bfe9ff"/>`;
    s+=`<g stroke="${st}" stroke-width="2">${[0,1,2,3].map(i=>`<line x1="84" y1="${82+i*4}" x2="136" y2="${82+i*4}"/>`).join('')}</g>`;
    s+=`<rect x="22" y="96" width="176" height="9" rx="4.5" fill="#b00012"/><rect x="24" y="98" width="172" height="3" rx="1.5" fill="#ff5a4d"/>`;
    s+=`<text x="110" y="117" font-family="Fredoka,sans-serif" font-size="9" font-weight="700" letter-spacing="2.4" fill="#2b2f3a" text-anchor="middle">PORSCHE</text>`;
    s+=`<g fill="#6b7688"><ellipse cx="96" cy="127" rx="6" ry="3.5"/><ellipse cx="124" cy="127" rx="6" ry="3.5"/></g>`;
  } else if(k==='gtr'){  // GT-R: boxy, big wing, FOUR round tail-lights
    s+=`<path d="M 16 124 L 16 92 Q 18 80 34 78 L 58 50 Q 62 46 70 46 L 150 46 Q 158 46 162 50 L 186 78 Q 202 80 204 92 L 204 124 Q 204 131 194 131 L 26 131 Q 16 131 16 124 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
    s+=`<path d="M 66 76 L 76 54 L 144 54 L 154 76 Z" fill="#bfe9ff"/>`;
    s+=`<g fill="#1d2129"><rect x="44" y="66" width="6" height="14"/><rect x="170" y="66" width="6" height="14"/><rect x="26" y="60" width="168" height="8" rx="3"/></g>`; // wing
    s+=[40,64,156,180].map(x=>`<circle cx="${x}" cy="98" r="10" fill="#c40000"/><circle cx="${x}" cy="98" r="5" fill="#ff6a5c"/>`).join('');
    s+=`<rect x="92" y="93" width="36" height="11" rx="3" fill="#dfe4ea"/><text x="110" y="102" font-family="Fredoka,sans-serif" font-size="8.5" font-weight="700" fill="#2b2f3a" text-anchor="middle">GT-R</text>`;
    s+=`<g fill="#6b7688">${[70,84,136,150].map(x=>`<circle cx="${x}" cy="126" r="4"/>`).join('')}</g>`;
  } else if(k==='ferrari'){  // curves + two round lights per side + prancing-horse shield
    s+=`<path d="M 16 122 L 18 100 Q 26 84 50 80 Q 78 58 110 56 Q 142 58 170 80 Q 194 84 202 100 L 204 122 Q 204 130 192 130 L 28 130 Q 16 130 16 122 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
    s+=`<path d="M 72 80 Q 90 64 110 63 Q 130 64 148 80 Z" fill="#bfe9ff"/>`;
    s+=[42,62,158,178].map(x=>`<circle cx="${x}" cy="100" r="8" fill="#8a0f08"/><circle cx="${x}" cy="100" r="4.5" fill="#ff5a4d"/>`).join('');
    s+=`<rect x="104" y="96" width="12" height="14" rx="3" fill="#ffd400" stroke="#c9a400" stroke-width="1.4"/>`;
    s+=`<rect x="78" y="116" width="64" height="8" rx="4" fill="#2b2f3a"/>`;
  } else if(k==='lambo'){  // all straight lines: hexagon lights, Y-shapes, big black diffuser
    s+=`<path d="M 14 126 L 20 94 L 60 72 L 160 72 L 200 94 L 206 126 L 190 132 L 30 132 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
    s+=`<path d="M 70 72 L 84 58 L 136 58 L 150 72 Z" fill="#1a1a1a"/>`;
    s+=`<g fill="none" stroke="#d6231e" stroke-width="4" stroke-linecap="round"><path d="M 30 96 L 44 104 L 58 96 M 44 104 L 44 114"/><path d="M 162 96 L 176 104 L 190 96 M 176 104 L 176 114"/></g>`;
    s+=`<path d="M 70 112 L 150 112 L 142 128 L 78 128 Z" fill="#1a1a1a"/><polygon points="104,116 116,116 120,121 116,126 104,126 100,121" fill="#6b7688"/>`;
  } else if(k==='tesla'){  // smooth, one full-width thin light, T badge
    s+=`<path d="M 18 122 L 18 98 Q 22 84 42 80 Q 70 48 110 46 Q 150 48 178 80 Q 198 84 202 98 L 202 122 Q 202 130 190 130 L 30 130 Q 18 130 18 122 Z" fill="${b}" stroke="${st}" stroke-width="2"/>`;
    s+=`<path d="M 58 78 Q 80 56 110 55 Q 140 56 162 78 Z" fill="#2a3444"/>`;
    s+=`<path d="M 24 96 L 196 96 L 194 101 L 26 101 Z" fill="#e8362b"/>`;
    s+=`<text x="110" y="116" font-family="Fredoka,sans-serif" font-size="12" font-weight="700" fill="#c8102e" text-anchor="middle">T</text>`;
  }
  return s+`</svg>`;
}

/* ---- top-down cars for the map and free drive (drawn pointing RIGHT, centred on 0,0) ---- */
function topCarInner(id){
  const car=CARS.find(c=>c.id===id)||{id:'taxi',art:{kind:'taxi'}}; const k=car.art.kind;
  const col=carBodyColor(car), roof=shade(col,-0.16), edge=shade(col,-0.35), glass='#9fd3f2';
  if(k==='spaceship') return `<ellipse cx="0" cy="2" rx="13" ry="12" fill="rgba(0,0,0,.18)"/><circle r="12" fill="#c3cad6" stroke="#8b96a8" stroke-width="1.2"/><circle r="6.5" fill="#bfe9ff" stroke="#e6ebf3" stroke-width="1.5"/>${[0,1,2,3,4,5].map(i=>{const t=i*Math.PI/3;return `<circle cx="${(Math.cos(t)*9.5).toFixed(1)}" cy="${(Math.sin(t)*9.5).toFixed(1)}" r="1.4" fill="${['#ff5a4d','#ffd400','#4fc06a','#3d8bff','#c07bff','#ffd400'][i]}"/>`;}).join('')}`;
  const long = {bus:44, train:50, shinkansen:52, firetruck:40, ambulance:36, dump:38}[k];
  const van = ['van','alphard','volvo'].indexOf(k)>=0;
  const sporty = ['ferrari','lambo','porsche','gtr','sport','muscle','mazda'].indexOf(k)>=0;
  const L = long || (van?33:(sporty?30:30)), W = long?16:(van?17:(sporty?15.5:16)), hl=L/2, hw=W/2;
  let s=`<ellipse cx="1" cy="2.2" rx="${hl+1.5}" ry="${hw+1}" fill="rgba(0,0,0,.2)"/>`;
  if(k==='shinkansen'){   // long body + pointed nose + blue stripe
    s+=`<path d="M ${-hl} ${-hw} L ${hl-14} ${-hw} Q ${hl} ${-hw+2} ${hl} 0 Q ${hl} ${hw-2} ${hl-14} ${hw} L ${-hl} ${hw} Z" fill="${col}" stroke="#aab3c1" stroke-width="1"/>`;
    s+=`<rect x="${-hl}" y="-1.2" width="${L-10}" height="2.4" fill="#2f6fd8"/><path d="M ${hl-12} -4 Q ${hl-4} -2.5 ${hl-4} 0 Q ${hl-4} 2.5 ${hl-12} 4 Z" fill="#1d2a44"/>`;
    return s;
  }
  s+=`<rect x="${-hl}" y="${-hw}" width="${L}" height="${W}" rx="${long?3:(sporty?6:5)}" fill="${col}" stroke="${edge}" stroke-width="1"/>`;
  if(k==='train'){ s+=`<rect x="${-hl+3}" y="${-hw+3}" width="${L-6}" height="${W-6}" rx="2" fill="${roof}"/><g stroke="#5a6272" stroke-width="1.2"><path d="M -4 ${-hw+3} L 0 0 L 4 ${-hw+3}"/></g><rect x="${hl-6}" y="${-hw+2}" width="4" height="${W-4}" rx="1.5" fill="${glass}"/>`; return s; }
  if(k==='bus'){ s+=`<rect x="${hl-6}" y="${-hw+2}" width="4" height="${W-4}" rx="1.5" fill="${glass}"/>${[-14,-4,6].map(x=>`<rect x="${x}" y="-3" width="6" height="6" rx="1" fill="${roof}"/>`).join('')}`; return s; }
  // glass: windscreen (front = +x) and rear window, roof panel between
  s+=`<rect x="${hl-(sporty?11:12)}" y="${-hw+2}" width="5" height="${W-4}" rx="2" fill="${glass}"/>`;
  if(k!=='mazda') s+=`<rect x="${-hl+(long?4:5)}" y="${-hw+2.5}" width="3.5" height="${W-5}" rx="1.5" fill="${glass}"/>`;
  s+= k==='mazda' ? `<rect x="-6" y="${-hw+3}" width="8" height="${W-6}" rx="2" fill="#2b2f3a"/>`   // open cockpit
                  : `<rect x="${-hl+(long?9:9)}" y="${-hw+2}" width="${L-(long?22:22)}" height="${W-4}" rx="3" fill="${roof}"/>`;
  s+=`<rect x="${hl-2.5}" y="${-hw+1.5}" width="2.5" height="3" rx="1" fill="#fff4c2"/><rect x="${hl-2.5}" y="${hw-4.5}" width="2.5" height="3" rx="1" fill="#fff4c2"/>`;
  s+=`<rect x="${-hl}" y="${-hw+1.5}" width="2" height="3" rx="1" fill="#e8362b"/><rect x="${-hl}" y="${hw-4.5}" width="2" height="3" rx="1" fill="#e8362b"/>`;
  if(k==='taxi'||k==='sedan-taxi') s+=`<rect x="-3" y="-3" width="6" height="6" rx="1.5" fill="#fff" stroke="#e5a712" stroke-width="1"/>`;
  if(k==='police') s+=`<rect x="-2" y="-5" width="4" height="5" fill="#ff3b30"/><rect x="-2" y="0" width="4" height="5" fill="#2f6bff"/>`;
  if(k==='ambulance') s+=`<rect x="-5" y="-1.4" width="10" height="2.8" fill="#ff3b30"/><rect x="-1.4" y="-5" width="2.8" height="10" fill="#ff3b30"/>`;
  if(k==='firetruck') s+=`<g stroke="#dfe4ea" stroke-width="1.2"><line x1="${-hl+4}" y1="-3" x2="${hl-10}" y2="-3"/><line x1="${-hl+4}" y1="3" x2="${hl-10}" y2="3"/></g>`;
  if(k==='robotaxi') s+=`<circle r="3" fill="#3a4150"/><circle r="1.4" fill="#7cf3ff"/>`;
  if(sporty && k!=='mazda') s+=`<rect x="${-hl+1}" y="-1" width="${L-4}" height="2" fill="rgba(255,255,255,.35)"/>`;   // racing stripe
  return s;
}
function topCarSVG(id, vb){ return `<svg viewBox="${vb||'-30 -30 60 60'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${topCarInner(id)}</svg>`; }

/* ---- boy avatar (Haru) with a taxi cap ---- */
function avatarSVG(){
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-label="Haru">
    <circle cx="60" cy="60" r="58" fill="#e7f4ff"/>
    <path d="M26 120 Q26 90 60 90 Q94 90 94 120 Z" fill="#3d8bff"/>
    <path d="M46 94 L60 106 L74 94 Z" fill="#fff"/>
    <rect x="57" y="92" width="6" height="16" fill="#ffd94f"/>
    <rect x="52" y="84" width="16" height="14" rx="4" fill="#f6c79b"/>
    <circle cx="35" cy="66" r="7" fill="#eab488"/><circle cx="85" cy="66" r="7" fill="#eab488"/>
    <path d="M35 58 Q32 74 42 82 L46 58 Z" fill="#5a3a22"/>
    <path d="M85 58 Q88 74 78 82 L74 58 Z" fill="#5a3a22"/>
    <circle cx="60" cy="66" r="26" fill="#f6c79b"/>
    <path d="M32 55 Q34 30 60 30 Q86 30 88 55 Q60 47 32 55 Z" fill="#ffc531" stroke="#e5a712" stroke-width="2"/>
    <g>${[0,1,2,3,4,5].map(i=>`<rect x="${36+i*8}" y="49" width="8" height="6" fill="${i%2?'#2b2f3a':'#fff'}"/>`).join('')}</g>
    <ellipse cx="60" cy="55" rx="30" ry="7" fill="#2b2f3a"/>
    <circle cx="60" cy="31" r="3.5" fill="#e5a712"/>
    <circle cx="50" cy="69" r="4.6" fill="#2b2f3a"/><circle cx="70" cy="69" r="4.6" fill="#2b2f3a"/>
    <circle cx="51.6" cy="67.4" r="1.6" fill="#fff"/><circle cx="71.6" cy="67.4" r="1.6" fill="#fff"/>
    <path d="M50 79 Q60 87 70 79" stroke="#b5714a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="77" r="4.6" fill="#ff9bb0" opacity=".7"/><circle cx="76" cy="77" r="4.6" fill="#ff9bb0" opacity=".7"/>
  </svg>`;
}

/* ============================================================
   Realistic navigation map (Uber-ish light theme): street grid
   with casings, buildings, water + park, an optional route line,
   a "you are here" dot, destination pins, and (on the pickup
   screen) a little car that drives along a road to reach you.
   ============================================================ */

/* A small, readable town (Astra review V01): a street GRID. Every destination pin sits on a
   crossing, "you are here" sits on the bottom street, and routes are built ONLY from these
   streets — the car never cuts through a block. */
const MAP_COLS = [40,112,184,256,328];     // north–south streets (x)
const MAP_ROWS = [56,114,172];             // east–west streets (y)
const MAP_BOTTOM = 226;                    // the home street (starts at x=112; water to the west)
const MAP_ORIGIN = { x:184, y:MAP_BOTTOM };  // "you are here" / pickup point

/* street centre-lines — drawn once as casing then white on top */
const NAV_ROADS = [
  ...MAP_ROWS.map(y=>({ d:`M -12 ${y} L 372 ${y}`, w:14 })),
  { d:`M 112 ${MAP_BOTTOM} L 372 ${MAP_BOTTOM}`, w:14 },
  ...MAP_COLS.map(x=>({ d:`M ${x} -12 L ${x} ${x===40?172:262}`, w:14 })),
];

/* a teardrop destination pin (optionally tappable, optional name label) */
function pinTeardrop(d, tappable, showLabel){
  const {x,y}=d.pos, c=PINCOLOR[d.id];
  const wrap = tappable
    ? `<g class="pin" role="button" tabindex="0" aria-label="${d.en}" style="cursor:pointer" onclick="pick('${d.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();pick('${d.id}')}">`
    : `<g class="pin static">`;
  // label sized to the name and kept inside the map (long names used to run off the left edge)
  const lw = Math.max(76, d.jp.length*12.5+16), lx = Math.max(2, Math.min(358-lw, x-lw/2));
  const label = showLabel
    ? `<g transform="translate(${lx},${y+14})"><rect x="0" y="-11" width="${lw}" height="22" rx="11" fill="#fff" opacity=".96"/>`
      + `<text x="${lw/2}" y="5" font-family="'M PLUS Rounded 1c',sans-serif" font-size="12" font-weight="700" fill="#233150" text-anchor="middle">${d.jp}</text></g>`
    : '';
  return `${wrap}<circle cx="${x}" cy="${y-26}" r="25" fill="transparent"/>`
    + `<ellipse cx="${x}" cy="${y+2}" rx="11" ry="4" fill="rgba(0,0,0,.18)"/>`
    + `<path d="M ${x} ${y} C ${x-15} ${y-26}, ${x-19} ${y-40}, ${x} ${y-46} C ${x+19} ${y-40}, ${x+15} ${y-26}, ${x} ${y} Z" fill="${c}" stroke="#fff" stroke-width="3"/>`
    + `<circle cx="${x}" cy="${y-30}" r="14" fill="#fff"/><text x="${x}" y="${y-24}" font-size="16" text-anchor="middle">${d.emoji}</text>`
    + label + `</g>`;
}

/* ---- the GPS course, built from grid streets only ----
   Staircase: go up one street, then one block across toward the pin, repeat — so the route
   has real turns at real crossings, then runs along the pin's street to arrive. */
function liveRoutePoints(d){
  const o=MAP_ORIGIN, t=d.pos, pts=[{x:o.x,y:o.y}];
  let x=o.x, y=o.y;
  const step=(from,to)=>{ const i=MAP_COLS.indexOf(from), j=MAP_COLS.indexOf(to); return MAP_COLS[i+(j>i?1:-1)]; };
  MAP_ROWS.filter(r=>r<y && r>=t.y).sort((a,b)=>b-a).forEach(r=>{
    y=r; pts.push({x,y});
    if(y!==t.y && x!==t.x && MAP_COLS.indexOf(x)>=0 && MAP_COLS.indexOf(t.x)>=0){ x=step(x,t.x); pts.push({x,y}); }
  });
  if(x!==t.x) pts.push({x:t.x,y});
  return pts;
}
/* simple preview route (car picker / pickup map) — the same streets, drawn plainly */
function routeD(o, p){ const d=DESTS.find(x=>x.pos===p)||{pos:p}; return roundedPath(liveRoutePoints(d), 12); }
/* 「もっと ドライブ」: a lap around the block next to the destination, ending back at the pin */
function loopRoutePoints(d){
  const t=d.pos, ci=MAP_COLS.indexOf(t.x), ri=MAP_ROWS.indexOf(t.y);
  const nx = MAP_COLS[ci<MAP_COLS.length-1 ? ci+1 : ci-1];
  const ny = ri>0 ? MAP_ROWS[ri-1] : MAP_ROWS[ri+1];
  return [{x:t.x,y:t.y},{x:nx,y:t.y},{x:nx,y:ny},{x:t.x,y:ny},{x:t.x,y:t.y}];
}
/* pickup: the driver comes in along real streets and stops at "you are here" */
function approachPoints(){ return [{x:328,y:172},{x:256,y:172},{x:256,y:MAP_BOTTOM},{x:MAP_ORIGIN.x,y:MAP_BOTTOM}]; }
/* turn a polyline into a path with rounded corners */
function roundedPath(pts, r){
  if(pts.length<2) return '';
  let d=`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for(let i=1;i<pts.length-1;i++){
    const p0=pts[i-1], p1=pts[i], p2=pts[i+1];
    const v1x=p1.x-p0.x, v1y=p1.y-p0.y, v2x=p2.x-p1.x, v2y=p2.y-p1.y;
    const l1=Math.hypot(v1x,v1y)||1, l2=Math.hypot(v2x,v2y)||1;
    const rr=Math.min(r, l1/2, l2/2);
    const ax=p1.x-v1x/l1*rr, ay=p1.y-v1y/l1*rr;
    const bx=p1.x+v2x/l2*rr, by=p1.y+v2y/l2*rr;
    d+=` L ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  const last=pts[pts.length-1];
  d+=` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

/* opts: { pins:'all'|'dest'|'none', dest:<id>, route:bool, approach:bool(car drives in), carId } */
function navMapSVG(opts){
  opts = opts || {};
  const o = MAP_ORIGIN;
  const dest = opts.dest ? DESTS.find(x=>x.id===opts.dest) : null;
  // crop: frame just the band between the destination pin and "you are here" (full width,
  // so it never letterboxes). At least 164 tall = the slim card's 2.2:1 shape.
  let vb = '0 0 360 250';
  if(opts.crop && dest){ const bottom=240; let top=Math.max(0, dest.pos.y-58); if(bottom-top<164) top=bottom-164; vb=`0 ${top} 360 ${bottom-top}`; }
  let s = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ちず map">`;
  // land, then one rounded block between every pair of streets (a few are parks), water SW
  s += `<rect x="0" y="0" width="360" height="250" fill="#e9edf2"/>`;
  const xs=[-40].concat(MAP_COLS,[400]), ys=[-40].concat(MAP_ROWS,[MAP_BOTTOM,300]);
  const PARKS={ '3,0':1, '1,2':1, '4,3':1 };      // block (col,row) → park
  let blocks='';
  for(let i=0;i<xs.length-1;i++) for(let j=0;j<ys.length-1;j++){
    const x0=xs[i]+10, x1=xs[i+1]-10, y0=ys[j]+10, y1=ys[j+1]-10; if(x1<=x0||y1<=y0) continue;
    if(i<=1 && j>=3) continue;                                   // water corner
    const park=PARKS[i+','+j];
    blocks+=`<rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" rx="7" fill="${park?'#cfe8c9':((i+j)%2?'#dde3ea':'#d5dbe3')}"/>`;
    if(park) blocks+=`<g fill="#b3d9a8">${[[.3,.35],[.6,.6],[.75,.3]].map(([fx,fy])=>`<circle cx="${(x0+(x1-x0)*fx).toFixed(1)}" cy="${(y0+(y1-y0)*fy).toFixed(1)}" r="5"/>`).join('')}</g>`;
    else if(x1-x0>30 && y1-y0>24) blocks+=`<rect x="${x0+6}" y="${y0+6}" width="${Math.min(22,(x1-x0)/2-8)}" height="${(y1-y0)/2-6}" rx="3" fill="#cbd2dc"/><rect x="${x1-6-Math.min(20,(x1-x0)/2-10)}" y="${y1-6-((y1-y0)/2-8)}" width="${Math.min(20,(x1-x0)/2-10)}" height="${(y1-y0)/2-8}" rx="3" fill="#cbd2dc"/>`;
  }
  s += `<g>${blocks}</g>`;
  s += `<path d="M -10 182 L 92 182 Q 102 182 102 192 L 102 260 L -10 260 Z" fill="#a9d6f5"/>`;
  s += `<g stroke="#cbe8fb" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M 16 204 q 8 -5 16 0 t 16 0"/><path d="M 40 228 q 8 -5 16 0 t 16 0"/></g>`;
  // roads: casing then white fill
  s += NAV_ROADS.map(r=>`<path d="${r.d}" stroke="#cdd3dc" stroke-width="${r.w}" fill="none" stroke-linecap="round"/>`).join('');
  s += NAV_ROADS.map(r=>`<path d="${r.d}" stroke="#ffffff" stroke-width="${r.w-4}" fill="none" stroke-linecap="round"/>`).join('');
  // route
  if(opts.route && dest){
    if(opts.live){
      // complex multi-turn GPS course: casing → remaining → flowing dashes → progress overlay → turn dots
      const pts = liveRoutePoints(dest);
      const dd = roundedPath(pts, 15);
      s += `<path d="${dd}" stroke="#ffffff" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path id="liveroute" d="${dd}" stroke="#c2ccda" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path class="routeflow" d="${dd}" stroke="#8fb4ea" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 13"/>`;
      s += `<path id="livedone" d="${dd}" stroke="#2f6fd8" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += pts.slice(1,-1).map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.6" fill="#fff" stroke="#2f6fd8" stroke-width="2"/>`).join('');
      // the 「もっと ドライブ」 lap (hidden until used)
      s += `<path id="liveloop" d="${roundedPath(loopRoutePoints(dest), 12)}" stroke="#ffb020" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 7" opacity="0"/>`;
    } else {
      const d = routeD(o, dest.pos);
      s += `<path d="${d}" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="${d}" stroke="#2b3446" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }
  // destination pin(s) — labels only when a single pin is shown (all-pins map is crowded)
  if(opts.pins==='all') s += DESTS.map(d=>pinTeardrop(d, true, false)).join('');
  else if(opts.pins!=='none' && dest) s += pinTeardrop(dest, false, true);
  // pickup / you-are-here dot
  s += `<g class="meloc"><circle cx="${o.x}" cy="${o.y}" r="20" fill="#3d8bff" opacity=".18"/>`
     + `<circle cx="${o.x}" cy="${o.y}" r="9" fill="#3d8bff" stroke="#fff" stroke-width="3"/></g>`;
  // "you are here" label beside the dot (home map) — used to be an HTML chip that covered the dot
  if(opts.pins==='all') s += `<g><rect x="${o.x+14}" y="${o.y-11}" width="74" height="22" rx="11" fill="#fff" opacity=".96"/>`
     + `<text x="${o.x+51}" y="${o.y+4.5}" font-family="'M PLUS Rounded 1c',sans-serif" font-size="11.5" font-weight="700" fill="#2f4368" text-anchor="middle">いま ここ</text></g>`;
  // little car driving to the pickup (coming screen)
  // the driver coming to pick you up: a TOP-DOWN car that follows the streets and turns with them
  if(opts.approach && opts.carId){
    const ap = roundedPath(approachPoints(), 12);
    s += `<g><animateMotion dur="2.6s" fill="freeze" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" path="${ap}"/>${topCarInner(opts.carId)}</g>`;
  }
  // live token driven by JS along #liveroute (riding screen) — top-down, rotated to its heading
  if(opts.live && opts.carId){
    s += `<g id="livecar" transform="translate(${o.x},${o.y}) rotate(-90)">${topCarInner(opts.carId)}</g>`;
  }
  s += `</svg>`; return s;
}
/* kept name so older callers still work */
function mapSVG(){ return navMapSVG({ pins:'all' }); }

/* ============================================================
   Per-destination mini-scenes for the riding screen background.
   Each returns an SVG sized to the .ridestage (360x230); the car
   and moving road strip are layered on top by the screen.
   ============================================================ */
function sceneSVG(type, world){
  world = world || { time:'day', weather:'none' };
  const base = { city:['#cfe0f5','#eaf2fb'], forest:['#bfe8ff','#e7f7ff'], school:['#cfeaff','#eef8ff'],
                sea:['#8fd3f4','#d6f0ff'], houses:['#ffe6c7','#fff4e3'], park:['#d9c9ff','#f0e9ff'],
                kinder:['#ffe0ef','#fff2f8'], singapore:['#ffd9a8','#ffeccb'],
                zoo:['#cdeeff','#eafaf0'], aquarium:['#1f6fa8','#5fb2d8'], airport:['#bcd9f2','#e6f2fb'],
                space:['#0b1026','#26305a'] }[type] || ['#a9e2ff','#e7f7ff'];
  const dark = (type==='space'), under = (type==='aquarium');
  let sky = base;
  if(dark || under){ /* these scenes keep their own sky */ }
  else if(world.time==='sunset')  sky=['#ff9e6d','#ffd9a8'];
  else if(world.time==='night')  sky=['#1e2a4d','#43537f'];
  else if(world.weather==='rain') sky=['#9fb0c4','#c7d3e0'];
  else if(world.weather==='snow') sky=['#ccd8e8','#eef4fb'];
  const uid = `sc_${type}_${world.time}_${world.weather}`;
  let s = `<svg viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
  s += `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>`;
  s += `<rect width="360" height="230" fill="url(#${uid})"/>`;
  // sun / moon / clouds (skipped for space & underwater)
  if(dark){
    s += `<g fill="#fff">${[[40,30],[90,54],[150,26],[210,44],[264,30],[120,70],[300,60],[190,88],[52,96]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="${(x%3)?1.6:2.2}"/>`).join('')}</g>`;
    s += `<circle cx="60" cy="46" r="16" fill="#c9a6ff"/><circle cx="60" cy="46" r="16" fill="none" stroke="#e0ccff" stroke-width="3" opacity=".5"/>`;
    s += `<ellipse cx="300" cy="70" rx="26" ry="9" fill="none" stroke="#ffcf7a" stroke-width="3" opacity=".7" transform="rotate(-18 300 70)"/><circle cx="300" cy="70" r="14" fill="#ffb84d"/>`;
  } else if(under){
    s += `<g fill="#bfe8ff" opacity=".5">${[[60,40],[120,70],[210,50],[280,90],[160,110]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${4+i}"/>`).join('')}</g>`;
  } else if(world.time==='night'){
    s += `<circle cx="308" cy="40" r="22" fill="#fdf6d8"/><circle cx="298" cy="34" r="20" fill="${sky[0]}"/>`; // crescent moon
    s += `<g fill="#fff">${[[40,30],[90,54],[150,26],[210,44],[264,30],[120,70],[190,80]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g>`;
  } else if(world.weather==='rain' || world.weather==='snow'){
    s += `<g fill="#ffffff" opacity=".92"><ellipse cx="300" cy="42" rx="30" ry="16"/><ellipse cx="276" cy="48" rx="22" ry="13"/><ellipse cx="322" cy="50" rx="20" ry="12"/></g>`;
  } else {
    const sy = world.time==='sunset' ? 92 : 40, sr = world.time==='sunset' ? 34 : 26, sc = world.time==='sunset' ? '#ff7a45' : '#fff3b0';
    s += `<circle cx="308" cy="${sy}" r="${sr}" fill="${sc}"/><circle cx="308" cy="${sy}" r="${sr}" fill="none" stroke="#ffe27a" stroke-width="8" opacity=".45"/>`;
  }
  if(type==='city'){
    s += `<g fill="#9fb4d4" opacity=".55"><rect x="30" y="70" width="34" height="90" rx="3"/><rect x="74" y="52" width="26" height="108" rx="3"/><rect x="110" y="84" width="30" height="76" rx="3"/><rect x="250" y="60" width="30" height="100" rx="3"/><rect x="290" y="80" width="34" height="80" rx="3"/></g>`;
    s += `<g fill="#7f97bd"><rect x="150" y="44" width="40" height="116" rx="4"/><rect x="196" y="66" width="30" height="94" rx="4"/></g>`;
    s += `<g fill="#fff6c2" opacity=".85">${[0,1,2,3,4,5].map(i=>`<rect x="${158+(i%2)*14}" y="${56+Math.floor(i/2)*18}" width="8" height="10" rx="1"/>`).join('')}</g>`;
  } else if(type==='forest'){
    s += `<path d="M0 150 Q90 120 180 148 T360 146 V230 H0 Z" fill="#bfe6a8"/>`;
    s += `<g>${[40,90,150,210,270,320].map((x,i)=>`<g transform="translate(${x},${120+ (i%2)*8})"><rect x="-4" y="6" width="8" height="20" fill="#8a5a34"/><circle cx="0" cy="0" r="20" fill="#5fb35f"/><circle cx="-12" cy="6" r="14" fill="#69bd69"/><circle cx="12" cy="6" r="14" fill="#69bd69"/></g>`).join('')}</g>`;
  } else if(type==='school'){
    s += `<rect x="96" y="70" width="168" height="90" rx="6" fill="#f4d19b"/><rect x="96" y="70" width="168" height="18" fill="#e06a5a"/>`;
    s += `<rect x="168" y="120" width="24" height="40" fill="#8a5a34"/>`;
    s += `<g fill="#bfe9ff" stroke="#cf9a5e" stroke-width="2">${[110,138,208,236].map(x=>`<rect x="${x}" y="100" width="18" height="16" rx="2"/>`).join('')}</g>`;
    s += `<circle cx="180" cy="60" r="12" fill="#fff" stroke="#cf9a5e" stroke-width="3"/><line x1="180" y1="60" x2="180" y2="52" stroke="#333" stroke-width="2"/><line x1="180" y1="60" x2="186" y2="60" stroke="#333" stroke-width="2"/>`;
    s += `<line x1="284" y1="60" x2="284" y2="160" stroke="#9aa3b2" stroke-width="3"/><path d="M284 62 h26 v14 h-26 z" fill="#ff5a4d"/>`;
  } else if(type==='sea'){
    s += `<rect y="120" width="360" height="110" fill="#57b7e8"/>`;
    s += `<g stroke="#bfe8ff" stroke-width="3" fill="none" opacity=".8"><path d="M0 140 Q30 132 60 140 T120 140 T180 140 T240 140 T300 140 T360 140"/><path d="M0 160 Q30 152 60 160 T120 160 T180 160 T240 160 T300 160 T360 160"/></g>`;
    s += `<path d="M240 120 Q300 120 360 132 V230 H240 Z" fill="#f6e3b0"/>`;
    s += `<g transform="translate(300,150)"><rect x="-2" y="-30" width="4" height="30" fill="#8a5a34"/><path d="M2 -30 q26 6 0 14 z" fill="#ff7a45"/></g>`;
  } else if(type==='houses'){
    s += `<path d="M0 150 H360 V230 H0 Z" fill="#cfe8c9"/>`;
    s += `<g>${[[40,'#ff9aa2'],[120,'#8ad1c2'],[200,'#a0c4ff'],[280,'#ffd166']].map(([x,c])=>`<g transform="translate(${x},108)"><rect x="0" y="20" width="56" height="42" rx="4" fill="${c}"/><path d="M-4 20 L28 -4 L60 20 Z" fill="#e07a5f"/><rect x="22" y="40" width="14" height="22" fill="#7a5a3a"/></g>`).join('')}</g>`;
  } else if(type==='park'){
    s += `<path d="M0 156 H360 V230 H0 Z" fill="#bfe6a8"/>`;
    // ferris wheel
    s += `<g transform="translate(180,116)"><circle r="54" fill="none" stroke="#8a93a8" stroke-width="4"/>`;
    s += [0,1,2,3,4,5,6,7].map(i=>{ const a=i*Math.PI/4, x=Math.cos(a)*54, y=Math.sin(a)*54; return `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#aeb6c6" stroke-width="2"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${['#ff6b6b','#ffd166','#4fc06a','#3d8bff','#c07bff','#ff9f43','#2ec4b6','#ef476f'][i]}"/>`; }).join('');
    s += `<circle r="7" fill="#fff" stroke="#8a93a8" stroke-width="3"/><rect x="-4" y="54" width="8" height="40" fill="#8a93a8"/></g>`;
  } else if(type==='kinder'){
    s += `<path d="M0 156 H360 V230 H0 Z" fill="#cdeccf"/>`;
    // colourful kindergarten building
    s += `<rect x="70" y="86" width="150" height="74" rx="8" fill="#ffd3e2"/><path d="M62 86 L145 52 L228 86 Z" fill="#ff8fb4"/>`;
    s += `<rect x="132" y="120" width="26" height="40" rx="3" fill="#ffb3cf"/>`;
    s += `<g fill="#bfe9ff" stroke="#ff9ec2" stroke-width="2">${[86,168,196].map(x=>`<rect x="${x}" y="104" width="20" height="18" rx="3"/>`).join('')}</g>`;
    s += `<rect x="150" y="34" width="4" height="18" fill="#9aa3b2"/><path d="M154 34 h22 v12 h-22 z" fill="#ffd400"/>`;
    // swing set + slide in the yard
    s += `<g stroke="#8a93a8" stroke-width="3" fill="none"><path d="M250 160 L266 118 L300 118 L288 160"/><line x1="273" y1="118" x2="270" y2="142"/><line x1="293" y1="118" x2="296" y2="142"/></g>`;
    s += `<rect x="266" y="142" width="8" height="6" fill="#ff6b6b"/><rect x="292" y="142" width="8" height="6" fill="#4fc06a"/>`;
    s += `<g><path d="M312 160 L322 120 L332 120 L332 160 Z" fill="#ffb703"/><rect x="332" y="120" width="16" height="8" fill="#fb8500"/></g>`;
  } else if(type==='singapore'){
    // Marina Bay Sands-ish: three towers + boat-shaped skypark, palm, harbour
    s += `<rect y="150" width="360" height="80" fill="#5fc9d6"/>`;
    s += `<g stroke="#bfeef4" stroke-width="3" fill="none" opacity=".7"><path d="M0 168 Q30 160 60 168 T120 168 T180 168 T240 168 T300 168 T360 168"/></g>`;
    s += `<g fill="#dfe6ee"><path d="M120 150 L128 66 L140 66 L146 150 Z"/><path d="M168 150 L176 58 L188 58 L194 150 Z"/><path d="M216 150 L224 66 L236 66 L242 150 Z"/></g>`;
    s += `<path d="M112 60 Q183 34 250 60 L250 70 Q183 46 112 70 Z" fill="#c7d0dc"/>`;
    s += `<g fill="#bfe9ff" opacity=".8">${[0,1,2,3,4].map(i=>`<rect x="${126+i*4}" y="80" width="2" height="60"/>`).join('')}${[0,1,2,3,4].map(i=>`<rect x="${174+i*4}" y="72" width="2" height="70"/>`).join('')}</g>`;
    // palm tree
    s += `<g transform="translate(304,150)"><path d="M0 0 Q-4 -34 2 -50" stroke="#8a5a34" stroke-width="6" fill="none"/><g fill="#3fae5b"><path d="M2 -50 Q-24 -56 -34 -44 Q-14 -50 2 -46 Z"/><path d="M2 -50 Q28 -56 38 -44 Q18 -50 2 -46 Z"/><path d="M2 -50 Q-10 -74 -26 -78 Q-8 -66 2 -48 Z"/><path d="M2 -50 Q14 -74 30 -78 Q12 -66 2 -48 Z"/></g></g>`;
  } else if(type==='zoo'){
    s += `<path d="M0 150 Q90 132 180 150 T360 148 V230 H0 Z" fill="#bfe6a8"/>`;
    // giraffe
    s += `<g transform="translate(96,150)"><rect x="-6" y="-70" width="14" height="64" rx="6" fill="#f0c36a"/><ellipse cx="1" cy="-78" rx="12" ry="10" fill="#f0c36a"/><circle cx="-3" cy="-80" r="1.6" fill="#333"/><g fill="#c98a3a"><circle cx="-2" cy="-56" r="4"/><circle cx="4" cy="-40" r="4"/><circle cx="-3" cy="-26" r="4"/></g><rect x="-14" y="-8" width="28" height="10" fill="#f0c36a"/></g>`;
    // elephant
    s += `<g transform="translate(250,150)"><ellipse cx="0" cy="-24" rx="34" ry="24" fill="#9aa7b5"/><circle cx="26" cy="-30" r="16" fill="#9aa7b5"/><path d="M40 -28 Q50 -18 44 -4" stroke="#9aa7b5" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="30" cy="-34" r="2" fill="#333"/><rect x="-22" y="-4" width="8" height="10" fill="#8593a2"/><rect x="10" y="-4" width="8" height="10" fill="#8593a2"/></g>`;
    // fence
    s += `<g stroke="#b5854a" stroke-width="4">${[10,40,70,290,320,350].map(x=>`<line x1="${x}" y1="150" x2="${x}" y2="132"/>`).join('')}</g>`;
  } else if(type==='aquarium'){
    // big glass tank feel: fish, seaweed, sandy floor
    s += `<path d="M0 196 Q90 184 180 196 T360 194 V230 H0 Z" fill="#f0e0b0"/>`;
    s += `<g fill="#2f8f5a">${[60,150,250,320].map(x=>`<path d="M${x} 196 Q${x-8} 160 ${x} 130 Q${x+8} 160 ${x} 196 Z"/>`).join('')}</g>`;
    s += `<g>${[['#ff8a3d',80,70],['#ffd166',210,58],['#ff6b9d',150,110],['#4fd0e0',290,96],['#ff6b6b',120,150]].map(([c,x,y])=>`<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="14" ry="9" fill="${c}"/><path d="M12 0 L22 -7 L22 7 Z" fill="${c}"/><circle cx="-6" cy="-2" r="1.8" fill="#fff"/></g>`).join('')}</g>`;
    s += `<g fill="#bfe8ff" opacity=".55">${[[100,40],[190,30],[260,60],[60,110]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`;
  } else if(type==='airport'){
    s += `<rect y="150" width="360" height="80" fill="#8f99a8"/>`;
    s += `<rect y="176" width="360" height="10" fill="#c9cfd8"/><g fill="#ffd84d">${[20,80,140,200,260,320].map(x=>`<rect x="${x}" y="179" width="24" height="4"/>`).join('')}</g>`;
    // control tower
    s += `<g transform="translate(60,150)"><rect x="-8" y="-70" width="16" height="70" fill="#dfe6ee"/><rect x="-18" y="-88" width="36" height="22" rx="5" fill="#aeb8c6"/><rect x="-14" y="-84" width="28" height="12" rx="3" fill="#bfe9ff"/></g>`;
    // airplane
    s += `<g transform="translate(230,90)"><ellipse cx="0" cy="0" rx="52" ry="14" fill="#eef2f6" stroke="#d7dde6" stroke-width="2"/><path d="M-10 0 L-40 -22 L-24 -2 Z" fill="#cfd7e2"/><path d="M40 0 L58 -10 L58 8 Z" fill="#cfd7e2"/><g fill="#bfe9ff">${[0,1,2,3].map(i=>`<circle cx="${-24+i*14}" cy="-2" r="3"/>`).join('')}</g><path d="M20 6 L34 22 L40 6 Z" fill="#cfd7e2"/></g>`;
  } else if(type==='space'){
    // planets + space station
    s += `<circle cx="70" cy="150" r="60" fill="#5a6bd8"/><ellipse cx="70" cy="150" rx="60" ry="14" fill="none" stroke="#9fb0ff" stroke-width="3" opacity=".5"/>`;
    s += `<circle cx="300" cy="60" r="20" fill="#ff9e6d"/><ellipse cx="300" cy="60" rx="34" ry="9" fill="none" stroke="#ffd1a8" stroke-width="3" transform="rotate(-20 300 60)"/>`;
    // station
    s += `<g transform="translate(200,110)"><rect x="-30" y="-8" width="60" height="16" rx="8" fill="#c7d0dc"/><rect x="-6" y="-22" width="12" height="44" rx="4" fill="#aeb8c6"/><rect x="-52" y="-4" width="20" height="8" fill="#3d8bff"/><rect x="32" y="-4" width="20" height="8" fill="#3d8bff"/><circle cx="0" cy="0" r="5" fill="#7cf3ff"/></g>`;
  }
  // time-of-day tint over the whole scene (cheap way to unify the mood)
  if(world.time==='night')       s += `<rect width="360" height="230" fill="#1a2340" opacity=".34"/>`;
  else if(world.time==='sunset') s += `<rect width="360" height="230" fill="#ff8a3d" opacity=".14"/>`;
  else if(world.weather==='rain') s += `<rect width="360" height="230" fill="#5a6b86" opacity=".12"/>`;
  // near ground / sidewalk band (car + roadstrip sit here)
  s += `<rect x="0" y="196" width="360" height="34" fill="${world.time==='night'?'#3a4460':'#c3ccd8'}"/>`;
  s += `</svg>`; return s;
}

/* ============================================================
   Ride-stage parallax (Astra review V04): two moving layers only.
   far  = clouds drifting slowly across the sky
   near = roadside trees / lamp posts / signs rushing past
   Both are 720-wide strips (two identical 360 halves) animated by
   CSS translateX(-50%) so they loop seamlessly.
   ============================================================ */
function cloudStripSVG(world){
  const night=world.time==='night', col=night?'rgba(200,210,240,.35)':'rgba(255,255,255,.9)';
  const one=[[40,26,1],[150,48,.8],[250,20,1.1],[320,58,.7]].map(([x,y,k])=>`<g transform="translate(${x},${y}) scale(${k})"><ellipse rx="22" ry="9"/><ellipse cx="-12" cy="3" rx="13" ry="7"/><ellipse cx="13" cy="3" rx="14" ry="7"/></g>`).join('');
  return `<svg viewBox="0 0 720 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="${col}">${one}<g transform="translate(360,0)">${one}</g></g></svg>`;
}
function nearStripSVG(world, scene){
  const night=world.time==='night', snow=world.weather==='snow';
  const leaf=night?'#2c5a44':(scene==='singapore'?'#2fae6a':'#4fae5a'), leaf2=night?'#244a38':'#3e9a4b', trunk=night?'#4a3a30':'#8a5a3a';
  const tree=(x,s)=>`<g transform="translate(${x},72) scale(${s})"><rect x="-3" y="-20" width="6" height="20" fill="${trunk}"/><circle cy="-30" r="15" fill="${leaf}"/><circle cx="-8" cy="-24" r="9" fill="${leaf2}"/>${snow?'<ellipse cy="-42" rx="11" ry="4" fill="#fff"/>':''}</g>`;
  const lamp=x=>`<g transform="translate(${x},72)"><rect x="-1.6" y="-50" width="3.2" height="50" fill="${night?'#8b96a8':'#6b7688'}"/><path d="M 0 -50 q 8 0 10 5" stroke="#6b7688" stroke-width="3" fill="none"/><circle cx="10" cy="-44" r="3.4" fill="${night?'#fff3b0':'#dfe4ea'}"/>${night?'<circle cx="10" cy="-44" r="9" fill="#fff3b0" opacity=".3"/>':''}</g>`;
  const sign=x=>`<g transform="translate(${x},72)"><rect x="-1.5" y="-34" width="3" height="34" fill="#6b7688"/><circle cy="-40" r="9" fill="#fff" stroke="#e8362b" stroke-width="3"/><text y="-36.5" font-size="9" font-weight="700" text-anchor="middle" fill="#2f4368" font-family="Fredoka,sans-serif">40</text></g>`;
  const one=tree(30,1)+lamp(90)+tree(150,.8)+tree(180,1.1)+sign(240)+lamp(300)+tree(340,.9);
  return `<svg viewBox="0 0 720 76" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${one}<g transform="translate(360,0)">${one}</g></svg>`;
}
/* the destination building that slides into view as the car arrives (Astra: 着く) */
function destGateSVG(d, world){
  const night=world&&world.time==='night', wall=night?'#c9cfe0':'#fff', c=PINCOLOR[d.id]||'#3d8bff';
  return `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
    + `<rect x="14" y="40" width="112" height="110" rx="8" fill="${wall}" stroke="${shade(c,-0.1)}" stroke-width="4"/>`
    + `<path d="M 6 44 L 70 8 L 134 44 Z" fill="${c}"/>`
    + `<rect x="24" y="52" width="92" height="30" rx="15" fill="${c}"/><text x="70" y="73" font-size="15" font-weight="700" text-anchor="middle" fill="#fff" font-family="'M PLUS Rounded 1c',sans-serif">${d.jp.length>6?d.jp.slice(0,6)+'…':d.jp}</text>`
    + `<circle cx="70" cy="30" r="13" fill="#fff"/><text x="70" y="36" font-size="16" text-anchor="middle">${d.emoji}</text>`
    + `<rect x="50" y="98" width="40" height="52" rx="6" fill="${shade(c,-0.25)}"/><rect x="26" y="96" width="18" height="18" rx="3" fill="${night?'#fff3b0':'#bfe9ff'}"/><rect x="96" y="96" width="18" height="18" rx="3" fill="${night?'#fff3b0':'#bfe9ff'}"/>`
    + `</svg>`;
}

/* weather particles as a CSS-animated overlay (added over the ride stage by the screen) */
function weatherOverlayHTML(world){
  if(!world || world.weather==='none') return '';
  if(world.weather==='rain'){
    let d=''; for(let i=0;i<28;i++){ d+=`<span class="drop" style="left:${Math.round(Math.random()*100)}%;animation-delay:${(Math.random()*1).toFixed(2)}s;animation-duration:${(0.5+Math.random()*0.4).toFixed(2)}s"></span>`; }
    return `<div class="weatherlayer rain">${d}</div>`;
  }
  if(world.weather==='snow'){
    let d=''; for(let i=0;i<26;i++){ d+=`<span class="flake" style="left:${Math.round(Math.random()*100)}%;animation-delay:${(Math.random()*3).toFixed(2)}s;animation-duration:${(2.4+Math.random()*2).toFixed(2)}s;font-size:${(8+Math.random()*10).toFixed(0)}px">❄</span>`; }
    return `<div class="weatherlayer snow">${d}</div>`;
  }
  return '';
}

/* ---- hero backdrop for the top page ---- */
function heroBackdropSVG(){
  return `<svg class="herobg" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset="1" stop-color="#c9edff"/></linearGradient></defs>
    <rect width="360" height="200" fill="url(#hsky)"/>
    <circle cx="312" cy="40" r="26" fill="#fff3b0"/><circle cx="312" cy="40" r="26" fill="none" stroke="#ffe27a" stroke-width="8" opacity=".5"/>
    <g fill="#fff" opacity=".95"><ellipse cx="70" cy="46" rx="28" ry="16"/><ellipse cx="98" cy="40" rx="22" ry="14"/><ellipse cx="150" cy="60" rx="24" ry="14"/></g>
    <g>
      <rect x="20"  y="96"  width="42" height="70" rx="6" fill="#ff9aa2"/>
      <rect x="70"  y="76"  width="38" height="90" rx="6" fill="#8ad1c2"/>
      <rect x="116" y="104" width="46" height="62" rx="6" fill="#ffd166"/>
      <rect x="170" y="70"  width="40" height="96" rx="6" fill="#a0c4ff"/>
      <rect x="218" y="100" width="44" height="66" rx="6" fill="#bdb2ff"/>
      <rect x="270" y="84"  width="40" height="82" rx="6" fill="#ffb4a2"/>
      <rect x="316" y="110" width="34" height="56" rx="6" fill="#95d5b2"/>
    </g>
    <g fill="#fff" opacity=".85">${[30,78,124,178,226,278,322].map((x,i)=>`<rect x="${x}" y="${[110,90,118,84,114,98,124][i]}" width="8" height="8" rx="1"/><rect x="${x+16}" y="${[110,90,118,84,114,98,124][i]}" width="8" height="8" rx="1"/>`).join('')}</g>
    <rect x="0" y="166" width="360" height="34" fill="#5b6472"/>
    <rect x="0" y="180" width="360" height="5" fill="#ffd84d" opacity=".9"/>
  </svg>`;
}
