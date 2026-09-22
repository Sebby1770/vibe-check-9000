import * as THREE from "three";
import { addBox, unitBox } from "./kit.js";
import { printedCard } from "./shop-art.js";
import { createHuman, animateHuman } from "./human.js";
import { WORKSHOPS, STREET_PLACES } from "./expansion.js";

// Interaction points are kept in front of the physical fixtures.
export const STREET_PROPS = STREET_PLACES.filter(
  (p) => p.id !== "payphone",
).map((p) => ({
  ...p,
  type: "prop",
  aimY: 1.25,
  reach: p.id === "busker" ? 3 : 2.4,
  prompt: `[E] ${p.name.toUpperCase()}`,
  action: `street-${p.id}`,
}));
export function buildStreetLife(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const material = (color) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
  const wood = material(0x604538),
    cream = material(0xe6d3ac),
    green = material(0x345c4b),
    red = material(0x985949),
    brass = material(0xc3a36c),
    black = material(0x24383e);
  const box = (g, m, x, y, z, w, h, d) =>
    addBox(g, unitBox, m, x, y, z, w, h, d);
  function sign(
    g,
    lines,
    x,
    y,
    z,
    w,
    h,
    ink = "#24473c",
    paper = "#e8d8b6",
    facing = 0,
  ) {
    const tex = printedCard(lines, { ink, paper, width: 768, height: 384 });
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
    );
    p.position.set(x, y, z);
    p.rotation.y = facing;
    g.add(p);
    return p;
  }
  const cart = new THREE.Group();
  cart.position.set(-44, 0, 17.1);
  root.add(cart);
  box(cart, red, 0, 0.65, 0, 2.6, 1.05, 1);
  box(cart, cream, 0, 1.2, 0, 2.85, 0.12, 1.25);
  for (const x of [-1.2, 1.2]) {
    box(cart, brass, x, 1.85, 0.38, 0.07, 2.6, 0.07);
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.12, 12),
      black,
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.28, 0);
    cart.add(wheel);
  }
  for (let i = 0; i < 9; i++)
    box(cart, i % 2 ? red : cream, -1.4 + i * 0.35, 2.8, 0, 0.35, 0.18, 1.5);
  sign(
    cart,
    ["MABEL'S NIGHT CART", "CHESTNUTS · PRETZELS · COCOA"],
    0,
    1.9,
    -0.46,
    2.5,
    0.63,
    "#5d382c",
    "#eddaae",
    Math.PI,
  );
  const pan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.1, 16),
    black,
  );
  pan.position.set(-0.63, 1.31, 0);
  cart.add(pan);
  const nuts = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.065, 6, 5),
      brass,
      18,
    ),
    dummy = new THREE.Object3D();
  for (let i = 0; i < 18; i++) {
    dummy.position.set(
      -0.63 + Math.sin(i * 2.4) * 0.27,
      1.4,
      Math.cos(i * 2.4) * 0.27,
    );
    dummy.updateMatrix();
    nuts.setMatrixAt(i, dummy.matrix);
  }
  cart.add(nuts);
  for (let i = 0; i < 3; i++)
    box(cart, cream, 0.3 + i * 0.27, 1.4, 0, 0.16, 0.32, 0.16);
  const mabel = createHuman({
    outfit: "lady",
    skin: 0xc68642,
    hair: 0x38221c,
    hairStyle: "bob",
    color: "#be8267",
  });
  mabel.position.set(-45.7, 0, 17.1);
  mabel.rotation.y = Math.PI;
  root.add(mabel);
  const stage = new THREE.Group();
  stage.position.set(44, 0, 14.2);
  root.add(stage);
  box(stage, wood, 0, 0.14, 0, 3.6, 0.28, 1.7);
  box(stage, green, 0, 1.45, -0.65, 3.7, 2.7, 0.1);
  sign(
    stage,
    ["THE CORNER SET", "LISTEN. ANSWER. MAKE A LITTLE NOISE."],
    0,
    2.25,
    -0.56,
    3.4,
    0.68,
    "#e6d1a7",
    "#244a40",
  );
  const musician = createHuman({
    outfit: "salesman",
    skin: 0x8d5524,
    hair: 0x201815,
    hairStyle: "short",
    color: "#667c82",
    scarf: false,
    mouth: false,
  });
  musician.position.set(0.6, 0.28, 0);
  stage.add(musician);
  // One connected brass instrument, attached to the moving torso rather than the stage.
  const sax = new THREE.Group();musician.userData.joints.spine.add(sax);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,.555,.14),new THREE.Vector3(0,.5,.24),
    new THREE.Vector3(-.03,.33,.39),new THREE.Vector3(-.045,.02,.43),
    new THREE.Vector3(-.03,-.17,.45),new THREE.Vector3(.1,-.22,.48),
    new THREE.Vector3(.17,-.09,.5),new THREE.Vector3(.18,.02,.52),
  ]);
  sax.add(new THREE.Mesh(new THREE.TubeGeometry(path,28,.032,8,false),brass));
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(.12,.033,.19,16,1,true),brass);
  bell.position.set(.18,.08,.52);bell.rotation.x=.2;sax.add(bell);
  const bore=new THREE.Mesh(new THREE.CircleGeometry(.098,16),black);
  bore.rotation.x=-Math.PI/2+.2;bore.position.set(.18,.166,.538);sax.add(bore);
  const mouthpiece=new THREE.Mesh(new THREE.CylinderGeometry(.013,.018,.075,8),black);
  mouthpiece.rotation.x=Math.PI/2;mouthpiece.position.set(0,.555,.14);sax.add(mouthpiece);
  for(let i=0;i<6;i++){const key=new THREE.Mesh(new THREE.SphereGeometry(.024,8,6),cream);key.scale.set(1,.45,1);key.position.set(-.055,.27-i*.065,.465);sax.add(key);}
  const strap=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.075,.47,.12),new THREE.Vector3(-.05,.28,.2),new THREE.Vector3(.075,.47,.12)]),12,.008,5,false),black);sax.add(strap);
  box(stage, black, -0.35, 1.05, 0.42, 0.035, 1.65, 0.035);
  box(stage, black, -0.35, 1.8, 0.42, 0.22, 0.08, 0.12);
  const pads = [0x9cbba4, 0xdfba75, 0xb58d91].map((c, i) =>
    box(
      stage,
      new THREE.MeshBasicMaterial({ color: c }),
      -1.1 + i * 0.38,
      0.7,
      0.54,
      0.3,
      0.08,
      0.45,
    ),
  );
  const kiosk = new THREE.Group();
  kiosk.position.set(44, 0, 31.2);
  root.add(kiosk);
  box(kiosk, green, 0, 1.05, 0, 2.7, 2.1, 1.05);
  box(kiosk, cream, 0, 1.23, -0.65, 2.8, 0.12, 0.55);
  box(kiosk, wood, 0, 2.62, 0, 3.2, 0.2, 1.4);
  sign(
    kiosk,
    ["47TH CAMERA CLUB", "SIX FRAMES. ONE IMPOSSIBLE NIGHT."],
    0,
    2.04,
    -0.54,
    2.55,
    0.85,
    "#264b43",
    "#edddba",
    Math.PI,
  );
  for (let i = 0; i < 4; i++)
    sign(
      kiosk,
      [String(i + 10), "47TH"],
      -0.83 + i * 0.54,
      0.71,
      -0.54,
      0.4,
      0.42,
      "#293f43",
      "#b7c1b4",
      Math.PI,
    );
  const cam = box(kiosk, black, -0.6, 1.48, -0.52, 0.45, 0.32, 0.24);
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.14, 12),
    brass,
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(-0.6, 1.48, -0.72);
  kiosk.add(lens);
  const board = new THREE.Group();
  board.position.set(19, 0, 17.45);
  root.add(board);
  box(board, wood, 0, 1.7, 0, 2.6, 1.7, 0.16);
  for (const x of [-1.03, 1.03]) box(board, wood, x, 1, 0, 0.1, 2, 0.1);
  sign(
    board,
    ["TONIGHT ON 47TH", "COUNTERS · CAMERA · THE CORNER SET"],
    0,
    2.15,
    -0.1,
    2.4,
    0.55,
    "#493a31",
    "#e6cf9d",
    Math.PI,
  );
  for (let i = 0; i < 3; i++)
    sign(
      board,
      [
        ["HELP WANTED", "7 COUNTERS"],
        ["WRONG NUMBER", "FOLLOW THE LINE"],
        ["TAKE A PHOTO", "KEEP THE NIGHT"],
      ][i],
      -0.8 + i * 0.8,
      1.38,
      -0.11,
      0.68,
      0.7,
      "#4b5148",
      i % 2 ? "#c9b0a0" : "#d7debe",
      Math.PI,
    );
  box(root, wood, 30, 0.59, 10.05, 1.5, 1.18, 0.75);
  sign(
    root,
    ["LOST PROPERTY", "ONE CASE. NO YEAR."],
    30,
    1.08,
    9.65,
    1.35,
    0.38,
    "#384c45",
    "#d7c7a3",
    Math.PI,
  );
  box(root, black, 30, 1.27, 10.05, 0.78, 0.17, 0.44);
  box(root, brass, 30, 1.39, 10.05, 0.25, 0.07, 0.08);
  box(root, wood, -29.2, 0.49, 36, 1.1, 0.98, 0.7);
  sign(
    root,
    ["THE SILVER SLEEVE", "NO ARTIST · NO YEAR"],
    -29.2,
    1.44,
    36,
    0.63,
    0.68,
    "#283c42",
    "#c3d0cf",
    Math.PI,
  );
  const seals = new Map();
  const positions = [
    [-33.2, 37.51],
    [-21.8, 37.4],
    [-12.2, 37.5],
    [24.6, 37.4],
    [35.9, 37.05],
    [6, 36.65],
    [-25.5, 2.39],
  ];
  WORKSHOPS.forEach((w, i) => {
    const [x, z] = positions[i];
    const p = sign(
      root,
      ["47TH REGULAR", "COUNTER COMPLETE"],
      x,
      1.25,
      z,
      0.65,
      0.36,
      "#eee0b8",
      "#477366",
      Math.PI,
    );
    p.visible = false;
    seals.set(w.id, p);
  });
  // Low planters and festoon bulbs frame the corners without blocking the sidewalk.
  for (const [x, z] of [
    [41.3, 13.8],
    [46.7, 13.8],
    [41.6, 31.2],
    [47, 31.2],
    [-46.5, 17.1],
  ]) {
    box(root, wood, x, 0.28, z, 0.65, 0.56, 0.65);
    const foliage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.46, 0),
      green,
    );
    foliage.position.set(x, 0.85, z);
    root.add(foliage);
  }
  const bulbs = [];
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 7, 5),
      new THREE.MeshBasicMaterial({ color: 0xffd999 }),
    );
    b.position.set(
      41.6 + i * 0.6,
      3.2 - Math.sin((i / 8) * Math.PI) * 0.35,
      14.2,
    );
    root.add(b);
    bulbs.push(b);
  }
  return {
    root,
    musician,
    pads,
    seals,
    setState(s) {
      seals.forEach((p, id) => (p.visible = !!s.workshops[id]));
    },
    update(t, reduced, position) {
      if (Math.hypot(position.x - 44, position.z - 14.2) < 28)
        animateHuman(musician, t, {
          mode: "sax",
          bpm: 100,
        });
      if (Math.hypot(position.x + 44, position.z - 17.1) < 22)
        animateHuman(mabel, t, { mode: "idle", bpm: 80 });
    },
    pulse(index) {
      pads.forEach((p, i) => (p.scale.y = i === index ? 0.14 : 0.08));
    },
  };
}
