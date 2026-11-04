# Build Thabat/Thabat.html from the parts in dev/src/ (fills in the large inline assets kept out of the source)
import json,os
D=os.path.dirname(os.path.abspath(__file__))
import sys;sys.path.insert(0,D);import srcparts
s=srcparts.join();open(D+'/src.html','w',encoding='utf-8',newline='').write(s)   # dev/src.html is a generated copy
sys.path.insert(0,D+'/i18n');import mkpacks
LG=mkpacks.build()   # 3.171: language files and the LANGS list
assert s.count('__LANGS__')==1;s=s.replace('__LANGS__',json.dumps(LG,ensure_ascii=False,separators=(',',':')))
for k,v in json.load(open(D+'/placeholders.json',encoding='utf-8')).items():
    assert s.count(k)==1,k; s=s.replace(k,v)
open(os.path.join(D,'..','Thabat','Thabat.html'),'w',encoding='utf-8',newline='').write(s)
import shutil
for n in os.listdir(D+'/data'):
    for dst in (os.path.join(D,'..','Thabat',n),os.path.join(D,'..',n)):shutil.copy(os.path.join(D,'data',n),dst)
print('built',len(s))
