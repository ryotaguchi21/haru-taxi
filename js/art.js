/* ============================================================
   art.js — every picture in the app is inline SVG built here
   ============================================================ */

/* ---- shared car parts ---- */
function wheels(){ const cy=124,r=22,hub=11;
  const w=(cx)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2f3a"/><circle cx="${cx}" cy="${cy}" r="${hub}" fill="#cfd7e2"/><circle cx="${cx}" cy="${cy}" r="4" fill="#8b96a8"/>`;
  return `<g>${w(64)}${w(158)}</g>`; }
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
  if(opts.decor) extra += decorInner(PROFILE.decor);
  if(opts.pet){ const p = petById(opts.pet); extra += petInner(p ? p.emoji : opts.pet); }
  return `<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${carInner(id)}${extra}</svg>`;
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
  const car = CARS.find(c=>c.id===id); const a = car ? car.art : {kind:'taxi'};
  if(a.kind==='spaceship') return spaceshipInner();

  let s=`<ellipse cx="110" cy="142" rx="90" ry="9" fill="rgba(0,0,0,.10)"/><g class="body">`+wheels();

  switch(a.kind){
    case 'taxi': {
      s+=lowerBody('#ffc531');
      let ch=''; for(let i=0;i<11;i++){ ch+=`<rect x="${20+i*16}" y="108" width="16" height="9" fill="${i%2?'#2b2f3a':'#fff'}"/>`; }
      s+=`<clipPath id="cb_${id}"><rect x="14" y="84" width="192" height="40" rx="20"/></clipPath><g clip-path="url(#cb_${id})">${ch}</g>`;
      s+=cabinSedan('#ffc531');
      s+=`<rect x="96" y="38" width="42" height="16" rx="4" fill="#fff" stroke="#e5a712" stroke-width="2"/><text x="117" y="50" font-family="Fredoka,sans-serif" font-size="10" font-weight="700" fill="#e5941c" text-anchor="middle">TAXI</text>`;
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
      s+=lowerBody('#d3d8e0')+cabinSedan('#d3d8e0');
      s+=`<g transform="translate(184,100)"><circle r="10" fill="#3a3f4a"/><g stroke="#fff" stroke-width="2.4" stroke-linecap="round"><line x1="0" y1="0" x2="0" y2="-7"/><line x1="0" y1="0" x2="6" y2="4"/><line x1="0" y1="0" x2="-6" y2="4"/></g><circle r="10" fill="none" stroke="#fff" stroke-width="1.6"/></g>`;
      s+=face(122,70)+smileCheeks(148,100); break;
    }
    case 'tesla': {
      s+=lowerBody('#f4f6f9','#d7dde6')+cabinSleek('#f4f6f9','#d7dde6')+`<rect x="186" y="92" width="12" height="10" rx="4" fill="#ff5a4d"/>`+face(110,76,22)+smileCheeks(150,102); break;
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
    default: { s+=lowerBody('#ffc531')+cabinSedan('#ffc531')+face(122,70)+smileCheeks(150,100); }
  }
  s+=`</g>`; return s;
}

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

const MAP_ORIGIN = { x:184, y:224 };  // "you are here" / pickup point (bottom-centre)

/* street centre-lines — drawn once as casing then white on top */
const NAV_ROADS = [
  { d:'M -12 70 C 90 60, 180 66, 262 58 S 372 62, 372 60', w:14 },
  { d:'M -12 150 C 80 152, 150 140, 244 150 S 372 150, 372 150', w:14 },
  { d:'M -12 206 C 120 212, 240 198, 372 206', w:11 },
  { d:'M 82 -12 C 78 72, 92 150, 80 262', w:12 },
  { d:'M 192 -12 C 197 62, 184 152, 202 262', w:12 },
  { d:'M 286 -12 C 289 82, 279 162, 292 262', w:10 },
  { d:'M -12 246 C 120 182, 224 120, 372 40', w:9 },
];

/* a teardrop destination pin (optionally tappable, optional name label) */
function pinTeardrop(d, tappable, showLabel){
  const {x,y}=d.pos, c=PINCOLOR[d.id];
  const wrap = tappable
    ? `<g class="pin" role="button" tabindex="0" aria-label="${d.en}" style="cursor:pointer" onclick="pick('${d.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();pick('${d.id}')}">`
    : `<g class="pin static">`;
  const label = showLabel
    ? `<g transform="translate(${x},${y+14})"><rect x="-38" y="-11" width="76" height="22" rx="11" fill="#fff" opacity=".96"/>`
      + `<text x="0" y="5" font-family="'M PLUS Rounded 1c',sans-serif" font-size="12" font-weight="700" fill="#233150" text-anchor="middle">${d.jp}</text></g>`
    : '';
  return `${wrap}<circle cx="${x}" cy="${y-26}" r="34" fill="transparent"/>`
    + `<ellipse cx="${x}" cy="${y+2}" rx="11" ry="4" fill="rgba(0,0,0,.18)"/>`
    + `<path d="M ${x} ${y} C ${x-15} ${y-26}, ${x-19} ${y-40}, ${x} ${y-46} C ${x+19} ${y-40}, ${x+15} ${y-26}, ${x} ${y} Z" fill="${c}" stroke="#fff" stroke-width="3"/>`
    + `<circle cx="${x}" cy="${y-30}" r="14" fill="#fff"/><text x="${x}" y="${y-24}" font-size="16" text-anchor="middle">${d.emoji}</text>`
    + label + `</g>`;
}

/* curved route from the pickup point up to a destination pin (simple preview) */
function routeD(o, p){ return `M ${o.x} ${o.y} C ${o.x} ${o.y-70}, ${p.x} ${p.y+70}, ${p.x} ${p.y}`; }

/* ---- complex "GPS" route: a stepped Manhattan course with several turns ---- */
function liveRoutePoints(d){
  const o=MAP_ORIGIN, t=d.pos, dy=o.y-t.y;
  const y1=o.y-dy*0.28, y2=o.y-dy*0.56, y3=o.y-dy*0.82;   // three rungs going up
  const jx=o.x+(t.x-o.x)*0.62, kx=o.x+(t.x-o.x)*0.30;      // two side jogs
  return [
    {x:o.x, y:o.y},
    {x:o.x, y:y1},        // ↑
    {x:kx,  y:y1},        // → turn
    {x:kx,  y:y2},        // ↑ turn
    {x:jx,  y:y2},        // → turn
    {x:jx,  y:y3},        // ↑ turn
    {x:t.x, y:y3},        // → turn
    {x:t.x, y:t.y}        // ↑ arrive at the pin
  ];
}
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
  let s = `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ちず map">`;
  // land + water + park
  s += `<rect x="0" y="0" width="360" height="250" fill="#e9edf2"/>`;
  s += `<path d="M -10 214 C 70 224, 150 214, 200 236 L 200 260 L -10 260 Z" fill="#a9d6f5"/>`;
  s += `<path d="M -10 214 C 70 224, 150 214, 200 236" stroke="#cbe8fb" stroke-width="3" fill="none"/>`;
  s += `<g fill="#cfe8c9"><ellipse cx="300" cy="66" rx="52" ry="34"/><ellipse cx="46" cy="182" rx="34" ry="26"/></g>`;
  s += `<g fill="#bfe0b6"><circle cx="300" cy="66" r="6"/><circle cx="318" cy="58" r="5"/><circle cx="286" cy="76" r="5"/></g>`;
  // building blocks
  const blocks = [[24,90,40,30],[70,96,34,26],[112,82,30,34],[210,92,44,28],[262,104,34,26],[24,120,32,20],[150,178,40,24],[236,170,44,26],[118,120,30,24],[300,190,40,24],[150,96,34,24]];
  s += `<g>` + blocks.map(([x,y,w,h],i)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${i%3?'#dde3ea':'#d5dbe3'}"/>`).join('') + `</g>`;
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
    } else {
      const d = routeD(o, dest.pos);
      s += `<path d="${d}" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      s += `<path d="${d}" stroke="#2b3446" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    }
  }
  // destination pin(s) — labels only when a single pin is shown (all-pins map is crowded)
  if(opts.pins==='all') s += DESTS.map(d=>pinTeardrop(d, true, false)).join('');
  else if(opts.pins!=='none' && dest) s += pinTeardrop(dest, false, true);
  // pickup / you-are-here dot
  s += `<g class="meloc"><circle cx="${o.x}" cy="${o.y}" r="20" fill="#3d8bff" opacity=".18"/>`
     + `<circle cx="${o.x}" cy="${o.y}" r="9" fill="#3d8bff" stroke="#fff" stroke-width="3"/></g>`;
  // little car driving to the pickup (coming screen)
  if(opts.approach && opts.carId){
    const ap = `M ${o.x-150} ${o.y-78} C ${o.x-80} ${o.y-34}, ${o.x-34} ${o.y-10}, ${o.x} ${o.y}`;
    s += `<g><animateMotion dur="2.6s" fill="freeze" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" path="${ap}"/>`
       + `<g transform="translate(-24,-18)"><svg x="0" y="0" width="48" height="33" viewBox="0 0 220 150" overflow="visible">${carInner(opts.carId)}</svg></g></g>`;
  }
  // live token driven by JS along #liveroute (riding screen); inner g centres the car
  if(opts.live && opts.carId){
    s += `<g id="livecar" transform="translate(${o.x},${o.y})"><ellipse cx="0" cy="15" rx="18" ry="5" fill="rgba(0,0,0,.12)"/><g id="livecarinner" transform="translate(-22,-17)"><svg x="0" y="0" width="44" height="30" viewBox="0 0 220 150" overflow="visible">${carInner(opts.carId)}</svg></g></g>`;
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
                kinder:['#ffe0ef','#fff2f8'], singapore:['#ffd9a8','#ffeccb'] }[type] || ['#a9e2ff','#e7f7ff'];
  let sky = base;
  if(world.time==='sunset')      sky=['#ff9e6d','#ffd9a8'];
  else if(world.time==='night')  sky=['#1e2a4d','#43537f'];
  else if(world.weather==='rain') sky=['#9fb0c4','#c7d3e0'];
  else if(world.weather==='snow') sky=['#ccd8e8','#eef4fb'];
  const uid = `sc_${type}_${world.time}_${world.weather}`;
  let s = `<svg viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
  s += `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>`;
  s += `<rect width="360" height="230" fill="url(#${uid})"/>`;
  // sun / moon / clouds
  if(world.time==='night'){
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
  }
  // time-of-day tint over the whole scene (cheap way to unify the mood)
  if(world.time==='night')       s += `<rect width="360" height="230" fill="#1a2340" opacity=".34"/>`;
  else if(world.time==='sunset') s += `<rect width="360" height="230" fill="#ff8a3d" opacity=".14"/>`;
  else if(world.weather==='rain') s += `<rect width="360" height="230" fill="#5a6b86" opacity=".12"/>`;
  // near ground / sidewalk band (car + roadstrip sit here)
  s += `<rect x="0" y="196" width="360" height="34" fill="${world.time==='night'?'#3a4460':'#c3ccd8'}"/>`;
  s += `</svg>`; return s;
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
