import assert from 'node:assert/strict';
import {normalizeLife,spend,credit,startShift,shiftBrief,submitShift,wage,buyHome,buyFurnishing,updateLife,HOMES,FURNISHINGS,JOBS,lifeColliders} from '../js/life.js';
import {normalizeCommerce,transact,SHOPS_CATALOG} from '../js/commerce.js';
import {touchVisit,saveProgress,loadProgress} from '../js/progress.js';
import {neighborhoodWaypoint} from '../js/neighborhood-navigation.js';
import {buildColliders,getFloorY,getZone,isOutside} from '../js/zones.js';
const fresh=normalizeLife();assert.equal(fresh.wallet,120);assert.deepEqual(normalizeLife(null),fresh);
assert.equal(normalizeLife({wallet:-20}).wallet,0);assert.equal(normalizeLife({wallet:NaN}).wallet,120);
assert.equal(spend(fresh,121,'no').ok,false);assert.deepEqual(spend(fresh,-4,'no').state,fresh);assert.equal(spend(fresh,120,'all').state.wallet,0);
let c=normalizeCommerce();for(const shop of SHOPS_CATALOG)for(const i of shop.items){const r=transact(c,shop.id,i.id);assert.ok(r.ok,`${i.id} affordable from welcome envelope`);c=r.state;}
assert.equal(transact({...c,completed:[],life:{wallet:0}},'records','blue-hour').ok,false);
let r=transact(normalizeCommerce(),'records','blue-hour');assert.equal(r.state.life.wallet,112);assert.equal(transact(r.state,'records','blue-hour').state.life.wallet,112);
for(const job of JOBS){let s=normalizeLife({wallet:0});for(let round=0;round<7;round++){
 s=startShift(s,job.id,145).state;const before=s.wallet,pay=wage(s,job.id);
 assert.equal(startShift(s,job.id==='club'?'records':'club').ok,false);
 for(let order=0;order<3;order++){
  const a=s.active,token=`${a.serial}:${a.order}:${a.job}`,b=shiftBrief(s),wrong=b.recipe.map(n=>(n+1)%3);
  assert.equal(submitShift(s,wrong,token).ok,false);assert.equal(submitShift(s,b.recipe,'bad').ok,false);
  s=submitShift(s,b.recipe,token).state;
  assert.equal(submitShift(s,b.recipe,token).ok,false,'stale submissions cannot pay twice');
  assert.deepEqual(normalizeLife(JSON.parse(JSON.stringify(s))),s,'mid-shift saves resume');
 }
 assert.equal(s.wallet,before+pay);assert.equal(s.experience[job.id],round+1);assert.equal(s.active,null);
 }assert.equal(wage(s,job.id),job.base+10);}
let s=credit(fresh,3000,'test wage');
for(const h of HOMES){const before=s.wallet,r=buyHome(s,h.id);assert.ok(r.ok);s=r.state;assert.equal(s.wallet,before-h.price);assert.equal(buyHome(s,h.id).ok,false);}
for(const i of FURNISHINGS){const r=buyFurnishing(s,i.id);assert.ok(r.ok);s=r.state;assert.equal(buyFurnishing(s,i.id).ok,false);}
assert.equal(s.installed.length,7);s=updateLife(s,'home','studio').state;s=updateLife(s,'furnish','lamp').state;assert.ok(!s.installed.includes('lamp'));
assert.equal(updateLife(fresh,'scene','mint').ok,false);assert.equal(updateLife(fresh,'home','suite').ok,false);assert.equal(updateLife(fresh,'furnish','lamp').ok,false);
let pass=updateLife(fresh,'patron').state;assert.equal(pass.wallet,60);assert.equal(updateLife(pass,'patron').ok,false);assert.equal(updateLife(pass,'scene','mint').state.scene,'mint');
s=startShift(s,'club',17).state;s=submitShift(s,shiftBrief(s).recipe,`${s.active.serial}:0:club`).state;
const storage={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}};
let p=touchVisit(loadProgress(storage),'2026-09-14');p.night.commerce.life=s;p.night.commerce.completed=['blue-hour'];saveProgress(p,storage);
assert.deepEqual(loadProgress(storage).night.commerce.life,s);
const next=touchVisit(loadProgress(storage),'2026-09-15');assert.deepEqual(next.night.commerce.life,s);assert.deepEqual(next.night.commerce.completed,[]);
assert.equal(lifeColliders().filter(b=>b.homeGate).length,HOMES.length);
for(const b of lifeColliders().filter(b=>b.sightMaxY)) {assert.ok(b.maxY>=b.minY+1.7,'beds block the player at eye height');assert.ok(b.sightMaxY<b.minY+1.7,'players can still see over low furniture');}
const boxes=buildColliders().boxes;
function blocked(x,z,y){return boxes.some(b=>x>b.minX-.25&&x<b.maxX+.25&&z>b.minZ-.25&&z<b.maxZ+.25&&y>=b.minY&&y<=b.maxY);}
for(const h of HOMES){assert.equal(getFloorY(h.doorX+1,h.doorZ,h.floorY??4.4),h.floorY??4.4);assert.equal(blocked(h.doorX+1,h.doorZ,(h.floorY??4.4)+1.7),false,`${h.number} doorstep reachable`);assert.ok(blocked(h.doorX,h.doorZ,(h.floorY??4.4)+1.7));}
for(const [x,z] of [[36.9,0],[35.2,-5],[32,-6.5],[25.6,-3.3],[25.6,-9.8]])assert.equal(blocked(x,z,6.1),false,'hotel circulation preserved');
console.log('life: prices, eight careers, raises, replay protection, ownership, saves, day rollover and apartment approaches pass');

for(const h of HOMES.filter(h=>h.floorY===0)){
  assert.equal(getZone(h.doorX+1,h.doorZ),'mercerrow');
  assert.equal(isOutside(h.doorX+1,h.doorZ),false);
  const dest={id:`home-${h.id}`,x:h.doorX+1,z:h.doorZ,y:0};
  assert.deepEqual(neighborhoodWaypoint({x:77,z:15},dest).target,{x:h.entryX,z:32.7});
  assert.deepEqual(neighborhoodWaypoint({x:h.entryX,z:35},dest).target,dest);
}
assert.equal(isOutside(72.5,35),true,'the gap between buildings remains outdoors');
