import assert from 'node:assert/strict';
import { buildColliders, getZone, getFloorY } from '../js/zones.js';
import { DISTRICT_BUILDINGS, DISTRICT_PARKS, DISTRICT_PLACES, DISTRICT_SEATS } from '../js/district-layout.js';
import { DESTINATIONS } from '../js/commerce.js';
import { grooveStep, musicMix, swungEighthDuration } from '../js/music.js';
const {bounds,boxes}=buildColliders();
const clear=(x,z)=>x>=bounds.minX&&x<=bounds.maxX&&z>=bounds.minZ&&z<=bounds.maxZ&&boxes.every(b=>1.7<b.minY||1.7>b.maxY||x<b.minX-.24||x>b.maxX+.24||z<b.minZ-.24||z>b.maxZ+.24);
// Continuous routes from the original block, around both parks and up the avenue.
for(const [a,b] of [[[50,23],[170,23]],[[109,-27],[109,74]],[[96,56],[173,56]],[[77,23],[77,6]],[[140,23],[140,6]],[[140,6],[132,6]]]){
  const count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
  for(let i=0;i<=count;i++){const x=a[0]+(b[0]-a[0])*i/count,z=a[1]+(b[1]-a[1])*i/count;assert.ok(clear(x,z),`route blocked at ${x},${z}`);assert.equal(getFloorY(x,z,0),0);}
}
for(const b of DISTRICT_BUILDINGS)assert.ok(!clear(b.x,b.z),`${b.name} has solid walls`);
for(const p of DISTRICT_PARKS)assert.equal(getZone(p.x,p.z+6),p.id);
for(const p of DISTRICT_PLACES){assert.ok(clear(p.x,p.z));assert.ok(DESTINATIONS.some(d=>d.id===p.id));}
for(const s of DISTRICT_SEATS)assert.ok(clear(s.x,s.z-1.2),`${s.id} can be approached`);
const chords=new Set();
for(let i=0;i<32;i++)for(const tone of [-3,0,4])for(const rhythm of [0,1,2]){
  const note=grooveStep(i,tone,rhythm);
  for(const f of [note.bass,note.melody,...note.chord||[]].filter(Boolean))assert.ok(Number.isFinite(f)&&f>20&&f<2000);
  if(note.chord)chords.add(note.chord.join(','));
}
assert.ok(chords.size>=12,'four harmonies, transposed with the record');
assert.equal(grooveStep(0).kick,true);assert.equal(grooveStep(2).clap,true);assert.equal(grooveStep(1).bass,null,'bass breathes between notes');
for(const bpm of [96,118,128])assert.ok(Math.abs(swungEighthDuration(0,bpm)+swungEighthDuration(1,bpm)-60/bpm)<1e-12);
for(const zone of ['club','lounge','street','mercer','hawthorne','eastavenue','48th','records']){
  const [house,jazz,rain]=musicMix(zone);assert.ok(house+jazz>.5);assert.ok(house===0||jazz===0,'one arrangement at a time');assert.ok(rain<=.025);
}
console.log('ok  east district routes, solid buildings, park access, map destinations and jazz-house arrangement');
