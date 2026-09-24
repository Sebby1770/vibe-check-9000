import { boxBatch } from './batch.js';
import * as THREE from 'three';
import { checkerFloor } from '../shop-art.js';

// Architectural finishes are separate from interactive counters and furniture.
// Everything stays on walls, ceilings or existing counters so aisles remain usable.
export function finishInterior(root,id,rect) {
  if(id==='records')return; // The listening room already has its own complete finish.
  const m=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
  const brass=m(0xbe9758,{metalness:.6,roughness:.32}),ivory=m(0xe6d7b7),walnut=m(0x51372d),dark=m(0x283b3b);
  const light=m(0xffdcab,{emissive:0xffc686,emissiveIntensity:.65});
  const batch=boxBatch(),details=[];
  const b=(mat,x,y,z,w,h,d)=>batch.box(mat,x,y,z,w,h,d);
  const mesh=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);details.push(o);return o;};
  const cx=(rect.minX+rect.maxX)/2,width=rect.maxX-rect.minX;
  if(['pharmacy','florist','rivoli','liquor','barber'].includes(id)){
    const ceiling=id==='florist'?m(0x8aaf9f):id==='rivoli'?m(0x87653e):id==='liquor'?walnut:ivory;
    b(ceiling,cx,3.815,36,width-.35,.025,7.5);
    for(const x of [rect.minX+.22,rect.maxX-.22]){
      b(brass,x,3.65,36,.14,.18,7.5);
      // Wall panels and two sconces frame the room without crowding the shop windows.
      for(const z of [34.5,37.5]){
        b(walnut,x,2.6,z,.11,.68,.26);
        mesh(new THREE.SphereGeometry(.13,10,8),light,x+(x<cx?.1:-.1),2.68,z);
      }
    }
    for(const z of [33,35.5,38])b(brass,cx,3.73,z,width-.45,.13,.09);
  }
  if(id==='pharmacy'){
    // Apothecary show globes sit on the marble fountain, jewel colours in brass cradles.
    for(const [i,color] of [0x9e3849,0x2b977e,0x3e6ca9].entries()){
      const x=-24.7+i*2.8;
      mesh(new THREE.CylinderGeometry(.22,.3,.16,16),brass,x,1.31,38.35);
      mesh(new THREE.SphereGeometry(.26,16,12),m(color,{metalness:.15,roughness:.18,emissive:color,emissiveIntensity:.15}),x,1.61,38.35);
      mesh(new THREE.CylinderGeometry(.065,.11,.13,12),brass,x,1.91,38.35);
    }
  }
  if(id==='florist'){
    // A trellis overhead carries hanging greenery and pendant flower clusters.
    const leaf=m(0x466f50),petal=m(0xb69bc8);
    for(const x of [-14.2,-10.2])for(const z of [33.8,36,38.2]){
      b(brass,x,3.55,z,.025,.5,.025);
      mesh(new THREE.CylinderGeometry(.24,.16,.22,10),walnut,x,3.22,z);
      for(let i=0;i<4;i++){
        const angle=i*Math.PI/2;
        const vine=mesh(new THREE.SphereGeometry(.17,8,6),leaf,x+Math.cos(angle)*.15,3.07,z+Math.sin(angle)*.15);vine.scale.set(1,1.5,1);
        const bloom=mesh(new THREE.SphereGeometry(.09,8,6),petal,x+Math.cos(angle)*.2,2.86,z+Math.sin(angle)*.2);bloom.scale.y=1.6;
      }
    }
  }
  if(id==='rivoli'){
    // Gilded screen frame and two small Art Deco chandeliers.
    for(const x of [9.55,16.45])b(brass,x,2.12,39.59,.12,3.34,.12);
    for(const y of [.45,3.79])b(brass,13,y,39.59,7,.12,.12);
    for(const x of [-2,13]){
      b(brass,x,3.5,35.8,.035,.6,.035);
      const ring=mesh(new THREE.TorusGeometry(.62,.025,6,24),brass,x,3.19,35.8);ring.rotation.x=Math.PI/2;
      for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(new THREE.SphereGeometry(.1,8,6),light,x+Math.cos(a)*.62,3.15,35.8+Math.sin(a)*.62);}
    }
  }
  if(id==='liquor'){
    for(const z of [33.6,36.2,38.8]){
      b(walnut,24.6,3.59,z,9.3,.25,.2);
      for(const x of [22,27.2])mesh(new THREE.SphereGeometry(.14,10,8),light,x,3.3,z);
    }
    // Small copper tasting still stays entirely on the existing back counter.
    const copper=m(0xb97445,{metalness:.72,roughness:.3});
    mesh(new THREE.SphereGeometry(.35,16,12),copper,28,1.55,38.4);
    mesh(new THREE.CylinderGeometry(.06,.19,.45,12),copper,28,1.96,38.4);
    b(copper,27.7,2.18,38.4,.65,.08,.08);
  }
  if(id==='barber'){
    // Warm vanity bulbs make the mirrors feel like workstations.
    for(const x of [34.15,37])for(const side of [-1,1])for(const y of [1.7,2.1,2.5])
      mesh(new THREE.SphereGeometry(.055,8,6),light,x+side*.91,y,39.57);
    for(const x of [33.3,35.9,38.5])b(dark,x,3.78,36,.09,.08,7.4);
  }
  if(id==='diner'){
    const tile=m(0xffffff,{map:checkerFloor('#405c59','#d9d2bc',32)});
    b(tile,-27.65,.063,-2,21.7,.02,28.3);
    for(const z of [-11,-5,1,8]){
      b(ivory,-27.6,3.75,z,20,.12,.22);
      for(const x of [-31,-24]){
        b(brass,x,3.38,z,.025,.65,.025);
        mesh(new THREE.CylinderGeometry(.28,.42,.18,16),ivory,x,3.08,z);
        mesh(new THREE.SphereGeometry(.17,10,8),light,x,2.98,z);
      }
    }
  }
  if(id==='hotel-lobby'){
    // A ceiling rosette, inlaid rug border and desk lamp warm up the lobby.
    for(const x of [22.3,32.9])b(brass,x,.057,-2,.08,.02,14.5);
    for(const z of [-9.25,5.25])b(brass,27.6,.057,z,10.6,.02,.08);
    const ring=mesh(new THREE.TorusGeometry(1.2,.055,8,32),brass,26,3.48,1);ring.rotation.x=Math.PI/2;
    b(brass,26,3.83,1,.05,.7,.05);
    for(let i=0;i<10;i++){const a=i*Math.PI/5;mesh(new THREE.SphereGeometry(.13,10,8),light,26+Math.cos(a)*1.2,3.38,1+Math.sin(a)*1.2);}
    b(brass,27.7,1.57,5.9,.04,.62,.04);
    mesh(new THREE.ConeGeometry(.3,.22,16),dark,27.7,1.89,5.9);
  }
  for(const o of details)batch.geo(o.material,o.geometry,o.position.x,o.position.y,o.position.z,o.scale.x,o.scale.y,o.scale.z,o.rotation.y,o.rotation.x,o.rotation.z);
  batch.flush(root);
  for(const o of details)o.geometry.dispose();
}
