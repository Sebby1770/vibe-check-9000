import { grooveStep, swungEighthDuration, playPiano, musicMix } from './music.js';
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

        clubGain.connect(master);
        jazzGain.connect(master);
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

    function horn() {
        if (!ctx || muted) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.35);
        const g = envGain(t, 0.12, 0.4);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + 0.42);
    }

    return {
        get previewing() { return previewing; },
        get bpm() { return musicMix(zone)[1] > 0 ? state.jazzBpm : state.bpm; },
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
            clubGain.gain.setTargetAtTime(mix[0] * night[0] * duck, t, 0.4);
            jazzGain.gain.setTargetAtTime(mix[1] * night[1] * duck, t, 0.4);
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
        },
        get usingDeck() { return usingDeck; },
        get trackName() {
            if (usingDeck && trackIndex >= 0 && playlist[trackIndex]) return playlist[trackIndex].name;
            if (zone === "lounge") return "VELMA'S TRIO";
            if (["street","mercer","hawthorne","eastavenue","48th"].includes(zone)) return "SIDEWALK SWING · JAZZ QUARTET";
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
        boostJazz() {
            if (!ctx) return;
            jazzGain.gain.setTargetAtTime(1.1, ctx.currentTime, 0.2);
        },
    };
}
