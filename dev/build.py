# Build Thabat/Thabat.html from dev/src.html (fills in the large inline assets kept out of src.html)
import json,os
D=os.path.dirname(os.path.abspath(__file__))
s=open(D+'/src.html',encoding='utf-8',newline='').read()
for k,v in json.load(open(D+'/placeholders.json',encoding='utf-8')).items():
    assert s.count(k)==1,k; s=s.replace(k,v)
open(os.path.join(D,'..','Thabat','Thabat.html'),'w',encoding='utf-8',newline='').write(s)
print('built',len(s))
