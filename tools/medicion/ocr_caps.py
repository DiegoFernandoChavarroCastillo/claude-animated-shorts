import sys, cv2, subprocess, json, re, os
from multiprocessing import Pool
import pytesseract
path, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(path); fps = cap.get(5); n = int(cap.get(7))
step = 5  # 6 muestras/s
frames=[]
i=0
while True:
    ok, f = cap.read()
    if not ok: break
    if i % step == 0:
        crop = f[165:345, 20:700]
        g = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        # texto: baja saturacion y luma alta (gris claro o blanco)
        mask = ((hsv[:,:,1] < 70) & (g > 110)).astype('uint8')*255
        mask = cv2.resize(mask, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        frames.append((i/fps, 255-mask))
    i+=1
def ocr(item):
    t, img = item
    txt = pytesseract.image_to_string(img, lang='spa', config='--psm 6')
    txt = re.sub(r'\s+', ' ', txt).strip()
    txt = re.sub(r'[^\wáéíóúñü¿?¡!,.:%0-9 ]', '', txt, flags=re.I).strip()
    return (round(t,2), txt)
with Pool(os.cpu_count()) as p:
    res = p.map(ocr, frames)
json.dump(res, open(out,'w'), ensure_ascii=False, indent=0)
print(len(res), 'samples')
