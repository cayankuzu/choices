import type { KeyboardControlsEntry } from "@react-three/drei";

import { sceneLayout } from "@/components/game/scene-layout";

export type ControlAction =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "jump"
  | "sprint"
  | "crouch"
  | "interact";

export const controlMap: KeyboardControlsEntry<ControlAction>[] = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
  { name: "sprint", keys: ["ShiftLeft", "ShiftRight"] },
  { name: "crouch", keys: ["ControlLeft", "ControlRight"] },
  { name: "interact", keys: ["KeyE"] },
];

export const roomConfig = {
  width: 7.4,
  depth: 7.4,
  height: 3.2,
  wallThickness: 0.18,
} as const;

export const playerConfig = {
  radius: 0.35,
  halfHeight: 0.55,
  spawn: sceneLayout.playerSpawn,
  standingEyeHeight: 1.62,
  crouchEyeHeight: 1.12,
  jumpVelocity: 5.2,
  groundedEpsilon: 0.03,
} as const;

export const playerGroundCenterHeight =
  playerConfig.radius + playerConfig.halfHeight;

export const standingEyeOffset =
  playerConfig.standingEyeHeight - playerGroundCenterHeight;

export const crouchEyeOffset =
  playerConfig.crouchEyeHeight - playerGroundCenterHeight;

export const collapseSequenceDurations = {
  priming: 1.9,
  surging: 1.8,
  falling: 1.6,
  closing: 1.7,
} as const;
