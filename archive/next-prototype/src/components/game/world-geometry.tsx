"use client";

import { Html, RoundedBox, Sky } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";

import type { GameSnapshot } from "@/components/game/game-types";

type Vec3 = [number, number, number];

function StaticBlock({
  castShadow = true,
  collider = true,
  color,
  damageId,
  position,
  rotation = [0, 0, 0],
  size,
}: {
  castShadow?: boolean;
  collider?: boolean;
  color: string;
  damageId?: string;
  position: Vec3;
  rotation?: Vec3;
  size: Vec3;
}) {
  const mesh = (
    <mesh castShadow={castShadow} receiveShadow userData={damageId ? { damageId } : undefined}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );

  if (!collider) {
    return <group position={position} rotation={rotation}>{mesh}</group>;
  }

  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      {mesh}
    </RigidBody>
  );
}

function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[45, 0.12, 38]} position={[0, -0.12, 8]} />
      </RigidBody>
      <mesh receiveShadow position={[0, -0.14, 0]}>
        <boxGeometry args={[90, 0.25, 76]} />
        <meshStandardMaterial color="#677a5d" roughness={1} />
      </mesh>
      <StaticBlock collider={false} color="#4c5354" damageId="main-road" position={[0, -0.01, 8.2]} size={[90, 0.08, 10.2]} />
      <StaticBlock collider={false} color="#4a5152" damageId="cross-road" position={[24, 0, 18]} size={[9.5, 0.09, 40]} />
      <StaticBlock collider={false} color="#b8b4a8" position={[0, 0.035, 1.55]} size={[90, 0.12, 2.15]} />
      <StaticBlock color="#8e8b82" position={[0, 0.18, 2.65]} size={[90, 0.3, 0.22]} />
      <StaticBlock collider={false} color="#ded9c8" position={[0, 0.045, 8.2]} size={[0.16, 0.02, 3.4]} />
      {[-32, -20, -8, 8, 20, 34].map((x) => (
        <StaticBlock key={x} collider={false} color="#ded9c8" position={[x, 0.045, 8.2]} size={[4.8, 0.02, 0.12]} />
      ))}
      <StaticBlock collider={false} color="#c7c2b4" position={[24, 0.04, 3.15]} size={[9.8, 0.11, 1.0]} />
    </>
  );
}

function WindowPanel({ position, trim }: { position: Vec3; trim: string }) {
  return (
    <group position={position}>
      <StaticBlock collider={false} color="#a9c8c8" position={[0, 0, 0]} size={[1.35, 1.08, 0.07]} />
      <StaticBlock collider={false} color={trim} position={[0, 0, 0.05]} size={[0.08, 1.18, 0.08]} />
      <StaticBlock collider={false} color={trim} position={[0, 0, 0.05]} size={[1.45, 0.08, 0.08]} />
      <StaticBlock collider={false} color={trim} position={[0, 0.57, 0.05]} size={[1.45, 0.08, 0.08]} />
      <StaticBlock collider={false} color={trim} position={[0, -0.57, 0.05]} size={[1.45, 0.08, 0.08]} />
    </group>
  );
}

function OpenDoor({
  color,
  doorWorldX,
  opensLeft,
}: {
  color: string;
  doorWorldX: number;
  opensLeft: boolean;
}) {
  const hinge = opensLeft ? -0.72 : 0.72;

  return (
    <group
      position={[doorWorldX + hinge, 0, -1.12]}
      rotation={[0, opensLeft ? -1.18 : 1.18, 0]}
    >
      <StaticBlock
        collider={false}
        color={color}
        position={[-hinge, 1.13, 0]}
        size={[1.42, 2.25, 0.1]}
      />
      <mesh castShadow position={[-hinge + (opensLeft ? 0.43 : -0.43), 1.12, -0.09]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#c3a466" metalness={0.35} roughness={0.45} />
      </mesh>
    </group>
  );
}

function ClosedDoor({ color, doorWorldX }: { color: string; doorWorldX: number }) {
  return (
    <group>
      <StaticBlock color={color} position={[doorWorldX, 1.13, -1.02]} size={[1.42, 2.25, 0.1]} />
      <mesh castShadow position={[doorWorldX - 0.45, 1.12, -0.94]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#c3a466" metalness={0.35} roughness={0.45} />
      </mesh>
      <StaticBlock collider={false} color="#efe5cf" position={[doorWorldX, 1.78, -0.94]} size={[0.5, 0.22, 0.025]} />
    </group>
  );
}

function HouseShell({
  centerX,
  doorLocalX,
  doorColor,
  exterior,
  floor,
  opensLeft,
  doorOpen,
}: {
  centerX: number;
  doorColor: string;
  doorOpen: boolean;
  doorLocalX: number;
  exterior: string;
  floor: string;
  opensLeft: boolean;
}) {
  const leftEdge = -4.05;
  const rightEdge = 4.05;
  const openingHalf = 0.76;
  const leftEnd = doorLocalX - openingHalf;
  const rightStart = doorLocalX + openingHalf;
  const leftWidth = leftEnd - leftEdge;
  const rightWidth = rightEdge - rightStart;
  const wallColor = exterior;
  const doorWorldX = centerX + doorLocalX;
  const windowLocalX = -doorLocalX * 0.72;

  return (
    <group>
      <StaticBlock collider={false} color={floor} position={[centerX, -0.015, -4.95]} size={[8.05, 0.08, 7.55]} />
      <StaticBlock color={wallColor} position={[centerX, 1.65, -8.74]} size={[8.2, 3.3, 0.22]} />
      <StaticBlock color={wallColor} position={[centerX - 4.1, 1.65, -4.95]} size={[0.22, 3.3, 7.8]} />
      <StaticBlock color={wallColor} position={[centerX + 4.1, 1.65, -4.95]} size={[0.22, 3.3, 7.8]} />
      <StaticBlock
        color={wallColor}
        position={[centerX + (leftEdge + leftEnd) / 2, 1.65, -1.13]}
        size={[leftWidth, 3.3, 0.22]}
      />
      <StaticBlock
        color={wallColor}
        position={[centerX + (rightStart + rightEdge) / 2, 1.65, -1.13]}
        size={[rightWidth, 3.3, 0.22]}
      />
      <StaticBlock color={wallColor} position={[doorWorldX, 2.82, -1.13]} size={[1.52, 0.96, 0.22]} />
      <StaticBlock collider={false} color="#ede8dc" position={[doorWorldX, 2.37, -1.0]} size={[1.72, 0.12, 0.12]} />
      <StaticBlock collider={false} color="#ede8dc" position={[doorWorldX - 0.82, 1.18, -1.0]} size={[0.12, 2.46, 0.12]} />
      <StaticBlock collider={false} color="#ede8dc" position={[doorWorldX + 0.82, 1.18, -1.0]} size={[0.12, 2.46, 0.12]} />
      <WindowPanel position={[centerX + windowLocalX, 1.92, -0.985]} trim="#ece7db" />
      {doorOpen ? (
        <OpenDoor color={doorColor} doorWorldX={doorWorldX} opensLeft={opensLeft} />
      ) : (
        <ClosedDoor color={doorColor} doorWorldX={doorWorldX} />
      )}

      <mesh position={[centerX, 3.62, -4.94]} renderOrder={1}>
        <boxGeometry args={[8.42, 0.14, 7.92]} />
        <meshStandardMaterial
          color="#55463d"
          depthWrite={false}
          opacity={0.13}
          roughness={0.95}
          transparent
        />
      </mesh>
      <StaticBlock collider={false} color="#d6cbbc" position={[centerX, 3.35, -8.76]} size={[8.55, 0.18, 0.28]} />
      <StaticBlock collider={false} color="#d6cbbc" position={[centerX - 4.13, 3.35, -4.95]} size={[0.28, 0.18, 7.9]} />
      <StaticBlock collider={false} color="#d6cbbc" position={[centerX + 4.13, 3.35, -4.95]} size={[0.28, 0.18, 7.9]} />
    </group>
  );
}

function Rug({ color, position, size }: { color: string; position: Vec3; size: [number, number] }) {
  return (
    <RoundedBox args={[size[0], 0.06, size[1]]} castShadow position={position} radius={0.08}>
      <meshStandardMaterial color={color} roughness={1} />
    </RoundedBox>
  );
}

function GunProp() {
  return (
    <group position={[-3.65, 0.81, -4.05]} rotation={[0, -0.45, 0]}>
      <mesh castShadow position={[0, 0.07, -0.12]}>
        <boxGeometry args={[0.18, 0.15, 0.54]} />
        <meshStandardMaterial color="#303534" metalness={0.48} roughness={0.36} />
      </mesh>
      <mesh castShadow position={[0, -0.04, 0.13]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.14, 0.3, 0.17]} />
        <meshStandardMaterial color="#202524" metalness={0.3} roughness={0.48} />
      </mesh>
    </group>
  );
}

function JarLabel({ children, x }: { children: string; x: number }) {
  return (
    <Html center distanceFactor={5.5} position={[x, 0.62, 0]} transform>
      <span className="world-item-label">{children}</span>
    </Html>
  );
}

function KitchenJars({ honeyServings, jamServings }: { honeyServings: number; jamServings: number }) {
  return (
    <group>
      <group position={[-2.55, 1.27, -7.78]}>
        <mesh castShadow scale={[1, Math.max(0.18, honeyServings / 7), 1]}>
          <cylinderGeometry args={[0.15, 0.17, 0.38, 18]} />
          <meshStandardMaterial color={honeyServings > 0 ? "#c78c32" : "#786b55"} roughness={0.42} transparent opacity={0.86} />
        </mesh>
        <mesh castShadow position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.06, 18]} />
          <meshStandardMaterial color="#d7bf77" metalness={0.25} roughness={0.45} />
        </mesh>
        <StaticBlock collider={false} color="#f0e5c7" position={[0, 0, 0.16]} size={[0.17, 0.12, 0.015]} />
        <JarLabel x={-0.22}>{honeyServings > 0 ? `BAL · ${honeyServings}` : "BAL · BİTTİ"}</JarLabel>
      </group>
      <group position={[-2.05, 1.27, -7.78]}>
        <mesh castShadow scale={[1, Math.max(0.18, jamServings / 6), 1]}>
          <cylinderGeometry args={[0.15, 0.17, 0.38, 18]} />
          <meshStandardMaterial color={jamServings > 0 ? "#8f2f32" : "#665858"} roughness={0.5} transparent opacity={0.9} />
        </mesh>
        <mesh castShadow position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.06, 18]} />
          <meshStandardMaterial color="#9c3330" metalness={0.18} roughness={0.5} />
        </mesh>
        <StaticBlock collider={false} color="#f0e5c7" position={[0, 0, 0.16]} size={[0.17, 0.12, 0.015]} />
        <JarLabel x={0.22}>{jamServings > 0 ? `REÇEL · ${jamServings}` : "REÇEL · BİTTİ"}</JarLabel>
      </group>
    </group>
  );
}

function OwnBathroom() {
  return (
    <group>
      <StaticBlock color="#c7d0c8" position={[-7.25, 1.35, -3.72]} size={[2.25, 2.7, 0.13]} />
      <StaticBlock color="#c7d0c8" position={[-6.1, 1.35, -3.32]} size={[0.13, 2.7, 0.75]} />
      <StaticBlock color="#c7d0c8" position={[-6.1, 1.35, -1.55]} size={[0.13, 2.7, 0.72]} />
      <StaticBlock collider={false} color="#87968e" position={[-7.25, 0.015, -2.42]} size={[2.15, 0.04, 2.48]} />

      <RoundedBox args={[0.55, 0.34, 0.72]} castShadow position={[-7.52, 0.28, -2.05]} radius={0.14}>
        <meshStandardMaterial color="#ecebe4" roughness={0.55} />
      </RoundedBox>
      <StaticBlock color="#ecebe4" position={[-7.52, 0.62, -1.8]} size={[0.56, 0.55, 0.25]} />
      <mesh position={[-7.52, 0.46, -2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.045, 10, 22]} />
        <meshStandardMaterial color="#d9dcd7" roughness={0.55} />
      </mesh>

      <StaticBlock color="#dde2dc" position={[-6.55, 0.84, -3.35]} size={[0.72, 0.14, 0.5]} />
      <StaticBlock color="#c2c9c3" position={[-6.55, 0.42, -3.49]} size={[0.12, 0.84, 0.12]} />
      <mesh position={[-6.55, 0.89, -3.35]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 18]} />
        <meshStandardMaterial color="#a9b7b0" roughness={0.35} />
      </mesh>

      <RoundedBox args={[0.86, 0.08, 0.82]} castShadow position={[-7.78, 0.06, -3.23]} radius={0.05}>
        <meshStandardMaterial color="#d6ddd8" roughness={0.65} />
      </RoundedBox>
      <mesh position={[-7.78, 1.23, -3.55]}>
        <cylinderGeometry args={[0.035, 0.035, 2.1, 10]} />
        <meshStandardMaterial color="#8a9992" metalness={0.45} roughness={0.32} />
      </mesh>
      <mesh position={[-7.78, 2.28, -3.44]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 18]} />
        <meshStandardMaterial color="#8a9992" metalness={0.45} roughness={0.32} />
      </mesh>
    </group>
  );
}

function OwnStudio({
  gunVisible,
  honeyServings,
  jamServings,
}: {
  gunVisible: boolean;
  honeyServings: number;
  jamServings: number;
}) {
  return (
    <group>
      <Rug color="#9c5141" position={[-5.2, 0.04, -4.75]} size={[3.5, 2.45]} />
      <group>
        <StaticBlock color="#775844" position={[-6.55, 0.3, -6.55]} size={[2.45, 0.58, 3.2]} />
        <StaticBlock collider={false} color="#e1d7c6" position={[-6.55, 0.64, -6.55]} size={[2.3, 0.24, 3.02]} />
        <StaticBlock collider={false} color="#d47b60" position={[-6.45, 0.8, -6.12]} size={[1.75, 0.12, 1.55]} />
        <RoundedBox args={[1.8, 0.22, 0.62]} castShadow position={[-6.55, 0.84, -7.55]} radius={0.12}>
          <meshStandardMaterial color="#f0ede4" roughness={1} />
        </RoundedBox>
      </group>

      <StaticBlock color="#6f5a47" position={[-3.65, 0.67, -4.05]} size={[1.45, 0.12, 1.0]} />
      <StaticBlock color="#5e4b3d" position={[-4.18, 0.32, -4.4]} size={[0.1, 0.64, 0.1]} />
      <StaticBlock color="#5e4b3d" position={[-3.12, 0.32, -4.4]} size={[0.1, 0.64, 0.1]} />
      <StaticBlock color="#5e4b3d" position={[-4.18, 0.32, -3.7]} size={[0.1, 0.64, 0.1]} />
      <StaticBlock color="#5e4b3d" position={[-3.12, 0.32, -3.7]} size={[0.1, 0.64, 0.1]} />
      {gunVisible ? <GunProp /> : null}

      <StaticBlock color="#6c837a" position={[-2.35, 0.5, -8.12]} size={[2.65, 1.0, 1.0]} />
      <StaticBlock collider={false} color="#b89b70" position={[-2.35, 1.04, -8.12]} size={[2.85, 0.09, 1.1]} />
      <KitchenJars honeyServings={honeyServings} jamServings={jamServings} />
      <mesh castShadow position={[-3.1, 1.14, -8.1]}>
        <boxGeometry args={[0.5, 0.08, 0.42]} />
        <meshStandardMaterial color="#2f3735" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh position={[-1.28, 1.12, -8.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.045, 10, 20]} />
        <meshStandardMaterial color="#9ea7a3" metalness={0.35} roughness={0.4} />
      </mesh>
      <StaticBlock color="#e7e3d9" position={[-7.65, 1.25, -8.06]} size={[1.0, 2.5, 1.12]} />
      <StaticBlock collider={false} color="#6c7570" position={[-7.65, 1.35, -7.47]} size={[0.3, 0.04, 0.04]} />

      <group position={[-2.15, 0, -2.25]}>
        <StaticBlock collider={false} color="#725a48" position={[0, 0.48, 0]} size={[0.08, 0.96, 0.08]} />
        <StaticBlock collider={false} color="#725a48" position={[0, 0.04, 0]} size={[0.5, 0.08, 0.5]} />
        <mesh castShadow position={[0, 1.1, 0]}>
          <coneGeometry args={[0.44, 0.66, 20, 1, true]} />
          <meshStandardMaterial color="#e5b66b" emissive="#9a5f25" emissiveIntensity={0.22} side={THREE.DoubleSide} />
        </mesh>
        <pointLight color="#ffd694" distance={4.2} intensity={4.8} position={[0, 1.08, 0]} />
      </group>

      <StaticBlock collider={false} color="#9c5141" position={[-4.8, 1.9, -8.6]} size={[1.4, 0.9, 0.06]} />
      <StaticBlock collider={false} color="#e0c997" position={[-4.8, 1.9, -8.55]} size={[0.9, 0.5, 0.03]} />

      <RoundedBox args={[2.15, 0.68, 1.02]} castShadow position={[-3.85, 0.53, -6.38]} radius={0.17}>
        <meshStandardMaterial color="#526962" roughness={0.96} />
      </RoundedBox>
      <StaticBlock color="#455a54" position={[-3.85, 1.01, -6.78]} size={[2.1, 0.66, 0.22]} />
      <StaticBlock color="#455a54" position={[-4.9, 0.72, -6.38]} size={[0.22, 0.62, 1.0]} />
      <StaticBlock color="#455a54" position={[-2.8, 0.72, -6.38]} size={[0.22, 0.62, 1.0]} />
      <StaticBlock collider={false} color="#202827" position={[-4.75, 1.82, -8.58]} size={[1.5, 0.82, 0.08]} />

      <OwnBathroom />
    </group>
  );
}

function ElderFigure({ coffee = false, position }: { coffee?: boolean; position: Vec3 }) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[0.32, 0.92, 0.32]} position={[0, 0.92, 0]} />
      <group>
        <mesh castShadow position={[0, 1.72, 0]}>
          <sphereGeometry args={[0.24, 18, 18]} />
          <meshStandardMaterial color="#d4b397" roughness={0.95} />
        </mesh>
        <mesh castShadow position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.245, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ddd8ca" roughness={1} />
        </mesh>
        <StaticBlock collider={false} color="#7e6957" position={[0, 1.18, 0]} size={[0.15, 0.88, 0.15]} />
        <StaticBlock collider={false} color="#4e4941" position={[-0.29, 1.2, 0]} rotation={[0, 0, -0.7]} size={[0.09, 0.7, 0.09]} />
        <StaticBlock collider={false} color="#4e4941" position={[0.29, 1.2, 0]} rotation={[0, 0, 0.7]} size={[0.09, 0.7, 0.09]} />
        <StaticBlock collider={false} color="#4e4941" position={[-0.18, 0.46, 0]} rotation={[0, 0, -0.18]} size={[0.1, 0.9, 0.1]} />
        <StaticBlock collider={false} color="#4e4941" position={[0.18, 0.46, 0]} rotation={[0, 0, 0.18]} size={[0.1, 0.9, 0.1]} />
        <StaticBlock collider={false} color="#846d50" position={[0.5, 0.62, 0]} size={[0.07, 1.2, 0.07]} />
        {coffee ? (
          <group position={[-0.34, 1.16, -0.18]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.085, 0.2, 18]} />
              <meshStandardMaterial color="#e5ded0" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.077, 0.077, 0.01, 18]} />
              <meshStandardMaterial color="#563321" roughness={0.9} />
            </mesh>
          </group>
        ) : null}
      </group>
    </RigidBody>
  );
}

function NeighborBathroom() {
  return (
    <group>
      <StaticBlock color="#c8c1b5" position={[7.25, 1.35, -3.72]} size={[2.25, 2.7, 0.13]} />
      <StaticBlock color="#c8c1b5" position={[6.1, 1.35, -3.32]} size={[0.13, 2.7, 0.75]} />
      <StaticBlock color="#c8c1b5" position={[6.1, 1.35, -1.55]} size={[0.13, 2.7, 0.72]} />
      <StaticBlock collider={false} color="#8c8981" position={[7.25, 0.015, -2.42]} size={[2.15, 0.04, 2.48]} />

      <RoundedBox args={[0.55, 0.34, 0.72]} castShadow position={[7.52, 0.28, -2.05]} radius={0.14}>
        <meshStandardMaterial color="#e8e5dc" roughness={0.58} />
      </RoundedBox>
      <StaticBlock color="#e8e5dc" position={[7.52, 0.62, -1.8]} size={[0.56, 0.55, 0.25]} />
      <mesh position={[7.52, 0.46, -2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.045, 10, 22]} />
        <meshStandardMaterial color="#d6d7d1" roughness={0.58} />
      </mesh>

      <StaticBlock color="#d8d4ca" position={[6.55, 0.84, -3.35]} size={[0.72, 0.14, 0.5]} />
      <StaticBlock color="#bdbbb4" position={[6.55, 0.42, -3.49]} size={[0.12, 0.84, 0.12]} />
      <RoundedBox args={[0.86, 0.08, 0.82]} castShadow position={[7.78, 0.06, -3.23]} radius={0.05}>
        <meshStandardMaterial color="#d2d3cc" roughness={0.68} />
      </RoundedBox>
      <StaticBlock collider={false} color="#7a837f" position={[7.78, 1.18, -3.58]} size={[0.07, 2.22, 0.07]} />
    </group>
  );
}

function NeighborInterior({
  cinematicProgress,
  elderVisible,
  storyStage,
}: {
  cinematicProgress: number;
  elderVisible: boolean;
  storyStage: GameSnapshot["storyStage"];
}) {
  const elderNearDoor = storyStage === "delivery" || storyStage === "coffee-drink" || storyStage === "coffee-reject";
  const elderPosition: Vec3 = elderNearDoor
    ? [2.55 + cinematicProgress * 0.18, 0, -2.18 - cinematicProgress * 0.28]
    : [4.9, 0, -5.75];

  return (
    <group position={[6, 0, 0]}>
      <Rug color="#60786e" position={[4.65, 0.04, -4.65]} size={[4.2, 2.8]} />
      <RoundedBox args={[2.8, 0.72, 1.25]} castShadow position={[2.45, 0.56, -7.2]} radius={0.18}>
        <meshStandardMaterial color="#8f775e" roughness={0.96} />
      </RoundedBox>
      <StaticBlock color="#8f775e" position={[2.45, 1.05, -7.68]} size={[2.75, 0.76, 0.28]} />
      <StaticBlock color="#826a54" position={[1.12, 0.82, -7.2]} size={[0.25, 0.72, 1.2]} />
      <StaticBlock color="#826a54" position={[3.78, 0.82, -7.2]} size={[0.25, 0.72, 1.2]} />

      <StaticBlock color="#697c74" position={[6.55, 0.5, -8.1]} size={[2.9, 1.0, 1.02]} />
      <StaticBlock collider={false} color="#b79b70" position={[6.55, 1.04, -8.1]} size={[3.08, 0.09, 1.12]} />
      <mesh castShadow position={[6.2, 1.28, -8.05]}>
        <cylinderGeometry args={[0.22, 0.27, 0.38, 18]} />
        <meshStandardMaterial color="#777b75" roughness={0.6} />
      </mesh>

      <StaticBlock color="#745943" position={[4.75, 0.63, -4.1]} size={[1.7, 0.12, 1.1]} />
      <StaticBlock color="#654c3b" position={[4.15, 0.3, -4.5]} size={[0.1, 0.6, 0.1]} />
      <StaticBlock color="#654c3b" position={[5.35, 0.3, -4.5]} size={[0.1, 0.6, 0.1]} />
      <StaticBlock color="#654c3b" position={[4.15, 0.3, -3.7]} size={[0.1, 0.6, 0.1]} />
      <StaticBlock color="#654c3b" position={[5.35, 0.3, -3.7]} size={[0.1, 0.6, 0.1]} />

      <StaticBlock collider={false} color="#655d50" position={[0.62, 1.75, -5.15]} size={[0.12, 3.5, 0.12]} />
      <StaticBlock collider={false} color="#655d50" position={[0.62, 0.04, -5.15]} size={[0.62, 0.08, 0.62]} />
      <mesh castShadow position={[0.62, 2.52, -5.15]}>
        <coneGeometry args={[0.52, 0.72, 20, 1, true]} />
        <meshStandardMaterial color="#d6b66f" emissive="#8f6325" emissiveIntensity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#ffd9a0" distance={4.2} intensity={4.5} position={[0.62, 2.45, -5.15]} />

      <NeighborBathroom />
      {elderVisible ? <ElderFigure coffee={storyStage === "coffee-drink"} position={elderPosition} /> : null}
    </group>
  );
}

function Package({ position = [-2.25, 0.04, 0.25] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.82, 0.48, 0.68]} castShadow position={[0, 0.25, 0]} radius={0.05}>
        <meshStandardMaterial color="#ae7043" roughness={0.9} />
      </RoundedBox>
      <StaticBlock collider={false} color="#ead7ad" position={[0, 0.5, 0]} size={[0.18, 0.025, 0.7]} />
      <StaticBlock collider={false} color="#ead7ad" position={[0, 0.25, 0.35]} size={[0.18, 0.5, 0.025]} />
      <StaticBlock collider={false} color="#f1eadb" position={[0.2, 0.51, 0.08]} size={[0.26, 0.02, 0.22]} />
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <StaticBlock color="#66503c" position={[0, 1.15, 0]} size={[0.32, 2.3, 0.32]} />
      <mesh castShadow position={[0, 2.75, 0]}>
        <sphereGeometry args={[1.15, 18, 18]} />
        <meshStandardMaterial color="#5e7855" roughness={1} />
      </mesh>
      <mesh castShadow position={[0.7, 2.62, 0.1]}>
        <sphereGeometry args={[0.78, 16, 16]} />
        <meshStandardMaterial color="#708966" roughness={1} />
      </mesh>
    </group>
  );
}

function StreetLight({ x }: { x: number }) {
  return (
    <group position={[x, 0, 2.05]}>
      <StaticBlock color="#3f4b49" position={[0, 1.8, 0]} size={[0.12, 3.6, 0.12]} />
      <StaticBlock collider={false} color="#3f4b49" position={[0.32, 3.55, 0]} size={[0.72, 0.1, 0.1]} />
      <mesh position={[0.68, 3.43, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#f1cd89" emissive="#d59231" emissiveIntensity={0.34} />
      </mesh>
    </group>
  );
}

function ParkedCar() {
  return (
    <group position={[31.5, 0, 9.8]} rotation={[0, -0.08, 0]}>
      <RoundedBox args={[3.7, 0.72, 1.72]} castShadow position={[0, 0.62, 0]} radius={0.22}>
        <meshStandardMaterial color="#735951" metalness={0.1} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[1.9, 0.65, 1.58]} castShadow position={[-0.18, 1.2, 0]} radius={0.18}>
        <meshStandardMaterial color="#344447" metalness={0.15} roughness={0.5} />
      </RoundedBox>
      {[-1.18, 1.18].flatMap((x) => [-0.88, 0.88].map((z) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.42, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.2, 18]} />
          <meshStandardMaterial color="#222625" roughness={0.8} />
        </mesh>
      )))}
    </group>
  );
}

function DriveableCar({ damage, pose }: { damage: number; pose: GameSnapshot["carPose"] }) {
  const bodyColor = damage > 4 ? "#3f302d" : damage > 0 ? "#5a413a" : "#73564c";

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={[pose.x, 0, pose.z]}
      rotation={[0, pose.heading, 0]}
      userData={{ damageId: "player-car" }}
    >
      <RoundedBox args={[1.72, 0.62, 3.55]} castShadow position={[0, 0.62, 0]} radius={0.18} name="player-car-body" userData={{ damageId: "player-car" }}>
        <meshStandardMaterial color={bodyColor} metalness={0.16} roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[1.5, 0.66, 1.55]} castShadow position={[0, 1.2, 0.35]} radius={0.14} name="player-car-glass" userData={{ damageId: "player-car" }}>
        <meshStandardMaterial color="#2d3e40" metalness={0.2} roughness={0.38} />
      </RoundedBox>
      {[-1.12, 1.12].flatMap((z) => [-0.88, 0.88].map((x) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.42, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.18, 18]} />
          <meshStandardMaterial color="#202524" roughness={0.82} />
        </mesh>
      )))}
    </RigidBody>
  );
}

function Garage({ open }: { open: boolean }) {
  return (
    <group>
      <StaticBlock collider={false} color="#9f9482" position={[-13.2, -0.01, -5]} size={[6.1, 0.08, 7.5]} />
      <StaticBlock color="#b6ad9c" damageId="garage-back" position={[-13.2, 1.7, -8.72]} size={[6.3, 3.4, 0.22]} />
      <StaticBlock color="#b6ad9c" damageId="garage-left" position={[-16.28, 1.7, -4.95]} size={[0.22, 3.4, 7.75]} />
      <StaticBlock color="#b6ad9c" damageId="garage-right" position={[-10.12, 1.7, -4.95]} size={[0.22, 3.4, 7.75]} />
      <StaticBlock color="#b6ad9c" position={[-15.9, 1.7, -1.12]} size={[0.78, 3.4, 0.22]} />
      <StaticBlock color="#b6ad9c" position={[-10.5, 1.7, -1.12]} size={[0.78, 3.4, 0.22]} />
      <StaticBlock color="#b6ad9c" position={[-13.2, 3.04, -1.12]} size={[4.65, 0.72, 0.22]} />
      {open ? (
        <StaticBlock collider={false} color="#6d736f" position={[-13.2, 3.15, -2.0]} rotation={[-0.12, 0, 0]} size={[4.85, 0.16, 2.3]} />
      ) : (
        <StaticBlock color="#6d736f" damageId="garage-door" position={[-13.2, 1.42, -1.0]} size={[4.85, 2.75, 0.14]} />
      )}
      <StaticBlock collider={false} color="#53483c" position={[-13.2, 3.55, -4.95]} size={[6.55, 0.14, 7.9]} />
      <pointLight color="#ffdca2" distance={7} intensity={open ? 5 : 2} position={[-13.2, 2.8, -4.8]} />
    </group>
  );
}

function Gardens() {
  return (
    <group>
      <StaticBlock collider={false} color="#738568" position={[-4.35, 0.01, 0.35]} size={[8.0, 0.06, 2.75]} />
      <StaticBlock collider={false} color="#687f60" position={[10.35, 0.01, 0.35]} size={[8.0, 0.06, 2.75]} />
      <StaticBlock collider={false} color="#a89d88" position={[-2.25, 0.055, 0.32]} size={[1.25, 0.08, 2.9]} />
      <StaticBlock collider={false} color="#a89d88" position={[8.25, 0.055, 0.32]} size={[1.25, 0.08, 2.9]} />
      {[-8.25, -6.5, -4.8, -0.45, 6.3, 10.0, 12.0, 14.25].map((x) => (
        <StaticBlock key={x} collider={false} color="#75654d" position={[x, 0.42, 1.72]} size={[0.09, 0.84, 0.09]} />
      ))}
      <StaticBlock collider={false} color="#75654d" position={[-6.35, 0.68, 1.72]} size={[3.8, 0.09, 0.09]} />
      <StaticBlock collider={false} color="#75654d" position={[-0.35, 0.68, 1.72]} size={[3.2, 0.09, 0.09]} />
      <StaticBlock collider={false} color="#75654d" position={[6.4, 0.68, 1.72]} size={[2.1, 0.09, 0.09]} />
      <StaticBlock collider={false} color="#75654d" position={[12.1, 0.68, 1.72]} size={[4.2, 0.09, 0.09]} />
      <mesh castShadow position={[-6.8, 0.45, 0.4]}>
        <sphereGeometry args={[0.72, 16, 14]} />
        <meshStandardMaterial color="#496649" roughness={1} />
      </mesh>
      <mesh castShadow position={[12.4, 0.5, 0.22]}>
        <sphereGeometry args={[0.86, 16, 14]} />
        <meshStandardMaterial color="#506d4c" roughness={1} />
      </mesh>
    </group>
  );
}

function Neighborhood() {
  const buildings: Array<{ color: string; position: Vec3; size: Vec3 }> = [
    { color: "#8d7f70", position: [-31, 3, -5], size: [11, 6, 10] },
    { color: "#9e8a74", position: [-28, 4, 22], size: [14, 8, 10] },
    { color: "#807c75", position: [-8, 3.4, 27], size: [12, 6.8, 9] },
    { color: "#a28f7b", position: [9, 4.5, 27], size: [13, 9, 9] },
    { color: "#7e827c", position: [36, 4, 23], size: [10, 8, 12] },
    { color: "#927f71", position: [37, 3.5, -5], size: [10, 7, 11] },
  ];

  return (
    <group>
      {buildings.map((building, index) => (
        <group key={`${building.position.join("-")}-${index}`}>
          <StaticBlock color={building.color} damageId={`building-${index}`} position={building.position} size={building.size} />
          <StaticBlock collider={false} color="#b5c3bd" position={[building.position[0], 2.6, building.position[2] - building.size[2] / 2 - 0.02]} size={[building.size[0] * 0.64, 1.25, 0.05]} />
        </group>
      ))}
      {[-36, -20, -4, 14, 34].map((x) => <StreetLight key={x} x={x} />)}
    </group>
  );
}

function BulletMark({ impact }: { impact: GameSnapshot["bulletImpacts"][number] }) {
  const quaternion = useMemo(() => {
    const normal = new THREE.Vector3(...impact.normal).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [impact.normal]);
  const offsetPoint: Vec3 = [
    impact.point[0] + impact.normal[0] * 0.012,
    impact.point[1] + impact.normal[1] * 0.012,
    impact.point[2] + impact.normal[2] * 0.012,
  ];

  return (
    <group position={offsetPoint} quaternion={quaternion} userData={{ noBullet: true }}>
      <mesh renderOrder={4}>
        <circleGeometry args={[0.065, 16]} />
        <meshBasicMaterial color="#161817" depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
      </mesh>
      <mesh position={[0, 0, -0.002]} renderOrder={3}>
        <ringGeometry args={[0.07, 0.092, 16]} />
        <meshBasicMaterial color="#5d5144" depthWrite={false} transparent opacity={0.74} />
      </mesh>
    </group>
  );
}

function WorldBounds() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.3, 3, 38]} position={[-44.5, 3, 8]} />
      <CuboidCollider args={[0.3, 3, 38]} position={[44.5, 3, 8]} />
      <CuboidCollider args={[44.5, 3, 0.3]} position={[0, 3, -29.7]} />
      <CuboidCollider args={[44.5, 3, 0.3]} position={[0, 3, 45.7]} />
    </RigidBody>
  );
}

export function WorldGeometry({
  cinematicProgress,
  snapshot,
}: {
  cinematicProgress: number;
  snapshot: GameSnapshot;
}) {
  return (
    <>
      <Sky distance={450000} inclination={0.56} azimuth={0.17} turbidity={7} rayleigh={1.8} />
      <fog attach="fog" args={["#aebdb5", 38, 105]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight color="#fff1d2" groundColor="#3f5048" intensity={1.25} />
      <directionalLight
        castShadow
        color="#ffe9c2"
        intensity={2.8}
        position={[-9, 15, 10]}
        shadow-camera-bottom={-32}
        shadow-camera-far={75}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={32}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <Ground />
      <HouseShell
        centerX={-4.35}
        doorColor="#3f6861"
        doorLocalX={2.1}
        doorOpen
        exterior="#d4cbb8"
        floor="#b9ab91"
        opensLeft
      />
      <HouseShell
        centerX={10.35}
        doorColor="#865748"
        doorLocalX={-2.1}
        doorOpen={snapshot.neighborDoorOpen && snapshot.elderAlive}
        exterior="#c7b39d"
        floor="#aa997f"
        opensLeft={false}
      />
      <OwnStudio
        gunVisible={snapshot.gunState === "table"}
        honeyServings={snapshot.honeyServings}
        jamServings={snapshot.jamServings}
      />
      <NeighborInterior
        cinematicProgress={cinematicProgress}
        elderVisible={snapshot.elderAlive}
        storyStage={snapshot.storyStage}
      />
      {snapshot.packageState === "doorstep" || snapshot.packageState === "left" ? <Package /> : null}
      {snapshot.packageState === "delivered" && snapshot.storyStage === "delivery" ? (
        <Package position={[8.62 + cinematicProgress * 0.32, 0.72, -1.72 - cinematicProgress * 0.44]} />
      ) : null}
      {snapshot.packageState === "delivered" && snapshot.storyStage !== "delivery" ? (
        <Package position={[10.9, 0.68, -4.1]} />
      ) : null}

      <Garage open={snapshot.garageOpen} />
      {!snapshot.inCar ? (
        <DriveableCar damage={snapshot.worldDamage["player-car"] ?? 0} pose={snapshot.carPose} />
      ) : null}
      <Gardens />
      <Neighborhood />

      <Tree position={[-19.7, 0, -2.1]} scale={1.05} />
      <Tree position={[16.8, 0, -1.7]} scale={0.95} />
      <Tree position={[-17.2, 0, 16.4]} scale={0.72} />
      <Tree position={[7.2, 0, 18.4]} scale={0.88} />
      <ParkedCar />

      <StaticBlock color="#746554" position={[-21.4, 0.46, 1.0]} size={[2.2, 0.12, 0.75]} />
      <StaticBlock color="#615344" position={[-22.2, 0.24, 1.0]} size={[0.1, 0.48, 0.1]} />
      <StaticBlock color="#615344" position={[-20.6, 0.24, 1.0]} size={[0.1, 0.48, 0.1]} />

      {snapshot.bulletImpacts.map((impact) => <BulletMark key={impact.id} impact={impact} />)}

      <WorldBounds />
    </>
  );
}
