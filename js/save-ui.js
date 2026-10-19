import {BACKUP_LIMIT,RECOVERY_KEY,readBackup,writeBackup} from './save-backup.js';
import {money} from './life.js';
import {escapeHTML as e} from './expansion-ui.js';

export function createSaveUI(hooks){
 const root=document.createElement('section');root.className='shop-overlay save-overlay';root.hidden=true;
 root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Save and backup');document.body.append(root);
 let pending=null,notice='',prior=null,busy=false,readId=0;
 function close(){readId++;root.hidden=true;document.getElementById('visor').inert=false;prior?.focus?.();}
 function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function recovery(){try{return localStorage.getItem(RECOVERY_KEY);}catch{return null;}}
 function stage(text){readBackup(text);pending=text;notice='Check the saved progress below before replacing this browser’s save.';}
 function render(){
  const current=hooks.snapshot().night.commerce.life,saved=pending?readBackup(pending):null,life=saved?.progress.night.commerce.life;
  root.innerHTML=`<div class='shop-sheet save-sheet'><header class='shop-mast'><span>47TH STREET · KEEP YOUR KEYS</span><button class='shop-close' data-close>CLOSE ×</button></header><div class='shop-scroll'><p class='shop-eyebrow'>YOUR NIGHT. TAKE IT WITH YOU.</p><h1>Save a little piece of the city.</h1><p>Your game saves in this browser. Download a backup to keep your wallet, homes, furnishings, photographs and unfinished shift when changing devices.</p><div class='save-summary'><span><small>WALLET</small><strong>${money(current.wallet)}</strong></span><span><small>HOMES</small><strong>${current.properties.length}</strong></span><span><small>FURNISHINGS</small><strong>${current.furnishings.length}</strong></span></div><div class='save-actions'><button data-export class='life-primary'>DOWNLOAD MY BACKUP ↓</button><button data-choose ${busy?'disabled':''}>${busy?'READING FILE…':'CHOOSE A BACKUP ↑'}</button><input type='file' data-file accept='.json,application/json' hidden></div><p class='life-muted'>Keep the .json file somewhere safe. Restoring replaces this browser’s progress. We keep one recovery copy before each restore. Nightly activities may reset if the backup is from an earlier day; cash, keys and furnishings stay.</p>${recovery()?`<button data-recovery>PREVIEW PREVIOUS SAVE ↶</button>`:''}<section class='save-points' data-points aria-label='Restore points'></section>${saved?`<article class='save-preview' aria-label='Backup preview'><small>READY TO RESTORE · ${e(saved.progress.lastDay)}</small><h2>${money(life.wallet)} · ${life.properties.length} ${life.properties.length===1?'home':'homes'}</h2><p>${life.furnishings.length} furnishings · ${life.shifts} shifts completed${life.active?' · unfinished shift included':''}</p><p>This replaces your current ${money(current.wallet)} wallet and ${current.properties.length} ${current.properties.length===1?'home':'homes'}. A recovery copy will be kept.</p><div class='save-actions'><button data-restore class='life-primary'>REPLACE SAVE & RELOAD</button><button data-cancel>CANCEL</button></div></article>`:''}<p class='life-feedback' role='status' aria-live='polite'>${e(notice)}</p></div><footer class='shop-foot'>Only game progress is included. Music files and device settings stay on this device.</footer></div>`;
  root.querySelector('[data-close]').onclick=()=>{close();hooks.onClose();};
  root.querySelector('[data-export]').onclick=()=>{try{download(writeBackup(hooks.snapshot()),`vibe-check-backup-${new Date().toISOString().slice(0,10)}.json`);notice='Backup download requested. Keep the file to restore on another device.';}catch(err){notice=err.message;}render();root.querySelector('[data-export]').focus();};
  root.querySelector('[data-choose]').onclick=()=>root.querySelector('[data-file]').click();
  root.querySelector('[data-file]').onchange=async event=>{
    const file=event.target.files?.[0];if(!file)return;
    const id=++readId;busy=true;pending=null;render();
    try{if(file.size>BACKUP_LIMIT)throw Error('Choose a backup smaller than 2 MB.');const text=await file.text();if(id!==readId)return;stage(text);}catch(err){notice=err.message;}
    finally{if(id===readId){busy=false;render();(root.querySelector('[data-cancel]')||root.querySelector('[data-choose]')).focus();}}
  };
  root.querySelector('[data-recovery]')?.addEventListener('click',()=>{try{stage(recovery());}catch(err){pending=null;notice=err.message;}render();(root.querySelector('[data-cancel]')||root.querySelector('[data-recovery]')).focus();});
  root.querySelector('[data-cancel]')?.addEventListener('click',()=>{pending=null;notice='Restore cancelled. Your current save has not changed.';render();root.querySelector('[data-choose]').focus();});
  root.querySelector('[data-restore]')?.addEventListener('click',()=>{try{hooks.onRestore(pending);}catch(err){notice=err.message;render();root.querySelector('[data-restore]').focus();}});
  // Restore points from the SQLite autosave history: preview one exactly like a backup file.
  const box=root.querySelector('[data-points]'),token=readId;
  Promise.resolve(hooks.restorePoints?.()).then(points=>{
   if(token!==readId||!box||!points?.length)return;
   const db=hooks.dbInfo?.()||{};
   box.innerHTML=`<p class='shop-eyebrow'>RESTORE POINTS · AUTOSAVED ${db.backend==='opfs'?'TO THIS DEVICE':'IN THIS BROWSER'}</p><div class='save-point-list'>${points.slice(0,8).map(p=>`<button data-point='${Number(p.id)}'><strong>${e(new Date(p.savedAt).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))}</strong><small>${e(p.label==='autosave'?'Autosave':p.label)}</small></button>`).join('')}</div>`;
   box.querySelectorAll('[data-point]').forEach(btn=>btn.addEventListener('click',async()=>{try{const prog=await hooks.loadRestorePoint(Number(btn.dataset.point));if(!prog)throw Error('That restore point could not be read.');stage(writeBackup(prog));}catch(err){pending=null;notice=err.message;}render();(root.querySelector('[data-cancel]')||root.querySelector('[data-choose]')).focus();}));
  }).catch(()=>{});
 }
 root.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();close();hooks.onClose();}if(ev.key==='Tab'){const all=[...root.querySelectorAll('button:not(:disabled)')];if(ev.shiftKey&&document.activeElement===all[0]){ev.preventDefault();all.at(-1).focus();}else if(!ev.shiftKey&&document.activeElement===all.at(-1)){ev.preventDefault();all[0].focus();}}ev.stopPropagation();});root.addEventListener('keyup',ev=>ev.stopPropagation());
 return {open(){prior=document.activeElement;pending=null;notice='';busy=false;root.hidden=false;document.getElementById('visor').inert=true;render();root.querySelector('[data-close]').focus();},close,get isOpen(){return !root.hidden;}};
}
