import json, sys, re
res=json.load(open(sys.argv[1]))
def norm(s): return re.sub(r'[^\wáéíóúñü ]','',s.lower()).split()
chunks=[]; cur=None
for t,txt in res:
    w=norm(txt)
    if not w: 
        continue
    if cur and (w[:2]==cur['w'][:2] or (len(w)<=len(cur['w']) and w==cur['w'][:len(w)])):
        if len(w)>=len(cur['w']): cur['w']=w; cur['txt']=txt
        cur['end']=t
    else:
        if cur: chunks.append(cur)
        cur=dict(start=t,end=t,w=w,txt=txt)
if cur: chunks.append(cur)
chunks=[c for c in chunks if c['end']-c['start']>=0.3 or len(c['w'])>=2]
tot=sum(len(c['w']) for c in chunks)
for c in chunks: print(f"{c['start']:6.1f}-{c['end']:5.1f} [{len(c['w'])}] {c['txt']}")
dur=res[-1][0]
print(f"\nCHUNKS={len(chunks)} WORDS~{tot} DUR={dur:.1f}s WPS~{tot/dur:.2f} words/chunk~{tot/max(1,len(chunks)):.1f} sec/chunk~{dur/max(1,len(chunks)):.2f}")
