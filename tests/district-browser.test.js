import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8000',session=process.env.VIBE_TEST_SESSION||'vibe-district',out='/tmp/vibe-check-district';
mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:60000});
const ev=s=>JSON.parse(cli('eval',s).trim()),state=()=>ev('window.__vibeInspect.snapshot()');
const reports=[];const check=(name,fn)=>{fn();reports.push(name);console.log('ok  '+name);};
try{
 cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');cli('find','role','button','click','--name','ENTER THE NIGHT');
 ev(`window.districtTest={frames:()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),key(k,down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k}));},async place(x,z,lx,lz){window.__vibeInspect.place(x,z,lx,lz);await this.frames();}};true`);
 check('walk past the old east boundary using movement controls',()=>{
  ev('districtTest.place(51,23,80,23)');ev("districtTest.key('w',true);true");cli('wait','1600');ev("districtTest.key('w',false);true");assert.ok(state().position.x>54);
 });
 check('both parks have usable seats and a jazz soundtrack',()=>{
  for(const [x,z,id] of [[69,7,'mercer'],[132,7,'hawthorne']]){
   ev(`districtTest.place(${x},${z-1.5},${x},${z})`);assert.equal(state().zone,id);assert.equal(state().audio.bpm,96);
   assert.equal(state().target,id+'-bench-0');ev("districtTest.key('e',true);districtTest.key('e',false);true");assert.equal(state().sitting,true);
   cli('screenshot',out+'/'+id+'.png');ev("districtTest.key('e',true);districtTest.key('e',false);true");assert.equal(state().sitting,false);
  }
 });
 check('48th Street loads with working return directions',()=>{
  ev('districtTest.place(139,61,139,40)');assert.equal(state().zone,'48th');cli('screenshot',out+'/48th-street.png');
  ev("districtTest.key('j',true);districtTest.key('j',false);true");
  ev("document.querySelector('[data-tab=map]').click();true");
  for(const id of ['mercer','hawthorne','eastavenue','48th'])assert.ok(ev(`!!document.querySelector('[data-destination="${id}"]')`));
  ev("document.querySelector('[data-destination=club]').click();true");
 });
 check('umbrella shafts stay at the grip and upright through a walk cycle',()=>{
  const poses=ev(`(async()=>{const {createHuman,animateHuman}=await import('./js/human.js');const {Vector3,Quaternion}=await import('three');const h=createHuman({umbrella:true});const results=[];for(const mode of ['idle','walk'])for(const t of [0,.3,1,2,3]){animateHuman(h,t,{mode});h.updateWorldMatrix(true,true);const u=h.userData.umbrella,j=h.userData.joints;results.push({grip:u.getWorldPosition(new Vector3()).distanceTo(j.lHand.getWorldPosition(new Vector3())),up:new Vector3(0,1,0).applyQuaternion(u.getWorldQuaternion(new Quaternion())).y,clearance:u.children[1].getWorldPosition(new Vector3()).y-j.head.getWorldPosition(new Vector3()).y});}return results;})()`);
  for(const p of poses){assert.ok(p.grip<1e-6);assert.ok(p.up>.999);assert.ok(p.clearance>.25);}
 });
 check('saxophonist hands meet the instrument keys',()=>{
  const hands=ev(`(async()=>{const {createHuman,animateHuman}=await import('./js/human.js');const {Vector3}=await import('three');const h=createHuman({outfit:'salesman',scarf:false,mouth:false});animateHuman(h,1,{mode:'sax'});h.updateWorldMatrix(true,true);const j=h.userData.joints;return [j.lHand,j.rHand].map(hand=>j.spine.worldToLocal(hand.getWorldPosition(new Vector3())).toArray());})()`);
  assert.ok(Math.hypot(...hands[0].map((n,i)=>n-[-.055,.27,.44][i]))<1e-6);
  assert.ok(Math.hypot(...hands[1].map((n,i)=>n-[.005,.15,.42][i]))<1e-6);
  ev('districtTest.place(44.6,16.1,44.6,14.2)');cli('screenshot',out+'/saxophonist.png');
 });
 check('four bars of the piano arrangement render audible finite samples without clipping',()=>{
  const stats=ev(`(async()=>{const {playPiano,grooveStep,swungEighthDuration}=await import('./js/music.js');const c=new OfflineAudioContext(1,44100*12,44100);let t=.05;for(let i=0;i<32;i++){const n=grooveStep(i);if(n.chord)playPiano(c,c.destination,t,n.chord,.07,.8);if(n.melody)playPiano(c,c.destination,t,[n.melody],.06,.3);if(n.bass)playPiano(c,c.destination,t,[n.bass],.1,.22);t+=swungEighthDuration(i,96,.62);}const b=await c.startRendering(),d=b.getChannelData(0);let peak=0,sum=0;for(const n of d){if(!Number.isFinite(n))throw Error('invalid sample');peak=Math.max(peak,Math.abs(n));sum+=n*n;}return {peak,rms:Math.sqrt(sum/d.length)};})()`);
  assert.ok(stats.peak>.1&&stats.peak<1);assert.ok(stats.rms>.015);console.log('audio render',stats);
 });
 assert.equal(cli('errors').trim(),'');
 writeFileSync(out+'/report.json',JSON.stringify({passed:reports.length,checks:reports},null,2));
 console.log(`${reports.length} district browser checks passed`);
}finally{cli('close');}
