/* Permanent East District discoveries, keepsakes and a walking courier job. */
import { normalizeLife, spend, credit, money } from './life.js';

export const LOCAL_VENUES = [
  {id:'books',name:'Blue Note Books',owner:'EDITH',tag:'A good story travels.',color:'#90a997',
    description:'Pocket editions, curious maps and a bookseller who remembers your name. Each purchase is a permanent keepsake.',
    items:[
      {id:'east-pocket-poems',name:'Midnight pocket poems',price:9,kind:'keepsake',icon:'▤',description:'A clothbound anthology, signed by Edith. A permanent addition to your collection.'},
      {id:'east-district-map',name:'The hand-drawn district map',price:6,kind:'keepsake',icon:'⌘',description:'A folded, illustrated map of the new streets and their secret corners. Keep it for every visit.'},
    ]},
  {id:'bakery',name:'Sunrise Bakery',owner:'ROSA',tag:'Warm windows. Early starts.',color:'#d8ae75',
    description:'Rosa keeps a shelf of little things to take home, and always needs a courier for the neighbors. All shelf purchases are permanent keepsakes.',
    items:[
      {id:'east-recipe-folio',name:'Rosa’s handwritten recipes',price:5,kind:'keepsake',icon:'▧',description:'A little folio of family recipes, tied with flour-dusted string. Yours permanently.'},
      {id:'east-biscuit-tin',name:'The bluebird biscuit tin',price:8,kind:'keepsake',icon:'▣',description:'An illustrated display tin for your collection. The keepsake stays with you each night.'},
    ]},
  {id:'arcade',name:'Eastern Arcade',owner:'LENNY',tag:'One more round, one more story.',color:'#c89ec6',
    description:'Bright machines, local legends and souvenirs for the cabinet of memories. Each purchase is a permanent keepsake.',
    items:[
      {id:'east-lucky-pin',name:'Eastern Star enamel pin',price:7,kind:'keepsake',icon:'★',description:'A brass-and-enamel star from Lenny’s counter. A permanent badge of your visit.'},
      {id:'east-score-card',name:'The hall-of-fame score card',price:3,kind:'keepsake',icon:'♧',description:'A collectible printed card celebrating the arcade’s neighborhood champions. Keep it forever.'},
    ]},
];

export const ROUTE_STOPS = ['books','arcade'];
const VENUE_IDS = LOCAL_VENUES.map(venue=>venue.id);
const ITEMS = LOCAL_VENUES.flatMap(venue=>venue.items);
const MAX_ROUTES = 1000000;
const uniqueKnown = (value, known) => Array.isArray(value)
  ? [...new Set(value.filter(id=>typeof id==='string' && known.includes(id)))] : [];

export function normalizeNeighborhood(data={}) {
  if(!data || typeof data!=='object' || Array.isArray(data)) data={};
  const routes=Number.isFinite(data.routes) ? Math.max(0,Math.min(MAX_ROUTES,Math.floor(data.routes))) : 0;
  // A route has two delivery stops. Only its current completion serial can resume.
  const candidate=data.active;
  const active=candidate && typeof candidate==='object' && !Array.isArray(candidate)
    && routes<MAX_ROUTES && Number.isInteger(candidate.stop)
    && candidate.stop>=0 && candidate.stop<ROUTE_STOPS.length
    && Number.isSafeInteger(candidate.serial) && candidate.serial===routes+1
    ? {stop:candidate.stop,serial:candidate.serial} : null;
  return {
    purchases:uniqueKnown(data.purchases,ITEMS.map(item=>item.id)),
    active,routes,visited:uniqueKnown(data.visited,VENUE_IDS),
    bonusClaimed:data.bonusClaimed===true,
    arcadeBest:Number.isFinite(data.arcadeBest)?Math.max(0,Math.min(3,Math.floor(data.arcadeBest))):0,
  };
}

function prepare(input) {
  const original=input && typeof input==='object' && !Array.isArray(input) ? input : {};
  return {...original,life:normalizeLife(original.life),neighborhood:normalizeNeighborhood(original.neighborhood)};
}

export function visitNeighborhood(inputCommerce,venueId) {
  const state=prepare(inputCommerce),venue=LOCAL_VENUES.find(v=>v.id===venueId);
  if(!venue) return {state,ok:false,message:'That neighborhood counter is unavailable.'};
  const neighborhood=state.neighborhood;
  if(!neighborhood.visited.includes(venueId)) neighborhood.visited.push(venueId);
  if(!neighborhood.bonusClaimed && VENUE_IDS.every(id=>neighborhood.visited.includes(id))) {
    neighborhood.bonusClaimed=true;
    state.life=credit(state.life,20,'East District · neighborhood welcome');
    return {state,ok:true,paid:20,message:'You met all three East District shopkeepers. A $20 welcome envelope is yours.'};
  }
  return {state,ok:true,message:`Welcome to ${venue.name}. ${neighborhood.visited.length} of 3 neighborhood counters discovered.`};
}

export function buyLocal(inputCommerce,itemId) {
  const state=prepare(inputCommerce),item=ITEMS.find(i=>i.id===itemId);
  if(!item) return {state,ok:false,message:'That keepsake is unavailable.'};
  if(state.neighborhood.purchases.includes(itemId)) return {state,ok:false,message:'Already in your permanent collection. No need to buy it twice.'};
  const purchase=spend(state.life,item.price,item.name);
  state.life=purchase.state;
  if(!purchase.ok) return {state,ok:false,message:purchase.message};
  state.neighborhood.purchases.push(itemId);
  return {state,ok:true,message:`${item.name} is yours for ${money(item.price)}. It stays in your collection every night.`};
}

export function startRoute(inputCommerce) {
  const state=prepare(inputCommerce),neighborhood=state.neighborhood;
  if(neighborhood.active) return {state,ok:false,message:'Your parcel is already packed. Finish your current delivery route first.'};
  if(neighborhood.routes>=MAX_ROUTES) return {state,ok:false,message:'Your courier record is complete. Thank you for keeping the neighborhood moving.'};
  neighborhood.active={stop:0,serial:neighborhood.routes+1};
  return {state,ok:true,message:'Rosa packed your parcel. Walk it to Blue Note Books, then Eastern Arcade. $30 on delivery; no timer.'};
}

export function completeRouteStop(inputCommerce,venueId,token) {
  const state=prepare(inputCommerce),neighborhood=state.neighborhood,active=neighborhood.active;
  if(!active || token!==`${active.serial}:${active.stop}`) {
    return {state,ok:false,message:'That delivery slip is already filed. Check your current route.'};
  }
  const destination=ROUTE_STOPS[active.stop];
  if(venueId!==destination) {
    const venue=LOCAL_VENUES.find(v=>v.id===destination);
    return {state,ok:false,message:`Your next parcel belongs at ${venue.name}. Visit that counter first.`};
  }
  if(active.stop<ROUTE_STOPS.length-1) {
    neighborhood.active.stop++;
    return {state,ok:true,message:'Edith received her parcel and added one for Lenny. Finish at Eastern Arcade for your $30 pay.'};
  }
  neighborhood.active=null;
  neighborhood.routes++;
  state.life=credit(state.life,30,'East District · completed courier route');
  return {state,ok:true,paid:30,message:'Both parcels delivered. $30 paid into your wallet. Rosa has another route whenever you are ready.'};
}

export function recordArcade(inputCommerce,rounds) {
  const state=prepare(inputCommerce);
  if(!Number.isInteger(rounds)||rounds<1||rounds>3)return {state,ok:false,message:'Finish a round at the cabinet first.'};
  state.neighborhood.arcadeBest=Math.max(state.neighborhood.arcadeBest,rounds);
  return {state,ok:true,message:rounds===3?'Perfect signal! All three rounds cleared. Your best is saved.':`Round ${rounds} cleared. Your best is saved.`};
}
