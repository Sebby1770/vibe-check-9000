import * as THREE from "three";

const GEO = {};

function geo() {
    if (GEO.head) return GEO;
    GEO.head = new THREE.SphereGeometry(0.108, 14, 12);
    GEO.neck = new THREE.CylinderGeometry(0.038, 0.046, 0.09, 8);
    GEO.torso = new THREE.BoxGeometry(0.34, 0.44, 0.18);
    GEO.pelvis = new THREE.BoxGeometry(0.3, 0.16, 0.16);
    GEO.upperArm = new THREE.CapsuleGeometry(0.042, 0.22, 3, 6);
    GEO.forearm = new THREE.CapsuleGeometry(0.036, 0.2, 3, 6);
    GEO.hand = new THREE.BoxGeometry(0.07, 0.09, 0.035);
    GEO.thigh = new THREE.CapsuleGeometry(0.058, 0.34, 3, 6);
    GEO.shin = new THREE.CapsuleGeometry(0.046, 0.32, 3, 6);
    GEO.foot = new THREE.BoxGeometry(0.08, 0.055, 0.2);
    GEO.eye = new THREE.SphereGeometry(0.018, 8, 6);
    GEO.iris = new THREE.SphereGeometry(0.01, 8, 6);
    GEO.brow = new THREE.BoxGeometry(0.046, 0.01, 0.012);
    GEO.nose = new THREE.BoxGeometry(0.028, 0.04, 0.04);
    GEO.ear = new THREE.SphereGeometry(0.028, 6, 6);
    GEO.hairShort = new THREE.SphereGeometry(0.112, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.7);
    GEO.hairBun = new THREE.SphereGeometry(0.055, 8, 6);
    GEO.hatBrim = new THREE.CylinderGeometry(0.17, 0.17, 0.018, 16);
    GEO.hatCrown = new THREE.CylinderGeometry(0.1, 0.11, 0.1, 12);
    GEO.copHat = new THREE.CylinderGeometry(0.11, 0.12, 0.08, 10);
    GEO.newsboy = new THREE.SphereGeometry(0.12, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2);
    GEO.dress = new THREE.CylinderGeometry(0.28, 0.16, 0.7, 10);
    GEO.tie = new THREE.BoxGeometry(0.04, 0.18, 0.012);
    GEO.glow = new THREE.BoxGeometry(0.03, 0.36, 0.03);
    GEO.headphone = new THREE.TorusGeometry(0.12, 0.018, 6, 16, Math.PI);
    GEO.badge = new THREE.CircleGeometry(0.03, 8);
    return GEO;
}

const OUTFITS = {
    dj: { top: 0x111118, bottom: 0x16161e, accent: 0xff2ea6, hat: "none", extra: "headphones", shoes: 0x111111 },
    bartender: { top: 0x1a1410, bottom: 0x16120e, accent: 0xc9a227, hat: "none", extra: "bowtie", shoes: 0x111111 },
    raver: { top: 0x1a0a18, bottom: 0x12121a, accent: 0xff00aa, hat: "none", extra: "glowstick", shoes: 0x111111 },
    host: { top: 0x2a1840, bottom: 0x1a1228, accent: 0xc77dff, hat: "none", extra: "none", shoes: 0x221122 },
    singer: { top: 0x4a1028, bottom: 0x4a1028, accent: 0xd4a017, hat: "none", extra: "dress", shoes: 0x111111, dress: true },
    lounge: { top: 0x1c1a16, bottom: 0x1c1a16, accent: 0xc9a227, hat: "fedora", extra: "tie", shoes: 0x111111 },
    socialite: { top: 0x6b1d3a, bottom: 0x6b1d3a, accent: 0xe8d5a3, hat: "none", extra: "dress", shoes: 0x111111, dress: true },
    salesman: { top: 0x2c3a4a, bottom: 0x1a2430, accent: 0x8b1e1e, hat: "fedora", extra: "tie", shoes: 0x111111 },
    hood: { top: 0x2a241c, bottom: 0x1a1814, accent: 0x4a3a28, hat: "fedora", extra: "none", shoes: 0x1a1a1a },
    cop: { top: 0x1a2744, bottom: 0x1a2744, accent: 0xc9a227, hat: "cop", extra: "badge", shoes: 0x111111 },
    waitress: { top: 0xd8d0c4, bottom: 0x3a2a28, accent: 0xc45c6a, hat: "none", extra: "apron", shoes: 0x221111, dress: true },
    cabbie: { top: 0x3a2a1c, bottom: 0x2a241c, accent: 0xc9a227, hat: "cabbie", extra: "none", shoes: 0x111111 },
    newsboy: { top: 0x4a3a2a, bottom: 0x2a241c, accent: 0x8b1e1e, hat: "newsboy", extra: "papers", shoes: 0x1a1a1a },
    lady: { top: 0x2a3040, bottom: 0x2a3040, accent: 0xc9a227, hat: "none", extra: "dress", shoes: 0x111111, dress: true },
    vendor: { top: 0x3a3428, bottom: 0x2a241c, accent: 0x6a5a3a, hat: "fedora", extra: "none", shoes: 0x111111 },
    clerk: { top: 0x2a2a32, bottom: 0x1a1a22, accent: 0xc9a227, hat: "none", extra: "tie", shoes: 0x111111 },
    pedestrian: { top: 0x2a2430, bottom: 0x1a1a22, accent: 0x4a3a28, hat: "fedora", extra: "none", shoes: 0x111111 },
    barber: { top: 0xf0ece4, bottom: 0x1a1a22, accent: 0xb82828, hat: "none", extra: "none", shoes: 0x111111 },
    pharmacist: { top: 0xe8e4dc, bottom: 0x2a2a32, accent: 0x66ffe0, hat: "none", extra: "tie", shoes: 0x111111 },
    usher: { top: 0x6b1d3a, bottom: 0x1a1018, accent: 0xe0b25a, hat: "none", extra: "tie", shoes: 0x111111 },
    cook: { top: 0xf2eee0, bottom: 0x2a241c, accent: 0xc45c28, hat: "none", extra: "apron", shoes: 0x111111 },
    bellhop: { top: 0x8b1e1e, bottom: 0x1a1010, accent: 0xc9a227, hat: "bellhop", extra: "none", shoes: 0x111111 },
    florist: { top: 0x3a4a32, bottom: 0x2a241c, accent: 0xff6b9a, hat: "none", extra: "apron", shoes: 0x111111 },
};

function mat(color, extra = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: extra.roughness ?? 0.62,
        metalness: extra.metalness ?? 0.08,
        emissive: extra.emissive ?? 0x000000,
        emissiveIntensity: extra.emissiveIntensity ?? 0,
    });
}

function limb(geometry, material, length, axis = "y") {
    const pivot = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    if (axis === "y") mesh.position.y = -length / 2;
    pivot.add(mesh);
    pivot.userData.mesh = mesh;
    return pivot;
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
    spr.position.y = 1.92;
    return spr;
}

export function createHuman(spec = {}) {
    const G = geo();
    const outfitName = spec.outfit || "pedestrian";
    const o = { ...OUTFITS[outfitName] || OUTFITS.pedestrian };
    if (spec.accent) o.accent = spec.accent;
    const skinC = spec.skin ?? 0xc68642;
    const hairC = spec.hair ?? 0x1a1208;
    const hairStyle = spec.hairStyle || "short";
    const root = new THREE.Group();

    const skinM = mat(skinC, { roughness: 0.55 });
    const topM = mat(o.top, {
        roughness: o.dress ? 0.4 : 0.65,
        metalness: o.dress ? 0.25 : 0.08,
        emissive: o.accent,
        emissiveIntensity: outfitName === "raver" || outfitName === "dj" ? 0.18 : 0.04,
    });
    const botM = mat(o.bottom);
    const hairM = mat(hairC, { roughness: 0.7 });
    const shoeM = mat(o.shoes, { roughness: 0.4, metalness: 0.2 });
    const accentM = mat(o.accent, { emissive: o.accent, emissiveIntensity: 0.35, metalness: 0.3 });

    const hips = new THREE.Group();
    hips.position.y = 0.95;
    root.add(hips);

    const pelvis = new THREE.Mesh(G.pelvis, o.dress ? topM : botM);
    hips.add(pelvis);

    const spine = new THREE.Group();
    spine.position.y = 0.12;
    hips.add(spine);
    const torso = new THREE.Mesh(G.torso, topM);
    torso.position.y = 0.22;
    spine.add(torso);

    if (o.extra === "tie" || o.extra === "bowtie") {
        const tie = new THREE.Mesh(G.tie, accentM);
        tie.position.set(0, 0.22, 0.1);
        if (o.extra === "bowtie") tie.scale.set(1.4, 0.35, 1);
        spine.add(tie);
    }
    if (o.extra === "apron") {
        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.02), mat(0xf2eee6));
        apron.position.set(0, 0.02, 0.11);
        spine.add(apron);
    }
    if (o.extra === "badge") {
        const badge = new THREE.Mesh(G.badge, mat(0xc9a227, { metalness: 0.8, roughness: 0.25, emissive: 0xc9a227, emissiveIntensity: 0.2 }));
        badge.position.set(0.12, 0.28, 0.1);
        spine.add(badge);
    }

    const neck = new THREE.Mesh(G.neck, skinM);
    neck.position.y = 0.48;
    spine.add(neck);

    const head = new THREE.Group();
    head.position.y = 0.6;
    spine.add(head);
    const skull = new THREE.Mesh(G.head, skinM);
    head.add(skull);

    const eyeW = mat(0xf2eee6, { roughness: 0.35 });
    const irisM = mat(0x1a120c, { roughness: 0.3 });
    for (const s of [-1, 1]) {
        const eye = new THREE.Mesh(G.eye, eyeW);
        eye.position.set(s * 0.038, 0.02, 0.092);
        const iris = new THREE.Mesh(G.iris, irisM);
        iris.position.set(s * 0.038, 0.02, 0.106);
        const brow = new THREE.Mesh(G.brow, hairM);
        brow.position.set(s * 0.04, 0.055, 0.1);
        const ear = new THREE.Mesh(G.ear, skinM);
        ear.position.set(s * 0.108, 0, 0);
        ear.scale.set(0.6, 1, 0.7);
        head.add(eye, iris, brow, ear);
    }
    const nose = new THREE.Mesh(G.nose, skinM);
    nose.position.set(0, -0.01, 0.1);
    head.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), mat(0x5a2030, { roughness: 0.5 }));
    mouth.position.set(0, -0.045, 0.098);
    head.add(mouth);

    if (hairStyle === "updo") {
        const hair = new THREE.Mesh(G.hairShort, hairM);
        hair.position.y = 0.02;
        const bun = new THREE.Mesh(G.hairBun, hairM);
        bun.position.set(0, 0.12, -0.02);
        head.add(hair, bun);
    } else if (hairStyle === "pompadour") {
        const hair = new THREE.Mesh(G.hairShort, hairM);
        hair.position.set(0, 0.03, 0.02);
        hair.scale.set(1.05, 1.15, 1.1);
        head.add(hair);
    } else {
        const hair = new THREE.Mesh(G.hairShort, hairM);
        hair.position.y = 0.02;
        head.add(hair);
    }

    if (o.hat === "fedora" || o.hat === "cabbie") {
        const brim = new THREE.Mesh(G.hatBrim, mat(0x1a1612, { roughness: 0.55 }));
        brim.position.y = 0.08;
        const crown = new THREE.Mesh(G.hatCrown, mat(0x1a1612, { roughness: 0.55 }));
        crown.position.y = 0.14;
        head.add(brim, crown);
    } else if (o.hat === "cop") {
        const brim = new THREE.Mesh(G.hatBrim, mat(0x1a2744));
        brim.scale.set(0.85, 1, 0.85);
        brim.position.y = 0.08;
        const crown = new THREE.Mesh(G.copHat, mat(0x1a2744));
        crown.position.y = 0.14;
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 12), accentM);
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.11;
        head.add(brim, crown, band);
    } else if (o.hat === "newsboy") {
        const cap = new THREE.Mesh(G.newsboy, mat(0x3a2a1c));
        cap.position.set(0, 0.06, 0.02);
        head.add(cap);
    } else if (o.hat === "bellhop") {
        const pill = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.1, 10), mat(0x8b1e1e));
        pill.position.y = 0.14;
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 12), accentM);
        strap.rotation.x = Math.PI / 2;
        strap.position.y = 0.1;
        head.add(pill, strap);
    }

    if (o.extra === "headphones") {
        const hp = new THREE.Mesh(G.headphone, accentM);
        hp.rotation.z = Math.PI / 2;
        hp.rotation.y = Math.PI / 2;
        hp.position.y = 0.02;
        const cupL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), accentM);
        cupL.position.set(-0.12, 0.02, 0);
        const cupR = cupL.clone();
        cupR.position.x = 0.12;
        head.add(hp, cupL, cupR);
    }

    const lClav = new THREE.Group();
    lClav.position.set(-0.2, 0.4, 0);
    spine.add(lClav);
    const rClav = new THREE.Group();
    rClav.position.set(0.2, 0.4, 0);
    spine.add(rClav);

    const lUpper = limb(G.upperArm, topM, 0.28);
    lUpper.rotation.z = 0.12;
    lClav.add(lUpper);
    const lFore = limb(G.forearm, skinM, 0.24);
    lFore.position.y = -0.28;
    lUpper.add(lFore);
    const lHand = new THREE.Mesh(G.hand, skinM);
    lHand.position.y = -0.26;
    lFore.add(lHand);

    const rUpper = limb(G.upperArm, topM, 0.28);
    rUpper.rotation.z = -0.12;
    rClav.add(rUpper);
    const rFore = limb(G.forearm, skinM, 0.24);
    rFore.position.y = -0.28;
    rUpper.add(rFore);
    const rHand = new THREE.Mesh(G.hand, skinM);
    rHand.position.y = -0.26;
    rFore.add(rHand);

    if (o.extra === "glowstick") {
        const stick = new THREE.Mesh(G.glow, new THREE.MeshBasicMaterial({ color: spec.color || o.accent }));
        stick.position.set(0, 0.18, 0);
        rHand.add(stick);
        root.userData.stick = stick;
    }
    if (o.extra === "papers") {
        const paper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.02), mat(0xd8c9a4, { roughness: 0.9 }));
        paper.position.set(0.04, 0.05, 0.04);
        lHand.add(paper);
    }

    const lHip = new THREE.Group();
    lHip.position.set(-0.09, -0.06, 0);
    hips.add(lHip);
    const rHip = new THREE.Group();
    rHip.position.set(0.09, -0.06, 0);
    hips.add(rHip);

    const lThigh = limb(G.thigh, botM, 0.4);
    lHip.add(lThigh);
    const lShin = limb(G.shin, o.dress ? skinM : botM, 0.36);
    lShin.position.y = -0.4;
    lThigh.add(lShin);
    const lFoot = new THREE.Mesh(G.foot, shoeM);
    lFoot.position.set(0, -0.38, 0.04);
    lShin.add(lFoot);

    const rThigh = limb(G.thigh, botM, 0.4);
    rHip.add(rThigh);
    const rShin = limb(G.shin, o.dress ? skinM : botM, 0.36);
    rShin.position.y = -0.4;
    rThigh.add(rShin);
    const rFoot = new THREE.Mesh(G.foot, shoeM);
    rFoot.position.set(0, -0.38, 0.04);
    rShin.add(rFoot);

    if (o.dress) {
        const dress = new THREE.Mesh(G.dress, topM);
        dress.position.y = -0.18;
        hips.add(dress);
    }

    if (spec.name && spec.color) {
        root.add(nameSprite(spec.name, spec.color));
    }

    const scale = spec.scale || 1;
    root.scale.setScalar(scale);
    root.userData.joints = { hips, spine, head, lUpper, rUpper, lFore, rFore, lThigh, rThigh, lShin, rShin, lHand, rHand };
    root.userData.phase = Math.random() * Math.PI * 2;
    root.userData.mode = spec.anim || "idle";
    root.userData.kind = "human";
    return root;
}

export function createCat(color = 0xcfc8bc) {
    const g = new THREE.Group();
    const fur = mat(color, { roughness: 0.75 });
    const dark = mat(0x1a1210);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), fur);
    body.scale.set(1.45, 0.75, 0.8);
    body.position.y = 0.2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), fur);
    head.position.set(0.18, 0.3, 0);
    const earG = new THREE.ConeGeometry(0.04, 0.08, 4);
    const le = new THREE.Mesh(earG, fur);
    le.position.set(0.14, 0.4, 0.05);
    const re = le.clone();
    re.position.z = -0.05;
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.32, 5), fur);
    tail.position.set(-0.24, 0.3, 0);
    tail.rotation.z = 0.9;
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), dark);
    nose.position.set(0.27, 0.28, 0);
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
    const beat = t * (bpm / 60) * Math.PI * 2 + ph;

    if (mode === "walk") {
        const s = Math.sin(t * 7.2 + ph);
        j.hips.position.y = 0.95 + Math.abs(s) * 0.018;
        j.hips.rotation.set(0, s * 0.04, 0);
        j.spine.rotation.set(0, s * 0.05, 0);
        j.head.rotation.set(0, -s * 0.05, 0);
        j.lThigh.rotation.set(s * 0.55, 0, 0);
        j.rThigh.rotation.set(-s * 0.55, 0, 0);
        j.lShin.rotation.set(Math.max(0, -s) * 0.45, 0, 0);
        j.rShin.rotation.set(Math.max(0, s) * 0.45, 0, 0);
        j.lUpper.rotation.set(-s * 0.35, 0, 0.1);
        j.rUpper.rotation.set(s * 0.35, 0, -0.1);
        j.lFore.rotation.set(-0.15, 0, 0);
        j.rFore.rotation.set(-0.15, 0, 0);
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
        const breath = Math.sin(t * 1.35 + ph) * 0.01;
        const shift = Math.sin(t * 0.55 + ph) * 0.03;
        j.hips.position.y = 0.95 + breath;
        j.hips.rotation.set(0, shift * 0.4, shift * 0.25);
        j.spine.rotation.set(0, Math.sin(t * 0.32 + ph) * 0.08, 0);
        j.head.rotation.set(Math.sin(t * 0.45 + ph) * 0.03, Math.sin(t * 0.23 + ph) * 0.12, 0);
        j.lUpper.rotation.set(0.04, 0, 0.12 + shift);
        j.rUpper.rotation.set(0.06, 0, -0.12 - shift);
        j.lFore.rotation.set(-0.1, 0, 0);
        j.rFore.rotation.set(-0.1, 0, 0);
        j.lThigh.rotation.set(0.04 + shift * 0.4, 0, 0.03);
        j.rThigh.rotation.set(-0.03 - shift * 0.4, 0, -0.03);
        j.lShin.rotation.set(0.04, 0, 0);
        j.rShin.rotation.set(0.03, 0, 0);
        if (ctx.talking) {
            j.head.rotation.y = Math.sin(t * 2.2) * 0.08;
            j.rFore.rotation.x = -0.4 + Math.sin(t * 5.5) * 0.16;
            j.rUpper.rotation.x = -0.32;
            j.spine.rotation.x = 0.06;
        }
    }
}

const PED_SKINS = [0x8d5524, 0xc68642, 0xe0ac69, 0xf1c27d, 0x5c3317, 0x3b2219];
const PED_HAIR = [0x1a1208, 0x3b2219, 0x0d0d0d, 0x6b2a18, 0x2a2010, 0x4a3a28];
const PED_OUTFITS = ["salesman", "lady", "hood", "clerk", "cabbie", "pedestrian", "lounge"];

export function randomPedestrian(seed = Math.random(), extra = {}) {
    const i = Math.floor(seed * 97);
    return createHuman({
        outfit: extra.outfit || PED_OUTFITS[i % PED_OUTFITS.length],
        skin: extra.skin || PED_SKINS[i % PED_SKINS.length],
        hair: extra.hair || PED_HAIR[(i * 3) % PED_HAIR.length],
        hairStyle: extra.hairStyle || (i % 3 === 0 ? "updo" : i % 3 === 1 ? "pompadour" : "short"),
        scale: extra.scale || 0.94 + (i % 5) * 0.025,
        anim: extra.anim || "walk",
        color: extra.color,
        accent: extra.accent,
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
