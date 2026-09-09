import { getNode, PHONE_LINES } from "./people.js";
import { LOOKS, getLook } from "./progress.js";
import { NPC_PHASE_LINES, PHASE_COPY } from "./night.js";
import { drawNightCard, downloadCard } from "./share.js";

const $ = (id) => document.getElementById(id);

export function createHud(hooks) {
    const run = {
        phase: "boot",
        prevPhase: "boot",
        entered: false,
        reducedFx: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        crowd: true,
        sensitivity: 1,
        fov: 82,
        muted: false,
        tipsy: false,
        talkNpc: null,
        talkNode: "start",
        energy: 0,
        zone: "club",
        seen: new Set(),
        phaseNight: "doors",
        clock: "10:00 PM",
        bill: null,
        unlocked: ["stock"],
        look: "stock",
        gazette: null,
    };

    function toast(msg, color) {
        const t = $("toast");
        t.textContent = msg;
        t.style.background = color || "#39ff14";
        t.classList.add("show");
        window.setTimeout(() => t.classList.remove("show"), 2600);
    }

    function setPhase(p) {
        if (p === "settings" || p === "deck" || p === "paper" || p === "wardrobe") {
            if (run.phase !== "settings" && run.phase !== "deck" && run.phase !== "paper" && run.phase !== "wardrobe") {
                run.prevPhase = run.phase === "talk" ? "explore" : run.phase;
            }
        }
        run.phase = p;
        $("boot").classList.toggle("hidden", p !== "boot");
        $("pause").classList.toggle("hidden", p !== "pause");
        $("talk").classList.toggle("hidden", p !== "talk");
        $("deck").classList.toggle("hidden", p !== "deck");
        $("settings").classList.toggle("hidden", p !== "settings");
        $("paper").classList.toggle("hidden", p !== "paper");
        $("wardrobe").classList.toggle("hidden", p !== "wardrobe");
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
        const flavor = NPC_PHASE_LINES[npc.id] && npc.nodes.start === node
            ? NPC_PHASE_LINES[npc.id][run.phaseNight]
            : null;
        $("talkLine").textContent = flavor || node.say;
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

    function applyLookCss(id) {
        const look = getLook(id);
        const root = document.documentElement.style;
        root.setProperty("--visor", look.visor);
        root.setProperty("--visor-left", look.left);
        root.setProperty("--visor-right", look.right);
        document.body.dataset.look = look.id;
        if ($("pauseLook")) $("pauseLook").textContent = look.name;
    }

    function renderLooks() {
        const el = $("lookList");
        if (!el) return;
        el.innerHTML = LOOKS.map((look) => {
            const on = run.unlocked.includes(look.id);
            const eq = run.look === look.id;
            return `<li class="${on ? "have" : "locked"} ${eq ? "eq" : ""}" data-look="${look.id}">
                <span class="swatch" style="background:${look.visor}"></span>
                <span><strong>${look.name}</strong><em>${on ? (eq ? "ON" : "TAP TO WEAR") : look.how}</em></span>
            </li>`;
        }).join("");
    }

    function openWardrobe() {
        renderLooks();
        hooks.onUnlockLook?.();
        setPhase("wardrobe");
    }

    function openPaper() {
        const g = run.gazette || {
            title: "MIDTOWN GAZETTE", date: "", headline: "", lede: "", columns: [],
        };
        $("paperTitle").textContent = g.title;
        $("paperDate").textContent = g.date;
        $("paperHeadline").textContent = g.headline;
        $("paperLede").textContent = g.lede;
        $("paperCols").innerHTML = (g.columns || []).map((c) => `<p>${c}</p>`).join("");
        hooks.onUnlockLook?.();
        setPhase("paper");
    }

    async function stampCard() {
        const look = getLook(run.look);
        const canvas = drawNightCard({
            clock: run.clock,
            phase: (PHASE_COPY[run.phaseNight] && PHASE_COPY[run.phaseNight].status) || (run.phaseNight || "doors").toUpperCase(),
            zone: $("hudZone") ? $("hudZone").textContent : "THE FLOOR",
            setName: run.bill?.set?.name || "HOUSE SYSTEM",
            lookName: look.name,
            energy: run.energy,
            visor: look.visor,
            headline: run.gazette?.headline || "",
            date: run.gazette?.date || "NIGHT OF NOVEMBER 12, 1954",
            tag: run.bill?.tag || "",
        });
        await downloadCard(canvas);
        toast("NIGHT STAMP SAVED", look.visor);
        hooks.onStamp?.();
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
        $("paperClose").addEventListener("click", leaveOverlay);
        $("pauseLookBtn").addEventListener("click", openWardrobe);
        $("settingsLookBtn").addEventListener("click", openWardrobe);
        $("wardrobeClose").addEventListener("click", leaveOverlay);
        $("pauseShareBtn").addEventListener("click", () => { stampCard(); });
        $("lookList")?.addEventListener("click", (e) => {
            const li = e.target.closest("li[data-look]");
            if (!li) return;
            const id = li.dataset.look;
            if (!run.unlocked.includes(id)) {
                toast(`LOCKED — ${getLook(id).how}`, "#ffb703");
                return;
            }
            run.look = id;
            applyLookCss(id);
            renderLooks();
            toast(`VISOR: ${getLook(id).name}`, getLook(id).visor);
            hooks.onLook?.(getLook(id));
        });
        $("muteBtn").addEventListener("click", () => {
            run.muted = hooks.onMute?.() ?? !run.muted;
            $("muteBtn").textContent = run.muted ? "UNMUTE" : "MUTE";
            $("muteToggle").checked = run.muted;
        });
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
            if (run.tipsy) toast("DRUNK — the room has a second opinion", "#ffb703");
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
                if (run.phase === "settings" || run.phase === "deck" || run.phase === "talk" || run.phase === "paper" || run.phase === "wardrobe") {
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
            <p><strong>VIBE CHECK 9000™</strong> is a first-person night in Midtown, November 12, 1954. The visor is from later. The street is not.</p>
            <p>WASD to move. SPACE on the tiles to dance. E to talk. Upstairs, E sits you on the banquette, chaise, or club chairs.</p>
            <p>Drop MP3 / WAV / FLAC on the DECK. Hail a Checker. Pet the cat. Read the Gazette. ION will get you drunk if you ask.</p>
            <p>The night moves from doors to last call. Earn visor looks. ESC → STAMP saves a night card. Tips keep the lights on.</p>
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
        openPaper,
        pickPhone() {
            const line = PHONE_LINES[Math.floor(Math.random() * PHONE_LINES.length)];
            toast(line, "#e0b25a");
        },
        setInteract(text, show) {
            const el = $("interact");
            el.textContent = text;
            el.classList.toggle("hidden", !show);
        },
        setZone(zone, label) {
            if (run.zone !== zone) {
                run.zone = zone;
                document.body.dataset.zone = zone;
                if ($("hudZone")) $("hudZone").textContent = label;
                if ($("statusPlace")) $("statusPlace").textContent = label;
                if (!run.seen.has(zone)) {
                    run.seen.add(zone);
                    if (run.entered) toast(label, zone === "alley" ? "#39ff14" : zone === "street" ? "#ffb25a" : "#00fff7");
                }
            } else if ($("hudZone")) {
                $("hudZone").textContent = label;
            }
        },
        setTelemetry({ bpm, track, energy, bass, clock }) {
            if ($("hudBpm")) $("hudBpm").textContent = String(Math.round(bpm || 128));
            if ($("hudTrack")) $("hudTrack").textContent = String(track || "HOUSE SYSTEM").slice(0, 22);
            if ($("hudEnergy")) $("hudEnergy").textContent = String(Math.round(energy || 0));
            if ($("hudBass")) $("hudBass").textContent = `${Math.round((bass || 0) * 100)}%`;
            if (clock && $("hudClock")) $("hudClock").textContent = clock;
            run.energy = energy || 0;
        },
        flashStrobe() {
            if (run.reducedFx) return;
            $("strobe").classList.add("flash");
            window.setTimeout(() => $("strobe").classList.remove("flash"), 70);
        },
        showFallback() {
            toast("NO WEBGL — the visor still wants a GPU", "#ff2e63");
        },
        setRide(on) {
            $("ride").classList.toggle("hidden", !on);
        },
        setBill(bill) {
            run.bill = bill;
            if (bill?.gazette) run.gazette = bill.gazette;
            if ($("bootSet") && bill?.set) $("bootSet").textContent = bill.set.name;
            if ($("bootBill") && bill?.tag) $("bootBill").textContent = bill.tag;
            if ($("bootSub") && bill?.set) $("bootSub").textContent = bill.set.name;
            if ($("bootHeadline") && bill?.gazette) $("bootHeadline").textContent = bill.gazette.headline;
        },
        setNight({ clock, phase, copy }) {
            run.clock = clock;
            run.phaseNight = phase;
            document.body.dataset.night = phase || "doors";
            if ($("hudClock")) $("hudClock").textContent = clock;
            if ($("hudPhase")) $("hudPhase").textContent = (copy && copy.status) || phase;
            if ($("pauseClock")) $("pauseClock").textContent = `${clock}  ·  ${(copy && copy.status) || phase}`;
            if ($("pauseBill") && run.bill?.set) {
                $("pauseBill").textContent = `${run.bill.set.name} — ${run.bill.tag}. ${copy?.status || ""}.`;
            }
            if ($("pauseLook")) $("pauseLook").textContent = getLook(run.look).name;
        },
        setProgress({ unlocked, look }) {
            if (unlocked) run.unlocked = unlocked;
            if (look) {
                run.look = look;
                applyLookCss(look);
            }
            renderLooks();
        },
        unlockToast(id) {
            const look = getLook(id);
            toast(`UNLOCKED ${look.name}`, look.visor);
        },
        stampCard,
        openWardrobe,
    };
}
