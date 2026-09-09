import * as THREE from "three";

export const unitBox = new THREE.BoxGeometry(1, 1, 1);

export function addBox(parent, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
}

export function neonCanvas(text, color, w = 1024, h = 256, bg = "#08060a") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = color;
    g.lineWidth = Math.max(4, h / 28);
    g.strokeRect(12, 12, w - 24, h - 24);
    g.font = `800 ${Math.floor(h * 0.42)}px Georgia, serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = color;
    g.shadowBlur = 22;
    g.fillStyle = color;
    g.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

export function marqueeCanvas(line1, line2, w = 1024, h = 320) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = "#140c08";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1a100c";
    g.fillRect(16, 16, w - 32, h - 32);
    g.strokeStyle = "#e0b25a";
    g.lineWidth = 6;
    g.strokeRect(24, 24, w - 48, h - 48);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = "#ffb25a";
    g.shadowBlur = 18;
    g.fillStyle = "#ffe7a8";
    g.font = "800 92px Georgia, serif";
    g.fillText(line1, w / 2, h * 0.4);
    g.font = "700 48px Georgia, serif";
    g.fillStyle = "#ff6b6b";
    g.fillText(line2, w / 2, h * 0.7);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

export function makeCubeEnv() {
    const faces = ["#3a2218", "#1a2438", "#241818", "#2a2014", "#4a3428", "#0a0a12"];
    const images = faces.map((hex) => {
        const c = document.createElement("canvas");
        c.width = 32;
        c.height = 32;
        const g = c.getContext("2d");
        const grd = g.createLinearGradient(0, 0, 32, 32);
        grd.addColorStop(0, hex);
        grd.addColorStop(1, "#08060c");
        g.fillStyle = grd;
        g.fillRect(0, 0, 32, 32);
        return c;
    });
    const tex = new THREE.CubeTexture(images);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}
