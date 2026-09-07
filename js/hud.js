import { getNode } from "./people.js";

const $ = (id) => document.getElementById(id);

export function createHud(hooks) {
    const run = {
        phase: "boot",
        prevPhase: "boot",
        entered: false,
        reducedFx: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        crowd: true,
        sensitivity: 1,
        fov: 88,
        muted: false,
        tipsy: false,
        talkNpc: null,
        talkNode: "start",
        energy: 0,
    };

    function toast(msg, color) {
        const t = $("toast");
        t.textContent = msg;
        t.style.background = color || "#39ff14";
        t.classList.add("show");
        window.setTimeout(() => t.classList.remove("show"), 2400);
    }

    function setPhase(p) {
        if (p === "settings" || p === "deck") {
            if (run.phase !== "settings" && run.phase !== "deck") {
                run.prevPhase = run.phase === "talk" ? "explore" : run.phase;
            }
        }
        run.phase = p;
        $("boot").classList.toggle("hidden", p !== "boot");
        $("pause").classList.toggle("hidden", p !== "pause");
        $("talk").classList.toggle("hidden", p !== "talk");
        $("deck").classList.toggle("hidden", p !== "deck");
        $("settings").classList.toggle("hidden", p !== "settings");
        $("crosshair").classList.toggle("hidden", p !== "explore");
        document.body.dataset.phase = p;
        const overlay = p !== "explore" && p !== "boot";
        if (p === "boot" || overlay) hooks.onOverlay?.(true);
        else hooks.onOverlay?.(false);
    }

    function renderTalk() {
        const npc = run.talkNpc;
        const node = getNode(npc, run.talkNode);
        if (!npc || !node) {
            setPhase("explore");
            hooks.onResume?.();
            return;
        }
        $("talkName").textContent = npc.name;
        $("talkRole").textContent = npc.role;
        $("talkLine").textContent = node.say;
        const box = $("talkChoices");
        box.innerHTML = "";
        (node.choices || []).forEach((choice, i) => {
            const btn = document.createElement("button");
            btn.className = "q-option";
            btn.type = "button";
            btn.innerHTML = `<span class="q-key">${i + 1}</span><span>${choice.text}</span>`;
            btn.addEventListener("click", () => hooks.onTalkChoice?.(i));
            box.appendChild(btn);
        });
        setPhase("talk");
    }

    function renderTracks(list, index, usingDeck) {
        const el = $("trackList");
        if (!list.length) {
            el.innerHTML = '<li class="empty">no guest tracks yet — house system is live</li>';
            return;
        }
        el.innerHTML = list.map((track, i) => {
            const on = usingDeck && i === index;
            return `<li class="${on ? "on" : ""}" data-i="${i}"><span>${track.name}</span>${on ? "<em>NOW</em>" : ""}</li>`;
        }).join("");
    }

    function applyReduced() {
        document.documentElement.classList.toggle("reduced-fx", run.reducedFx);
        hooks.onSettings?.({
            reduced: run.reducedFx,
            crowd: run.crowd,
            sensitivity: run.sensitivity,
            fov: run.fov,
            muted: run.muted,
            tipsy: run.tipsy,
        });
        document.body.classList.toggle("tipsy", run.tipsy && !run.reducedFx);
    }

    function enterClub() {
        run.entered = true;
        setPhase("explore");
        hooks.onEnter?.();
    }

    function leaveOverlay() {
        setPhase(run.entered ? "explore" : "boot");
        if (run.phase === "explore") hooks.onResume?.();
    }

    function wire() {
        $("enterBtn").addEventListener("click", enterClub);
        $("resumeBtn").addEventListener("click", () => {
            setPhase("explore");
            hooks.onResume?.();
        });
        $("talkClose").addEventListener("click", () => {
            run.talkNpc = null;
            setPhase("explore");
            hooks.onResume?.();
        });
        $("deckBtn").addEventListener("click", () => {
            hooks.onUnlockLook?.();
            setPhase("deck");
        });
        $("pauseDeckBtn").addEventListener("click", () => setPhase("deck"));
        $("deckClose").addEventListener("click", leaveOverlay);
        $("settingsBtn").addEventListener("click", () => {
            hooks.onUnlockLook?.();
            setPhase("settings");
        });
        $("settingsClose").addEventListener("click", leaveOverlay);
        $("muteBtn").addEventListener("click", () => {
            run.muted = hooks.onMute?.() ?? !run.muted;
            $("muteBtn").textContent = run.muted ? "UNMUTE" : "MUTE";
            $("muteToggle").checked = run.muted;
        });
        $("pauseMuteBtn").addEventListener("click", () => $("muteBtn").click());
        $("audioFiles").addEventListener("change", (e) => hooks.onFiles?.(e.target.files));
        const drop = $("dropAudio");
        drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("hot"); });
        drop.addEventListener("dragleave", () => drop.classList.remove("hot"));
        drop.addEventListener("drop", (e) => {
            e.preventDefault();
            drop.classList.remove("hot");
            hooks.onFiles?.(e.dataTransfer.files);
        });
        $("playBtn").addEventListener("click", () => hooks.onDeckPlay?.());
        $("prevBtn").addEventListener("click", () => hooks.onDeckPrev?.());
        $("nextBtn").addEventListener("click", () => hooks.onDeckNext?.());
        $("houseBtn").addEventListener("click", () => hooks.onHouse?.());
        $("trackList").addEventListener("click", (e) => {
            const li = e.target.closest("li[data-i]");
            if (li) hooks.onDeckPlay?.(Number(li.dataset.i));
        });

        $("sensSlider").addEventListener("input", (e) => {
            run.sensitivity = Number(e.target.value);
            $("sensVal").textContent = run.sensitivity.toFixed(2);
            applyReduced();
        });
        $("fovSlider").addEventListener("input", (e) => {
            run.fov = Number(e.target.value);
            $("fovVal").textContent = String(run.fov);
            applyReduced();
        });
        $("muteToggle").addEventListener("change", (e) => {
            run.muted = e.target.checked;
            hooks.onMute?.(run.muted);
            $("muteBtn").textContent = run.muted ? "UNMUTE" : "MUTE";
        });
        $("fxToggle").addEventListener("change", (e) => {
            run.reducedFx = e.target.checked;
            applyReduced();
        });
        $("crowdToggle").addEventListener("change", (e) => {
            run.crowd = e.target.checked;
            applyReduced();
        });
        $("tipsyToggle").addEventListener("change", (e) => {
            run.tipsy = e.target.checked;
            applyReduced();
            if (run.tipsy) toast("TIPSY — free, not gone", "#ffb703");
        });
        $("fxToggle").checked = run.reducedFx;
        if (run.reducedFx) {
            run.muted = true;
            $("muteBtn").textContent = "UNMUTE";
            $("muteToggle").checked = true;
        }

        document.querySelectorAll("[data-modal]").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                $("modalTitle").textContent = link.dataset.modal;
                $("modalBody").innerHTML = MODAL.about;
                $("modalBg").classList.add("active");
            });
        });
        $("modalClose").addEventListener("click", () => $("modalBg").classList.remove("active"));
        $("modalBg").addEventListener("click", (e) => {
            if (e.target === $("modalBg")) $("modalBg").classList.remove("active");
        });

        window.addEventListener("keydown", (e) => {
            if (run.phase === "talk" && /^[1-9]$/.test(e.key)) {
                hooks.onTalkChoice?.(Number(e.key) - 1);
                return;
            }
            if (e.key === "Escape") {
                $("modalBg").classList.remove("active");
                if (run.phase === "settings" || run.phase === "deck" || run.phase === "talk") {
                    leaveOverlay();
                    return;
                }
                if (run.phase === "pause") {
                    setPhase("explore");
                    hooks.onResume?.();
                    return;
                }
                if (run.phase === "explore") {
                    hooks.onUnlockLook?.();
                    setPhase("pause");
                }
                return;
            }
            if ((e.key === "e" || e.key === "E") && run.phase === "explore") {
                hooks.onInteract?.();
            }
        });

        window.addEventListener("dragover", (e) => {
            if ([...e.dataTransfer.items].some((it) => it.kind === "file")) e.preventDefault();
        });
        window.addEventListener("drop", (e) => {
            if (!e.dataTransfer.files?.length) return;
            e.preventDefault();
            hooks.onFiles?.(e.dataTransfer.files);
            toast("TRACKS ON THE DECK", "#00fff7");
        });

        applyReduced();
        setPhase("boot");
    }

    const MODAL = {
        about: `
            <p><strong>VIBE CHECK 9000™</strong> is a first-person club. No quiz. Walk in, talk to people, dance, drop your own music.</p>
            <p>WASD to move. SPACE on the floor to dance. E to talk. ESC for the deck.</p>
        `,
    };

    return {
        run,
        toast,
        wire,
        setPhase,
        get phase() { return run.phase; },
        get reducedFx() { return run.reducedFx; },
        setTipsy(v) {
            run.tipsy = !!v;
            const box = $("tipsyToggle");
            if (box) box.checked = run.tipsy;
            applyReduced();
        },
        get energy() { return run.energy; },
        set energy(v) { run.energy = v; },
        openTalk(npc) {
            run.talkNpc = npc;
            run.talkNode = "start";
            hooks.onUnlockLook?.();
            renderTalk();
        },
        setTalkNode(id) {
            run.talkNode = id;
            renderTalk();
        },
        closeTalk() {
            run.talkNpc = null;
            setPhase("explore");
            hooks.onResume?.();
        },
        get talkNpc() { return run.talkNpc; },
        get talkNode() { return run.talkNode; },
        renderTracks,
        openDeck() {
            hooks.onUnlockLook?.();
            setPhase("deck");
        },
        setInteract(text, show) {
            const el = $("interact");
            el.textContent = text;
            el.classList.toggle("hidden", !show);
        },
        setTelemetry({ bpm, track, energy, bass, x, z }) {
            if ($("hudBpm")) $("hudBpm").textContent = String(Math.round(bpm || 128));
            if ($("hudTrack")) $("hudTrack").textContent = String(track || "HOUSE SYSTEM").slice(0, 22);
            if ($("hudEnergy")) $("hudEnergy").textContent = String(Math.round(energy || 0));
            if ($("hudBass")) $("hudBass").textContent = `${Math.round((bass || 0) * 100)}%`;
            if ($("hudPos") && x != null) $("hudPos").textContent = `${x.toFixed(1)} ${z.toFixed(1)}`;
        },
        flashStrobe() {
            if (run.reducedFx) return;
            $("strobe").classList.add("flash");
            window.setTimeout(() => $("strobe").classList.remove("flash"), 70);
        },
        showFallback() {
            toast("NO WEBGL — the visor still wants a GPU", "#ff2e63");
        },
    };
}
