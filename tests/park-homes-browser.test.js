import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8128',session='park-homes-28',out='/tmp/vibe-park-homes';mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:90000});
const ev=s=>JSON.parse(cli('eval',s).trim()),state=()=>ev('__vibeInspect.snapshot()');
function enter(){cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');ev("document.getElementById('enterBtn').click();window.testKey=(key,down=true)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key}));true");}
function place(x,z,lx,lz){ev(`(async()=>{__vibeInspect.place(${x},${z},${lx},${lz});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true;})()`);}
function close(){ev("document.querySelector('.life-overlay [data-close]')?.click();true");}
function listings(){place(72.5,28.8,72.5,30.8);ev("testKey('e');testKey('e',false);true");assert.ok(ev("!document.querySelector('.life-overlay').hidden"));}
try{
 enter();listings();assert.equal(ev("document.querySelector('[data-buy-home=mercer]').disabled"),true);assert.equal(state().commerce.life.wallet,120);close();
 console.log('ok  physical listings board opens five homes and prevents unaffordable purchase');
 for(const [x,id] of [[69,'mercer'],[90,'parkview']]){
   place(x,30,x,38);ev("testKey('w');true");cli('wait','--fn','__vibeInspect.snapshot().position.z>35.5');ev("testKey('w',false);true");assert.equal(state().zone,'mercerrow');
   place(x,37.7,x-8,37.7);ev("testKey('w');true");cli('wait','1100');ev("testKey('w',false);true");assert.ok(state().position.x>=x-2);assert.equal(state().homes[id].locked,true);
 }
 console.log('ok  both entry halls are walkable and private doors stay locked before purchase');
 ev(`(async()=>{const {loadProgress,saveProgress}=await import('./js/progress.js');const {normalizeLife}=await import('./js/life.js');const p=loadProgress();p.night.commerce.life=normalizeLife({wallet:1100,properties:['studio'],home:'studio',furnishings:['plant','lamp'],installed:['plant','lamp']});__vibeInspect.world.renderer.setAnimationLoop(null);saveProgress(p);return true;})()`);
 enter();listings();ev("document.querySelector('[data-buy-home=mercer]').click();true");assert.equal(state().commerce.life.wallet,840);assert.equal(state().homes.mercer.locked,false);assert.deepEqual(state().homes.mercer.furnishings,['plant','lamp']);assert.deepEqual(state().homes.studio.furnishings,[]);close();
 place(69,37.7,61,37.7);ev("testKey('w');true");cli('wait','--fn','__vibeInspect.snapshot().position.x<65');ev("testKey('w',false);true");assert.ok(Math.abs(state().position.y-1.7)<.15);cli('screenshot',out+'/garden-flat.png');
 console.log('ok  purchase charges $260 once, unlocks the ground-floor door and moves furnishings');
 listings();ev("document.querySelector('[data-buy-home=parkview]').click();true");assert.equal(state().commerce.life.wallet,420);assert.equal(state().homes.parkview.locked,false);assert.deepEqual(state().homes.parkview.furnishings,['plant','lamp']);assert.deepEqual(state().homes.mercer.furnishings,[]);close();
 place(90,37.7,82,37.7);ev("testKey('w');true");cli('wait','--fn','__vibeInspect.snapshot().position.x<86');ev("testKey('w',false);true");cli('screenshot',out+'/parkview.png');
 enter();assert.equal(state().commerce.life.wallet,420);assert.equal(state().commerce.life.home,'parkview');assert.deepEqual(state().commerce.life.properties,['studio','mercer','parkview']);assert.equal(state().homes.parkview.locked,false);
 console.log('ok  second purchase costs $420; old and new keys, furniture and wallet survive reload');
 cli('set','viewport','390','844');listings();assert.equal(ev("document.querySelector('.life-overlay .shop-scroll').scrollWidth<=document.querySelector('.life-overlay .shop-scroll').clientWidth+1"),true);cli('screenshot',out+'/mobile-listings.png');close();
 const poses=ev(`(async()=>{const {createHuman,animateHuman}=await import('./js/human.js');const h=createHuman({outfit:'pharmacist',umbrella:true});h.userData.phase=0;const scales=[];for(const t of [0,.08,.16,2]){animateHuman(h,t,{mode:'idle'});scales.push(h.userData.eyelids[0].scale.y);}return scales;})()`);assert.equal(poses[1],.08);assert.equal(poses[3],1);
 assert.equal(cli('errors').trim(),'');console.log('ok  mobile listings fit, eyes blink and the browser reports no errors');
}finally{cli('close');}
