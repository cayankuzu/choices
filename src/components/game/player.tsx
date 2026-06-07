"use client";

import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import {
  CapsuleCollider,
  type RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

import {
  collapseSequenceDurations,
  crouchEyeOffset,
  playerConfig,
  playerGroundCenterHeight,
  standingEyeOffset,
  type ControlAction,
} from "@/components/game/game-config";
import { useGameStore } from "@/components/game/game-store";

export type PlayerHandle = {
  reset: () => void;
  teleport: (
    position: readonly [number, number, number],
    forward?: readonly [number, number, number],
  ) => void;
};

type PlayerProps = {
  spawn: readonly [number, number, number];
  initialForward: readonly [number, number, number];
  cameraRef: RefObject<THREE.PerspectiveCamera | null>;
  movementBlocked?: boolean;
};

const zeroVector = { x: 0, y: 0, z: 0 };
const worldUp = new THREE.Vector3(0, 1, 0);

const movementTuning = {
  groundAcceleration: 26,
  groundDeceleration: 22,
  airAcceleration: 8,
  airDeceleration: 2.5,
  airControl: 0.7,
  coyoteTime: 0.12,
  jumpBuffer: 0.16,
  jumpCutGravityBoost: 15,
  fallGravityBoost: 11,
  maxFallSpeed: -18,
  groundedMaxRiseSpeed: 1.4,
  groundedStickVelocity: -0.6,
  groundProbeOffset: 0.08,
  groundProbeLength: playerGroundCenterHeight + 0.22,
  crouchSmoothing: 12,
  bobFrequency: 10,
  bobAmplitude: 0.024,
  bobSmoothing: 10,
  landingDipScale: 0.011,
  landingDipCap: 0.08,
  landingRecover: 9,
  motionFovBoost: 2.4,
  sprintFovBoost: 1.6,
  fovSmoothing: 7.5,
} as const;

export const Player = forwardRef<PlayerHandle, PlayerProps>(function Player(
  { spawn, initialForward, cameraRef, movementBlocked = false },
  ref,
) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const bobPhase = useRef(0);
  const bobOffset = useRef(0);
  const cameraHeight = useRef(standingEyeOffset);
  const jumpHeld = useRef(false);
  const landingDip = useRef(0);
  const lastGroundedAt = useRef(Number.NEGATIVE_INFINITY);
  const lastJumpPressedAt = useRef(Number.NEGATIVE_INFINITY);
  const lastVerticalVelocity = useRef(0);
  const wasGrounded = useRef(false);
  const collapseStartedAt = useRef<number | null>(null);
  const lastPoseSyncAt = useRef(0);
  const lastSyncedPosition = useRef(new THREE.Vector3());
  const lastSyncedForward = useRef(new THREE.Vector3(0, 0, -1));
  const [, getKeys] = useKeyboardControls<ControlAction>();
  const { rapier, world } = useRapier();
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
  const settings = useGameStore((state) => state.settings);
  const setPlayerPose = useGameStore((state) => state.setPlayerPose);

  const spawnVector = useMemo(
    () => new THREE.Vector3(spawn[0], spawn[1], spawn[2]),
    [spawn],
  );
  const spawnForwardVector = useMemo(() => {
    const forwardVector = new THREE.Vector3(
      initialForward[0],
      initialForward[1],
      initialForward[2],
    );

    if (forwardVector.lengthSq() < 0.0001) {
      forwardVector.set(0, 0, -1);
    } else {
      forwardVector.normalize();
    }

    return forwardVector;
  }, [initialForward]);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const inputDirection = useMemo(() => new THREE.Vector3(), []);
  const desiredVelocity = useMemo(() => new THREE.Vector3(), []);
  const horizontalVelocity = useMemo(() => new THREE.Vector3(), []);
  const velocityDelta = useMemo(() => new THREE.Vector3(), []);
  const nextHorizontalVelocity = useMemo(() => new THREE.Vector3(), []);
  const posePosition = useMemo(() => new THREE.Vector3(), []);

  const resetPlayer = useCallback(() => {
    const body = bodyRef.current;
    const camera = cameraRef.current;
    if (!body || !camera) {
      return;
    }

    body.setTranslation(spawnVector, true);
    body.setLinvel(zeroVector, true);
    body.setAngvel(zeroVector, true);
    bobPhase.current = 0;
    bobOffset.current = 0;
    cameraHeight.current = standingEyeOffset;
    jumpHeld.current = false;
    landingDip.current = 0;
    lastGroundedAt.current = Number.NEGATIVE_INFINITY;
    lastJumpPressedAt.current = Number.NEGATIVE_INFINITY;
    lastVerticalVelocity.current = 0;
    wasGrounded.current = false;
    lastPoseSyncAt.current = 0;
    lastSyncedPosition.current.copy(spawnVector);
    lastSyncedForward.current.copy(spawnForwardVector);

    camera.position.set(
      spawnVector.x,
      spawnVector.y + standingEyeOffset,
      spawnVector.z,
    );
    setPlayerPose(
      [spawnVector.x, spawnVector.y, spawnVector.z],
      [
        spawnForwardVector.x,
        spawnForwardVector.y,
        spawnForwardVector.z,
      ],
    );
  }, [cameraRef, setPlayerPose, spawnForwardVector, spawnVector]);

  const teleportPlayer = useCallback(
    (
      position: readonly [number, number, number],
      forwardOverride?: readonly [number, number, number],
    ) => {
      const body = bodyRef.current;
      const camera = cameraRef.current;
      if (!body || !camera) {
        return;
      }

      const positionVector = new THREE.Vector3(position[0], position[1], position[2]);
      const forwardVector = new THREE.Vector3(
        forwardOverride?.[0] ?? spawnForwardVector.x,
        forwardOverride?.[1] ?? spawnForwardVector.y,
        forwardOverride?.[2] ?? spawnForwardVector.z,
      );

      if (forwardVector.lengthSq() < 0.0001) {
        forwardVector.set(0, 0, -1);
      } else {
        forwardVector.normalize();
      }

      body.setTranslation(positionVector, true);
      body.setLinvel(zeroVector, true);
      body.setAngvel(zeroVector, true);
      lastPoseSyncAt.current = 0;
      lastSyncedPosition.current.copy(positionVector);
      lastSyncedForward.current.copy(forwardVector);
      camera.position.set(
        positionVector.x,
        positionVector.y + cameraHeight.current,
        positionVector.z,
      );
      setPlayerPose(
        [positionVector.x, positionVector.y, positionVector.z],
        [forwardVector.x, forwardVector.y, forwardVector.z],
      );
    },
    [cameraRef, setPlayerPose, spawnForwardVector],
  );

  useImperativeHandle(
    ref,
    () => ({
      reset: resetPlayer,
      teleport: teleportPlayer,
    }),
    [resetPlayer, teleportPlayer],
  );

  useEffect(() => {
    resetPlayer();
  }, [resetPlayer]);

  useEffect(() => {
    collapseStartedAt.current = null;
  }, [collapsePhase]);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    const camera = cameraRef.current;
    if (!body || !camera) {
      return;
    }

    const elapsed = state.clock.getElapsedTime();
    const keys = getKeys();
    const bodyPosition = body.translation();
    const bodyVelocity = body.linvel();
    camera.getWorldDirection(forward);
    forward.normalize();
    posePosition.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);
    const positionDelta = lastSyncedPosition.current.distanceToSquared(
      posePosition,
    );
    const forwardDelta = 1 - forward.dot(lastSyncedForward.current);
    const shouldSyncPose =
      elapsed - lastPoseSyncAt.current > 0.08 ||
      positionDelta > 0.0064 ||
      forwardDelta > 0.01;

    if (shouldSyncPose) {
      lastPoseSyncAt.current = elapsed;
      lastSyncedPosition.current.copy(posePosition);
      lastSyncedForward.current.copy(forward);
      setPlayerPose(
        [bodyPosition.x, bodyPosition.y, bodyPosition.z],
        [forward.x, forward.y, forward.z],
      );
    }

    if (
      introPhase !== "playing" ||
      movementBlocked ||
      paused ||
      openNoteId !== null ||
      deliverySequencePhase !== "idle"
    ) {
      if (Math.abs(bodyVelocity.x) > 0.001 || Math.abs(bodyVelocity.z) > 0.001) {
        body.setLinvel({ x: 0, y: bodyVelocity.y, z: 0 }, true);
      }
      return;
    }

    if (collapsePhase !== "idle") {
      if (collapseStartedAt.current === null) {
        collapseStartedAt.current = elapsed;
      }

      const phaseElapsed = elapsed - collapseStartedAt.current;
      let targetHeight = standingEyeOffset;
      let forwardOffset = 0;
      let lateralOffset = 0;
      let verticalJitter = 0;
      let targetFov = settings.fov;

      if (collapsePhase === "priming") {
        targetHeight = standingEyeOffset - 0.02;
        forwardOffset = 0.008;
        lateralOffset = 0.022 + Math.sin(phaseElapsed * 7.4) * 0.01;
        verticalJitter = Math.sin(phaseElapsed * 10.8) * 0.006;
        targetFov = settings.fov - 1.2;
      } else if (collapsePhase === "surging") {
        targetHeight = standingEyeOffset - 0.08;
        forwardOffset = 0.014;
        lateralOffset = 0.016 + Math.sin(phaseElapsed * 10.2) * 0.024;
        verticalJitter = Math.sin(phaseElapsed * 18.5) * 0.016;
        targetFov = settings.fov - 3.8;
      } else if (collapsePhase === "falling") {
        const progress = Math.min(
          phaseElapsed / collapseSequenceDurations.falling,
          1,
        );
        const impactLift =
          phaseElapsed < 0.14
            ? Math.sin((phaseElapsed / 0.14) * Math.PI) * 0.046
            : 0;
        targetHeight = THREE.MathUtils.lerp(
          standingEyeOffset - 0.1 + impactLift,
          -0.42,
          progress,
        );
        forwardOffset = 0.018 + progress * 0.24;
        lateralOffset =
          THREE.MathUtils.lerp(0.02, -0.082, progress) +
          Math.sin(phaseElapsed * 8.8) * 0.018;
        verticalJitter =
          Math.sin(phaseElapsed * 15.3) * 0.01 - impactLift * 0.18;
        targetFov = THREE.MathUtils.lerp(
          settings.fov - 4,
          settings.fov - 10.6,
          progress,
        );
      } else if (collapsePhase === "closing") {
        targetHeight = -0.44;
        forwardOffset = 0.26;
        lateralOffset = -0.084;
        targetFov = settings.fov - 13.4;
      } else if (collapsePhase === "blackout") {
        targetHeight = -0.46;
        forwardOffset = 0.28;
        lateralOffset = -0.086;
        targetFov = settings.fov - 15.2;
      }

      body.setLinvel(zeroVector, true);
      body.setAngvel(zeroVector, true);
      landingDip.current = 0;
      bobOffset.current = 0;
      cameraHeight.current = THREE.MathUtils.damp(
        cameraHeight.current,
        targetHeight,
        collapsePhase === "falling" ? 5.4 : 8.2,
        delta,
      );

      camera.position.set(
        bodyPosition.x + lateralOffset,
        bodyPosition.y + cameraHeight.current + verticalJitter,
        bodyPosition.z + forwardOffset,
      );

      const smoothedFov = THREE.MathUtils.damp(
        camera.fov,
        targetFov,
        5.5,
        delta,
      );

      if (Math.abs(smoothedFov - camera.fov) > 0.01) {
        camera.fov = smoothedFov;
        camera.updateProjectionMatrix();
      }

      wasGrounded.current = true;
      lastVerticalVelocity.current = 0;
      return;
    }

    const canMove = !interactionMenuOpen && !textPanelExpanded;
    const jumpJustPressed = keys.jump && !jumpHeld.current;
    jumpHeld.current = keys.jump;

    if (jumpJustPressed && canMove) {
      lastJumpPressedAt.current = elapsed;
    }

    forward.y = 0;
    if (forward.lengthSq() === 0) {
      forward.set(0, 0, -1);
    } else {
      forward.normalize();
    }

    right.crossVectors(forward, worldUp).normalize();
    inputDirection.set(0, 0, 0);

    if (canMove && keys.forward) {
      inputDirection.add(forward);
    }

    if (canMove && keys.backward) {
      inputDirection.sub(forward);
    }

    if (canMove && keys.right) {
      inputDirection.add(right);
    }

    if (canMove && keys.left) {
      inputDirection.sub(right);
    }

    if (inputDirection.lengthSq() > 0) {
      inputDirection.normalize();
    }

    const groundRay = new rapier.Ray(
      {
        x: bodyPosition.x,
        y: bodyPosition.y + movementTuning.groundProbeOffset,
        z: bodyPosition.z,
      },
      { x: 0, y: -1, z: 0 },
    );
    const groundHit = world.castRay(
      groundRay,
      movementTuning.groundProbeLength,
      true,
      undefined,
      undefined,
      undefined,
      body,
    );

    let grounded =
      groundHit !== null &&
      groundHit.timeOfImpact <= movementTuning.groundProbeLength &&
      bodyVelocity.y <= movementTuning.groundedMaxRiseSpeed;

    if (grounded) {
      lastGroundedAt.current = elapsed;
    }

    const hasMovementInput = inputDirection.lengthSq() > 0;
    const speedMultiplier = canMove && keys.sprint
      ? settings.sprintMultiplier
      : 1;
    const crouchMultiplier =
      canMove && keys.crouch ? settings.crouchMultiplier : 1;
    const baseSpeed =
      settings.walkSpeed * speedMultiplier * crouchMultiplier;
    const targetSpeed = grounded
      ? baseSpeed
      : baseSpeed * movementTuning.airControl;

    desiredVelocity.copy(inputDirection).multiplyScalar(targetSpeed);
    horizontalVelocity.set(bodyVelocity.x, 0, bodyVelocity.z);
    velocityDelta.subVectors(desiredVelocity, horizontalVelocity);

    const horizontalResponse = hasMovementInput
      ? grounded
        ? movementTuning.groundAcceleration
        : movementTuning.airAcceleration
      : grounded
        ? movementTuning.groundDeceleration
        : movementTuning.airDeceleration;
    const maxHorizontalStep = horizontalResponse * delta;

    if (velocityDelta.lengthSq() > maxHorizontalStep * maxHorizontalStep) {
      velocityDelta.setLength(maxHorizontalStep);
    }

    nextHorizontalVelocity.copy(horizontalVelocity).add(velocityDelta);

    if (!hasMovementInput && nextHorizontalVelocity.lengthSq() < 0.0025) {
      nextHorizontalVelocity.set(0, 0, 0);
    }

    let nextVerticalVelocity = bodyVelocity.y;
    let jumpedThisFrame = false;
    const canUseBufferedJump =
      elapsed - lastJumpPressedAt.current <= movementTuning.jumpBuffer &&
      elapsed - lastGroundedAt.current <= movementTuning.coyoteTime;

    if (canUseBufferedJump) {
      nextVerticalVelocity = playerConfig.jumpVelocity;
      lastJumpPressedAt.current = Number.NEGATIVE_INFINITY;
      lastGroundedAt.current = Number.NEGATIVE_INFINITY;
      grounded = false;
      jumpedThisFrame = true;
      landingDip.current *= 0.35;
    } else if (grounded && nextVerticalVelocity < 0) {
      nextVerticalVelocity = Math.max(
        nextVerticalVelocity,
        movementTuning.groundedStickVelocity,
      );
    }

    if (!grounded) {
      if (nextVerticalVelocity < 0) {
        nextVerticalVelocity = Math.max(
          nextVerticalVelocity - movementTuning.fallGravityBoost * delta,
          movementTuning.maxFallSpeed,
        );
      } else if ((!canMove || !keys.jump) && nextVerticalVelocity > 0) {
        nextVerticalVelocity = Math.max(
          nextVerticalVelocity - movementTuning.jumpCutGravityBoost * delta,
          movementTuning.maxFallSpeed,
        );
      }
    }

    body.setLinvel(
      {
        x: nextHorizontalVelocity.x,
        y: nextVerticalVelocity,
        z: nextHorizontalVelocity.z,
      },
      true,
    );

    if (
      !wasGrounded.current &&
      grounded &&
      lastVerticalVelocity.current < -4.4
    ) {
      landingDip.current = Math.min(
        movementTuning.landingDipCap,
        Math.abs(lastVerticalVelocity.current) * movementTuning.landingDipScale,
      );
    }

    const planarSpeed = nextHorizontalVelocity.length();
    const movementRatio = THREE.MathUtils.clamp(
      planarSpeed / Math.max(baseSpeed, 0.0001),
      0,
      1.25,
    );

    if (grounded && planarSpeed > 0.12) {
      const strideMultiplier = keys.sprint ? 1.2 : keys.crouch ? 0.75 : 1;
      bobPhase.current +=
        delta *
        movementTuning.bobFrequency *
        strideMultiplier *
        THREE.MathUtils.lerp(0.4, 1, movementRatio);
    }

    const targetBob =
      grounded && planarSpeed > 0.12
        ? Math.sin(bobPhase.current) *
          movementTuning.bobAmplitude *
          movementRatio *
          (keys.crouch ? 0.7 : 1)
        : 0;

    bobOffset.current = THREE.MathUtils.damp(
      bobOffset.current,
      targetBob,
      movementTuning.bobSmoothing,
      delta,
    );
    landingDip.current = THREE.MathUtils.damp(
      landingDip.current,
      0,
      movementTuning.landingRecover,
      delta,
    );
    cameraHeight.current = THREE.MathUtils.damp(
      cameraHeight.current,
      canMove && keys.crouch ? crouchEyeOffset : standingEyeOffset,
      movementTuning.crouchSmoothing,
      delta,
    );

    camera.position.set(
      bodyPosition.x,
      bodyPosition.y +
        cameraHeight.current +
        bobOffset.current -
        landingDip.current,
      bodyPosition.z,
    );

    const targetFov =
      settings.fov +
      movementRatio * movementTuning.motionFovBoost +
      (canMove && keys.sprint && grounded && hasMovementInput
        ? movementTuning.sprintFovBoost
        : 0);
    const smoothedFov = THREE.MathUtils.damp(
      camera.fov,
      targetFov,
      movementTuning.fovSmoothing,
      delta,
    );

    if (Math.abs(smoothedFov - camera.fov) > 0.01) {
      camera.fov = smoothedFov;
      camera.updateProjectionMatrix();
    }

    wasGrounded.current = grounded;
    lastVerticalVelocity.current = jumpedThisFrame
      ? playerConfig.jumpVelocity
      : bodyVelocity.y;
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      position={spawn}
      colliders={false}
      ccd
      canSleep={false}
      lockRotations
      linearDamping={0.9}
      angularDamping={1}
    >
      <CapsuleCollider
        args={[playerConfig.halfHeight, playerConfig.radius]}
      />
    </RigidBody>
  );
});
