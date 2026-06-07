"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { roomConfig } from "@/components/game/game-config";
import { sceneLayout } from "@/components/game/scene-layout";
import { useGameStore } from "@/components/game/game-store";
import { wallNotes } from "@/components/game/wall-notes";

const roomMaterials = {
  floor: "#0f151d",
  floorInset: "#151d26",
  ceiling: "#111821",
  front: "#19212b",
  back: "#171f28",
  left: "#1a232c",
  right: "#1c2530",
  trim: "#2a3542",
  lightPanel: "#cfe6d8",
} as const;

type JarPropProps = {
  position: [number, number, number];
  glassColor: string;
  fillColor: string;
  lidColor: string;
  bandColor: string;
  frontLabelColor: string;
};

function JarProp({
  position,
  glassColor,
  fillColor,
  lidColor,
  bandColor,
  frontLabelColor,
}: JarPropProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.095, 0.1, 0.22, 28]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.42}
          roughness={0.14}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, 0.103, 0]}>
        <cylinderGeometry args={[0.082, 0.086, 0.17, 24]} />
        <meshStandardMaterial
          color={fillColor}
          roughness={0.68}
          metalness={0.02}
        />
      </mesh>

      <mesh position={[0, 0.112, 0]}>
        <cylinderGeometry args={[0.101, 0.101, 0.075, 28, 1, true]} />
        <meshStandardMaterial
          color={bandColor}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, 0.244, 0]}>
        <cylinderGeometry args={[0.078, 0.084, 0.044, 24]} />
        <meshStandardMaterial
          color={lidColor}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      <mesh position={[0, 0.11, 0.092]}>
        <planeGeometry args={[0.11, 0.08]} />
        <meshStandardMaterial
          color={frontLabelColor}
          roughness={0.7}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

function PistolProp({
  position,
  surface = "table",
}: {
  position: readonly [number, number, number];
  surface?: "table" | "ground";
}) {
  const isGround = surface === "ground";

  return (
    <group
      position={position}
      rotation={isGround ? [0, 0.34, 0] : [0, -0.14, 0]}
    >
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial
          color="#0b0f14"
          transparent
          opacity={isGround ? 0.18 : 0.22}
        />
      </mesh>

      <mesh position={[0.028, 0.03, 0]}>
        <boxGeometry args={[0.34, 0.044, 0.072]} />
        <meshStandardMaterial
          color="#6c7682"
          roughness={0.24}
          metalness={0.78}
        />
      </mesh>

      <mesh position={[0.092, 0.058, 0]}>
        <boxGeometry args={[0.16, 0.014, 0.05]} />
        <meshStandardMaterial
          color="#909aa4"
          roughness={0.18}
          metalness={0.84}
        />
      </mesh>

      <mesh position={[-0.104, 0.028, 0.052]} rotation={[0, 0.78, 0]}>
        <boxGeometry args={[0.15, 0.042, 0.088]} />
        <meshStandardMaterial
          color="#353c44"
          roughness={0.62}
          metalness={0.18}
        />
      </mesh>

      <mesh position={[-0.03, 0.026, -0.002]}>
        <boxGeometry args={[0.126, 0.03, 0.046]} />
        <meshStandardMaterial
          color="#2b3036"
          roughness={0.52}
          metalness={0.16}
        />
      </mesh>

      <mesh position={[-0.008, 0.026, 0.002]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.024, 0.005, 10, 18, Math.PI]} />
        <meshStandardMaterial
          color="#21262b"
          roughness={0.48}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[0.22, 0.026, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.013, 0.013, 0.112, 18]} />
        <meshStandardMaterial
          color="#949ca5"
          roughness={0.18}
          metalness={0.86}
        />
      </mesh>

      <mesh position={[-0.136, 0.024, -0.036]} rotation={[0, 0.26, 0]}>
        <boxGeometry args={[0.086, 0.036, 0.042]} />
        <meshStandardMaterial
          color="#24292f"
          roughness={0.64}
          metalness={0.14}
        />
      </mesh>
    </group>
  );
}

function DoorPlaque({
  label,
  residentName,
  position,
  rotation = [0, 0, 0],
  highlighted = false,
}: {
  label: string;
  residentName: string;
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  highlighted?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.74, 0.32, 0.03]} />
        <meshStandardMaterial
          color={highlighted ? "#f7e7a6" : "#e2c98a"}
          roughness={0.36}
          metalness={0.5}
          emissive={highlighted ? "#f7d77d" : "#8a6733"}
          emissiveIntensity={highlighted ? 0.44 : 0.18}
        />
      </mesh>
      <mesh position={[0, 0.105, 0.018]}>
        <boxGeometry args={[0.34, 0.07, 0.016]} />
        <meshStandardMaterial
          color={highlighted ? "#fff3c2" : "#f4dfab"}
          roughness={0.32}
          metalness={0.18}
        />
      </mesh>
      <Text
        position={[0, 0.055, 0.024]}
        fontSize={0.122}
        color={highlighted ? "#33210b" : "#432c12"}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.075, 0.024]}
        fontSize={0.086}
        color={highlighted ? "#3a260d" : "#4b3418"}
        maxWidth={0.62}
        anchorX="center"
        anchorY="middle"
      >
        {residentName}
      </Text>
    </group>
  );
}

function SwingDoor({
  hinge,
  width,
  height,
  thickness,
  open,
  openAngle,
  alongZ = false,
  leafColor = "#6b503d",
  panelColor = "#755a46",
  trimColor = "#4c392e",
  accentColor = "#574235",
  knobColor = "#cfb07a",
  plaque,
}: {
  hinge: readonly [number, number, number];
  width: number;
  height: number;
  thickness: number;
  open: boolean;
  openAngle: number;
  alongZ?: boolean;
  leafColor?: string;
  panelColor?: string;
  trimColor?: string;
  accentColor?: string;
  knobColor?: string;
  plaque?: {
    label: string;
    residentName: string;
    side: "positive" | "negative";
  };
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const plaqueRotationY = alongZ
    ? plaque?.side === "negative"
      ? -Math.PI / 2
      : Math.PI / 2
    : plaque?.side === "negative"
      ? Math.PI
      : 0;
  const plaquePosition: readonly [number, number, number] | null = plaque
    ? alongZ
      ? [
          plaque.side === "negative" ? -0.05 : 0.05,
          1.62,
          width * 0.5,
        ]
      : [
          width * 0.5,
          1.62,
          plaque.side === "negative" ? -0.05 : 0.05,
        ]
    : null;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      open ? openAngle : 0,
      7.5,
      delta,
    );
  });

  return (
    <group ref={groupRef} position={hinge}>
      <mesh
        position={alongZ ? [0, height / 2, width / 2] : [width / 2, height / 2, 0]}
      >
        <boxGeometry
          args={alongZ ? [thickness, height, width] : [width, height, thickness]}
        />
        <meshStandardMaterial
          color={leafColor}
          roughness={0.66}
          metalness={0.08}
        />
      </mesh>
      <mesh
        position={alongZ ? [0.002, height / 2, width / 2] : [width / 2, height / 2, 0.002]}
      >
        <boxGeometry
          args={
            alongZ
              ? [thickness * 0.42, height - 0.26, width - 0.18]
              : [width - 0.18, height - 0.26, thickness * 0.42]
          }
        />
        <meshStandardMaterial
          color={trimColor}
          roughness={0.84}
          metalness={0.04}
        />
      </mesh>
      <mesh
        position={alongZ ? [0, height / 2, width / 2] : [width / 2, height / 2, 0.01]}
      >
        <planeGeometry args={alongZ ? [width, height] : [width, height]} />
        <meshStandardMaterial
          color={panelColor}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>
      <mesh
        position={alongZ ? [0.01, height * 0.42, width * 0.5] : [width * 0.5, height * 0.42, 0.05]}
      >
        <boxGeometry args={alongZ ? [0.02, 0.18, 0.34] : [0.34, 0.18, 0.02]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
      <mesh
        position={
          alongZ
            ? [0.028, height / 2, width * 0.82]
            : [width * 0.84, height / 2, 0.042]
        }
      >
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshStandardMaterial
          color={knobColor}
          roughness={0.24}
          metalness={0.82}
        />
      </mesh>
      {plaque && plaquePosition ? (
        <DoorPlaque
          label={plaque.label}
          residentName={plaque.residentName}
          position={plaquePosition}
          rotation={[0, plaqueRotationY, 0]}
        />
      ) : null}
    </group>
  );
}

function NeighborDoorProp({
  position,
  label,
  residentName,
  facing = "south",
  highlighted = false,
  open = false,
}: {
  position: readonly [number, number, number];
  label: string;
  residentName: string;
  facing?: "south" | "north";
  highlighted?: boolean;
  open?: boolean;
}) {
  const frontFacingNorth = facing === "north";
  const faceRotation = frontFacingNorth ? Math.PI : 0;
  const faceOffset = frontFacingNorth ? -0.054 : 0.054;
  const textOffset = frontFacingNorth ? -0.074 : 0.074;
  const doorLeafRef = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    const leaf = doorLeafRef.current;
    if (!leaf) {
      return;
    }

    const targetAngle = open ? (frontFacingNorth ? -1.08 : 1.08) : 0;
    leaf.rotation.y = THREE.MathUtils.damp(
      leaf.rotation.y,
      targetAngle,
      8,
      delta,
    );
  });

  return (
    <group position={position}>
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[1.14, 2.24, 0.12]} />
        <meshStandardMaterial
          color="#293340"
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>
      <group ref={doorLeafRef} position={[-0.5, 0, 0]}>
        <mesh position={[0.5, 1.08, 0]}>
          <boxGeometry args={[1.0, 2.16, 0.08]} />
          <meshStandardMaterial
            color={highlighted ? "#5c7f8f" : "#4a6070"}
            roughness={0.74}
            metalness={0.06}
            emissive={highlighted ? "#c88d64" : "#18242d"}
            emissiveIntensity={highlighted ? 0.28 : 0.12}
          />
        </mesh>
        <mesh
          position={[0.5, 1.08, faceOffset]}
          rotation={[0, faceRotation, 0]}
        >
          <planeGeometry args={[0.82, 1.92]} />
          <meshStandardMaterial
            color={highlighted ? "#bdd8e0" : "#c6d5db"}
            roughness={0.72}
            metalness={0.04}
          />
        </mesh>
        <mesh
          position={[
            0.5,
            1.18,
            faceOffset + (frontFacingNorth ? -0.004 : 0.004),
          ]}
          rotation={[0, faceRotation, 0]}
        >
          <boxGeometry args={[0.36, 0.12, 0.024]} />
          <meshStandardMaterial
            color="#dbe9ef"
            roughness={0.68}
            metalness={0.08}
          />
        </mesh>
        <mesh
          position={[
            0.78,
            1.08,
            faceOffset + (frontFacingNorth ? -0.012 : 0.012),
          ]}
          rotation={[0, faceRotation, 0]}
        >
          <boxGeometry args={[0.08, 0.58, 0.018]} />
          <meshStandardMaterial
            color="#614d3d"
            roughness={0.9}
            metalness={0.03}
          />
        </mesh>
        <mesh
          position={[
            0.84,
            1.55,
            faceOffset + (frontFacingNorth ? -0.009 : 0.009),
          ]}
          rotation={[0, faceRotation, 0]}
        >
          <boxGeometry args={[0.18, 0.06, 0.018]} />
          <meshStandardMaterial
            color="#e6c57b"
            roughness={0.26}
            metalness={0.82}
          />
        </mesh>
        <mesh
          position={[
            0.5,
            1.08,
            faceOffset + (frontFacingNorth ? -0.015 : 0.015),
          ]}
        >
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color="#ab936d"
            roughness={0.28}
            metalness={0.78}
          />
        </mesh>
        <DoorPlaque
          label={label}
          residentName={residentName}
          position={[0.5, 1.62, textOffset]}
          rotation={[0, faceRotation, 0]}
          highlighted={highlighted}
        />
      </group>
    </group>
  );
}

function ElderNeighborProp({
  position,
  visible = false,
}: {
  position: readonly [number, number, number];
  visible?: boolean;
}) {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    group.visible = visible;
    if (!visible) {
      return;
    }

    group.position.y =
      position[1] + Math.sin(state.clock.getElapsedTime() * 1.4) * 0.012;
    group.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.7) * 0.05;
  });

  return (
    <group ref={groupRef} position={position} visible={visible}>
      <mesh position={[0, 1.64, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#b7947d" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[0, 1.16, 0]}>
        <capsuleGeometry args={[0.22, 0.56, 8, 14]} />
        <meshStandardMaterial color="#4b575f" roughness={0.9} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.84, 0.04]}>
        <boxGeometry args={[0.28, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7d9db" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh position={[-0.2, 1.18, 0]} rotation={[0.26, 0, 0.28]}>
        <capsuleGeometry args={[0.06, 0.42, 6, 10]} />
        <meshStandardMaterial color="#56636b" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh position={[0.2, 1.2, 0.06]} rotation={[0.18, 0, -0.42]}>
        <capsuleGeometry args={[0.06, 0.42, 6, 10]} />
        <meshStandardMaterial color="#56636b" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh position={[-0.08, 0.54, 0]} rotation={[0.04, 0, 0.04]}>
        <capsuleGeometry args={[0.075, 0.64, 6, 10]} />
        <meshStandardMaterial color="#2f363b" roughness={0.9} metalness={0.03} />
      </mesh>
      <mesh position={[0.08, 0.54, 0]} rotation={[0.04, 0, -0.04]}>
        <capsuleGeometry args={[0.075, 0.64, 6, 10]} />
        <meshStandardMaterial color="#2f363b" roughness={0.9} metalness={0.03} />
      </mesh>
    </group>
  );
}

function PackageProp() {
  return (
    <group position={sceneLayout.package.position}>
      <mesh position={[0, sceneLayout.package.size[1] / 2, 0]}>
        <boxGeometry args={sceneLayout.package.size} />
        <meshStandardMaterial color="#8b6c4d" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[0, sceneLayout.package.size[1] + 0.002, 0]}>
        <planeGeometry args={[0.38, 0.24]} />
        <meshStandardMaterial color="#efe5d1" roughness={0.94} metalness={0.01} />
      </mesh>
      <Text
        position={[0, sceneLayout.package.size[1] + 0.008, -0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.042}
        color="#32261d"
        maxWidth={0.32}
        anchorX="center"
        anchorY="middle"
      >
        {sceneLayout.package.labelLine1}
      </Text>
      <Text
        position={[0, sceneLayout.package.size[1] + 0.008, 0.04]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.035}
        color="#47372a"
        maxWidth={0.32}
        anchorX="center"
        anchorY="middle"
      >
        {sceneLayout.package.labelLine2}
      </Text>
    </group>
  );
}

function RadiatorProp({
  position,
  rotationY = 0,
}: {
  position: readonly [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[0.88, 0.62, 0.12]} />
        <meshStandardMaterial color="#56606a" roughness={0.88} metalness={0.22} />
      </mesh>
      {[-0.3, -0.15, 0, 0.15, 0.3].map((offsetX) => (
        <mesh key={offsetX} position={[offsetX, 0.36, 0.08]}>
          <boxGeometry args={[0.08, 0.56, 0.03]} />
          <meshStandardMaterial color="#6b757f" roughness={0.82} metalness={0.16} />
        </mesh>
      ))}
      <mesh position={[-0.38, 0.72, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 10]} />
        <meshStandardMaterial color="#7b633f" roughness={0.54} metalness={0.5} />
      </mesh>
      <mesh position={[0.38, 0.72, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 10]} />
        <meshStandardMaterial color="#7b633f" roughness={0.54} metalness={0.5} />
      </mesh>
    </group>
  );
}

function UtilityBoxProp({
  position,
  rotationY = 0,
}: {
  position: readonly [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[0.72, 1.08, 0.14]} />
        <meshStandardMaterial color="#414a52" roughness={0.9} metalness={0.18} />
      </mesh>
      <mesh position={[0.16, 0.78, 0.08]}>
        <boxGeometry args={[0.12, 0.06, 0.03]} />
        <meshStandardMaterial color="#97724b" roughness={0.46} metalness={0.44} />
      </mesh>
      {[-0.16, 0, 0.16].map((offsetX) => (
        <mesh key={offsetX} position={[offsetX, -0.12, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.76, 12]} />
          <meshStandardMaterial color="#4f5861" roughness={0.82} metalness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function LeakBucket({
  position,
}: {
  position: readonly [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 18]} />
        <meshBasicMaterial color="#06090d" transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.14, 0.12, 0.3, 20, 1, true]} />
        <meshStandardMaterial color="#707780" roughness={0.64} metalness={0.38} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 18]} />
        <meshStandardMaterial color="#101b24" roughness={0.12} metalness={0.02} />
      </mesh>
      <mesh position={[0.02, 0.36, 0]}>
        <torusGeometry args={[0.13, 0.012, 10, 18, Math.PI]} />
        <meshStandardMaterial color="#8f949b" roughness={0.42} metalness={0.44} />
      </mesh>
    </group>
  );
}

function StreetLampProp({
  position,
}: {
  position: readonly [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 3.6, 14]} />
        <meshStandardMaterial color="#202830" roughness={0.86} metalness={0.34} />
      </mesh>
      <mesh position={[0.22, 3.46, 0]} rotation={[0, 0, -0.48]}>
        <cylinderGeometry args={[0.025, 0.025, 0.62, 10]} />
        <meshStandardMaterial color="#232d36" roughness={0.78} metalness={0.3} />
      </mesh>
      <mesh position={[0.42, 3.42, 0]}>
        <boxGeometry args={[0.38, 0.16, 0.16]} />
        <meshStandardMaterial
          color="#c7bc94"
          emissive="#d7caa4"
          emissiveIntensity={0.6}
          roughness={0.42}
          metalness={0.08}
        />
      </mesh>
      <pointLight
        position={[0.4, 3.24, 0]}
        intensity={1.2}
        distance={8.4}
        decay={2}
        color="#d6d0b4"
      />
    </group>
  );
}

function BuildingFrontProp({
  position,
  size,
  tone = "#212a33",
}: {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  tone?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={tone} roughness={0.94} metalness={0.03} />
      </mesh>
      <mesh position={[0, 1.14, size[2] / 2 + 0.02]}>
        <boxGeometry args={[1.08, 2.18, 0.08]} />
        <meshStandardMaterial color="#5a4a40" roughness={0.84} metalness={0.05} />
      </mesh>
      <mesh position={[-0.92, 1.52, size[2] / 2 + 0.02]}>
        <boxGeometry args={[0.78, 0.92, 0.06]} />
        <meshStandardMaterial color="#3b4e5e" roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0.92, 1.52, size[2] / 2 + 0.02]}>
        <boxGeometry args={[0.78, 0.92, 0.06]} />
        <meshStandardMaterial color="#3b4e5e" roughness={0.38} metalness={0.12} />
      </mesh>
    </group>
  );
}

function DecayPatches() {
  const wallPatches = [
    {
      color: "#16120f",
      opacity: 0.34,
      position: [-3.5, 1.26, -1.24] as const,
      rotation: [0, Math.PI / 2, 0.08] as const,
      size: [1.44, 0.94] as const,
    },
    {
      color: "#1a1811",
      opacity: 0.28,
      position: [2.74, 1.98, -3.5] as const,
      rotation: [0, 0, -0.06] as const,
      size: [1.2, 0.64] as const,
    },
    {
      color: "#12170f",
      opacity: 0.3,
      position: [-1.6, 1.72, 3.5] as const,
      rotation: [0, Math.PI, -0.04] as const,
      size: [1.24, 0.58] as const,
    },
    {
      color: "#19140f",
      opacity: 0.32,
      position: [7.08, 1.16, -6.89] as const,
      rotation: [0, Math.PI, 0.02] as const,
      size: [0.92, 0.58] as const,
    },
    {
      color: "#111510",
      opacity: 0.28,
      position: [-6.1, 1.5, -4.18] as const,
      rotation: [0, Math.PI / 2, 0.03] as const,
      size: [1.48, 0.84] as const,
    },
    {
      color: "#181613",
      opacity: 0.24,
      position: [4.86, 2.1, -3.49] as const,
      rotation: [0, 0, 0.05] as const,
      size: [0.98, 0.42] as const,
    },
  ];
  const floorPatches = [
    {
      color: "#07090b",
      opacity: 0.18,
      position: [-2.18, 0.012, 0.88] as const,
      rotation: [-Math.PI / 2, 0, 0.26] as const,
      size: [1.34, 0.84] as const,
    },
    {
      color: "#0a0b0d",
      opacity: 0.22,
      position: [2.44, 0.012, -0.84] as const,
      rotation: [-Math.PI / 2, 0, -0.18] as const,
      size: [1.58, 1.02] as const,
    },
    {
      color: "#120e0a",
      opacity: 0.16,
      position: [3.92, 0.012, -5.32] as const,
      rotation: [-Math.PI / 2, 0, 0.14] as const,
      size: [2.08, 0.58] as const,
    },
    {
      color: "#08090c",
      opacity: 0.18,
      position: [-9.64, 0.012, -2.44] as const,
      rotation: [-Math.PI / 2, 0, -0.08] as const,
      size: [2.42, 1.18] as const,
    },
  ];

  return (
    <group>
      {wallPatches.map((patch, index) => (
        <mesh
          key={`wall-${index}`}
          position={patch.position}
          rotation={patch.rotation}
        >
          <planeGeometry args={patch.size} />
          <meshBasicMaterial
            color={patch.color}
            transparent
            opacity={patch.opacity}
          />
        </mesh>
      ))}
      {floorPatches.map((patch, index) => (
        <mesh
          key={`floor-${index}`}
          position={patch.position}
          rotation={patch.rotation}
        >
          <planeGeometry args={patch.size} />
          <meshBasicMaterial
            color={patch.color}
            transparent
            opacity={patch.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function DebrisScatter() {
  const debris = [
    {
      color: "#7a7067",
      position: [-2.9, 0.02, 2.46] as const,
      rotation: [-Math.PI / 2, 0, 0.32] as const,
      size: [0.22, 0.16] as const,
    },
    {
      color: "#544c44",
      position: [2.16, 0.02, -5.72] as const,
      rotation: [-Math.PI / 2, 0, -0.24] as const,
      size: [0.34, 0.18] as const,
    },
    {
      color: "#65574d",
      position: [5.86, 0.02, -5.06] as const,
      rotation: [-Math.PI / 2, 0, 0.26] as const,
      size: [0.28, 0.14] as const,
    },
    {
      color: "#4b413a",
      position: [-0.64, 0.02, -2.86] as const,
      rotation: [-Math.PI / 2, 0, -0.18] as const,
      size: [0.18, 0.14] as const,
    },
  ];

  return (
    <group>
      {debris.map((piece, index) => (
        <mesh
          key={index}
          position={piece.position}
          rotation={piece.rotation}
        >
          <planeGeometry args={piece.size} />
          <meshStandardMaterial
            color={piece.color}
            roughness={0.94}
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  );
}

function TableSet({ showGun }: { showGun: boolean }) {
  const tablePosition = sceneLayout.table.position;
  const topY = sceneLayout.table.topY;

  return (
    <RigidBody type="fixed" colliders={false} position={tablePosition}>
      <CuboidCollider args={[0.8, 0.05, 0.38]} position={[0, topY, 0]} />
      <CuboidCollider
        args={[0.07, 0.36, 0.07]}
        position={[-0.68, 0.36, -0.24]}
      />
      <CuboidCollider
        args={[0.07, 0.36, 0.07]}
        position={[0.68, 0.36, -0.24]}
      />
      <CuboidCollider
        args={[0.07, 0.36, 0.07]}
        position={[-0.68, 0.36, 0.24]}
      />
      <CuboidCollider
        args={[0.07, 0.36, 0.07]}
        position={[0.68, 0.36, 0.24]}
      />

      <mesh position={[0, topY, 0]}>
        <boxGeometry args={[1.6, 0.1, 0.76]} />
        <meshStandardMaterial
          color="#463225"
          roughness={0.84}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, topY + 0.035, 0]}>
        <boxGeometry args={[1.46, 0.028, 0.64]} />
        <meshStandardMaterial
          color="#5a4335"
          roughness={0.68}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[-0.68, 0.36, -0.24]}>
        <boxGeometry args={[0.09, 0.72, 0.09]} />
        <meshStandardMaterial
          color="#4b3424"
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0.68, 0.36, -0.24]}>
        <boxGeometry args={[0.09, 0.72, 0.09]} />
        <meshStandardMaterial
          color="#4b3424"
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[-0.68, 0.36, 0.24]}>
        <boxGeometry args={[0.09, 0.72, 0.09]} />
        <meshStandardMaterial
          color="#4b3424"
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0.68, 0.36, 0.24]}>
        <boxGeometry args={[0.09, 0.72, 0.09]} />
        <meshStandardMaterial
          color="#4b3424"
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      <mesh position={[0, 0.61, 0]}>
        <boxGeometry args={[1.04, 0.06, 0.16]} />
        <meshStandardMaterial
          color="#31231a"
          roughness={0.8}
          metalness={0.03}
        />
      </mesh>

      <mesh position={[0.46, topY + 0.03, -0.18]} rotation={[0, 0.24, -0.06]}>
        <boxGeometry args={[0.16, 0.01, 0.09]} />
        <meshStandardMaterial color="#948873" roughness={0.86} metalness={0.02} />
      </mesh>
      <mesh position={[-0.52, topY + 0.05, -0.14]}>
        <cylinderGeometry args={[0.05, 0.04, 0.09, 18]} />
        <meshStandardMaterial color="#5d6166" roughness={0.74} metalness={0.18} />
      </mesh>
      <mesh position={[-0.52, topY + 0.09, -0.14]}>
        <torusGeometry args={[0.052, 0.007, 10, 18]} />
        <meshStandardMaterial color="#82715f" roughness={0.42} metalness={0.28} />
      </mesh>

      <JarProp
        position={[
          sceneLayout.table.jamOffset[0],
          topY + sceneLayout.table.jamOffset[1],
          sceneLayout.table.jamOffset[2],
        ]}
        glassColor="#f5f0ec"
        fillColor="#b92632"
        lidColor="#d5b36c"
        bandColor="#f7dcb5"
        frontLabelColor="#f7f2da"
      />
      <JarProp
        position={[
          sceneLayout.table.chocolateOffset[0],
          topY + sceneLayout.table.chocolateOffset[1],
          sceneLayout.table.chocolateOffset[2],
        ]}
        glassColor="#f3ead9"
        fillColor="#3d2217"
        lidColor="#cfb46f"
        bandColor="#ebd7a2"
        frontLabelColor="#eadcbc"
      />

      {showGun ? (
        <PistolProp
          position={[
            sceneLayout.table.gunOffset[0],
            topY + sceneLayout.table.gunOffset[1],
            sceneLayout.table.gunOffset[2],
          ]}
        />
      ) : null}

      <pointLight
        position={[-0.18, 1.42, 0.05]}
        intensity={0.72}
        distance={3.2}
        decay={2}
        color="#d6b28a"
      />
    </RigidBody>
  );
}

function BedSet() {
  const bedPosition = sceneLayout.bed.position;
  const bedSize = sceneLayout.bed.size;

  return (
    <RigidBody type="fixed" colliders={false} position={bedPosition}>
      <CuboidCollider args={[1.1, 0.22, 0.57]} position={[0, 0.22, 0]} />

      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[bedSize[0], 0.32, bedSize[2]]} />
        <meshStandardMaterial
          color="#46372d"
          roughness={0.84}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, sceneLayout.bed.mattressHeight, 0]}>
        <boxGeometry args={[2.03, 0.18, 1.02]} />
        <meshStandardMaterial
          color="#9f9f98"
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>

      <mesh position={[-0.62, 0.56, 0.04]} rotation={[0.04, 0, 0.08]}>
        <boxGeometry args={[0.42, 0.08, 0.84]} />
        <meshStandardMaterial
          color="#d1c6b7"
          roughness={0.9}
          metalness={0.01}
        />
      </mesh>

      <mesh position={[0.1, 0.57, 0.02]} rotation={[0.02, 0, -0.06]}>
        <boxGeometry args={[1.22, 0.08, 0.88]} />
        <meshStandardMaterial
          color="#626c76"
          roughness={0.92}
          metalness={0.03}
        />
      </mesh>

      <mesh position={[0.2, 0.535, -0.02]} rotation={[-Math.PI / 2, 0, -0.08]}>
        <planeGeometry args={[1.02, 0.52]} />
        <meshBasicMaterial color="#4b413d" transparent opacity={0.2} />
      </mesh>

      <mesh position={[1.03, 0.48, 0]}>
        <boxGeometry args={[0.12, 0.62, 1.08]} />
        <meshStandardMaterial
          color="#342821"
          roughness={0.82}
          metalness={0.05}
        />
      </mesh>

      <pointLight
        position={[0.16, 0.94, 0]}
        intensity={0.48}
        distance={2.8}
        decay={2}
        color="#89a7b8"
      />
    </RigidBody>
  );
}

function WallNotesSet() {
  return (
    <group>
      {wallNotes.map((note) => (
        <group
          key={note.id}
          position={note.position}
          rotation={note.rotation}
          scale={note.scale ?? 1}
        >
          <mesh position={[0.01, -0.01, -0.004]}>
            <planeGeometry args={[0.36, 0.26]} />
            <meshStandardMaterial
              color="#0a0d12"
              transparent
              opacity={0.22}
              roughness={1}
            />
          </mesh>
          <mesh>
            <planeGeometry args={[0.34, 0.24]} />
            <meshStandardMaterial
              color={note.color}
              roughness={0.92}
              metalness={0.01}
            />
          </mesh>
          <mesh position={[-0.06, 0.075, 0.002]}>
            <planeGeometry args={[0.18, 0.012]} />
            <meshBasicMaterial color="#222a33" transparent opacity={0.48} />
          </mesh>
          <mesh position={[0, 0.02, 0.002]}>
            <planeGeometry args={[0.23, 0.01]} />
            <meshBasicMaterial color="#2b3340" transparent opacity={0.34} />
          </mesh>
          <mesh position={[0.02, -0.035, 0.002]}>
            <planeGeometry args={[0.19, 0.01]} />
            <meshBasicMaterial color="#2b3340" transparent opacity={0.26} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WallSmears() {
  return (
    <group>
      <mesh position={[-3.52, 1.02, -0.78]} rotation={[0, Math.PI / 2, 0.18]}>
        <planeGeometry args={[0.94, 0.44]} />
        <meshBasicMaterial color="#150f15" transparent opacity={0.24} />
      </mesh>
      <mesh position={[3.52, 1.88, 1.04]} rotation={[0, -Math.PI / 2, -0.12]}>
        <planeGeometry args={[0.78, 0.28]} />
        <meshBasicMaterial color="#201218" transparent opacity={0.18} />
      </mesh>
      <mesh position={[1.82, 1.24, -3.52]} rotation={[0, 0, 0.04]}>
        <planeGeometry args={[0.88, 0.36]} />
        <meshBasicMaterial color="#1b0f12" transparent opacity={0.18} />
      </mesh>
      <mesh position={[-1.34, 1.96, 3.52]} rotation={[0, Math.PI, -0.06]}>
        <planeGeometry args={[0.58, 0.24]} />
        <meshBasicMaterial color="#101822" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 2.76, 1.44]}>
        <cylinderGeometry args={[0.016, 0.016, 1.1, 10]} />
        <meshStandardMaterial color="#181d24" roughness={0.82} />
      </mesh>
    </group>
  );
}

export function Room() {
  const showFloorGrid = useGameStore((state) => state.settings.showFloorGrid);
  const gunHeld = useGameStore((state) => state.gunHeld);
  const gunPlacement = useGameStore((state) => state.gunPlacement);
  const groundGunPosition = useGameStore((state) => state.groundGunPosition);
  const apartmentDoorOpen = useGameStore((state) => state.apartmentDoorOpen);
  const buildingExitDoorOpen = useGameStore(
    (state) => state.buildingExitDoorOpen,
  );
  const packageState = useGameStore((state) => state.packageState);
  const currentObjective = useGameStore((state) => state.currentObjective);
  const deliverySequencePhase = useGameStore(
    (state) => state.deliverySequencePhase,
  );
  const unlockedNeighborDoor = useGameStore(
    (state) => state.unlockedNeighborDoor,
  );
  const openNeighborDoorId = useGameStore((state) => state.openNeighborDoorId);
  const packageRecipientDoor =
    sceneLayout.farSideNeighborDoors.find(
      (door) => door.id === sceneLayout.package.recipientDoorId,
    ) ?? sceneLayout.farSideNeighborDoors[0];

  const gridArgs = useMemo(
    () =>
      [
        Math.max(roomConfig.width, roomConfig.depth),
        16,
        "#32485d",
        "#15202c",
      ] as const,
    [],
  );

  const halfWidth = roomConfig.width / 2;
  const halfDepth = roomConfig.depth / 2;
  const halfHeight = roomConfig.height / 2;
  const thickness = roomConfig.wallThickness;
  const baseTrimHeight = 0.12;
  const baseTrimDepth = 0.05;
  const cornerTrimSize = 0.08;
  const apartmentDoorWidth = sceneLayout.apartmentDoor.width;
  const apartmentDoorHeight = sceneLayout.apartmentDoor.height;
  const apartmentDoorLeftX = sceneLayout.apartmentDoor.hinge[0];
  const apartmentDoorRightX =
    sceneLayout.apartmentDoor.hinge[0] + apartmentDoorWidth;
  const apartmentDoorCenterX =
    sceneLayout.apartmentDoor.hinge[0] + apartmentDoorWidth / 2;
  const apartmentDoorGapLeftWidth = apartmentDoorCenterX - apartmentDoorWidth / 2 + halfWidth;
  const apartmentDoorGapRightWidth =
    halfWidth - (sceneLayout.apartmentDoor.hinge[0] + apartmentDoorWidth);
  const apartmentDoorLeftCenter =
    -halfWidth + apartmentDoorGapLeftWidth / 2;
  const apartmentDoorRightCenter =
    sceneLayout.apartmentDoor.hinge[0] +
    apartmentDoorWidth +
    apartmentDoorGapRightWidth / 2;
  const apartmentDoorLintelHeight =
    roomConfig.height - apartmentDoorHeight;
  const corridorHalfWidth = sceneLayout.corridor.size[0] / 2;
  const corridorHalfDepth = sceneLayout.corridor.size[2] / 2;
  const corridorCenter = sceneLayout.corridor.center;
  const corridorLeftX = corridorCenter[0] - corridorHalfWidth;
  const corridorRightX = corridorCenter[0] + corridorHalfWidth;
  const corridorNorthZ = corridorCenter[2] - corridorHalfDepth;
  const corridorSouthZ = corridorCenter[2] + corridorHalfDepth;
  const corridorApartmentGapLeftWidth = apartmentDoorLeftX - corridorLeftX;
  const corridorApartmentGapRightWidth =
    corridorRightX - apartmentDoorRightX;
  const corridorApartmentLeftCenter =
    corridorLeftX + corridorApartmentGapLeftWidth / 2;
  const corridorApartmentRightCenter =
    apartmentDoorRightX + corridorApartmentGapRightWidth / 2;
  const corridorApartmentLintelHeight =
    roomConfig.height - apartmentDoorHeight;
  const outsideHalfWidth = sceneLayout.outside.size[0] / 2;
  const outsideHalfDepth = sceneLayout.outside.size[2] / 2;
  const exitDoorWidth = sceneLayout.buildingExitDoor.width;
  const exitDoorHeight = sceneLayout.buildingExitDoor.height;
  const exitDoorCenterZ =
    sceneLayout.buildingExitDoor.hinge[2] +
    sceneLayout.buildingExitDoor.width / 2;
  const corridorExitTopDepth =
    sceneLayout.buildingExitDoor.hinge[2] - corridorNorthZ;
  const corridorExitBottomDepth =
    corridorSouthZ - (sceneLayout.buildingExitDoor.hinge[2] + exitDoorWidth);
  const corridorExitTopCenterZ =
    corridorNorthZ + corridorExitTopDepth / 2;
  const corridorExitBottomCenterZ =
    sceneLayout.buildingExitDoor.hinge[2] +
    exitDoorWidth +
    corridorExitBottomDepth / 2;
  const corridorExitLintelHeight = roomConfig.height - exitDoorHeight;
  const corridorLightPositions = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => corridorLeftX + 2.35 + index * 3.2)
        .filter((positionX) => positionX < corridorRightX - 0.9),
    [corridorLeftX, corridorRightX],
  );
  const corridorRunnerLength = Math.max(sceneLayout.corridor.size[0] - 5.2, 8.6);

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[halfWidth, thickness / 2, halfDepth]}
          position={[0, -thickness / 2, 0]}
        />
        <CuboidCollider
          args={[corridorHalfWidth, thickness / 2, corridorHalfDepth]}
          position={[
            corridorCenter[0],
            -thickness / 2,
            corridorCenter[2],
          ]}
        />
        <CuboidCollider
          args={[outsideHalfWidth, thickness / 2, outsideHalfDepth]}
          position={[
            sceneLayout.outside.center[0],
            -thickness / 2,
            sceneLayout.outside.center[2],
          ]}
        />
        <CuboidCollider
          args={[halfWidth, thickness / 2, halfDepth]}
          position={[0, roomConfig.height + thickness / 2, 0]}
        />
        <CuboidCollider
          args={[thickness / 2, halfHeight, halfDepth]}
          position={[-halfWidth - thickness / 2, halfHeight, 0]}
        />
        <CuboidCollider
          args={[thickness / 2, halfHeight, halfDepth]}
          position={[halfWidth + thickness / 2, halfHeight, 0]}
        />
        <CuboidCollider
          args={[apartmentDoorGapLeftWidth / 2, halfHeight, thickness / 2]}
          position={[
            apartmentDoorLeftCenter,
            halfHeight,
            -halfDepth - thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[apartmentDoorGapRightWidth / 2, halfHeight, thickness / 2]}
          position={[
            apartmentDoorRightCenter,
            halfHeight,
            -halfDepth - thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[apartmentDoorWidth / 2, apartmentDoorLintelHeight / 2, thickness / 2]}
          position={[
            apartmentDoorCenterX,
            apartmentDoorHeight + apartmentDoorLintelHeight / 2,
            -halfDepth - thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[halfWidth, halfHeight, thickness / 2]}
          position={[0, halfHeight, halfDepth + thickness / 2]}
        />

        {!apartmentDoorOpen ? (
          <CuboidCollider
            args={[
              sceneLayout.apartmentDoor.width / 2,
              sceneLayout.apartmentDoor.height / 2,
              sceneLayout.apartmentDoor.thickness / 2,
            ]}
            position={[
              apartmentDoorCenterX,
              sceneLayout.apartmentDoor.height / 2,
              sceneLayout.apartmentDoor.hinge[2],
            ]}
          />
        ) : null}

        <CuboidCollider
          args={[corridorHalfWidth, halfHeight, thickness / 2]}
          position={[
            corridorCenter[0],
            halfHeight,
            corridorCenter[2] - corridorHalfDepth - thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[corridorApartmentGapLeftWidth / 2, halfHeight, thickness / 2]}
          position={[
            corridorApartmentLeftCenter,
            halfHeight,
            corridorSouthZ + thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[corridorApartmentGapRightWidth / 2, halfHeight, thickness / 2]}
          position={[
            corridorApartmentRightCenter,
            halfHeight,
            corridorSouthZ + thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[apartmentDoorWidth / 2, corridorApartmentLintelHeight / 2, thickness / 2]}
          position={[
            apartmentDoorCenterX,
            apartmentDoorHeight + corridorApartmentLintelHeight / 2,
            corridorSouthZ + thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[thickness / 2, halfHeight, corridorHalfDepth]}
          position={[
            corridorCenter[0] + corridorHalfWidth + thickness / 2,
            halfHeight,
            corridorCenter[2],
          ]}
        />
        <CuboidCollider
          args={[thickness / 2, halfHeight, corridorExitTopDepth / 2]}
          position={[
            corridorLeftX - thickness / 2,
            halfHeight,
            corridorExitTopCenterZ,
          ]}
        />
        <CuboidCollider
          args={[thickness / 2, halfHeight, corridorExitBottomDepth / 2]}
          position={[
            corridorLeftX - thickness / 2,
            halfHeight,
            corridorExitBottomCenterZ,
          ]}
        />
        <CuboidCollider
          args={[thickness / 2, corridorExitLintelHeight / 2, exitDoorWidth / 2]}
          position={[
            corridorLeftX - thickness / 2,
            exitDoorHeight + corridorExitLintelHeight / 2,
            exitDoorCenterZ,
          ]}
        />

        {!buildingExitDoorOpen ? (
          <CuboidCollider
            args={[
              sceneLayout.buildingExitDoor.thickness / 2,
              sceneLayout.buildingExitDoor.height / 2,
              sceneLayout.buildingExitDoor.width / 2,
            ]}
            position={[
              sceneLayout.buildingExitDoor.hinge[0],
              sceneLayout.buildingExitDoor.height / 2,
              exitDoorCenterZ,
            ]}
          />
        ) : null}

        <CuboidCollider
          args={[outsideHalfWidth, halfHeight, thickness / 2]}
          position={[
            sceneLayout.outside.center[0],
            halfHeight,
            sceneLayout.outside.center[2] - outsideHalfDepth - thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[outsideHalfWidth - 1.2, halfHeight, thickness / 2]}
          position={[
            sceneLayout.outside.center[0] + 1.2,
            halfHeight,
            sceneLayout.outside.center[2] + outsideHalfDepth + thickness / 2,
          ]}
        />
        <CuboidCollider
          args={[thickness / 2, halfHeight, outsideHalfDepth]}
          position={[
            sceneLayout.outside.center[0] + outsideHalfWidth + thickness / 2,
            halfHeight,
            sceneLayout.outside.center[2],
          ]}
        />
      </RigidBody>

      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[roomConfig.width, roomConfig.depth]} />
        <meshStandardMaterial
          color={roomMaterials.floor}
          roughness={0.95}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, 0.006, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry
          args={[roomConfig.width * 0.64, roomConfig.depth * 0.64]}
        />
        <meshStandardMaterial
          color={roomMaterials.floorInset}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      {showFloorGrid ? (
        <gridHelper args={gridArgs} position={[0, 0.012, 0]} />
      ) : null}

      <mesh
        position={[0, roomConfig.height, 0]}
        rotation-x={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[roomConfig.width, roomConfig.depth]} />
        <meshStandardMaterial
          color={roomMaterials.ceiling}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>

      <mesh
        position={[0, roomConfig.height - 0.06, 0.12]}
        rotation-x={Math.PI / 2}
      >
        <planeGeometry args={[1.9, 1.0]} />
        <meshStandardMaterial
          color={roomMaterials.lightPanel}
          emissive="#7b8f72"
          emissiveIntensity={0.95}
          roughness={0.48}
          metalness={0.08}
        />
      </mesh>

      <pointLight
        position={[0, roomConfig.height - 0.2, 0]}
        intensity={11.4}
        distance={10}
        decay={2}
        color="#c8d5c0"
      />
      <pointLight
        position={[-2.1, 2.25, -1.4]}
        intensity={2.4}
        distance={12}
        decay={2}
        color="#4f6f7f"
      />
      <pointLight
        position={[2.46, 1.56, 1.7]}
        intensity={1.08}
        distance={5.4}
        decay={2}
        color="#6f4b53"
      />
      <pointLight
        position={[-10.4, 2.8, -4.6]}
        intensity={2.8}
        distance={18}
        decay={2}
        color="#aebec7"
      />

      <mesh
        position={[corridorCenter[0], 0, corridorCenter[2]]}
        rotation-x={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.corridor.size[0], sceneLayout.corridor.size[2]]} />
        <meshStandardMaterial color="#1a222b" roughness={0.98} metalness={0.04} />
      </mesh>
      <mesh
        position={[corridorCenter[0] + 0.4, 0.014, corridorCenter[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[corridorRunnerLength, 0.92]} />
        <meshStandardMaterial color="#694b55" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh
        position={[sceneLayout.outside.center[0], 0, sceneLayout.outside.center[2]]}
        rotation-x={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.outside.size[0], sceneLayout.outside.size[2]]} />
        <meshStandardMaterial color="#171c23" roughness={0.96} metalness={0.04} />
      </mesh>
      <mesh
        position={[sceneLayout.outside.center[0] + 1.2, 0.012, -5.26]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[13.8, 4.9]} />
        <meshStandardMaterial color="#20262d" roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh
        position={[-14.1, 0.013, sceneLayout.outside.center[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[4.6, 12.8]} />
        <meshStandardMaterial color="#20262d" roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh
        position={[sceneLayout.outside.center[0] + 1.2, 0.016, -2.04]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[13.8, 1.9]} />
        <meshStandardMaterial color="#4e5257" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh
        position={[sceneLayout.outside.center[0] + 1.2, 0.016, -8.48]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[13.8, 1.9]} />
        <meshStandardMaterial color="#4e5257" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh
        position={[-10.94, 0.016, sceneLayout.outside.center[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.9, 12.8]} />
        <meshStandardMaterial color="#4e5257" roughness={0.98} metalness={0.02} />
      </mesh>
      {[-8.6, -11.1, -13.6, -16.1].map((markX) => (
        <mesh
          key={`main-road-mark-${markX}`}
          position={[markX, 0.018, -5.26]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.94, 0.12]} />
          <meshStandardMaterial color="#d5c98d" roughness={0.72} metalness={0.04} />
        </mesh>
      ))}
      {[-9.0, -6.5, -4.0, -1.5].map((markZ) => (
        <mesh
          key={`cross-road-mark-${markZ}`}
          position={[-14.1, 0.018, markZ]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <planeGeometry args={[0.94, 0.12]} />
          <meshStandardMaterial color="#d5c98d" roughness={0.72} metalness={0.04} />
        </mesh>
      ))}
      {[
        [-8.94, 0.06, -7.7],
        [-12.42, 0.06, -10.2],
        [-17.3, 0.06, -2.56],
      ].map((planterPosition, index) => (
        <mesh key={`planter-${index}`} position={planterPosition as [number, number, number]}>
          <boxGeometry args={[0.82, 0.12, 0.82]} />
          <meshStandardMaterial color="#5e615b" roughness={0.9} metalness={0.04} />
        </mesh>
      ))}

      <mesh
        position={[apartmentDoorLeftCenter, halfHeight, -halfDepth]}
        receiveShadow
      >
        <planeGeometry args={[apartmentDoorGapLeftWidth, roomConfig.height]} />
        <meshStandardMaterial
          color={roomMaterials.front}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>
      <mesh
        position={[apartmentDoorRightCenter, halfHeight, -halfDepth]}
        receiveShadow
      >
        <planeGeometry args={[apartmentDoorGapRightWidth, roomConfig.height]} />
        <meshStandardMaterial
          color={roomMaterials.front}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>
      <mesh
        position={[
          apartmentDoorCenterX,
          apartmentDoorHeight + apartmentDoorLintelHeight / 2,
          -halfDepth,
        ]}
        receiveShadow
      >
        <planeGeometry args={[apartmentDoorWidth, apartmentDoorLintelHeight]} />
        <meshStandardMaterial
          color={roomMaterials.front}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>
      <mesh
        position={[corridorCenter[0], halfHeight, corridorCenter[2] - corridorHalfDepth]}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.corridor.size[0], roomConfig.height]} />
        <meshStandardMaterial color="#131b23" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[corridorApartmentLeftCenter, halfHeight, corridorSouthZ]}
        rotation-y={Math.PI}
        receiveShadow
      >
        <planeGeometry args={[corridorApartmentGapLeftWidth, roomConfig.height]} />
        <meshStandardMaterial color="#1d2630" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[corridorApartmentRightCenter, halfHeight, corridorSouthZ]}
        rotation-y={Math.PI}
        receiveShadow
      >
        <planeGeometry args={[corridorApartmentGapRightWidth, roomConfig.height]} />
        <meshStandardMaterial color="#1d2630" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[
          apartmentDoorCenterX,
          apartmentDoorHeight + corridorApartmentLintelHeight / 2,
          corridorSouthZ,
        ]}
        rotation-y={Math.PI}
        receiveShadow
      >
        <planeGeometry args={[apartmentDoorWidth, corridorApartmentLintelHeight]} />
        <meshStandardMaterial color="#1d2630" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[corridorCenter[0] + corridorHalfWidth, halfHeight, corridorCenter[2]]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.corridor.size[2], roomConfig.height]} />
        <meshStandardMaterial color="#202a35" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[corridorLeftX, halfHeight, corridorExitTopCenterZ]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[corridorExitTopDepth, roomConfig.height]} />
        <meshStandardMaterial color="#222d37" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh
        position={[corridorLeftX, halfHeight, corridorExitBottomCenterZ]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[corridorExitBottomDepth, roomConfig.height]} />
        <meshStandardMaterial color="#222d37" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh
        position={[
          corridorLeftX,
          exitDoorHeight + corridorExitLintelHeight / 2,
          exitDoorCenterZ,
        ]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[exitDoorWidth, corridorExitLintelHeight]} />
        <meshStandardMaterial color="#222d37" roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh
        position={[
          sceneLayout.outside.center[0] + outsideHalfWidth,
          halfHeight,
          sceneLayout.outside.center[2],
        ]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.outside.size[2], roomConfig.height]} />
        <meshStandardMaterial color="#10161f" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[
          sceneLayout.outside.center[0],
          halfHeight,
          sceneLayout.outside.center[2] - outsideHalfDepth,
        ]}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.outside.size[0], roomConfig.height]} />
        <meshStandardMaterial color="#10161f" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh
        position={[
          sceneLayout.outside.center[0] + 1.2,
          halfHeight,
          sceneLayout.outside.center[2] + outsideHalfDepth,
        ]}
        rotation-y={Math.PI}
        receiveShadow
      >
        <planeGeometry args={[sceneLayout.outside.size[0] - 2.4, roomConfig.height]} />
        <meshStandardMaterial color="#10161f" roughness={0.96} metalness={0.02} />
      </mesh>

      <mesh
        position={[0, halfHeight, halfDepth]}
        rotation-y={Math.PI}
        receiveShadow
      >
        <planeGeometry args={[roomConfig.width, roomConfig.height]} />
        <meshStandardMaterial
          color={roomMaterials.back}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>

      <mesh
        position={[-halfWidth, halfHeight, 0]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[roomConfig.depth, roomConfig.height]} />
        <meshStandardMaterial
          color={roomMaterials.left}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>

      <mesh
        position={[halfWidth, halfHeight, 0]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[roomConfig.depth, roomConfig.height]} />
        <meshStandardMaterial
          color={roomMaterials.right}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>

      <mesh
        position={[0, baseTrimHeight / 2, -halfDepth + baseTrimDepth / 2]}
        castShadow
      >
        <boxGeometry args={[roomConfig.width, baseTrimHeight, baseTrimDepth]} />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.85} />
      </mesh>
      <mesh
        position={[0, baseTrimHeight / 2, halfDepth - baseTrimDepth / 2]}
        castShadow
      >
        <boxGeometry args={[roomConfig.width, baseTrimHeight, baseTrimDepth]} />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.85} />
      </mesh>
      <mesh
        position={[-halfWidth + baseTrimDepth / 2, baseTrimHeight / 2, 0]}
        castShadow
      >
        <boxGeometry args={[baseTrimDepth, baseTrimHeight, roomConfig.depth]} />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.85} />
      </mesh>
      <mesh
        position={[halfWidth - baseTrimDepth / 2, baseTrimHeight / 2, 0]}
        castShadow
      >
        <boxGeometry args={[baseTrimDepth, baseTrimHeight, roomConfig.depth]} />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.85} />
      </mesh>

      <mesh position={[-halfWidth, halfHeight, -halfDepth]}>
        <boxGeometry
          args={[cornerTrimSize, roomConfig.height, cornerTrimSize]}
        />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.78} />
      </mesh>
      <mesh position={[halfWidth, halfHeight, -halfDepth]}>
        <boxGeometry
          args={[cornerTrimSize, roomConfig.height, cornerTrimSize]}
        />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.78} />
      </mesh>
      <mesh position={[-halfWidth, halfHeight, halfDepth]}>
        <boxGeometry
          args={[cornerTrimSize, roomConfig.height, cornerTrimSize]}
        />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.78} />
      </mesh>
      <mesh position={[halfWidth, halfHeight, halfDepth]}>
        <boxGeometry
          args={[cornerTrimSize, roomConfig.height, cornerTrimSize]}
        />
        <meshStandardMaterial color={roomMaterials.trim} roughness={0.78} />
      </mesh>

      <SwingDoor
        hinge={sceneLayout.apartmentDoor.hinge}
        width={sceneLayout.apartmentDoor.width}
        height={sceneLayout.apartmentDoor.height}
        thickness={sceneLayout.apartmentDoor.thickness}
        open={apartmentDoorOpen}
        openAngle={-1.28}
        leafColor="#6f5842"
        panelColor="#cbdce4"
        trimColor="#445768"
        accentColor="#dcc08d"
        knobColor="#f3d186"
        plaque={{
          label: sceneLayout.apartmentDoor.unitId,
          residentName: sceneLayout.apartmentDoor.residentName,
          side: "negative",
        }}
      />
      <SwingDoor
        hinge={sceneLayout.buildingExitDoor.hinge}
        width={sceneLayout.buildingExitDoor.width}
        height={sceneLayout.buildingExitDoor.height}
        thickness={sceneLayout.buildingExitDoor.thickness}
        open={buildingExitDoorOpen}
        openAngle={1.18}
        alongZ
        leafColor="#3f5f7b"
        panelColor="#d6ebf3"
        trimColor="#21455e"
        accentColor="#a2c4d4"
        knobColor="#f6df8f"
      />

      {sceneLayout.nearSideNeighborDoors.map((door) => (
        <NeighborDoorProp
          key={door.id}
          position={door.position}
          label={door.id}
          residentName={door.residentName}
          facing="north"
          highlighted={unlockedNeighborDoor === door.id}
          open={openNeighborDoorId === door.id}
        />
      ))}
      {sceneLayout.farSideNeighborDoors.map((door) => (
        <NeighborDoorProp
          key={door.id}
          position={door.position}
          label={door.id}
          residentName={door.residentName}
          highlighted={unlockedNeighborDoor === door.id}
          open={openNeighborDoorId === door.id}
        />
      ))}

      <mesh
        position={[
          packageRecipientDoor.position[0],
          1.02,
          packageRecipientDoor.position[2] + 0.12,
        ]}
      >
        <planeGeometry args={[0.88, 1.92]} />
        <meshStandardMaterial
          color="#070a0f"
          transparent
          opacity={openNeighborDoorId === sceneLayout.package.recipientDoorId ? 0.74 : 0}
        />
      </mesh>
      <ElderNeighborProp
        position={[
          packageRecipientDoor.position[0],
          0.02,
          packageRecipientDoor.position[2] - 0.08,
        ]}
        visible={
          deliverySequencePhase !== "idle" || currentObjective === "neighbor-visit"
        }
      />

      {packageState === "doorstep" ? <PackageProp /> : null}

      {corridorLightPositions.map((lightX, index) => (
        <group
          key={`corridor-light-${index}`}
          position={[lightX, roomConfig.height - 0.14, corridorCenter[2]]}
        >
          <mesh>
            <boxGeometry args={[0.98, 0.05, 0.28]} />
            <meshStandardMaterial
              color="#3f4e58"
              emissive="#a4b4aa"
              emissiveIntensity={0.48}
              roughness={0.68}
              metalness={0.18}
            />
          </mesh>
          <pointLight
            position={[0, -0.08, 0]}
            intensity={3.4}
            distance={5.8}
            decay={2}
            color="#d2d9c8"
          />
        </group>
      ))}

      <StreetLampProp position={[-8.36, 0, -8.76]} />
      <StreetLampProp position={[-11.28, 0, -0.56]} />
      <StreetLampProp position={[-16.82, 0, -8.72]} />
      <StreetLampProp position={[-16.92, 0, -0.24]} />
      <BuildingFrontProp
        position={[-10.54, 0, -12.42]}
        size={[4.6, 4.2, 0.8]}
        tone="#28303a"
      />
      <BuildingFrontProp
        position={[-16.56, 0, -12.12]}
        size={[5.2, 4.5, 0.86]}
        tone="#232b35"
      />
      <BuildingFrontProp
        position={[-10.2, 0, 3.18]}
        size={[4.8, 4.4, 0.86]}
        tone="#262f39"
      />
      <BuildingFrontProp
        position={[-16.34, 0, 2.92]}
        size={[5.4, 4.7, 0.9]}
        tone="#222b34"
      />

      <RadiatorProp position={[-2.74, 0, 3.38]} rotationY={Math.PI} />
      <RadiatorProp position={[15.4, 0, -8.58]} rotationY={Math.PI} />
      <UtilityBoxProp position={[-5.86, 0.32, -8.02]} rotationY={Math.PI} />
      <LeakBucket position={[-2.94, 0, 2.72]} />
      <LeakBucket position={[15.18, 0, -4.3]} />
      <DecayPatches />
      <DebrisScatter />
      <WallSmears />
      <WallNotesSet />
      <BedSet />
      <TableSet showGun={!gunHeld && gunPlacement === "table"} />
      {!gunHeld && gunPlacement === "ground" ? (
        <PistolProp position={groundGunPosition} surface="ground" />
      ) : null}
    </group>
  );
}
