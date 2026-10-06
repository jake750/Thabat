/* v3.2.3 Android: size the app to the real visible area so the bottom bar never hides under the phone's buttons */
function andFit(){if(!document.documentElement.classList.contains('android'))return;const h=window.innerHeight;if(h>200)document.documentElement.style.setProperty('--apph',h+'px')}
window.addEventListener('resize',andFit);window.addEventListener('orientationchange',()=>setTimeout(andFit,300));setTimeout(andFit,0);setTimeout(andFit,1200);
