import { ColliderDesc, EventQueue, World, type Collider } from "@dimforge/rapier3d";
import { initRapierWasm } from "./rapierWasm";

export const FIXED_DT = 1 / 60;
export const MAX_STEPS_PER_FRAME = 3;
export const GRAVITY = -9.81;

export const COLLISION = {
  WORLD: 1 << 0,
  PLAYER: 1 << 1,
  SENSOR: 1 << 2,
} as const;

/** Rapier interaction groups: membership in the high 16 bits, filter in the low 16 bits. */
export function groups(membership: number, filter: number): number {
  return ((membership & 0xffff) << 16) | (filter & 0xffff);
}

const ALL = 0xffff;
export const GROUPS = {
  world: groups(COLLISION.WORLD, ALL),
  player: groups(COLLISION.PLAYER, COLLISION.WORLD | COLLISION.SENSOR),
  /** Trigger volumes: intersect the player only, never block anything. */
  sensor: groups(COLLISION.SENSOR, COLLISION.PLAYER),
} as const;

export type Physics = {
  world: World;
  events: EventQueue;
  /**
   * Advances the simulation by whole fixed steps (at most MAX_STEPS_PER_FRAME; a longer stall is
   * dropped, not simulated in bulk). `beforeStep` runs before each step, `afterStep` after it.
   */
  advance(frameSeconds: number, beforeStep: (dt: number) => void, afterStep: (dt: number) => void): number;
  /** Fraction of a step left in the accumulator, for render interpolation. */
  alpha(): number;
  resetAccumulator(): void;
  dispose(): void;
};

export async function initPhysics(): Promise<Physics> {
  await initRapierWasm();
  const world = new World({ x: 0, y: GRAVITY, z: 0 });
  world.timestep = FIXED_DT;
  const events = new EventQueue(true);
  let accumulator = 0;

  return {
    world,
    events,
    advance(frameSeconds, beforeStep, afterStep) {
      accumulator = Math.min(accumulator + frameSeconds, FIXED_DT * MAX_STEPS_PER_FRAME);
      let steps = 0;
      while (accumulator >= FIXED_DT) {
        beforeStep(FIXED_DT);
        world.step(events);
        afterStep(FIXED_DT);
        accumulator -= FIXED_DT;
        steps++;
      }
      return steps;
    },
    alpha: () => accumulator / FIXED_DT,
    resetAccumulator: () => {
      accumulator = 0;
    },
    dispose: () => {
      events.free();
      world.free();
    },
  };
}

/** Axis-aligned static box collider (centre + half extents) with no rigid body. */
export function addStaticBox(world: World, cx: number, cy: number, cz: number, hx: number, hy: number, hz: number): Collider {
  return world.createCollider(ColliderDesc.cuboid(hx, hy, hz).setTranslation(cx, cy, cz).setCollisionGroups(GROUPS.world));
}
