(function(){
const form=document.getElementById('resetForm');
const msg=document.getElementById('resetMsg');
const submit=form.querySelector('button[type="submit"]');

function paramsFrom(part){
  const raw=String(part||'').replace(/^[?#]/,'');
  return new URLSearchParams(raw);
}
const hash=paramsFrom(location.hash);
const query=paramsFrom(location.search);
const errorDescription=hash.get('error_description')||query.get('error_description')||hash.get('error')||query.get('error')||'';
const accessToken=hash.get('access_token')||query.get('access_token')||'';
const type=hash.get('type')||query.get('type')||'';

if(errorDescription){
  msg.textContent='This password reset link could not be used: '+decodeURIComponent(errorDescription.replace(/\+/g,' '))+'. Return to Administration and request one new email.';
  submit.disabled=true;
  return;
}

if(!accessToken){
  msg.textContent='This password reset link is missing, invalid or expired. Return to Administration and request one new reset email.';
  submit.disabled=true;
  return;
}

if(type && type!=='recovery') console.warn('Unexpected auth flow type',type);

form.onsubmit=async(e)=>{
  e.preventDefault();
  const p=document.getElementById('newPassword').value;
  const c=document.getElementById('confirmPassword').value;
  if(p.length<8){msg.textContent='Use at least 8 characters.';return}
  if(p!==c){msg.textContent='Passwords do not match.';return}
  submit.disabled=true;
  msg.textContent='Updating password…';
  try{
    await RMCData.updatePassword(accessToken,p);
    sessionStorage.removeItem('rmc_admin_token');
    msg.textContent='Password updated successfully. You can now return to Administration and sign in with your new password.';
    document.getElementById('newPassword').value='';
    document.getElementById('confirmPassword').value='';
    history.replaceState(null,'',location.pathname);
  }catch(err){
    submit.disabled=false;
    const raw=String(err&&err.message||'');
    if(/expired|invalid|jwt/i.test(raw)){
      msg.textContent='This reset session has expired or is no longer valid. Return to Administration and request one new reset email.';
    }else{
      msg.textContent=raw||'Unable to update password. Request a new reset email.';
    }
  }
};
})();