/* ============================================================
   sound.js — all sounds are synthesized with the Web Audio API
   (no audio files, so the whole app stays self-contained)
   ============================================================ */
const sfx = (()=>{
  let ctx=null, muted=false;
  function ensure(){
    if(!ctx){ try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
    if(ctx && ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  function tone(freq,start,dur,type,vol){
    if(muted) return; const c=ensure(); if(!c) return;
    const t=c.currentTime+start, o=c.createOscillator(), g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+0.03);
  }
  function slide(f1,f2,start,dur,type,vol){
    if(muted) return; const c=ensure(); if(!c) return;
    const t=c.currentTime+start, o=c.createOscillator(), g=c.createGain();
    o.type=type||'sawtooth'; o.frequency.setValueAtTime(f1,t); o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.14,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+0.03);
  }
  return {
    ensure,
    toggle(){ muted=!muted; if(!muted){ ensure(); this.tap(); } return muted; },
    isMuted(){ return muted; },
    tap(){ tone(520,0,0.09,'triangle',0.16); },
    select(){ tone(523,0,0.1,'triangle',0.2); tone(784,0.08,0.12,'triangle',0.2); },
    go(){ [523,659,784,1047].forEach((f,i)=>tone(f,i*0.08,0.14,'triangle',0.2)); slide(170,90,0,0.5,'sawtooth',0.08); },
    horn(){ tone(392,0,0.13,'square',0.13); tone(392,0.17,0.15,'square',0.13); },
    siren(){ for(let i=0;i<3;i++){ tone(840,i*0.34,0.16,'sine',0.15); tone(620,i*0.34+0.17,0.16,'sine',0.15); } },
    warp(){ slide(220,1200,0,0.4,'sine',0.12); slide(1200,300,0.2,0.4,'triangle',0.08); }, // spaceship!
    ding(){ tone(1047,0,0.5,'sine',0.2); tone(1568,0,0.5,'sine',0.1); },
    pay(){ tone(1245,0,0.07,'square',0.15); tone(1661,0.09,0.1,'square',0.15); tone(2093,0.2,0.14,'sine',0.1); },
    points(){ [523,659,784,1047,1319].forEach((f,i)=>tone(f,i*0.09,0.16,'triangle',0.18)); tone(2093,0.5,0.35,'sine',0.09); tone(2637,0.6,0.3,'sine',0.06); }
  };
})();
