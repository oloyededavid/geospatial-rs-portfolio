import math,sys,json
def srgb2lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def lin2srgb(c): c=max(0,min(1,c)); return 12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055
def hexrgb(h): h=h.lstrip('#'); return [int(h[i:i+2],16) for i in (0,2,4)]
# Machado et al. 2009, severity 1.0
M={'protan':[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
   'deutan':[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
   'tritan':[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]}
def oklab(lin):
    r,g,b=lin
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b; m=0.2119034982*r+0.6806995451*g+0.1073969566*b; s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) if x>0 else 0 for x in (l,m,s)]
    return [0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.8086757660*s]
def sim(rgb,kind):
    lin=[srgb2lin(c) for c in rgb]
    if kind=='normal': return lin
    return [max(0,min(1,sum(M[kind][i][j]*lin[j] for j in range(3)))) for i in range(3)]
def de(a,b): return 100*math.dist(oklab(a),oklab(b))
def check(name,cols,pairs='adjacent'):
    rgbs=[hexrgb(c) if isinstance(c,str) else c[:3] for c in cols]
    idx=[(i,i+1) for i in range(len(rgbs)-1)] if pairs=='adjacent' else [(i,j) for i in range(len(rgbs)) for j in range(i+1,len(rgbs))]
    out={}
    for k in ['normal','protan','deutan','tritan']:
        worst=min((de(sim(rgbs[i],k),sim(rgbs[j],k)),i,j) for i,j in idx); out[k]=(round(worst[0],1),worst[1],worst[2])
    print(f"{name:34s} "+'  '.join(f"{k}:{v[0]:5.1f}({v[1]}-{v[2]})" for k,v in out.items()))
GVF=['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac']
GVC=['#1b7837','#a6d96a','#e6c84b','#c0392b','#2c7fb8','#7b3294','#e08214','#878787','#35978f','#f781bf']
check('GeoValidate folds k=5 (all pairs)',GVF[:5],'all')
check('GeoValidate classes 5 (all pairs)',GVC[:5],'all')
check('GeoValidate errors wrong/right',['#c0392b','#c4c3bd'],'all')
FS=[[21,84,192],[111,163,240],[11,42,74],[143,185,179],[201,198,189]]
check('FloodScope classes (all pairs)',FS,'all')
DIV=['#8c4a0e','#c98a4b','#e9d3b4','#e4e4df','#bcd9a8','#6fa857','#2c6b1e']
SEQ=['#f2f0e6','#d7e3b9','#a9cb88','#73ad5c','#3f8a37','#1d5e23']
check('AgroSignal diverging (adjacent)',DIV); check('AgroSignal diverging ends',[DIV[0],DIV[-1]],'all')
check('AgroSignal sequential (adjacent)',SEQ)
check('City Twins pair dots',['#141412','#d9485f'],'all')
