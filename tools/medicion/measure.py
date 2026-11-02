import sys, cv2, numpy as np, json
path = sys.argv[1]
cap = cv2.VideoCapture(path); fps = cap.get(5)
prev=None; lumas=[]; sats=[]; pix=[]; motion=[]; zoom=[]; i=0
while True:
    ok,f=cap.read()
    if not ok: break
    small=cv2.resize(f,(180,320),interpolation=cv2.INTER_AREA)
    body=small[90:,:]  # excluir banda de subtitulos (arriba ~28%)
    hsv=cv2.cvtColor(body,cv2.COLOR_BGR2HSV); g=cv2.cvtColor(body,cv2.COLOR_BGR2GRAY)
    if i%15==0:
        lumas.append(np.percentile(g,[5,50,95])/255); sats.append(np.percentile(hsv[:,:,1],[50,90])/255)
        pix.append(body.reshape(-1,3)[::7])
    gs=cv2.cvtColor(small,cv2.COLOR_BGR2GRAY)
    if prev is not None:
        fl=cv2.calcOpticalFlowFarneback(prev,gs,None,0.5,3,15,3,5,1.2,0)
        h,w=gs.shape; ys,xs=np.mgrid[0:h,0:w]
        dx=fl[...,0].mean(); dy=fl[...,1].mean()
        # divergencia radial ~ zoom
        rx=xs-w/2; ry=ys-h/2; r2=rx*rx+ry*ry+1e-6
        div=((fl[...,0]-dx)*rx+(fl[...,1]-dy)*ry)/r2
        motion.append(float(np.hypot(dx,dy))*(720/180)); zoom.append(float(np.median(div)))
    prev=gs; i+=1
P=np.concatenate(pix).astype(np.float32)
crit=(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,30,1.0)
_,lab,cent=cv2.kmeans(P,8,None,crit,3,cv2.KMEANS_PP_CENTERS)
cnt=np.bincount(lab.ravel(),minlength=8); order=np.argsort(-cnt)
pal=[('#%02x%02x%02x'%tuple(int(c) for c in cent[k][::-1]), round(cnt[k]/cnt.sum()*100,1)) for k in order]
m=np.array(motion); z=np.array(zoom)
L=np.array(lumas); Sa=np.array(sats)
moving=(m>0.3)|(np.abs(z)>0.0008)
# rachas estaticas
static=~moving; runs=[]; c=0
for s in static:
    if s: c+=1
    else:
        if c: runs.append(c); c=0
if c: runs.append(c)
res=dict(frames=i,
 luma_p5=round(L[:,0].mean(),3), luma_med=round(L[:,1].mean(),3), luma_p95=round(L[:,2].mean(),3),
 sat_med=round(Sa[:,0].mean(),3), sat_p90=round(Sa[:,1].mean(),3),
 palette=pal,
 pct_frames_moving=round(moving.mean()*100,1),
 pan_px_per_frame_med_at720=round(float(np.median(m)),2), pan_p95=round(float(np.percentile(m,95)),2),
 zoom_in_pct_frames=round(float((z>0.0008).mean()*100),1), zoom_out_pct_frames=round(float((z<-0.0008).mean()*100),1),
 zoom_rate_median_pct_per_frame_when_zooming=round(float(np.median(np.abs(z[np.abs(z)>0.0008]))*100) if (np.abs(z)>0.0008).any() else 0,3),
 longest_static_run_frames=int(max(runs) if runs else 0))
print(json.dumps(res,ensure_ascii=False))
