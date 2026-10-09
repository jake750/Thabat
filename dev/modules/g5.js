/* Android: the old automatic +32px bottom lift is not needed where the native insets are measured */
function andLiftMigrate(){const N=window.ANDNAV;if(!ANDROID||S.migrAnd0||+S.settings.andOff!==32||!N)return false;if(!((+N.nb||0)>0||(+N.fix||0)>0))return false;S.settings.andOff=0;S.migrAnd0=1;save();andOffApply();return true}
if(ANDROID){let n=0;const iv=setInterval(()=>{if(andLiftMigrate()||++n>20)clearInterval(iv)},1500)}
