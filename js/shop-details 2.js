import * as THREE from "three";
import { addBox, unitBox } from "./kit.js";
import { SHOPS } from "./zones.js";
import { printedCard, recordSleeve, checkerFloor } from "./shop-art.js";

export function decorateShops(root, mats) {
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb79a61,
    metalness: 0.55,
    roughness: 0.4,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: 0xdfd1b4,
    roughness: 0.9,
  });
  const green = new THREE.MeshStandardMaterial({
    color: 0x385f49,
    roughness: 0.75,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xa4c8bf,
    transparent: true,
    opacity: 0.17,
    roughness: 0.22,
    metalness: 0.1,
    depthWrite: false,
  });
  const slate = new THREE.MeshStandardMaterial({
    color: 0x263d3e,
    roughness: 0.85,
  });
  function card(lines, x, y, z, w, h, options = {}) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: printedCard(lines, options) }),
    );
    mesh.position.set(x, y, z);
    mesh.rotation.y = Math.PI;
    root.add(mesh);
    return mesh;
  }
  function bottleRows(x, z, width, rows, cols, color) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.15,
    });
    const bottles = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.075, 0.065, 0.28, 7),
      mat,
      rows * cols,
    );
    const dummy = new THREE.Object3D();
    let k = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        dummy.position.set(
          x - width / 2 + (c * width) / (cols - 1),
          1.55 + r * 0.43,
          z,
        );
        dummy.updateMatrix();
        bottles.setMatrixAt(k++, dummy.matrix);
      }
    root.add(bottles);
    for (let r = 0; r < rows; r++)
      addBox(
        root,
        unitBox,
        mats.wood,
        x,
        1.37 + r * 0.43,
        z,
        width + 0.3,
        0.065,
        0.25,
      );
  }
  for (const s of SHOPS) {
    const cx = (s.minX + s.maxX) / 2,
      w = s.maxX - s.minX;
    const wallMat = new THREE.MeshStandardMaterial({
      color: {
        records: 0x687163,
        pharmacy: 0xb7cbbb,
        florist: 0xc2b29b,
        rivoli: 0x422936,
        liquor: 0x887553,
        barber: 0xb5bbb0,
      }[s.id],
      roughness: 0.88,
    });
    addBox(root, unitBox, wallMat, s.minX + 0.04, 1.95, 36.05, 0.12, 3.9, 7.95);
    addBox(root, unitBox, wallMat, s.maxX - 0.04, 1.95, 36.05, 0.12, 3.9, 7.95);
    addBox(root, unitBox, wallMat, cx, 1.95, 39.95, w, 3.9, 0.12);
    addBox(root, unitBox, slate, cx, 3.9, 36.05, w, 0.12, 7.95);
    addBox(root, unitBox, mats.wood, cx, 0.16, 39.8, w, 0.3, 0.12);
    for (const [left, right] of [
      [s.minX + 0.2, s.doorX - 1.38],
      [s.doorX + 1.38, s.maxX - 0.2],
    ]) {
      if (right - left < 0.2) continue;
      const middle = (left + right) / 2,
        span = right - left;
      addBox(root, unitBox, slate, middle, 0.42, 32.02, span, 0.84, 0.16);
      addBox(root, unitBox, glass, middle, 1.73, 32.01, span, 1.8, 0.018);
      addBox(root, unitBox, brass, middle, 2.64, 31.96, span, 0.065, 0.08);
      addBox(root, unitBox, brass, middle, 0.86, 31.96, span, 0.065, 0.08);
      addBox(root, unitBox, brass, middle, 1.74, 31.96, 0.045, 1.8, 0.08);
    }
    card(["OPEN LATE", "COME ON IN"], s.doorX + 0.95, 2.14, 31.85, 0.5, 0.55, {
      ink: "#304f45",
      paper: "#e9d7b0",
    });
    addBox(root, unitBox, mats.wood, s.doorX, 0.012, 32.85, 2.25, 0.035, 1.2);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xf1d7a1 }),
    );
    lamp.position.set(cx, 3.5, 35.0);
    root.add(lamp);
    addBox(root, unitBox, brass, cx, 3.75, 35, 0.035, 0.35, 0.035);
  }
  const sleeveMats = [0, 1, 2].map(
    (i) => new THREE.MeshBasicMaterial({ map: recordSleeve(i) }),
  );
  for (let i = 0; i < 3; i++) {
    const album = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 1.15),
      sleeveMats[i],
    );
    album.position.set(-35.1 + i * 1.9, 2.58, 39.82);
    album.rotation.y = Math.PI;
    root.add(album);
    const copies = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.48, 0.48, 0.045),
      sleeveMats[i],
      12,
    );
    const d = new THREE.Object3D();
    for (let j = 0; j < 12; j++) {
      d.position.set(
        j < 6 ? -36.6 : -30,
        0.88,
        33.4 + (j % 6) * 0.4 + i * 0.065,
      );
      d.rotation.set(-0.18, 0, 0);
      d.updateMatrix();
      copies.setMatrixAt(j, d.matrix);
    }
    root.add(copies);
  }
  card(
    ["FLIP THROUGH THE BINS", "33⅓ • LONG PLAY • GOOD TROUBLE"],
    -33.2,
    3.39,
    39.79,
    6.3,
    0.45,
  );
  card(["JAZZ"], -36.6, 0.91, 33.2, 0.85, 0.3);
  card(["TOMORROW"], -30, 0.91, 33.2, 0.95, 0.3);
  const player = addBox(
    root,
    unitBox,
    slate,
    -30.1,
    0.92,
    36.7,
    1.25,
    0.16,
    0.8,
  );
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.012, 32),
    mats.black,
  );
  disc.position.set(-30.1, 1.02, 36.7);
  root.add(disc);
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.016, 24),
    brass,
  );
  label.position.copy(disc.position);
  label.position.y += 0.008;
  root.add(label);
  addBox(root, unitBox, brass, -29.65, 1.05, 36.6, 0.025, 0.025, 0.45);
  card(["LISTEN HERE", "SID DOESN'T MIND"], -29.9, 1.6, 37.0, 1.6, 0.55);
  bottleRows(-21.8, 39.73, 7, 4, 16, 0x649781);
  card(
    ["IRIS'S SODA FOUNTAIN", "MINT • CHERRY • VANILLA"],
    -21.8,
    3.36,
    39.76,
    6.1,
    0.56,
    { ink: "#254d42" },
  );
  const tile = new THREE.MeshStandardMaterial({
    map: checkerFloor("#87a397", "#dedcc8", 16),
    roughness: 0.75,
  });
  addBox(root, unitBox, tile, -21.8, 0.045, 36, 9.6, 0.06, 7.6);
  for (let i = 0; i < 3; i++) {
    addBox(
      root,
      unitBox,
      mats.chrome,
      -24.6 + i * 0.37,
      1.27,
      33.62,
      0.055,
      0.35,
      0.055,
    );
    addBox(
      root,
      unitBox,
      brass,
      -24.6 + i * 0.37,
      1.47,
      33.5,
      0.06,
      0.055,
      0.22,
    );
    const soda = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.055, 0.2, 9),
      paper,
    );
    soda.position.set(-24.55 + i * 0.37, 1.2, 33.25);
    root.add(soda);
  }
  const petalGeo = new THREE.SphereGeometry(0.12, 6, 5),
    stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.7, 5);
  for (const [k, color] of [0xd07792, 0xe5c075, 0xcbd3b4].entries()) {
    const blooms = new THREE.InstancedMesh(
      petalGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
      35,
    );
    const stems = new THREE.InstancedMesh(stemGeo, green, 35),
      d = new THREE.Object3D();
    for (let j = 0; j < 35; j++) {
      const cluster = Math.floor(j / 7),
        a = j * 2.4;
      const x = -14.1 + (cluster % 2) * 3.5 + Math.cos(a) * 0.24,
        z =
          33.6 + Math.floor(cluster / 2) * 1.4 + Math.sin(a) * 0.24 + k * 0.07;
      d.position.set(x, 1.08 + (j % 3) * 0.06 + k * 0.09, z);
      d.scale.set(1, 1, 1);
      d.updateMatrix();
      blooms.setMatrixAt(j, d.matrix);
      d.position.y -= 0.36;
      d.updateMatrix();
      stems.setMatrixAt(j, d.matrix);
    }
    root.add(blooms, stems);
  }
  card(
    ["LILY'S FLOWER STUDIO", "A LITTLE COLOR FOR THE PIANO"],
    -12.2,
    2.6,
    39.8,
    4.8,
    0.85,
    { ink: "#75404b" },
  );
  addBox(root, unitBox, paper, -12.2, 0.9, 38.3, 2.5, 0.02, 0.6);
  addBox(root, unitBox, brass, -11.1, 0.95, 38.0, 0.28, 0.055, 0.12);
  bottleRows(24.6, 39.75, 7.3, 4, 16, 0x827b38);
  card(
    ["THE SMOOTH CENTURY", "SEALED BOTTLES • HONEST COMPANY"],
    24.6,
    3.36,
    39.8,
    6.3,
    0.5,
    { ink: "#4f4933" },
  );
  for (let i = 0; i < 3; i++) {
    addBox(root, unitBox, mats.wood, 21 + i * 1.1, 0.35, 33.5, 0.85, 0.7, 0.65);
    card(["MIDTOWN", "RESERVE"], 21 + i * 1.1, 0.39, 33.15, 0.63, 0.42, {
      ink: "#5d4933",
      paper: "#bc9c68",
    });
  }
  const barberTile = new THREE.MeshStandardMaterial({
    map: checkerFloor("#38494a", "#e2d9c1", 16),
    roughness: 0.7,
  });
  addBox(root, unitBox, barberTile, 35.9, 0.055, 36, 9, 0.06, 7.6);
  card(
    ["TONY'S", "THREE CUTS. ONE GOOD PORTRAIT."],
    35.9,
    2.95,
    39.8,
    6.5,
    0.75,
    { ink: "#53453b" },
  );
  for (let i = 0; i < 4; i++) {
    addBox(root, unitBox, paper, 32.8 + i * 0.4, 1.36, 37.7, 0.17, 0.18, 0.17);
    addBox(
      root,
      unitBox,
      mats.black,
      36 + i * 0.18,
      1.32,
      37.7,
      0.08,
      0.04,
      0.3,
    );
  }
  const mirrors = new THREE.MeshBasicMaterial({ color: 0x849e99 });
  for (const x of [34.15, 37]) {
    addBox(root, unitBox, brass, x, 2.1, 39.68, 1.7, 1.55, 0.08);
    addBox(root, unitBox, mirrors, x, 2.1, 39.61, 1.56, 1.4, 0.025);
  }
  card(["THE RIVOLI", "BOX OFFICE →"], 1.4, 2.9, 39.76, 5, 0.8, {
    ink: "#e2bd7d",
    paper: "#422936",
  });
  for (let i = 0; i < 3; i++) {
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 1.8),
      sleeveMats[i],
    );
    poster.position.set(-5 + i * 2.1, 2, 39.76);
    poster.rotation.y = Math.PI;
    root.add(poster);
  }
  addBox(
    root,
    unitBox,
    new THREE.MeshStandardMaterial({ color: 0x5f273b, roughness: 1 }),
    9.2,
    2.15,
    38.2,
    0.2,
    3.5,
    3,
  );
  const curtain = new THREE.MeshStandardMaterial({
    color: 0x702b3f,
    roughness: 1,
  });
  for (const x of [9.65, 16.9])
    for (let j = 0; j < 4; j++)
      addBox(
        root,
        unitBox,
        curtain,
        x + j * 0.12,
        2.1,
        39.5,
        0.13,
        3.5,
        0.18 + (j % 2) * 0.1,
      );
  card(
    ["SCREEN ONE", "YOUR STUB IS YOUR INVITATION"],
    13,
    3.57,
    39.4,
    6.4,
    0.35,
    { ink: "#d9c18c", paper: "#241e24" },
  );
  return { disc, label };
}
