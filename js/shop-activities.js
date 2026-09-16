import * as THREE from "three";
import { unitBox, addBox } from "./kit.js";
import { recordSleeve } from "./shop-art.js";

export function createShopActivities(scene, camera) {
  const cream = new THREE.MeshStandardMaterial({
    color: 0xe9dbc1,
    roughness: 0.55,
  });
  const green = new THREE.MeshStandardMaterial({
    color: 0x426b48,
    roughness: 0.8,
  });
  const amber = new THREE.MeshStandardMaterial({
    color: 0x967439,
    roughness: 0.3,
  });
  const petals = new THREE.MeshStandardMaterial({
    color: 0xc75f83,
    roughness: 0.75,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xaab6ba,
    metalness: 0.65,
    roughness: 0.3,
  });
  const flowerGeo = new THREE.SphereGeometry(0.065, 6, 5),
    stemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 5);
  const bouquet = () => {
    const group = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4,
        r = i ? 0.12 : 0;
      const stem = new THREE.Mesh(stemGeo, green);
      stem.position.set(Math.cos(a) * r, 0.19, Math.sin(a) * r);
      group.add(stem);
      const f = new THREE.Mesh(flowerGeo, petals);
      f.position.set(stem.position.x, 0.4 + (i % 3) * 0.025, stem.position.z);
      group.add(f);
    }
    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.075, 0.22, 10),
      cream,
    );
    vase.position.y = 0.1;
    group.add(vase);
    return group;
  };
  const bottle = () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.32, 10),
      green,
    );
    body.position.y = 0.16;
    g.add(body);
    addBox(g, unitBox, amber, 0, 0.37, 0, 0.07, 0.12, 0.07);
    addBox(g, unitBox, cream, 0, 0.17, 0.082, 0.11, 0.15, 0.005);
    return g;
  };
  const flowers = bouquet();
  flowers.position.set(-1.6, 5.5, -13.2);
  flowers.visible = false;
  scene.add(flowers);
  const gin = bottle();
  gin.position.set(-11.7, 5.17, 7.4);
  gin.visible = false;
  scene.add(gin);
  const ice = new THREE.Group();
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.3, 12),
    silver,
  );
  bucket.position.y = 0.15;
  ice.add(bucket);
  for (let i = 0; i < 6; i++)
    addBox(
      ice,
      unitBox,
      cream,
      Math.sin(i) * 0.12,
      0.31,
      Math.cos(i) * 0.12,
      0.075,
      0.075,
      0.075,
    );
  ice.position.set(9.15, 5.15, -10.2);
  ice.visible = false;
  scene.add(ice);
  const held = new THREE.Group();
  held.position.set(0.2, -0.37, -0.65);
  camera.add(held);
  const vinyl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.34),
    new THREE.MeshBasicMaterial({ map: recordSleeve(0) }),
  );
  vinyl.rotation.z = -0.12;
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.065, 0.19, 14),
    cream,
  );
  const food = new THREE.Group();
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.015, 20),
    cream,
  );
  food.add(plate);
  const slice = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145, 0.145, 0.065, 3),
    new THREE.MeshStandardMaterial({ color: 0xd6a365, roughness: 0.8 }),
  );
  slice.position.y = 0.04;
  food.add(slice);
  const handFlowers = bouquet();
  handFlowers.scale.setScalar(0.8);
  const handBottle = bottle();
  held.add(vinyl, cup, food, handFlowers, handBottle);
  held.children.forEach((c) => (c.visible = false));
  let remaining = 0,
    service = null;
  return {
    setState(state) {
      flowers.visible = state.deliveries.includes("velma");
      gin.visible = state.deliveries.includes("marco");
      ice.visible = state.deliveries.includes("frank");
      const flower = state.completed.find((id) =>
        ["velvet-roses", "golden-hour", "moon-garden"].includes(id),
      );
      petals.color.set(
        flower === "golden-hour"
          ? 0xe8bf66
          : flower === "moon-garden"
            ? 0xe5e7c7
            : 0xc75f83,
      );
    },
    show(result) {
      held.children.forEach((c) => (c.visible = false));
      const kind = result.item?.kind || result.effect;
      const obj =
        kind === "record"
          ? vinyl
          : kind === "flowers"
            ? handFlowers
            : kind === "gin"
              ? handBottle
              : kind === "coffee" || kind === "tonic"
                ? cup
                : kind === "pie"
                  ? food
                  : null;
      if (obj) {
        obj.visible = true;
        remaining = 7;
        if (kind === "record") {
          const old = vinyl.material.map;
          vinyl.material.map = recordSleeve(
            ["midnight-current", "blue-hour", "tomorrow-again"].indexOf(
              result.item.id,
            ),
          );
          old.dispose();
        }
      }
      service = result.effect === "haircut" ? 3 : null;
    },
    update(dt, t, reduced, npcs) {
      if (remaining > 0) {
        remaining -= dt;
        held.position.y = -0.37 + (reduced ? 0 : Math.sin(t * 2) * 0.01);
        if (remaining <= 0) held.children.forEach((c) => (c.visible = false));
      }
      if (service > 0) {
        service -= dt;
        const tony = npcs.find((p) => p.id === "tony");
        if (tony) {
          tony.obj.rotation.y = Math.PI;
          tony.obj.rotation.z = reduced ? 0 : Math.sin(t * 8) * 0.025;
        }
      } else {
        const tony = npcs.find((p) => p.id === "tony");
        if (tony) tony.obj.rotation.z = 0;
      }
    },
  };
}
