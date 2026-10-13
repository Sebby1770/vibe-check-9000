import * as THREE from 'three';
import {roomDecor} from './decor.js';

// Furniture stays at room edges; matching footprints are registered below.
export function polishShop(root,id,rect){
 if(['hotel-lobby','hotel-upstairs','records'].includes(id))return;
 const g=new THREE.Group();g.name=`${id} interior details`;root.add(g);
 const d=roomDecor(g,{fabric:id==='diner'?0x9c4e45:0x567a70}),{m,b,cyl}=d;
 if(id==='pharmacy'){
  // Two stocked apothecary cabinets, enclosed below and open above.
  for(const x of [-25.4,-18.2]){
   b(m.wood,x,.62,35.8,.54,1.1,4.6);
   for(const z of [34.1,35.1,36.1,37.1])for(const y of [1.35,1.85,2.35]){
    cyl(m.ivory,x,y,z,.11,.3);cyl(m.brass,x,y+.18,z,.12,.055);
   }
  }
  // Soda mixer and the marble work station.
  cyl(m.brass,-24.9,1.28,38.05,.2,.13);b(m.dark,-24.9,1.63,38.18,.12,.72,.12);
  b(m.ivory,-24.9,1.98,38.03,.32,.18,.36);cyl(m.brass,-24.9,1.57,37.99,.115,.34,.085);
  d.frame(['SODA','FOUNTAIN SPECIALS'], -24.25,2.6,39.66,2.1,.65,Math.PI);
 }
 if(id==='florist'){
  // Full-height flower cooler on the back wall: sage frame, frosted panes, potted stems.
  b(m.dark,-14.1,1.76,39.43,1.8,2.8,.55);b(m.ivory,-14.1,1.78,39.1,1.63,2.52,.035);
  for(const x of [-14.58,-13.63]){b(m.fabric,x,1.64,39.05,.045,2.15,.035);for(const y of [1,1.7,2.4]){cyl(m.brass,x,y,38.99,.14,.3);b(m.leaf,x,y+.34,38.99,.045,.42,.045);}}
  for(const z of [33.8,35.8])d.frame(['LILY’S','FRESH CUT · DAILY'], -15.19,2.42,z,1.35,.78,Math.PI/2,{paper:'#e6d3c0',ink:'#77505a'});
  b(m.wood,-10.35,1.2,38.1,1,.08,.65);for(let i=0;i<3;i++)b(m.ivory,-10.6+i*.23,1.32,38.1,.18,.12,.45);
 }
 if(id==='liquor'){
  // Continuous shelf rails, warm back panels and labelled display plinths.
  for(const x of [21.2,28])for(const y of [.25,.7,1.15,1.6,2.05,2.5])b(m.wood,x,y,35.8,.58,.055,4.7);
  for(const x of [22.1,25.8])d.frame(['MIDTOWN RESERVE','SMALL BATCH · 1954'],x,2.75,39.66,2.2,.4,Math.PI);
  for(const x of [21.2,24.6,28])b(m.glow,x,2.44,39.55,2.1,.04,.035);
  // Wall-hung rolling ladder stays behind the counter, away from the shop aisle.
  for(const x of [28.5,29.1])b(m.brass,x,1.62,39.35,.045,2.4,.045);
  for(let y=.55;y<2.85;y+=.35)b(m.wood,28.8,y,39.35,.65,.045,.12);
 }
 if(id==='barber'){
  for(const x of [34.15,37]){
   b(m.ivory,x,1.32,37.75,1.35,.09,.62);cyl(m.brass,x,1.4,37.75,.21,.08);
   for(const dx of [-.29,.29])b(m.brass,x+dx,1.49,37.84,.035,.24,.035);
  }
  // A wall of portraits and a towel cabinet bring character without obstructing chairs.
  for(let i=0;i<3;i++)d.frame(['TONY’S','CLASS OF ’54'],31.43,2.23,33.6+i*1.8,1.1,1.35,Math.PI/2,{paper:'#cfc1a2',ink:'#4a4036'});
  b(m.wood,39.1,1.65,38.65,.7,.7,.55);for(let i=0;i<4;i++)b(m.ivory,39.1,1.42+i*.13,38.34,.5,.1,.28);
 }
 if(id==='rivoli'){
  // A glass popcorn cabinet on the box office, brass poster frames, velvet screen valance.
  b(m.brass,7.4,1.53,38,.9,.12,.65);b(m.dark,7.4,2.32,38,.95,.15,.7);
  for(const x of [6.98,7.82])for(const z of [37.72,38.28])b(m.brass,x,1.94,z,.035,.72,.035);
  for(let i=0;i<15;i++)cyl(m.ivory,7.1+(i%5)*.15,1.63,37.8+Math.floor(i/5)*.15,.08,.12);
  for(let i=0;i<3;i++){const x=-5+i*2.1;for(const dx of [-.74,.74])b(m.brass,x+dx,2,39.65,.06,1.92,.06);for(const y of [1.05,2.95])b(m.brass,x,y,39.65,1.52,.06,.06);}

 }
 if(id==='diner'){
  // Proper upholstered booths replace the impression of loose planks around the room.
  for(const z of [-8,-4,0,7]){
   d.sofa(-36.75,0,z,1.8,Math.PI/2);d.table(-34.7,0,z,1.25,1.2);
   cyl(m.ivory,-34.7,.76,z,.085,.18);b(m.ivory,-34.4,.7,z,.25,.03,.32);
  }
  for(const x of [-31,-28.6,-27,-23,-21]){cyl(m.brass,x,.31,1.65,.065,.6);cyl(m.fabric,x,.65,1.65,.29,.17);cyl(m.brass,x,.09,1.65,.26,.09);}
  for(const z of [-11,-4,3,9]){
   b(m.wall,-38.52,2.2,z,.1,4,5.5);b(m.fabric,-38.42,.8,z,.08,1.45,5.5);
   b(m.brass,-38.35,1.56,z,.06,.06,5.5);
   d.frame(['DOTTIE’S','GOOD FOOD · GOOD COMPANY'],-38.34,2.6,z,2.1,.85,Math.PI/2,{paper:'#ead9b8',ink:'#944e42'});
  }
  // Menu board belongs to the wall, above the working counter.
  d.frame(['THE NIGHT COUNTER','COFFEE · PIE · SUPPER'], -16.91,2.85,6.3,3.2,1.1,-Math.PI/2);
  b(m.ivory,-27.6,4.05,-2,21.4,.1,28.2);
  b(m.wall,-16.78,2.1,-2,.14,3.9,28.2);b(m.fabric,-16.89,.8,-2,.06,1.4,28.2);
  b(m.brass,-16.94,1.55,-2,.04,.055,28.2);
  // A compact jukebox with lit bubble tubes and a recessed record selector.
  b(m.wood,-20,1.02,-15.5,1.6,1.95,.75);b(m.brass,-20,1.12,-15.09,1.45,1.8,.05);
  b(m.dark,-20,1.14,-15.05,1.18,1.52,.05);
  for(const x of [-20.56,-19.44]){cyl(m.glow,x,1.17,-14.99,.055,1.5);}
  for(let i=0;i<7;i++)b(m.brass,-20,.54+i*.08,-14.98,.83,.024,.035);
  d.frame(['DOTTIE’S JUKEBOX','JAZZ · 45 RPM'],-20,1.65,-14.99,.95,.32);
  for(const x of [-35,-30,-25])d.frame(['FRESH EVERY DAY','PIE · COFFEE · COMPANY'],x,2.5,-16.25,2.7,.8);
  d.plant(-18.3,0,-12.5,1.2);
 }
 d.flush();
}

export function shopPolishColliders(){
 const box=(x,z,w,d,sightMaxY=1.2)=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:0,maxY:2,sightMaxY});
 return [
  ...[-25.4,-18.2].map(x=>box(x,35.8,.58,4.6,2.55)),
  ...[-8,-4,0,7].flatMap(z=>[box(-36.75,z,1.1,1.8),box(-34.7,z,1.25,1.2,.7)]),
  box(-20,-15.5,1.6,.75,2),
 ];
}
