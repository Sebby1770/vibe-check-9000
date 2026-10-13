import * as THREE from 'three';
import {boxBatch} from './batch.js';
import {woodTex,plasterTex} from '../textures.js';
import {printedCard} from '../shop-art.js';
import {addBox,unitBox} from '../kit.js';

// Reusable architectural pieces: merged by material, so a furnished room stays inexpensive.
export function roomDecor(root,{fabric=0x57786f,wall=0xe0d5bb}={}){
 const batch=boxBatch(),mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.75,...extra});
 const m={wood:mat(0x694932,{map:woodTex()}),wall:mat(wall,{map:plasterTex()}),ivory:mat(0xf1e4c8),brass:mat(0xc7a568,{metalness:.65,roughness:.33}),dark:mat(0x263e3b),fabric:mat(fabric),leaf:mat(0x54755a),glow:mat(0xffe6bc,{emissive:0xffd698,emissiveIntensity:.6})};
 const b=(material,x,y,z,w,h,d,ry=0)=>batch.box(material,x,y,z,w,h,d,ry);
 const cyl=(material,x,y,z,r,h,rb=r)=>batch.cyl(material,x,y,z,r,rb,h,16);
 const sphere=new THREE.SphereGeometry(1,12,8);
 function plant(x,y,z,scale=1){cyl(m.brass,x,y+.3*scale,z,.3*scale,.6*scale,.22*scale);b(m.wood,x,y+1.02*scale,z,.055*scale,1.4*scale,.055*scale);for(let i=0;i<8;i++){const a=i*2.4;batch.geo(m.leaf,sphere,x+Math.cos(a)*.24*scale,y+(.7+i*.12)*scale,z+Math.sin(a)*.24*scale,.36*scale,.09*scale,.18*scale,a,0,.25);}}
 function sofa(x,y,z,w=2.8,ry=0){
  const part=(ma,dx,dy,dz,sx,sy,sz)=>b(ma,x+dx*Math.cos(ry)+dz*Math.sin(ry),y+dy,z-dx*Math.sin(ry)+dz*Math.cos(ry),sx,sy,sz,ry);
  part(m.wood,0,.26,0,w,.3,1.05);part(m.fabric,0,.54,0,w-.15,.28,1.03);part(m.fabric,0,.97,-.46,w,1,.2);
  for(const side of [-1,1]){part(m.fabric,side*(w/2-.1),.75,0,.2,.7,1.05);part(m.brass,side*(w/2-.25),.13,0,.07,.26,.7);part(m.ivory,side*(w/2-.57),.87,-.22,.45,.42,.2);}
  for(let i=0;i<3;i++)part(m.brass,-w*.3+i*w*.3,1.02,-.343,.04,.04,.025);
 }
 function table(x,y,z,w=1.3,d=.8){b(m.wood,x,y+.59,z,w,.12,d);for(const dx of [-w*.38,w*.38])for(const dz of [-d*.32,d*.32])b(m.brass,x+dx,y+.29,z+dz,.045,.55,.045);}
 function lamp(x,y,z){cyl(m.brass,x,y+.035,z,.2,.07);cyl(m.brass,x,y+.4,z,.027,.72);batch.cyl(m.ivory,x,y+.86,z,.22,.37,.36,18);cyl(m.glow,x,y+.68,z,.26,.022);}
 function frame(lines,x,y,z,w,h,ry=0,colors={}){
  // Keep the frame separate from its wall/furniture so mounting audits can distinguish them.
  const holder=new THREE.Group();holder.name=lines.join(' / ');root.add(holder);
  const backing=addBox(holder,unitBox,m.brass,x,y,z,w+.12,h+.12,.1);backing.rotation.y=ry;
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:printedCard(lines,{paper:'#304e48',ink:'#e4cca0',...colors})}));
  pane.position.set(x+Math.sin(ry)*.058,y,z+Math.cos(ry)*.058);pane.rotation.y=ry;holder.add(pane);return pane;
 }
 function rug(x,y,z,w,d){b(m.fabric,x,y,z,w,.018,d);for(const dx of [-w/2+.12,w/2-.12])b(m.brass,x+dx,y+.012,z,.045,.009,d-.24);for(const dz of [-d/2+.12,d/2-.12])b(m.brass,x,y+.012,z+dz,w-.24,.009,.045);}
 return {m,b,cyl,plant,sofa,table,lamp,frame,rug,flush(){const meshes=batch.flush(root);sphere.dispose();return meshes;}};
}
