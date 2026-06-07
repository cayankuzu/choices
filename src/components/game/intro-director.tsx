"use client";

import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";

import {
  playerConfig,
  standingEyeOffset,
} from "@/components/game/game-config";
import { sceneLayout } from "@/components/game/scene-layout";
import { useGameStore } from "@/components/game/game-store";

type LookState = {
  pitch: number;
  yaw: number;
};

type IntroDirectorProps = {
  cameraRef: MutableRefObject<ThreePerspectiveCamera | null>;
  externallyFrozen?: boolean;
  lookRef: MutableRefObject<LookState>;
};

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export function IntroDirector({
  cameraRef,
  externallyFrozen = false,
  lookRef,
}: IntroDirectorProps) {
  const introPhase = useGameStore((state) => state.introPhase);
  const paused = useGameStore((state) => state.paused);
  const setIntroPhase = useGameStore((state) => state.setIntroPhase);
  const setLookEnabled = useGameStore((state) => state.setLookEnabled);

  const phaseStartedAt = useRef<number | null>(null);
  const startPosition = useMemo(
    () =>
      new THREE.Vector3(
        sceneLayout.intro.startPosition[0],
        sceneLayout.intro.startPosition[1],
        sceneLayout.intro.startPosition[2],
      ),
    [],
  );
  const endPosition = useMemo(
    () =>
      new THREE.Vector3(
        playerConfig.spawn[0],
        playerConfig.spawn[1] + standingEyeOffset,
        playerConfig.spawn[2],
      ),
    [],
  );
  const workingPosition = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    phaseStartedAt.current = null;

    if (introPhase !== "playing") {
      setLookEnabled(false);
    }
  }, [introPhase, setLookEnabled]);

  useFrame((state) => {
    if (introPhase === "playing" || paused || externallyFrozen) {
      return;
    }

    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    if (phaseStartedAt.current === null) {
      phaseStartedAt.current = state.clock.getElapsedTime();
    }

    const elapsed = state.clock.getElapsedTime() - phaseStartedAt.current;

    if (
      introPhase === "menu" ||
      introPhase === "sleeping" ||
      introPhase === "opening"
    ) {
      camera.position.copy(startPosition);
      lookRef.current.pitch = sceneLayout.intro.startPitch;
      lookRef.current.yaw = sceneLayout.intro.startYaw;

      if (introPhase === "opening" && elapsed >= 1.2) {
        setIntroPhase("standing");
      }

      return;
    }

    const progress = Math.min(elapsed / 1.7, 1);
    const easedProgress = easeInOutCubic(progress);

    workingPosition.lerpVectors(startPosition, endPosition, easedProgress);
    camera.position.copy(workingPosition);
    lookRef.current.pitch = THREE.MathUtils.lerp(
      sceneLayout.intro.startPitch,
      sceneLayout.intro.endPitch,
      easedProgress,
    );
    lookRef.current.yaw = THREE.MathUtils.lerp(
      sceneLayout.intro.startYaw,
      sceneLayout.intro.endYaw,
      easedProgress,
    );

    if (progress >= 1) {
      setLookEnabled(true);
      setIntroPhase("playing");
    }
  });

  return null;
}
