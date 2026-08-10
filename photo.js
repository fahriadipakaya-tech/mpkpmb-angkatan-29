(()=>{'use strict';
const CFG=window.MPK_CONFIG,ROSTER=window.MPK_ROSTER||[];
if(!CFG?.SUPABASE_URL||!CFG?.SUPABASE_PUBLISHABLE_KEY)return;
const $=id=>document.getElementById(id),USER='mpkpmb29_user';
const FUNCTION_URL=`${CFG.SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mpk-field`;
let activeParticipantId=null,previewPayload=null,decorating=false;

function readUser(){try{return JSON.parse(localStorage.getItem(USER)||'null')}catch{return null}}
function notify(msg){const e=$('toast');if(e){e.textContent=msg;e.classList.remove('hidden');clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.add('hidden'),3600)}else alert(msg)}
async function api(payload){
  const r=await fetch(FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':CFG.SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(payload)});
  let out={};try{out=await r.json()}catch{}
  if(!r.ok||!out.ok){const e=new Error(out.error||`Server ${r.status}`);e.status=r.status;throw e}
  return out;
}

function injectUI(){
  if($('mpkPhotoCamera'))return;
  const style=document.createElement('style');style.textContent=`
  .mpk-photo-box{width:86px;min-width:86px;height:104px;border-radius:14px;overflow:hidden;border:1px solid #cddde1;background:#edf4f3;display:grid;place-items:center;position:relative}
  .mpk-photo-box img{width:100%;height:100%;object-fit:cover;display:block}.mpk-photo-placeholder{font-size:34px;color:#7b9794}.mpk-photo-actions{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 0}.mpk-photo-actions button{border:1px solid #cbdcdf;background:#fff;color:#0b5d56;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer}.mpk-photo-actions button.primary-photo{background:#0b5d56;color:#fff;border-color:#0b5d56}.mpk-photo-status{font-size:11px;color:#64748b;margin-top:6px}.mpk-photo-status.wait{color:#b45309;font-weight:800}.mpk-photo-status.ok{color:#0b6b61;font-weight:800}.participant-card .row{align-items:center;gap:10px}.mpk-photo-modal{position:fixed;inset:0;background:#0f172aaa;display:grid;place-items:center;z-index:500;padding:18px}.mpk-photo-modal.hidden{display:none}.mpk-photo-modal .box{background:#fff;width:min(430px,100%);border-radius:18px;padding:18px}.mpk-photo-modal img{display:block;max-width:100%;max-height:58vh;margin:0 auto;border-radius:14px}.mpk-photo-modal .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.mpk-photo-modal .acts button{min-height:44px;border-radius:11px;font-weight:900}.mpk-photo-modal .cancel{background:#fff;border:1px solid #cbd5e1}.mpk-photo-modal .use{background:#0b5d56;color:#fff;border:0}.mpk-photo-badge{position:absolute;right:5px;bottom:5px;background:#fffddf;border-radius:999px;padding:3px 6px;font-size:9px;font-weight:900;color:#8a5a00}
  @media(max-width:600px){.mpk-photo-box{width:72px;min-width:72px;height:88px}.mpk-photo-actions{display:grid;grid-template-columns:1fr 1fr}.mpk-photo-actions button{width:100%}}
  `;document.head.appendChild(style);
  const cam=document.createElement('input');cam.type='file';cam.id='mpkPhotoCamera';cam.accept='image/*';cam.setAttribute('capture','environment');cam.hidden=true;
  const gal=document.createElement('input');gal.type='file';gal.id='mpkPhotoGallery';gal.accept='image/*';gal.hidden=true;
  const modal=document.createElement('div');modal.id='mpkPhotoModal';modal.className='mpk-photo-modal hidden';modal.innerHTML='<div class="box"><h3>Periksa Foto Taruna</h3><p style="font-size:12px;color:#64748b">Pastikan wajah terlihat jelas dan foto sesuai Taruna yang sedang dipilih.</p><img id="mpkPhotoPreview" alt="Preview foto"><div class="acts"><button id="mpkPhotoCancel" class="cancel">Batal</button><button id="mpkPhotoUse" class="use">Gunakan Foto</button></div></div>';
  document.body.append(cam,gal,modal);
  cam.addEventListener('change',e=>handleSelected(e.target.files?.[0]));gal.addEventListener('change',e=>handleSelected(e.target.files?.[0]));
  $('mpkPhotoCancel').onclick=closePreview;$('mpkPhotoUse').onclick=confirmPhoto;
}

function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('mpkpmb29_photo_queue',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('pending'))r.result.createObjectStore('pending',{keyPath:'participant_id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbGet(id){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('pending','readonly'),r=t.objectStore('pending').get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function dbPut(x){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('pending','readwrite');t.objectStore('pending').put(x);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error)})}
async function dbDelete(id){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('pending','readwrite');t.objectStore('pending').delete(id);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error)})}
async function dbAll(){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('pending','readonly'),r=t.objectStore('pending').getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}

async function compress(file){
  if(!file||!String(file.type).startsWith('image/'))throw new Error('Pilih file gambar.');
  let source=null,w=0,h=0,cleanup=()=>{};
  if('createImageBitmap'in window){try{source=await createImageBitmap(file,{imageOrientation:'from-image'});w=source.width;h=source.height;cleanup=()=>source.close?.()}catch{}}
  if(!source){const url=URL.createObjectURL(file);source=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});w=source.naturalWidth;h=source.naturalHeight;cleanup=()=>URL.revokeObjectURL(url)}
  const maxW=520,maxH=680,scale=Math.min(1,maxW/w,maxH/h),cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));
  const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0,cw,ch);cleanup();
  let quality=.78,data=canvas.toDataURL('image/jpeg',quality);while(data.length>700000&&quality>.5){quality-=.08;data=canvas.toDataURL('image/jpeg',quality)}
  return{data_url:data,width:cw,height:ch,approx_bytes:Math.round((data.length-data.indexOf(',')-1)*.75)};
}

async function handleSelected(file){
  try{if(!file)return;previewPayload=await compress(file);$('mpkPhotoPreview').src=previewPayload.data_url;$('mpkPhotoModal').classList.remove('hidden')}catch(e){notify('Foto tidak dapat diproses: '+(e.message||e))}finally{if($('mpkPhotoCamera'))$('mpkPhotoCamera').value='';if($('mpkPhotoGallery'))$('mpkPhotoGallery').value=''}
}
function closePreview(){$('mpkPhotoModal')?.classList.add('hidden');previewPayload=null}

async function confirmPhoto(){
  const id=activeParticipantId,u=readUser();if(!id||!u?.name||!previewPayload)return closePreview();
  const item={participant_id:id,name:u.name,image_data:previewPayload.data_url,width:previewPayload.width,height:previewPayload.height,created_at:new Date().toISOString()};
  closePreview();setLocalPhoto(item.image_data,'Menyimpan foto...','wait');
  if(!navigator.onLine){await dbPut(item);setLocalPhoto(item.image_data,'Menunggu sinkronisasi','wait',true);notify('Foto tersimpan sementara di HP. Akan dikirim saat online.');return}
  try{const r=await api({action:'photo-upload',...item});await dbDelete(id).catch(()=>{});applyRemotePhoto(r.photo);notify('Foto Taruna berhasil disimpan.')}catch(e){
    if(!e.status){await dbPut(item);setLocalPhoto(item.image_data,'Menunggu sinkronisasi','wait',true);notify('Sinyal bermasalah. Foto disimpan sementara di HP.')}else{notify(e.message||'Foto gagal disimpan.');await decorate(true)}
  }
}

function photoEls(){return{img:$('mpkParticipantPhoto'),ph:$('mpkParticipantPhotoPlaceholder'),status:$('mpkParticipantPhotoStatus'),actions:$('mpkParticipantPhotoActions'),badge:$('mpkParticipantPhotoBadge')}}
function setLocalPhoto(src,text,kind='',pending=false){const e=photoEls();if(!e.img)return;e.img.src=src;e.img.classList.remove('hidden');e.ph?.classList.add('hidden');if(e.status){e.status.textContent=text;e.status.className='mpk-photo-status '+kind}if(e.badge){e.badge.textContent=pending?'BELUM SYNC':'';e.badge.classList.toggle('hidden',!pending)}}
function applyRemotePhoto(photo){const e=photoEls(),u=readUser();if(!e.img)return;if(photo?.url){e.img.src=photo.url;e.img.classList.remove('hidden');e.ph?.classList.add('hidden');e.status.textContent=`Foto tersimpan • ${photo.updated_by||'Penilai'}`;e.status.className='mpk-photo-status ok';e.badge?.classList.add('hidden');const canReplace=u?.role==='coordinator';if(e.actions)e.actions.classList.toggle('hidden',!canReplace)}else{e.img.removeAttribute('src');e.img.classList.add('hidden');e.ph?.classList.remove('hidden');e.status.textContent='Belum ada foto.';e.status.className='mpk-photo-status';if(e.actions)e.actions.classList.remove('hidden')}}

async function decorate(force=false){
  if(decorating)return;const card=$('participantCard');if(!card||card.classList.contains('empty'))return;
  const id=parseInt($('participantNo')?.value||'',10);if(!id||!ROSTER.some(p=>p.id===id))return;
  if(!force&&card.querySelector('#mpkParticipantPhoto'))return;
  decorating=true;activeParticipantId=id;
  try{
    card.querySelector('.mpk-photo-actions')?.remove();card.querySelector('.mpk-photo-status')?.remove();card.querySelector('.mpk-photo-box')?.remove();
    const row=card.querySelector('.row');if(!row)return;
    const box=document.createElement('div');box.className='mpk-photo-box';box.innerHTML='<img id="mpkParticipantPhoto" class="hidden" alt="Foto Taruna"><div id="mpkParticipantPhotoPlaceholder" class="mpk-photo-placeholder">👤</div><span id="mpkParticipantPhotoBadge" class="mpk-photo-badge hidden"></span>';row.insertBefore(box,row.firstChild);
    const actions=document.createElement('div');actions.id='mpkParticipantPhotoActions';actions.className='mpk-photo-actions';actions.innerHTML='<button type="button" id="mpkCameraBtn" class="primary-photo">📷 Kamera</button><button type="button" id="mpkGalleryBtn">🖼 Galeri</button>';
    const status=document.createElement('div');status.id='mpkParticipantPhotoStatus';status.className='mpk-photo-status';status.textContent='Memeriksa foto...';row.after(actions,status);
    $('mpkCameraBtn').onclick=()=>{activeParticipantId=id;$('mpkPhotoCamera').click()};$('mpkGalleryBtn').onclick=()=>{activeParticipantId=id;$('mpkPhotoGallery').click()};
    const pending=await dbGet(id).catch(()=>null);if(pending){setLocalPhoto(pending.image_data,'Menunggu sinkronisasi','wait',true);return}
    if(!navigator.onLine){status.textContent='Offline • foto server akan tampil saat online.';return}
    const u=readUser();if(!u?.name)return;
    try{const r=await api({action:'photo-get',name:u.name,participant_id:id});applyRemotePhoto(r.photo)}catch(e){status.textContent='Foto belum dapat dimuat.'}
  }finally{decorating=false}
}

async function syncPending(){
  if(!navigator.onLine)return;const u=readUser();if(!u?.name)return;const items=await dbAll().catch(()=>[]);if(!items.length)return;
  for(const item of items){try{const r=await api({action:'photo-upload',...item,name:u.name});await dbDelete(item.participant_id);if(activeParticipantId===item.participant_id)applyRemotePhoto(r.photo)}catch(e){if(e.status===403){await dbDelete(item.participant_id);if(activeParticipantId===item.participant_id)await decorate(true)}}}
}

function init(){
  injectUI();const card=$('participantCard');if(card){new MutationObserver(()=>setTimeout(()=>decorate(false),20)).observe(card,{childList:true,subtree:true});if(!card.classList.contains('empty'))decorate()}
  window.addEventListener('online',()=>setTimeout(()=>{syncPending();decorate(true)},800));setTimeout(syncPending,1200);setInterval(syncPending,45000);
  window.MPK_PHOTO={decorate,syncPending};
}
document.addEventListener('DOMContentLoaded',init);
})();