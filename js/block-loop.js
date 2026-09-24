import * as THREE from 'three';
import { addBox, unitBox } from './kit.js';
import { printedCard } from './shop-art.js';
import { brickTex } from './textures.js';
import { BLOCK_ROADS } from './district-layout.js';

// Geometry follows the same road network used by movement regression tests.
export function buildBlockLoop(scene) {
  const root=new THREE.Group();root.name='Connected city block';scene.add(root);
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
  const paving=material(0x827e76),asphalt=material(0x30353d),stone=material(0xb5a58a),iron=material(0x263b3c),green=material(0x47634b);
  const batches=new Map();
  const box=(m,x,y,z,w,h,d)=>{if(!batches.has(m))batches.set(m,[]);batches.get(m).push([x,y,z,w,h,d]);};
  const board=(text,x,z,rotation=0)=>{
    const group=new THREE.Group();group.userData.freestandingSign=true;group.position.set(x,0,z);group.rotation.y=rotation;root.add(group);
    addBox(group,unitBox,iron,0,1.6,0,.1,3.2,.1);
    addBox(group,unitBox,iron,0,2.85,0,5,.85,.14);
    const map=printedCard(text,{paper:'#244b47',ink:'#f1ddaf',width:768,height:192});map.name=text.join(' · ');
    const face=new THREE.Mesh(new THREE.PlaneGeometry(4.85,.7),new THREE.MeshBasicMaterial({map}));face.position.set(0,2.85,.076);group.add(face);
  };
  box(paving,46,-.38,23,312,.3,166);
  for(const r of BLOCK_ROADS){
    const [x0,z0]=r.a,[x1,z1]=r.b,horizontal=z0===z1;
    // Existing district roads retain their surface; only their extensions are built here.
    let segments=[[r.a,r.b]];
    if(r.name==='47th Street')segments=[[[-99,22.8],[-90,22.8]],[[174,22.8],[187,22.8]]];
    if(r.name==='48th Street')segments=[[[174,56],[187,56]]];
    if(r.name==='East Avenue')segments=[[[109,-48],[109,-30]],[[109,74],[109,96]]];
    for(const [a,b] of segments){
      const length=Math.hypot(b[0]-a[0],b[1]-a[1])+r.width;
      box(paving,(a[0]+b[0])/2,-.18,(a[1]+b[1])/2,horizontal?length:r.width+10,.3,horizontal?r.width+10:length);
      box(asphalt,(a[0]+b[0])/2,.005,(a[1]+b[1])/2,horizontal?length:r.width,.04,horizontal?r.width:length);
    }
    if(['47th Street','48th Street','East Avenue','Arcade Passage'].includes(r.name))continue;
    for(let v=(horizontal?x0:z0)+10;v<(horizontal?x1:z1)-5;v+=18){
      const x=horizontal?v:x0,z=horizontal?z0:v;
      box(stone,x,.037,z,horizontal?3:.12,.015,horizontal?.12:3);
      const junction=horizontal
        ? Math.abs(x-109)<9 || (z===-48&&Math.abs(x)<8)
        : Math.abs(z-22.8)<9 || (x===187&&Math.abs(z-56)<9);
      if(junction)continue;
      for(const side of [-1,1]){
        const lx=x+(horizontal?0:side*7),lz=z+(horizontal?side*7:0);
        box(iron,lx,2,lz,.12,4,.12);box(stone,lx,4,lz,.5,.12,.5);
        box(glow,lx,3.76,lz,.3,.36,.3);
      }
    }
  }
  function crossing(x,z){for(let i=-3;i<=3;i++)for(const side of [-1,1]){
    box(stone,x+i*1.25,.045,z+side*7,.7,.02,2.3);
    box(stone,x+side*7,.045,z+i*1.25,2.3,.02,.7);
  }}
  // All perimeter corners and the two through streets have visible crossings.
  for(const x of [-99,109,187])for(const z of [-48,96])crossing(x,z);
  for(const x of [-99,187])crossing(x,22.8);
  crossing(187,56);
  board(['49TH STREET','← WEST AVENUE · RIVERSIDE →'],104,89);
  board(['46TH STREET','ARCADE PASSAGE · CLUB ↑'],6,-41,Math.PI);
  board(['RIVERSIDE AVENUE','47TH · 48TH · 49TH'],179,31,Math.PI/2);
  board(['WEST AVENUE','WALK THE BLOCK'], -92,31,-Math.PI/2);
  board(['ARCADE PASSAGE','46TH STREET · CITY LOOP'],6,-35,Math.PI);
  // A landscaped southern square gives the return journey its own landmark.
  box(green,78,-.05,-37,38,.12,12);
  box(stone,78,.035,-37,38,.04,2);
  for(const x of [63,72,84,93]){
    box(iron,x,.32,-37,2,.65,.9);box(stone,x,.7,-37,2.2,.12,1);
    box(green,x,1.05,-37,1.8,.65,.7);
  }
  // Outer facades stay outside the playable sidewalks, framing the entire loop.
  const brick=material(0xc5a28e,{map:brickTex()});brick.map.repeat.set(3,5);
  const glass=material(0x4b5961,{metalness:.35,roughness:.28});
  const lit=material(0xd2b382,{emissive:0xb99357,emissiveIntensity:.25});
  const buildings=[];
  for(let x=-90;x<190;x+=22)buildings.push([x,117,18,17,22+(Math.abs(x)%4)*5]);
  for(let z=-35;z<95;z+=24)buildings.push([-120,z,16,20,28],[208,z,14,20,24]);
  for(const [x,z,w,d,h] of buildings){
    box(brick,x,h/2,z,w,h,d);box(stone,x,1.8,z,w+.2,3.6,d+.2);box(stone,x,h,z,w+.5,.5,d+.5);
    for(const side of [-1,1]){
      const face=z+side*(d/2+.12);
      box(iron,x,1.35,face,2.2,2.7,.12);
      box(glass,x,1.5,face+side*.08,1.7,2.15,.08);
      box(stone,x,2.85,face,2.6,.2,.55);
      for(const dx of [-w*.3,w*.3]){
        box(iron,x+dx,1.65,face,3,2.3,.12);
        box(glass,x+dx,1.65,face+side*.09,2.65,2,.08);
        box(stone,x+dx,1.65,face+side*.15,.08,2.1,.08);
      }
    }
    for(let y=5;y<h-1;y+=3.2)for(let dx=-w/2+2;dx<w/2-1;dx+=3)for(const side of [-1,1]){
      box(iron,x+dx,y,z+side*(d/2+.04),1.45,1.95,.1);
      box((Math.round(y+dx)%3)?glass:lit,x+dx,y,z+side*(d/2+.1),1.18,1.65,.08);
      box(stone,x+dx,y-1,z+side*(d/2+.17),1.55,.12,.4);
    }
    for(let y=5;y<h-1;y+=3.2)for(let dz=-d/2+2;dz<d/2-1;dz+=3)for(const side of [-1,1]){
      box(glass,x+side*(w/2+.08),y,z+dz,.1,1.7,1.2);
      box(stone,x+side*(w/2+.16),y-1,z+dz,.35,.12,1.45);
    }
  }
  for(const [m,items] of batches){const mesh=new THREE.InstancedMesh(unitBox,m,items.length),dummy=new THREE.Object3D();items.forEach((a,i)=>{dummy.position.set(...a.slice(0,3));dummy.scale.set(...a.slice(3));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();root.add(mesh);}
  return root;
}
const glow=new THREE.MeshStandardMaterial({color:0xffd9a1,emissive:0xffc477,emissiveIntensity:1.1});
