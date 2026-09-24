import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const url=process.env.VIBE_TEST_URL||'http://127.0.0.1:8000',session=process.env.VIBE_TEST_SESSION||'vibe-block';
const cli=(...args)=>execFileSync('npx',['--yes','agent-browser@0.37.1','--session',session,...args],{encoding:'utf8',timeout:90000});
const ev=s=>JSON.parse(cli('eval',s).trim());
try{
 cli('open',url+'/?inspect=1');cli('wait','--fn','!!window.__vibeInspect');ev("document.getElementById('enterBtn').click();true");
 const signs=ev(`(async()=>{const {auditSigns}=await import('./tests/tools/sign-audit.js');const a=auditSigns(window.__vibeInspect.world);return {count:a.count,issues:a.issues};})()`);
 assert.ok(signs.count>100);assert.deepEqual(signs.issues,[]);console.log('ok  every audited billboard and sign has backing, clearance and no overlaps');
 const road=ev(`(async()=>{const {Raycaster,Vector3}=await import('three');const w=window.__vibeInspect.world;w.scene.updateMatrixWorld(true);const result=[];
 const segments=[[[-99,-48],[187,-48]],[[187,-48],[187,96]],[[187,96],[-99,96]],[[-99,96],[-99,-48]],[[0,-46],[0,-24]],[[109,74],[109,96]]];
 const geometry=[];w.scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&o.geometry?.type==='BoxGeometry'&&!o.material?.transparent)geometry.push(o);});
 for(const [a,b] of segments){const start=new Vector3(a[0],1.7,a[1]),end=new Vector3(b[0],1.7,b[1]),direction=end.clone().sub(start);const ray=new Raycaster(start,direction.clone().normalize(),.1,direction.length()-.1);const hits=ray.intersectObjects(geometry,false);result.push({a,b,hits:hits.map(h=>({point:h.point.toArray(),name:h.object.name})).slice(0,3)});}return result;})()`);
 for(const r of road)assert.equal(r.hits.length,0,JSON.stringify(r));console.log('ok  rendered perimeter and rear passage have no walls across the road');
 for(const [x,z,lx,lz,axis,threshold] of [[184,96,170,96,'x',181],[-99,92,-99,70,'z',89],[0,-37,0,-20,'z',-34]]){
   ev(`window.__vibeInspect.place(${x},${z},${lx},${lz});true`);
   ev("window.dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));true");
   cli('wait','--fn',`window.__vibeInspect.snapshot().position.${axis}${threshold===-34?'>':'<'}${threshold}`);
   ev("window.dispatchEvent(new KeyboardEvent('keyup',{key:'w'}));true");
 }
 console.log('ok  real controls cross both perimeter corners and the former alley wall');
 ev("window.dispatchEvent(new KeyboardEvent('keydown',{key:'j'}));window.dispatchEvent(new KeyboardEvent('keyup',{key:'j'}));true");
 ev("document.querySelector('[data-tab=map]').click();true");
 for(const id of ['northloop','southloop'])assert.ok(ev(`!!document.querySelector('[data-destination=${id}]')`));
 assert.equal(cli('errors').trim(),'');console.log('ok  loop destinations appear in the notebook; no browser errors');
}finally{cli('close');}
