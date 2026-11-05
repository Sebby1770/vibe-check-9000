import { grooveStep, swungEighthDuration, playPiano, musicMix } from './music.js';
import { engineNote } from './vehicles/traffic-sound.js';
/* Original jazz-house in the club, a swung electric-piano quartet outside. */

const A_MIN_BASS = [55.0, 55.0, 65.41, 52.0, 43.65, 43.65, 49.0, 41.2];
function makeNoiseBuffer(ctx, seconds = 1) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    return buf;
}

function makeRainBuffer(ctx) {
    const n = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let y = 0;
    for (let i = 0; i < n; i++) {
        y = y * 0.97 + (Math.random() * 2 - 1) * 0.03;
        data[i] = y * 0.8 + (Math.random() * 2 - 1) * 0.12;
    }
    return buf;
}

export function createAudio() {
    let ctx = null;
    let master = null;
    let compressor = null;
    let delay = null;
    let delayGain = null;
    let dry = null;
    let panner = null;
    let analyser = null;
    let bassFilter = null;
    let bassOsc = null;
    let bassGain = null;
    let widthDelay = null;
    let muteGain = null;
    let noiseBuf = null;
    let rainBuf = null;
    let timer = 0;
    let nextNote = 0;
    let step = 0;
    let nextJazzNote = 0, jazzStep = 0;
    let started = false;
    let muted = false;
    let reduced = false;
    let deckGain = null;
    let deckEl = null;
    let deckNode = null;
    const playlist = [];
    let trackIndex = -1;
    let usingDeck = false;
    let clubGain = null;
    let jazzGain = null;
    let rainGain = null;
    let rainSrc = null;
    let rumbleGain = null;
    let zone = "club";
    let nightPhase = "doors";
    let houseName = "HOUSE SYSTEM";
    let shopGain = null, shopFilter = null, previewGain = null;
    let previewNodes = [];
    let previewing = false;
    let musicBus = null, amDry = null, amWet = null;
    // The car radio: null when you're not in a car, else the station you're tuned to.
    let radio = null;
    const STATIONS = {
        swing: { name: "WSWG 1240 · SWING", long: "WSWG 1240 · SIDEWALK SWING, ALL NIGHT", mix: [0, 1] },
        club: { name: "WVTU 880 · VELVET LIVE", long: "WVTU 880 · LIVE FROM VELVET TUESDAY", mix: [0.9, 0] },
        off: { name: "RADIO OFF", long: "RADIO OFF · JUST THE STREET", mix: [0, 0] },
    };

    const state = {
        bpm: 120,
        kickFlag: false,
        bassCutoff: 280,
        stereoWidth: 0.35,
        intensity: 1,
        jazzBpm: 96,
        tone: 0,
        rhythm: 0,
    };

    const freqData = new Uint8Array(128);
    let lastBass = 0;

    function graph() {
        if (ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        noiseBuf = makeNoiseBuffer(ctx, 1.2);
        rainBuf = makeRainBuffer(ctx);

        master = ctx.createGain();
        master.gain.value = 0.7;
        clubGain = ctx.createGain();
        clubGain.gain.value = 1;
        jazzGain = ctx.createGain();
        jazzGain.gain.value = 0;
        rainGain = ctx.createGain();
        rainGain.gain.value = 0;
        rumbleGain = ctx.createGain();
        rumbleGain.gain.value = 0;
        const rumbleOsc = ctx.createOscillator();
        rumbleOsc.type = "sawtooth";
        rumbleOsc.frequency.value = 38;
        const rumbleLp = ctx.createBiquadFilter();
        rumbleLp.type = "lowpass";
        rumbleLp.frequency.value = 85;
        rumbleOsc.connect(rumbleLp);
        rumbleLp.connect(rumbleGain);
        rumbleOsc.start();

        muteGain = ctx.createGain();
        muteGain.gain.value = muted ? 0 : 1;

        compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 8;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.12;

        dry = ctx.createGain();
        dry.gain.value = 0.88;
        delay = ctx.createDelay(1);
        delay.delayTime.value = 0.234;
        delayGain = ctx.createGain();
        delayGain.gain.value = 0.16;
        const delayFb = ctx.createGain();
        delayFb.gain.value = 0.22;
        widthDelay = ctx.createDelay(0.05);
        widthDelay.delayTime.value = 0.006;

        panner = ctx.createPanner();
        panner.panningModel = "HRTF";
        panner.distanceModel = "inverse";
        panner.refDistance = 10;
        panner.maxDistance = 80;
        panner.rolloffFactor = 0;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 360;
        if (panner.positionX) {
            panner.positionX.value = 0;
            panner.positionY.value = 2.2;
            panner.positionZ.value = -12;
        }

        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.72;

        bassFilter = ctx.createBiquadFilter();
        bassFilter.type = "lowpass";
        bassFilter.frequency.value = state.bassCutoff;
        bassOsc = ctx.createOscillator();
        bassOsc.type = "triangle";
        bassOsc.frequency.value = 55;
        bassGain = ctx.createGain();
        bassGain.gain.value = 0;
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(clubGain);
        bassOsc.start();

        // The two scores share a bus that the car radio can switch through an AM band (thin, boxy, warm).
        musicBus = ctx.createGain();
        amDry = ctx.createGain();
        amWet = ctx.createGain();
        amWet.gain.value = 0;
        const amHp = ctx.createBiquadFilter(), amLp = ctx.createBiquadFilter(), amPeak = ctx.createBiquadFilter();
        amHp.type = "highpass"; amHp.frequency.value = 380; amHp.Q.value = 0.8;
        amLp.type = "lowpass"; amLp.frequency.value = 2900; amLp.Q.value = 0.9;
        amPeak.type = "peaking"; amPeak.frequency.value = 1300; amPeak.gain.value = 5; amPeak.Q.value = 0.9;
        clubGain.connect(musicBus);
        jazzGain.connect(musicBus);
        musicBus.connect(amDry);
        amDry.connect(master);
        musicBus.connect(amHp);
        amHp.connect(amLp);
        amLp.connect(amPeak);
        amPeak.connect(amWet);
        amWet.connect(master);
        rainGain.connect(master);
        rumbleGain.connect(master);

        master.connect(compressor);
        compressor.connect(dry);
        compressor.connect(delay);
        delay.connect(delayGain);
        delay.connect(delayFb);
        delayFb.connect(delay);
        dry.connect(muteGain);
        delayGain.connect(muteGain);
        muteGain.connect(widthDelay);
        muteGain.connect(panner);
        widthDelay.connect(panner);
        panner.connect(analyser);
        analyser.connect(ctx.destination);

        deckGain = ctx.createGain();
        deckGain.gain.value = 0;
        deckGain.connect(muteGain);

        rainSrc = ctx.createBufferSource();
        rainSrc.buffer = rainBuf;
        rainSrc.loop = true;
        const rainLp = ctx.createBiquadFilter();
        rainLp.type = "lowpass";
        rainLp.frequency.value = 1800;
        rainSrc.connect(rainLp);
        rainLp.connect(rainGain);
        rainSrc.start();
        shopGain = ctx.createGain(); shopGain.gain.value = 0; shopGain.connect(master);
        shopFilter = ctx.createBiquadFilter(); shopFilter.type = "bandpass"; shopFilter.frequency.value = 900;
        // Room identity comes from the score; no continuous fan-like noise bed.
        previewGain = ctx.createGain(); previewGain.gain.value = 0; previewGain.connect(muteGain);
    }

    function ensureDeckEl() {
        if (deckEl) return;
        deckEl = new Audio();
        deckEl.crossOrigin = "anonymous";
        deckEl.preload = "auto";
        deckEl.addEventListener("ended", () => {
            if (playlist.length) playTrack((trackIndex + 1) % playlist.length);
        });
        graph();
        try {
            deckNode = ctx.createMediaElementSource(deckEl);
            deckNode.connect(deckGain);
        } catch { /* already connected */ }
    }

    function stopProcedural() {
        started = false;
        window.clearTimeout(timer);
        if (bassGain && ctx) bassGain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
    }

    function playTrack(i) {
        if (!playlist.length) return false;
        ensureDeckEl();
        trackIndex = ((i % playlist.length) + playlist.length) % playlist.length;
        const item = playlist[trackIndex];
        usingDeck = true;
        stopProcedural();
        deckEl.src = item.url;
        deckEl.currentTime = 0;
        if (deckGain && ctx) deckGain.gain.setTargetAtTime(0.85, ctx.currentTime, 0.05);
        deckEl.play().catch(() => {});
        return true;
    }

    function envGain(t, peak, dur) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        return g;
    }

    function kick(t) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const g = envGain(t, 0.55 * state.intensity, 0.18);
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        osc.connect(g);
        g.connect(clubGain);
        osc.start(t);
        osc.stop(t + 0.2);
        osc.addEventListener("ended", () => { osc.disconnect(); g.disconnect(); });
        state.kickFlag = true;
    }

    function hat(t, open = false) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = open ? 6000 : 9000;
        const g = envGain(t, (open ? 0.045 : 0.025) * state.intensity, open ? 0.12 : 0.045);
        src.connect(hp);
        hp.connect(g);
        g.connect(clubGain);
        src.start(t);
        src.stop(t + 0.14);
        src.addEventListener("ended", () => { src.disconnect(); hp.disconnect(); g.disconnect(); });
    }

    function bassNote(t, freq) {
        bassOsc.frequency.setValueAtTime(freq, t);
        bassFilter.frequency.setTargetAtTime(state.bassCutoff, t, 0.02);
        bassGain.gain.cancelScheduledValues(t);
        bassGain.gain.setValueAtTime(0.0001, t);
        bassGain.gain.exponentialRampToValueAtTime(0.22 * state.intensity, t + 0.01);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    }

    function clap(t) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1800;
        bp.Q.value = 0.9;
        const g = envGain(t, 0.1 * state.intensity, 0.09);
        src.connect(bp);
        bp.connect(g);
        g.connect(clubGain);
        src.start(t);
        src.stop(t + 0.12);
    }

    function jazzWalk(t, freq) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const g = envGain(t, 0.16, 0.28);
        osc.frequency.value = freq;
        osc.connect(g);
        g.connect(jazzGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    function brush(t) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2400;
        const g = envGain(t, 0.025, 0.065);
        src.connect(bp);
        bp.connect(g);
        g.connect(jazzGain);
        src.start(t);
        src.stop(t + 0.14);
    }

    function ride(t) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 7000;
        const g = envGain(t, 0.018, 0.045);
        src.connect(hp);
        hp.connect(g);
        g.connect(jazzGain);
        src.start(t);
        src.stop(t + 0.1);
    }

    function schedule() {
        if (!ctx || !started) return;
        const horizon = ctx.currentTime + 0.18;
        // Resume cleanly after a backgrounded tab without scheduling stale notes.
        nextNote = Math.max(nextNote,ctx.currentTime);
        nextJazzNote = Math.max(nextJazzNote,ctx.currentTime);
        while (nextNote < horizon) {
            const t=nextNote, note=grooveStep(step,state.tone,state.rhythm);
            if (!usingDeck) {
                if(note.kick)kick(t);
                if(note.clap)clap(t);
                if(note.hat)hat(t,step%8===7);
                if(note.bass)bassNote(t,note.bass);
                if(note.chord)playPiano(ctx,clubGain,t,note.chord,.075*note.accent,.65);
                if(note.melody)playPiano(ctx,clubGain,t,[note.melody],.055,.25);
            }
            nextNote+=swungEighthDuration(step,state.bpm,.54);step++;
        }
        while (nextJazzNote < horizon) {
            const t=nextJazzNote,note=grooveStep(jazzStep),s=jazzStep%8;
            if(s%2===0)jazzWalk(t,grooveStep(jazzStep+(s===4?1:0)).bass||65.41);
            if(s===2||s===6)brush(t);
            if(s%2===0||s===3||s===7)ride(t);
            if(note.chord)playPiano(ctx,jazzGain,t,note.chord,.07*note.accent,1.1);
            if(note.melody)playPiano(ctx,jazzGain,t,[note.melody],.075,.42);
            nextJazzNote+=swungEighthDuration(jazzStep,state.jazzBpm,.62);jazzStep++;
        }
        timer = window.setTimeout(schedule, 25);
    }

    function cheer() {
        if (!ctx || muted) return;
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1800;
        const g = envGain(t, 0.45, 0.28);
        src.connect(bp);
        bp.connect(g);
        g.connect(clubGain);
        src.start(t);
        src.stop(t + 0.32);
    }

    // Street traffic: an engine voice for each of the nearest few cars (traffic-sound.js picks them) and their
    // horns, each placed where the car is. Its own bus, straight to the speakers, so it never pumps the club's
    // beat detection; muffled through the walls when you're indoors.
    let trafficBus = null, trafficLp = null, trafficOutside = null;
    const voiceSlots = [];
    const HORNS = { sedan: [349, 440], checker: [392, 494], police: [415, 523], limo: [330, 415], van: [311, 392], bus: [196, 247] };
    function place(node, x, y, z) {
        if (node.positionX) {
            node.positionX.setTargetAtTime(x, ctx.currentTime, 0.03);
            node.positionY.setTargetAtTime(y, ctx.currentTime, 0.03);
            node.positionZ.setTargetAtTime(z, ctx.currentTime, 0.03);
        } else node.setPosition(x, y, z);
    }
    function streetPanner() {
        const p = ctx.createPanner();
        p.panningModel = "equalpower";
        p.distanceModel = "inverse";
        p.refDistance = 4;
        p.rolloffFactor = 1.3;
        p.maxDistance = 120;
        return p;
    }
    function trafficGraph() {
        if (trafficBus || !ctx) return;
        trafficLp = ctx.createBiquadFilter();
        trafficLp.type = "lowpass";
        trafficLp.frequency.value = 12000;
        trafficBus = ctx.createGain();
        trafficBus.gain.value = 0;
        trafficLp.connect(trafficBus);
        trafficBus.connect(ctx.destination);
        for (let i = 0; i < 4; i++) {
            const pan = streetPanner(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), hiss = ctx.createGain();
            g.gain.value = 0;
            hiss.gain.value = 0;
            lp.type = "lowpass";
            lp.frequency.value = 200;
            lp.Q.value = 2.4;
            // Two detuned oscillators an octave apart beat against each other: the uneven burble of an idling V8.
            const a = ctx.createOscillator(), b = ctx.createOscillator(), bg = ctx.createGain();
            a.type = "sawtooth";
            b.type = "square";
            bg.gain.value = 0.45;
            a.connect(lp);
            b.connect(bg);
            bg.connect(lp);
            lp.connect(g);
            g.connect(pan);
            // Tyres on asphalt.
            const tyre = ctx.createBufferSource(), bp = ctx.createBiquadFilter();
            tyre.buffer = noiseBuf;
            tyre.loop = true;
            bp.type = "bandpass";
            bp.frequency.value = 850;
            bp.Q.value = 0.7;
            tyre.connect(bp);
            bp.connect(hiss);
            hiss.connect(pan);
            pan.connect(trafficLp);
            a.start();
            b.start();
            tyre.start(0, i * 0.27);
            voiceSlots.push({ pan, g, lp, a, b, hiss });
        }
    }
    function trafficLevel() {
        if (!trafficBus) return;
        const t = ctx.currentTime;
        const out = trafficOutside !== false;
        trafficBus.gain.setTargetAtTime(muted ? 0 : out ? 1 : 0.3, t, 0.15);
        trafficLp.frequency.setTargetAtTime(out ? 12000 : 420, t, 0.15);
        foleyBus?.gain.setTargetAtTime(muted ? 0 : 1, t, 0.05);
    }

    // The city's own sound, on the street bus (so it's muffled indoors): a low hum of a million rooms, the El's
    // rumble from wherever the train is, and ships on the river. Your footsteps have their own bus.
    let foleyBus = null, cityBed = null, elVoice = null;
    function cityGraph() {
        if (cityBed || !ctx) return;
        trafficGraph();
        foleyBus = ctx.createGain();
        foleyBus.gain.value = muted ? 0 : 1;
        foleyBus.connect(ctx.destination);
        const bed = ctx.createBufferSource(), bedLp = ctx.createBiquadFilter();
        bed.buffer = rainBuf;
        bed.loop = true;
        bed.playbackRate.value = 0.35;
        bedLp.type = "lowpass";
        bedLp.frequency.value = 260;
        cityBed = ctx.createGain();
        cityBed.gain.value = 0;
        bed.connect(bedLp); bedLp.connect(cityBed); cityBed.connect(trafficLp);
        bed.start(0, 0.7);
        // The El: a deep roll and the clatter of wheels over rail joints, gated by a slow pulse.
        const pan = streetPanner();
        pan.refDistance = 14;
        pan.rolloffFactor = 1.1;
        const roll = ctx.createBufferSource(), rollLp = ctx.createBiquadFilter(), g = ctx.createGain();
        roll.buffer = noiseBuf;
        roll.loop = true;
        rollLp.type = "lowpass";
        rollLp.frequency.value = 170;
        g.gain.value = 0;
        const clat = ctx.createBufferSource(), clatBp = ctx.createBiquadFilter(), clatG = ctx.createGain(), lfo = ctx.createOscillator(), lfoG = ctx.createGain();
        clat.buffer = noiseBuf;
        clat.loop = true;
        clatBp.type = "bandpass";
        clatBp.frequency.value = 1100;
        clatBp.Q.value = 1.4;
        clatG.gain.value = 0;
        lfo.type = "square";
        lfo.frequency.value = 3.1;
        lfoG.gain.value = 0.5;
        lfo.connect(lfoG); lfoG.connect(clatG.gain);
        roll.connect(rollLp); rollLp.connect(g);
        clat.connect(clatBp); clatBp.connect(clatG); clatG.connect(g);
        g.connect(pan); pan.connect(trafficLp);
        roll.start(0, 0.2); clat.start(0, 0.5); lfo.start();
        elVoice = { pan, g, clatG };
    }
    const STEPS = {
        pavement: { f: 1000, q: 1.0, dur: 0.085, thump: 0.5, level: 0.05, wet: true },
        gravel: { f: 2100, q: 0.5, dur: 0.15, thump: 0.25, level: 0.04 },
        terrazzo: { f: 1900, q: 1.8, dur: 0.06, thump: 0.6, level: 0.05 },
        glass: { f: 2600, q: 2.4, dur: 0.05, thump: 0.45, level: 0.045 },
        tile: { f: 2400, q: 2.0, dur: 0.055, thump: 0.4, level: 0.045 },
        carpet: { f: 420, q: 0.7, dur: 0.07, thump: 0.5, level: 0.022 },
        wood: { f: 560, q: 1.5, dur: 0.1, thump: 0.95, level: 0.05 },
    };
    /** A horn: two notes a third apart, like the dual horns of the day. at = {x, z}, or null for your own car. */
    function playHorn(kind = "sedan", at = null, { long = false, double = false } = {}) {
        if (!ctx || muted) return;
        trafficGraph();
        const [f1, f2] = HORNS[kind] || HORNS.sedan, t0 = ctx.currentTime + 0.01;
        const out = at ? streetPanner() : ctx.createGain();
        if (at) place(out, at.x, 1, at.z);
        out.connect(trafficLp);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = kind === "bus" ? 700 : 1300;
        bp.Q.value = 0.9;
        bp.connect(out);
        const blasts = double ? [[0, 0.17], [0.27, long ? 0.6 : 0.2]] : [[0, long ? 0.75 : 0.3]];
        const end = t0 + blasts[blasts.length - 1][0] + blasts[blasts.length - 1][1] + 0.1;
        for (const f of [f1, f2]) {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = kind === "bus" ? "sawtooth" : "square";
            o.frequency.value = f;
            g.gain.value = 0;
            for (const [s, d] of blasts) {
                g.gain.setValueAtTime(0, t0 + s);
                g.gain.linearRampToValueAtTime(at ? 0.16 : 0.07, t0 + s + 0.015);
                g.gain.setValueAtTime(at ? 0.16 : 0.07, t0 + s + d - 0.03);
                g.gain.linearRampToValueAtTime(0, t0 + s + d);
            }
            o.connect(g);
            g.connect(bp);
            o.start(t0);
            o.stop(end);
            o.onended = () => { o.disconnect(); g.disconnect(); };
        }
        setTimeout(() => { bp.disconnect(); out.disconnect(); }, (end - ctx.currentTime) * 1000 + 200);
    }
    function horn() {
        trafficLevel();
        playHorn("sedan", null);
    }
    /** The crackle and whistle of the dial between stations. */
    function tuneCrackle() {
        if (!ctx || muted) return;
        const t = ctx.currentTime, src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = noiseBuf;
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(900, t);
        bp.frequency.exponentialRampToValueAtTime(2600, t + 0.32);
        bp.Q.value = 0.7;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        const whistle = ctx.createOscillator(), wg = ctx.createGain();
        whistle.frequency.setValueAtTime(2400, t);
        whistle.frequency.exponentialRampToValueAtTime(700, t + 0.35);
        wg.gain.setValueAtTime(0.012, t);
        wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        src.connect(bp); bp.connect(g); g.connect(muteGain);
        whistle.connect(wg); wg.connect(muteGain);
        src.start(t, Math.random() * 0.6); src.stop(t + 0.45);
        whistle.start(t); whistle.stop(t + 0.4);
        src.onended = () => { src.disconnect(); bp.disconnect(); g.disconnect(); whistle.disconnect(); wg.disconnect(); };
    }

    return {
        get previewing() { return previewing; },
        get bpm() { return radio ? (radio === "club" ? state.bpm : state.jazzBpm) : musicMix(zone)[1] > 0 ? state.jazzBpm : state.bpm; },
        get context() { return ctx; },
        get started() { return started; },
        get muted() { return muted; },
        get zone() { return zone; },

        async unlock() {
            graph();
            if (ctx.state === "suspended") await ctx.resume();
        },

        start() {
            if (usingDeck) return;
            if (reduced && muted) return;
            graph();
            if (started) {
                ctx.resume();
                return;
            }
            started = true;
            nextNote = ctx.currentTime + 0.05;
            step = 0;
            nextJazzNote=nextNote; jazzStep=0;
            schedule();
        },

        stop() {
            started = false;
            window.clearTimeout(timer);
            if (bassGain) bassGain.gain.setTargetAtTime(0, ctx ? ctx.currentTime : 0, 0.05);
        },

        setMuted(v) {
            muted = !!v;
            if (muteGain) muteGain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.04);
            trafficLevel();
        },
        toggleMute() {
            this.setMuted(!muted);
            return muted;
        },
        setReduced(v) { reduced = !!v; },

        setZone(z) {
            zone = z || "club";
            if (!ctx) return;
            const t = ctx.currentTime;
            const mix = musicMix(zone);
            const night = {
                doors: [1, 1, 0.85],
                heat: [1, 1, 1],
                peak: [1.1, 0.9, 0.9],
                lastcall: [0.72, 1.12, 1.2],
                close: [0.32, 0.65, 1.45],
            }[nightPhase] || [1, 1, 1];
            const duck = previewing ? 0.18 : 1;
            const st = radio && STATIONS[radio];
            clubGain.gain.setTargetAtTime(st ? st.mix[0] : mix[0] * night[0] * duck, t, st ? 0.08 : 0.4);
            jazzGain.gain.setTargetAtTime(st ? st.mix[1] : mix[1] * night[1] * duck, t, st ? 0.08 : 0.4);
            rainGain.gain.setTargetAtTime(mix[2] * night[2], t, 0.45);
            if (rumbleGain) rumbleGain.gain.setTargetAtTime(zone === "subway" ? 0.025 : 0, t, 0.35);
            const room = { records:[.012,1800], pharmacy:[.015,3100], florist:[.006,650], rivoli:[.016,340], liquor:[.005,800], barber:[.012,1600], diner:[.014,2400] }[zone];
            shopGain?.gain.setTargetAtTime(0,t,.4);
            if (room) shopFilter?.frequency.setTargetAtTime(room[1],t,.4);
        },

        consumeKick() {
            const k = state.kickFlag;
            state.kickFlag = false;
            return k;
        },
        getBass() {
            if (!analyser) return 0;
            analyser.getByteFrequencyData(freqData);
            let sum = 0;
            for (let i = 0; i < 5; i++) sum += freqData[i];
            const b = Math.min(1, (sum / 5) / 220);
            if (usingDeck && b > 0.38 && b - lastBass > 0.14) state.kickFlag = true;
            lastBass = b;
            return b;
        },
        getMid() {
            if (!analyser) return 0;
            analyser.getByteFrequencyData(freqData);
            let sum = 0;
            for (let i = 8; i < 24; i++) sum += freqData[i];
            return Math.min(1, (sum / 16) / 180);
        },
        setListener(x, y, z, fx, fy, fz) {
            if (!ctx) return;
            const l = ctx.listener;
            const t = ctx.currentTime;
            if (l.positionX) {
                l.positionX.setTargetAtTime(x, t, 0.02);
                l.positionY.setTargetAtTime(y, t, 0.02);
                l.positionZ.setTargetAtTime(z, t, 0.02);
                l.forwardX.setTargetAtTime(fx, t, 0.02);
                l.forwardY.setTargetAtTime(fy, t, 0.02);
                l.forwardZ.setTargetAtTime(fz, t, 0.02);
                l.upX.setTargetAtTime(0, t, 0.02);
                l.upY.setTargetAtTime(1, t, 0.02);
                l.upZ.setTargetAtTime(0, t, 0.02);
            } else if (l.setPosition) {
                l.setPosition(x, y, z);
                l.setOrientation(fx, fy, fz, 0, 1, 0);
            }
            if (radio && panner.positionX) {
                panner.positionX.setTargetAtTime(x + fx * 0.7, t, 0.02);
                panner.positionY.setTargetAtTime(y - 0.35, t, 0.02);
                panner.positionZ.setTargetAtTime(z + fz * 0.7, t, 0.02);
            }
        },
        get usingDeck() { return usingDeck; },
        get radio() { return radio; },
        /** The car radio: a station id (swing, club, off) while you drive, null when you get out. Tuning crackles. */
        setRadio(id) {
            const next = id && STATIONS[id] ? id : null;
            if (next === radio) return;
            const was = radio;
            radio = next;
            if (!ctx) return;
            const t = ctx.currentTime, on = !!radio;
            amDry.gain.setTargetAtTime(on ? 0 : 1, t, 0.03);
            amWet.gain.setTargetAtTime(on ? 1.7 : 0, t, 0.03);
            if (!on && panner.positionX) {
                panner.positionX.setTargetAtTime(0, t, 0.05);
                panner.positionY.setTargetAtTime(2.2, t, 0.05);
                panner.positionZ.setTargetAtTime(-12, t, 0.05);
            }
            // Crackle when you turn the dial, or get in with a station playing.
            if (on && (was !== null || radio !== "off")) tuneCrackle();
            this.setZone(zone);
        },
        stations: Object.keys(STATIONS),
        stationName(id) { return STATIONS[id]?.long || ""; },
        get trackName() {
            if (radio) return STATIONS[radio].name;
            if (usingDeck && trackIndex >= 0 && playlist[trackIndex]) return playlist[trackIndex].name;
            if (zone === "lounge") return "VELMA'S TRIO";
            if (["street","mercer","hawthorne","eastavenue","48th","northloop","southloop","westavenue","riverside"].includes(zone)) return "SIDEWALK SWING · JAZZ QUARTET";
            if (zone === "alley") return "AFTER HOURS · JAZZ HOUSE";
            if (zone === "books") return "PAPER & PIANO";
            if (zone === "bakery") return "SUNRISE SWING";
            if (zone === "arcade") return "EASTERN ELECTRIC · HOUSE";
            if (zone === "diner") return "COUNTER RADIO";
            if (zone === "records") return "LISTENING BOOTH";
            if (zone === "pharmacy") return "SODA FOUNTAIN";
            if (zone === "florist") return "WET STEMS";
            if (zone === "rivoli") return "NEWSREEL HUSH";
            if (zone === "liquor") return "BOTTLE ROOM";
            if (zone === "barber") return "OPEN LATE";
            if (zone === "hotel") return "LOBBY CARPET";
            if (zone === "suite") return "4B CARPET";
            if (zone === "subway") return "THE 12:04";
            return `${houseName} · JAZZ HOUSE`;
        },
        setHouseSet(set) {
            if (!set) return;
            state.bpm = set.bpm || 128;
            houseName = set.name || "HOUSE SYSTEM";
            state.tone = set.tone || 0; state.rhythm = set.rhythm || 0;
            if (delay && ctx) delay.delayTime.setTargetAtTime(60 / state.bpm / 2, ctx.currentTime, 0.25);
        },
        setNightPhase(phase) {
            nightPhase = phase || "doors";
            const map = { doors: 0.7, heat: 0.95, peak: 1.18, lastcall: 0.8, close: 0.4 };
            this.setIntensity(map[nightPhase] ?? 1);
            this.setZone(zone);
        },
        get playlist() { return playlist.slice(); },
        get trackIndex() { return trackIndex; },
        addFiles(fileList) {
            const files = Array.from(fileList || []).filter((f) => f && f.type && f.type.startsWith("audio/"));
            for (const file of files) {
                playlist.push({ name: file.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(file) });
            }
            return files.length;
        },
        playTrack,
        next() { return playTrack(trackIndex + 1); },
        prev() { return playTrack(trackIndex <= 0 ? playlist.length - 1 : trackIndex - 1); },
        stopDeck() {
            usingDeck = false;
            if (deckEl) deckEl.pause();
            if (deckGain && ctx) deckGain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
        },
        houseSystem() {
            this.stopDeck();
            trackIndex = -1;
            this.start();
        },
        setIntensity(v) {
            state.intensity = v;
            if (master && ctx) master.gain.setTargetAtTime(0.7 * v, ctx.currentTime, 0.05);
        },
        previewRecord(item) {
            this.stopPreview(); graph();
            previewing = true; previewGain.gain.setValueAtTime(.3,ctx.currentTime);
            if (usingDeck) deckGain.gain.setTargetAtTime(.18,ctx.currentTime,.1);
            const set=item.set||{}, duration=8, beat=60/(set.bpm||128), start=ctx.currentTime+.02;
            for(let n=0;n*beat/2<duration;n++) {
                const t=start+n*beat/2, freq=A_MIN_BASS[(n+(set.rhythm||0)*2)%8]*2**((set.tone||0)/12);
                const osc=ctx.createOscillator(), gain=ctx.createGain(); osc.type='triangle';
                osc.frequency.value=freq*(n%2?4:2); gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(.22,t+.012); gain.gain.exponentialRampToValueAtTime(.001,t+beat*.45);
                osc.connect(gain);gain.connect(previewGain);osc.start(t);osc.stop(t+beat*.48);previewNodes.push(osc);
                osc.onended=()=>{osc.disconnect();gain.disconnect();};
            }
            this.setZone(zone);
        },
        stopPreview() {
            previewing=false;
            if(ctx){ for(const node of previewNodes)try{node.stop();}catch{}; previewNodes=[]; previewGain?.gain.setTargetAtTime(0,ctx.currentTime,.03); if(usingDeck)deckGain?.gain.setTargetAtTime(.85,ctx.currentTime,.1); this.setZone(zone); }
        },
        playStreetNote(index) {
            if(!ctx||muted)return;
            const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
            o.type="triangle";o.frequency.value=[261.63,329.63,392][index]||261.63;
            g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.38);
            o.connect(g);g.connect(muteGain);o.start(t);o.stop(t+.4);o.onended=()=>{o.disconnect();g.disconnect();};
        },
        playShopSound(kind='bell') {
            if(!ctx||muted)return;
            const t=ctx.currentTime, notes=kind==='haircut'?[820,1050,720,940]:kind==='ticket'?[240,360]:[880,1174];
            notes.forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='haircut'?'triangle':'sine';o.frequency.value=freq;g.gain.setValueAtTime(.07,t+i*.12);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.28);o.connect(g);g.connect(master);o.start(t+i*.12);o.stop(t+i*.12+.3);o.onended=()=>{o.disconnect();g.disconnect();};});
        },
        cheer,
        horn,
        trafficState() { return trafficBus ? { bus: trafficBus.gain.value, voices: voiceSlots.map((s) => +s.g.gain.value.toFixed(3)), outside: trafficOutside } : null; },
        /** A footstep on `surface` (foley.js surfaceFor); side ±1 alternates feet; run lands harder. */
        footstep(surface = "pavement", { side = 1, run = false } = {}) {
            if (!ctx || ctx.state !== "running" || muted) return;
            cityGraph();
            const s = STEPS[surface] || STEPS.pavement, t = ctx.currentTime, k = run ? 1.35 : 1;
            const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
            src.buffer = noiseBuf;
            src.playbackRate.value = 1 + side * 0.04;
            bp.type = "bandpass";
            bp.frequency.value = s.f * (1 + side * 0.05);
            bp.Q.value = s.q;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(s.level * k, t + 0.006);
            g.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);
            src.connect(bp); bp.connect(g); g.connect(foleyBus);
            src.start(t, Math.random() * 0.8); src.stop(t + s.dur + 0.02);
            // The heel: a soft low knock.
            const o = ctx.createOscillator(), og = ctx.createGain();
            o.frequency.setValueAtTime(110, t);
            o.frequency.exponentialRampToValueAtTime(55, t + 0.05);
            og.gain.setValueAtTime(0.0001, t);
            og.gain.exponentialRampToValueAtTime(s.level * s.thump * k * 1.4, t + 0.004);
            og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
            o.connect(og); og.connect(foleyBus);
            o.start(t); o.stop(t + 0.08);
            const nodes = [src, bp, g, o, og];
            // Wet pavement: a small splash on top.
            if (s.wet) {
                const w = ctx.createBufferSource(), whp = ctx.createBiquadFilter(), wg = ctx.createGain();
                w.buffer = noiseBuf;
                whp.type = "highpass";
                whp.frequency.value = 3800;
                wg.gain.setValueAtTime(0.0001, t + 0.01);
                wg.gain.exponentialRampToValueAtTime(s.level * 0.5 * k, t + 0.02);
                wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
                w.connect(whp); whp.connect(wg); wg.connect(foleyBus);
                w.start(t, Math.random() * 0.8); w.stop(t + 0.1);
                nodes.push(w, whp, wg);
            }
            o.onended = () => { for (const n of nodes) n.disconnect(); };
        },
        /** Each frame: the city around you. el = foley.js elRumble(), horn = riverHorn() or null. */
        setCity({ outside = true, el = null, horn = null, night = 1 } = {}) {
            if (!ctx || ctx.state !== "running") return;
            cityGraph();
            const t = ctx.currentTime;
            cityBed.gain.setTargetAtTime(outside ? 0.05 + 0.03 * night : 0.04, t, 0.4);
            if (el) {
                place(elVoice.pan, el.x, el.y, el.z);
                elVoice.g.gain.setTargetAtTime(el.level * 0.5, t, 0.3);
                elVoice.clatG.gain.setTargetAtTime(el.level * 0.5, t, 0.3);
            }
            if (horn && !muted) {
                // A ship's horn: two low notes, slow to swell, carrying across the whole city.
                const pan = streetPanner();
                pan.refDistance = 80;
                pan.rolloffFactor = 0.7;
                pan.maxDistance = 2000;
                place(pan, horn.x, 6, horn.z);
                pan.connect(trafficLp);
                const lp = ctx.createBiquadFilter();
                lp.type = "lowpass";
                lp.frequency.value = 650;
                lp.connect(pan);
                const len = horn.long ? 3.2 : 1.8, end = t + len + 1.2;
                for (const f of [98, 123.5]) {
                    const o = ctx.createOscillator(), g = ctx.createGain();
                    o.type = "sawtooth";
                    o.frequency.value = f;
                    g.gain.setValueAtTime(0.0001, t);
                    g.gain.exponentialRampToValueAtTime(0.11, t + 0.45);
                    g.gain.setValueAtTime(0.11, t + len);
                    g.gain.exponentialRampToValueAtTime(0.0001, end);
                    o.connect(g); g.connect(lp);
                    o.start(t); o.stop(end + 0.05);
                    o.onended = () => { o.disconnect(); g.disconnect(); };
                }
                setTimeout(() => { lp.disconnect(); pan.disconnect(); }, (len + 1.6) * 1000);
            }
        },
        /** Each frame: {voices, honks} from traffic-sound.js stepTrafficSound, and whether you're out in the street. */
        setTraffic({ voices = [], honks = [] } = {}, { outside = true } = {}) {
            if (!ctx || ctx.state !== "running") return;
            trafficGraph();
            if (outside !== trafficOutside) { trafficOutside = outside; trafficLevel(); }
            const t = ctx.currentTime;
            voiceSlots.forEach((slot, i) => {
                const v = voices[i];
                if (!v) {
                    slot.g.gain.setTargetAtTime(0, t, 0.25);
                    slot.hiss.gain.setTargetAtTime(0, t, 0.25);
                    return;
                }
                const speed = Math.abs(v.v), big = v.kind === "bus" ? 0.7 : v.kind === "van" ? 0.85 : 1;
                // A touch of Doppler: up as it closes on you, down as it pulls away.
                const f = engineNote(speed) * big * (343 / (343 - v.approach));
                slot.a.frequency.setTargetAtTime(f, t, 0.06);
                slot.b.frequency.setTargetAtTime(f * 0.503, t, 0.06);
                slot.lp.frequency.setTargetAtTime(150 + speed * 26 + (v.own ? 140 : 0), t, 0.08);
                const level = (v.own ? 0.1 : 0.055) * (0.55 + Math.min(1, speed / 14) * 0.6) * (v.kind === "bus" ? 1.5 : 1);
                slot.g.gain.setTargetAtTime(level, t, 0.12);
                slot.hiss.gain.setTargetAtTime(Math.min(1, speed / 14) * (v.own ? 0.03 : 0.04), t, 0.12);
                place(slot.pan, v.x, 0.6, v.z);
            });
            for (const h of honks) playHorn(h.kind, h, h);
        },
        boostJazz() {
            if (!ctx) return;
            jazzGain.gain.setTargetAtTime(1.1, ctx.currentTime, 0.2);
        },
    };
}
