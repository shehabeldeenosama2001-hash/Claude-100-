import numpy as np, soundfile as sf, sys
SR=48000
def env(n,a,d): 
    t=np.arange(n)/SR; return np.exp(-t/d)*np.minimum(1,t/max(a,1e-4))
def kick(): 
    n=int(.45*SR); t=np.arange(n)/SR; f=48+110*np.exp(-t/0.035)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.16)
rng=np.random.default_rng(7)
def hat(d=.04):
    n=int(.12*SR); x=rng.standard_normal(n); x=np.diff(x,prepend=0); return x*env(n,.001,d)*.25
def clap():
    n=int(.25*SR); x=rng.standard_normal(n)
    e=sum(env(n,.001,.012)*np.roll(np.ones(n),int(k*SR*.011)) for k in range(3))*0+env(n,.001,.09)
    return np.convolve(x,[1,-.6],'same')*e*.35
def boom():
    n=int(1.6*SR); t=np.arange(n)/SR; f=35+80*np.exp(-t/.08)
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.55)
    nz=rng.standard_normal(n)*env(n,.001,.25)*.3
    return (s+nz)*.9
def riser(dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.standard_normal(n)
    # crude bandpass sweep via moving average difference
    out=np.zeros(n); k=np.linspace(40,4,n).astype(int)
    c=np.cumsum(x); 
    for i in range(0,n,512):
        kk=k[i]; seg=slice(i,min(n,i+512))
        idx=np.arange(seg.start,seg.stop); out[seg]=(c[idx]-c[np.maximum(idx-kk,0)])/kk
    tone=np.sin(2*np.pi*np.cumsum(np.linspace(110,880,n))/SR)*.25
    return (out*1.2+tone)*(t/dur)**2*.6
def whoosh(dur=.45):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.standard_normal(n)
    sm=np.convolve(x,np.ones(30)/30,'same'); e=np.sin(np.pi*t/dur)**2
    return sm*e*1.2
def bassnote(f,dur):
    n=int(dur*SR); t=np.arange(n)/SR
    s=np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*2*f*t)
    return np.tanh(1.5*s)*env(n,.005,dur*.7)*.35
def pluck(f,dur=.35):
    n=int(dur*SR); t=np.arange(n)/SR
    s=sum(np.sin(2*np.pi*f*h*t)/h for h in (1,2,3,4))
    return s*env(n,.002,.12)*.12
def add(buf,x,t,g=1):
    i=int(t*SR); j=min(len(buf),i+len(x)); buf[i:j]+=x[:j-i]*g
def build(total, drop, cuts, end_hit, style):
    L=int(total*SR); m=np.zeros(L)
    beat=60/120
    # pre-drop tension: ticking + drone + riser
    if drop>0:
        for k in np.arange(0,drop,beat/2): add(m,hat(.015),k,.8)
        n=int(drop*SR); t=np.arange(n)/SR
        add(m,np.sin(2*np.pi*55*t)*.18*np.minimum(1,t/.3),0)
        add(m,riser(drop),0,.7)
        add(m,boom(),drop,1.0)
    roots=[55,55,65.41,49]
    t=drop; bar=0
    while t<total-0.05:
        for b in range(4):
            tb=t+b*beat
            if tb>=total: break
            add(m,kick(),tb,.95 if style=='ad' else .7)
            if b in (1,3): add(m,clap(),tb,.9 if style=='ad' else .6)
            for h in (0,.5): add(m,hat(.03 if h else .02),tb+h*beat,.7)
            add(m,bassnote(roots[bar%4],beat*.9),tb+beat*.5,.9)
            if style=='ugc':
                notes=[440,523.25,659.25,587.33]
                add(m,pluck(notes[(bar*4+b)%4]),tb,1)
        t+=4*beat; bar+=1
    for c in cuts: add(m,whoosh(),max(0,c-.3),.5)
    if end_hit: add(m,boom(),end_hit,.8)
    # fade out tail
    f=int(.4*SR); m[-f:]*=np.linspace(1,0,f)
    m/=np.max(np.abs(m))+1e-9
    return m*.9
if __name__=='__main__':
    out=sys.argv[1]
    sf.write(out+'/music_ad.wav',build(15.0,3.0,[6.0,7.9,9.8,11.0,12.2],12.2,'ad'),SR)
    sf.write(out+'/music_ugc.wav',build(15.0,0.0,[],None,'ugc'),SR)
