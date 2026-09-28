import assert from 'node:assert/strict';
import {loadProgress,touchVisit,PROGRESS_KEY} from '../js/progress.js';
import {normalizeLife,startShift,prepareDiner} from '../js/life.js';
import {writeBackup,readBackup,restoreBackup,RECOVERY_KEY,BACKUP_LIMIT} from '../js/save-backup.js';
const memory=()=>({data:{},getItem(k){return this.data[k]??null;},setItem(k,v){this.data[k]=v;}});
const store=memory(),p=touchVisit(loadProgress(store),'2026-09-28');
p.night.commerce.life=normalizeLife({wallet:510,properties:['mercer','studio'],home:'mercer',furnishings:['plant'],installed:['plant'],goalChosen:true});
p.night.commerce.life=startShift(p.night.commerce.life,'diner',10).state;
p.night.commerce.life=prepareDiner(p.night.commerce.life,'drink',1,'0:0:diner').state;
p.night.commerce.life=prepareDiner(p.night.commerce.life,'pour',0,'0:0:diner').state;
p.night.commerce.expansion.photos=[{id:'photo',image:'data:image/jpeg;base64,AAAA',title:'Garden',clock:'10:15 PM'}];
const text=writeBackup(p);
assert.deepEqual(readBackup(text).progress,p,'round trip preserves homes, photos and diner preparation');
for(const bad of ['not JSON','{}',JSON.stringify({...JSON.parse(text),version:99}),JSON.stringify({...JSON.parse(text),game:'another-game'}),'x'.repeat(BACKUP_LIMIT+1)])assert.throws(()=>readBackup(bad));
for(const mutate of [p=>p.night.commerce.life.wallet=-1,p=>p.night.commerce.life.version=2,p=>p.unlocked={},p=>p.night.flags=null,p=>p.lastDay=null,p=>p.night.commerce.life.properties.push('future-penthouse'),p=>p.night.commerce.life.furnishings.push('future-sofa'),p=>p.night.commerce.life.active.job='unknown-job',p=>p.night=null,p=>p.flags={bad:'<img src=x>'}]){
 const file=JSON.parse(text);mutate(file.progress);assert.throws(()=>readBackup(JSON.stringify(file)));
}
assert.throws(()=>readBackup(text.replace('"flags":{}','"flags":{"__proto__":{}}')));
const previous=touchVisit(loadProgress(store),'2026-09-28');store.setItem(PROGRESS_KEY,JSON.stringify(previous));
restoreBackup(text,previous,store);
assert.deepEqual(loadProgress(store),p);
assert.deepEqual(readBackup(store.getItem(RECOVERY_KEY)).progress,previous);
const undo=store.getItem(RECOVERY_KEY);restoreBackup(undo,p,store);
assert.deepEqual(loadProgress(store),previous);
assert.deepEqual(readBackup(store.getItem(RECOVERY_KEY)).progress,p,'undo keeps the replaced import recoverable');
assert.throws(()=>restoreBackup('{}',previous,store));assert.deepEqual(loadProgress(store),previous);
for(const failingKey of [RECOVERY_KEY,PROGRESS_KEY]){
 const quota=memory();quota.setItem(PROGRESS_KEY,JSON.stringify(previous));const set=quota.setItem.bind(quota);
 quota.setItem=(key,value)=>{if(key===failingKey)throw Error('quota');set(key,value);};
 assert.throws(()=>restoreBackup(text,previous,quota),/storage/);assert.deepEqual(loadProgress(quota),previous,'failed write leaves original progress intact');
}
const tomorrow=touchVisit(readBackup(text).progress,'2026-09-29');
assert.deepEqual(tomorrow.night.commerce.life,p.night.commerce.life,'older imports retain permanent progress and prepared shift');
console.log('save backups: round trip, validation, recovery, storage failure and day rollover pass');
