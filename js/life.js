/* Permanent, fictional-dollar economy. Pure rules shared by UI, saves and tests. */
import { WORKSHOPS, counterBrief } from './expansion.js';
export const money = n => `$${Math.floor(n).toLocaleString('en-US')}`;
export const PRICES = {record:8, flowers:6, tonic:3, gin:8, haircut:7, ticket:4, coffee:2, pie:4};
export const FURNISHINGS = [
  {id:'turntable',shop:'records',name:'Walnut listening station',price:38,icon:'◎',color:'#568b86',detail:'A record player for the walnut writing desk in your apartment.'},
  {id:'plant',shop:'florist',name:'Sunday in a pot',price:24,icon:'✿',color:'#739668',detail:'A tall, leafy plant for a corner that needed company.'},
  {id:'lamp',shop:'pharmacy',name:'Milk-glass reading lamp',price:26,icon:'◒',color:'#d3b782',detail:'A warm glow over your bedside table.'},
  {id:'bar',shop:'liquor',name:'The after-hours bar cart',price:42,icon:'♧',color:'#b68b55',detail:'Brass rails, two bottles and enough glasses for a guest.'},
  {id:'mirror',shop:'barber',name:'The dressing-room mirror',price:30,icon:'◇',color:'#b59179',detail:'A brass-framed dressing mirror, ready for the next evening.'},
  {id:'poster',shop:'rivoli',name:'A framed Rivoli original',price:22,icon:'▣',color:'#9583aa',detail:'An original midnight picture poster, framed for your wall.'},
  {id:'breakfast',shop:'diner',name:'The breakfast corner',price:28,icon:'☕',color:'#b97963',detail:'Coffee, a pie plate and a little table for the morning after.'},
];
export const HOMES = [
  {id:'mercer',name:'The Mercer Garden Flat',number:'M1',price:260,x:61,z:37.7,doorX:67,doorZ:37.7,floorY:0,location:'Mercer Row · ground floor',entryX:69,entryZ:31,color:'#728b78',tag:'Your front garden belongs to the whole neighborhood.',detail:'A sage-green apartment opposite Mercer Garden, with a reading salon, walnut furniture and a private entrance hall.'},
  {id:'parkview',name:'The Parkview Residence',number:'M2',price:420,x:82,z:37.7,doorX:88,doorZ:37.7,floorY:0,location:'Mercer Row · ground floor',entryX:90,entryZ:31,color:'#b98362',tag:'A warm home overlooking the park.',detail:'A terracotta apartment with a generous living room, a breakfast corner and room for every furnishing you collect.'},
  {id:'studio',name:'The Bluebird Studio',number:'2A',price:180,x:20.7,z:-3.3,doorX:24.5,doorZ:-3.3,color:'#638d9e',tag:'A small place. A very big first key.',detail:'Walnut bed, blue rug, writing desk and a quiet reading corner.'},
  {id:'loft',name:'The Magnolia Flat',number:'2B',price:340,x:20.7,z:-11.7,doorX:24.5,doorZ:-11.7,color:'#829b73',tag:'Room for records and a slower morning.',detail:'A garden-green salon with a double bed, seating and a dining nook.'},
  {id:'suite',name:'The Marigold Suite',number:'2C',price:560,x:30.2,z:-13,doorX:34.3,doorZ:-13,color:'#c29457',tag:'Your own golden hour, upstairs.',detail:'Amber upholstery, a broad writing desk and the best-dressed bedroom on the floor.'},
];
export const CLUB_SCENES = [
  {id:'electric',name:'Electric orchid',color:'#df43bc',accent:'#46dad1',description:'Pink floor, cool blue washes. The original midnight feeling.'},
  {id:'blue',name:'Blue velvet',color:'#677edc',accent:'#74c4cb',description:'A deep blue room with silver-blue beams.'},
  {id:'amber',name:'Golden hour',color:'#e7a446',accent:'#d87862',description:'Honey light, warm brass and a softer edge.'},
  {id:'mint',name:'Emerald afterparty',color:'#54bc91',accent:'#dac087',description:'Jade and champagne. A thank-you to the club’s patrons.',premium:true},
];
const soundcheck = {id:'club',owner:'REXA',title:'The club soundcheck',noun:'A balanced house set',steps:[['BASS',['Round & warm','Deep pulse','Soft sub']],['PERCUSSION',['Brush shuffle','Handclap snap','Four on the floor']],['TOP LINE',['Blue keys','Neon bells','Velvet brass']]]};
export const JOBS = [...WORKSHOPS.map(w=>({id:w.id,name:w.title,owner:w.owner,base:45})),{id:'club',name:'Soundcheck technician',owner:'REXA',base:55}];
export const LIFE_PLACES = [
  {id:'property',name:'Astoria property desk',x:28.9,z:8.8,y:0,description:'Browse, buy and visit apartments upstairs.'},
  {id:'parkproperty',name:'Mercer Row apartment listings',x:72.5,z:30.8,y:0,description:'Two homes opposite Mercer Garden. Enter from 47th Street.'},
  {id:'clubdesk',name:'Club lighting & soundcheck',x:9.9,z:-9.1,y:0,description:'Set the room’s look or take a soundcheck shift.'},
];
const integer=(n,fallback=0,max=10000000)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):fallback;
const ids=(v,valid)=>Array.isArray(v)?[...new Set(v)].filter(id=>valid.some(x=>x.id===id)):[];
export function dinerTray(data={}) {
  const picks=[0,1,2].map(i=>[0,1,2].includes(data?.picks?.[i])?data.picks[i]:null);
  return {picks,warm:picks[0]!==null&&!!data?.warm,fill:picks[1]===null?0:integer(data?.fill,0,3)};
}
export function normalizeLife(data={}) {
  if(!data||typeof data!=='object') data={};
  const properties=ids(data.properties,HOMES), furnishings=ids(data.furnishings,FURNISHINGS);
  const active=data.active && JOBS.some(j=>j.id===data.active.job) ? {job:data.active.job,order:integer(data.active.order,0,2),serial:integer(data.active.serial),seed:integer(data.active.seed)} : null;
  if(active?.job==='diner')active.tray=dinerTray(data.active.tray);
  return {version:1,wallet:integer(data.wallet,120),earned:integer(data.earned),spent:integer(data.spent),shifts:integer(data.shifts),
    experience:Object.fromEntries(JOBS.map(j=>[j.id,integer(data.experience?.[j.id])])),active,
    properties,home:properties.includes(data.home)?data.home:properties[0]||null,
    furnishings,installed:ids(data.installed,FURNISHINGS).filter(id=>furnishings.includes(id)),
    goal:HOMES.some(h=>h.id===data.goal)?data.goal:'studio',goalChosen:!!data.goalChosen,guideHidden:!!data.guideHidden,patron:!!data.patron,
    scene:CLUB_SCENES.some(s=>s.id===data.scene&&(!s.premium||data.patron))?data.scene:'electric',
    ledger:(Array.isArray(data.ledger)?data.ledger:[]).filter(l=>l&&typeof l.label==='string'&&Number.isFinite(l.amount)).slice(-24).map(l=>({label:l.label.slice(0,100),amount:Math.trunc(l.amount)}))};
}
export function credit(input,amount,label) {
  const state=normalizeLife(input);
  if(!Number.isSafeInteger(amount)||amount<=0)return state;
  state.wallet+=amount;state.earned+=amount;
  state.ledger=[...state.ledger,{label,amount}].slice(-24);return state;
}
export function spend(input,amount,label) {
  const state=normalizeLife(input);
  if(!Number.isSafeInteger(amount)||amount<0)return {state,ok:false,message:'That price is unavailable.'};
  if(state.wallet<amount)return {state,ok:false,message:`You need ${money(amount-state.wallet)} more. A paid shift will help.`};
  state.wallet-=amount;state.spent+=amount;
  if(amount)state.ledger=[...state.ledger,{label,amount:-amount}].slice(-24);
  return {state,ok:true};
}
export function wage(input,id) { const s=normalizeLife(input),j=JOBS.find(j=>j.id===id);return j?j.base+Math.min(10,Math.floor(s.experience[id]/3)*5):0; }
export function startShift(input,id,seed=0) {
  const state=normalizeLife(input);
  if(!JOBS.some(j=>j.id===id))return {state,ok:false,message:'That shift is unavailable.'};
  if(state.active)return {state,ok:state.active.job===id,message:'Your current shift is saved. Finish it before taking another.'};
  state.active={job:id,order:0,serial:state.shifts,seed:integer(seed)+state.shifts*7};
  if(id==='diner')state.active.tray=dinerTray();
  return {state,ok:true,message:'Clocked in. Three orders, then your pay envelope. No timer.'};
}
export function shiftBrief(input) {
  const s=normalizeLife(input),a=s.active;if(!a)return null;
  const seed=a.seed+a.order*5;
  if(a.job!=='club')return counterBrief(a.job,seed);
  const recipe=soundcheck.steps.map((_,i)=>(Math.floor(seed/3**i)+i)%3);
  return {...soundcheck,recipe,request:recipe.map((n,i)=>soundcheck.steps[i][1][n]).join(' · ')};
}
export function submitShift(input,picks,token) {
  let state=normalizeLife(input);const a=state.active,b=shiftBrief(state);
  if(!a||token!==`${a.serial}:${a.order}:${a.job}`)return {state,ok:false,message:'That order is already filed. Check the current slip.'};
  if(a.job==='diner'){
    const tray=a.tray;
    if(!tray.warm||tray.fill!==3)return {state,ok:false,message:'Warm the plate and fill the cup before ringing the bell.'};
    picks=tray.picks;
  }
  if(!Array.isArray(picks)||picks.length!==3||!b.recipe.every((p,i)=>p===picks[i]))return {state,ok:false,message:'Not quite. Match all three lines on the order slip and try again.'};
  if(a.order<2){state.active.order++;if(a.job==='diner')state.active.tray=dinerTray();return {state,ok:true,message:'Order accepted. Here is your next customer.'};}
  const pay=wage(state,a.job);state.experience[a.job]++;state.shifts++;state.active=null;
  state=credit(state,pay,`${JOBS.find(j=>j.id===a.job).owner} · completed shift`);
  return {state,ok:true,paid:pay,message:`Shift complete. ${money(pay)} paid into your wallet. Come back for another whenever you like.`};
}
export function buyHome(input,id) {
  const state=normalizeLife(input),home=HOMES.find(h=>h.id===id);
  if(!home)return {state,ok:false,message:'That apartment is unavailable.'};
  if(state.properties.includes(id))return {state,ok:false,message:'You already own these keys.'};
  const r=spend(state,home.price,`${home.number} · apartment purchase`);if(!r.ok)return r;
  r.state.properties.push(id);r.state.home=id;return {...r,message:`The keys to ${home.name} are yours. ${home.floorY===0?'Your front door is open at Mercer Row, opposite the garden.':'Your front door is now open upstairs.'}`};
}
export function buyFurnishing(input,id) {
  const state=normalizeLife(input),item=FURNISHINGS.find(i=>i.id===id);
  if(!item)return {state,ok:false,message:'That item is unavailable.'};
  if(state.furnishings.includes(id))return {state,ok:false,message:'Already yours. Manage it in My home.'};
  const r=spend(state,item.price,item.name);if(!r.ok)return r;
  r.state.furnishings.push(id);r.state.installed.push(id);
  return {...r,message:`${item.name} is yours. ${state.home?'Delivered to your active apartment.':'Stored safely until you buy your first apartment.'}`};
}
export function updateLife(input,action,id) {
  const state=normalizeLife(input);
  if(action==='home'&&state.properties.includes(id))state.home=id;
  else if(action==='goal'&&HOMES.some(h=>h.id===id)){state.goal=id;state.goalChosen=true;}
  else if(action==='guide')state.guideHidden=id==='hide';
  else if(action==='furnish'&&state.furnishings.includes(id))state.installed=state.installed.includes(id)?state.installed.filter(i=>i!==id):[...state.installed,id];
  else if(action==='scene'&&CLUB_SCENES.some(s=>s.id===id&&(!s.premium||state.patron)))state.scene=id;
  else if(action==='patron'&&!state.patron){const r=spend(state,60,'Club patron pass');if(!r.ok)return r;r.state.patron=true;return {...r,message:'Patron pass collected. Emerald afterparty is ready at the lighting desk.'};}
  else return {state,ok:false,message:'That option is not available yet.'};
  return {state,ok:true,message:action==='guide'?(state.guideHidden?'Guide tucked away. You can reopen it here.':'First-evening guide restored.'):action==='scene'?'The room has a new color.':action==='goal'?'Savings goal updated.':action==='home'?'Home set. Your furnishings have moved with you.':'Room updated.'};
}

export function prepareDiner(input,action,value,token) {
  const state=normalizeLife(input),a=state.active;
  if(a?.job!=='diner'||token!==`${a.serial}:${a.order}:diner`)return {state,ok:false,message:'Check the current order slip.'};
  const tray=a.tray;
  if(['plate','drink','side'].includes(action)&&[0,1,2].includes(value)){
    const i={plate:0,drink:1,side:2}[action];
    if(tray.picks[i]!==value){if(i===0)tray.warm=false;if(i===1)tray.fill=0;}
    tray.picks[i]=value;
  } else if(action==='warm'&&tray.picks[0]!==null)tray.warm=true;
  else if(action==='pour'&&tray.picks[1]!==null&&tray.fill<3)tray.fill++;
  else if(action==='clear')a.tray=dinerTray();
  else return {state,ok:false,message:'Choose an item at this station first.'};
  return {state,ok:true,message:action==='pour'?(tray.fill===3?'Cup filled. Ready for the tray.':`Cup ${tray.fill}/3 full. Pour again.`):action==='warm'?'Plate warmed. Ready to serve.':action==='clear'?'Fresh tray. Same order, no penalty.':'Tray updated. Match the customer’s slip.'};
}

export function firstEvening(input) {
  const s=normalizeLife(input),goal=HOMES.find(h=>h.id===s.goal);
  const steps=[
    {id:'shift',done:s.shifts>0,title:'Earn your first paycheck',copy:s.active?'Your shift is saved. Return to your workplace to finish it.':'Dottie’s is hiring. Serve three customers for $45. No timer.',page:'jobs',destination:s.active?(s.active.job==='club'?'clubdesk':s.active.job):'diner'},
    {id:'goal',done:s.goalChosen||s.properties.length>0,title:'Choose a place to call home',copy:'Compare five apartments and choose SAVE TOWARD THIS. The first key costs $180.',page:'homes'},
    {id:'furnishing',done:s.furnishings.length>0,title:'Pick your first furnishing',copy:'A $24 plant from Lily’s is a good start. It stays in storage until you have a home.',destination:'florist'},
    {id:'keys',done:s.properties.length>0,title:'Collect your apartment keys',copy:s.wallet>=goal.price?`${goal.name} is within reach. Buy it in My Home.`:`${money(Math.max(0,goal.price-s.wallet))} to go for ${goal.name}. Repeat paid shifts to save up.`,page:'homes'},
  ];
  return {steps,next:steps.find(s=>!s.done)||null,completed:steps.filter(s=>s.done).length,hidden:s.guideHidden};
}
export const HOME_BOUNDS = [
  {id:'mercer',minX:54,maxX:67,minZ:33.4,maxZ:43.5},
  {id:'parkview',minX:75,maxX:88,minZ:33.4,maxZ:43.5},
  {id:'studio',minX:17.1,maxX:24.5,minZ:-7.2,maxZ:0.4},
  {id:'loft',minX:17.1,maxX:24.5,minZ:-15.8,maxZ:-7.8},
  {id:'suite',minX:27.1,maxX:34.3,minZ:-15.8,maxZ:-10.4},
];
export function lifeColliders() {
  const boxes=[];let floor=4.4;
  const wall=(a,b,c,d,id)=>boxes.push({minX:a,maxX:b,minZ:c,maxZ:d,minY:floor,maxY:floor+3.3,...(id?{homeGate:id}:{})});
  for(const r of HOME_BOUNDS){const h=HOMES.find(h=>h.id===r.id),z=h.doorZ;floor=h.floorY??4.4;
    wall(r.minX-.08,r.minX+.08,r.minZ,r.maxZ);wall(r.minX,r.maxX,r.minZ-.08,r.minZ+.08);wall(r.minX,r.maxX,r.maxZ-.08,r.maxZ+.08);
    wall(r.maxX-.08,r.maxX+.08,r.minZ,z-.85);wall(r.maxX-.08,r.maxX+.08,z+.85,r.maxZ);wall(r.maxX-.08,r.maxX+.08,z-.85,z+.85,r.id);
    // Bed and desk footprints leave a broad central path.
    wall(r.minX+.5,r.minX+2.7,r.minZ+.65,r.minZ+3.25);
    boxes.at(-1).sightMaxY=floor+1;
    if(floor===0){
      const cx=(r.minX+r.maxX)/2,cz=(r.minZ+r.maxZ)/2;
      for(const [x,z,w,d,top] of [[cx,r.maxZ-1.1,3,1,1.25],[cx,r.maxZ-2.8,1.6,.8,.65],[r.minX+.5,cz,1.1,2.6,1.2]]){
        wall(x-w/2,x+w/2,z-d/2,z+d/2);boxes.at(-1).sightMaxY=top;
      }
    }
  }return boxes;
}
