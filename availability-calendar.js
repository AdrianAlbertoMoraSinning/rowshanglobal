(function(){
const el=document.getElementById('monthAvailabilityCalendar');if(!el)return;
const title=document.getElementById('calendarMonth'),prev=document.getElementById('calendarPrev'),next=document.getElementById('calendarNext');
let cursor=new Date();cursor=new Date(cursor.getFullYear(),cursor.getMonth(),1);
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function iso(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
async function dayState(d){
 if(d<new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())) return 'unavailable';
 if(!window.RMCData||!RMCData.configured()) return 'available';
 try{const rows=await RMCData.rpc('get_public_day_availability',{p_date:iso(d)});const states=(rows||[]).map(r=>String(r.state||'available').toLowerCase());if(!states.length)return 'available';if(states.every(x=>x==='booked'))return 'booked';if(states.every(x=>x!=='available'))return states.includes('booked')?'booked':'unavailable';return 'available';}catch(e){console.warn('Monthly availability fallback',e);return 'unknown';}
}
async function render(){
 title.textContent=cursor.toLocaleDateString('en-CA',{month:'long',year:'numeric'});el.innerHTML='<div class="notice calendar-loading">Checking live availability…</div>';
 const first=new Date(cursor.getFullYear(),cursor.getMonth(),1),last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0),days=[];for(let i=1;i<=last.getDate();i++)days.push(new Date(cursor.getFullYear(),cursor.getMonth(),i));
 const states=await Promise.all(days.map(dayState));let html='';for(let i=0;i<first.getDay();i++)html+='<div class="month-day empty" aria-hidden="true"></div>';
 days.forEach((d,i)=>{const state=states[i];const label=state==='booked'?'Booked':state==='unavailable'?'Unavailable':state==='unknown'?'Check booking page':'Available';html+=`<a class="month-day ${esc(state)}" href="booking.html?date=${iso(d)}" aria-label="${d.toLocaleDateString('en-CA',{month:'long',day:'numeric'})}: ${label}"><strong>${d.getDate()}</strong><small>${label}</small></a>`});el.innerHTML=html;
}
prev.onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()};next.onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()};render();
})();
