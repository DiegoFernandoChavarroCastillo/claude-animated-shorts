import sys, subprocess, numpy as np, json
p=sys.argv[1]
raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
x=np.frombuffer(raw,np.int16).astype(np.float32)/32768
w=800  # 50 ms
n=len(x)//w; fr=x[:n*w].reshape(n,w)
rms=20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
# banda de voz vs graves (musica/sfx) por ventanas
spec=np.abs(np.fft.rfft(fr*np.hanning(w),axis=1)); f=np.fft.rfftfreq(w,1/16000)
low=spec[:,(f<150)].sum(1); voice=spec[:,(f>300)&(f<3400)].sum(1)
quiet=rms< (np.percentile(rms,50)-12)
gaps=[]; c=0
for q in quiet:
    if q: c+=1
    else:
        if c: gaps.append(c*0.05); c=0
print(json.dumps(dict(dur=round(n*0.05,1), rms_p10=round(float(np.percentile(rms,10)),1), rms_p50=round(float(np.percentile(rms,50)),1), rms_p90=round(float(np.percentile(rms,90)),1),
 floor_minus_median_db=round(float(np.percentile(rms,5)-np.percentile(rms,50)),1),
 pauses_over_250ms=sum(1 for g in gaps if g>=0.25), longest_pause_s=round(max(gaps) if gaps else 0,2),
 pct_time_quiet=round(float(quiet.mean()*100),1),
 low_to_voice_ratio_med=round(float(np.median(low/(voice+1e-9))),3))))
