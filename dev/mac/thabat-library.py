#!/usr/bin/env python3
# Thabat video library server for macOS - created by jake750_
# Serves the folders you chose to your own devices (the phone on the same Wi-Fi, or anywhere through
# Tailscale), like Thabat-Library.ps1 on Windows. Every request needs the secret token Thabat shows you;
# files outside the chosen folders are never served. Port 47815.
# Data: ~/Library/Application Support/Thabat (library.json, helper.key, thumbs/). Stop: create library.stop there.
import base64, json, os, re, secrets, socket, subprocess, sys, threading, time, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get('THABAT_LIB_PORT') or 47815)   # another port and folder only for tests
HERE = os.environ.get('THABAT_LIB_HERE') or os.path.dirname(os.path.abspath(__file__))
DIR = os.environ.get('THABAT_LIB_DIR') or os.path.expanduser('~/Library/Application Support/Thabat')
CFG = os.path.join(DIR, 'library.json')
KEYF = os.path.join(DIR, 'helper.key')
THUMBS = os.path.join(DIR, 'thumbs')
STOP = os.path.join(DIR, 'library.stop')
VID = {'mp4', 'm4v', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'mpg', 'mpeg', 'ts', 'm2ts', 'mts', '3gp', 'ogv', 'vob', 'f4v', 'asf', 'divx', 'rmvb'}
AUD = {'mp3', 'm4a', 'aac', 'ogg', 'opus', 'wav'}
TYPES = {'mp4': 'video/mp4', 'm4v': 'video/mp4', 'mov': 'video/mp4', 'webm': 'video/webm', 'mkv': 'video/webm', 'ogv': 'video/ogg', 'mp3': 'audio/mpeg',
         'm4a': 'audio/mp4', 'aac': 'audio/aac', 'ogg': 'audio/ogg', 'opus': 'audio/ogg', 'wav': 'audio/wav', 'flac': 'audio/flac', 'pdf': 'application/pdf',
         'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'gif': 'image/gif', 'txt': 'text/plain; charset=utf-8'}
os.makedirs(THUMBS, exist_ok=True)


def load_cfg():
    try:
        with open(CFG, encoding='utf-8') as f:
            c = json.load(f)
    except Exception:
        c = {}
    if not c.get('token'):
        c['token'] = secrets.token_urlsafe(18).replace('-', 'A').replace('_', 'B')
    c.setdefault('roots', [])
    return c


def save_cfg(c):
    tmp = CFG + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(c, f, ensure_ascii=False)
    os.replace(tmp, CFG)


def the_key():
    """The key that only Thabat on this Mac knows: written beside Thabat.html as thabat-key.js (the page sends it to /cfg, /roots, /open)."""
    try:
        k = open(KEYF).read().strip()
    except Exception:
        k = ''
    if not k:
        k = secrets.token_hex(16)
        with open(KEYF, 'w') as f:
            f.write(k)
        os.chmod(KEYF, 0o600)
    try:
        with open(os.path.join(HERE, 'thabat-key.js'), 'w') as f:
            f.write('window.THABAT_KEY=%s;' % json.dumps(k))
    except Exception:
        pass
    return k


def id_of(ri, rel):
    return base64.urlsafe_b64encode(('%d|%s' % (ri, rel)).encode('utf-8')).decode('ascii').rstrip('=')


def resolve(cfg, i):
    try:
        x = base64.urlsafe_b64decode(i + '=' * (-len(i) % 4)).decode('utf-8')
        ri, rel = x.split('|', 1)
        root = os.path.realpath(cfg['roots'][int(ri)])
        full = os.path.realpath(os.path.join(root, rel))
        if full == root or full.startswith(root + os.sep):
            return full
    except Exception:
        pass
    return None


def my_ips():
    ips = set()
    try:
        out = subprocess.run(['ifconfig'], capture_output=True, text=True, timeout=3).stdout
        ips.update(re.findall(r'inet (\d+\.\d+\.\d+\.\d+)', out))
    except Exception:
        pass
    return sorted(ip for ip in ips if not ip.startswith('127.') and not ip.startswith('169.254.'))


def walk(ri, root, d, depth, count):
    kids = []
    try:
        names = sorted(os.listdir(d))
    except Exception:
        return kids
    for n in names:
        if n.startswith('.') or count[0] > 6000:
            continue
        p = os.path.join(d, n)
        rel = os.path.relpath(p, root).replace(os.sep, '/')
        if os.path.isdir(p):
            if depth < 6:
                kids.append({'n': n, 'id': id_of(ri, rel), 'k': 'd', 'c': walk(ri, root, p, depth + 1, count)})
        elif os.path.isfile(p):
            count[0] += 1
            e = n.rsplit('.', 1)[-1].lower() if '.' in n else ''
            st = os.stat(p)
            iid = id_of(ri, rel)
            kids.append({'n': n, 'id': iid, 'k': 'v' if e in VID else 'a' if e in AUD else 'f', 's': st.st_size, 'm': int(st.st_mtime * 1000),
                         'th': os.path.exists(os.path.join(THUMBS, iid + '.jpg'))})
    return kids


# 3.124: video conversion (needs ffmpeg, e.g. from Homebrew) and uploads from the phone, as on Windows
CONV = os.path.join(DIR, 'conv')
os.makedirs(CONV, exist_ok=True)
CVJ = {}   # id -> {'s','p','proc'}
OKEXT = VID | AUD | {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'}


def ffbin(name):
    import shutil
    return shutil.which(name, path=os.environ.get('PATH', '') + os.pathsep + '/opt/homebrew/bin' + os.pathsep + '/usr/local/bin')


def cv_state(sid):
    if os.path.exists(os.path.join(CONV, sid + '.mp4')):
        return {'s': 'ok', 'p': 100}
    j = CVJ.get(sid)
    if j:
        return {'s': j['s'], 'p': j['p']}
    return {'s': 'none', 'p': 0}


def cv_run(sid, src, lite):
    ff, fp = ffbin('ffmpeg'), ffbin('ffprobe')
    part, out = os.path.join(CONV, sid + '.part.mp4'), os.path.join(CONV, sid + '.mp4')
    dur, vc, ac = 0.0, '', ''
    try:
        info = json.loads(subprocess.run([fp, '-v', 'error', '-show_entries', 'stream=codec_type,codec_name:format=duration', '-of', 'json', src], capture_output=True, text=True, timeout=60).stdout or '{}')
        dur = float((info.get('format') or {}).get('duration') or 0)
        for st in info.get('streams') or []:
            if st.get('codec_type') == 'video' and not vc:
                vc = st.get('codec_name') or ''
            if st.get('codec_type') == 'audio' and not ac:
                ac = st.get('codec_name') or ''
    except Exception:
        pass
    a = [ff, '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-map', '0:v:0?', '-map', '0:a:0?', '-sn', '-dn']
    if lite:
        a += ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-vf', "scale=-2:'min(720,trunc(ih/2)*2)'", '-c:a', 'aac', '-b:a', '96k', '-ac', '2']
    else:
        a += ['-c:v', 'copy'] if vc == 'h264' else ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2']
        a += ['-c:a', 'copy'] if ac in ('aac', 'mp3') else ['-c:a', 'aac', '-b:a', '160k', '-ac', '2']
    a += ['-movflags', '+faststart', '-progress', 'pipe:1', '-nostats', part]
    j = CVJ[sid]
    try:
        p = subprocess.Popen(a, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
        j['proc'] = p
        for line in p.stdout:
            m = re.match(r'out_time_(?:us|ms)=(\d+)', line.strip())
            if m and dur > 0:
                j['p'] = min(99, round(int(m.group(1)) / 1e6 / dur * 100))
        p.wait()
        if p.returncode == 0 and os.path.exists(part):
            os.replace(part, out)
            CVJ.pop(sid, None)
            return
    except Exception:
        pass
    try:
        os.remove(part)
    except Exception:
        pass
    if j.get('cancel'):
        CVJ.pop(sid, None)
    else:
        j['s'], j['p'] = 'err', 0


class H(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *a):
        pass

    def head(self, status, ctype, length, extra=None):
        self.send_response(status)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(length))
        for k, v in (('Access-Control-Allow-Origin', '*'), ('Access-Control-Allow-Private-Network', 'true'), ('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS'),
                     ('Access-Control-Allow-Headers', '*'), ('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges'), ('Connection', 'close')):
            self.send_header(k, v)
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.close_connection = True

    def send(self, status, ctype, body=b'', extra=None):
        self.head(status, ctype, len(body), dict({'Cache-Control': 'no-store'}, **(extra or {})))
        if self.command != 'HEAD' and body:
            self.wfile.write(body)

    def js(self, o):
        self.send(200, 'application/json; charset=utf-8', json.dumps(o, ensure_ascii=False).encode('utf-8'))

    def fail(self, status, e):
        self.send(status, 'application/json', json.dumps({'error': e}).encode())

    def do_OPTIONS(self):
        self.send(204, 'text/plain')

    def do_HEAD(self):
        self.route()

    def do_GET(self):
        self.route()

    def do_POST(self):
        self.route()

    def route(self):
        try:
            self._route()
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception:
            try:
                self.fail(500, 'server')
            except Exception:
                pass

    def _route(self):
        u = urllib.parse.urlsplit(self.path)
        r = u.path
        q = {k: v[0] for k, v in urllib.parse.parse_qs(u.query, keep_blank_values=True).items()}
        # refuse web pages (Thabat runs from a file or the Android app, never from a website)
        if re.match(r'^https?://', self.headers.get('Origin', '') or ''):
            return self.fail(403, 'origin')
        local = self.client_address[0] in ('127.0.0.1', '::1', '::ffff:127.0.0.1')
        key_ok = q.get('k') == KEY
        cfg = load_cfg()
        if r == '/ping':
            return self.js({'ok': True, 'v': 1, 'name': NAME, 'auth': q.get('t') == cfg['token'], 'mac': 1})
        if r in ('/cfg', '/roots', '/open'):
            if not local:
                return self.fail(403, 'local')
            if not key_ok:
                return self.fail(401, 'key')
            if r == '/cfg':
                return self.js({'ok': True, 'token': cfg['token'], 'port': PORT, 'roots': cfg['roots'], 'ips': my_ips(), 'name': NAME, 'mac': 1})
            if r == '/roots':
                d = q.get('d', '')
                lst = json.loads(base64.urlsafe_b64decode(d + '=' * (-len(d) % 4)).decode('utf-8'))
                lst = [os.path.expanduser(str(x)) for x in lst if x and os.path.isdir(os.path.expanduser(str(x)))]
                cfg['roots'] = lst
                save_cfg(cfg)
                return self.js({'ok': True, 'roots': lst})
            full = resolve(cfg, q.get('id', ''))
            if not full:
                return self.fail(404, 'path')
            subprocess.Popen(['open', '-R', full] if q.get('folder') == '1' and not os.path.isdir(full) else ['open', full])
            return self.js({'ok': True})
        if q.get('t') != cfg['token']:
            return self.fail(403, 'token')
        if r == '/list':
            out, count = [], [0]
            for i, root in enumerate(cfg['roots']):
                root = os.path.realpath(root)
                if os.path.isdir(root):
                    out.append({'n': os.path.basename(root) or root, 'id': id_of(i, ''), 'k': 'd', 'c': walk(i, root, root, 0, count)})
            return self.js({'ok': True, 'name': NAME, 'roots': out})
        if r == '/thumb':
            tf = os.path.join(THUMBS, re.sub(r'[^A-Za-z0-9_\-]', '', q.get('id', '')) + '.jpg')
            if self.command == 'POST':
                n = int(self.headers.get('Content-Length') or 0)
                if n <= 0 or n > 1500000:
                    return self.fail(400, 'size')
                data = self.rfile.read(n)
                with open(tf, 'wb') as f:
                    f.write(data)
                return self.js({'ok': True})
            if os.path.exists(tf):
                return self.send(200, 'image/jpeg', open(tf, 'rb').read(), {'Cache-Control': 'max-age=86400'})
            return self.fail(404, 'none')
        if r.startswith('/cv/'):
            sid0 = re.sub(r'[^A-Za-z0-9_\-]', '', q.get('id', ''))
            if not sid0:
                return self.fail(400, 'id')
            lite = q.get('lite') == '1'
            sid = sid0 + '-lite' if lite else sid0
            ff = bool(ffbin('ffmpeg') and ffbin('ffprobe'))
            st = cv_state(sid)
            if r == '/cv/state':
                return self.js({'ok': True, 'ff': ff, 'st': st})
            if r == '/cv/start':
                if st['s'] not in ('ok', 'run'):
                    if not ff:
                        return self.fail(428, 'ffmpeg')
                    full = resolve(cfg, sid0)
                    if not full or not os.path.isfile(full):
                        return self.fail(404, 'path')
                    CVJ[sid] = {'s': 'run', 'p': 0}
                    threading.Thread(target=cv_run, args=(sid, full, lite), daemon=True).start()
                    st = {'s': 'run', 'p': 0}
                return self.js({'ok': True, 'ff': ff, 'st': st})
            if r == '/cv/cancel':
                j = CVJ.get(sid)
                if j and j.get('proc'):
                    j['cancel'] = 1
                    try:
                        j['proc'].kill()
                    except Exception:
                        pass
                return self.js({'ok': True})
            return self.fail(404, 'route')
        if r == '/put':
            if self.command != 'POST':
                return self.fail(405, 'method')
            dq = q.get('dir', '')
            m = re.match(r'^r(\d+)$', dq)
            d = os.path.realpath(cfg['roots'][int(m.group(1))]) if m and int(m.group(1)) < len(cfg['roots']) else resolve(cfg, dq)
            if not d or not os.path.isdir(d):
                return self.fail(404, 'dir')
            nm = re.sub(r'[\x00-\x1f<>:"/\\|?*]', '_', os.path.basename(q.get('n', '').replace('\\', '/'))).strip().lstrip('.').rstrip('. ')
            base, ext = os.path.splitext(nm)
            if len(nm) > 180:
                nm = base[:180 - len(ext)] + ext
                base = os.path.splitext(nm)[0]
            if not nm or ext.lstrip('.').lower() not in OKEXT:
                return self.fail(415, 'type')
            n = int(self.headers.get('Content-Length') or 0)
            if n <= 0 or n > 2147483648:
                return self.fail(413, 'size')
            dst, k = os.path.join(d, nm), 2
            while os.path.exists(dst) and k < 1000:
                dst = os.path.join(d, '%s (%d)%s' % (base, k, ext))
                k += 1
            part = os.path.join(d, '.thabat-upload-%s.part' % secrets.token_hex(8))
            got = 0
            with open(part, 'xb') as fo:
                while got < n:
                    b = self.rfile.read(min(262144, n - got))
                    if not b:
                        break
                    fo.write(b)
                    got += len(b)
            if got != n:
                os.remove(part)
                return self.fail(400, 'short')
            if os.path.exists(dst):
                os.remove(part)
                return self.fail(409, 'exists')
            os.replace(part, dst)
            iid = ''
            for i, root in enumerate(cfg['roots']):
                rt = os.path.realpath(root)
                if dst.startswith(rt + os.sep):
                    iid = id_of(i, os.path.relpath(dst, rt).replace(os.sep, '/'))
                    break
            return self.js({'ok': True, 'n': os.path.basename(dst), 'id': iid, 'size': got})
        if r == '/f':
            full = os.path.join(CONV, re.sub(r'[^A-Za-z0-9_\-]', '', q.get('id', '')) + '.mp4') if q.get('cv') == '1' else resolve(cfg, q.get('id', ''))
            if not full or not os.path.isfile(full):
                return self.fail(404, 'path')
            size = os.path.getsize(full)
            e = full.rsplit('.', 1)[-1].lower() if '.' in os.path.basename(full) else ''
            start, end, status, extra = 0, size - 1, 200, {'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=600'}
            m = re.match(r'bytes=(\d*)-(\d*)', self.headers.get('Range', '') or '')
            if m:
                if m.group(1):
                    start = int(m.group(1))
                    if m.group(2):
                        end = int(m.group(2))
                elif m.group(2):
                    start = max(0, size - int(m.group(2)))
                end = min(end, size - 1)
                if start > end:
                    return self.send(416, 'text/plain', b'', {'Content-Range': 'bytes */%d' % size})
                status = 206
                extra['Content-Range'] = 'bytes %d-%d/%d' % (start, end, size)
            if q.get('dl') == '1':
                extra['Content-Disposition'] = "attachment; filename*=UTF-8''" + urllib.parse.quote(os.path.basename(full))
            self.head(status, TYPES.get(e, 'application/octet-stream'), end - start + 1, extra)
            if self.command != 'HEAD':
                with open(full, 'rb') as f:
                    f.seek(start)
                    left = end - start + 1
                    while left > 0:
                        b = f.read(min(262144, left))
                        if not b:
                            break
                        self.wfile.write(b)
                        left -= len(b)
            return
        # transcription, OCR, recordings and the Taysir copies are Windows-only for now
        return self.fail(404, 'route')


def stop_watch(srv):
    while True:
        time.sleep(2)
        if os.path.exists(STOP):
            try:
                os.remove(STOP)
            except Exception:
                pass
            srv.shutdown()
            return


if __name__ == '__main__':
    try:
        os.remove(STOP)
    except Exception:
        pass
    save_cfg(load_cfg())
    KEY = the_key()
    try:
        NAME = subprocess.run(['scutil', '--get', 'ComputerName'], capture_output=True, text=True, timeout=3).stdout.strip() or socket.gethostname()
    except Exception:
        NAME = socket.gethostname()
    try:
        srv = ThreadingHTTPServer(('0.0.0.0', PORT), H)
    except OSError:
        sys.exit(0)   # already running
    srv.daemon_threads = True
    threading.Thread(target=stop_watch, args=(srv,), daemon=True).start()
    srv.serve_forever()
