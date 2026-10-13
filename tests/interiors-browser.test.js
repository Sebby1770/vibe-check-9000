import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8128',session='vibe-interiors',out='/tmp/vibe-interiors';mkdirSync(out,{recursive:true});
const cli=(...a)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...a],{encoding:'utf8',timeout:60000});
const ev=s=>JSON.parse(cli('eval',s)),state=()=>ev('__vibeInspect.snapshot()'),shot=id=>cli('screenshot',`${out}/${id}.png`);
function enter(){cli('open',url+'/?inspect=1&run='+Date.now());cli('wait','--fn','!!window.__vibeInspect');ev("if(document.getElementById('muteBtn').textContent==='MUTE')document.getElementById('muteBtn').click();document.getElementById('enterBtn').click();true");}
function place(p){ev(`(async()=>{__vibeInspect.place(${p});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true})()`);}
function pause(){cli('press','Escape');if(state().phase==='explore')cli('press','Escape');cli('wait','--fn',"document.body.dataset.phase==='pause'");}
const poses={hotel:[[25,11.8,25,-2],'hotel'],salon:[[28,11,21,6,4.4],'suite'],records:[[-33.2,33,-33.2,39],'records'],pharmacy:[[-21.8,33,-21.8,39],'pharmacy'],florist:[[-12.2,33,-12.2,39],'florist'],rivoli:[[6,33,12,39],'rivoli'],liquor:[[24.6,33,24.6,39],'liquor'],barber:[[35.8,33,35.8,39],'barber'],diner:[[-27,11,-30,-6],'diner'],books:[[124,33,124,40],'books'],bakery:[[138,33,138,40],'bakery'],arcade:[[163,66,163,72],'arcade'],studio:[[23,-3.3,18.8,-5.7,4.4],'suite'],loft:[[23,-11.7,18.8,-14,4.4],'suite'],suite:[[33,-13,28,-15,4.4],'suite'],mercer:[[65,37,60,41],'mercerrow'],parkview:[[86,37,81,41],'mercerrow'],club:[[0,6,0,-8],'club'],lounge:[[-9,7,-4,0,4.4],'lounge'],subway:[[0,28.3,-12,28.3,-5.2],'subway']};
try{
 enter();cli('set','viewport','1280','800');cli('errors','--clear');
 const signs=ev("(async()=>{const {auditSigns}=await import('./tests/tools/sign-audit.js');return auditSigns(__vibeInspect.world)})()");writeFileSync(out+'/signs.json',JSON.stringify(signs,null,2));assert.deepEqual(signs.issues,[],'signs are mounted, unobscured and separated');console.log('ok  '+signs.count+' mounted signs');
 const reports=[];
 for(const [id,[p,zone]] of Object.entries(poses)){place(p);const s=state();assert.equal(s.zone,zone,id);assert.equal(s.audio.muted,true);shot(id);reports.push({id,zone,render:s.render});console.log('ok  '+id+' interior renders in the correct zone with audio muted');}
 // Full room colliders, including apartment gates, must preserve the public approaches.
 const routes=ev(`(async()=>{const {resolveMovement}=await import('./js/collision.js');const c=__vibeInspect.world.colliders;return ${JSON.stringify([[[29.8,11],[35,11],1.7],[[35,11],[35,-13],1.7],[[29.5,0],[29.5,-7],1.7],[[36.9,0],[35.2,0],6.1],[[35.2,0],[35.2,-5],6.1],[[35.2,-5],[32,-5],6.1],[[29.4,-3.3],[25.6,-3.3],6.1]])}.map(([a,b,y])=>{const p={x:b[0],z:b[1],y};resolveMovement(p,{x:a[0],z:a[1]},c);return {expected:b,actual:[p.x,p.z]};});})()`);routes.forEach(r=>assert.deepEqual(r.actual,r.expected));console.log('ok  hotel lobby, stairs and apartment approaches stay open');
 place([140,12,140,-30]);ev('__vibeInspect.look(140,20,-40);true');
 const wallet=state().commerce.life.wallet,homes=state().homes;
 pause();cli('click','#waitMorningBtn');cli('wait','--fn',"__vibeInspect.snapshot().daylight.label==='DAWN'");assert.equal(state().phase,'explore');assert.equal(state().commerce.life.wallet,wallet);assert.deepEqual(state().homes,homes);assert.equal(ev("document.getElementById('hudPhase').textContent"),'DAWN');shot('dawn');
 enter();assert.equal(state().daylight.label,'DAWN','wait choice persists across reload');place([140,12,140,-30]);ev('__vibeInspect.look(140,20,-40);true');
 const lighting=[];
 for(const hour of [12,18,22]){ev(`__vibeInspect.waitUntil(${hour});true`);cli('wait','--fn',`Math.floor(__vibeInspect.snapshot().daylight.hour)===${hour}`);const s=state();lighting.push(s.daylight);assert.equal(s.audio.muted,true);shot('hour-'+hour);}
 assert.equal(lighting[0].sunVisible,true);assert.equal(lighting[2].moonVisible,true);assert.ok(lighting[0].lamp<lighting[2].lamp);assert.notEqual(lighting[0].clear,lighting[2].clear);assert.equal(state().night,'doors');
 pause();cli('click','#waitEveningBtn');cli('wait','--fn',"__vibeInspect.snapshot().night==='doors'&&__vibeInspect.snapshot().phase==='explore'");assert.equal(state().commerce.life.wallet,wallet);console.log('ok  dawn, daylight, sunset, moonlight, repeat nights and saved wait buttons');
 cli('set','viewport','390','844');pause();assert.ok(ev("document.getElementById('waitMorningBtn').getBoundingClientRect().width>0&&document.getElementById('waitMorningBtn').getBoundingClientRect().right<=innerWidth"));assert.ok(ev("document.getElementById('waitEveningBtn').getBoundingClientRect().right<=innerWidth"));shot('pause-mobile');
 assert.equal(cli('errors').trim(),'');writeFileSync(out+'/report.json',JSON.stringify({rooms:reports,signs:signs.count,lighting},null,2));console.log('Interior and day/night browser checks passed. '+out);
}catch(e){shot('failure');throw e;}finally{cli('close');}
