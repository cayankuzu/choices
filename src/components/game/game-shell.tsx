"use client";

import { KeyboardControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  Group as ThreeGroup,
  PerspectiveCamera as ThreePerspectiveCamera,
  PointLight as ThreePointLight,
  SpotLight as ThreeSpotLight,
} from "three";
import * as THREE from "three";

import {
  collapseSequenceDurations,
  controlMap,
} from "@/components/game/game-config";
import { GameOverlay } from "@/components/game/game-overlay";
import { InteractionTracker } from "@/components/game/interaction-tracker";
import { IntroDirector } from "@/components/game/intro-director";
import { shouldExposeLocalDebug } from "@/components/game/local-debug";
import { type ParallelBranchRequest } from "@/components/game/parallel-branching";
import { sceneLayout } from "@/components/game/scene-layout";
import {
  type GameSnapshot,
  useGameStore,
} from "@/components/game/game-store";
import { Player, type PlayerHandle } from "@/components/game/player";
import { Room } from "@/components/game/room";

type LookState = {
  pitch: number;
  yaw: number;
};

const lookClamp = {
  minPitch: -Math.PI / 2 + 0.08,
  maxPitch: Math.PI / 2 - 0.08,
} as const;

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getLookStateFromForward(
  snapshot: Pick<GameSnapshot, "introPhase" | "playerForward">,
): LookState {
  if (snapshot.introPhase !== "playing") {
    return {
      pitch: sceneLayout.intro.endPitch,
      yaw: sceneLayout.intro.endYaw,
    };
  }

  const [forwardX, forwardY, forwardZ] = snapshot.playerForward;
  const forwardLength = Math.hypot(forwardX, forwardY, forwardZ);

  if (forwardLength < 0.0001) {
    return {
      pitch: sceneLayout.intro.endPitch,
      yaw: sceneLayout.intro.endYaw,
    };
  }

  return {
    pitch: Math.asin(THREE.MathUtils.clamp(forwardY / forwardLength, -1, 1)),
    yaw: Math.atan2(-forwardX, -forwardZ),
  };
}

function SceneLights() {
  const ambientLight = useGameStore((state) => state.settings.ambientLight);
  const directionalLight = useGameStore(
    (state) => state.settings.directionalLight,
  );
  const ceilingLightRef = useRef<ThreeSpotLight | null>(null);
  const accentLightRef = useRef<ThreePointLight | null>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const flicker =
      1 +
      Math.sin(elapsed * 2.7) * 0.08 +
      Math.sin(elapsed * 8.6 + 0.6) * 0.05;

    if (ceilingLightRef.current) {
      ceilingLightRef.current.intensity = 1.15 * flicker;
    }

    if (accentLightRef.current) {
      accentLightRef.current.intensity =
        0.56 + Math.sin(elapsed * 1.4 + 1.1) * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#020408"]} />
      <fog attach="fog" args={["#020408", 5.6, 13.8]} />
      <ambientLight intensity={ambientLight * 0.74} color="#c3cdc7" />
      <hemisphereLight
        intensity={0.42}
        color="#b0c0b8"
        groundColor="#060a10"
      />
      <directionalLight
        position={[2.4, 4.8, 2.6]}
        intensity={directionalLight * 0.76}
        color="#d6dfd4"
      />
      <spotLight
        ref={ceilingLightRef}
        position={[0, 3.02, 0.15]}
        angle={0.72}
        penumbra={1}
        intensity={1.56}
        distance={12.4}
        color="#b8d2b1"
        castShadow={false}
      />
      <pointLight
        ref={accentLightRef}
        position={[2.85, 1.28, 1.85]}
        intensity={0.82}
        distance={5.8}
        decay={2}
        color="#7d565a"
      />
    </>
  );
}

function ViewmodelGunMesh() {
  return (
    <group>
      <mesh position={[0.028, 0.012, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.07]} />
        <meshStandardMaterial
          color="#6b7683"
          roughness={0.18}
          metalness={0.82}
          emissive="#0a0f15"
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh position={[0.106, 0.048, 0]}>
        <boxGeometry args={[0.16, 0.018, 0.052]} />
        <meshStandardMaterial
          color="#919aa4"
          roughness={0.14}
          metalness={0.88}
        />
      </mesh>
      <mesh position={[-0.098, -0.086, 0.032]} rotation={[0, 0, 0.56]}>
        <boxGeometry args={[0.11, 0.198, 0.056]} />
        <meshStandardMaterial
          color="#2e333a"
          roughness={0.58}
          metalness={0.16}
        />
      </mesh>
      <mesh position={[-0.028, -0.048, 0]}>
        <boxGeometry args={[0.126, 0.034, 0.046]} />
        <meshStandardMaterial
          color="#1c232a"
          roughness={0.48}
          metalness={0.18}
        />
      </mesh>
      <mesh position={[-0.008, -0.02, 0.001]}>
        <torusGeometry args={[0.026, 0.0055, 10, 18, Math.PI]} />
        <meshStandardMaterial
          color="#22272d"
          roughness={0.42}
          metalness={0.24}
        />
      </mesh>
      <mesh position={[0.24, 0.008, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.116, 20]} />
        <meshStandardMaterial
          color="#9aa2ab"
          roughness={0.16}
          metalness={0.88}
        />
      </mesh>
      <mesh position={[-0.126, -0.03, -0.034]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.074, 0.04, 0.042]} />
        <meshStandardMaterial
          color="#24292f"
          roughness={0.62}
          metalness={0.14}
        />
      </mesh>
    </group>
  );
}

function GunViewmodel({
  cameraRef,
}: {
  cameraRef: RefObject<ThreePerspectiveCamera | null>;
}) {
  const groupRef = useRef<ThreeGroup | null>(null);
  const collapsePhase = useGameStore((state) => state.collapsePhase);
  const equippedItem = useGameStore((state) => state.equippedItem);
  const gunHeld = useGameStore((state) => state.gunHeld);
  const introPhase = useGameStore((state) => state.introPhase);
  const swayVector = useRef(new THREE.Vector3());
  const localOffset = useRef(new THREE.Vector3());
  const baseOffset = useRef(new THREE.Vector3());
  const phaseStartedAt = useRef<number | null>(null);

  useEffect(() => {
    phaseStartedAt.current = null;
  }, [collapsePhase]);

  useFrame((state) => {
    const camera = cameraRef.current;
    const group = groupRef.current;
    if (!camera || !group) {
      return;
    }

    const visible =
      introPhase === "playing" &&
      gunHeld &&
      equippedItem === "gun" &&
      collapsePhase !== "blackout";

    group.visible = visible;
    if (!visible) {
      return;
    }

    const elapsed = state.clock.getElapsedTime();
    if (collapsePhase !== "idle" && phaseStartedAt.current === null) {
      phaseStartedAt.current = elapsed;
    }

    const phaseElapsed =
      phaseStartedAt.current === null
        ? 0
        : elapsed - phaseStartedAt.current;

    let offsetX = 0.2;
    let offsetY = -0.13;
    let offsetZ = -0.32;
    let pitch = 0.06;
    let yaw = -0.08;
    let roll = -0.04;

    const idleSwayX = Math.sin(elapsed * 1.9) * 0.008;
    const idleSwayY = Math.sin(elapsed * 3.4) * 0.006;

    if (collapsePhase === "priming") {
      const progress = clamp01(
        phaseElapsed / collapseSequenceDurations.priming,
      );
      const raiseProgress =
        progress < 0.72 ? easeInOutCubic(progress / 0.72) : 1;
      offsetX = THREE.MathUtils.lerp(0.22, 0.64, raiseProgress);
      offsetY = THREE.MathUtils.lerp(-0.13, -0.012, raiseProgress);
      offsetZ = THREE.MathUtils.lerp(-0.32, -0.12, easeOutCubic(raiseProgress));
      pitch = THREE.MathUtils.lerp(0.06, -0.14, raiseProgress);
      yaw = THREE.MathUtils.lerp(-0.08, -1.06, raiseProgress);
      roll =
        THREE.MathUtils.lerp(-0.04, -0.54, raiseProgress) +
        Math.sin(phaseElapsed * 9.2) * 0.012;
    } else if (collapsePhase === "surging") {
      const progress = clamp01(
        phaseElapsed / collapseSequenceDurations.surging,
      );
      offsetX = THREE.MathUtils.lerp(0.64, 0.72, easeInOutCubic(progress));
      offsetY = THREE.MathUtils.lerp(-0.012, 0.018, progress);
      offsetZ = THREE.MathUtils.lerp(-0.12, -0.08, progress);
      pitch =
        THREE.MathUtils.lerp(-0.14, -0.04, progress) +
        Math.sin(phaseElapsed * 7.4) * 0.014;
      yaw = THREE.MathUtils.lerp(-1.06, -1.24, easeInOutCubic(progress));
      roll =
        THREE.MathUtils.lerp(-0.54, -0.66, progress) +
        Math.sin(phaseElapsed * 11.5) * 0.018;
    } else if (collapsePhase === "falling") {
      const progress = clamp01(
        phaseElapsed / collapseSequenceDurations.falling,
      );
      offsetX = THREE.MathUtils.lerp(0.72, 0.26, easeInOutCubic(progress));
      offsetY = THREE.MathUtils.lerp(0.018, -0.19, progress);
      offsetZ = THREE.MathUtils.lerp(-0.08, -0.03, progress);
      pitch =
        THREE.MathUtils.lerp(-0.02, 0.88, progress) +
        Math.sin(progress * Math.PI) * 0.06;
      yaw = THREE.MathUtils.lerp(-1.18, 0.18, progress);
      roll = THREE.MathUtils.lerp(-0.66, 0.42, progress);
    } else if (collapsePhase === "closing") {
      offsetX = 0.04;
      offsetY = 0.14;
      offsetZ = -0.12;
      pitch = 0.74;
      yaw = 0.18;
      roll = 0.42;
    }

    baseOffset.current.set(offsetX, offsetY, offsetZ);
    swayVector.current.set(idleSwayX, idleSwayY, 0);
    localOffset.current.copy(baseOffset.current).add(swayVector.current);
    localOffset.current.applyQuaternion(camera.quaternion);

    group.position.copy(camera.position).add(localOffset.current);
    group.quaternion.copy(camera.quaternion);
    group.rotateX(pitch);
    group.rotateY(yaw);
    group.rotateZ(roll);
  });

  return (
    <group ref={groupRef} visible={false}>
      <group position={[-0.16, -0.09, 0.08]} rotation={[0.22, -0.2, -0.32]}>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.12, 0.22, 0.13]} />
          <meshStandardMaterial color="#2b3239" roughness={0.82} metalness={0.08} />
        </mesh>
        <mesh position={[0.02, 0.035, 0.03]}>
          <boxGeometry args={[0.11, 0.12, 0.12]} />
          <meshStandardMaterial color="#b98974" roughness={0.9} metalness={0.02} />
        </mesh>
      </group>
      <group position={[0.08, -0.1, 0.16]} rotation={[0.12, 0.28, 0.18]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.12, 0.24, 0.13]} />
          <meshStandardMaterial color="#2b3239" roughness={0.82} metalness={0.08} />
        </mesh>
        <mesh position={[-0.01, 0.032, -0.02]}>
          <boxGeometry args={[0.11, 0.12, 0.12]} />
          <meshStandardMaterial color="#b78773" roughness={0.9} metalness={0.02} />
        </mesh>
      </group>
      <group position={[0.02, 0.014, 0.02]} rotation={[0.02, -0.08, 0.04]}>
        <ViewmodelGunMesh />
      </group>
    </group>
  );
}

function CameraController({
  cameraRef,
  lookRef,
}: {
  cameraRef: RefObject<ThreePerspectiveCamera | null>;
  lookRef: MutableRefObject<LookState>;
}) {
  const fov = useGameStore((state) => state.settings.fov);
  const collapsePhase = useGameStore((state) => state.collapsePhase);
  const collapseStartedAt = useRef<number | null>(null);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [cameraRef, fov]);

  useEffect(() => {
    collapseStartedAt.current = null;
  }, [collapsePhase]);

  useFrame((state) => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    if (collapsePhase !== "idle" && collapseStartedAt.current === null) {
      collapseStartedAt.current = state.clock.getElapsedTime();
    }

    const collapseElapsed =
      collapseStartedAt.current === null
        ? 0
        : state.clock.getElapsedTime() - collapseStartedAt.current;

    let extraPitch = 0;
    let extraYaw = 0;
    let roll = 0;

    if (collapsePhase === "priming") {
      const progress = clamp01(
        collapseElapsed / collapseSequenceDurations.priming,
      );
      const glanceProgress =
        progress < 0.7 ? easeInOutCubic(progress / 0.7) : 1;
      extraYaw = THREE.MathUtils.lerp(0, 0.62, glanceProgress);
      extraPitch = 0.018 + Math.sin(collapseElapsed * 9.6) * 0.012;
      roll =
        THREE.MathUtils.lerp(0, -0.12, glanceProgress) +
        Math.sin(collapseElapsed * 8.5) * 0.012;
    } else if (collapsePhase === "surging") {
      const progress = clamp01(
        collapseElapsed / collapseSequenceDurations.surging,
      );
      if (progress < 0.76) {
        extraYaw = THREE.MathUtils.lerp(
          0.62,
          0.02,
          easeInOutCubic(progress / 0.76),
        );
      } else {
        extraYaw = THREE.MathUtils.lerp(
          0.02,
          0.04,
          easeInOutCubic((progress - 0.76) / 0.24),
        );
      }

      extraPitch =
        THREE.MathUtils.lerp(0.042, 0.09, progress) +
        Math.sin(collapseElapsed * 12.4) * 0.022;
      roll =
        THREE.MathUtils.lerp(-0.12, -0.18, progress) +
        Math.sin(collapseElapsed * 10.6) * 0.026;
    } else if (collapsePhase === "falling") {
      const progress = Math.min(
        collapseElapsed / collapseSequenceDurations.falling,
        1,
      );
      extraYaw = THREE.MathUtils.lerp(0.04, -0.12, progress);
      extraPitch = THREE.MathUtils.lerp(0.1, 0.82, progress);
      roll = THREE.MathUtils.lerp(-0.18, -0.94, progress) +
        Math.sin(collapseElapsed * 9.2) * 0.038;
    } else if (collapsePhase === "closing") {
      extraYaw = -0.12;
      extraPitch = 0.84;
      roll = -0.98;
    } else if (collapsePhase === "blackout") {
      extraYaw = -0.12;
      extraPitch = 0.86;
      roll = -1.02;
    }

    camera.rotation.order = "YXZ";
    camera.rotation.x = lookRef.current.pitch + extraPitch;
    camera.rotation.y = lookRef.current.yaw + extraYaw;
    camera.rotation.z = roll;
  });

  return null;
}

function MouseSurface({
  lookRef,
  blocked = false,
}: {
  lookRef: MutableRefObject<LookState>;
  blocked?: boolean;
}) {
  const lookEnabled = useGameStore((state) => state.lookEnabled);
  const introPhase = useGameStore((state) => state.introPhase);
  const paused = useGameStore((state) => state.paused);
  const interactionMenuOpen = useGameStore(
    (state) => state.interactionMenuOpen,
  );
  const openNoteId = useGameStore((state) => state.openNoteId);
  const textPanelExpanded = useGameStore(
    (state) => state.textPanelExpanded,
  );
  const collapsePhase = useGameStore((state) => state.collapsePhase);
  const deliverySequencePhase = useGameStore(
    (state) => state.deliverySequencePhase,
  );
  const setLookEnabled = useGameStore((state) => state.setLookEnabled);
  const mouseSensitivity = useGameStore(
    (state) => state.settings.mouseSensitivity,
  );
  const canLook =
    lookEnabled &&
    introPhase === "playing" &&
    !blocked &&
    !paused &&
    !interactionMenuOpen &&
    openNoteId === null &&
    !textPanelExpanded &&
    collapsePhase === "idle" &&
    deliverySequencePhase === "idle";

  const updateLook = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!canLook) {
      return;
    }

    const movementScale = mouseSensitivity * 0.0024;
    lookRef.current.yaw -= event.movementX * movementScale;
    lookRef.current.pitch -= event.movementY * movementScale;
    lookRef.current.pitch = Math.min(
      lookClamp.maxPitch,
      Math.max(lookClamp.minPitch, lookRef.current.pitch),
    );
  };

  return (
    <div
      className={[
        "pointer-events-auto absolute inset-0 z-10",
        canLook ? "cursor-none" : "cursor-default",
      ].join(" ")}
      onClick={() => {
        if (
          introPhase === "playing" &&
          !blocked &&
          !paused &&
          !interactionMenuOpen &&
          openNoteId === null &&
          !textPanelExpanded &&
          collapsePhase === "idle" &&
          deliverySequencePhase === "idle"
        ) {
          setLookEnabled(true);
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      onMouseMove={updateLook}
    >
      {canLook ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-pink-100/78" />
          <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-cyan-50/72" />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe789] shadow-[0_0_16px_rgba(255,231,137,0.48)]" />
        </div>
      ) : null}
    </div>
  );
}

type GameShellProps = {
  canCloseParallel?: boolean;
  externallyFrozen?: boolean;
  freezeLabel?: string | null;
  onCloseParallel?: () => void;
  onOpenParallelBranch?: (request: ParallelBranchRequest) => void;
  onRegisterCapture?: (capture: () => string | null) => void;
};

export function GameShell({
  canCloseParallel = false,
  externallyFrozen = false,
  freezeLabel = null,
  onCloseParallel,
  onOpenParallelBranch,
  onRegisterCapture,
}: GameShellProps) {
  const [initialSnapshot] = useState(() => useGameStore.getState().getSnapshot());
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null);
  const playerRef = useRef<PlayerHandle | null>(null);
  const lookRef = useRef<LookState>(getLookStateFromForward(initialSnapshot));
  const shellRef = useRef<HTMLElement | null>(null);
  const [transcriptMount, setTranscriptMount] =
    useState<HTMLDivElement | null>(null);
  const showPhysicsDebug = useGameStore(
    (state) => state.settings.showPhysicsDebug,
  );

  useEffect(() => {
    if (!onRegisterCapture) {
      return;
    }

    onRegisterCapture(() => {
      const canvas = shellRef.current?.querySelector("canvas");
      if (!(canvas instanceof HTMLCanvasElement)) {
        return null;
      }

      try {
        return canvas.toDataURL("image/png");
      } catch {
        return null;
      }
    });
  }, [onRegisterCapture]);

  useEffect(() => {
    if (!shouldExposeLocalDebug()) {
      return;
    }

    (
      window as typeof window & {
        __choicesDebug?: {
          setLook: (pitch: number, yaw: number) => void;
          teleport: (
            position: readonly [number, number, number],
            forward?: readonly [number, number, number],
          ) => void;
        };
        __choicesStore?: typeof useGameStore;
      }
    ).__choicesStore = useGameStore;
    (
      window as typeof window & {
        __choicesDebug?: {
          setLook: (pitch: number, yaw: number) => void;
          teleport: (
            position: readonly [number, number, number],
            forward?: readonly [number, number, number],
          ) => void;
        };
      }
    ).__choicesDebug = {
      setLook: (pitch, yaw) => {
        lookRef.current = {
          pitch: THREE.MathUtils.clamp(
            pitch,
            lookClamp.minPitch,
            lookClamp.maxPitch,
          ),
          yaw,
        };
      },
      teleport: (position, forward = [0, 0, -1]) => {
        playerRef.current?.teleport(position, forward);
        lookRef.current = getLookStateFromForward({
          introPhase: "playing",
          playerForward: forward,
        });
      },
    };
  }, []);

  return (
    <KeyboardControls map={controlMap}>
      <main
        ref={shellRef}
        className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,153,196,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(126,226,255,0.16),transparent_22%),#05070c] text-white select-none"
      >
        <section className="relative min-h-0 overflow-hidden">
          <Canvas
            className="absolute inset-0 touch-none"
            dpr={[1, 1.8]}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
            }}
          >
            <PerspectiveCamera
              ref={cameraRef}
              makeDefault
              position={[0, 1.65, 3.5]}
              fov={74}
              near={0.05}
              far={40}
            />
            <SceneLights />
            <CameraController cameraRef={cameraRef} lookRef={lookRef} />
            <IntroDirector
              cameraRef={cameraRef}
              lookRef={lookRef}
              externallyFrozen={externallyFrozen}
            />
            <InteractionTracker
              cameraRef={cameraRef}
              interactionBlocked={externallyFrozen}
            />
            <GunViewmodel cameraRef={cameraRef} />
            <Physics
              gravity={[0, -9.81, 0]}
              updateLoop="follow"
              debug={showPhysicsDebug}
            >
              <Room />
              <Player
                ref={playerRef}
                spawn={initialSnapshot.playerPosition}
                initialForward={initialSnapshot.playerForward}
                cameraRef={cameraRef}
                movementBlocked={externallyFrozen}
              />
            </Physics>
          </Canvas>

          <MouseSurface lookRef={lookRef} blocked={externallyFrozen} />
          <GameOverlay
            canCloseParallel={canCloseParallel}
            externallyFrozen={externallyFrozen}
            freezeLabel={freezeLabel}
            onCloseParallel={onCloseParallel}
            onOpenParallelBranch={onOpenParallelBranch}
            transcriptMount={transcriptMount}
          />
        </section>

        <section className="relative z-20 border-t border-white/12 bg-[linear-gradient(180deg,rgba(7,10,19,0.96)_0%,rgba(16,15,34,0.94)_52%,rgba(11,30,42,0.92)_100%)] px-4 py-4 sm:px-6 sm:py-5">
          <div
            ref={setTranscriptMount}
            className="mx-auto w-full max-w-6xl"
          />
        </section>
      </main>
    </KeyboardControls>
  );
}
