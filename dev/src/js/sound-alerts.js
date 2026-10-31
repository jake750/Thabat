/* ============ sound & alerts ============ */
let AC;
function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
document.addEventListener('pointerdown',()=>{try{ac()}catch(e){}},{once:true});
function chime(times=3){if(!S.settings.sound)return;try{const c=ac();for(let r=0;r<times;r++){[[659.25,0],[880,0.18],[1318.5,0.36]].forEach(([f,o])=>{const x=c.currentTime+r*1.3+o,osc=c.createOscillator(),g=c.createGain();osc.type='sine';osc.frequency.value=f;g.gain.setValueAtTime(0,x);g.gain.linearRampToValueAtTime(0.22,x+0.02);g.gain.exponentialRampToValueAtTime(0.0001,x+1.1);osc.connect(g).connect(c.destination);osc.start(x);osc.stop(x+1.2)})}}catch(e){}}
function chimeSoft(f=988){if(!S.settings.sound)return;try{const c=ac(),o=c.createOscillator(),g=c.createGain(),x=c.currentTime;o.frequency.value=f;g.gain.setValueAtTime(0.12,x);g.gain.exponentialRampToValueAtTime(0.0001,x+0.35);o.connect(g).connect(c.destination);o.start(x);o.stop(x+0.4)}catch(e){}}
function toast(msg){const el=document.createElement('div');el.className='toast';el.textContent=msg;$('#toasts').append(el);ux8Tm(el,3000)}
let titleFlash;
function alertUser(title,body,icon){
  $('#mIc').innerHTML=icon||ICON_MOON;$('#mT').textContent=title;$('#mP').textContent=body;$('#modal').classList.add('on');chime();
  try{if('Notification'in window&&Notification.permission==='granted')new Notification(title,{body,requireInteraction:true,silent:true})}catch(e){}
  clearInterval(titleFlash);let f=0;titleFlash=setInterval(()=>{document.title=(f++%2)?t('app'):'🔔 '+title;if(!$('#modal').classList.contains('on')){clearInterval(titleFlash);document.title=t('app')}},1000);
}
$('#mOk').onclick=()=>$('#modal').classList.remove('on');

