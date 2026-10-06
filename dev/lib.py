import json
import os
SP=os.path.dirname(os.path.abspath(__file__))
class P:
    def __init__(s):s.s=open(SP+'/src.html',encoding='utf-8',newline='').read()
    def rep(s,a,b,c=1):
        n=s.s.count(a);assert n==c,(a[:80],n);s.s=s.s.replace(a,b)
    def js(s,f):s.rep("/* ============ image viewer: zoom, pan, swipe, download ============ */",open(SP+'/'+f,encoding='utf-8').read()+"\n/* ============ image viewer: zoom, pan, swipe, download ============ */")
    def css(s,c):s.rep("/* image viewer */",c+"\n/* image viewer */")
    def i18n(s,AR,EN):
        o=lambda d:''.join(f"'{k}':{json.dumps(v,ensure_ascii=False)}," for k,v in d.items())
        miss=set(AR)^set(EN);assert not miss,miss
        s.rep("app:'ثبات',","app:'ثبات',"+o(AR));s.rep("app:'Thabat',","app:'Thabat',"+o(EN))
    def modal(s,html):s.rep('<div class="lockov" id="lockOv"></div>','<div class="lockov" id="lockOv"></div>\n'+html)
    def save(s):open(SP+'/src.html','w',encoding='utf-8',newline='').write(s.s)
