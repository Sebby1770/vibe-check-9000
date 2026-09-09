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
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
}

export function brickTex(mortar = "#2a1c18", brick = "#6a3a32", size = 256) {
    return canvasTex((g, s) => {
        g.fillStyle = mortar;
        g.fillRect(0, 0, s, s);
        const rows = 8;
        const cols = 4;
        const bh = s / rows;
        const bw = s / cols;
        for (let r = 0; r < rows; r++) {
            const off = r % 2 ? bw / 2 : 0;
            for (let c = -1; c < cols + 1; c++) {
                const jitter = ((r * 13 + c * 7) % 5) - 2;
                g.fillStyle = shade(brick, jitter * 6);
                g.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
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
        for (let i = 0; i < 1200; i++) {
            const n = Math.random();
            g.fillStyle = `rgba(${40 + n * 40},${40 + n * 40},${44 + n * 40},${0.15 + n * 0.25})`;
            g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
        }
        g.strokeStyle = "rgba(180,160,80,0.35)";
        g.lineWidth = 6;
        g.setLineDash([18, 16]);
        g.beginPath();
        g.moveTo(s * 0.5, 0);
        g.lineTo(s * 0.5, s);
        g.stroke();
    }, 256, 8, 2);
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
        for (let i = 0; i < 80; i++) {
            g.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
            g.fillRect(Math.random() * s, Math.random() * s, 8, 2);
        }
    }, 256, 4, 4);
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
