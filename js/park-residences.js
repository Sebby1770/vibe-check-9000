import * as THREE from 'three';
import {boxBatch} from './interiors/batch.js';
import {HOMES} from './life.js';
import {brickTex,windowPaneTex} from './textures.js';
import {printedCard} from './shop-art.js';

export function buildParkResidences(scene){
 const root=new THREE.Group();root.name='Mercer Row';scene.add(root);
 const b=boxBatch(),mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
 const stone=mat(0xd5c2a0),iron=mat(0x263d3b,{metalness:.35}),wood=mat(0x604737),leaf=mat(0x54724d);
 const pane=mat(0xffffff,{map:windowPaneTex('warm'),emissive:0xb88c50,emissiveIntensity:.14,roughness:.35});
 const glow=mat(0xffe2ad,{emissive:0xffc47d,emissiveIntensity:.8});
 HOMES.filter(h=>h.floorY===0).forEach((h,i)=>{
   const x0=h.doorX-14,x1=h.doorX+4,cx=(x0+x1)/2,height=i?22:18;
   const texture=brickTex('#3e332c',i?'#8f674f':'#765245');texture.repeat.set(3,4);
   const brick=mat(0xffffff,{map:texture});
   // Upper apartments, cornices and pitched copper roof details frame the park.
   b.box(brick,cx,(height+3.5)/2,38.1,18,height-3.5,12.6);
   for(const y of [3.5,height])b.box(stone,cx,y,38.1,18.45,.32,13);
   b.box(iron,cx,height+.35,38.1,18,.35,12.6);
   b.box(wood,cx-4,height+1.1,40.4,1.4,1.6,1.4);
   // Street vestibule wraps around the shared room builder's private apartment.
   b.box(stone,cx,.04,38.1,18,.08,12.6);
   b.box(stone,x0,1.75,38.1,.2,3.5,12.6);
   b.box(stone,x1,1.75,38.1,.2,3.5,12.6);
   b.box(stone,cx,1.75,44.4,18,3.5,.2);
   b.box(stone,(x0+h.entryX-1.1)/2,1.75,31.8,h.entryX-1.1-x0,3.5,.2);
   b.box(stone,(x1+h.entryX+1.1)/2,1.75,31.8,x1-h.entryX-1.1,3.5,.2);
   b.box(wood,h.entryX,3.1,31.8,2.35,.6,.3);
   b.box(wood,h.entryX,3.3,38.1,3.7,.14,12.5);
   b.box(iron,h.entryX,.1,32.7,1.8,.06,1.4);
   for(const x of [h.entryX-1.2,h.entryX+1.2])b.box(wood,x,1.55,31.68,.14,3.1,.22);
   for(const x of [x0+3,x0+8]){
     b.box(iron,x,1.7,31.65,3.5,2,.2);b.box(pane,x,1.7,31.53,3.22,1.75,.08);
     for(const dx of [-1.6,0,1.6])b.box(stone,x+dx,1.7,31.45,.07,1.85,.08);
     b.box(stone,x,.66,31.45,3.7,.16,.5);
     b.box(wood,x,.48,31.25,3.3,.22,.5);b.box(leaf,x,.64,31.23,3.1,.28,.45);
   }
   for(let y=5.5;y<height-1;y+=3.4)for(let x=x0+2;x<x1-1;x+=3.5){
     b.box(iron,x,y,31.69,1.7,2.25,.16);b.box(pane,x,y,31.59,1.45,2,.08);
     b.box(stone,x,y-1.2,31.54,1.95,.14,.4);b.box(stone,x,y,31.51,.065,2.03,.06);
     if(y<10){
       b.box(iron,x,y-1.12,31,2.35,.1,1.3);
       b.box(iron,x,y-.45,30.4,2.35,.06,.06);
       for(let n=0;n<7;n++)b.box(iron,x-1.08+n*.36,y-.78,30.4,.035,.68,.035);
     }
   }
   for(const z of [34.5,41]){
     b.box(iron,x1-.16,2.35,z,.18,.55,.2);b.box(glow,x1-.28,2.35,z,.1,.38,.14);
   }
   b.box(wood,h.entryX,2.95,31.55,2,.42,.08);
   const label=new THREE.Mesh(new THREE.PlaneGeometry(1.85,.3),new THREE.MeshBasicMaterial({map:printedCard([h.number+' · MERCER ROW'],{width:512,height:128,paper:'#29483e',ink:'#efd6a8'})}));
   label.position.set(h.entryX,2.95,31.50);label.rotation.y=Math.PI;const signHolder=new THREE.Group();signHolder.add(label);root.add(signHolder);
 });
 b.flush(root);return root;
}
