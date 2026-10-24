import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8131',session='taxi-35',out='/tmp/vibe-taxi';mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:90000});
const ev=s=>JSON.parse(cli('eval',s).trim());
const frames=(n=4)=>ev(`(async()=>{for(let i=0;i<${n};i++)await new Promise(r=>requestAnimationFrame(r));return true})()`);
const state=()=>ev('__vibeInspect.snapshot()');
try{
 cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');
 ev("if(document.getElementById('muteBtn').textContent==='MUTE')document.getElementById('muteBtn').click();document.getElementById('enterBtn').click();window.testKey=(key,down=true)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key}));true");
 cli('wait','1500');ev('__vibeInspect.waitUntil(22);true');ev("document.getElementById('recapClose')?.click();true");
 // Into the Checker parked outside the club.
 ev('__vibeInspect.place(14.4,16.6,14.4,18.85);true');frames();
 ev("testKey('f');testKey('f',false);true");frames();
 assert.equal(ev('__vibeInspect.drive().car?.kind'),'checker');
 assert.match(ev("document.getElementById('interact').textContent"),/\[T\] TAXI LIGHT/);
 console.log('ok  a parked Checker offers the taxi light');

 ev("testKey('t');testKey('t',false);true");frames();
 let tx=ev('__vibeInspect.taxi()');
 assert.equal(tx.on,true);assert.equal(tx.stage,'pickup');assert.equal(tx.npc,true);
 assert.equal(ev('__vibeInspect.destination?.id'),'taxi-pickup');
 assert.match(ev("document.getElementById('interact').textContent"),/FARE HAILING · \d+ M/);
 const p=tx.fare.pickup;
 // Pull up beside them: the arrow and the map led here; the car stops and they get in.
 ev(`__vibeInspect.moveCar(${p.cabX},${p.cabZ})`);frames(8);
 tx=ev('__vibeInspect.taxi()');
 assert.equal(tx.stage,'ride');assert.equal(tx.npc,false);assert.ok(tx.fare.dest);
 assert.equal(ev('__vibeInspect.destination?.id'),'taxi-dropoff');
 assert.match(ev("document.getElementById('interact').textContent"),/TO .+ · \d+ M · METER \$\d+/);
 cli('screenshot',out+'/ride.png');
 console.log('ok  stopping beside the fare boards them and marks their destination: '+tx.fare.dest);

 const wallet=state().commerce.life.wallet;
 ev(`__vibeInspect.moveCar(${tx.fare.kerb.cabX},${tx.fare.kerb.cabZ})`);frames(8);
 const after=ev('__vibeInspect.taxi()');
 assert.equal(after.fares,1);assert.ok(after.earned>=3);
 assert.equal(state().commerce.life.wallet,wallet+after.earned);
 assert.equal(after.stage,'pickup','the next fare is already hailing');
 console.log(`ok  the drop-off pays $${after.earned} into the wallet and the next fare hails`);

 ev("testKey('f');testKey('f',false);true");frames(6);
 assert.equal(ev('__vibeInspect.taxi().on'),false);
 assert.notEqual(ev('__vibeInspect.destination?.id')||'','taxi-pickup');
 assert.equal(cli('errors').trim(),'');
 console.log('ok  getting out switches the light off; no browser errors');
}finally{cli('close');}
