/* Club techno + lounge jazz + street rain. No sample files. */

const A_MIN_BASS = [55.0, 55.0, 65.41, 52.0, 43.65, 43.65, 49.0, 41.2];
const STAB_FREQS = [220.0, 261.63, 329.63, 392.0];
const WALK_BASS = [65.41, 82.41, 87.31, 82.41, 73.42, 82.41, 65.41, 98.0];
const JAZZ_CHORDS = [
    [261.63, 311.13, 392.0],
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 246.94, 293.66],
];

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
    let jazzOn = false;
    let houseName = "HOUSE SYSTEM";

    const state = {
        bpm: 128,
        kickFlag: false,
        bassCutoff: 280,
        stereoWidth: 0.35,
        intensity: 1,
        jazzBpm: 96,
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
        panner.rolloffFactor = 0.45;
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
        bassOsc.type = "sawtooth";
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
        const g = envGain(t, 1.05 * state.intensity, 0.18);
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
        const g = envGain(t, (open ? 0.12 : 0.07) * state.intensity, open ? 0.12 : 0.045);
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
        const g = envGain(t, 0.22 * state.intensity, 0.09);
        src.connect(bp);
        bp.connect(g);
        g.connect(clubGain);
        src.start(t);
        src.stop(t + 0.12);
    }

    function stab(t) {
        const g = envGain(t, 0.09 * state.intensity, 0.22);
        for (const f of STAB_FREQS) {
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = f;
            const lp = ctx.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.value = 1400;
            osc.connect(lp);
            lp.connect(g);
            osc.start(t);
            osc.stop(t + 0.24);
            osc.addEventListener("ended", () => { osc.disconnect(); lp.disconnect(); });
        }
        g.connect(clubGain);
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

    function jazzChord(t, freqs) {
        const g = envGain(t, 0.05, 1.4);
        for (const f of freqs) {
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = f;
            const lp = ctx.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.value = 1200;
            osc.connect(lp);
            lp.connect(g);
            osc.start(t);
            osc.stop(t + 1.5);
        }
        g.connect(jazzGain);
    }

    function brush(t) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2400;
        const g = envGain(t, 0.08, 0.12);
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
        const g = envGain(t, 0.04, 0.08);
        src.connect(hp);
        hp.connect(g);
        g.connect(jazzGain);
        src.start(t);
        src.stop(t + 0.1);
    }

    function schedule() {
        if (!ctx || !started) return;
        const beat = 60 / state.bpm;
        const stepDur = beat / 2;
        const jazzBeat = 60 / state.jazzBpm;
        const horizon = ctx.currentTime + 0.18;
        while (nextNote < horizon) {
            const t = nextNote;
            const s = step % 8;
            const barStep = step % 32;
            if (!usingDeck) {
                const peak = nightPhase === "peak";
                const late = nightPhase === "lastcall" || nightPhase === "close";
                if (s % 2 === 0 && (!late || s === 0 || s === 4)) kick(t);
                if (s % 2 === 1) hat(t, false);
                if (s === 3 || s === 7) hat(t, true);
                if (s === 2 || s === 6 || (peak && s === 0)) clap(t);
                bassNote(t, A_MIN_BASS[s]);
                if (barStep === 0 || (peak && s === 0)) stab(t);
                if (peak && s === 4) hat(t, true);
            }
            const js = step % 8;
            if (js % 2 === 0) jazzWalk(t, WALK_BASS[js]);
            if (js === 2 || js === 6) brush(t);
            ride(t);
            if (step % 16 === 0) jazzChord(t, JAZZ_CHORDS[(step / 16) % 4]);
            nextNote += stepDur;
            step += 1;
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
        get bpm() { return zone === "lounge" ? state.jazzBpm : state.bpm; },
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
            const mix = {
                club: [1, 0.05, 0],
                lounge: [0.18, 1, 0.02],
                diner: [0.08, 0.22, 0.08],
                hotel: [0.06, 0.18, 0.06],
                records: [0.22, 0.35, 0.08],
                pharmacy: [0.05, 0.12, 0.12],
                florist: [0.04, 0.16, 0.1],
                rivoli: [0.06, 0.28, 0.06],
                liquor: [0.08, 0.2, 0.1],
                barber: [0.05, 0.14, 0.08],
                street: [0.1, 0.05, 0.45],
                alley: [0.28, 0.04, 0.35],
                subway: [0.04, 0.04, 0.12],
                suite: [0.05, 0.16, 0.05],
            }[zone] || [1, 0, 0];
            const night = {
                doors: [1, 1, 0.85],
                heat: [1, 1, 1],
                peak: [1.1, 0.9, 0.9],
                lastcall: [0.72, 1.12, 1.2],
                close: [0.32, 0.65, 1.45],
            }[nightPhase] || [1, 1, 1];
            clubGain.gain.setTargetAtTime(mix[0] * night[0], t, 0.4);
            jazzGain.gain.setTargetAtTime(mix[1] * night[1], t, 0.4);
            rainGain.gain.setTargetAtTime(mix[2] * night[2], t, 0.45);
            if (rumbleGain) rumbleGain.gain.setTargetAtTime(zone === "subway" ? 0.22 : 0, t, 0.35);
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
            if (zone === "street" || zone === "alley") return "RAIN ON 47TH";
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
            return houseName;
        },
        setHouseSet(set) {
            if (!set) return;
            state.bpm = set.bpm || 128;
            houseName = set.name || "HOUSE SYSTEM";
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
        cheer,
        horn,
        boostJazz() {
            if (!ctx) return;
            jazzGain.gain.setTargetAtTime(1.1, ctx.currentTime, 0.2);
        },
    };
}
