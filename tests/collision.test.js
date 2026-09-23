import assert from 'node:assert/strict';
import {resolveMovement} from '../js/collision.js';
import {buildColliders} from '../js/zones.js';
const c=buildColliders();
for(const dx of [.18,.29,1.5,8]){
 const p={x:24.62-dx,y:6.1,z:-3.3};resolveMovement(p,{x:24.62,z:-3.3},c);
 assert.ok(p.x>=24.58,'locked apartment gate blocks an entire step');
}
const unlocked={...c,boxes:c.boxes.filter(b=>b.homeGate!=='studio')};
const p={x:23.9,y:6.1,z:-3.3};resolveMovement(p,{x:25.6,z:-3.3},unlocked);assert.equal(p.x,23.9);
const simple={bounds:{minX:-10,maxX:10,minZ:-10,maxZ:10},boxes:[{minX:0,maxX:.02,minZ:-5,maxZ:5,minY:0,maxY:3}]};
assert.deepEqual(resolveMovement({x:2,y:1.7,z:3},{x:-2,z:0},simple),{x:0,y:1.7,z:3},'thin wall blocks x while allowing sliding');
assert.equal(resolveMovement({x:2,y:4,z:3},{x:-2,z:0},simple).x,2,'different floors remain separate');
const entry={x:124,y:1.7,z:34};resolveMovement(entry,{x:124,z:30.8},c);assert.equal(entry.z,34,'open storefront remains enterable');
const counter={x:124,y:1.7,z:37};resolveMovement(counter,{x:124,z:33.8},c);assert.ok(counter.z<=35.1,'cannot jump through new counter');
console.log('ok  swept movement prevents thin-door and counter tunneling, preserves sliding and purchased entry');
