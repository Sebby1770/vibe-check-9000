/* Astoria public second floor. Apartment ownership and doors remain in life-world.js. */
import * as THREE from 'three';
import {roomDecor} from './decor.js';
import {SECOND_Y} from '../zones.js';
export function colliders(){return [
 {minX:30.55,maxX:33.45,minZ:-9.45,maxZ:-7.55,minY:4.4,maxY:6.5,sightMaxY:5.95},
 {minX:19.65,maxX:22.75,minZ:6.8,maxZ:8.2,minY:4.4,maxY:6.4,sightMaxY:5.65},
 {minX:20.5,maxX:21.9,minZ:9.7,maxZ:10.6,minY:4.4,maxY:6.4,sightMaxY:5.1},
 {minX:29.6,maxX:32.6,minZ:7.5,maxZ:8.65,minY:4.4,maxY:6.4,sightMaxY:5.7},
 {minX:33.72,maxX:34.78,minZ:3.03,maxZ:4.27,minY:4.4,maxY:6.2,sightMaxY:5.75},
 ];}
export function build({root,lamp}){
 const g=new THREE.Group();g.name='Astoria second-floor salon';root.add(g);
 const d=roomDecor(g,{fabric:0x886251,wall:0xd9d1b9}),{m,b}=d,y=SECOND_Y;
 b(m.wall,27.65,y+3.43,-2,21.8,.12,28.3);
 for(const x of [16.74,38.45]){b(m.wall,x,y+1.7,-2,.15,3.3,28.2);b(m.wood,x+(x<25?.1:-.1),y+.55,-2,.1,1.05,28.2);b(m.brass,x+(x<25?.17:-.17),y+1.1,-2,.06,.05,28.2);}
 b(m.ivory,27.65,y+.016,7,21.6,.025,10.5);
 d.rug(29.4,y+.047,-3.6,2.15,20.3);d.rug(25.8,y+.051,5.0,17.4,1.7);d.rug(21.2,y+.053,8.9,6.2,5.7);
 for(let z=-12.5;z<6;z+=1.25){b(m.brass,29.4,y+.061,z,.34,.012,.34,Math.PI/4);}
 for(const z of [-14,-8,-2,4,10])b(m.ivory,27.65,y+3.28,z,21.5,.14,.15);
 d.sofa(21.2,y,7.5,2.8);d.table(21.2,y,10.15,1.4,.9);d.sofa(31.1,y,8.1,2.8);
 d.lamp(21.2,y+.66,10.15);d.plant(18,y,11,1.1);d.plant(33.5,y,11,1.15);
 b(m.wall,27.65,y+1.7,12.49,21.8,3.3,.16);
 d.frame(['ASTORIA RESIDENCES','A QUIETER KIND OF MIDTOWN'],25.8,y+2.1,12.36,5.4,1.45,Math.PI);
 // Full-height ice cabinet in the existing alcove, with hopper, drip tray and frosted glass.
 b(m.dark,32,y+.83,-8.5,1.25,1.65,.9);b(m.ivory,32,y+.96,-8.02,1.06,1.37,.06);
 b(m.glow,32,y+1.38,-7.98,.84,.38,.025);b(m.dark,32,y+.83,-7.96,.64,.47,.035);
 b(m.brass,32,y+.55,-7.89,.83,.07,.28);b(m.brass,32.44,y+.95,-7.97,.1,.14,.055);
 d.frame(['4B · ICE','HELP YOURSELF'],32,y+1.4,-7.91,1.06,.32);
 // Linen cart parked in the front salon, off the residential corridors.
 for(const x of [33.8,34.7])for(const z of [3.1,4.2]){b(m.brass,x,y+.75,z,.045,1.2,.045);d.cyl(m.dark,x,y+.12,z,.1,.16);}
 for(const h of [.25,.9])b(m.wood,34.25,y+h,3.65,1,.06,1.2);
 for(let i=0;i<4;i++)b(m.ivory,34.25,y+1+i*.09,3.65,.8,.075,.6);
 for(const z of [-11,-5,1]){b(m.wood,38.27,y+2.05,z,.09,.7,.22);d.lamp(38.03,y+1.5,z);}
 const light=lamp(28,5,0xffe2b8,26);light.position.y=y+2.6;light.distance=18;
 d.flush();return {root:g};
}
