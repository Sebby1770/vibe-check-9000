import * as THREE from "three";

function canvasTex(draw, size = 256, repeatX = 1, repeatY = 1) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    draw(c.getContext("2d"), size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
}

export function brickTex(mortar = "#2a1c18", brick = "#6a3a32", size = 512) {
    return canvasTex((g, s) => {
        g.fillStyle = mortar;
        g.fillRect(0, 0, s, s);
        const rows = 8;
        const cols = 4;
        const bh = s / rows;
        const bw = s / cols;
        for (let r = 0; r < rows; r++) {
            const off = r % 2 ? bw / 2 : 0;
            const header = r % 4 === 3;
            for (let c = -1; c < cols + 1; c++) {
                const jitter = ((r * 13 + c * 7) % 5) - 2;
                const burnt = (r * 11 + c * 5) % 13 === 0;
                g.fillStyle = shade(brick, jitter * 7 + (header ? -18 : 0) + (burnt ? -28 : 0));
                g.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
                g.fillStyle = "rgba(255,220,180,0.07)";
                g.fillRect(c * bw + off + 4, r * bh + 3, bw * 0.35, 3);
            }
        }
    }, size, 6, 10);
}

export function darkBrickTex() {
    return brickTex("#1a1210", "#3a2420", 256);
}

export function asphaltTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#1a1a1e";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 2200; i++) {
            const n = Math.random();
            g.fillStyle = `rgba(${36 + n * 50},${40 + n * 46},${48 + n * 52},${0.12 + n * 0.32})`;
            g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
        }
        g.fillStyle = "rgba(180,200,220,0.07)";
        for (let i = 0; i < 40; i++) {
            g.beginPath();
            g.ellipse(Math.random() * s, Math.random() * s, 18 + Math.random() * 24, 6 + Math.random() * 10, Math.random(), 0, Math.PI * 2);
            g.fill();
        }
        g.strokeStyle = "rgba(180,160,80,0.35)";
        g.lineWidth = 6;
        g.setLineDash([18, 16]);
        g.beginPath();
        g.moveTo(s * 0.5, 0);
        g.lineTo(s * 0.5, s);
        g.stroke();
    }, 512, 8, 2);
}

export function sidewalkTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#3a3a40";
        g.fillRect(0, 0, s, s);
        g.strokeStyle = "#2a2a30";
        g.lineWidth = 3;
        g.strokeRect(2, 2, s - 4, s - 4);
        g.strokeRect(s / 2, 2, 1, s - 4);
        g.strokeRect(2, s / 2, s - 4, 1);
        for (let i = 0; i < 140; i++) {
            g.fillStyle = `rgba(0,0,0,${Math.random() * 0.18})`;
            g.fillRect(Math.random() * s, Math.random() * s, 8, 2);
        }
        g.fillStyle = "rgba(200,210,220,0.05)";
        for (let i = 0; i < 18; i++) g.fillRect(Math.random() * s, Math.random() * s, 22, 3);
    }, 512, 4, 4);
}

export function windowPaneTex(kind = "on") {
    const lit = kind !== "off";
    const warm = kind === "warm";
    const pane = !lit ? "#14161c" : warm ? "#ffb060" : "#ffe2a4";
    const tex = canvasTex((g, s) => {
        g.fillStyle = "#2a221c";
        g.fillRect(0, 0, s, s);
        g.fillStyle = "#4a3a32";
        g.fillRect(6, 6, s - 12, s - 12);
        const wall = warm ? "#6a3a28" : lit ? "#4a4038" : "#1a1c22";
        g.fillStyle = wall;
        g.fillRect(18, 18, s - 36, s - 36);
        if (lit) {
            const grd = g.createLinearGradient(18, 18, s - 18, s - 18);
            grd.addColorStop(0, pane);
            grd.addColorStop(1, warm ? "#c86830" : "#d8a060");
            g.fillStyle = grd;
            g.fillRect(22, 22, s - 44, s - 44);
            g.fillStyle = "rgba(40,24,16,0.45)";
            g.fillRect(22, 22, 28, s - 44);
            g.fillStyle = "rgba(90,50,36,0.5)";
            for (let i = 0; i < 7; i++) g.fillRect(24, 26 + i * 14, 22, 5);
            g.fillStyle = "rgba(255,236,190,0.55)";
            g.beginPath();
            g.arc(s * 0.66, s * 0.58, 18, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "rgba(255,210,140,0.35)";
            g.beginPath();
            g.arc(s * 0.66, s * 0.58, 28, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "rgba(24,14,10,0.35)";
            g.fillRect(s * 0.5, s * 0.5, 36, 42);
            g.fillStyle = "rgba(30,18,12,0.4)";
            g.beginPath();
            g.moveTo(s * 0.72, s - 28);
            g.lineTo(s * 0.8, s * 0.62);
            g.lineTo(s * 0.88, s - 28);
            g.fill();
        } else {
            g.fillStyle = "rgba(70,80,96,0.16)";
            g.fillRect(22, 22, s - 44, s - 44);
            g.fillStyle = "rgba(20,16,14,0.55)";
            g.fillRect(22, 22, s - 44, s - 44);
            g.fillStyle = "rgba(180,190,210,0.08)";
            g.fillRect(40, 30, 18, 70);
        }
        g.fillStyle = "#1c1614";
        g.fillRect(s / 2 - 5, 14, 10, s - 28);
        g.fillRect(16, s / 2 - 5, s - 32, 10);
        g.strokeStyle = "#5a4a40";
        g.lineWidth = 8;
        g.strokeRect(14, 14, s - 28, s - 28);
        g.fillStyle = "#3a3028";
        g.fillRect(10, s - 22, s - 20, 12);
        g.strokeStyle = "#1a1410";
        g.lineWidth = 12;
        g.strokeRect(4, 4, s - 8, s - 8);
    }, 256, 1, 1);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, 1);
    return tex;
}

export function stoneTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#6a5a48";
        g.fillRect(0, 0, s, s);
        const rows = 5;
        const cols = 3;
        const bh = s / rows;
        const bw = s / cols;
        for (let r = 0; r < rows; r++) {
            const off = r % 2 ? bw / 2 : 0;
            for (let c = -1; c < cols + 1; c++) {
                const jitter = ((r * 9 + c * 4) % 7) - 3;
                g.fillStyle = shade("#c4b496", jitter * 5);
                g.fillRect(c * bw + off + 3, r * bh + 3, bw - 6, bh - 6);
                g.fillStyle = "rgba(255,240,210,0.12)";
                g.fillRect(c * bw + off + 6, r * bh + 5, bw * 0.4, 4);
                g.fillStyle = "rgba(40,30,20,0.12)";
                g.fillRect(c * bw + off + bw * 0.45, r * bh + bh * 0.45, bw * 0.4, bh * 0.35);
            }
        }
    }, 256, 4, 6);
}

export function plasterTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#c9b79a";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 400; i++) {
            g.fillStyle = `rgba(80,60,40,${Math.random() * 0.08})`;
            g.fillRect(Math.random() * s, Math.random() * s, 3, 3);
        }
    }, 128, 4, 4);
}

export function woodTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#3a2418";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 18; i++) {
            g.strokeStyle = `rgba(20,10,6,${0.15 + Math.random() * 0.2})`;
            g.lineWidth = 2 + Math.random() * 3;
            g.beginPath();
            g.moveTo(0, i * (s / 18));
            g.bezierCurveTo(s * 0.3, i * (s / 18) + 4, s * 0.7, i * (s / 18) - 4, s, i * (s / 18));
            g.stroke();
        }
    }, 128, 2, 4);
}

export function carpetTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#4a1420";
        g.fillRect(0, 0, s, s);
        g.strokeStyle = "rgba(200,160,70,0.35)";
        g.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const x = i * (s / 4) + s / 8;
                const y = j * (s / 4) + s / 8;
                g.beginPath();
                g.moveTo(x, y - 18);
                g.lineTo(x + 14, y);
                g.lineTo(x, y + 18);
                g.lineTo(x - 14, y);
                g.closePath();
                g.stroke();
            }
        }
    }, 256, 6, 6);
}

export function damaskTex() {
    return canvasTex((g, s) => {
        g.fillStyle = "#5a2030";
        g.fillRect(0, 0, s, s);
        g.fillStyle = "rgba(180,120,60,0.18)";
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                g.beginPath();
                g.arc(i * 44 + 20, j * 44 + 20, 10, 0, Math.PI * 2);
                g.fill();
            }
        }
    }, 256, 3, 3);
}

export function checkerTex() {
    return canvasTex((g, s) => {
        const n = 8;
        const w = s / n;
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                g.fillStyle = (x + y) % 2 ? "#111111" : "#f5c518";
                g.fillRect(x * w, y * w, w, w);
            }
        }
    }, 128, 4, 1);
}

function shade(hex, d) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + d));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + d));
    const b = Math.max(0, Math.min(255, (n & 255) + d));
    return `rgb(${r},${g},${b})`;
}

export function gazetteTex() {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 640;
    const g = c.getContext("2d");
    g.fillStyle = "#d8c9a4";
    g.fillRect(0, 0, 512, 640);
    g.fillStyle = "#1a120c";
    g.font = "bold 42px Georgia, serif";
    g.textAlign = "center";
    g.fillText("MIDTOWN GAZETTE", 256, 58);
    g.font = "16px Georgia, serif";
    g.fillText("FRIDAY, NOVEMBER 12, 1954   FIVE CENTS", 256, 86);
    g.fillRect(24, 98, 464, 3);
    g.font = "bold 28px Georgia, serif";
    g.textAlign = "left";
    wrap(g, "ILLEGAL LEDS IN 47TH ST. BASEMENT", 28, 140, 456, 32);
    g.font = "16px Georgia, serif";
    wrap(g, "A nightclub that refuses the decade. Rain continues. Pie prices stable. Officer declines comment.", 28, 240, 456, 22);
    g.fillRect(28, 340, 200, 8);
    g.fillRect(28, 360, 180, 8);
    g.fillRect(28, 380, 210, 8);
    g.fillRect(260, 340, 200, 8);
    g.fillRect(260, 360, 170, 8);
    g.fillRect(260, 380, 190, 8);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function wrap(g, text, x, y, maxW, lh) {
    const words = text.split(" ");
    let line = "";
    let yy = y;
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (g.measureText(test).width > maxW) {
            g.fillText(line, x, yy);
            line = w;
            yy += lh;
        } else line = test;
    }
    if (line) g.fillText(line, x, yy);
}
