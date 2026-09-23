import * as THREE from 'three';
import {addBox,unitBox} from './kit.js';
import {printedCard} from './shop-art.js';
import {HOMES,HOME_BOUNDS,LIFE_PLACES,CLUB_SCENES,normalizeLife} from './life.js';
export const LIFE_PROPS=[...LIFE_PLACES.map(p=>({...p,action:p.id==='property'?'life-homes':'life-club'})),...HOMES.map(h=>({id:`home-${h.id}`,name:`${h.number} · ${h.name}`,x:h.doorX+.25,z:h.doorZ,y:4.4,action:'life-homes'}))].map(p=>({...p,type:'prop',aimY:1.4,reach:2.8,prompt:`[E] ${p.name.toUpperCase()}`}));
export function buildLifeWorld(scene,colliders){
 const root=new THREE.Group();scene.add(root);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72});
 const wood=mat('#694937'),cream=mat('#e0ceb0'),brass=mat('#c7a463'),dark=mat('#294146'),white=mat('#eadfc8'),leaf=mat('#537659');
 const box=(g,m,x,y,z,w,h,d)=>addBox(g,unitBox,m,x,y,z,w,h,d);
 const sign=(g,lines,x,y,z,w,h,rotation=0,paper='#e7d8b8',ink='#294c42')=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:printedCard(lines,{paper,ink,width:768,height:384}),side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rotation;const holder=new THREE.Group();holder.add(m);g.add(holder);return m;};
 function skylineWindow(g,x,y,z,color) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;
  const ctx=canvas.getContext('2d'),sky=ctx.createLinearGradient(0,0,0,384);
  sky.addColorStop(0,'#273e58');sky.addColorStop(1,'#c19579');ctx.fillStyle=sky;ctx.fillRect(0,0,768,384);
  ctx.fillStyle='#eddaad';ctx.beginPath();ctx.arc(610,80,29,0,Math.PI*2);ctx.fill();
  for(let i=0;i<13;i++){const bx=i*64-20,top=110+(i*73)%133;
   ctx.fillStyle=i%2?'#344758':'#2a3d4c';ctx.fillRect(bx,top,60,384-top);
   for(let wx=bx+9;wx<bx+52;wx+=16)for(let wy=top+15;wy<370;wy+=26){ctx.fillStyle=(wx+wy+i)%5<2?'#cfb884':'#5a6c74';ctx.fillRect(wx,wy,7,10);}
   if(i%3===0){ctx.fillStyle='#293d49';ctx.fillRect(bx+17,top-18,26,18);ctx.fillRect(bx+29,top-50,3,32);}
  }
  ctx.strokeStyle='#a6b1b0';ctx.globalAlpha=.18;ctx.lineWidth=2;for(let i=0;i<28;i++){ctx.beginPath();ctx.moveTo(i*35,0);ctx.lineTo(i*35-110,384);ctx.stroke();}ctx.globalAlpha=1;
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.3),new THREE.MeshBasicMaterial({map:tex}));pane.position.set(x,y,z);g.add(pane);
  // Three-light sash: frame, two mullions and a transom rail, all proud of the painted view.
  for(const dx of [-1.46,-.47,.47,1.46])box(g,white,x+dx,y,z+.07,.06,1.45,.08);
  for(const dy of [-.71,.3,.71])box(g,white,x,y+dy,z+.07,2.98,.05,.08);
  const curtain=mat(color);for(const dx of [-1.7,1.7]){box(g,curtain,x+dx,y-.12,z+.12,.36,1.85,.12);box(g,brass,x+dx,y-.5,z+.2,.4,.055,.04);}
  box(g,wood,x,y+.87,z+.15,3.85,.08,.1);
 }
 const doors=new Map(),decor=new Map();
 for(const home of HOMES){const r=HOME_BOUNDS.find(r=>r.id===home.id),room=new THREE.Group(),color=mat(home.color),cx=(r.minX+r.maxX)/2,cz=(r.minZ+r.maxZ)/2;
  root.add(room);
  const w=r.maxX-r.minX,d=r.maxZ-r.minZ;
  box(room,cream,cx,7.76,cz,w,.12,d);
  for(const z of [r.minZ+.1,r.maxZ-.1])box(room,white,cx,7.61,z,w,.12,.14);
  box(room,white,r.minX+.1,7.61,cz,.14,.12,d);
  box(room,wood,cx,4.47,cz,w,.08,d);box(room,color,cx+.4,4.53,cz+.25,w*.62,.025,d*.55);
  box(room,cream,r.minX,6.05,cz,.16,3.3,d);box(room,cream,cx,6.05,r.minZ,w,3.3,.16);box(room,cream,cx,6.05,r.maxZ,w,3.3,.16);
  box(room,cream,r.maxX,6.05,(r.minZ+home.doorZ-.85)/2,.16,3.3,home.doorZ-.85-r.minZ);
  box(room,cream,r.maxX,6.05,(r.maxZ+home.doorZ+.85)/2,.16,3.3,r.maxZ-home.doorZ-.85);
  box(room,wood,r.maxX,7.4,home.doorZ,.24,.6,1.85);
  for(const z of [home.doorZ-.86,home.doorZ+.86])box(room,brass,r.maxX+.08,5.8,z,.08,2.8,.065);
  const door=box(room,wood,r.maxX,5.75,home.doorZ,.16,2.55,1.65);doors.set(home.id,door);
  sign(room,[home.number,home.name.toUpperCase()],r.maxX+.132,7.4,home.doorZ,1.7,.55,Math.PI/2);
  // Bed, headboard and two pillows. West-side furniture leaves the entry aisle open.
  const bx=r.minX+1.6,bz=r.minZ+1.95;
  box(room,wood,bx,4.8,bz,2.2,.55,2.6);box(room,white,bx,5.1,bz,2.15,.25,2.5);box(room,color,bx,5.25,bz+.45,2.15,.12,1.55);
  box(room,wood,bx,5.35,bz-1.32,2.4,1.2,.14);
  for(const x of [bx-.52,bx+.52])box(room,white,x,5.3,bz-.82,.9,.2,.55);
  const deskX=r.maxX-1.25,deskZ=r.minZ+.7;
  box(room,wood,deskX,5.25,deskZ,1.8,.12,.72);
  for(const x of [deskX-.73,deskX+.73])box(room,brass,x,4.88,deskZ,.06,.7,.06);
  box(room,cream,deskX,5.35,deskZ,.45,.03,.3);
  // Framed skyline window painted in the room's palette.
  skylineWindow(room,cx,6.5,r.minZ+.1,home.color);
  box(room,brass,cx,5.69,r.minZ+.16,2.95,.06,.06);
  // Reading chair and a low side table.
  box(room,color,r.minX+1.05,4.88,r.maxZ-1.1,1.3,.65,1.25);box(room,color,r.minX+.55,5.32,r.maxZ-1.1,.3,.95,1.25);
  box(room,wood,r.minX+2.35,5,r.maxZ-1.05,.65,.09,.65);
  const items=new Map();const item=(id)=>{const g=new THREE.Group();room.add(g);items.set(id,g);return g;};
  let g=item('plant');box(g,wood,r.maxX-.65,4.72,r.maxZ-.65,.48,.5,.48);box(g,leaf,r.maxX-.65,5.35,r.maxZ-.65,.055,1,.055);
  for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.27,0),leaf);m.scale.set(1.2,.42,.65);m.position.set(r.maxX-.65+Math.sin(i*2)*.22,5.15+i*.15,r.maxZ-.65+Math.cos(i*2)*.15);g.add(m);}
  g=item('lamp');box(g,brass,r.minX+2.35,5.3,r.maxZ-1.05,.045,.6,.045);const shade=new THREE.Mesh(new THREE.ConeGeometry(.3,.38,12,1,true),new THREE.MeshBasicMaterial({color:'#ffe0a2',side:THREE.DoubleSide}));shade.position.set(r.minX+2.35,5.7,r.maxZ-1.05);g.add(shade);
  g=item('turntable');box(g,dark,deskX,5.39,deskZ,1,.15,.6);const disc=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.02,18),brass);disc.position.set(deskX-.12,5.48,deskZ);g.add(disc);box(g,cream,deskX+.32,5.51,deskZ,.03,.04,.4);
  g=item('bar');const cartX=r.maxX-1,cartZ=home.doorZ-1.5;box(g,brass,cartX,5.1,cartZ,1.15,.08,.48);box(g,wood,cartX,4.7,cartZ,1.15,.08,.48);
  for(const x of [cartX-.5,cartX+.5])box(g,brass,x,4.93,cartZ,.045,.65,.045);
  for(let i=0;i<3;i++){box(g,leaf,cartX-.3+i*.28,5.3,cartZ,.13,.34,.13);box(g,brass,cartX-.3+i*.28,5.5,cartZ,.06,.1,.06);}
  g=item('mirror');box(g,brass,r.minX+.12,6,r.maxZ-2.25,.06,1.4,.85);box(g,mat('#9bb7b2'),r.minX+.16,6,r.maxZ-2.25,.02,1.25,.7);
  g=item('poster');sign(g,['RIVOLI PICTURES','NEON IN THE RAIN'],r.minX+3.8,6.25,r.maxZ-.12,1.3,1.7,Math.PI,'#293e49','#d9bb78');
  g=item('breakfast');box(g,wood,cx+.3,5.1,r.maxZ-1.1,1.15,.09,.85);box(g,brass,cx+.3,4.8,r.maxZ-1.1,.1,.6,.1);box(g,white,cx+.5,5.25,r.maxZ-1.1,.16,.22,.16);box(g,cream,cx+.02,5.17,r.maxZ-1.1,.4,.035,.35);
  decor.set(home.id,items);
 }
 // Lobby property stand; east stairs and the old 4B ice machine remain accessible.
 box(root,wood,28.9,.75,8.8,1.45,1.5,.55);box(root,dark,28.9,1.72,8.51,1.8,.95,.03);sign(root,['ASTORIA RESIDENCES','OWN A LITTLE OF THE NIGHT'],28.9,1.72,8.483,1.7,.85,Math.PI);
 // 2F directory stand beside the stair head: board on two brass posts with weighted feet.
 box(root,wood,35.215,6.25,-.1,.05,.85,2.1);for(const z of [-1.1,.9]){box(root,brass,35.2,5.5,z,.05,2.2,.05);box(root,dark,35.2,4.44,z,.5,.08,.3);}
 sign(root,['2A · 2B · 2C','RESIDENCES ←'],35.252,6.25,-.1,2,.75,Math.PI/2);
 box(root,dark,31.5,2.7,12.465,3.1,.8,.03);sign(root,['RESIDENCES UPSTAIRS','EAST STAIR →'],31.5,2.7,12.438,3,.7,Math.PI);
 // Physical soundcheck station to the right of REXA's booth.
 box(root,dark,9.9,.6,-9.1,1.8,1.2,.8);box(root,brass,9.9,1.23,-9.1,1.9,.1,.86);
 for(let i=0;i<5;i++){box(root,dark,9.26+i*.31,1.3,-9.12,.055,.02,.45);box(root,cream,9.26+i*.31,1.34,-9.24+(i%3)*.12,.16,.045,.1);}
 box(root,dark,9.9,2.1,-9.49,2.4,1.8,.05);
 sign(root,['LIGHTING & SOUNDCHECK','SET THE ROOM · PAID SHIFTS'],9.9,1.8,-9.453,2.3,.72);
 box(root,dark,6.4,2.6,12.395,3.4,1.1,.03);sign(root,['THE NIGHT IS YOURS','FLOOR · LOUNGE · AFTER HOURS'],6.4,2.6,12.368,3.2,.9,Math.PI,'#233840','#dfb677');
 const sceneLabel=sign(root,['ELECTRIC ORCHID','THE HOUSE PALETTE'],9.9,2.65,-9.453,2.3,.6);
 let palette='';
 return {root,doors,decor,setState(input){const s=normalizeLife(input);doors.forEach((d,id)=>d.visible=!s.properties.includes(id));
  for(const b of colliders.boxes)if(b.homeGate){const owned=s.properties.includes(b.homeGate);b.minY=owned?-100:4.4;b.maxY=owned?-99:7.7;}
  decor.forEach((items,id)=>items.forEach((g,key)=>g.visible=id===s.home&&s.installed.includes(key)));
  if(palette!==s.scene){palette=s.scene;const c=CLUB_SCENES.find(c=>c.id===s.scene);sceneLabel.material.map.dispose();sceneLabel.material.map=printedCard([c.name.toUpperCase(),'THE HOUSE PALETTE'],{paper:'#22353a',ink:c.color,width:768,height:384});sceneLabel.material.needsUpdate=true;}
 }};
}
