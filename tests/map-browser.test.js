import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8131',session='map-31',out='/tmp/vibe-map';mkdirSync(out,{recursive:true});
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:90000});
const ev=s=>JSON.parse(cli('eval',s).trim());
const frames=()=>ev('(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true})()');
function enter(){cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');ev("if(document.getElementById('muteBtn').textContent==='MUTE')document.getElementById('muteBtn').click();document.getElementById('enterBtn').click();window.testKey=(key,down=true)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key}));true");cli('wait','1200');}
function place(x,z,lx,lz,y=0){ev(`(async()=>{__vibeInspect.place(${x},${z},${lx},${lz},${y});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true;})()`);}
const pos=()=>ev('__vibeInspect.world.camera.position.toArray()');
// How much a canvas varies: a blank or single-colour canvas scores ~0.
const ink=id=>ev(`(()=>{const c=document.getElementById('${id}'),g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let s=0,s2=0,n=0;for(let i=0;i<d.length;i+=64){const v=d[i]+d[i+1]+d[i+2];s+=v;s2+=v*v;n++;}return Math.sqrt(s2/n-(s/n)**2);})()`);
const screen=(x,z)=>{const v=ev('__vibeInspect.map().view');return {x:v.w/2-(x-v.cx)*v.s,y:v.h/2-(z-v.cz)*v.s};};
try{
 enter();
 place(-20,20,-40,24);frames();
 assert.equal(ev("getComputedStyle(document.getElementById('minimap')).display"),'block');
 assert.ok(ink('minimapCanvas')>20,'the minimap draws streets and blocks');
 console.log('ok  the minimap draws the streets round you');

 ev("testKey('m');true");frames();cli('wait','300');
 assert.equal(ev("!document.getElementById('cityMap').classList.contains('hidden')"),true);
 assert.equal(ev('document.body.dataset.phase'),'activity');
 assert.ok(ink('cityMapCanvas')>20,'the city map draws');
 cli('screenshot',out+'/map.png');
 // Click Times Square's pin and mark a route there.
 const ts=screen(-245,52);
 assert.equal(ev(`__vibeInspect.mapPick(${ts.x},${ts.y})?.id`),'timessquare');
 const box=ev("(()=>{const r=document.getElementById('cityMapCanvas').getBoundingClientRect();return {x:r.left,y:r.top}})()");
 cli('mouse','move',String(Math.round(box.x+ts.x)),String(Math.round(box.y+ts.y)));cli('mouse','down');cli('mouse','up');frames();
 assert.equal(ev("document.getElementById('mapCardName').textContent"),'Times Square');
 ev("document.getElementById('mapCardMark').click();true");frames();
 assert.equal(ev('__vibeInspect.destination?.id'),'map-timessquare');
 assert.equal(ev("document.getElementById('cityMap').classList.contains('hidden')"),true);
 assert.equal(ev('document.body.dataset.phase'),'explore');
 assert.match(ev("document.getElementById('wayfinder').textContent"),/Times Square/);
 console.log('ok  M opens the map; clicking a pin marks a route the wayfinder follows');

 ev("testKey('m');true");frames();
 assert.equal(ev("!document.getElementById('cityMap').classList.contains('hidden')"),true);
 ev("testKey('Escape');true");frames();
 assert.equal(ev("document.getElementById('cityMap').classList.contains('hidden')"),true);
 assert.equal(ev('document.body.dataset.phase'),'explore');
 console.log('ok  Escape closes the map and hands back control');

 // Board at the 47th Street platform's route map and ride to Times Square.
 place(-16.7,28.8,-16.7,27.3,-5.2);frames();
 assert.match(ev("document.getElementById('interact').textContent"),/ROUTE MAP/);
 ev("testKey('e');testKey('e',false);true");frames();
 assert.deepEqual([ev('__vibeInspect.map().mode'),ev('__vibeInspect.map().from')],['travel','47th']);
 assert.equal(ev("document.querySelector('.map-station.here .map-ride').disabled"),true);
 cli('screenshot',out+'/travel.png');
 ev("document.querySelector('.map-ride[data-station=times]').click();true");
 cli('wait','700');assert.equal(ev("!document.getElementById('rideCard').classList.contains('hidden')"),true);
 assert.match(ev("document.getElementById('rideName').textContent"),/Times Sq/);
 cli('wait','--fn',"document.body.dataset.phase==='explore'&&document.getElementById('rideCard').classList.contains('hidden')");
 let p=pos();assert.ok(Math.hypot(p[0]+242.9,p[2]-33)<0.6&&Math.abs(p[1]-1.7)<0.2,`arrived at Times Square (${p})`);
 cli('screenshot',out+'/times.png');
 console.log('ok  the 47th Street route map rides you to Times Square');

 // And from a street stair head, out to the pier, then the El.
 place(-242.6,33,-239.5,33);frames();
 assert.match(ev("document.getElementById('interact').textContent"),/DOWN TO THE TRAINS/);
 ev("testKey('e');testKey('e',false);true");frames();
 assert.equal(ev('__vibeInspect.map().from'),'times');
 ev("document.querySelector('.map-ride[data-station=pier]').click();true");
 cli('wait','--fn',"document.body.dataset.phase==='explore'&&document.getElementById('rideCard').classList.contains('hidden')");
 p=pos();assert.ok(Math.hypot(p[0]-285.4,p[2]-29.5)<0.6,`arrived at Pier 47 (${p})`);
 ev('__vibeInspect.ride("garment");true');
 cli('wait','--fn',"document.body.dataset.phase==='explore'&&document.getElementById('rideCard').classList.contains('hidden')");
 p=pos();assert.ok(Math.hypot(p[0]-51,p[2]+136.4)<0.6,`arrived under the El (${p})`);
 assert.equal(ev("document.getElementById('hudZone').textContent"),'UNDER THE EL');
 console.log('ok  stair heads board too; rides reach the pier and the El');

 // Phone: the Map button opens a map that fits the screen.
 cli('set','viewport','390','844');frames();
 assert.equal(ev("getComputedStyle(document.getElementById('hudMap')).display!=='none'||matchMedia('(pointer: fine)').matches"),true);
 ev("__vibeInspect.openMap('map');true");frames();cli('wait','300');
 assert.equal(ev("document.querySelector('.city-map-frame').scrollWidth<=innerWidth+1"),true);
 assert.ok(ink('cityMapCanvas')>20);
 cli('screenshot',out+'/mobile.png');
 ev('__vibeInspect.closeMap();true');
 assert.equal(cli('errors').trim(),'');
 console.log('ok  the map fits a phone and the browser reports no errors');
}finally{cli('close');}
