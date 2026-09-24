// Original four-bar Dm9 / G13 / Cmaj9 / A7 turnaround, in eighth notes.
const CHORDS = [[62,65,69,72,76],[59,65,69,76],[60,64,67,71,74],[61,67,70,76]];
const ROOTS = [38,31,36,33];
const BASS = [0,null,7,10,null,12,7,5];
const MELODY = [[81,79,76,77],[76,74,71,69],[79,76,74,71],[76,73,70,69]];
export const midiFrequency = note => 440 * 2 ** ((note-69)/12);
export function grooveStep(step,tone=0,rhythm=0) {
  const s=((step%8)+8)%8,bar=Math.floor(step/8)%4;
  const offset=BASS[(s+rhythm*2)%8];
  return {
    kick:s%2===0,clap:s===2||s===6,hat:s%2===1,
    bass:offset===null?null:midiFrequency(ROOTS[bar]+offset+tone),
    chord:[0,3,6].includes(s)?CHORDS[bar].map(n=>midiFrequency(n+tone)):null,
    melody:s%2===1?midiFrequency(MELODY[bar][Math.floor(s/2)]+tone):null,
    accent:s===0?1:.65,
  };
}
export function swungEighthDuration(step,bpm,swing=.56) {
  return 60/bpm*(step%2===0?swing:1-swing);
}
// Soft fundamental, a short bell overtone and a rounded body: no looping noise.
export function playPiano(ctx,target,t,frequencies,velocity=.07,duration=.7) {
  const voices=[];
  for(const frequency of frequencies)for(const [multiple,level,type,decay] of [[1,1,'sine',duration],[2,.24,'triangle',duration*.55],[3,.11,'sine',.14]]){
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type;oscillator.frequency.value=frequency*multiple;
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,velocity*level),t+.008);
    gain.gain.exponentialRampToValueAtTime(.0001,t+decay);
    oscillator.connect(gain);gain.connect(target);oscillator.start(t);oscillator.stop(t+decay+.02);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};voices.push(oscillator);
  }
  return voices;
}
export function musicMix(zone) {
  if(zone==='club')return [1,0,0];
  if(zone==='records'||zone==='arcade')return [.7,0,.008];
  if(zone==='alley')return [.4,0,.025];
  if(zone==='lounge')return [0,1,.003];
  if(['street','mercer','hawthorne','eastavenue','48th','northloop','southloop','westavenue','riverside'].includes(zone))return [0,.8,.018];
  return [0,.55,zone==='subway'?.008:.004];
}
