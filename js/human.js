/* People of 1954 Midtown. Each person is ONE skinned mesh: sculpted lathe bodies, faces, hair, hats and
   tailoring merged into a shared geometry (cached per silhouette), coloured per person by a small palette
   shader, and driven by the same named joints the rest of the game animates. */
import * as THREE from "three";

// ---------------------------------------------------------------- palette slots
const S = { skin: 0, top: 1, bottom: 2, hair: 3, shoes: 4, accent: 5, white: 6, iris: 7, shirt: 8, hat: 9, lips: 10, metal: 11, brow: 12, lining: 13 };
const SLOTS = 14;
const ROUGH = [0.58, 0.84, 0.82, 0.78, 0.46, 0.55, 0.22, 0.12, 0.72, 0.8, 0.45, 0.28, 0.75, 0.85];

// ---------------------------------------------------------------- outfits
const OUTFITS = {
    dj: { top: 0x111118, bottom: 0x16161e, accent: 0xff2ea6, hat: "none", extra: "headphones", shoes: 0x111111, cut: "tee" },
    bartender: { top: 0x1a1410, bottom: 0x16120e, accent: 0xc9a227, hat: "none", extra: "bowtie", shoes: 0x111111, cut: "vest" },
    raver: { top: 0x1a0a18, bottom: 0x12121a, accent: 0xff00aa, hat: "none", extra: "glowstick", shoes: 0x111111, cut: "tee" },
    host: { top: 0x2a1840, bottom: 0x1a1228, accent: 0xc77dff, hat: "none", extra: "none", shoes: 0x221122, cut: "jacket" },
    singer: { top: 0x4a1028, bottom: 0x4a1028, accent: 0xd4a017, hat: "none", extra: "pearls", shoes: 0x111111, dress: true, gown: true },
    lounge: { top: 0x1c1a16, bottom: 0x1c1a16, accent: 0xc9a227, hat: "fedora", extra: "tie", shoes: 0x111111, cut: "suit" },
    socialite: { top: 0x6b1d3a, bottom: 0x6b1d3a, accent: 0xe8d5a3, hat: "none", extra: "pearls", shoes: 0x111111, dress: true },
    salesman: { top: 0x2c3a4a, bottom: 0x1a2430, accent: 0x8b1e1e, hat: "fedora", extra: "tie", shoes: 0x111111, cut: "suit" },
    hood: { top: 0x2a241c, bottom: 0x1a1814, accent: 0x4a3a28, hat: "fedora", extra: "none", shoes: 0x1a1a1a, cut: "trench" },
    cop: { top: 0x1a2744, bottom: 0x1a2744, accent: 0xc9a227, hat: "cop", extra: "badge", shoes: 0x111111, cut: "tunic" },
    waitress: { top: 0xd8d0c4, bottom: 0x3a2a28, accent: 0xc45c6a, hat: "none", extra: "apron", shoes: 0x221111, dress: true },
    cabbie: { top: 0x3a2a1c, bottom: 0x2a241c, accent: 0xc9a227, hat: "cabbie", extra: "none", shoes: 0x111111, cut: "jacket" },
    newsboy: { top: 0x4a3a2a, bottom: 0x2a241c, accent: 0x8b1e1e, hat: "newsboy", extra: "papers", shoes: 0x1a1a1a, cut: "jacket" },
    lady: { top: 0x2a3040, bottom: 0x2a3040, accent: 0xc9a227, hat: "none", extra: "none", shoes: 0x111111, dress: true, coat: true },
    vendor: { top: 0x3a3428, bottom: 0x2a241c, accent: 0x6a5a3a, hat: "fedora", extra: "none", shoes: 0x111111, cut: "overcoat" },
    clerk: { top: 0x2a2a32, bottom: 0x1a1a22, accent: 0xc9a227, hat: "none", extra: "tie", shoes: 0x111111, cut: "suit" },
    pedestrian: { top: 0x2a2430, bottom: 0x1a1a22, accent: 0x4a3a28, hat: "fedora", extra: "none", shoes: 0x111111, cut: "overcoat" },
    barber: { top: 0xf0ece4, bottom: 0x1a1a22, accent: 0xb82828, hat: "none", extra: "none", shoes: 0x111111, cut: "tunicShort" },
    pharmacist: { top: 0xe8e4dc, bottom: 0x2a2a32, accent: 0x66ffe0, hat: "none", extra: "tie", shoes: 0x111111, cut: "labcoat" },
    usher: { top: 0x6b1d3a, bottom: 0x1a1018, accent: 0xe0b25a, hat: "none", extra: "tie", shoes: 0x111111, cut: "jacket" },
    cook: { top: 0xf2eee0, bottom: 0x2a241c, accent: 0xc45c28, hat: "none", extra: "apron", shoes: 0x111111, cut: "tunicShort" },
    bellhop: { top: 0x8b1e1e, bottom: 0x1a1010, accent: 0xc9a227, hat: "bellhop", extra: "none", shoes: 0x111111, cut: "jacket" },
    florist: { top: 0x3a4a32, bottom: 0x2a241c, accent: 0xff6b9a, hat: "none", extra: "apron", shoes: 0x111111, cut: "cardigan" },
};

// Jacket lengths, below the spine joint (spine sits 12 cm above the hips joint).
const CUTS = {
    suit: { len: 0.24, open: true, lapels: true },
    jacket: { len: 0.2, open: true, lapels: true },
    overcoat: { len: 0.6, open: true, lapels: true, wide: 1.05 },
    trench: { len: 0.62, open: true, lapels: true, wide: 1.06, belt: true },
    tunic: { len: 0.3, open: false, lapels: false, belt: true },
    tunicShort: { len: 0.16, open: false, lapels: false },
    labcoat: { len: 0.5, open: true, lapels: true },
    cardigan: { len: 0.14, open: true, lapels: false },
    vest: { len: 0.1, open: true, lapels: false, sleeves: "shirt" },
    tee: { len: 0.08, open: false, lapels: false, sleeves: "short" },
};

const BONES = ["hips", "spine", "head", "eyeL", "eyeR", "lClav", "lUpper", "lFore", "lHand", "rClav", "rUpper", "rFore", "rHand", "lHip", "lThigh", "lShin", "rHip", "rThigh", "rShin"];

function rig() {
    const b = {};
    const bone = (name, parent, x, y, z) => {
        const o = new THREE.Bone();
        o.name = name;
        o.position.set(x, y, z);
        if (parent) b[parent].add(o);
        b[name] = o;
    };
    bone("hips", null, 0, 0.95, 0);
    bone("spine", "hips", 0, 0.12, 0);
    bone("head", "spine", 0, 0.6, 0);
    bone("eyeL", "head", -0.036, 0.016, 0);
    bone("eyeR", "head", 0.036, 0.016, 0);
    bone("lClav", "spine", -0.2, 0.4, 0);
    bone("lUpper", "lClav", 0, 0, 0);
    bone("lFore", "lUpper", 0, -0.28, 0);
    bone("lHand", "lFore", 0, -0.26, 0);
    bone("rClav", "spine", 0.2, 0.4, 0);
    bone("rUpper", "rClav", 0, 0, 0);
    bone("rFore", "rUpper", 0, -0.28, 0);
    bone("rHand", "rFore", 0, -0.26, 0);
    bone("lHip", "hips", -0.09, -0.06, 0);
    bone("lThigh", "lHip", 0, 0, 0);
    bone("lShin", "lThigh", 0, -0.4, 0);
    bone("rHip", "hips", 0.09, -0.06, 0);
    bone("rThigh", "rHip", 0, 0, 0);
    bone("rShin", "rThigh", 0, -0.4, 0);
    return b;
}

// ---------------------------------------------------------------- geometry helpers
const _m = new THREE.Matrix4(), _nm = new THREE.Matrix3(), _v = new THREE.Vector3(), _n = new THREE.Vector3();
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();

function lathe(profile, segments = 18, sx = 1, sz = 1) {
    const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), segments);
    if (sx !== 1 || sz !== 1) g.scale(sx, 1, sz);
    return g;
}
/** Radius of a lathe profile at height y (for placing details on a surface). */
function radiusAt(profile, y) {
    for (let i = 0; i < profile.length - 1; i++) {
        const [r0, y0] = profile[i], [r1, y1] = profile[i + 1];
        if ((y >= Math.min(y0, y1)) && (y <= Math.max(y0, y1)) && y0 !== y1) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
    }
    return profile[0][0];
}
function sphere(r, w = 14, h = 10) { return new THREE.SphereGeometry(r, w, h); }
function capsule(r, len, seg = 8) { return new THREE.CapsuleGeometry(r, len, 3, seg); }
function shaped(geo, fn) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i); fn(_v); p.setXYZ(i, _v.x, _v.y, _v.z); }
    geo.computeVertexNormals();
    return geo;
}
function roundBox(w, h, d, r, seg = 2) {
    const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), c = new THREE.Vector3();
    return shaped(g, (v) => {
        c.set(Math.max(-w / 2 + r, Math.min(w / 2 - r, v.x)), Math.max(-h / 2 + r, Math.min(h / 2 - r, v.y)), Math.max(-d / 2 + r, Math.min(d / 2 - r, v.z)));
        v.sub(c).normalize().multiplyScalar(r).add(c);
    });
}
/** The same surface seen from inside: skirts and coat hems are open at the bottom. */
function inside(geo, shrink = 0.994) {
    const g = geo.clone();
    g.scale(shrink, 1, shrink);
    const idx = g.index.array;
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
    const n = g.attributes.normal;
    for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
    return g;
}
function flatShape(points, depth = 0.006) {
    const sh = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
}

/** Collects parts bound to bones (rigidly, with optional blend toward the parent joint) into one geometry. */
class Builder {
    constructor(bones) { this.b = bones; this.pos = []; this.nor = []; this.slot = []; this.si = []; this.sw = []; this.idx = []; this.n = 0; }
    add(geometry, boneName, slot, o = {}) {
        const bone = this.b[boneName];
        const sx = o.sx ?? o.s ?? 1, sy = o.sy ?? o.s ?? 1, sz = o.sz ?? o.s ?? 1;
        _m.compose(_p.set(o.x || 0, o.y || 0, o.z || 0), _q.setFromEuler(_e.set(o.rx || 0, o.ry || 0, o.rz || 0)), _s.set(sx, sy, sz));
        _m.premultiply(bone.matrixWorld);
        _nm.getNormalMatrix(_m);
        const P = geometry.attributes.position, N = geometry.attributes.normal;
        const bi = BONES.indexOf(boneName), pi = o.blendTo ? BONES.indexOf(o.blendTo) : bi;
        for (let i = 0; i < P.count; i++) {
            _v.fromBufferAttribute(P, i);
            const ly = _v.y * sy + (o.y || 0);
            let w = 1;
            if (o.weight) w = o.weight(ly);
            else if (o.blend && ly > -o.blend) w = 0.55 + 0.45 * Math.min(1, -ly / o.blend);
            _v.applyMatrix4(_m);
            this.pos.push(_v.x, _v.y, _v.z);
            _n.fromBufferAttribute(N, i).applyMatrix3(_nm).normalize();
            this.nor.push(_n.x, _n.y, _n.z);
            this.slot.push(slot);
            this.si.push(bi, pi, 0, 0);
            this.sw.push(w, 1 - w, 0, 0);
        }
        if (geometry.index) for (const k of geometry.index.array) this.idx.push(this.n + k);
        else for (let k = 0; k < P.count; k++) this.idx.push(this.n + k);
        this.n += P.count;
        geometry.dispose();
    }
    build() {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
        g.setAttribute("slot", new THREE.Float32BufferAttribute(this.slot, 1));
        g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(this.si, 4));
        g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(this.sw, 4));
        g.setIndex(this.n > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
        g.computeBoundingSphere();
        return g;
    }
}

// ---------------------------------------------------------------- body sculpting
const TORSO_M = [[0, -0.03], [0.13, -0.03], [0.135, 0.05], [0.15, 0.15], [0.172, 0.25], [0.186, 0.33], [0.19, 0.375], [0.168, 0.42], [0.11, 0.452], [0.05, 0.47], [0, 0.47]];
const TORSO_F = [[0, -0.03], [0.128, -0.03], [0.112, 0.06], [0.122, 0.15], [0.158, 0.24], [0.16, 0.3], [0.158, 0.36], [0.15, 0.405], [0.1, 0.445], [0.045, 0.462], [0, 0.462]];

function coatProfile(cut, female) {
    const w = cut.wide || 1;
    const L = -cut.len;
    const base = female
        ? [[0.152 * w, L], [0.13 * w, L * 0.5], [0.122, -0.02], [0.13, 0.08], [0.165, 0.24], [0.168, 0.33], [0.166, 0.37], [0.155, 0.41], [0.105, 0.448], [0.058, 0.47], [0.05, 0.49]]
        : [[0.185 * w, L], [0.168 * w, L * 0.5], [0.152, -0.02], [0.156, 0.08], [0.18, 0.24], [0.198, 0.33], [0.203, 0.375], [0.18, 0.42], [0.118, 0.455], [0.06, 0.475], [0.055, 0.495]];
    return [[0, L], ...base, [0, 0.495]];
}

function headGeometry(female) {
    return shaped(new THREE.SphereGeometry(0.1, 30, 24), (v) => {
        const jaw = Math.max(0, -v.y / 0.1);
        v.y *= 1.2;
        v.x *= (1 - (female ? 0.26 : 0.2) * jaw) * (female ? 0.95 : 1);
        v.z *= 1 - 0.07 * jaw;
        if (v.z > 0 && v.y < -0.085) v.z += 0.012 * (1 - Math.abs(v.x) / 0.05);           // chin
        if (v.z > 0.05 && Math.abs(v.y) < 0.035) v.x *= 1.03;                            // cheekbones
        if (v.z > 0.06 && v.y > 0.02 && v.y < 0.06) v.z -= 0.006;                         // eye sockets
        if (v.z < -0.02) v.z *= 1.06;                                                     // occiput
    });
}

function hairGeometry(style, female) {
    const parts = [];
    const cap = (r = 0.107, nape = -0.035) => shaped(new THREE.SphereGeometry(r, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), (v) => {
        const front = Math.max(0, v.z / r);
        v.y = Math.max(v.y * 1.2, nape + front * 0.09);
    });
    if (style === "pompadour") {
        parts.push([cap(), {}]);
        parts.push([sphere(0.06, 14, 10), { x: 0, y: 0.11, z: 0.045, sx: 1.25, sy: 0.62, sz: 1.15, rx: -0.3 }]);
    } else if (style === "crew") {
        parts.push([cap(0.104, -0.02), {}]);
    } else if (style === "updo") {
        parts.push([cap(0.109, -0.05), {}]);
        parts.push([sphere(0.052, 14, 10), { x: 0, y: 0.1, z: -0.07 }]);
        parts.push([new THREE.TorusGeometry(0.03, 0.017, 8, 14, Math.PI), { x: -0.05, y: 0.1, z: 0.035, ry: Math.PI / 2, rz: 0.4 }]);
        parts.push([new THREE.TorusGeometry(0.03, 0.017, 8, 14, Math.PI), { x: 0.05, y: 0.1, z: 0.035, ry: Math.PI / 2, rz: -0.4 }]);
    } else if (style === "victory") {
        parts.push([cap(0.109, -0.06), {}]);
        parts.push([capsule(0.024, 0.06), { x: -0.045, y: 0.11, z: 0.04, rz: Math.PI / 2 - 0.5, rx: 0.2 }]);
        parts.push([capsule(0.024, 0.06), { x: 0.045, y: 0.11, z: 0.04, rz: -Math.PI / 2 + 0.5, rx: 0.2 }]);
        parts.push([sphere(0.07, 16, 12), { x: 0, y: -0.07, z: -0.06, sx: 1.35, sy: 0.75, sz: 0.85 }]);
    } else if (style === "bob" || style === "waves") {
        const len = style === "waves" ? -0.2 : -0.12;
        parts.push([cap(0.11, -0.04), {}]);
        parts.push([lathe([[0.113, 0.03], [0.12, -0.03], [0.122, len + 0.03], [0.112, len], [0.098, len + 0.01]], 22, 1, 1.05), { z: -0.008 }]);
    } else {
        parts.push([cap(), {}]);
    }
    return parts;
}

function hatParts(hat) {
    const p = [];
    if (hat === "fedora") {
        const brim = shaped(lathe([[0.1, 0.004], [0.165, 0.002], [0.19, 0.012], [0.192, 0.02], [0.17, 0.008], [0.1, 0.012]], 26), (v) => {
            if (v.z > 0.08) v.y -= (v.z - 0.08) * 0.32;   // snap brim dips at the front
            if (v.z < -0.08) v.y += (-v.z - 0.08) * 0.18;
        });
        const crown = shaped(lathe([[0.106, 0], [0.11, 0.05], [0.104, 0.1], [0.075, 0.122], [0.02, 0.118], [0, 0.11]], 22), (v) => {
            if (v.y > 0.095 && Math.abs(v.x) < 0.035) v.y -= 0.018 * (1 - Math.abs(v.x) / 0.035); // centre crease
            if (v.z > 0.04 && v.y > 0.06) v.x *= 0.86;                                               // front pinch
        });
        p.push([brim, S.hat, { y: 0.088, rx: -0.07 }], [crown, S.hat, { y: 0.09, rx: -0.07 }]);
        p.push([lathe([[0.109, 0], [0.111, 0.024]], 22), S.accent, { y: 0.094, rx: -0.07 }]);
    } else if (hat === "cop") {
        p.push([lathe([[0, 0], [0.11, 0], [0.114, 0.045], [0.135, 0.085], [0.135, 0.098], [0, 0.098]], 22), S.top, { y: 0.07, rx: -0.05 }]);
        p.push([new THREE.CylinderGeometry(0.12, 0.12, 0.008, 18, 1, false, -Math.PI / 2, Math.PI), S.shoes, { y: 0.075, z: 0.02, rx: 0.25 }]);
        p.push([lathe([[0.112, 0], [0.114, 0.022]], 20), S.accent, { y: 0.08, rx: -0.05 }]);
        p.push([sphere(0.016, 8, 6), S.metal, { y: 0.135, z: 0.115, sz: 0.4 }]);
    } else if (hat === "cabbie" || hat === "newsboy") {
        p.push([sphere(0.125, 18, 12), S.hat, { y: 0.07, z: 0.012, sx: 1.04, sy: 0.42, sz: 1.14 }]);
        p.push([new THREE.CylinderGeometry(0.08, 0.08, 0.008, 14, 1, false, -Math.PI / 2, Math.PI), S.hat, { y: 0.06, z: 0.095, rx: 0.18 }]);
    } else if (hat === "bellhop") {
        p.push([lathe([[0, 0], [0.09, 0], [0.093, 0.09], [0, 0.09]], 18), S.top, { y: 0.11 }]);
        p.push([lathe([[0.094, 0], [0.095, 0.018]], 18), S.accent, { y: 0.112 }]);
    } else if (hat === "cloche") {
        p.push([lathe([[0.135, -0.02], [0.125, 0.02], [0.118, 0.06], [0.1, 0.1], [0.05, 0.125], [0, 0.13]], 22), S.hat, { y: 0.03 }]);
    }
    return p;
}

// ---------------------------------------------------------------- build one silhouette
const GEO_CACHE = new Map();

function silhouetteKey(o, spec, female) {
    return [spec.outfitName, female ? "f" : "m", spec.hairStyle, o.hat, o.extra, spec.scarf !== false && (o.hat === "fedora" || spec.outfitName === "lady" || spec.outfitName === "lounge"),
        spec.mouth !== false, spec.glasses ? 1 : 0, spec.moustache ? 1 : 0].join("|");
}

function buildGeometry(o, spec, female) {
    const key = silhouetteKey(o, spec, female);
    if (GEO_CACHE.has(key)) return GEO_CACHE.get(key);
    const bones = rig();
    bones.hips.updateMatrixWorld(true);
    const B = new Builder(bones);
    const cut = o.dress ? null : CUTS[o.cut || "suit"];
    const torso = female ? TORSO_F : TORSO_M;
    const sz = female ? 0.66 : 0.6;

    // --- torso and tailoring
    const coat = cut && cut.len > 0.12 || (o.dress && o.coat);
    const coatP = coat ? coatProfile(o.dress ? { len: 0.5, wide: 1.04 } : cut, female) : null;
    if (coatP) {
        const coatW = (y) => (y < -0.04 ? Math.max(0, 1 + (y + 0.04) / 0.12) : 1);
        const coatGeo = lathe(coatP, 22, 1, sz + 0.04);
        B.add(inside(coatGeo), "spine", S.lining, { weight: coatW, blendTo: "hips" });
        B.add(coatGeo, "spine", S.top, { weight: coatW, blendTo: "hips" });
    } else {
        B.add(lathe(torso, 22, 1, sz), "spine", o.dress ? S.top : (cut?.sleeves === "shirt" ? S.shirt : S.top));
    }
    const front = (y) => radiusAt(coatP || torso, y) * (coatP ? sz + 0.04 : sz);
    if (cut?.open || (o.dress && o.coat)) {
        // White shirt in the open V, then the tie or bow.
        const y0 = 0.25, y1 = 0.45, z = front(0.36) + 0.002;
        B.add(flatShape([[-0.055, 0.2], [0.055, 0.2], [0, -0.04]], 0.004), "spine", o.dress ? S.lining : S.shirt, { y: y0 + 0.02, z: z - 0.004 });
        if (cut?.lapels || (o.dress && o.coat)) {
            for (const s of [-1, 1]) B.add(flatShape([[0, 0.2], [s * 0.075, 0.13], [s * 0.05, 0.02], [0, -0.06]], 0.008), "spine", S.top, { x: s * 0.048, y: y0, z: z - 0.002 });
        }
        if (o.extra === "tie") B.add(flatShape([[-0.015, 0.2], [0.015, 0.2], [0.025, -0.01], [0, -0.05], [-0.025, -0.01]], 0.006), "spine", S.accent, { y: 0.2, z: z + 0.002 });
        void y1;
    }
    if (o.extra === "bowtie") {
        const z = front(0.43) + 0.004;
        for (const s of [-1, 1]) B.add(new THREE.ConeGeometry(0.022, 0.04, 6), "spine", S.accent, { x: s * 0.02, y: 0.43, z, rz: s * Math.PI / 2 });
        B.add(flatShape([[-0.03, 0.17], [0.03, 0.17], [0.0, -0.05]], 0.004), "spine", S.shirt, { y: 0.27, z: z - 0.006 });
    }
    if (cut && !cut.open && cut.len > 0.12) {
        for (const y of [0.06, 0.16, 0.26, 0.36]) B.add(sphere(0.008, 6, 5), "spine", S.metal, { y, z: front(y) + 0.002, sz: 0.5 });
    } else if (cut?.open && coat) {
        for (const y of [0.04, 0.14]) B.add(sphere(0.009, 6, 5), "spine", S.shoes, { x: 0.03, y, z: front(y) + 0.002, sz: 0.5 });
    }
    if (cut?.belt) B.add(lathe([[radiusAt(coatP, 0.0) + 0.004, -0.02], [radiusAt(coatP, 0.03) + 0.004, 0.03]], 22, 1, sz + 0.04), "spine", cut === CUTS.tunic ? S.shoes : S.top, {});
    if (cut?.lapels && coat) B.add(roundBox(0.075, 0.02, 0.01, 0.004), "spine", S.accent, { x: -0.11, y: 0.31, z: front(0.31) + 0.002, rz: 0.08 }); // pocket square
    if (o.extra === "badge") B.add(new THREE.CylinderGeometry(0.022, 0.022, 0.005, 8), "spine", S.metal, { x: -0.1, y: 0.3, z: front(0.3) + 0.003, rx: Math.PI / 2 });
    if (o.extra === "apron") {
        const y0 = o.dress ? -0.1 : -0.05;
        B.add(new THREE.CylinderGeometry(0.17, 0.2, 0.36, 14, 1, true, -0.9, 1.8), "spine", S.white, { y: y0, z: 0.012 });
        B.add(flatShape([[-0.07, 0.16], [0.07, 0.16], [0.08, 0], [-0.08, 0]], 0.004), "spine", S.white, { y: 0.12, z: front(0.2) + 0.004 });
    }
    if (o.extra === "pearls") B.add(new THREE.TorusGeometry(0.06, 0.007, 6, 20), "spine", S.white, { y: 0.455, z: 0.025, rx: Math.PI / 2 - 0.3 });
    if (spec.scarf !== false && (o.hat === "fedora" || spec.outfitName === "lady" || spec.outfitName === "lounge")) {
        B.add(new THREE.TorusGeometry(0.06, 0.02, 8, 18), "spine", S.accent, { y: 0.47, rx: Math.PI / 2 });
        B.add(capsule(0.018, 0.14), "spine", S.accent, { x: 0.04, y: 0.36, z: front(0.36) + 0.01, rz: 0.12 });
    }

    // --- neck, collar
    B.add(lathe([[0.05, 0], [0.045, 0.06], [0.046, 0.12]], 14), "spine", S.skin, { y: 0.44 });
    if (cut && cut.sleeves !== "short") B.add(new THREE.TorusGeometry(0.05, 0.012, 6, 16), "spine", cut.open ? S.shirt : S.top, { y: 0.475, rx: Math.PI / 2 });

    // --- hips, legs, shoes
    B.add(sphere(1, 16, 10), "hips", o.dress ? S.top : S.bottom, { y: -0.03, sx: female ? 0.165 : 0.16, sy: 0.12, sz: 0.115 });
    const thighP = female
        ? [[0, 0.02], [0.074, 0.01], [0.082, -0.04], [0.074, -0.16], [0.058, -0.32], [0.046, -0.4], [0, -0.41]]
        : [[0, 0.02], [0.078, 0.01], [0.086, -0.04], [0.08, -0.16], [0.068, -0.3], [0.058, -0.4], [0, -0.41]];
    const shinP = o.dress
        ? [[0, 0.01], [0.046, 0.0], [0.05, -0.08], [0.044, -0.2], [0.03, -0.38], [0.027, -0.43], [0, -0.44]]
        : [[0, 0.01], [0.058, 0.0], [0.058, -0.1], [0.055, -0.25], [0.054, -0.42], [0.056, -0.43], [0, -0.44]];
    const legSlot = o.dress ? S.skin : S.bottom;
    for (const s of ["l", "r"]) {
        B.add(lathe(thighP, 14), `${s}Thigh`, o.dress ? S.skin : S.bottom, { blend: 0.06, blendTo: "hips" });
        B.add(lathe(shinP, 14), `${s}Shin`, legSlot, { blend: 0.05, blendTo: `${s}Thigh` });
        if (female && o.dress) {
            B.add(shaped(roundBox(0.072, 0.05, 0.21, 0.022), (v) => { if (v.z > 0.04) v.x *= 1 - (v.z - 0.04) * 2.2; }), `${s}Shin`, S.shoes, { y: -0.47, z: 0.04, rx: 0.12 });
            B.add(new THREE.CylinderGeometry(0.008, 0.012, 0.07, 6), `${s}Shin`, S.shoes, { y: -0.475, z: -0.045 });
        } else {
            B.add(shaped(roundBox(0.098, 0.072, 0.27, 0.03), (v) => {
                if (v.z > 0.06) v.x *= 1 - (v.z - 0.06) * 1.6;      // tapering toe
                if (v.z > 0.08 && v.y > 0) v.y -= (v.z - 0.08) * 0.25;
            }), `${s}Shin`, S.shoes, { y: -0.47, z: 0.045 });
        }
    }
    if (o.dress) {
        const hem = o.gown ? -0.86 : -0.56;
        const skirt = lathe([[0.135, 0.12], [0.15, 0.03], [0.18, -0.15], [0.24, hem * 0.75], [0.27, hem], [0.255, hem - 0.005]], 24);
        B.add(inside(skirt), "hips", S.lining, {});
        B.add(skirt, "hips", S.top, {});
    }

    // --- arms and hands
    const sleeve = cut?.sleeves === "short" ? "short" : cut?.sleeves === "shirt" ? "shirt" : o.dress ? (o.coat ? "long" : "cap") : "long";
    const upperP = [[0, 0.012], [0.036, 0.008], [0.052, -0.02], [0.054, -0.07], [0.048, -0.16], [0.043, -0.26], [0.04, -0.29], [0, -0.3]];
    const foreP = [[0, 0.02], [0.043, 0.01], [0.046, -0.05], [0.039, -0.16], [0.032, -0.235], [0.03, -0.25], [0, -0.26]];
    for (const s of ["l", "r"]) {
        const armSlot = sleeve === "shirt" ? S.shirt : sleeve === "long" || sleeve === "short" ? S.top : S.skin;
        B.add(lathe(upperP, 12, female ? 0.88 : 1, female ? 0.88 : 1), `${s}Upper`, armSlot, { blend: 0.05, blendTo: `${s}Clav` });
        if (sleeve === "short" || sleeve === "cap") B.add(lathe([[0.058, 0.02], [0.06, -0.02], [0.056, -0.11], [0.05, -0.12]], 12), `${s}Upper`, S.top, {});
        const foreSlot = sleeve === "long" ? S.top : sleeve === "shirt" ? S.shirt : S.skin;
        B.add(lathe(foreP, 12, female ? 0.86 : 1, female ? 0.86 : 1), `${s}Fore`, foreSlot, { blend: 0.05, blendTo: `${s}Upper` });
        if (sleeve === "long" && !o.dress) B.add(lathe([[0.033, -0.215], [0.034, -0.245]], 12), `${s}Fore`, S.shirt, {});
        // Hand: palm, four slightly curled fingers and a thumb.
        const side = s === "l" ? -1 : 1, hs = female ? 0.9 : 1;
        B.add(roundBox(0.072, 0.082, 0.03, 0.012), `${s}Hand`, S.skin, { y: -0.04 * hs, s: hs });
        for (let i = 0; i < 4; i++) {
            const len = [0.034, 0.04, 0.038, 0.03][i];
            B.add(capsule(0.0075, len, 6), `${s}Hand`, S.skin, { x: (-0.025 + i * 0.0165) * hs, y: (-0.088 - len / 2) * hs, z: 0.004, rx: 0.28, s: hs });
        }
        B.add(capsule(0.009, 0.03, 6), `${s}Hand`, S.skin, { x: -side * 0.036 * hs, y: -0.045 * hs, z: 0.014, rz: side * 0.55, rx: 0.4, s: hs });
    }

    // --- head and face
    B.add(headGeometry(female), "head", S.skin, {});
    B.add(sphere(0.02, 10, 8), "head", S.skin, { y: -0.012, z: 0.1, sx: 0.85, sy: 1.5, sz: 1.05 });          // nose bridge
    B.add(sphere(0.022, 10, 8), "head", S.skin, { y: -0.034, z: 0.098, sx: 1.15, sy: 0.62, sz: 0.85 });      // nose tip
    for (const s of [-1, 1]) {
        B.add(sphere(0.03, 10, 8), "head", S.skin, { x: s * (female ? 0.095 : 0.1), y: -0.006, z: -0.006, sx: 0.36, sy: 0.75, sz: 0.55 });
        B.add(capsule(0.0042, 0.03, 4), "head", S.brow, { x: s * 0.037, y: 0.047, z: 0.099, rz: Math.PI / 2 + s * (female ? 0.16 : 0.06) });
    }
    for (const eye of ["eyeL", "eyeR"]) {
        B.add(sphere(0.014, 12, 10), eye, S.white, { z: 0.09, sx: 1, sy: 0.72, sz: 0.5 });
        B.add(sphere(0.0068, 10, 8), eye, S.iris, { z: 0.096, sz: 0.42 });
        B.add(capsule(0.0035, 0.022, 4), eye, female ? S.iris : S.brow, { y: 0.009, z: 0.095, rz: Math.PI / 2 });   // lash line
    }
    if (spec.mouth !== false) {
        B.add(capsule(0.0058, 0.026, 6), "head", S.lips, { y: -0.055, z: 0.094, rz: Math.PI / 2 });
        B.add(capsule(0.0068, 0.022, 6), "head", S.lips, { y: -0.063, z: 0.092, rz: Math.PI / 2 });
    }
    if (spec.moustache) B.add(capsule(0.005, 0.03, 5), "head", S.hair, { y: -0.046, z: 0.098, rz: Math.PI / 2 });
    if (spec.glasses) {
        for (const s of [-1, 1]) B.add(new THREE.TorusGeometry(0.02, 0.0025, 5, 16), "head", S.metal, { x: s * 0.036, y: 0.016, z: 0.112 });
        B.add(capsule(0.002, 0.026, 3), "head", S.metal, { y: 0.02, z: 0.113, rz: Math.PI / 2 });
    }
    for (const [g, opt] of hairGeometry(spec.hairStyle, female)) B.add(g, "head", S.hair, { y: 0.01, ...opt });
    for (const [g, slot, opt] of hatParts(o.hat)) B.add(g, "head", slot, opt);
    if (o.extra === "headphones") {
        B.add(new THREE.TorusGeometry(0.12, 0.014, 6, 16, Math.PI), "head", S.accent, { y: 0.02, ry: Math.PI / 2 });
        for (const s of [-1, 1]) B.add(new THREE.CylinderGeometry(0.038, 0.038, 0.03, 12), "head", S.accent, { x: s * 0.118, y: 0.0, rz: Math.PI / 2 });
    }

    const geometry = B.build();
    GEO_CACHE.set(key, geometry);
    return geometry;
}

// ---------------------------------------------------------------- palette material (one program for everyone)
function paletteMaterial(colors, glow = 0) {
    const palette = colors.map((c, i) => new THREE.Vector4(c.r, c.g, c.b, ROUGH[i]));
    const m = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.0 });
    m.userData.palette = palette;
    m.userData.glow = { value: glow };
    m.onBeforeCompile = (shader) => {
        shader.uniforms.palette = { value: palette };
        shader.uniforms.glow = m.userData.glow;
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nattribute float slot;\nvarying float vSlot;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSlot = slot;");
        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>\nuniform vec4 palette[${SLOTS}];\nuniform float glow;\nvarying float vSlot;`)
            .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "int si = int(vSlot + 0.5);\nvec4 pc = palette[si];\nvec4 diffuseColor = vec4( pc.rgb, opacity );")
            .replace("#include <roughnessmap_fragment>", "float roughnessFactor = pc.a;")
            .replace("#include <metalnessmap_fragment>", `float metalnessFactor = si == ${S.metal} ? 0.85 : 0.0;`)
            .replace("vec3 totalEmissiveRadiance = emissive;", `vec3 totalEmissiveRadiance = emissive + (si == ${S.accent} ? pc.rgb * glow : vec3(0.0));`);
    };
    m.customProgramCacheKey = () => "vc9k-person";
    return m;
}

function nameSprite(label, hex) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "rgba(8,6,10,0.62)";
    g.fillRect(24, 28, 464, 72);
    g.font = "700 44px Georgia, serif";
    g.fillStyle = hex;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = hex;
    g.shadowBlur = 12;
    g.fillText(label, 256, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    spr.scale.set(1.35, 0.34, 1);
    spr.position.y = 1.98;
    return spr;
}

const MATS = new Map();
function mat(color, extra = {}) {
    const key = `${color}|${extra.roughness ?? 0.62}|${extra.metalness ?? 0.08}|${extra.side ?? 0}`;
    let m = MATS.get(key);
    if (!m) {
        m = new THREE.MeshStandardMaterial({ color, roughness: extra.roughness ?? 0.62, metalness: extra.metalness ?? 0.08, side: extra.side ?? THREE.FrontSide });
        MATS.set(key, m);
    }
    return m;
}

const _c = new THREE.Color();
function lin(hex) { return _c.setHex(hex).clone(); }
function shade(hex, k) { return _c.setHex(hex).multiplyScalar(k).clone(); }

export function createHuman(spec = {}) {
    const outfitName = OUTFITS[spec.outfit] ? spec.outfit : "pedestrian";
    const o = { ...OUTFITS[outfitName] };
    if (spec.accent) o.accent = typeof spec.accent === "string" ? new THREE.Color(spec.accent).getHex() : spec.accent;
    const female = spec.body ? spec.body === "f" : !!(o.dress || spec.hairStyle === "updo" || spec.hairStyle === "victory" || spec.hairStyle === "bob" || spec.hairStyle === "waves");
    const hairStyle = spec.hairStyle || (female ? "victory" : "short");
    const seed = Math.abs(Math.sin((spec.skin ?? 7) * 12.9898 + (spec.hair ?? 3) * 78.233 + outfitName.length * 3.7)) % 1;
    const moustache = spec.moustache ?? (!female && seed > 0.72 && outfitName !== "dj" && outfitName !== "raver");
    const glasses = spec.glasses ?? (outfitName === "clerk" || outfitName === "pharmacist" || outfitName === "salesman");
    const geometry = buildGeometry(o, { ...spec, outfitName, hairStyle, moustache, glasses }, female);

    const skinC = spec.skin ?? 0xc68642;
    const hairC = spec.hair ?? 0x1a1208;
    const colors = new Array(SLOTS);
    colors[S.skin] = lin(skinC);
    colors[S.top] = lin(o.top);
    colors[S.bottom] = lin(o.bottom);
    colors[S.hair] = lin(hairC);
    colors[S.shoes] = lin(o.shoes);
    colors[S.accent] = lin(o.accent);
    colors[S.white] = lin(0xf2eee6);
    colors[S.iris] = lin([0x3a2614, 0x1a120c, 0x2c4a5a, 0x3a4a2a][Math.floor(seed * 4)]);
    colors[S.shirt] = lin(o.cut === "tee" ? o.top : 0xeeeae0);
    colors[S.hat] = lin(o.hat === "fedora" ? [0x2a241c, 0x1a1612, 0x3a3428, 0x28303a][Math.floor(seed * 4)] : 0x1a1612);
    colors[S.lips] = lin(female ? 0x9a2a34 : skinC).multiplyScalar(female ? 1 : 0.72);
    colors[S.metal] = lin(o.extra === "badge" ? 0xc9a227 : 0x8a8478);
    colors[S.brow] = shade(hairC, 0.8);
    colors[S.lining] = shade(o.top, 0.55);
    const glow = outfitName === "raver" || outfitName === "dj" ? 0.6 : 0;

    const root = new THREE.Group();
    const b = rig();
    const mesh = new THREE.SkinnedMesh(geometry, paletteMaterial(colors, glow));
    mesh.add(b.hips);
    mesh.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(BONES.map((n) => b[n])));
    // A generous fixed bound: no per-vertex skinning pass to cull, and raised arms stay inside it.
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.95, 0), 1.25);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = spec.name || outfitName;
    root.add(mesh);

    b.lUpper.rotation.z = 0.12;
    b.rUpper.rotation.z = -0.12;

    if (o.extra === "glowstick") {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), new THREE.MeshBasicMaterial({ color: spec.color || o.accent }));
        stick.position.set(0, -0.04, 0.03);
        b.rHand.add(stick);
        root.userData.stick = stick;
    }
    if (o.extra === "papers") {
        const paper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.02), mat(0xd8c9a4, { roughness: 0.9 }));
        paper.position.set(0.04, -0.06, 0.04);
        b.lHand.add(paper);
    }
    if (spec.umbrella) {
        const umb = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.92, 6), mat(0x2a241c, { roughness: 0.4, metalness: 0.35 }));
        shaft.position.y = 0.36;
        // Eight gored panels on ribs, with a slight scallop between them.
        const canopyGeo = shaped(new THREE.ConeGeometry(0.56, 0.24, 16, 2, true), (v) => {
            const a = Math.atan2(v.z, v.x), rim = Math.max(0, 1 - (v.y + 0.12) / 0.24);
            v.y -= Math.abs(Math.sin(a * 4)) * 0.025 * rim;
        });
        const canopy = new THREE.Mesh(canopyGeo, mat(spec.umbrellaColor || o.accent || 0x1a2438, { roughness: 0.55, side: THREE.DoubleSide }));
        canopy.position.y = 0.86;
        umb.add(shaft, canopy);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 10, Math.PI), mat(0x725038));
        handle.position.set(0.045, -0.1, 0);
        handle.rotation.z = Math.PI;
        umb.add(handle);
        b.lHand.add(umb);
        root.userData.umbrella = umb;
    }
    if (spec.name && spec.color) root.add(nameSprite(spec.name, spec.color));

    const scale = spec.scale || 1;
    root.scale.setScalar(scale);
    root.userData.joints = { hips: b.hips, spine: b.spine, head: b.head, lUpper: b.lUpper, rUpper: b.rUpper, lFore: b.lFore, rFore: b.rFore, lThigh: b.lThigh, rThigh: b.rThigh, lShin: b.lShin, rShin: b.rShin, lHand: b.lHand, rHand: b.rHand };
    root.userData.eyelids = [b.eyeL, b.eyeR];
    root.userData.body = mesh;
    root.userData.phase = Math.random() * Math.PI * 2;
    root.userData.mode = spec.anim || "idle";
    root.userData.kind = "human";
    if (spec.umbrella) animateHuman(root, 0, { mode: root.userData.mode });
    return root;
}

export function createCat(color = 0xcfc8bc) {
    const g = new THREE.Group();
    const fur = mat(color, { roughness: 0.85, metalness: 0 });
    const dark = mat(0x1a1210);
    const body = new THREE.Mesh(sphere(0.16, 14, 10), fur);
    body.scale.set(1.45, 0.75, 0.8);
    body.position.y = 0.2;
    const head = new THREE.Mesh(sphere(0.1, 14, 10), fur);
    head.position.set(0.18, 0.3, 0);
    head.scale.set(1, 0.9, 1.05);
    const earG = new THREE.ConeGeometry(0.04, 0.08, 4);
    const le = new THREE.Mesh(earG, fur);
    le.position.set(0.14, 0.4, 0.05);
    const re = le.clone();
    re.position.z = -0.05;
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.32, 6), fur);
    tail.position.set(-0.24, 0.3, 0);
    tail.rotation.z = 0.9;
    const nose = new THREE.Mesh(sphere(0.02, 6, 6), dark);
    nose.position.set(0.27, 0.28, 0);
    const eyeM = mat(0x9ac43a, { roughness: 0.2 });
    for (const z of [-0.035, 0.035]) {
        const e = new THREE.Mesh(sphere(0.014, 8, 6), eyeM);
        e.position.set(0.265, 0.32, z);
        g.add(e);
    }
    for (const x of [-0.12, 0.12]) for (const z of [-0.07, 0.07]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.14, 6), fur);
        leg.position.set(x, 0.07, z);
        g.add(leg);
    }
    g.add(body, head, le, re, tail, nose);
    g.userData.kind = "cat";
    g.userData.tail = tail;
    g.userData.phase = Math.random() * 6;
    const tag = nameSprite("SOCKS", "#d8d0c4");
    tag.position.y = 0.72;
    tag.scale.set(0.9, 0.22, 1);
    g.add(tag);
    return g;
}

export function animateHuman(obj, t, ctx = {}) {
    if (!obj) return;
    if (obj.userData.kind === "cat") {
        const tail = obj.userData.tail;
        if (tail) tail.rotation.y = Math.sin(t * 3 + obj.userData.phase) * 0.5;
        obj.position.y = 0.02 + Math.sin(t * 2 + obj.userData.phase) * 0.01;
        obj.rotation.y += Math.sin(t * 0.4) * 0.002;
        return;
    }
    const j = obj.userData.joints;
    if (!j) return;
    const mode = ctx.mode || obj.userData.mode || "idle";
    const bpm = ctx.bpm || 128;
    const ph = obj.userData.phase || 0;
    // A short asynchronous blink keeps idle faces alive without moving instrument grips.
    const blink = (t + ph) % 4.7, openness = blink < .16 ? Math.max(.08, Math.abs(blink - .08) / .08) : 1;
    for (const lid of obj.userData.eyelids || []) lid.scale.y = openness;
    const beat = t * (bpm / 60) * Math.PI * 2 + ph;

    if (mode === "walk") {
        // Heel strike, push-off and a passing knee; arms counter-swing and the shoulders twist against the hips.
        const w = t * 7.2 + ph, s = Math.sin(w), c = Math.cos(w);
        j.hips.position.y = 0.95 + Math.abs(c) * 0.022 - 0.012;
        j.hips.rotation.set(0, s * 0.07, -c * 0.035);
        j.spine.rotation.set(0.04, -s * 0.1, c * 0.025);
        j.head.rotation.set(-0.02, s * 0.04, -c * 0.02);
        j.lThigh.rotation.set(-s * 0.5, 0, 0.02);
        j.rThigh.rotation.set(s * 0.5, 0, -0.02);
        j.lShin.rotation.set(Math.max(0, c) * 0.62 + 0.06, 0, 0);
        j.rShin.rotation.set(Math.max(0, -c) * 0.62 + 0.06, 0, 0);
        j.lUpper.rotation.set(s * 0.38, 0, 0.08);
        j.rUpper.rotation.set(-s * 0.38, 0, -0.08);
        j.lFore.rotation.set(-0.22 - Math.max(0, s) * 0.3, 0, 0);
        j.rFore.rotation.set(-0.22 - Math.max(0, -s) * 0.3, 0, 0);
    } else if (mode === "dance") {
        const pulse = 0.5 + 0.5 * Math.cos(beat);
        const sway = Math.sin(beat * 0.5 + ph);
        const groove = Math.sin(beat * 0.25 + ph * 0.7);
        const style = (obj.userData.danceStyle || 0) % 7;
        const bounce = (1 - pulse) * 0.11;
        j.hips.position.y = 0.9 + bounce;
        j.hips.rotation.set(0, groove * 0.22, sway * 0.1);
        j.spine.rotation.set(-0.12 - pulse * 0.08, sway * 0.14, 0);
        j.head.rotation.set(-0.1 + pulse * 0.08, Math.sin(t * 0.7 + ph) * 0.2, sway * 0.05);
        j.lThigh.rotation.set(-0.1 - pulse * 0.26, 0, 0.05);
        j.rThigh.rotation.set(-0.08 - pulse * 0.22, 0, -0.05);
        j.lShin.rotation.set(pulse * 0.28, 0, 0);
        j.rShin.rotation.set(pulse * 0.24, 0, 0);
        const pump = pulse * 0.38;
        if (style === 0) {
            j.lUpper.rotation.set(-0.25, 0, 2.35 + pump);
            j.rUpper.rotation.set(-0.25, 0, -2.35 - pump);
            j.lFore.rotation.set(-0.4, 0, 0.2);
            j.rFore.rotation.set(-0.4, 0, -0.2);
        } else if (style === 1) {
            j.lUpper.rotation.set(-0.4 + sway * 0.2, 0, 0.55 + pulse * 0.25);
            j.rUpper.rotation.set(-0.2, 0, -2.5 - pump);
            j.lFore.rotation.set(-0.5, 0, 0);
            j.rFore.rotation.set(-0.3, 0, -0.25);
        } else if (style === 2) {
            const hit = Math.sin(beat);
            j.lUpper.rotation.set(-1.4 + hit * 0.5, 0, 0.95);
            j.rUpper.rotation.set(-1.2 - hit * 0.5, 0, -0.9);
            j.lFore.rotation.set(-0.65, 0, 0);
            j.rFore.rotation.set(-0.6, 0, 0);
        } else if (style === 3) {
            j.hips.rotation.y = sway * 0.42;
            j.lUpper.rotation.set(-0.4, 0, 1.7 + sway * 0.32);
            j.rUpper.rotation.set(-0.4, 0, -1.7 + sway * 0.32);
            j.lFore.rotation.set(-0.35 - pulse * 0.25, 0, 0.25);
            j.rFore.rotation.set(-0.35 - pulse * 0.25, 0, -0.25);
        } else if (style === 4) {
            const clap = Math.abs(Math.sin(beat));
            j.lUpper.rotation.set(-1.05, 0, 0.95 + clap * 0.32);
            j.rUpper.rotation.set(-1.05, 0, -0.95 - clap * 0.32);
            j.lFore.rotation.set(-1.0 - clap * 0.4, 0, 0);
            j.rFore.rotation.set(-1.0 - clap * 0.4, 0, 0);
        } else if (style === 5) {
            j.spine.rotation.y = sway * 0.4;
            j.lUpper.rotation.set(-0.55 + pulse * 0.3, 0, 1.9 + sway * 0.2);
            j.rUpper.rotation.set(-1.55 + pulse * 0.45, 0, -0.45);
            j.lFore.rotation.set(-0.45, 0, 0.2);
            j.rFore.rotation.set(-0.2, 0, -0.15);
        } else {
            j.hips.position.y = 0.8 + bounce * 1.35;
            j.lUpper.rotation.set(-0.85, 0, 1.25 + pump);
            j.rUpper.rotation.set(-0.85, 0, -1.25 - pump);
            j.lFore.rotation.set(-0.7 - pulse * 0.2, 0, 0.15);
            j.rFore.rotation.set(-0.7 - pulse * 0.2, 0, -0.15);
        }
        if (obj.userData.stick) obj.userData.stick.rotation.z = 0.4 + Math.sin(beat + ph) * 0.7;
    } else if (mode === "sit") {
        const sitY = obj.userData.sitHips ?? 0.54;
        const breath = Math.sin(t * 1.15 + ph) * 0.006;
        j.hips.position.y = sitY + breath;
        j.hips.rotation.set(0, 0, 0);
        j.spine.rotation.set(0.08, Math.sin(t * 0.22 + ph) * 0.035, 0);
        j.head.rotation.set(0.02, Math.sin(t * 0.18 + ph) * 0.07, 0);
        j.lThigh.rotation.set(-1.45, 0, 0.05);
        j.rThigh.rotation.set(-1.4, 0, -0.05);
        j.lShin.rotation.set(1.38, 0, 0);
        j.rShin.rotation.set(1.34, 0, 0);
        j.lUpper.rotation.set(-0.62, 0, 0.1);
        j.rUpper.rotation.set(-0.58, 0, -0.1);
        j.lFore.rotation.set(-0.72, 0, 0);
        j.rFore.rotation.set(-0.68, 0, 0);
    } else if (mode === "sax") {
        j.hips.position.y = 0.95 + Math.sin(t * 1.4 + ph) * 0.006;
        j.hips.rotation.set(0, 0, 0); j.spine.rotation.set(0, 0, 0); j.head.rotation.set(0, 0, 0);
        if (!obj.userData.saxPose) {
            // Two-bone reach: fingers rest on the key stack, with elbows bent out.
            const pose = (upper, target, side) => {
                const shoulder = upper.parent.position, delta = target.clone().sub(shoulder), distance = delta.length();
                const direction = delta.clone().normalize(), bend = new THREE.Vector3(side, -.4, 0);
                bend.addScaledVector(direction, -bend.dot(direction)).normalize();
                const along = (.28 ** 2 - .26 ** 2 + distance ** 2) / (2 * distance);
                const elbow = shoulder.clone().addScaledVector(direction, along).addScaledVector(bend, Math.sqrt(Math.max(0, .28 ** 2 - along ** 2)));
                const down = new THREE.Vector3(0, -1, 0);
                const arm = new THREE.Quaternion().setFromUnitVectors(down, elbow.clone().sub(shoulder).normalize());
                const fore = new THREE.Quaternion().setFromUnitVectors(down, target.clone().sub(elbow).normalize());
                return [arm, arm.clone().invert().multiply(fore)];
            };
            obj.userData.saxPose = [pose(j.lUpper, new THREE.Vector3(-.055, .27, .44), -1), pose(j.rUpper, new THREE.Vector3(.005, .15, .42), 1)];
        }
        j.lUpper.quaternion.copy(obj.userData.saxPose[0][0]); j.lFore.quaternion.copy(obj.userData.saxPose[0][1]);
        j.rUpper.quaternion.copy(obj.userData.saxPose[1][0]); j.rFore.quaternion.copy(obj.userData.saxPose[1][1]);
        j.lThigh.rotation.set(0, 0, .03); j.rThigh.rotation.set(0, 0, -.03);
        j.lShin.rotation.set(.03, 0, 0); j.rShin.rotation.set(.03, 0, 0);
    } else if (mode === "lean") {
        const breath = Math.sin(t * 1.25 + ph) * 0.008;
        j.hips.position.y = 0.95 + breath;
        j.hips.rotation.set(0, 0, 0);
        j.spine.rotation.set(0.22, Math.sin(t * 0.22 + ph) * 0.04, 0);
        j.head.rotation.set(0.04, Math.sin(t * 0.28 + ph) * 0.12, 0);
        j.lUpper.rotation.set(-0.7, 0, 0.35);
        j.rUpper.rotation.set(-0.15, 0, -0.12);
        j.lFore.rotation.set(-0.55, 0, 0);
        j.rFore.rotation.set(-0.2, 0, 0);
        j.lThigh.rotation.set(-0.06, 0, 0.04);
        j.rThigh.rotation.set(0.04, 0, -0.03);
        j.lShin.rotation.set(0.12, 0, 0);
        j.rShin.rotation.set(0.04, 0, 0);
    } else {
        // Standing: weight drifts between the feet, the free knee softens, the chest rises with each breath.
        const breath = Math.sin(t * 1.35 + ph) * 0.01;
        const shift = Math.sin(t * 0.55 + ph) * 0.03;
        j.hips.position.y = 0.95 + breath * 0.4 - Math.abs(shift) * 0.08;
        j.hips.rotation.set(0, shift * 0.4, shift * 0.45);
        j.spine.rotation.set(-breath * 0.5, Math.sin(t * 0.32 + ph) * 0.08, -shift * 0.35);
        j.head.rotation.set(Math.sin(t * 0.45 + ph) * 0.03, Math.sin(t * 0.23 + ph) * 0.12, shift * 0.2);
        j.lUpper.rotation.set(0.04, 0, 0.1 + shift * 0.5);
        j.rUpper.rotation.set(0.06, 0, -0.1 - shift * 0.5);
        j.lFore.rotation.set(-0.12, 0, 0);
        j.rFore.rotation.set(-0.12, 0, 0);
        j.lThigh.rotation.set(0.02 + shift * 0.3, 0, 0.03 - shift * 0.3);
        j.rThigh.rotation.set(-0.02 - shift * 0.3, 0, -0.03 - shift * 0.3);
        j.lShin.rotation.set(0.04 + Math.max(0, -shift) * 2.2, 0, 0);
        j.rShin.rotation.set(0.04 + Math.max(0, shift) * 2.2, 0, 0);
        if (ctx.talking) {
            j.head.rotation.y = Math.sin(t * 2.2) * 0.08;
            j.head.rotation.x = -0.05 + Math.sin(t * 3.1) * 0.03;
            j.rFore.rotation.x = -0.55 + Math.sin(t * 5.5) * 0.18;
            j.rUpper.rotation.x = -0.32;
            j.lFore.rotation.x = -0.3 + Math.sin(t * 3.7 + 1) * 0.1;
            j.spine.rotation.x = 0.06;
        }
    }
    if (obj.userData.umbrella && mode !== "sit") {
        j.lUpper.rotation.set(-0.32, 0, 0.1);
        j.lFore.rotation.set(-1.22, 0, 0);
        // Counter the arm hierarchy: the shaft passes through the grip and stays upright.
        obj.userData.umbrella.quaternion.copy(j.hips.quaternion).multiply(j.spine.quaternion)
            .multiply(j.lUpper.quaternion).multiply(j.lFore.quaternion).multiply(j.lHand.quaternion).invert();
    }
}

const PED_SKINS = [0x8d5524, 0xc68642, 0xe0ac69, 0xf1c27d, 0x5c3317, 0x3b2219, 0xd8a47f, 0xa86b45];
const PED_HAIR = [0x1a1208, 0x3b2219, 0x0d0d0d, 0x6b2a18, 0x2a2010, 0x4a3a28, 0x8a6a40, 0x9a9590];
const PED_OUTFITS = ["salesman", "lady", "hood", "clerk", "cabbie", "pedestrian", "lounge", "lady", "vendor"];
const MEN_HAIR = ["short", "pompadour", "crew"];
const WOMEN_HAIR = ["victory", "bob", "updo", "waves"];

export function randomPedestrian(seed = Math.random(), extra = {}) {
    const i = Math.floor(seed * 97);
    const walk = (extra.anim || "walk") === "walk";
    const outfit = extra.outfit || PED_OUTFITS[i % PED_OUTFITS.length];
    const female = OUTFITS[outfit]?.dress;
    return createHuman({
        outfit,
        skin: extra.skin || PED_SKINS[i % PED_SKINS.length],
        hair: extra.hair || PED_HAIR[(i * 3) % PED_HAIR.length],
        hairStyle: extra.hairStyle || (female ? WOMEN_HAIR[i % WOMEN_HAIR.length] : MEN_HAIR[i % MEN_HAIR.length]),
        scale: extra.scale || (female ? 0.9 : 0.95) + (i % 5) * 0.022,
        anim: extra.anim || "walk",
        color: extra.color,
        accent: extra.accent,
        body: extra.body,
        umbrella: extra.umbrella ?? (walk && i % 3 !== 1),
        umbrellaColor: extra.umbrellaColor || [0x1a2744, 0x8b1e1e, 0x2a3040, 0x3a2418][i % 4],
    });
}

const RAVER_OUTFITS = ["raver", "host", "dj"];
const LOUNGE_OUTFITS = ["lounge", "socialite", "singer", "lady", "salesman", "clerk"];

export function randomRaver(seed = Math.random(), extra = {}) {
    const i = Math.floor(seed * 131);
    const neon = ["#ff00aa", "#00fff7", "#39ff14", "#ffb703", "#c77dff"][i % 5];
    return randomPedestrian(seed, {
        outfit: extra.outfit || RAVER_OUTFITS[i % RAVER_OUTFITS.length],
        anim: extra.anim || "dance",
        hairStyle: extra.hairStyle || ["short", "bob", "pompadour", "waves", "crew"][i % 5],
        color: neon,
        accent: neon,
        ...extra,
    });
}

export function randomLounge(seed = Math.random(), extra = {}) {
    return randomPedestrian(seed, {
        outfit: extra.outfit || LOUNGE_OUTFITS[Math.floor(seed * 90) % LOUNGE_OUTFITS.length],
        anim: extra.anim || "idle",
        ...extra,
    });
}
