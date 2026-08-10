(()=>{'use strict';
const ASSIGNMENTS={
  'Fahriadi':{start:1,end:12,full:true},
  'Gerald':{start:13,end:24,full:false},
  'Andi':{start:25,end:36,full:false,canonical:'Andi Wiguna'},
  'Andi Wiguna':{start:25,end:36,full:false},
  'Samsul':{start:37,end:48,full:false},
  'Kholid':{start:49,end:60,full:false},
  'Iki':{start:61,end:72,full:false},
  'Alexander Tumewu':{start:73,end:80,full:false}
};
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
function user(){try{return JSON.parse(localStorage.getItem('mpkpmb29_user')||'null')}catch{return null}}
function assignment(){const u=user();return u?ASSIGNMENTS[u.name]||null:null}
function participantNo(){return parseInt($('participantNo')?.value||'',10)}
function canAssess(n=participantNo()){
  const u=user(),a=assignment();
  if(!u)return false;
  if(u.role==='coordinator'||a?.full)return true;
  return !!a&&Number.isInteger(n)&&n>=a.start&&n<=a.end;
}
function showToast(msg){const e=$('toast');if(!e)return;e.textContent=msg;e.classList.remove('hidden');clearTimeout(showToast.t);showToast.t=setTimeout(()=>e.classList.add('hidden'),4200)}
function deniedText(n,a){return `Catar-Catir Nomor ${pad(n)} bukan kelompok penilaian Anda. Anda ditugaskan menilai Nomor ${pad(a.start)}–${pad(a.end)}.`}
function deniedHtml(n,a){return `<div class="access-lock-message"><strong>🔒 Akses Penilaian Dibatasi</strong><br>Catar-Catir Nomor <b>${pad(n)}</b> bukan kelompok penilaian Anda.<br>Anda ditugaskan menilai Catar-Catir Nomor <b>${pad(a.start)}–${pad(a.end)}</b>.<small>Silakan hubungi Koordinator jika diperlukan perubahan penugasan.</small></div>`}
function normalizeLoginName(){const sel=$('simpleName');if(!sel)return;const opt=[...sel.options].find(o=>o.value==='Andi');if(opt){opt.value='Andi Wiguna';opt.textContent='Andi Wiguna'}}
function renderAssignmentBanner(){
  const view=$('assessmentView'),u=user(),a=assignment();if(!view||!u||!a)return;
  const hero=view.querySelector('.hero');if(!hero)return;
  let b=view.querySelector('.assignment-info');if(!b){b=document.createElement('div');b.className='assignment-info';hero.insertAdjacentElement('afterend',b)}
  if(u.role==='coordinator'||a.full)b.innerHTML=`<strong>Koordinator • Akses penuh 01–80</strong><span>Kelompok utama Anda: Catar-Catir ${pad(a.start)}–${pad(a.end)}. Sebagai Koordinator Anda tetap dapat menilai seluruh peserta.</span>`;
  else b.innerHTML=`<strong>Kelompok Penilaian Anda: ${pad(a.start)}–${pad(a.end)}</strong><span>Peserta di luar rentang ini dapat dicari untuk identifikasi, tetapi rubrik dan penyimpanan nilai dikunci.</span>`;
}
let enforcing=false;
function enforce(){
  if(enforcing)return;enforcing=true;
  try{
    const u=user(),a=assignment(),input=$('participantNo'),card=$('participantCard'),controls=$('assessmentControls'),rubric=$('rubricPanel');
    if(!u||!a||!input||!card||!controls)return;
    const n=parseInt(input.value,10);
    const old=card.querySelector('.access-lock-message');
    if(!Number.isInteger(n)||n<1||n>80){old?.remove();return}
    if(canAssess(n)){
      old?.remove();
      return;
    }
    controls.classList.add('hidden');
    rubric?.classList.add('hidden');
    if(!old)card.insertAdjacentHTML('beforeend',deniedHtml(n,a));
  }finally{enforcing=false}
}
function blockRestrictedInteraction(e){
  const target=e.target?.closest?.('.category-btn,.score-btn,.attendance-btn,#saveAssessmentBtn,#activitySelect');
  if(!target)return;
  const a=assignment(),n=participantNo();
  if(a&&!canAssess(n)){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showToast(`Akses ditolak. ${deniedText(n,a)}`);
    enforce();
    return false;
  }
}
function install(){
  normalizeLoginName();renderAssignmentBanner();
  document.addEventListener('click',blockRestrictedInteraction,true);
  document.addEventListener('pointerdown',blockRestrictedInteraction,true);
  $('findBtn')?.addEventListener('click',()=>setTimeout(enforce,0));
  $('participantNo')?.addEventListener('keydown',e=>{if(e.key==='Enter')setTimeout(enforce,0)});
  $('participantNo')?.addEventListener('input',()=>setTimeout(enforce,0));
  const view=$('assessmentView');if(view)new MutationObserver(()=>setTimeout(enforce,0)).observe(view,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('mpk-cloud-updated',enforce);
  setInterval(enforce,350);
  enforce();
}
const css=document.createElement('style');css.textContent=`.assignment-info{margin:-2px 0 14px;padding:12px 14px;border:1px solid #c6e5e0;background:#eef8f6;border-radius:14px;color:#285a55}.assignment-info strong{display:block;color:#0b5d56;margin-bottom:3px}.assignment-info span{font-size:12px;line-height:1.45}.access-lock-message{margin-top:12px;padding:13px 14px;border:1px solid #f3c9c9;background:#fff5f5;border-radius:13px;color:#7f1d1d;line-height:1.45}.access-lock-message strong{display:block;margin-bottom:3px}.access-lock-message small{display:block;margin-top:5px;color:#991b1b}`;document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();