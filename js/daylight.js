/* Continuous 24-hour lighting, independent of the club's nightly event schedule. */
const DAY=86400;
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const frames=[
 // hour, upper sky, horizon, fog, sky light, ground bounce, sunlight, ambient, exposure
 [0,0x081326,0x263349,0x1e3042,0xa2b5d0,0x3c4657,.05,.9,.93],
 [5,0x101c38,0x544764,0x4f536c,0xb3b7d4,0x635b68,.08,1.0,.98],
 [6.5,0x637ba5,0xe6b48c,0xb8a49a,0xffe0bd,0x968773,.8,1.35,1.04],
 [9,0x6594bd,0xd7e4dd,0xb9ccd0,0xe5efff,0x9b9d88,1.7,1.65,1.05],
 [14,0x5d90bc,0xe3e9d5,0xbbd0d4,0xf5f1df,0x93947d,1.8,1.65,1.05],
 [17,0x8c8fae,0xf0c596,0xbfa99a,0xffdbac,0x8d7766,1.0,1.4,1.03],
 [18.5,0x384767,0xd69685,0x9a7d88,0xe4b8b2,0x6c5865,.22,1.1,.99],
 [20,0x12223f,0x4e486b,0x41405e,0xb0badc,0x45445d,.06,.92,.95],
 [24,0x081326,0x263349,0x1e3042,0xa2b5d0,0x3c4657,.05,.9,.93],
];
function mixColor(a,b,t){let c=0;for(const shift of [16,8,0])c|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;return c;}
const hex=n=>'#'+n.toString(16).padStart(6,'0');
export function daylightAt(seconds){
 const s=Number.isFinite(seconds)?((seconds%DAY)+DAY)%DAY:22*3600,hour=s/3600;
 const i=frames.findIndex((f,i)=>i<frames.length-1&&hour>=f[0]&&hour<frames[i+1][0]);
 const a=frames[Math.max(0,i)],b=frames[Math.max(0,i)+1],t=smooth((hour-a[0])/(b[0]-a[0]));
 const colors=[1,2,3,4,5].map(j=>mixColor(a[j],b[j],t));
 const daylight=smooth((hour-5.5)/2)*(1-smooth((hour-17)/2.5));
 const angle=(hour-6)/12*Math.PI;
 return {hour,label:hour<5?'NIGHT':hour<8?'DAWN':hour<17?'DAY':hour<20?'SUNSET':'NIGHT',daylight,
  stops:[[0,hex(colors[0])],[.5,hex(mixColor(colors[0],colors[1],.55))],[.72,hex(colors[1])],[1,hex(colors[2])]],
  clear:colors[2],fogOut:colors[2],fogOutD:.0045+(1-daylight)*.003,
  hemi:colors[3],hemiGround:colors[4],hemiOut:a[7]+(b[7]-a[7])*t,
  sunInt:a[6]+(b[6]-a[6])*t,sunColor:colors[3],exposeOut:a[8]+(b[8]-a[8])*t,
  sunX:Math.cos(angle)*205,sunY:Math.sin(angle)*185,sunZ:-70,
  sunOp:smooth((hour-5.6)/.7)*(1-smooth((hour-18)/.8)),
  moonX:-Math.cos(angle)*190,moonY:-Math.sin(angle)*165,moonZ:80,moonOp:1-daylight,
  lamp:.08+(1-daylight)*1.22,window:.28+(1-daylight)*.72};
}
export function secondsUntilHour(seconds,hour){
 if(!Number.isFinite(seconds)||!Number.isFinite(hour)||hour<0||hour>=24)throw Error('Invalid time.');
 const delta=((hour*3600-seconds)%DAY+DAY)%DAY;
 return delta===0?DAY:delta;
}
