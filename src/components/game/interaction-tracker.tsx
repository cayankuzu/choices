"use client";

import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";

import { sceneLayout, worldPositions } from "@/components/game/scene-layout";
import {
  type InteractionTargetId,
  useGameStore,
} from "@/components/game/game-store";
import { wallNotes } from "@/components/game/wall-notes";

type InteractionTrackerProps = {
  cameraRef: MutableRefObject<ThreePerspectiveCamera | null>;
  interactionBlocked?: boolean;
};

export function InteractionTracker({
  cameraRef,
  interactionBlocked = false,
}: InteractionTrackerProps) {
  const gunHeld = useGameStore((state) => state.gunHeld);
  const gunPlacement = useGameStore((state) => state.gunPlacement);
  const groundGunPosition = useGameStore((state) => state.groundGunPosition);
  const apartmentDoorOpen = useGameStore((state) => state.apartmentDoorOpen);
  const packageState = useGameStore((state) => state.packageState);
  const unlockedNeighborDoor = useGameStore(
    (state) => state.unlockedNeighborDoor,
  );
  const equippedItem = useGameStore((state) => state.equippedItem);
  const introPhase = useGameStore((state) => state.introPhase);
  const paused = useGameStore((state) => state.paused);
  const textPanelExpanded = useGameStore(
    (state) => state.textPanelExpanded,
  );
  const collapsePhase = useGameStore((state) => state.collapsePhase);
  const deliverySequencePhase = useGameStore(
    (state) => state.deliverySequencePhase,
  );
  const openNoteId = useGameStore((state) => state.openNoteId);
  const setInteractionTarget = useGameStore(
    (state) => state.setInteractionTarget,
  );
  const noteTargets = useMemo(
    () =>
      wallNotes.map((note) => ({
        id: `note:${note.id}` as const,
        positions: [note.position],
      })),
    [],
  );

  const forward = useMemo(() => new THREE.Vector3(), []);
  const toTarget = useMemo(() => new THREE.Vector3(), []);
  const currentTarget = useRef<InteractionTargetId | null>(null);
  const alignmentThreshold = 0.9;

  useEffect(() => {
    return () => {
      setInteractionTarget(null);
    };
  }, [setInteractionTarget]);

  useFrame(() => {
    const blockWorldInteraction =
      interactionBlocked ||
      introPhase !== "playing" ||
      paused ||
      openNoteId !== null ||
      textPanelExpanded ||
      collapsePhase !== "idle" ||
      deliverySequencePhase !== "idle";

    if (blockWorldInteraction) {
      if (currentTarget.current !== null) {
        currentTarget.current = null;
        setInteractionTarget(null);
      }
      return;
    }

    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    if (gunHeld && equippedItem === "gun") {
      if (currentTarget.current !== "equipped-gun") {
        currentTarget.current = "equipped-gun";
        setInteractionTarget("equipped-gun");
      }
      return;
    }

    camera.getWorldDirection(forward);

    const gunTargetPosition =
      gunPlacement === "ground"
        ? ([
            groundGunPosition[0],
            groundGunPosition[1] + 0.06,
            groundGunPosition[2],
          ] as const)
        : worldPositions.pistol;

    const targetDefinitions = [
      {
        id: "jam" as const,
        positions: [worldPositions.jamJar],
      },
      {
        id: "chocolate" as const,
        positions: [worldPositions.chocolateJar],
      },
      {
        id: "gun" as const,
        positions: [gunTargetPosition],
      },
      {
        id: "apartment-door" as const,
        positions: [
          worldPositions.apartmentDoor,
          [
            sceneLayout.apartmentDoor.interactionPosition[0],
            sceneLayout.apartmentDoor.interactionPosition[1],
            sceneLayout.apartmentDoor.interactionPosition[2] - 0.86,
          ] as const,
        ],
        alignmentThreshold: 0.76,
        interactionRange: 3.5,
      },
      {
        id: "building-exit" as const,
        positions: [
          sceneLayout.buildingExitDoor.interactionPosition,
          [
            sceneLayout.buildingExitDoor.interactionPosition[0] + 0.52,
            sceneLayout.buildingExitDoor.interactionPosition[1],
            sceneLayout.buildingExitDoor.interactionPosition[2],
          ] as const,
          [
            sceneLayout.buildingExitDoor.hinge[0] - 1.34,
            sceneLayout.buildingExitDoor.interactionPosition[1],
            sceneLayout.buildingExitDoor.hinge[2] +
              sceneLayout.buildingExitDoor.width / 2,
          ] as const,
        ],
        alignmentThreshold: 0.68,
        interactionRange: 4.4,
      },
      ...(packageState === "doorstep" && apartmentDoorOpen
        ? [
            {
              id: "package" as const,
              positions: [worldPositions.package],
              alignmentThreshold: 0.82,
            },
          ]
        : []),
      ...worldPositions.neighborDoors
        .filter((door) => door.id === unlockedNeighborDoor)
        .map((door) => ({
          id: `neighbor-door:${door.id}` as const,
          positions: [door.interactionPosition],
          alignmentThreshold: 0.78,
          interactionRange: 3.35,
        })),
      ...noteTargets,
    ];

    let bestTarget: InteractionTargetId | null = null;
    let bestScore = -Infinity;

    for (const target of targetDefinitions) {
      if (target.id === "gun" && gunHeld) {
        continue;
      }

      const targetAlignmentThreshold =
        "alignmentThreshold" in target &&
        typeof target.alignmentThreshold === "number"
          ? target.alignmentThreshold
          : alignmentThreshold;
      const targetInteractionRange =
        "interactionRange" in target &&
        typeof target.interactionRange === "number"
          ? target.interactionRange
          : sceneLayout.interactionRange;

      for (const position of target.positions) {
        toTarget.set(
          position[0] - camera.position.x,
          position[1] - camera.position.y,
          position[2] - camera.position.z,
        );

        const distance = toTarget.length();
        if (distance > targetInteractionRange) {
          continue;
        }

        toTarget.normalize();
        const alignment = forward.dot(toTarget);
        if (alignment < targetAlignmentThreshold) {
          continue;
        }

        const score = alignment * 12 - distance * 1.35;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = target.id;
        }
      }
    }

    if (currentTarget.current !== bestTarget) {
      currentTarget.current = bestTarget;
      setInteractionTarget(bestTarget);
    }
  });

  return null;
}
