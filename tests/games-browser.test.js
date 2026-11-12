import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {COURSES, medalTimes} from '../js/runs.js';
import {RECORDS} from '../js/lost45s.js';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8000',session=process.env.VIBE_TEST_SESSION||'games-38',out='/tmp/vibe-games';mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:120000,maxBuffer:64*1024*1024});
const ev=s=>JSON.parse(cli('eval',s).trim());
const state=()=>ev('__vibeInspect.snapshot()'),games=()=>ev('__vibeInspect.games()');
const tap=k=>ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}));window.dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}));true`);
const frames=(n=6)=>ev(`(async()=>{for(let i=0;i<${n};i++)await new Promise(r=>requestAnimationFrame(r));return true})()`);
function enter(){
 cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');
 cli('click','#enterBtn');cli('wait','--fn',"document.body.dataset.phase==='explore'");
 ev("document.getElementById('recapClose')?.click();true");
}
try{
 enter();
 const wallet0=state().commerce.life.wallet;
 assert.equal(games().pins,COURSES.length+RECORDS.length);

 // --- Midnight Runs: into the Checker outside the club, onto The Block's flag, E to race.
 const block=COURSES[0];
 ev('__vibeInspect.place(14.4,16.6,14.4,18.85);true');frames();tap('f');frames();
 assert.equal(ev('__vibeInspect.drive().car?.kind'),'checker');
 ev(`__vibeInspect.moveCar(${block.start.x},${block.start.z},${block.start.yaw})`);frames();
 assert.match(ev("document.getElementById('interact').textContent"),/\[E\] RACE THE BLOCK\s+·\s+GOLD 0:\d\d\.\d\d/);
 tap('e');frames();
 let g=games();
 assert.ok(g.run&&g.run.countdown>0,'the count is on');
 // Held on the line during the count, however hard you press.
 ev(`(async()=>{const end=performance.now()+900;while(performance.now()<end){window.dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));await new Promise(r=>requestAnimationFrame(r));}window.dispatchEvent(new KeyboardEvent('keyup',{key:'w'}));return true})()`);
 assert.ok(Math.abs(ev('__vibeInspect.drive().car.x')-block.start.x)<0.01,'held on the line');
 cli('wait','--fn','__vibeInspect.games().run?.countdown===0');
 cli('screenshot',out+'/run.png');
 g=games();assert.equal(g.run.gateShown,true);assert.equal(ev('__vibeInspect.destination?.id'),'run-gate');
 // Through every gate (the inspector moves the car; the game does the timing).
 const finished=ev(`(async()=>{const gates=${JSON.stringify(block.gates)};for(const [x,z] of gates){__vibeInspect.moveCar(x,z);for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));}return __vibeInspect.games();})()`);
 assert.equal(finished.run,null,'the run is over');
 const best=finished.saved.runs.block;
 assert.ok(best&&best.best<medalTimes(block).gold,'a gold time is on the board');
 assert.equal(best.medal,3);assert.equal(best.splits,block.gates.length);assert.ok(best.ghost>=2);
 assert.match(finished.card,/MIDNIGHT RUN\s+·\s+THE BLOCK.*GOLD.*\+\$70/);
 assert.equal(state().commerce.life.wallet,wallet0+70,'bronze, silver and gold pay once');
 console.log(`ok  The Block: count-in holds the car, ten gates, ${best.best}s, gold, $70`);

 // Again: the ghost of that run rides along, a slower run pays nothing and keeps the best.
 ev(`__vibeInspect.moveCar(${block.start.x},${block.start.z},${block.start.yaw})`);frames();tap('e');
 cli('wait','--fn','__vibeInspect.games().run?.countdown===0');frames(20);
 assert.equal(games().run.ghostShown,true,'the ghost is on the road');
 cli('wait','2500');
 const second=ev(`(async()=>{const gates=${JSON.stringify(block.gates)};for(const [x,z] of gates){__vibeInspect.moveCar(x,z);for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));}return __vibeInspect.games();})()`);
 assert.equal(second.saved.runs.block.best,best.best);
 assert.match(second.card,/YOUR BEST IS/);
 assert.equal(state().commerce.life.wallet,wallet0+70);
 // Getting out gives the run up.
 ev(`__vibeInspect.moveCar(${block.start.x},${block.start.z},${block.start.yaw})`);frames();tap('e');frames();
 assert.ok(games().run);tap('f');frames();
 assert.equal(games().run,null);
 console.log('ok  the ghost rides along; a slower run changes nothing; getting out abandons it');

 // --- The Lost 45s: walk onto one.
 const rec=RECORDS.find(r=>r.id==='rivoli');
 ev(`__vibeInspect.place(${rec.x+6},${rec.z},${rec.x},${rec.z});true`);frames();
 assert.deepEqual(games().saved.records,[]);
 ev(`__vibeInspect.place(${rec.x+0.8},${rec.z},${rec.x},${rec.z});true`);frames();
 g=games();
 assert.deepEqual(g.saved.records,['rivoli']);
 assert.match(g.card,/LOST 45\s+·\s+1 OF 10.*Midnight at the Rivoli.*Rex pays \$15/);
 assert.equal(state().commerce.life.wallet,wallet0+85);
 cli('screenshot',out+'/record.png');
 console.log('ok  a Lost 45 is picked up by walking onto it and pays $15');

 // --- Floor Fever: G on the dance floor; every note played on time is an S.
 ev('__vibeInspect.place(0,0,0,-6);true');frames();
 assert.match(ev("document.getElementById('interact').textContent"),/\[G\] FLOOR FEVER/);
 const KEYS=['ArrowLeft','ArrowDown','ArrowUp','ArrowRight'];
 // G, then a player that lives in the page and plays every note on time (a single browser call may not outlast
 // the round: the driver retries calls that take over half a minute).
 const start=ev(`(async()=>{const KEYS=${JSON.stringify(KEYS)},key=(k,up=true)=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:k}));if(up)window.dispatchEvent(new KeyboardEvent('keyup',{key:k}));},frame=()=>new Promise(r=>requestAnimationFrame(r));
  key('g');await frame();await frame();
  const begun=__vibeInspect.games(),p0=__vibeInspect.snapshot().position;
  window.__feverPlayed=null;
  (async()=>{for(let i=0;i<10;i++){key('w',false);await frame();}key('w');
   const p1=__vibeInspect.snapshot().position,done=new Set();let f;
   while((f=__vibeInspect.games().fever)){f.notes.forEach((n,i)=>{if(!n[2]&&!done.has(i)&&n[1]<=f.now+0.004){done.add(i);key(KEYS[n[0]]);}});await frame();}
   window.__feverPlayed={moved:Math.hypot(p1.x-p0.x,p1.z-p0.z),result:__vibeInspect.games()};})();
  return {on:!!begun.fever,frozen:begun.frozen,onBeat:begun.fever?.onBeat,lead:begun.fever?begun.fever.first-begun.fever.now:0};})()`);
 assert.ok(start.on,'the round is on');assert.equal(start.frozen,true);
 assert.ok(start.lead>1&&start.lead<5,'a bar of count-in on the beat: '+JSON.stringify(start));
 cli('wait','--fn','!!window.__feverPlayed','--timeout','70000');
 const played=ev('window.__feverPlayed');
 assert.ok(played.moved<0.01,'feet stay put, though W is held');
 const result=played.result;
 assert.equal(result.fever,null);assert.equal(result.frozen,false,'free to walk again');
 assert.equal(result.saved.fever.grade,'S',result.card);
 assert.equal(result.saved.fever.rounds,1);
 assert.match(result.card,/FLOOR FEVER.*GRADE S.*NEW BEST.*0 missed.*\+\$95/);
 assert.equal(state().commerce.life.wallet,wallet0+85+95);
 console.log(`ok  Floor Fever: ${result.saved.fever.best} points, grade S, $95 for the grades`);

 // Esc stops a round without a result.
 tap('g');frames();assert.ok(games().fever);tap('Escape');frames(10);
 assert.equal(games().fever,null);assert.equal(games().saved.fever.rounds,1);
 ev("document.getElementById('resumeBtn')?.click();true");

 // --- Everything survives a reload, and the pause screen sums it up.
 cli('wait','800');cli('reload');cli('wait','--fn','!!window.__vibeInspect');
 cli('click','#enterBtn');cli('wait','--fn',"document.body.dataset.phase==='explore'");
 g=games();
 assert.equal(g.saved.runs.block.best,best.best);assert.equal(g.saved.runs.block.ghost,best.ghost);
 assert.equal(g.saved.fever.grade,'S');assert.deepEqual(g.saved.records,['rivoli']);
 assert.match(ev("document.getElementById('pauseGames').textContent"),/The Block 0:\d\d\.\d\d gold.*grade S.*1 of 10/);
 assert.equal(cli('errors').trim(),'');
 console.log('ok  times, ghost, grade and records survive a reload; no browser errors');
}finally{try{cli('close');}catch{}}
