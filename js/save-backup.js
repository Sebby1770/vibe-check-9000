import {loadProgress,PROGRESS_KEY} from './progress.js';

export const BACKUP_VERSION=1;
export const BACKUP_LIMIT=2*1024*1024;
export const RECOVERY_KEY='vc9k-before-import';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const strings=v=>Array.isArray(v)&&v.every(s=>typeof s==='string');
const flags=v=>object(v)&&Object.values(v).every(x=>typeof x==='boolean');
const number=v=>Number.isFinite(v)&&v>=0;

// Validate before normalization: a damaged/unrelated file must never become a fresh save.
export function readBackup(text) {
  if(typeof text!=='string'||text.length>BACKUP_LIMIT)throw Error('Choose a VIBE CHECK backup smaller than 2 MB.');
  let file;try{file=JSON.parse(text);}catch{throw Error('This file is not valid JSON. Your current save has not changed.');}
  if(file?.game!=='vibe-check-9000')throw Error('This is not a VIBE CHECK 9000 backup.');
  if(file.version!==BACKUP_VERSION)throw Error('This backup uses an unsupported version. Keep it for a compatible game update.');
  let nodes=0;
  function inspect(v,depth=0){
    if(++nodes>15000||depth>16)throw Error('This backup is too complex to read.');
    if(typeof v==='string'&&(v.length>200000||/[<>]/.test(v)))throw Error('This backup contains invalid text.');
    if(typeof v==='number'&&!Number.isFinite(v))throw Error('This backup contains an invalid number.');
    if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){
      if(['__proto__','constructor','prototype'].includes(k))throw Error('This backup contains an invalid field.');
      inspect(x,depth+1);
    }
  }
  inspect(file);
  const p=file.progress,n=p?.night,c=n?.commerce,l=c?.life;
  if(!object(p)||!object(n)||!object(c)||!object(l)||!strings(p.unlocked)||!strings(p.talked)||!strings(p.zones)||!flags(p.flags)||!flags(n.flags)||!strings(n.talked)||!strings(n.zones)||!Array.isArray(p.stamps)||!number(n.elapsed)||!number(l.wallet)||!strings(l.properties)||!strings(l.furnishings)||!strings(l.installed)||typeof p.lastDay!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.lastDay))throw Error('This backup is incomplete or damaged. Your current save has not changed.');
  for(const section of [c,l,c.expansion,c.neighborhood])if(section?.version!==undefined&&section.version!==1)throw Error('This save needs a newer game version.');
  const progress=loadProgress({getItem:()=>JSON.stringify(p)});
  if(progress.lastDay!==p.lastDay||progress.night.commerce.life.wallet!==l.wallet)throw Error('The saved progress could not be read safely.');
  const normalized=progress.night.commerce.life;
  for(const key of ['properties','furnishings','installed']){
    if(l[key].length!==normalized[key].length||l[key].some(id=>!normalized[key].includes(id)))throw Error('This backup contains homes or furnishings this game cannot restore. Keep it for a compatible update.');
  }
  if(l.home&&normalized.home!==l.home||l.active&&(!normalized.active||l.active.job!==normalized.active.job))throw Error('This backup contains a home or job this game cannot restore.');
  return {progress,exportedAt:typeof file.exportedAt==='string'?file.exportedAt:'',version:file.version};
}
export function writeBackup(progress,now=new Date()) {
  const text=JSON.stringify({game:'vibe-check-9000',version:BACKUP_VERSION,exportedAt:now.toISOString(),progress});
  readBackup(text);
  return text;
}
export function restoreBackup(text,current,storage) {
  const incoming=readBackup(text).progress;
  const recovery=writeBackup(current);
  try{
    // Write recovery first. If either write fails, the running game stays unchanged.
    storage.setItem(RECOVERY_KEY,recovery);
    storage.setItem(PROGRESS_KEY,JSON.stringify(incoming));
  }catch{throw Error('There is not enough browser storage to restore safely. Export your current save first, then free some space.');}
  return incoming;
}
