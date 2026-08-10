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
function showToast(msg){const e=$('toast');if(!e)return;e.textContent=msg;e.classList.remove('hidden');clearTimeout(showToast.t);showToast.t=setTimeout(()=>e.classList.add('hidden'),3800)}
function canAssess(n){const u=user(),a=assignment();if(!u)return false;if(u.role==='coordinator'||a?.full)return true;return !!a&&Number.isInteger(n)&&n>=a.start&&n<=a.end}
function message(n,a){return `<div class="access-lock-message"><strong>🔒 Akses Penilaian Dibatasi</strong><br>Catar-Catir Nomor <b>${pad(n)}</b> bukan kelompok penilaian Anda.<br>Anda ditugaskan menilai Catar-Catir Nomor <b>${pad(a.start)}–${pad(a.end)}</b>.<small>Silakan hubungi Koordinator jika diperlukan perubahan penugasan.</small></div>`}
function normalizeLoginName(){const sel=$('simpleName');if(!sel)return;const opt=[...sel.options].find(o=>o.value==='Andi');if(opt){opt.value='Andi Wiguna';opt.textContent='Andi Wiguna'}}
function renderAssignmentBanner(){const view=$('assessmentView'),u=user(),a=assignment();if(!view||!u||!a)return;const hero=view.querySelector('.hero');if(!hero)return;let b=view.querySelector('.assignment-info');if(!b){b=document.createElement('div');b.className='assignment-info';hero.insertAdjacentElement('afterend',b)}
  if(u.role==='coordinator'||a.full)b.innerHTML=`<strong>Koordinator • Akses penuh 01–80</strong><span>Kelompok utama Anda: Catar-Catir ${pad(a.start)}–${pad(a.end)}. Sebagai Koordinator Anda tetap dapat menilai seluruh peserta.</span>`;
  else b.innerHTML=`<strong>Kelompok Penilaian Anda: ${pad(a.start)}–${pad(a.end)}</strong><span>Peserta di luar rentang ini dapat dicari, tetapi rubrik penilaiannya akan dikunci.</span>`;
}
function enforce(){const u=user(),a=assignment(),input=$('participantNo'),card=$('participantCard'),controls=$('assessmentControls');if(!u||!a||!input||!card||!controls)return;const n=parseInt(input.value,10);card.querySelector('.access-lock-message')?.remove();if(!Number.isInteger(n)||n<1||n>80)return;if(canAssess(n))return;controls.classList.add('hidden');card.insertAdjacentHTML('beforeend',message(n,a));}
function guardSave(e){const btn=e.target.closest?.('#saveAssessmentBtn');if(!btn)return;const n=parseInt($('participantNo')?.value,10),a=assignment();if(a&&!canAssess(n)){e.preventDefault();e.stopImmediatePropagation();showToast(`Akses ditolak. Anda hanya dapat menilai Catar-Catir ${pad(a.start)}–${pad(a.end)}.`);enforce()}}
function install(){normalizeLoginName();renderAssignmentBanner();const card=$('participantCard');if(card)new MutationObserver(()=>queueMicrotask(enforce)).observe(card,{childList:true,subtree:true});$('findBtn')?.addEventListener('click',()=>setTimeout(enforce,0));$('participantNo')?.addEventListener('keydown',e=>{if(e.key==='Enter')setTimeout(enforce,0)});document.addEventListener('click',guardSave,true);window.addEventListener('mpk-cloud-updated',enforce);enforce();}
const css=document.createElement('style');css.textContent=`.assignment-info{margin:-2px 0 14px;padding:12px 14px;border:1px solid #c6e5e0;background:#eef8f6;border-radius:14px;color:#285a55}.assignment-info strong{display:block;color:#0b5d56;margin-bottom:3px}.assignment-info span{font-size:12px;line-height:1.45}.access-lock-message{margin-top:12px;padding:13px 14px;border:1px solid #f3c9c9;background:#fff5f5;border-radius:13px;color:#7f1d1d;line-height:1.45}.access-lock-message strong{display:block;margin-bottom:3px}.access-lock-message small{display:block;margin-top:5px;color:#991b1b}`;document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();