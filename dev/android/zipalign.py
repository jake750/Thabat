import zipfile,sys
src,dst=sys.argv[1],sys.argv[2]
zi=zipfile.ZipFile(src);zo=zipfile.ZipFile(dst,'w')
for it in zi.infolist():
    data=zi.read(it.filename)
    ni=zipfile.ZipInfo(it.filename,date_time=it.date_time);ni.compress_type=it.compress_type;ni.external_attr=it.external_attr
    if ni.compress_type==zipfile.ZIP_STORED:
        off=zo.fp.tell();hdr=30+len(ni.filename.encode('utf-8'))
        pad=(4-(off+hdr+4)%4)%4  # 4 bytes for our extra header (id+len)
        ni.extra=b'\x35\xd9'+pad.to_bytes(2,'little')+b'\x00'*pad
    zo.writestr(ni,data,compress_type=ni.compress_type,compresslevel=9 if ni.compress_type else None)
zo.close()
z=zipfile.ZipFile(dst)
for i in z.infolist():
    if i.compress_type==0:
        z.fp.seek(i.header_offset);h=z.fp.read(30);n=int.from_bytes(h[26:28],'little');e=int.from_bytes(h[28:30],'little')
        assert (i.header_offset+30+n+e)%4==0,i.filename
print('aligned ok')
