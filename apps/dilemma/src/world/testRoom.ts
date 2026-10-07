import { ActiveCollisionTypes, ColliderDesc, type Collider } from "@dimforge/rapier3d";
import { BoxGeometry, DirectionalLight, HemisphereLight, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, type Scene, type Material, Group } from "three";
import { addStaticBox, GROUPS, type Physics } from "../engine/physics";

/** F0 test room (FAZLAR Faz 0): 24×24 m, 1 m cube, 0.35 m step, 4×3×3 m building, one door trigger. */
export const ROOM = {
  size: 24,
  wallHeight: 3,
  spawn: [0, 0, 4] as const,
  cube: { center: [3, 0.5, -4], half: [0.5, 0.5, 0.5] },
  step: { center: [-3, 0.175, -4], half: [1, 0.175, 0.5] },
  building: { center: [0, 1.5, -9], half: [2, 1.5, 1.5] },
  /** Trigger volume in front of the building's door (front face at z = -7.5). */
  door: { id: "test-door", center: [0, 1.1, -6.9], half: [0.6, 1.1, 0.5] },
  /** Light pollution of the stand-in zone (Ferman's house: 0.55). */
  pollution: 0.55,
} as const;

type Box = { center: readonly [number, number, number]; half: readonly [number, number, number] };

export type TestRoom = {
  readonly group: Group;
  readonly spawn: readonly [number, number, number];
  /** True while the player capsule overlaps the door trigger. */
  readonly inDoor: boolean;
  /** Call after every physics step with the player collider. */
  afterStep(player: Collider): void;
  /** 0 disables shadows; otherwise the directional light's map size. */
  setShadowMapSize(size: number): void;
  dispose(): void;
};

export function createTestRoom(scene: Scene, physics: Physics, onDoor: (inside: boolean) => void): TestRoom {
  const group = new Group();
  group.name = "test-room";
  const meshes: Mesh[] = [];
  const materials: Material[] = [];
  const colliders: Collider[] = [];
  const { world } = physics;

  const lambert = (color: number): MeshLambertMaterial => {
    const m = new MeshLambertMaterial({ color });
    materials.push(m);
    return m;
  };
  const box = (b: Box, material: Material, shadows: boolean): Mesh => {
    const mesh = new Mesh(new BoxGeometry(b.half[0] * 2, b.half[1] * 2, b.half[2] * 2), material);
    mesh.position.set(b.center[0], b.center[1], b.center[2]);
    mesh.castShadow = shadows;
    mesh.receiveShadow = true;
    group.add(mesh);
    meshes.push(mesh);
    colliders.push(addStaticBox(world, b.center[0], b.center[1], b.center[2], b.half[0], b.half[1], b.half[2]));
    return mesh;
  };

  const half = ROOM.size / 2;
  const wallHalf = ROOM.wallHeight / 2;
  const floorMaterial = lambert(0x3a3b42);
  const wallMaterial = lambert(0x4a4c58);
  // Floor top at y = 0.
  box({ center: [0, -0.1, 0], half: [half, 0.1, half] }, floorMaterial, false);
  box({ center: [0, wallHalf, -half], half: [half, wallHalf, 0.1] }, wallMaterial, false);
  box({ center: [0, wallHalf, half], half: [half, wallHalf, 0.1] }, wallMaterial, false);
  box({ center: [-half, wallHalf, 0], half: [0.1, wallHalf, half] }, wallMaterial, false);
  box({ center: [half, wallHalf, 0], half: [0.1, wallHalf, half] }, wallMaterial, false);
  box(ROOM.cube, lambert(0x8a5a3a), true);
  box(ROOM.step, lambert(0x6a6a70), true);
  box(ROOM.building, lambert(0x55606a), true);

  // Door marker on the building's front face (flat colour, no asset).
  const doorMaterial = new MeshBasicMaterial({ color: 0xffb347 });
  materials.push(doorMaterial);
  const door = new Mesh(new PlaneGeometry(0.9, 2.1), doorMaterial);
  door.position.set(0, 1.05, ROOM.building.center[2] + ROOM.building.half[2] + 0.01);
  group.add(door);
  meshes.push(door);

  // Door trigger: a sensor that only the player intersects. Static vs kinematic pairs are off by
  // default in Rapier, so the sensor opts into KINEMATIC_FIXED.
  const d = ROOM.door;
  const sensor = world.createCollider(
    ColliderDesc.cuboid(d.half[0], d.half[1], d.half[2])
      .setTranslation(d.center[0], d.center[1], d.center[2])
      .setSensor(true)
      .setCollisionGroups(GROUPS.sensor)
      .setActiveCollisionTypes(ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED),
  );
  colliders.push(sensor);

  // Lighting until the F4 bake: hemisphere + one dim "starlight" directional (shadows per tier).
  const hemisphere = new HemisphereLight(0x3c4e78, 0x1c1814, 1.8);
  const sun = new DirectionalLight(0x9db4ff, 0.9);
  sun.position.set(6, 10, 4);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -14;
  sun.shadow.camera.right = sun.shadow.camera.top = 14;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0005;
  group.add(hemisphere, sun, sun.target);
  scene.add(group);

  let inDoor = false;
  return {
    group,
    spawn: ROOM.spawn,
    get inDoor() {
      return inDoor;
    },
    afterStep(player) {
      const inside = world.intersectionPair(sensor, player);
      if (inside === inDoor) return;
      inDoor = inside;
      onDoor(inside);
    },
    setShadowMapSize(size) {
      sun.castShadow = size > 0;
      if (size > 0 && sun.shadow.mapSize.x !== size) {
        sun.shadow.mapSize.set(size, size);
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
      }
    },
    dispose() {
      scene.remove(group);
      for (const mesh of meshes) mesh.geometry.dispose();
      for (const material of materials) material.dispose();
      sun.shadow.map?.dispose();
      sun.dispose();
      hemisphere.dispose();
      for (const collider of colliders) world.removeCollider(collider, false);
    },
  };
}
