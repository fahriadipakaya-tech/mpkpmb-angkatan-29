(()=>{'use strict';
const CFG=window.MPK_CONFIG;
if(!CFG?.SUPABASE_URL||!CFG?.SUPABASE_PUBLISHABLE_KEY)return;
const LS='mpkpmb29_assessments',USER='mpkpmb29_user',CRED='mpkpmb29_field_credential';
const FUNCTION_URL=`${CFG.SUPABASE_URL.replace(/\/$/,'')}/functions/v1/mpk-field`;
const ASSIGNMENTS={
  'Fahriadi':{start:1,end:12,full:true},
  'Gerald':{start:13,end:24,full:false},
  'Andi':{start:25,end:36,full:false},
  'Andi Wiguna':{start:25,end:36,full:false},
  'Samsul':{start:37,end:48,full:false},
  'Kholid':{start:49,end:60,full:false},
  'Iki':{start:61,end:72,full:false},
  'Alexander Tumewu':{start:73,end:80,full:false}
};
const $=id=>document.getElementById(id);
const readLocal=()=>{try{return JSON.parse(localStorage.getItem(LS)||'[]')}catch{return[]}};
const writeLocal=a=>localStorage.setItem(LS,JSON.stringify(a));
const readJSON=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
function notify(msg){const e=$('toast');if(e){e.textContent=msg;e.classList.remove('hidden');clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.add('hidden'),3800)}else alert(msg)}
function setLoginStatus(msg,kind=''){const e=$('pinStatus');if(!e)return;e.textContent=msg;e.className=`pin-status${kind?' '+kind:''}`}
function getCred(){const c=readJSON(CRED);return c?.name?c:null}
function assignmentFor(cred){
  if(!cred)return null;
  const start=Number(cred.assignment_start),end=Number(cred.assignment_end);
  if(Number.isInteger(start)&&Number.isInteger(end))return{start,end,full:!!cred.full_access};
  return ASSIGNMENTS[cred.name]||null;
}
function canAssessLocal(cred,participantId){
  const id=Number(participantId),a=assignmentFor(cred);
  if(cred?.role==='coordinator'||a?.full)return true;
  return !!a&&Number.isInteger(id)&&id>=a.start&&id<=a.end;
}

async function api(payload){
  const r=await fetch(FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':CFG.SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(payload)});
  let out={};try{out=await r.json()}catch{}
  if(!r.ok||!out.ok)throw new Error(out.error||`Server ${r.status}`);
  return out;
}

function setupSimpleLogin(){
  const name=$('simpleName'),btn=$('simpleLoginBtn');
  if(!name||!btn)return;
  const notice=document.querySelector('.simple-login-notice');if(notice)notice.innerHTML='<strong>Login Penilai</strong><br>Pilih nama Anda lalu tekan MASUK. Tidak perlu password, PIN, email, atau pendaftaran akun.';
  const refresh=()=>{btn.disabled=!name.value;setLoginStatus(name.value?'Siap masuk.':'Pilih nama Anda.',name.value?'ready':'')};
  name.addEventListener('change',refresh);
  btn.addEventListener('click',simpleLogin);
  refresh();
}

async function simpleLogin(){
  const name=$('simpleName')?.value||'',btn=$('simpleLoginBtn');
  if(!name)return setLoginStatus('Pilih nama Anda.','error');
  if(!navigator.onLine)return setLoginStatus('Login pertama membutuhkan koneksi internet.','error');
  if(btn)btn.disabled=true;setLoginStatus('Memeriksa nama...','ready');
  try{
    const r=await api({action:'login',name});
    const access={assignment_start:r.assignment_start,assignment_end:r.assignment_end,full_access:!!r.full_access};
    localStorage.setItem(CRED,JSON.stringify({name:r.name,role:r.role,...access}));
    localStorage.setItem(USER,JSON.stringify({name:r.name,role:r.role,field:true,...access}));
    setLoginStatus('Login berhasil. Membuka aplikasi...','ready');
    location.reload();
  }catch(e){
    setLoginStatus(e.message||'Nama penilai tidak terdaftar.','error');
    if(btn)btn.disabled=false;
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

function removeUnauthorizedPending(cred){
  const local=readLocal(),removed=[];
  const keep=local.filter(x=>{
    if(x.synced)return true;
    if(canAssessLocal(cred,x.participant_id))return true;
    removed.push(x);return false;
  });
  if(removed.length)writeLocal(keep);
  return removed;
}

async function sync(show=true){
  const cred=getCred();
  if(!cred){if(show)notify('Silakan login kembali.');return}
  const removed=removeUnauthorizedPending(cred);
  if(!navigator.onLine){if(show)notify(removed.length?`${removed.length} nilai di luar kelompok dibatalkan. Data lain tetap aman di HP.`:'Tidak ada internet. Nilai tetap aman di HP dan akan disinkron saat online.');return}
  try{
    const pending=readLocal().filter(x=>!x.synced).slice(0,500);
    const r=await api({action:'sync',name:cred.name,pending});
    mergeCloud(r.assessments||[],r.synced_ids||[]);
    if(show)notify(`Sinkron selesai • ${r.synced_ids?.length||0} data dikirim${removed.length?` • ${removed.length} nilai di luar kelompok dibatalkan`:''}.`);
    window.dispatchEvent(new Event('mpk-cloud-updated'));
  }catch(e){if(show)notify('Sinkron gagal: '+(e.message||e))}
}

async function getPhoto(participantId){
  const cred=getCred();
  if(!cred)throw new Error('Silakan login kembali.');
  if(!navigator.onLine)throw new Error('Foto online belum dapat dimuat saat offline.');
  const r=await api({action:'get_photo',name:cred.name,participant_id:Number(participantId)});
  return r.photo||null;
}

async function uploadPhoto(participantId,dataUrl,mime='image/jpeg'){
  const cred=getCred();
  if(!cred)throw new Error('Silakan login kembali.');
  if(!navigator.onLine)throw new Error('Tidak ada internet. Foto disimpan sementara di HP.');
  const r=await api({action:'upload_photo',name:cred.name,participant_id:Number(participantId),photo_base64:dataUrl,mime});
  return r.photo||null;
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
  setupSimpleLogin();
  const logoutBtn=$('logoutBtn');if(logoutBtn)logoutBtn.onclick=logout;
  const syncBtn=$('syncBtn'),adminSync=$('adminSyncBtn');if(syncBtn)syncBtn.onclick=()=>sync(true);if(adminSync)adminSync.onclick=()=>sync(true);
  const seed=$('seedBtn');if(seed)seed.classList.add('hidden');
  document.addEventListener('click',e=>{if(e.target?.id==='saveAssessmentBtn')setTimeout(()=>sync(false),550)},true);
  window.addEventListener('online',()=>setTimeout(()=>sync(false),700));
  const u=readJSON(USER);if(u?.field&&getCred())setTimeout(()=>sync(false),800);
  setInterval(()=>{if(readJSON(USER)?.field)sync(false)},Math.max(30,Number(CFG.AUTO_SYNC_SECONDS)||30)*1000);
  window.MPK_CLOUD={sync,getPhoto,uploadPhoto,api,getCred,canAssessLocal};
  window.dispatchEvent(new Event('mpk-cloud-ready'));
}
document.addEventListener('DOMContentLoaded',init);
})();