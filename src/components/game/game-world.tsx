"use client";

import { KeyboardControls, type KeyboardControlsEntry } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { memo, Suspense } from "react";
import * as THREE from "three";

import type {
  BulletImpact,
  ControlAction,
  GameSnapshot,
  InteractionId,
  PlayerTelemetry,
} from "@/components/game/game-types";
import { PlayerController } from "@/components/game/player-controller";
import { WorldGeometry } from "@/components/game/world-geometry";

const controls: KeyboardControlsEntry<ControlAction>[] = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
  { name: "jump", keys: ["Space"] },
];

type GameWorldProps = {
  active: boolean;
  cinematicProgress: number;
  lookSensitivity: number;
  onFire: (impact: Omit<BulletImpact, "id"> | null) => void;
  onInteractionChange: (interaction: InteractionId) => void;
  onLockChange: (locked: boolean) => void;
  onPlayerUpdate: (telemetry: PlayerTelemetry) => void;
  shotTick: number;
  snapshot: GameSnapshot;
  wakeStartedAt: number | null;
};

export const GameWorld = memo(function GameWorld({
  active,
  cinematicProgress,
  lookSensitivity,
  onFire,
  onInteractionChange,
  onLockChange,
  onPlayerUpdate,
  shotTick,
  snapshot,
  wakeStartedAt,
}: GameWorldProps) {
  return (
    <KeyboardControls map={controls}>
      <Canvas
        camera={{ far: 130, fov: 70, near: 0.04, position: [-6.55, 1.16, -6.5] }}
        dpr={[1, 1.65]}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
        shadows
      >
        <color attach="background" args={["#aebdb5"]} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -18, 0]} timeStep={1 / 60}>
            <WorldGeometry cinematicProgress={cinematicProgress} snapshot={snapshot} />
            <PlayerController
              active={active}
              cinematicProgress={cinematicProgress}
              lookSensitivity={lookSensitivity}
              onFire={onFire}
              onInteractionChange={onInteractionChange}
              onLockChange={onLockChange}
              onPlayerUpdate={onPlayerUpdate}
              shotTick={shotTick}
              snapshot={snapshot}
              wakeStartedAt={wakeStartedAt}
            />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
});
