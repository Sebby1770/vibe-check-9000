import * as THREE from 'three';
import { addBox, unitBox } from './kit.js';
import { printedCard } from './shop-art.js';
import { createHuman, animateHuman } from './human.js';
import { DISTRICT_BUILDINGS, DISTRICT_PARKS, DISTRICT_SEATS } from './district-layout.js';

export function buildDistrict(scene) {
  const root=new THREE.Group();root.name='East district';scene.add(root);
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.86,...extra});
  const stone=mat(0xaca18e),road=mat(0x333e43),grass=mat(0x4c684c),iron=mat(0x2c4240),wood=mat(0x775039),cream=mat(0xd4bfa0),leaf=mat(0x43684d),trunk=mat(0x58463b);
  const box=(m,x,y,z,w,h,d)=>addBox(root,unitBox,m,x,y,z,w,h,d);
  function sign(lines,x,y,z,w,h,rotation=0) {
    const texture=printedCard(lines,{ink:'#efe2bf',paper:'#274b49',width:768,height:256});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
    mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);return mesh;
  }
  // Continuous foundations; raised walks stay low enough for ground-level controls.
  box(stone,114,-.15,23,120,.25,106);
  box(road,132,-.005,22.8,84,.06,8.2);
  box(road,109,0,22,10,.065,104);
  box(road,134,.005,56,80,.07,8);
  for(let x=94;x<174;x+=7) if(x<102||x>116)box(cream,x,.05,22.8,3,.02,.12);
  for(let z=-25;z<74;z+=7)if(Math.abs(z-22.8)>6&&Math.abs(z-56)>6)box(cream,109,.05,z,.12,.02,3);
  for(let x=120;x<174;x+=7)box(cream,x,.06,56,3,.02,.12);
  for(const z of [17,29,50,62])for(let i=0;i<7;i++)box(cream,105+i*1.3,.06,z,.7,.02,2.2);
  // Shared instance batches keep the larger neighborhood inexpensive to draw.
  const windows=[],trim=[];
  DISTRICT_BUILDINGS.forEach((b,index)=>{
    box(mat(b.color),b.x,b.h/2,b.z,b.w,b.h,b.d);
    box(stone,b.x,2,b.z,b.w+.15,4,b.d+.15);
    box(cream,b.x,b.h,b.z,b.w+.55,.45,b.d+.55);
    for(let y=5;y<b.h-1;y+=3.1) {
      for(let x=b.x-b.w/2+1.5;x<b.x+b.w/2-1;x+=2.6) for(const side of [-1,1])windows.push([x,y,b.z+side*(b.d/2+.025),1.1,1.7,.04]);
      for(let z=b.z-b.d/2+1.6;z<b.z+b.d/2-1;z+=2.8)for(const side of [-1,1])windows.push([b.x+side*(b.w/2+.025),y,z,.04,1.7,1.1]);
      trim.push([b.x,y-1.15,b.z,b.w+.18,.12,b.d+.18]);
    }
    for(const facing of b.z===40?[-1,1]:[b.z<10?1:-1]) {
    const front=b.z+facing*(b.d/2+.12);
    box(iron,b.x,1.35,front,b.w-1.8,2.5,.12);
    for(let x=b.x-b.w/2+1;x<b.x+b.w/2;x+=2.2)box(cream,x,1.4,front+facing*.1,.09,2.6,.08);
    const awning=mat([0x386058,0x8e5648,0xb0995e][index%3]);
    box(awning,b.x,3.35,front+facing*.6,b.w-.6,.25,1.7);
    sign([b.name,'EAST SIDE · MIDTOWN'],b.x,4.15,front+facing*.1,Math.min(b.w-1,9),1.1,facing<0?Math.PI:0);
    }
    box(wood,b.x,b.h+1.1,b.z,2.2,2.2,2.2);
  });
  function batch(geo,material,items) {
    const mesh=new THREE.InstancedMesh(geo,material,items.length),dummy=new THREE.Object3D();
    items.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...p.slice(3));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);return mesh;
  }
  const panes=batch(unitBox,mat(0xbba577,{emissive:0xe3b764,emissiveIntensity:.12}),windows);
  windows.forEach((_,i)=>panes.setColorAt(i,new THREE.Color(i%7<3?0x34484c:i%3===0?0xd8bc94:0xffe9bb)));
  panes.instanceColor.needsUpdate=true;
  batch(unitBox,cream,trim);
  const trees=[],stems=[],lamps=[],bulbs=[];
  const fountainWater=[];
  DISTRICT_PARKS.forEach(p=>{
    box(grass,p.x,-.01,p.z,p.w,.1,p.d);
    box(stone,p.x,.055,p.z,4,.06,p.d);
    box(stone,p.x,.06,p.z,p.w,.06,3);
    const basin=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.4,.45,24),stone);basin.position.set(p.x,.24,p.z);root.add(basin);
    const water=new THREE.Mesh(new THREE.CircleGeometry(2.12,24),mat(0x518d94,{metalness:.35,roughness:.22}));water.rotation.x=-Math.PI/2;water.position.set(p.x,.475,p.z);root.add(water);fountainWater.push(water);
    const fountain=new THREE.Mesh(new THREE.CylinderGeometry(.25,.5,1.25,12),cream);fountain.position.set(p.x,.9,p.z);root.add(fountain);
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.95,.25,.2,16),stone);bowl.position.set(p.x,1.5,p.z);root.add(bowl);
    sign([p.name.toUpperCase(),'PUBLIC GARDEN · TAKE A SEAT'],p.x+6,1.5,p.z+p.d/2,7,1.25);
    for(const dx of [3,9])box(iron,p.x+dx,.65,p.z+p.d/2,.08,1.3,.08);
    for(const dx of [-p.w/2+3,-8,8,p.w/2-3])for(const dz of [-p.d/2+3,p.d/2-3]){
      const x=p.x+dx,z=p.z+dz;stems.push([x,1.8,z,.32,3.6,.32]);trees.push([x,4.25,z,2.1,2.6,2.1]);
    }
    // Open pergola along the rear garden path.
    for(const dx of [-5,5])for(const dz of [-1,1])box(wood,p.x+dx,1.4,p.z-7+dz,.16,2.8,.16);
    for(let dx=-5;dx<=5;dx++)box(wood,p.x+dx,2.85,p.z-7,.14,.18,3.2);
  });
  for(const s of DISTRICT_SEATS){
    box(wood,s.x,.49,s.z,2.5,.16,.65);box(wood,s.x,.96,s.z+.3,2.5,.64,.12);
    for(const dx of [-.95,.95])box(iron,s.x+dx,.27,s.z,.12,.5,.65);
  }
  for(let x=62;x<174;x+=14)for(const z of [17.2,29.4]){lamps.push([x,2.05,z,.1,4.1,.1]);bulbs.push([x,4.2,z,.38,.48,.38]);}
  for(let z=-20;z<75;z+=15)for(const x of [101,117]){lamps.push([x,2.05,z,.1,4.1,.1]);bulbs.push([x,4.2,z,.38,.48,.38]);}
  for(let x=125;x<174;x+=15)for(const z of [50,62]){lamps.push([x,2.05,z,.1,4.1,.1]);bulbs.push([x,4.2,z,.38,.48,.38]);}
  batch(unitBox,trunk,stems);batch(new THREE.IcosahedronGeometry(1,1),leaf,trees);
  batch(unitBox,iron,lamps);batch(unitBox,mat(0xffd69b,{emissive:0xffb856,emissiveIntensity:1.5}),bulbs);
  sign(['EAST AVENUE','HAWTHORNE PARK →  ·  48TH ST ↑'],100,3,28,7,1.2,Math.PI);
  sign(['47TH STREET','← CLUB & SHOPS  ·  GARDENS →'],59,2.5,15,6,1.2);
  sign(['48TH STREET','THE EASTERN BLOCK'],118,3.4,62,6,1.2,Math.PI);
  const peds=Array.from({length:8},(_,i)=>{
    const person=createHuman({outfit:i%2?'lady':'salesman',color:i%2?'#947269':'#5c747a',umbrella:i%3===0,scale:.96});
    person.position.set(65+i*13,0,i%2?29.6:16);person.rotation.y=i%2?Math.PI/2:-Math.PI/2;root.add(person);return person;
  });
  return {root,peds,seats:DISTRICT_SEATS,update(t,reduced,p){
    peds.forEach((person,i)=>{if(!person.visible||person.position.distanceToSquared(p)>55*55)return;animateHuman(person,t,{mode:reduced?'idle':'walk',bpm:100});person.position.x=65+i*13+Math.sin(t*.12+i)*3;person.rotation.y=Math.cos(t*.12+i)>0?Math.PI/2:-Math.PI/2;});
    fountainWater.forEach(w=>{w.material.roughness=reduced?.25:.22+Math.sin(t*1.4)*.07;});
  }};
}
