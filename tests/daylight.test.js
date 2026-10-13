import assert from 'node:assert/strict';
import {daylightAt,secondsUntilHour} from '../js/daylight.js';
import {createClock,GAME_PER_REAL,phaseFromElapsed} from '../js/night.js';
import {hotelFurnitureColliders} from '../js/interiors/hotel-layout.js';
import {resolveMovement} from '../js/collision.js';
const at=hour=>daylightAt(hour*3600);
assert.equal(at(12).label,'DAY');assert.equal(at(7).label,'DAWN');assert.equal(at(18).label,'SUNSET');assert.equal(at(23).label,'NIGHT');
assert.deepEqual(at(0),at(24));assert.deepEqual(at(-1),at(23));
assert.ok(at(12).sunY>0&&at(0).moonY>0);
assert.ok(at(12).sunInt>at(0).sunInt*10);assert.ok(at(12).lamp<at(0).lamp/4);
for(let s=0;s<86400;s+=60){const a=daylightAt(s),b=daylightAt(s+1);for(const k of ['daylight','lamp','hemiOut','exposeOut','sunInt']){assert.ok(Number.isFinite(a[k]));assert.ok(Math.abs(a[k]-b[k])<.003,`${k} changes smoothly at ${s}`);}assert.ok(a.daylight>=0&&a.daylight<=1);}
assert.equal(secondsUntilHour(22*3600,7),9*3600);assert.equal(secondsUntilHour(7*3600,22),15*3600);assert.equal(secondsUntilHour(7*3600,7),86400);assert.equal(secondsUntilHour(7*3600-.5,7),.5);assert.throws(()=>secondsUntilHour(0,24));
const c=createClock(0);c.waitUntil(7);assert.equal(c.seconds%86400,7*3600);assert.equal(c.phase,'close');c.waitUntil(22);assert.equal(c.phase,'doors');assert.equal(c.elapsedReal,86400/GAME_PER_REAL);c.tick(2*3600/GAME_PER_REAL);assert.equal(c.phase,'peak');
const restored=createClock();restored.tick(c.elapsedReal);assert.equal(restored.clock,c.clock);const before=c.elapsedReal;c.tick(-1);c.tick(Infinity);assert.equal(c.elapsedReal,before);
assert.equal(phaseFromElapsed(86400+45*60),'heat');
const fixtures={bounds:{minX:16.5,maxX:38.8,minZ:-16.5,maxZ:12.5},boxes:hotelFurnitureColliders()};
for(const [a,b] of [[[29.8,11],[36.9,11]],[[36.9,11],[36.9,-13]],[[29,2],[29,-14]],[[25,0],[25,-7]]]){const pos={x:b[0],z:b[1],y:1.7};resolveMovement(pos,{x:a[0],z:a[1]},fixtures);assert.equal(pos.x,b[0]);assert.equal(pos.z,b[1]);}
const table={x:22.6,z:-6,y:1.7};resolveMovement(table,{x:22.6,z:-4},fixtures);assert.equal(table.z,-5.4,'coffee table blocks walking');
console.log('ok  continuous daylight, repeating nights, wait controls, clock restore and hotel furniture routes');
