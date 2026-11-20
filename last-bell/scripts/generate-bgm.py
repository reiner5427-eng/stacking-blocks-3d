"""Original 8-bar minor-key survival loop; no third-party recording."""
import math, random, wave, array, subprocess
from pathlib import Path
rate=44100;step=60/104/4;duration=step*128; samples=[0.0]*round(rate*duration);rng=random.Random(5427)
def tone(start,length,freq,volume,kind='bass'):
 for j in range(round(length*rate)):
  i=round(start*rate)+j
  if i>=len(samples):break
  t=j/rate;env=min(1,t/.008)*math.exp(-t/(length*.28))
  if kind=='kick':v=math.sin(2*math.pi*(42*t+65*.025*(1-math.exp(-t/.025))))
  elif kind=='noise':v=rng.uniform(-1,1)
  elif kind=='lead':v=math.sin(2*math.pi*freq*t)+.22*math.sin(2*math.pi*freq*2*t)
  else:v=.5*math.sin(2*math.pi*freq*t)+.32*math.sin(2*math.pi*freq*2*t)+.18*math.sin(2*math.pi*freq*4*t)
  samples[i]+=v*env*volume
for s in range(128):
 t=s*step;root=[110,130.8128,103.8262,146.8324][(s//16)%4]
 if s%4==0:tone(t,.38,root,.33);tone(t,.17,0,.55,'kick')
 if s%8==4:tone(t,.13,0,.17,'noise');tone(t,.1,180,.08,'lead')
 if s%2==0:tone(t,.028,0,.055,'noise')
 if s%4==2:tone(t,.25,root*3,.11,'lead')
 if s%16==0:
  tone(t,step*14,root*2,.08,'lead');tone(t,step*14,root*3,.045,'lead')
peak=max(abs(x) for x in samples);data=array.array('h',(round(x/peak*.82*32767) for x in samples))
raw=Path('/tmp/last-bell-bgm.wav')
with wave.open(str(raw),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(data.tobytes())
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-c:a','libmp3lame','-b:a','96k','public/bgm.mp3'],check=True)
print('BGM generated:',round(duration,2),'seconds; peak',max(abs(x) for x in data)/32767)
