import * as THREE from 'three';
import { addBox,unitBox } from './kit.js';
import { printedCard } from './shop-art.js';
import { createHuman } from './human.js';
import { EAST_COUNTERS } from './district-layout.js';

export function buildEastInterior(parent,b) {
  const g=new THREE.Group();g.name=b.name;parent.add(g);
  const palettes={books:[0x284c58,0xc9ac79,0x5e4237],bakery:[0xeee0c5,0x8caba0,0xa86943],arcade:[0x302f4e,0xdbb457,0x794767]};
  const [wallColor,accentColor,woodColor]=palettes[b.id];
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
  const wall=mat(wallColor),accent=mat(accentColor),wood=mat(woodColor),dark=mat(0x233038),paper=mat(0xe9daba);
  const box=(m,x,y,z,w,h,d)=>addBox(g,unitBox,m,x,y,z,w,h,d);
  const x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2;
  box(wall,x0+.09,2,b.z,.18,4,b.d);box(wall,x1-.09,2,b.z,.18,4,b.d);box(wall,b.x,2,z1-.09,b.w,4,.18);
  for(const side of [-1,1])box(wall,b.x+side*(b.w/4+.65),2,z0+.09,b.w/2-1.3,4,.18);
  box(wall,b.x,3.6,z0+.09,2.6,.8,.18);box(paper,b.x,3.98,b.z,b.w,.08,b.d);
  box(wood,b.x,.035,b.z,b.w,.05,b.d);
  box(accent,b.x,.066,b.z,4,.02,b.d-1);
  for(let z=z0+.6;z<z1;z+=1.1)box(dark,b.x,.08,z,3.9,.014,.035);
  const sign=(lines,x,y,z,w,h,rotation=Math.PI)=>{
    const map=printedCard(lines,{paper:b.id==='arcade'?'#292b45':'#ecddbc',ink:b.id==='arcade'?'#e9bd71':'#284c4e',width:768,height:256});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide}));p.position.set(x,y,z);p.rotation.y=rotation;g.add(p);
  };
  sign([b.name,b.id==='books'?'READ THE CITY':b.id==='bakery'?'BAKED FOR THE BLOCK':'PLAY THE NIGHT'],b.x,2.9,z1-.2,Math.min(8,b.w-2),1);
  sign(['OPEN LATE','COME ON IN'],b.x,2.85,z0-.13,2.1,.4);
  const counter=EAST_COUNTERS.find(c=>c.id===b.id);
  box(wood,b.x,.58,counter.z,3.3,1.16,.8);box(accent,b.x,1.2,counter.z,3.5,.12,1);
  sign([b.id==='books'?'EDITH · BOOKSELLER':b.id==='bakery'?'ROSA · BAKER & COURIER DESK':'LENNY · PRIZES & PARCELS','[E] BROWSE THE COUNTER'],b.x,.8,counter.z-.42,2.9,.6);
  const clerk=createHuman({outfit:b.id==='arcade'?'clerk':'lady',hairStyle:b.id==='arcade'?'short':'updo',skin:0xc68642,scarf:false});clerk.position.set(b.x,0,counter.z+1.1);clerk.rotation.y=Math.PI;g.add(clerk);
  for(const side of [-1,1]){
    const x=b.x+side*(b.w/2-.65);
    box(wood,x,1.1,b.z,1,2.2,b.d-3);
    if(b.id==='books'){
      const spineColors=[0xac6550,0xc9ac79,0x688e85,0x556c8f].map(c=>mat(c));
      // Books are batched per color to keep stocked shelves inexpensive.
      const stacks=spineColors.map(()=>[]);
      for(let z=z0+1.7;z<z1-1.5;z+=.28)for(let row=0;row<4;row++)stacks[(Math.round(z*10)+row)%4].push([x-side*.54,.35+row*.48,z,.22,.32+((row+Math.round(z))%2)*.07,.2]);
      stacks.forEach((items,i)=>{const mesh=new THREE.InstancedMesh(unitBox,spineColors[i],items.length),d=new THREE.Object3D();items.forEach((p,n)=>{d.position.set(...p.slice(0,3));d.scale.set(...p.slice(3));d.updateMatrix();mesh.setMatrixAt(n,d.matrix);});g.add(mesh);});
      for(let row=0;row<5;row++)box(accent,x,.13+row*.48,b.z,1.13,.06,b.d-3);
    }else if(b.id==='bakery'){
      for(let z=z0+2;z<z1-1.6;z+=1.2)for(let row=0;row<3;row++){
        const bread=new THREE.Mesh(new THREE.SphereGeometry(.26,8,6),accent);bread.scale.set(.7,.45,1.4);bread.position.set(x-side*.55,.42+row*.62,z);g.add(bread);
      }
      for(let row=0;row<4;row++)box(paper,x,.2+row*.62,b.z,1.15,.06,b.d-3);
    }else{
      for(let z=z0+2;z<z1-1.5;z+=1.75){
        box(dark,x-side*.55,1.4,z,.13,1.1,1.25);
        const glow=mat(z%3>1?0x75c7ba:0xdb8eb1,{emissive:0x64afa6,emissiveIntensity:.55});
        box(glow,x-side*.63,1.5,z,.025,.65,.8);box(accent,x-side*.65,.92,z,.3,.12,1.25);
        for(let n=0;n<3;n++)box(paper,x-side*.82,1,z-.25+n*.23,.1,.06,.1);
      }
    }
  }
  // Pendant shades and ceiling glow use emissive geometry, without new real-time lights.
  const glow=mat(0xffddaa,{emissive:0xffc677,emissiveIntensity:.8});
  for(const z of [z0+2,z1-2])for(const side of [-1,1]){
    const x=b.x+side*2.4;box(dark,x,3.65,z,.025,.6,.025);
    const shade=new THREE.Mesh(new THREE.ConeGeometry(.42,.3,12,1,true),accent);shade.position.set(x,3.32,z);g.add(shade);
    box(glow,x,3.15,z,.48,.025,.48);
  }
  if(b.id==='bakery'){
    sign(['COURIERS WANTED','$30 · TWO STOPS · NO TIMER'],b.x+3.2,2,z0+.25,2.8,.85);
    for(const x of [b.x-1,b.x,b.x+1]){const pastry=new THREE.Mesh(new THREE.TorusGeometry(.18,.065,6,12),accent);pastry.rotation.x=Math.PI/2;pastry.position.set(x,1.32,counter.z);g.add(pastry);}
  }
}
