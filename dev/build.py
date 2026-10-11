# Build Thabat/Thabat.html from the parts in dev/src/ (fills in the large inline assets kept out of the source)
import json,os
D=os.path.dirname(os.path.abspath(__file__))
import sys;sys.path.insert(0,D);import srcparts
s=srcparts.join();open(D+'/src.html','w',encoding='utf-8',newline='').write(s)   # dev/src.html is a generated copy
for k,v in json.load(open(D+'/placeholders.json',encoding='utf-8')).items():
    assert s.count(k)==1,k; s=s.replace(k,v)
open(os.path.join(D,'..','Thabat','Thabat.html'),'w',encoding='utf-8',newline='').write(s)
print('built',len(s))
