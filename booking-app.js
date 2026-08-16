(function(){
const defaults=[
{id:'labour1',name:'Labour Only — 1 Mover',category:'Standard Package',description:'One professional mover for labour-only moving help. No vehicle included.',price:60,unit:'hour',minimum:2,image:'assets/rowshan-loading-crew.webp',active:true,sort_order:10},
{id:'pickup1',name:'Small Move — 1 Mover + Pickup Truck',category:'Standard Package',description:'One mover with a pickup truck for smaller moves, deliveries and local transport.',price:70,unit:'hour',minimum:2,image:'assets/rowshan-loading-crew.webp',active:true,sort_order:20},
{id:'pickup2',name:'Small Move — 2 Movers + Pickup Truck',category:'Standard Package',description:'Two movers with a pickup truck for small moves that need additional labour.',price:110,unit:'hour',minimum:2,image:'assets/rowshan-loading-crew.webp',active:true,sort_order:30},
{id:'box10_1',name:'Standard Move — 1 Mover + 10-Foot Box Truck',category:'Standard Package',description:'One mover with a 10-foot box truck for standard local moving needs.',price:110,unit:'hour',minimum:2,image:'assets/rowshan-box-truck-service.webp',active:true,sort_order:40},
{id:'box10_2',name:'Standard Move — 2 Movers + 10-Foot Box Truck',category:'Standard Package',description:'Two movers with a 10-foot box truck for efficient residential and small-business moves.',price:150,unit:'hour',minimum:2,image:'assets/rowshan-box-truck-service.webp',active:true,sort_order:50},
{id:'box15_1',name:'Large Move — 1 Mover + 15-Foot Box Truck',category:'Standard Package',description:'One mover with a 15-foot box truck for larger loads and local moves.',price:120,unit:'hour',minimum:2,image:'assets/rowshan-box-truck-service.webp',active:true,sort_order:60},
{id:'box15_2',name:'Large Move — 2 Movers + 15-Foot Box Truck',category:'Standard Package',description:'Two movers with a 15-foot box truck for larger residential or commercial moves.',price:170,unit:'hour',minimum:2,image:'assets/rowshan-box-truck-service.webp',active:true,sort_order:70},
{id:'box20_2',name:'Larger Move — 2 Movers + 20–26-Foot Box Truck',category:'Standard Package',description:'Two movers with a larger 20–26-foot box truck for high-volume moving jobs.',price:200,unit:'hour',minimum:2,image:'assets/rowshan-box-truck-service.webp',active:true,sort_order:80},
{id:'helper',name:'Additional Helper — 1 Extra Mover',category:'Add-on',description:'Add one extra mover to any standard package. The same booking minimum applies.',price:60,unit:'hour',minimum:2,image:'assets/rowshan-residential-move.webp',active:true,sort_order:90}
];
const quoteServices=[
'Residential Moving','Apartment & Condominium Moving','Commercial & Office Moving','Small Moves & Local Moving','Heavy Lifting','Loading & Unloading','Packing & Unpacking','Furniture Assembly & Disassembly','In-Home Furniture Moving','Furniture Delivery','Appliance Delivery','Small Item Delivery','Pickup & Delivery','Heavy-Item Moving','Piano & Safe Moving','U-Box Loading & Unloading','Pickup-Truck Moving Services','10-Foot, 15-Foot & Larger Box-Truck Moving Services','Junk Removal','Landfill Delivery','Storage Moving','Labor-Only Moving','Same-Day Moving & Delivery','Appliance Moving','Long-Distance Moving'
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
window.RMC={defaults,quoteServices,money,escapeHtml,getServices,getReviews,getSettings,totals,renderReviews,renderDynamicServices,renderDynamicRates};
document.addEventListener('DOMContentLoaded',async()=>{await getSettings();await Promise.all([renderReviews(),renderDynamicServices(),renderDynamicRates()]);});
})();
