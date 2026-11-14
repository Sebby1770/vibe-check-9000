import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {GOALS} from '../js/ledger.js';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8000',session=process.env.VIBE_TEST_SESSION||'heat-39',out='/tmp/vibe-heat';mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:120000,maxBuffer:64*1024*1024});
const ev=s=>JSON.parse(cli('eval',s).trim());
const state=()=>ev('__vibeInspect.snapshot()'),games=()=>ev('__vibeInspect.games()');
const tap=k=>ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}));window.dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}));true`);
const frames=(n=6)=>ev(`(async()=>{for(let i=0;i<${n};i++)await new Promise(r=>requestAnimationFrame(r));return true})()`);
try{
 cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');
 cli('click','#enterBtn');cli('wait','--fn',"document.body.dataset.phase==='explore'");
 ev("document.getElementById('recapClose')?.click();true");
 const wallet0=state().commerce.life.wallet;

 // Into the Checker, out to 49th Street, and Muldoon comes after you.
 ev('__vibeInspect.place(14.4,16.6,14.4,18.85);true');frames();tap('f');frames();
 assert.equal(ev('__vibeInspect.drive().car?.kind'),'checker');
 ev('__vibeInspect.moveCar(30,96,0)');frames();
 assert.ok(ev('__vibeInspect.startHeat()'));frames(10);
 let g=games();
 assert.equal(g.chase.phase,'chase');assert.equal(g.chase.shown,true,'the cruiser is on the street');
 const d0=Math.hypot(g.chase.cop.x-30,g.chase.cop.z-96);
 assert.ok(d0>60&&d0<140,`he turns up ${d0.toFixed(0)} m away`);
 assert.match(ev("document.querySelector('.heat-bar')?.textContent||''"),/MULDOON.*M BACK/);
 // Sit still: he drives the streets to you and writes you up.
 cli('wait','--fn','__vibeInspect.games().chase===null','--timeout','60000');
 g=games();
 assert.match(g.card,/PULLED OVER.*OFFICER MULDOON.*A ticket for \$15/);
 assert.equal(g.stats.tickets,1);
 assert.ok(g.ledger.includes('red-handed'));
 assert.equal(state().commerce.life.wallet,wallet0-15+10,'a $15 ticket, and $10 for the ledger line');
 cli('screenshot',out+'/caught.png');
 console.log('ok  speeding draws a chase; sit still and Muldoon drives the streets to you: a $15 ticket');

 // Another chase (the inspector starts one at once; on the street there's half a minute's grace), and this time run.
 assert.equal(ev('__vibeInspect.games().chase'),null);
 cli('wait','--fn','__vibeInspect.startHeat()','--timeout','5000');
 frames(10);
 const cop=games().chase.cop;
 // Over on Eighth Avenue, foot down heading downtown: keep moving and stay clear for eight seconds.
 ev('__vibeInspect.moveCar(-380,150,Math.PI/2)');
 const escaped=ev(`(async()=>{const end=performance.now()+20000;while(performance.now()<end&&__vibeInspect.games().chase){window.dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));await new Promise(r=>requestAnimationFrame(r));}window.dispatchEvent(new KeyboardEvent('keyup',{key:'w'}));return !__vibeInspect.games().chase})()`);
 assert.ok(escaped,'the chase ended');
 g=games();
 assert.match(g.card,/CLEAN GETAWAY.*YOU LOST HIM/);
 assert.equal(g.stats.chasesLost,1);
 assert.ok(g.ledger.includes('shake-a-tail'));
 assert.equal(ev("document.querySelector('.heat-bar').hidden"),true);
 console.log(`ok  getting ${Math.round(Math.hypot(cop.x+380,cop.z-150))} m clear for eight seconds loses him`);

 // The ledger: the pause screen's button lists every goal, ticks and all; Esc closes it first.
 tap('Escape');frames();
 cli('click','#pauseLedgerBtn');frames();
 const panel=ev("(()=>{const p=document.querySelector('.ledger-panel');return {open:!p.hidden,rows:p.querySelectorAll('li').length,done:p.querySelectorAll('li.done').length,count:p.querySelector('.ledger-count').textContent}})()");
 assert.deepEqual(panel,{open:true,rows:GOALS.length,done:2,count:`2 OF ${GOALS.length}`});
 cli('screenshot',out+'/ledger.png');
 tap('Escape');frames();
 assert.equal(ev("document.querySelector('.ledger-panel').hidden"),true);
 assert.equal(state().phase,'pause','Esc closed the ledger, not the pause screen');
 assert.match(ev("document.getElementById('pauseGames').textContent"),/LEDGER: 2 of 16/);
 cli('click','#resumeBtn');frames();
 console.log('ok  the ledger lists all sixteen goals with two ticked; Esc closes it and leaves the pause screen');

 // Ticks and counts survive a reload.
 cli('wait','800');cli('reload');cli('wait','--fn','!!window.__vibeInspect');
 cli('click','#enterBtn');cli('wait','--fn',"document.body.dataset.phase==='explore'");
 g=games();
 assert.deepEqual(g.ledger,['shake-a-tail','red-handed']);
 assert.deepEqual(g.stats,{fares:0,chasesLost:1,tickets:1});
 assert.equal(cli('errors').trim(),'');
 console.log('ok  ledger ticks and chase counts survive a reload; no browser errors');
}finally{try{cli('close');}catch{}}
