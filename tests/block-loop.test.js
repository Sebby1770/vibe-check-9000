import assert from 'node:assert/strict';
import {BLOCK_ROADS} from '../js/district-layout.js';
import {buildColliders,getZone} from '../js/zones.js';
import {resolveMovement} from '../js/collision.js';
const c=buildColliders();
const clear=(x,z)=>c.boxes.every(b=>1.7<b.minY||1.7>b.maxY||x<b.minX-.24||x>b.maxX+.24||z<b.minZ-.24||z>b.maxZ+.24);
for(const road of BLOCK_ROADS){
  const [a,b]=[road.a,road.b],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
  for(let i=0;i<=steps;i++){
    const x=a[0]+(b[0]-a[0])*i/steps,z=a[1]+(b[1]-a[1])*i/steps;
    assert.ok(clear(x,z),`${road.name} blocked at ${x},${z}`);
    assert.ok(x>c.bounds.minX&&x<c.bounds.maxX&&z>c.bounds.minZ&&z<c.bounds.maxZ);
  }
}
// Walk the complete outer rectangle, using actual swept movement rather than teleporting.
const points=[[-99,-48],[187,-48],[187,96],[-99,96],[-99,-48]];
const p={x:-99,y:1.7,z:-48};
for(const [x,z] of points.slice(1)){
  const dx=x-p.x,dz=z-p.z,n=Math.ceil(Math.hypot(dx,dz)*2);
  for(let i=0;i<n;i++){const old={x:p.x,z:p.z};p.x+=dx/n;p.z+=dz/n;resolveMovement(p,old,c);}
  assert.ok(Math.hypot(p.x-x,p.z-z)<.001,'perimeter remains continuous');
}
assert.equal(getZone(109,96),'northloop');assert.equal(getZone(0,-48),'southloop');
console.log('ok  all eight roads are walkable, full perimeter loop and alley outlet stay connected');
