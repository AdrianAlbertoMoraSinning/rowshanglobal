(function(){
const defaults=[
{id:'labour',name:'Moving Labour & Furniture Setup',category:'Labour',description:'Flexible hands-on help for loading, unloading, furniture setup, room-to-room moves and on-site organization.',price:50,unit:'hour',minimum:2,image:'assets/rowshan-furniture-setup.webp',active:true,sort_order:10},
{id:'pickup',name:'Mover + Pickup / Local Transport',category:'Delivery',description:'A practical option for smaller moves, furniture pickups, marketplace purchases and light local transport within Calgary.',price:75,unit:'hour',minimum:2,image:'assets/rowshan-loading-crew.webp',active:true,sort_order:20},
{id:'truck2',name:'Two Movers + Box Truck',category:'Moving',description:'Two-person moving crew with a box truck and standard moving equipment for residential, office and larger local moves.',price:135,unit:'hour',minimum:2,image:'assets/rowshan-box-truck-service.webp',active:true,sort_order:30},
{id:'helper',name:'Extra Mover / Heavy-Item Support',category:'Add-on',description:'Add another mover when stairs, bulky furniture or difficult-to-handle items require more manpower.',price:50,unit:'helper/hour',minimum:2,image:'assets/rowshan-residential-move.webp',active:true,sort_order:40},
{id:'junk',name:'Clean-Out / Disposal Run',category:'Junk Removal',description:'Loading and transport of unwanted furniture, appliances and household items; disposal charges are added from the official receipt.',price:75,unit:'hour',minimum:2,image:'assets/rowshan-junk-removal.webp',active:true,sort_order:50},
{id:'packing',name:'Packing, Unpacking & Move Prep',category:'Packing',description:'Extra assistance to box, label, protect, unpack and organize belongings before or after moving day.',price:50,unit:'hour',minimum:2,image:'assets/rowshan-packing-support.webp',active:true,sort_order:60}
];
let servicesCache=null,settingsCache={gst_rate:5,business_hours:'8:00 AM–8:00 PM'};
const rowshanContent=Object.fromEntries(defaults.map(s=>[s.id,{
  name:s.name,category:s.category,description:s.description,image:s.image
}]));
function applyRowshanContent(rows){
  return (rows||[]).map(s=>({...s,...(rowshanContent[s.id]||{})}));
}

function money(n){return new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(Number(n||0))}
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function getSettings(){if(!RMCData?.configured())return settingsCache;try{const a=await RMCData.table.get('settings','id=eq.1&select=*');if(a?.[0])settingsCache=a[0]}catch(e){console.warn(e)}return settingsCache}
async function getServices({includeInactive=false}={}){if(servicesCache&&!includeInactive)return servicesCache; if(!RMCData?.configured())return defaults.filter(x=>includeInactive||x.active);try{const q=`select=id,name,category,description,price,unit,minimum,image,active,sort_order&order=sort_order.asc${includeInactive?'':'&active=eq.true'}`;const rows=await RMCData.table.get('services',q);const branded=applyRowshanContent(rows);if(!includeInactive)servicesCache=branded;return branded}catch(e){console.warn('Using static service fallback',e);return defaults.filter(x=>includeInactive||x.active)}}
async function getReviews(){if(!RMCData?.configured())return [];try{return await RMCData.table.get('reviews','select=id,author,rating,review_text,review_date,source,source_url,visible,sort_order&visible=eq.true&order=sort_order.asc,review_date.desc')}catch(e){console.warn(e);return []}}
async function getGoogleReviews(){try{const res=await fetch('/.netlify/functions/google-reviews',{headers:{Accept:'application/json'}});const text=await res.text();if(!text)return null;const data=JSON.parse(text);if(!res.ok)throw new Error(data.error||`Google reviews request failed (${res.status})`);return data}catch(e){console.warn('Google reviews fallback active',e);return null}}
function totals(items,gst=Number(settingsCache.gst_rate||5)){const subtotal=items.reduce((s,i)=>s+(Number(i.price)*Number(i.qty)),0),gstAmount=subtotal*gst/100;return{subtotal,gst:gstAmount,total:subtotal+gstAmount,gstRate:gst}}
async function renderReviews(){
  const el=document.getElementById('reviewGrid');if(!el)return;
  const summary=document.getElementById('googleReviewSummary'),countEl=document.getElementById('googleReviewCount'),ratingEl=document.getElementById('googleReviewRating'),statusEl=document.getElementById('googleReviewStatus');
  const google=await getGoogleReviews();
  if(google?.configured&&Array.isArray(google.reviews)){
    if(summary)summary.hidden=false;if(ratingEl)ratingEl.textContent=Number(google.averageRating||0)>0?Number(google.averageRating).toFixed(1):'—';if(countEl)countEl.textContent=String(Number(google.totalReviewCount||google.reviews.length));if(statusEl)statusEl.textContent='Live from Google';
    document.querySelectorAll('[data-google-reviews-link]').forEach(a=>{if(google.reviewsUrl)a.href=google.reviewsUrl});
    const withText=google.reviews.filter(r=>String(r.text||'').trim());
    const rows=(withText.length?withText:google.reviews).slice(0,20);
    if(rows.length){el.innerHTML=rows.map(r=>`<blockquote class="google-review-card"><div class="review-stars">${'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</div>${r.text?`“${escapeHtml(r.text)}”`:''}<cite>${escapeHtml(r.author||'Google Customer')} · Google</cite></blockquote>`).join('');return}
  }
  const vis=await getReviews();
  if(summary)summary.hidden=false;if(ratingEl)ratingEl.textContent='—';if(countEl)countEl.textContent=String(vis.length);if(statusEl)statusEl.textContent=google?.configured?'Google temporarily unavailable':'Google connection pending';
  if(!vis.length){el.innerHTML='<div class="notice">Google Reviews connection is ready to be activated. Verified customer reviews will appear here when available.</div>';return}
  el.innerHTML=vis.slice(0,20).map(r=>`<blockquote><div class="review-stars">${'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</div>“${escapeHtml(r.review_text)}”<cite>${escapeHtml(r.author)} · ${escapeHtml(r.source||'Google')}</cite></blockquote>`).join('')
}
async function renderDynamicServices(){const grid=document.getElementById('dynamicServiceGrid');if(!grid)return;const rows=await getServices();grid.innerHTML=rows.map(s=>`<article class="service-card"><img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.name)}"><div class="service-card-body"><span class="badge">${escapeHtml(s.category)}</span><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p></div></article>`).join('')}
async function renderDynamicRates(){const grid=document.getElementById('dynamicRateGrid');if(!grid)return;const rows=await getServices();grid.innerHTML=rows.map((s,i)=>`<article class="rate-card ${s.id==='truck2'?'featured':''}"><h3>${escapeHtml(s.name)}</h3><div class="price">${money(s.price)} <span>/ ${escapeHtml(s.unit)}</span></div><p>${Number(s.minimum||1)}-hour minimum. ${escapeHtml(s.description)}</p></article>`).join('')}
window.RMC={defaults,money,escapeHtml,getServices,getReviews,getSettings,totals,renderReviews,renderDynamicServices,renderDynamicRates};
document.addEventListener('DOMContentLoaded',async()=>{await getSettings();await Promise.all([renderReviews(),renderDynamicServices(),renderDynamicRates()]);});
})();
