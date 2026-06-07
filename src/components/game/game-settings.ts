export type GameSettings = {
  mouseSensitivity: number;
  walkSpeed: number;
  sprintMultiplier: number;
  crouchMultiplier: number;
  fov: number;
  ambientLight: number;
  directionalLight: number;
  showFloorGrid: boolean;
  showPhysicsDebug: boolean;
};

export const defaultGameSettings: GameSettings = {
  mouseSensitivity: 0.92,
  walkSpeed: 4.35,
  sprintMultiplier: 1.58,
  crouchMultiplier: 0.58,
  fov: 76,
  ambientLight: 0.8,
  directionalLight: 1.3,
  showFloorGrid: false,
  showPhysicsDebug: false,
};
