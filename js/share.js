/* Night stamp PNG. Canvas only. */

function wrapLine(g, text, x, y, max, lh) {
    const words = String(text || "").split(/\s+/);
    let line = "";
    let yy = y;
    let rows = 0;
    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (g.measureText(next).width > max && line) {
            g.fillText(line, x, yy);
            line = word;
            yy += lh;
            rows += 1;
            if (rows >= 3) break;
        } else line = next;
    }
    if (line && rows < 3) {
        g.fillText(line, x, yy);
        yy += lh;
    }
    return yy;
}

export function drawNightCard({
    clock = "10:00 PM",
    phase = "DOORS OPEN",
    zone = "THE FLOOR",
    setName = "HOUSE SYSTEM",
    lookName = "STOCK VISOR",
    energy = 0,
    visor = "#00fff7",
    headline = "",
    date = "NIGHT OF NOVEMBER 12, 1954",
    tag = "",
} = {}) {
    const w = 960;
    const h = 540;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#120814");
    bg.addColorStop(0.4, "#3a1830");
    bg.addColorStop(1, "#c47858");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = visor;
    g.lineWidth = 8;
    g.strokeRect(22, 22, w - 44, h - 44);
    g.strokeStyle = "rgba(255,231,168,0.35)";
    g.lineWidth = 1.5;
    g.strokeRect(34, 34, w - 68, h - 68);
    g.fillStyle = visor;
    g.font = "700 20px Georgia, serif";
    g.fillText("VIBE CHECK 9000™", 56, 78);
    g.fillStyle = "#ffe7a8";
    g.font = "700 15px Georgia, serif";
    g.fillText(date, 56, 104);
    g.fillStyle = "#ffffff";
    g.font = "800 64px Georgia, serif";
    g.fillText(clock, 56, 186);
    g.fillStyle = visor;
    g.font = "700 26px Georgia, serif";
    g.fillText(phase, 56, 228);
    g.fillStyle = "#e8e7ff";
    g.font = "600 20px Georgia, serif";
    g.fillText(`${zone}  ·  ${setName}`, 56, 268);
    if (tag) {
        g.fillStyle = "rgba(255,231,168,0.85)";
        g.font = "italic 16px Georgia, serif";
        g.fillText(tag, 56, 296);
    }
    if (headline) {
        g.fillStyle = "#ffe7a8";
        g.font = "700 18px Georgia, serif";
        wrapLine(g, headline, 56, 332, 620, 24);
    }
    const e = Math.max(0, Math.min(100, Number(energy) || 0));
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.fillRect(56, 400, 420, 10);
    g.fillStyle = visor;
    g.fillRect(56, 400, 420 * (e / 100), 10);
    g.fillStyle = "#e8e7ff";
    g.font = "600 16px Georgia, serif";
    g.fillText(`${lookName}  ·  ENERGY ${Math.round(e)}`, 56, 432);
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.font = "16px Georgia, serif";
    g.fillText("I was there. The visor remembers.", 56, 486);
    g.fillText("sebby1770.github.io/vibe-check-9000", 56, 510);
    g.fillStyle = visor;
    g.beginPath();
    g.arc(w - 90, 90, 18, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#ffe7a8";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(w - 90, 90, 26, 0, Math.PI * 2);
    g.stroke();
    return c;
}

export async function downloadCard(canvas, name = "vibe-check-9000-night.png") {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) { resolve(false); return; }
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = name;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1500);
            resolve(true);
        }, "image/png");
    });
}
