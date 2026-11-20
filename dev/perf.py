"""Thabat performance check (3.178): opens the built app in headless Chromium with a slowed CPU and measures
start-up, every page switch and idle cost. Never touches his real helper/library servers (all of 127.0.0.1:478xx is blocked).

  python dev/perf.py                 # phone 411x860, CPU 4x slower, the built Thabat/Thabat.html
  python dev/perf.py --cpu 6 --pc    # PC 1536x832 (1920x1040 at 125 %)
  python dev/perf.py --file dev/src_vprev.html --tier lite --out before.json
Prints a table; --out saves JSON so two runs can be compared with --cmp a.json b.json."""
import argparse, json, pathlib, statistics, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIEWS = ['today', 'quran', 'cal', 'brief', 'boards', 'lib', 'set', 'today']

PROBE = r"""
window.__pf={lt:[],fr:[]};
try{new PerformanceObserver(l=>{for(const e of l.getEntries())__pf.lt.push(e.duration)}).observe({type:'longtask',buffered:true})}catch(e){}
"""

def frames_js(ms):
    return """(async()=>{const out=[];let last=performance.now();const end=last+%d;
    await new Promise(r=>{const f=t=>{out.push(t-last);last=t;if(t<end)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});return out})()""" % ms

def stats(fr):
    fr = [x for x in fr if x > 0]
    if not fr: return {}
    s = sorted(fr)
    return {'frames': len(fr), 'p50': round(statistics.median(s), 1), 'p95': round(s[int(len(s) * .95) - 1], 1),
            'max': round(s[-1], 1), 'janky': sum(1 for x in fr if x > 34)}

def run(a):
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch(args=(['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-unsafe-swiftshader'] if not a.nogpu else []) + (['--disable-gpu-vsync'] if a.novsync else []))
        vp = {'width': 1536, 'height': 832} if a.pc else {'width': 411, 'height': 860}
        ctx = b.new_context(viewport=vp, device_scale_factor=1.25 if a.pc else 2.625, is_mobile=not a.pc, has_touch=not a.pc,
                            locale='ar')
        ctx.route('**/127.0.0.1:478*/**', lambda r: r.abort())
        ctx.route('http://localhost:478*/**', lambda r: r.abort())
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.add_init_script(PROBE + ("localStorage.setItem('thabat.perf',%s);" % json.dumps(a.tier) if a.tier else ''))
        cdp = ctx.new_cdp_session(pg)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': a.cpu})
        cdp.send('Performance.enable')
        url = (ROOT / a.file).resolve().as_uri() + '?perf=1'
        READY = 'typeof S==="object"&&typeof showView==="function"&&document.querySelector(".view.on")'
        if a.data:  # first launch: load a real backup and save it, so the measured launch below starts with real data
            cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
            pg.goto(url, wait_until='load'); pg.wait_for_function(READY, timeout=60000)
            d = pathlib.Path(a.data).read_text(encoding='utf-8')
            pg.evaluate('''d=>{S=deepMerge(structuredClone(DEF),JSON.parse(d));S.welcomed=true;S.setupDone=true;S.tourDone=true;save();try{flushSave()}catch(e){}}''', d)
            pg.wait_for_timeout(2500)
            cdp.send('Emulation.setCPUThrottlingRate', {'rate': a.cpu})
        pg.goto(url, wait_until='load')
        try:
            pg.wait_for_function(READY, timeout=120000)
        except Exception:
            pg.screenshot(path=a.shot or 'perf-fail.png'); print('app did not start; errors:', errs[:5]); raise
        pg.wait_for_timeout(1500)
        res['startup'] = pg.evaluate("""(()=>{const T=window.__TH_T||{};const n=performance.getEntriesByType('navigation')[0];
          return {appRunMs:Math.round((T.b||0)-(T.a||0)),domContentLoaded:Math.round(n.domContentLoadedEventEnd),
          firstView:Math.round(performance.now()),longTasks:__pf.lt.length,longTaskMs:Math.round(__pf.lt.reduce((a,b)=>a+b,0)),
          tier:[...document.documentElement.classList].filter(c=>/^(lite|lg|pmid|pfull)$/.test(c)).join(' ')||'full',
          nodes:document.getElementsByTagName('*').length}})()""")
        pg.evaluate("document.querySelectorAll('.modal.on,.sheet.on,.ov.on').forEach(e=>e.classList.remove('on'))")
        def metrics():
            m = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
            return {k: m.get(k, 0) for k in ('ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'RecalcStyleCount')}
        res['views'] = {}
        for v in VIEWS[1:] + ['today']:
            pg.evaluate('__pf.lt=[]')
            m0 = metrics()
            fr = pg.evaluate("""(async v=>{const t0=performance.now();showView(%s);const sync=performance.now()-t0;
               const fr=await %s;return {sync,fr}})()""" % (json.dumps(v), frames_js(900)))
            m1 = metrics()
            st = stats(fr['fr'])
            st['switchMs'] = round(fr['sync'], 1)
            st['scriptMs'] = round((m1['ScriptDuration'] - m0['ScriptDuration']) * 1000)
            st['layoutMs'] = round((m1['LayoutDuration'] - m0['LayoutDuration']) * 1000)
            st['styleMs'] = round((m1['RecalcStyleDuration'] - m0['RecalcStyleDuration']) * 1000)
            st['longTaskMs'] = round(sum(pg.evaluate('__pf.lt')))
            res['views'][v] = st
        # idle: 4 s on Today doing nothing
        pg.evaluate("showView('today')"); pg.wait_for_timeout(800)
        m0 = metrics()
        fr = pg.evaluate(frames_js(4000))
        m1 = metrics()
        res['idle'] = dict(stats(fr), scriptMs=round((m1['ScriptDuration'] - m0['ScriptDuration']) * 1000),
                           styleMs=round((m1['RecalcStyleDuration'] - m0['RecalcStyleDuration']) * 1000),
                           layoutMs=round((m1['LayoutDuration'] - m0['LayoutDuration']) * 1000),
                           anims=pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length"))
        # scroll the task list / page
        m0 = metrics()
        fr = pg.evaluate("""(async()=>{const m=document.querySelector('main');const p=%s;let i=0;const iv=setInterval(()=>{m.scrollBy(0,40);if(++i>40)clearInterval(iv)},16);return await p})()""" % frames_js(1200))
        m1 = metrics()
        res['scroll'] = dict(stats(fr), scriptMs=round((m1['ScriptDuration'] - m0['ScriptDuration']) * 1000))
        res['errors'] = errs[:5]
        if a.shot: pg.screenshot(path=a.shot)
        b.close()
    return res

def show(r, label=''):
    s = r['startup']
    print(f"== {label} startup: app run {s['appRunMs']} ms, first view at {s['firstView']} ms, long tasks {s['longTasks']} ({s['longTaskMs']} ms), tier '{s['tier']}', {s['nodes']} nodes")
    print(f"{'view':8} {'switch':>7} {'script':>7} {'style':>6} {'layout':>7} {'longT':>6} {'p50':>5} {'p95':>6} {'max':>6} {'jank':>5}")
    for v, x in list(r['views'].items()) + [('idle', r['idle']), ('scroll', r['scroll'])]:
        print(f"{v:8} {x.get('switchMs', ''):>7} {x.get('scriptMs', ''):>7} {x.get('styleMs', ''):>6} {x.get('layoutMs', ''):>7} {x.get('longTaskMs', ''):>6} {x.get('p50', ''):>5} {x.get('p95', ''):>6} {x.get('max', ''):>6} {x.get('janky', ''):>5}")
    print('running animations at idle:', r['idle'].get('anims'), '| errors:', r['errors'] or 'none')

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--file', default='Thabat/Thabat.html')
    ap.add_argument('--cpu', type=float, default=4)
    ap.add_argument('--pc', action='store_true')
    ap.add_argument('--tier', default='', help='auto|full|mid|lite (thabat.perf)')
    ap.add_argument('--out'); ap.add_argument('--shot'); ap.add_argument('--novsync', action='store_true')
    ap.add_argument('--cmp', nargs=2); ap.add_argument('--nogpu', action='store_true')
    ap.add_argument('--data', default=str(ROOT / 'thabat-backup-2026-10-26.json') if (ROOT / 'thabat-backup-2026-10-26.json').exists() else '', help='a backup JSON loaded before measuring (local only)')
    a = ap.parse_args()
    if a.cmp:
        for f in a.cmp: show(json.load(open(f, encoding='utf-8')), f)
        sys.exit()
    r = run(a); show(r, a.file)
    if a.out: json.dump(r, open(a.out, 'w', encoding='utf-8'), indent=1)
