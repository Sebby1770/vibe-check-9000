import assert from 'node:assert/strict';
import { LOCAL_VENUES, ROUTE_STOPS, normalizeNeighborhood, visitNeighborhood, buyLocal, startRoute, completeRouteStop } from '../js/neighborhood.js';
import { normalizeLife } from '../js/life.js';

const fresh=()=>({completed:['blue-hour'],life:normalizeLife(),neighborhood:normalizeNeighborhood()});
const items=LOCAL_VENUES.flatMap(venue=>venue.items);
const token=state=>`${state.neighborhood.active.serial}:${state.neighborhood.active.stop}`;
assert.deepEqual(LOCAL_VENUES.map(venue=>venue.id),['books','bakery','arcade']);
assert.deepEqual(ROUTE_STOPS,['books','arcade']);
assert.equal(new Set(items.map(item=>item.id)).size,items.length,'purchases have globally unique IDs');
for(const venue of LOCAL_VENUES) {
  assert.ok(venue.name && venue.owner && venue.tag && venue.description && venue.color);
  assert.ok(venue.items.length>=2);
  for(const item of venue.items) {
    assert.ok(item.name && item.description && item.icon);
    assert.equal(item.kind,'keepsake');
    assert.ok(Number.isInteger(item.price) && item.price>=3 && item.price<=18);
  }
}

for(const bad of [null,undefined,0,'bad',[],false]) assert.deepEqual(normalizeNeighborhood(bad),normalizeNeighborhood());
const normalized=normalizeNeighborhood({purchases:[items[0].id,items[0].id,'unknown',null,7],visited:['arcade','arcade','unknown',{}],routes:-4,bonusClaimed:'yes',active:{stop:0,serial:1},unexpected:'discard'});
assert.deepEqual(normalized,{purchases:[items[0].id],visited:['arcade'],routes:0,bonusClaimed:false,arcadeBest:0,active:{stop:0,serial:1}});
assert.equal(normalizeNeighborhood({routes:Infinity}).routes,0);
assert.equal(normalizeNeighborhood({routes:3.9}).routes,3);
assert.equal(normalizeNeighborhood({routes:Number.MAX_VALUE}).routes,1000000);
for(const active of [{stop:-1,serial:1},{stop:2,serial:1},{stop:0.5,serial:1},{stop:0,serial:0},{stop:0,serial:2},{stop:'0',serial:1},{stop:0,serial:'1'},[],true]) {
  assert.equal(normalizeNeighborhood({active}).active,null,'malformed or mismatched routes cannot resume');
}
assert.deepEqual(normalizeNeighborhood({routes:2,active:{stop:1,serial:3,extra:'discard'}}).active,{stop:1,serial:3});
assert.equal(startRoute({...fresh(),neighborhood:{routes:Number.MAX_VALUE}}).ok,false,'capped serials cannot repeat');

let state=fresh();
const original=structuredClone(state);
assert.equal(buyLocal({...state,life:{wallet:0}},items[0].id).ok,false);
assert.equal(buyLocal({...state,life:{wallet:0}},items[0].id).state.neighborhood.purchases.length,0);
assert.equal(buyLocal(state,'invalid').ok,false);
assert.deepEqual(state,original,'failed purchases leave the input untouched');
for(const item of items) {
  const before=state.life.wallet;
  const result=buyLocal(state,item.id);
  assert.ok(result.ok);
  assert.equal(result.state.life.wallet,before-item.price);
  assert.equal(result.state.life.ledger.at(-1).amount,-item.price);
  assert.deepEqual(result.state.completed,['blue-hour'],'unrelated commerce fields survive transactions');
  const duplicate=buyLocal(result.state,item.id);
  assert.equal(duplicate.ok,false);
  assert.equal(duplicate.state.life.wallet,result.state.life.wallet);
  state=result.state;
}
assert.deepEqual(normalizeNeighborhood(JSON.parse(JSON.stringify(state.neighborhood))),state.neighborhood,'permanent collection survives save round trips');

state=fresh();
assert.equal(visitNeighborhood(state,'invalid').ok,false);
const startWallet=state.life.wallet;
for(const venueId of ['bakery','books']) {
  const result=visitNeighborhood(state,venueId);
  assert.ok(result.ok);
  assert.equal(result.paid,undefined);
  state=result.state;
}
const visit=visitNeighborhood(state,'arcade');
assert.ok(visit.ok);
assert.equal(visit.paid,20);
assert.equal(visit.state.life.wallet,startWallet+20);
assert.equal(visit.state.neighborhood.bonusClaimed,true);
for(const venue of LOCAL_VENUES) {
  const again=visitNeighborhood(visit.state,venue.id);
  assert.equal(again.paid,undefined);
  assert.equal(again.state.life.wallet,startWallet+20,'welcome envelope is paid only once');
}
const claimed=visitNeighborhood({...fresh(),neighborhood:{visited:[],bonusClaimed:true}},'books');
assert.equal(claimed.state.neighborhood.bonusClaimed,true,'an existing claim cannot be reset by visiting');

state=fresh();
assert.equal(completeRouteStop(state,'books','1:0').ok,false,'no deliveries without a route');
let priorToken=null;
for(let route=0;route<3;route++) {
  const before=structuredClone(state);
  const pickup=startRoute(state);
  assert.ok(pickup.ok);
  assert.deepEqual(state,before,'starting a route leaves the input unchanged');
  state=pickup.state;
  assert.deepEqual(state.neighborhood.active,{stop:0,serial:route+1});
  assert.equal(startRoute(state).ok,false,'a second pickup cannot reset a route');
  assert.equal(completeRouteStop(state,'arcade',token(state)).ok,false,'out-of-order deliveries fail');
  assert.equal(completeRouteStop(state,'bakery',token(state)).ok,false);
  if(priorToken) assert.equal(completeRouteStop(state,'arcade',priorToken).ok,false,'an earlier route cannot pay the next one');
  const firstToken=token(state),wallet=state.life.wallet;
  const first=completeRouteStop(state,'books',firstToken);
  assert.ok(first.ok);
  assert.equal(first.paid,undefined);
  assert.equal(first.state.life.wallet,wallet,'first delivery does not prematurely pay');
  assert.equal(completeRouteStop(first.state,'books',firstToken).ok,false,'duplicate first delivery fails');
  state=first.state;
  assert.deepEqual(normalizeNeighborhood(JSON.parse(JSON.stringify(state.neighborhood))),state.neighborhood,'mid-route saves resume the correct stop');
  assert.equal(completeRouteStop(state,'arcade','bad').ok,false);
  assert.equal(completeRouteStop(state,'books',token(state)).ok,false,'returning to the previous stop cannot finish');
  priorToken=token(state);
  const final=completeRouteStop(state,'arcade',priorToken);
  assert.ok(final.ok);
  assert.equal(final.paid,30);
  assert.equal(final.state.life.wallet,wallet+30);
  assert.equal(final.state.life.earned,(route+1)*30);
  assert.equal(final.state.neighborhood.routes,route+1);
  assert.equal(final.state.neighborhood.active,null);
  assert.equal(final.state.life.ledger.at(-1).amount,30);
  assert.equal(completeRouteStop(final.state,'arcade',priorToken).ok,false,'duplicate final delivery cannot pay twice');
  assert.equal(completeRouteStop(final.state,'arcade',priorToken).state.life.wallet,wallet+30);
  state=final.state;
}
assert.equal(state.life.ledger.filter(row=>row.label.includes('courier')).length,3);
assert.deepEqual(state.completed,['blue-hour']);
assert.ok(buyLocal(null,items[0].id).ok,'malformed commerce inputs normalize safely');
console.log('neighborhood: six permanent keepsakes, guarded wallet transitions, welcome reward, save recovery and repeatable courier routes pass');

// Permanent collection, welcome stamps and unfinished work cross the nightly boundary.
const {normalizeCommerce}=await import('../js/commerce.js');
const {loadProgress,touchVisit}=await import('../js/progress.js');
let save=loadProgress({getItem:()=>null});
save.lastDay='2026-09-22';save.night.commerce=normalizeCommerce(state);
save.night.commerce=startRoute(save.night.commerce).state;
const next=touchVisit(save,'2026-09-23');
assert.deepEqual(next.night.commerce.neighborhood,save.night.commerce.neighborhood);
assert.equal(next.night.commerce.life.wallet,save.night.commerce.life.wallet);
const {neighborhoodWaypoint}=await import('../js/neighborhood-navigation.js');
assert.deepEqual(neighborhoodWaypoint({x:124,z:34},{id:'arcade',x:163,z:68}).target,{x:124,z:31});
assert.deepEqual(neighborhoodWaypoint({x:124,z:29},{id:'arcade',x:163,z:68}).target,{x:109,z:29});
assert.deepEqual(neighborhoodWaypoint({x:109,z:29},{id:'arcade',x:163,z:68}).target,{x:109,z:56});

const {recordArcade}=await import('../js/neighborhood.js');
let score=recordArcade(state,3);assert.equal(score.state.neighborhood.arcadeBest,3);
assert.equal(recordArcade(score.state,1).state.neighborhood.arcadeBest,3);
assert.equal(recordArcade(state,9).ok,false);
assert.equal(score.state.life.wallet,state.life.wallet,'arcade is free and does not create money');
