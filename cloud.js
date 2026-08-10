(()=>{'use strict';
const CFG=window.MPK_CONFIG;
if(!CFG?.SUPABASE_URL||!CFG?.SUPABASE_PUBLISHABLE_KEY)return;
const LS='mpkpmb29_assessments',USER='mpkpmb29_user',CRED='mpkpmb29_field_credential';
const FUNCTION_URL=`${CFG.SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mpk-field`;
const $=id=>document.getElementById(id);
const readLocal=()=>{try{return JSON.parse(localStorage.getItem(LS)||'[]')}catch{return[]}};
const writeLocal=a=>localStorage.setItem(LS,JSON.stringify(a));
const readJSON=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
function notify(msg){const e=$('toast');if(e){e.textContent=msg;e.classList.remove('hidden');clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.add('hidden'),3200)}else alert(msg)}
function setLoginStatus(msg,kind=''){const e=$('pinStatus');if(!e)return;e.textContent=msg;e.className=`pin-status${kind?' '+kind:''}`}
function getCred(){const c=readJSON(CRED);return c?.name&&c?.pin?c:null}

async function api(payload){
  const r=await fetch(FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':CFG.SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(payload)});
  let out={};try{out=await r.json()}catch{}
  if(!r.ok||!out.ok)throw new Error(out.error||`Server ${r.status}`);
  return out;
}

function setupPinPad(){
  const name=$('simpleName'),pin=$('simplePin'),btn=$('simpleLoginBtn');
  if(!name||!pin||!btn)return;
  const refresh=()=>{btn.disabled=!(name.value&&pin.value);setLoginStatus(name.value&&pin.value?'Siap masuk.':'Pilih nama dan PIN.',name.value&&pin.value?'ready':'')};
  name.addEventListener('change',refresh);
  document.querySelectorAll('.pin-btn').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.pin-btn').forEach(x=>x.classList.remove('selected'));
    b.classList.add('selected');pin.value=b.dataset.pin||'';refresh();
  }));
  btn.addEventListener('click',simpleLogin);
}

async function simpleLogin(){
  const name=$('simpleName')?.value||'',pin=$('simplePin')?.value||'',btn=$('simpleLoginBtn');
  if(!name||!pin)return setLoginStatus('Pilih nama dan PIN.','error');
  if(!navigator.onLine)return setLoginStatus('Login pertama membutuhkan koneksi internet.','error');
  if(btn)btn.disabled=true;setLoginStatus('Memeriksa...','ready');
  try{
    const r=await api({action:'login',name,pin});
    localStorage.setItem(CRED,JSON.stringify({name:r.name,pin,role:r.role}));
    localStorage.setItem(USER,JSON.stringify({name:r.name,role:r.role,field:true}));
    setLoginStatus('Login berhasil. Membuka aplikasi...','ready');
    location.reload();
  }catch(e){
    document.querySelectorAll('.pin-btn').forEach(x=>x.classList.remove('selected'));
    if($('simplePin'))$('simplePin').value='';
    setLoginStatus(e.message||'Nama atau PIN salah.','error');
    if(btn)btn.disabled=true;
  }
}

function rowFromCloud(r){
  const p=(window.MPK_ROSTER||[]).find(x=>x.id===r.participant_id);
  return {id:String(r.client_id||r.id),participant_id:r.participant_id,code:p?.code||String(r.participant_id).padStart(2,'0'),name:p?.name||'Peserta',program:p?.program||'',category:r.category,activity:r.activity,scores:r.scores||{},final_score:r.final_score==null?null:Number(r.final_score),discipline_status:r.discipline_status,notes:r.notes||'',assessor_name:r.assessor_name||'Penilai',created_at:r.created_at,synced:true};
}

function mergeCloud(rows,syncedIds=[]){
  const local=readLocal(),done=new Set((syncedIds||[]).map(String));
  local.forEach(x=>{if(done.has(String(x.id)))x.synced=true});
  const byId=new Map(local.map(x=>[String(x.id),x]));
  for(const r of rows||[]){const x=rowFromCloud(r);byId.set(String(x.id),x)}
  writeLocal([...byId.values()]);
}

async function sync(show=true){
  const cred=getCred();
  if(!cred){if(show)notify('Silakan login kembali.');return}
  if(!navigator.onLine){if(show)notify('Tidak ada internet. Nilai tetap aman di HP dan akan disinkron saat online.');return}
  try{
    const pending=readLocal().filter(x=>!x.synced).slice(0,500);
    const r=await api({action:'sync',name:cred.name,pin:cred.pin,pending});
    mergeCloud(r.assessments||[],r.synced_ids||[]);
    if(show)notify(`Sinkron selesai • ${r.synced_ids?.length||0} data dikirim.`);
    window.dispatchEvent(new Event('mpk-cloud-updated'));
  }catch(e){if(show)notify('Sinkron gagal: '+(e.message||e))}
}

function forceSimpleLoginForLegacyUsers(){
  const u=readJSON(USER),cred=getCred();
  if(u&&(!u.field||!cred)){
    localStorage.removeItem(USER);
    localStorage.removeItem(CRED);
    location.reload();
    return true;
  }
  return false;
}

function logout(){
  localStorage.removeItem(USER);
  localStorage.removeItem(CRED);
  location.reload();
}

function init(){
  if(forceSimpleLoginForLegacyUsers())return;
  setupPinPad();
  const logoutBtn=$('logoutBtn');if(logoutBtn)logoutBtn.onclick=logout;
  const syncBtn=$('syncBtn'),adminSync=$('adminSyncBtn');if(syncBtn)syncBtn.onclick=()=>sync(true);if(adminSync)adminSync.onclick=()=>sync(true);
  const seed=$('seedBtn');if(seed)seed.classList.add('hidden');
  document.addEventListener('click',e=>{if(e.target?.id==='saveAssessmentBtn')setTimeout(()=>sync(false),550)},true);
  window.addEventListener('online',()=>setTimeout(()=>sync(false),700));
  const u=readJSON(USER);if(u?.field&&getCred())setTimeout(()=>sync(false),800);
  setInterval(()=>{if(readJSON(USER)?.field)sync(false)},Math.max(30,Number(CFG.AUTO_SYNC_SECONDS)||30)*1000);
  window.MPK_CLOUD={sync};
}
document.addEventListener('DOMContentLoaded',init);
})();
