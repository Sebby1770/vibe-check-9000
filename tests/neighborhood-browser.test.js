import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8128',session=process.env.VIBE_TEST_SESSION||'vibe-neighborhood',out='/tmp/vibe-neighborhood';
mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:60000});
const ev=s=>JSON.parse(cli('eval',s).trim()),state=()=>ev('window.__vibeInspect.snapshot()');
const checks=[];const check=(name,fn)=>{fn();checks.push(name);console.log('ok  '+name);};
const shot=name=>cli('screenshot',out+'/'+name+'.png');
function helpers(){ev(`window.nt={frames:()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),key(k,down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k}));},async place(x,z,lx,lz){document.querySelector('.neighborhood-overlay:not([hidden]) [data-close]')?.click();window.__vibeInspect.place(x,z,lx,lz);await this.frames();},async open(id){const p={books:[124,33.8,124,35.5],bakery:[138,33.8,138,35.5],arcade:[163,66.5,163,68]}[id];await this.place(...p);this.key('e',true);this.key('e',false);await this.frames();return document.querySelector('#neighborhood-title')?.textContent;}};true`);}
try{
 cli('open',url+'/?inspect=1&neighborhood=26');cli('wait','--fn','!!window.__vibeInspect');ev("localStorage.removeItem('vc9k-progress');true");cli('reload');cli('wait','--fn','!!window.__vibeInspect');cli('find','role','button','click','--name','ENTER THE NIGHT');helpers();
 check('walk into all three stores through their front doors and stop at solid counters',()=>{
  for(const [x,z,id] of [[124,30.8,'books'],[138,30.8,'bakery'],[163,63.8,'arcade']]){
   ev(`nt.place(${x},${z},${x},${z+5})`);ev("nt.key('w',true);true");cli('wait','--fn',`window.__vibeInspect.snapshot().position.z>=${id==='arcade'?67.59:35.09}`);ev("nt.key('w',false);true");const s=state();assert.equal(s.zone,id);assert.ok(s.position.z<=(id==='arcade'?67.61:35.11),'counter stops movement');assert.equal(s.target,id);shot(id+'-interior');
  }
 });
 check('purchases debit once and refresh ownership and focus',()=>{
  assert.equal(ev("nt.open('books')"),'Blue Note Books');const before=state().commerce.life.wallet;
  ev("document.querySelector('[data-buy=east-pocket-poems]').click();true");assert.equal(state().commerce.life.wallet,before-9);assert.ok(ev("document.querySelector('[data-buy=east-pocket-poems]').disabled"));assert.ok(ev("document.querySelector('.neighborhood-overlay').contains(document.activeElement)"));shot('bookshop-menu');
 });
 check('bakery starts a saved route and duplicate starts cannot replace it',()=>{
  ev("nt.open('bakery')");ev("document.querySelector('[data-start-route]').click();true");assert.equal(state().commerce.neighborhood.active.stop,0);assert.equal(ev("!!document.querySelector('[data-start-route]')"),false);shot('bakery-route');
 });
 check('first parcel delivers at the bookshop and resumes after reload',()=>{
  ev("nt.open('books')");ev("document.querySelector('[data-route-stop=books]').click();true");assert.equal(state().commerce.neighborhood.active.stop,1);
  cli('reload');cli('wait','--fn','!!window.__vibeInspect');cli('find','role','button','click','--name','ENTER THE NIGHT');helpers();assert.equal(state().commerce.neighborhood.active.stop,1);assert.ok(state().commerce.neighborhood.purchases.includes('east-pocket-poems'));
 });
 check('third counter pays welcome once; final parcel pays exactly $30',()=>{
  const before=state().commerce.life.wallet;ev("nt.open('arcade')");assert.equal(state().commerce.life.wallet,before+20);assert.ok(state().commerce.neighborhood.bonusClaimed);
  ev("document.querySelector('[data-route-stop=arcade]').click();true");assert.equal(state().commerce.life.wallet,before+50);assert.equal(state().commerce.neighborhood.routes,1);assert.equal(state().commerce.neighborhood.active,null);
  ev("nt.open('arcade')");assert.equal(state().commerce.life.wallet,before+50);shot('arcade-menu');
 });
 check('Signal Match handles mistakes, clears three rounds and stores a best',()=>{
  ev("document.querySelector('[data-game-start]').click();true");
  for(let round=0;round<3;round++){
   const sequence=ev("document.querySelector('.neighborhood-signal').textContent.split(' → ').map(s=>['STAR','MOON','SUN'].indexOf(s))");ev("document.querySelector('[data-game-ready]').click();true");
   if(round===0){ev(`document.querySelector('[data-game-pad="${(sequence[0]+1)%3}"]').click();true`);assert.ok(ev("document.querySelector('.neighborhood-game').textContent.includes('Almost')"));}
   for(const note of sequence)ev(`document.querySelector('[data-game-pad="${note}"]').click();true`);
   assert.equal(state().commerce.neighborhood.arcadeBest,round+1);
  }
  assert.ok(ev("document.querySelector('.neighborhood-game').textContent.includes('Perfect signal')"));shot('arcade-perfect');
 });
 check('phone-sized stores fit and Escape releases controls',()=>{
  cli('set','viewport','390','844');
  for(const id of ['books','bakery','arcade']){ev(`nt.open('${id}')`);assert.ok(ev("document.querySelector('.neighborhood-sheet').getBoundingClientRect().width<=innerWidth"));assert.ok(ev("document.querySelector('.neighborhood-scroll').scrollWidth<=document.querySelector('.neighborhood-scroll').clientWidth+1"));shot(id+'-mobile');}
  cli('press','Escape');assert.equal(state().phase,'explore');assert.equal(ev("document.getElementById('visor').inert"),false);
 });
 check('saved score and welcome reward survive reload',()=>{
  const before=state().commerce.life.wallet;cli('reload');cli('wait','--fn','!!window.__vibeInspect');cli('find','role','button','click','--name','ENTER THE NIGHT');helpers();ev("nt.open('arcade')");assert.equal(state().commerce.neighborhood.arcadeBest,3);assert.equal(state().commerce.life.wallet,before);
 });
 assert.equal(cli('errors').trim(),'');writeFileSync(out+'/report.json',JSON.stringify({passed:checks.length,checks},null,2));console.log(checks.length+' neighborhood browser journeys passed');
}finally{cli('close');}
