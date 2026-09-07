import {
    QUESTIONS,
    VIBES,
    ACHIEVEMENTS,
    REPO_URL,
    PROFILE_URL,
    LIVE_URL,
    STORAGE_KEYS,
    createScanResult,
    encodeResult,
    encodeQuery,
    parseShareLocation,
    evaluateUnlocks,
} from "./engine.js";

const $ = (id) => document.getElementById(id);

function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveJson(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

function drawRadar(stats, color) {
    const canvas = document.getElementById("radarChart");
    if (!canvas || !stats) return;
    const width = 280;
    const height = 240;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = width / 2;
    const cy = height / 2 + 8;
    const radius = Math.min(width, height) / 2 - 36;
    const axes = [
        { label: "CHAOS", value: stats.chaos },
        { label: "CHARM", value: stats.charm },
        { label: "COSMIC", value: stats.cosmic },
        { label: "STATIC", value: stats.static },
    ];
    const angleFor = (i) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    c.clearRect(0, 0, width, height);
    c.strokeStyle = "rgba(0, 255, 247, 0.28)";
    c.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring++) {
        c.beginPath();
        for (let i = 0; i <= axes.length; i++) {
            const angle = angleFor(i % axes.length);
            const r = (radius * ring) / 4;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
        }
        c.stroke();
    }
    axes.forEach((axis, i) => {
        const angle = angleFor(i);
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        c.stroke();
        c.fillStyle = "#00fff7";
        c.font = "10px Orbitron, monospace";
        c.textAlign = "center";
        c.fillText(
            axis.label,
            cx + Math.cos(angle) * (radius + 18),
            cy + Math.sin(angle) * (radius + 18),
        );
    });
    c.beginPath();
    axes.forEach((axis, i) => {
        const angle = angleFor(i);
        const r = radius * (axis.value / 100);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
    });
    c.closePath();
    c.fillStyle = color;
    c.globalAlpha = 0.32;
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.stroke();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, align = "left") {
    const words = String(text).split(" ");
    let line = "";
    ctx.textAlign = align;
    for (let n = 0; n < words.length; n++) {
        const testLine = `${line}${words[n]} `;
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, y);
            line = `${words[n]} `;
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, y);
}

export function createHud(hooks) {
    const persist = {
        history: loadJson(STORAGE_KEYS.history, []),
        scanCount: Number.parseInt(localStorage.getItem(STORAGE_KEYS.scanCount) || "0", 10) || 0,
        achievements: loadJson(STORAGE_KEYS.achievements, []),
        seenVibes: loadJson(STORAGE_KEYS.seen, []),
    };

    const run = {
        answers: [],
        qIndex: 0,
        startedAt: 0,
        current: null,
        phase: "boot",
        reducedFx: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        crowd: true,
        sensitivity: 1,
        fov: 88,
        muted: false,
        shuffled: [],
        entered: false,
        prevPhase: "boot",
    };

    function toast(msg, color) {
        const t = $("toast");
        t.textContent = msg;
        t.style.background = color || "#39ff14";
        t.classList.add("show");
        window.setTimeout(() => t.classList.remove("show"), 2400);
    }

    function unlockFlags(flags, extra = {}) {
        const { achievements, freshly } = evaluateUnlocks({
            achievements: persist.achievements,
            scanCount: persist.scanCount,
            seenVibes: persist.seenVibes,
            stats: extra.stats || null,
            elapsedMs: extra.elapsedMs,
            flags,
        });
        persist.achievements = achievements;
        saveJson(STORAGE_KEYS.achievements, persist.achievements);
        for (const id of freshly) {
            const ach = ACHIEVEMENTS.find((a) => a.id === id);
            if (ach) toast(`UNLOCKED: ${ach.name}`, "#fff700");
        }
        renderAchievements();
        return freshly;
    }

    function shareUrl(result) {
        const token = encodeResult(result);
        const q = encodeQuery(result);
        const base = location.protocol === "file:" ? LIVE_URL : location.origin + location.pathname;
        return `${base}?${q}#vibe=${token}`;
    }

    function setPhase(p) {
        if (p === "settings" && run.phase !== "settings") {
            run.prevPhase = run.phase === "drop" ? "explore" : run.phase;
        }
        run.phase = p;
        $("boot").classList.toggle("hidden", p !== "boot");
        $("pause").classList.toggle("hidden", p !== "pause");
        $("quiz").classList.toggle("hidden", p !== "quiz");
        $("result").classList.toggle("hidden", p !== "result");
        $("settings").classList.toggle("hidden", p !== "settings");
        $("prompt").classList.toggle("hidden", p !== "explore");
        $("crosshair").classList.toggle("hidden", p !== "explore");
        $("dropMsg").classList.toggle("hidden", p !== "drop");
        document.body.dataset.phase = p;
        if (p === "boot" || p === "pause" || p === "quiz" || p === "result" || p === "settings" || p === "drop") {
            hooks.onOverlay?.(true);
        } else {
            hooks.onOverlay?.(false);
        }
    }

    function renderAchievements() {
        $("achList").innerHTML = ACHIEVEMENTS.map((a) => {
            const on = persist.achievements.includes(a.id);
            return `<div class="ach ${on ? "unlocked" : ""}" title="${a.name}: ${a.desc}">${on ? a.icon : "?"}</div>`;
        }).join("");
        $("achListPause").innerHTML = $("achList").innerHTML;
    }

    function renderHistory() {
        const html = persist.history.length
            ? persist.history.map((h) =>
                `<li><span class="vibe-name">${h.badge || "VX"} ${h.title}</span><span>${h.date}</span></li>`
            ).join("")
            : '<li class="empty">no prior vibes detected</li>';
        $("historyList").innerHTML = html;
        $("historyListPause").innerHTML = html;
    }

    function showQuestion() {
        const q = QUESTIONS[run.qIndex];
        $("qNum").textContent = String(run.qIndex + 1);
        $("qTotal").textContent = String(QUESTIONS.length);
        $("qBar").style.width = `${(run.qIndex / QUESTIONS.length) * 100}%`;
        $("qPrompt").textContent = q.prompt;
        run.shuffled = [...q.opts].sort(() => Math.random() - 0.5);
        const opts = $("qOptions");
        opts.innerHTML = "";
        run.shuffled.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.className = "q-option";
            btn.type = "button";
            btn.innerHTML = `<span class="q-key">${i + 1}</span><span>${opt.text}</span>`;
            btn.addEventListener("click", () => answer(opt));
            opts.appendChild(btn);
        });
        setPhase("quiz");
        $("qOptions").querySelector("button")?.focus();
    }

    function answer(opt) {
        run.answers.push(opt);
        run.qIndex += 1;
        hooks.onAnswer?.(opt);
        if (run.qIndex < QUESTIONS.length) {
            showQuestion();
        } else {
            $("qBar").style.width = "100%";
            const result = createScanResult(run.answers);
            finish(result);
        }
    }

    async function finish(result) {
        setPhase("drop");
        await hooks.onDrop?.(result);
        showResult(result, { save: true });
    }

    function showResult(result, { save } = {}) {
        run.current = result;
        $("resultBadge").textContent = result.badge;
        $("resultTitle").textContent = result.title;
        $("resultTitle").style.color = result.color;
        $("resultDesc").textContent = result.desc;
        $("signatureItem").textContent = result.item;
        $("vibeColor").textContent = result.color;
        $("vibeColor").style.color = result.color;
        $("vibePair").textContent = result.pair;
        $("vibeAvoid").textContent = result.avoid;
        $("vibeProphecy").textContent = result.prophecy;
        $("reportId").textContent = result.reportId || "000000";
        $("shareUrl").textContent = shareUrl(result);

        const pairs = [
            ["Chaos", result.stats.chaos],
            ["Charm", result.stats.charm],
            ["Cosmic", result.stats.cosmic],
            ["Static", result.stats.static],
        ];
        for (const [name, value] of pairs) {
            $(`stat${name}`).style.width = `${value}%`;
            $(`stat${name}`).style.background = result.color;
            $(`stat${name}Val`).textContent = `${value}%`;
        }
        drawRadar(result.stats, result.color);

        if (save) {
            persist.scanCount += 1;
            persist.history.unshift({
                title: result.title,
                badge: result.badge,
                date: new Date(result.generatedAt).toLocaleDateString(),
            });
            persist.history = persist.history.slice(0, 5);
            saveJson(STORAGE_KEYS.history, persist.history);
            localStorage.setItem(STORAGE_KEYS.scanCount, String(persist.scanCount));
            if (!persist.seenVibes.includes(result.id)) persist.seenVibes.push(result.id);
            saveJson(STORAGE_KEYS.seen, persist.seenVibes);
            const elapsed = run.startedAt ? Date.now() - run.startedAt : null;
            unlockFlags({}, { stats: result.stats, elapsedMs: elapsed });
        }

        renderHistory();
        renderAchievements();
        setPhase("result");
        hooks.onResult?.(result);
        $("shareBtn")?.focus();
    }

    function savePng() {
        const result = run.current;
        if (!result) {
            toast("RUN A SCAN FIRST");
            return;
        }
        const card = document.createElement("canvas");
        const width = 1200;
        const height = 675;
        card.width = width;
        card.height = height;
        const c = card.getContext("2d");
        const gradient = c.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#07020d");
        gradient.addColorStop(0.48, "#18052e");
        gradient.addColorStop(1, "#001f2f");
        c.fillStyle = gradient;
        c.fillRect(0, 0, width, height);
        c.strokeStyle = "rgba(0, 255, 247, 0.22)";
        c.lineWidth = 1;
        for (let x = 0; x < width; x += 42) {
            c.beginPath(); c.moveTo(x, 0); c.lineTo(x, height); c.stroke();
        }
        for (let y = 0; y < height; y += 42) {
            c.beginPath(); c.moveTo(0, y); c.lineTo(width, y); c.stroke();
        }
        c.strokeStyle = result.color;
        c.lineWidth = 6;
        c.strokeRect(50, 45, width - 100, height - 90);
        c.strokeStyle = "#00fff7";
        c.lineWidth = 2;
        c.strokeRect(70, 65, width - 140, height - 130);
        c.fillStyle = result.color;
        c.font = "900 84px Orbitron, monospace";
        c.textAlign = "center";
        c.fillText(result.badge, width / 2, 155);
        c.fillStyle = "#e0e0ff";
        c.font = "700 30px Orbitron, monospace";
        c.fillText("VIBE CHECK 9000™ DIAGNOSIS", width / 2, 210);
        c.fillStyle = "#39ff14";
        c.font = "900 48px Orbitron, monospace";
        wrapCanvasText(c, result.title, width / 2, 280, 940, 54, "center");
        c.fillStyle = "#e0e0ff";
        c.font = "22px Space Mono, monospace";
        wrapCanvasText(c, result.desc, width / 2, 385, 880, 32, "center");
        const stats = [
            ["CHAOS", result.stats.chaos],
            ["CHARM", result.stats.charm],
            ["COSMIC", result.stats.cosmic],
            ["STATIC", result.stats.static],
        ];
        stats.forEach(([label, value], index) => {
            const x = 170 + index * 225;
            c.fillStyle = "#00fff7";
            c.font = "700 20px Space Mono, monospace";
            c.fillText(label, x, 545);
            c.strokeStyle = "rgba(0, 255, 247, 0.55)";
            c.strokeRect(x - 75, 565, 150, 16);
            c.fillStyle = result.color;
            c.fillRect(x - 75, 565, 1.5 * value, 16);
            c.fillStyle = "#fff700";
            c.font = "700 22px Space Mono, monospace";
            c.fillText(`${value}%`, x, 617);
        });
        c.fillStyle = "#6e6c8b";
        c.font = "18px Space Mono, monospace";
        c.fillText(REPO_URL, width / 2, 648);
        const a = document.createElement("a");
        a.href = card.toDataURL("image/png");
        a.download = `vibe-check-${result.id}-${Date.now()}.png`;
        a.click();
        toast("PNG REPORT DOWNLOADED");
    }

    async function shareCurrent() {
        if (!run.current) {
            toast("RUN A SCAN FIRST");
            return;
        }
        const url = shareUrl(run.current);
        const text = `VIBE CHECK 9000™ diagnosed me as: ${run.current.title}. ${run.current.desc}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: `My vibe: ${run.current.title}`, text, url });
                return;
            } catch (error) {
                if (error.name === "AbortError") return;
            }
        }
        copyText(`${text}\n${url}`, "RESULT COPIED TO CLIPBOARD");
    }

    async function copyText(text, message) {
        try {
            await navigator.clipboard.writeText(text);
            toast(message || "COPIED");
        } catch {
            toast("COPY FAILED. THE TERMINAL IS BEING DRAMATIC", "#ff2e63");
        }
    }

    function beginQuiz() {
        run.answers = [];
        run.qIndex = 0;
        run.startedAt = Date.now();
        run.current = null;
        hooks.onQuizStart?.();
        showQuestion();
    }

    function leaveSettings() {
        setPhase(run.prevPhase || (run.entered ? "explore" : "boot"));
        if (run.phase === "explore") hooks.onResume?.();
    }

    function enterClub() {
        run.entered = true;
        unlockFlags({ rave: true });
        setPhase("explore");
        hooks.onEnter?.();
    }

    function applyReduced() {
        document.documentElement.classList.toggle("reduced-fx", run.reducedFx);
        hooks.onSettings?.({
            reduced: run.reducedFx,
            crowd: run.crowd,
            sensitivity: run.sensitivity,
            fov: run.fov,
            muted: run.muted,
        });
    }

    function wire() {
        $("enterBtn").addEventListener("click", enterClub);
        $("skipBtn").addEventListener("click", () => {
            run.entered = true;
            unlockFlags({ rave: true });
            hooks.onEnter?.({ skipLock: true });
            beginQuiz();
        });
        $("startScanBtn").addEventListener("click", beginQuiz);
        $("resumeBtn").addEventListener("click", () => {
            setPhase("explore");
            hooks.onResume?.();
        });
        $("pauseSettingsBtn").addEventListener("click", () => setPhase("settings"));
        $("settingsBtn").addEventListener("click", () => {
            hooks.onUnlockLook?.();
            setPhase("settings");
        });
        $("settingsClose").addEventListener("click", leaveSettings);
        $("rescanBtn").addEventListener("click", () => {
            history.replaceState(null, "", location.pathname);
            run.current = null;
            hooks.onRescan?.();
            setPhase("explore");
        });
        $("shareBtn").addEventListener("click", shareCurrent);
        $("saveBtn").addEventListener("click", savePng);
        $("copyLinkBtn").addEventListener("click", () => {
            if (!run.current) {
                toast("RUN A SCAN FIRST");
                return;
            }
            copyText(shareUrl(run.current), "RESULT LINK COPIED");
        });
        $("exitLockBtn").addEventListener("click", () => {
            hooks.onUnlockLook?.();
            toast("POINTER LOCK RELEASED");
        });
        $("muteBtn").addEventListener("click", () => {
            run.muted = hooks.onMute?.() ?? !run.muted;
            $("muteBtn").textContent = run.muted ? "UNMUTE" : "MUTE";
            $("muteToggle").checked = run.muted;
        });
        $("pauseMuteBtn").addEventListener("click", () => $("muteBtn").click());

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

        $("fxToggle").checked = run.reducedFx;
        $("crowdToggle").checked = true;
        $("muteToggle").checked = run.reducedFx;
        if (run.reducedFx) {
            run.muted = true;
            $("muteBtn").textContent = "UNMUTE";
        }

        document.querySelectorAll("[data-modal]").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                $("modalTitle").textContent = link.dataset.modal;
                $("modalBody").innerHTML = MODAL[link.dataset.modal] || "";
                $("modalBg").classList.add("active");
            });
        });
        $("modalClose").addEventListener("click", () => $("modalBg").classList.remove("active"));
        $("modalBg").addEventListener("click", (e) => {
            if (e.target === $("modalBg")) $("modalBg").classList.remove("active");
        });

        const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
        let konamiIdx = 0;
        let typed = "";

        window.addEventListener("keydown", (e) => {
            if (run.phase === "quiz" && /^[1-5]$/.test(e.key)) {
                const option = $("qOptions").children[Number(e.key) - 1];
                if (option) {
                    option.click();
                    return;
                }
            }

            if (e.key === "Escape") {
                $("modalBg").classList.remove("active");
                if (run.phase === "settings") {
                    leaveSettings();
                    return;
                }
                if (run.phase === "quiz" || run.phase === "result") return;
                if (run.phase === "pause") {
                    setPhase("explore");
                    hooks.onResume?.();
                    return;
                }
                if (run.phase === "explore" || run.phase === "drop") {
                    hooks.onUnlockLook?.();
                    setPhase("pause");
                }
                return;
            }

            if (e.key === "e" || e.key === "E") {
                if (run.phase === "explore") hooks.onInteract?.();
            }

            if (e.key === KONAMI[konamiIdx]) {
                konamiIdx += 1;
                if (konamiIdx === KONAMI.length) {
                    unlockFlags({ konami: true, rave: true });
                    document.body.classList.toggle("rave");
                    toast("RAVE MODE: ENGAGED", "#ff00ff");
                    konamiIdx = 0;
                }
            } else if (e.key.startsWith("Arrow") || e.key === "b" || e.key === "a") {
                konamiIdx = 0;
            }

            if (e.key.length === 1) {
                typed = (typed + e.key.toLowerCase()).slice(-10);
                if (typed.endsWith("vibe")) toast("VIBES DETECTED", "#39ff14");
            }
        });

        renderHistory();
        renderAchievements();
        applyReduced();
        setPhase("boot");
        const bootParams = new URLSearchParams(location.search);
        if (bootParams.has("skip")) {
            window.setTimeout(() => $("skipBtn").click(), 80);
        } else if (bootParams.has("enter")) {
            window.setTimeout(() => $("enterBtn").click(), 80);
        }
    }

    const MODAL = {
        about: `
            <p><strong>VIBE CHECK 9000™</strong> is a first-person nightclub personality scanner with more confidence than evidence.</p>
            <p>Walk the warehouse, hit the scanner kiosk, and let illegal LEDs diagnose you.</p>
            <p>Built by <a href="${PROFILE_URL}" target="_blank" rel="noreferrer">Sebby1770</a> — <a href="${REPO_URL}" target="_blank" rel="noreferrer">source on GitHub</a>.</p>
        `,
        science: `
            <p><strong>THE METHODOLOGY:</strong></p>
            <p>1. Nine questions. Four stats: CHAOS, CHARM, COSMIC, STATIC.</p>
            <p>2. Averages of option scores, then a proprietary vibe match also known as JavaScript with feelings.</p>
            <p>3. The club recolors itself to your result because the lighting board has opinions.</p>
        `,
        legal: `
            <p><strong>TERMS OF VIBING:</strong></p>
            <p>Results are not valid in court, therapy, hiring, dating, banking, or interdimensional arbitration.</p>
            <p>Do not base life choices on this visor. It is wearing sunglasses indoors.</p>
        `,
    };

    return {
        persist,
        run,
        toast,
        wire,
        enterClub,
        beginQuiz,
        showResult,
        setPhase,
        unlockFlags,
        shareUrl,
        get phase() { return run.phase; },
        get reducedFx() { return run.reducedFx; },
        setTelemetry({ bpm, heading, x, z, bass }) {
            const bpmEl = $("hudBpm");
            if (!bpmEl) return;
            bpmEl.textContent = String(Math.round(bpm || 128));
            $("hudHdg").textContent = String(heading).padStart(3, "0");
            $("hudPos").textContent = `${x.toFixed(1)} ${z.toFixed(1)}`;
            $("hudBass").textContent = `${Math.round((bass || 0) * 100)}%`;
            const now = new Date();
            $("hudClk").textContent = now.toLocaleTimeString("en-GB", { hour12: false });
        },
        setInteract(text, show) {
            const el = $("interact");
            el.textContent = text;
            el.classList.toggle("hidden", !show);
        },
        flashStrobe() {
            if (run.reducedFx) return;
            $("strobe").classList.add("flash");
            window.setTimeout(() => $("strobe").classList.remove("flash"), 70);
        },
        loadShared() {
            const shared = parseShareLocation(location.search, location.hash);
            if (shared) {
                showResult(shared, { save: false });
                toast("SHARED VIBE LOADED");
                return shared;
            }
            return null;
        },
        showFallback() {
            $("boot-sub").textContent = "WEBGL UNAVAILABLE — 2D SCANNER MODE";
            $("enterBtn").classList.add("hidden");
            $("skipBtn").textContent = "START SCAN";
            $("skipBtn").focus();
        },
        VIBES,
        QUESTIONS,
    };
}
