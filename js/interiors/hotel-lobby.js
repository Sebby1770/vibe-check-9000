/* Hotel Astoria: marble arrival hall, concierge, two furnished lounges and an elevator bank.
   Keep the entrance, property desk, lost-property case and the east staircase accessible. */
import * as THREE from 'three';
import {roomDecor} from './decor.js';
import {hotelFurnitureColliders} from './hotel-layout.js';
import {checkerFloor} from '../shop-art.js';

export function colliders(){return [{minX:21.4,maxX:28.9,minZ:4.6,maxZ:7.4,minY:0,maxY:2,sightMaxY:1.28},...hotelFurnitureColliders()];}
export function build({root,lamp}){
 const group=new THREE.Group();group.name='Astoria arrival hall';root.add(group);
 const d=roomDecor(group,{fabric:0x527b70,wall:0xded3b8}),{m,b,cyl}=d;
 const floor=new THREE.MeshStandardMaterial({map:checkerFloor('#e2d7bf','#b1bba9',28),roughness:.42,metalness:.12});
 b(floor,27.65,.035,-2,21.8,.06,28.4);
 d.rug(25,.079,9.5,4.8,5.6);d.rug(22.6,.079,-5.8,8.2,10);d.rug(31.7,.079,-5.2,6,7);
 // Finished walls replace the exposed dark shell. No wall crosses the front door or stair opening.
 for(const x of [16.73,38.48]){
  b(m.wall,x,2.12,-2,.16,4.18,28.35);b(m.wood,x+(x<25?.1:-.1),.62,-2,.1,1.12,28.35);
  for(const y of [.14,1.2,4.04])b(m.brass,x+(x<25?.17:-.17),y,-2,.08,.065,28.3);
  for(let z=-14.6;z<12;z+=2.7)b(m.brass,x+(x<25?.17:-.17),.65,z,.075,.94,.035);
 }
 b(m.wall,27.65,2.12,-16.35,21.8,4.18,.14);b(m.wood,27.65,.6,-16.24,21.8,1.1,.08);
 b(m.brass,27.65,1.18,-16.18,21.8,.055,.035);
 b(m.ivory,26.1,4.22,-2,18.7,.09,28.3);
 for(const x of [17.1,23.1,29.1,35.2])b(m.wood,x,4.07,-2,.18,.22,28.3);
 for(const z of [-15.8,-9.4,-3,3.4,11.9])b(m.ivory,26.1,4.03,z,18.7,.24,.2);
 // Fluted concierge counter with a marble top and a framed hotel monogram.
 b(m.wood,25.2,.62,5.9,7.4,1.2,2.6);b(m.ivory,25.2,1.25,5.9,7.65,.13,2.75);
 for(let x=21.65;x<28.8;x+=.24)b(m.brass,x,.65,7.22,.035,.94,.055);
 d.frame(['ASTORIA','CONCIERGE · EST. 1924'],25.2,.69,7.26,3.3,.7);
 for(const x of [21.7,28.7])b(m.brass,x,.66,5.9,.07,1.15,2.65);
 d.lamp(27.7,1.32,5.9);
 b(m.dark,22.6,1.36,6.35,.64,.12,.43);b(m.ivory,24.3,1.34,6.55,.75,.025,.48);
 for(const x of [24.0,24.5])b(m.brass,x,1.36,6.55,.03,.025,.4);
 cyl(m.brass,26,1.36,6.5,.12,.06);cyl(m.brass,26,1.43,6.5,.075,.1,.12);
 // Key pigeonholes are mounted behind the counter, not floating in the entrance.
 b(m.wood,22.8,2.06,4.82,2.3,1.35,.22);
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){
  b(m.dark,21.91+i*.44,1.63+j*.42,4.955,.36,.32,.035);
  cyl(m.brass,21.91+i*.44,1.58+j*.42,5,.026,.12);
 }
 d.sofa(20.3,0,-5.9,3.2,Math.PI/2);d.sofa(23.2,0,-9.1,3.2,0);d.table(22.6,0,-5.9,1.5,1);
 d.sofa(31.8,0,-5.7,3.2,0);d.table(31.8,0,-3.4,1.5,1);
 for(const [x,z] of [[22.6,-5.9],[31.8,-3.4]]){b(m.ivory,x,.68,z,.55,.035,.4);b(m.dark,x+.2,.71,z,.4,.025,.29);}
 // Reading cabinet, plants and gallery panels occupy the edges of the room.
 b(m.wood,20,.8,-13.8,3.4,1.55,.9);d.lamp(19,1.6,-13.8);
 for(let i=0;i<9;i++)b(i%2?m.fabric:m.ivory,19.7+i*.16,1.77,-13.8,.11,.32+(i%3)*.04,.25);
 for(const [x,z] of [[18.1,10.7],[34.4,10.7],[18,-11],[34,-13.8]])d.plant(x,0,z,1.2);
 for(const z of [-10,-2,6]){d.frame(['THE ASTORIA','NEW YORK · 1924'],16.98,2.6,z,2.5,1.5,Math.PI/2);d.frame(['MIDTOWN','A ROOM IN THE CITY'],38.23,2.6,z,2.5,1.5,-Math.PI/2);}
 // Decorative elevator bank: room access remains via the clearly marked east stairs.
 for(const x of [26.4,30.8]){
  b(m.wood,x,1.8,-16.04,3.65,3.55,.18);b(m.brass,x,1.6,-15.91,3.05,3.05,.08);
  for(const dx of [-.73,.73])b(m.dark,x+dx,1.61,-15.85,1.38,2.86,.035);
  for(const dx of [-1.35,-.1,.1,1.35])b(m.brass,x+dx,1.6,-15.82,.045,2.8,.04);
  d.frame(['ASTORIA','LIFT · OUT OF SERVICE'],x,3.32,-15.88,2.7,.38);
 }
 d.frame(['RESIDENCES · 2F','USE THE EAST STAIR →'],38.23,2.65,2.8,2,.65,-Math.PI/2);
 const ring=new THREE.TorusGeometry(1.15,.035,8,32),bulb=new THREE.SphereGeometry(.13,10,8);
 for(const [x,z] of [[26,1],[24,-8]]){
  cyl(m.brass,x,3.89,z,.04,.48);
  for(const y of [3.48,3.66]){const mesh=new THREE.Mesh(ring,m.brass);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);group.add(mesh);}
  for(let i=0;i<10;i++){const a=i*Math.PI/5;const mesh=new THREE.Mesh(bulb,m.glow);mesh.position.set(x+Math.cos(a)*1.15,3.45,z+Math.sin(a)*1.15);group.add(mesh);}
 }
 const warm=lamp(26,-5,0xffdfb0,40);warm.position.y=3.5;warm.distance=21;
 d.flush();return {root:group};
}
