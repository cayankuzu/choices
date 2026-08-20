"use client";

import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import type {
  BulletImpact,
  ControlAction,
  GameSnapshot,
  InteractionId,
  PlayerTelemetry,
  WorldArea,
} from "@/components/game/game-types";

function resolveArea(x: number, z: number): WorldArea {
  if (z < -1.15) {
    if (x < -9.3) return "Garaj";
    if (x < 0) return "Bizim ev · Stüdyo daire";
    if (x > 5.2) return "Yan ev · Nihat Bey'in evi";
  }

  if (z > 3.1) return "Mahalle caddesi";
  if (x < 0) return "Bizim bahçe";
  if (x > 4.8) return "Nihat Bey'in bahçesi";
  return "Kapının önü";
}

function resolveInteraction(x: number, z: number, snapshot: GameSnapshot): InteractionId {
  if (snapshot.inCar) return "car-exit";

  if (snapshot.gunState === "table" && Math.hypot(x + 3.65, z + 4.05) < 1.45) {
    return "gun";
  }

  const honeyDistance = Math.hypot(x + 2.55, z + 7.78);
  const jamDistance = Math.hypot(x + 2.05, z + 7.78);
  if (Math.min(honeyDistance, jamDistance) < 1.42) {
    if (honeyDistance <= jamDistance && snapshot.honeyServings > 0) return "honey";
    if (snapshot.jamServings > 0) return "jam";
    if (snapshot.honeyServings > 0) return "honey";
  }

  if (
    (snapshot.packageState === "doorstep" || snapshot.packageState === "left") &&
    Math.hypot(x + 2.25, z - 0.25) < 1.8
  ) {
    return "package";
  }

  if (Math.hypot(x - 8.25, z + 1.13) < 1.85) return "neighbor-door";
  if (!snapshot.garageOpen && Math.hypot(x + 13.2, z + 1.15) < 2.1) return "garage-door";
  if (
    snapshot.garageOpen &&
    Math.hypot(x - snapshot.carPose.x, z - snapshot.carPose.z) < 2.1
  ) {
    return "car";
  }

  if (Math.hypot(x + 6.55, z + 6.55) < 1.7) return "bed";
  return null;
}

function hasNoBulletAncestor(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.userData.noBullet) return true;
    current = current.parent;
  }
  return false;
}

function findTargetId(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (typeof current.userData.damageId === "string") return current.userData.damageId;
    if (current.name) return current.name;
    current = current.parent;
  }
  return null;
}

function VehicleBody() {
  return (
    <group position={[0, -0.62, 0]} userData={{ noBullet: true }}>
      <mesh castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[1.72, 0.58, 3.5]} />
        <meshStandardMaterial color="#635047" metalness={0.16} roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0.35]}>
        <boxGeometry args={[1.55, 0.64, 1.55]} />
        <meshStandardMaterial color="#2e3d3e" metalness={0.2} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.4, -1.55]}>
        <boxGeometry args={[1.58, 0.12, 0.42]} />
        <meshStandardMaterial color="#6f574c" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ViewModel({
  cinematicProgress,
  holdingCoffee,
  holdingPackage,
  inCar,
  selectedGun,
  shotTick,
}: {
  cinematicProgress: number;
  holdingCoffee: boolean;
  holdingPackage: boolean;
  inCar: boolean;
  selectedGun: boolean;
  shotTick: number;
}) {
  const flashRef = useRef<THREE.Mesh>(null);
  const gunGroupRef = useRef<THREE.Group>(null);
  const flashTimeRef = useRef(0);
  const lastShotRef = useRef(shotTick);
  const recoilRef = useRef(0);

  useFrame((_, delta) => {
    if (shotTick !== lastShotRef.current) {
      lastShotRef.current = shotTick;
      flashTimeRef.current = 0.055;
      recoilRef.current = 0.075;
    }
    flashTimeRef.current = Math.max(0, flashTimeRef.current - delta);
    recoilRef.current = THREE.MathUtils.lerp(recoilRef.current, 0, Math.min(1, delta * 18));
    if (flashRef.current) flashRef.current.visible = flashTimeRef.current > 0;
    if (gunGroupRef.current) gunGroupRef.current.position.z = recoilRef.current;
  });

  if (inCar) {
    return (
      <group userData={{ noBullet: true }}>
        <mesh position={[0, -0.18, -1.06]} renderOrder={100}>
          <boxGeometry args={[1.34, 0.08, 0.72]} />
          <meshStandardMaterial color="#6b5449" depthTest={false} metalness={0.18} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.11, -0.52]} rotation={[Math.PI / 2, 0, 0]} renderOrder={101}>
          <torusGeometry args={[0.23, 0.028, 10, 24]} />
          <meshStandardMaterial color="#202624" depthTest={false} roughness={0.72} />
        </mesh>
      </group>
    );
  }

  if (holdingCoffee) {
    return (
      <group position={[0.22, 0.02 + Math.sin(cinematicProgress * Math.PI * 4) * 0.015, -0.1]} userData={{ noBullet: true }}>
        <mesh renderOrder={101}>
          <cylinderGeometry args={[0.11, 0.09, 0.22, 18]} />
          <meshStandardMaterial color="#e7e0d2" depthTest={false} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.1, 0]} renderOrder={102}>
          <cylinderGeometry args={[0.085, 0.085, 0.01, 18]} />
          <meshStandardMaterial color="#5b3624" depthTest={false} roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (holdingPackage) {
    return (
      <group position={[0, -0.03, -0.12]} userData={{ noBullet: true }}>
        <mesh renderOrder={100}>
          <boxGeometry args={[0.58, 0.34, 0.46]} />
          <meshStandardMaterial color="#aa6d41" depthTest={false} roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.18, 0]} renderOrder={101}>
          <boxGeometry args={[0.12, 0.012, 0.47]} />
          <meshStandardMaterial color="#e5d2ab" depthTest={false} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (!selectedGun) {
    return (
      <group userData={{ noBullet: true }}>
        <mesh position={[-0.18, -0.05, 0]} rotation={[0.36, -0.08, 0.06]} renderOrder={100}>
          <capsuleGeometry args={[0.05, 0.25, 8, 12]} />
          <meshStandardMaterial color="#c58d70" depthTest={false} roughness={0.88} />
        </mesh>
        <mesh position={[0.18, -0.05, 0]} rotation={[0.36, 0.08, -0.06]} renderOrder={100}>
          <capsuleGeometry args={[0.05, 0.25, 8, 12]} />
          <meshStandardMaterial color="#c58d70" depthTest={false} roughness={0.88} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={gunGroupRef} userData={{ noBullet: true }}>
      <mesh position={[0.02, -0.02, 0.16]} rotation={[0.15, 0, 0]} renderOrder={100}>
        <capsuleGeometry args={[0.075, 0.4, 8, 12]} />
        <meshStandardMaterial color="#c58d70" depthTest={false} roughness={0.88} />
      </mesh>
      <mesh position={[0.02, 0.035, -0.06]} rotation={[-0.12, 0, 0]} renderOrder={101}>
        <boxGeometry args={[0.13, 0.32, 0.16]} />
        <meshStandardMaterial color="#252a29" depthTest={false} metalness={0.35} roughness={0.42} />
      </mesh>
      <mesh position={[0.02, 0.22, -0.24]} renderOrder={101}>
        <boxGeometry args={[0.18, 0.16, 0.52]} />
        <meshStandardMaterial color="#343a39" depthTest={false} metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh position={[0.02, 0.225, -0.56]} renderOrder={101}>
        <cylinderGeometry args={[0.035, 0.035, 0.24, 12]} />
        <meshStandardMaterial color="#1e2322" depthTest={false} metalness={0.62} roughness={0.28} />
      </mesh>
      <mesh ref={flashRef} position={[0.02, 0.225, -0.71]} rotation={[Math.PI / 2, 0, 0]} renderOrder={102} visible={false}>
        <coneGeometry args={[0.11, 0.3, 8]} />
        <meshBasicMaterial color="#ffd37c" depthTest={false} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

type PlayerControllerProps = {
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

export function PlayerController({
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
}: PlayerControllerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const vehicleRef = useRef<THREE.Group>(null);
  const viewModelRef = useRef<THREE.Group>(null);
  const yawRef = useRef(snapshot.player.heading);
  const pitchRef = useRef(snapshot.player.pitch);
  const jumpPressedRef = useRef(false);
  const interactionRef = useRef<InteractionId>(null);
  const lastTelemetryTimeRef = useRef(0);
  const walkTimeRef = useRef(0);
  const moveDirectionRef = useRef(new THREE.Vector3());
  const forwardDirectionRef = useRef(new THREE.Vector3());
  const rightDirectionRef = useRef(new THREE.Vector3());
  const lookEulerRef = useRef(new THREE.Euler(snapshot.player.pitch, snapshot.player.heading, 0, "YXZ"));
  const wakeQuaternionRef = useRef(new THREE.Quaternion());
  const targetQuaternionRef = useRef(new THREE.Quaternion());
  const raycasterRef = useRef(new THREE.Raycaster());
  const normalMatrixRef = useRef(new THREE.Matrix3());
  const standingEyeRef = useRef(new THREE.Vector3());
  const wakeEyeRef = useRef(new THREE.Vector3(-6.55, 1.16, -6.5));
  const wakeEulerRef = useRef(new THREE.Euler(1.36, -0.35, 1.1, "YXZ"));
  const previousInCarRef = useRef(snapshot.inCar);
  const { camera, gl, scene } = useThree();
  const [, getKeys] = useKeyboardControls<ControlAction>();
  const selectedGun = snapshot.gunState === "carried" && snapshot.selectedSlot === 2 && !snapshot.inCar;
  const holdingPackage = snapshot.packageState === "carried" || (snapshot.storyStage === "delivery" && cinematicProgress < 0.32);
  const holdingCoffee = snapshot.storyStage === "coffee-drink";

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || previousInCarRef.current === snapshot.inCar) return;

    if (snapshot.inCar) {
      yawRef.current = snapshot.carPose.heading;
      body.setTranslation(
        { x: snapshot.carPose.x, y: snapshot.carPose.y, z: snapshot.carPose.z },
        true,
      );
    } else {
      const car = snapshot.carPose;
      body.setTranslation(
        {
          x: car.x + Math.cos(car.heading) * 1.65,
          y: Math.max(1.05, car.y),
          z: car.z - Math.sin(car.heading) * 1.65,
        },
        true,
      );
    }
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    previousInCarRef.current = snapshot.inCar;
  }, [snapshot.carPose, snapshot.inCar]);

  useEffect(() => {
    const canvas = gl.domElement;

    const requestLock = () => {
      if (active && document.pointerLockElement !== canvas) canvas.requestPointerLock();
    };

    const updateLook = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas || !active || snapshot.inCar) return;
      yawRef.current -= event.movementX * 0.0022 * lookSensitivity;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - event.movementY * 0.0018 * lookSensitivity,
        -1.22,
        1.22,
      );
    };

    const fire = (event: MouseEvent) => {
      if (event.button !== 0 || !active || !selectedGun) return;

      raycasterRef.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      raycasterRef.current.far = 65;
      const hit = raycasterRef.current
        .intersectObjects(scene.children, true)
        .find((entry) => entry.distance > 0.9 && !hasNoBulletAncestor(entry.object));

      if (!hit) {
        onFire(null);
        return;
      }

      const faceNormal = hit.face?.normal.clone() ?? new THREE.Vector3(0, 0, 1);
      normalMatrixRef.current.getNormalMatrix(hit.object.matrixWorld);
      faceNormal.applyMatrix3(normalMatrixRef.current).normalize();
      onFire({
        normal: [faceNormal.x, faceNormal.y, faceNormal.z],
        point: [hit.point.x, hit.point.y, hit.point.z],
        targetId: findTargetId(hit.object),
      });
    };

    const updateLockState = () => onLockChange(document.pointerLockElement === canvas);
    canvas.addEventListener("click", requestLock);
    canvas.addEventListener("mousedown", fire);
    document.addEventListener("mousemove", updateLook);
    document.addEventListener("pointerlockchange", updateLockState);

    return () => {
      canvas.removeEventListener("click", requestLock);
      canvas.removeEventListener("mousedown", fire);
      document.removeEventListener("mousemove", updateLook);
      document.removeEventListener("pointerlockchange", updateLockState);
    };
  }, [active, camera, gl, lookSensitivity, onFire, onLockChange, scene, selectedGun, snapshot.inCar]);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const position = body.translation();
    const velocity = body.linvel();
    const keys = getKeys();
    const forwardInput = Number(keys.forward) - Number(keys.backward);
    const sideInput = Number(keys.right) - Number(keys.left);
    const moving = active && (forwardInput !== 0 || sideInput !== 0);

    forwardDirectionRef.current.set(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current));
    rightDirectionRef.current.set(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current));

    if (snapshot.inCar) {
      if (active && sideInput !== 0) {
        const steeringDirection = forwardInput < 0 ? -1 : 1;
        yawRef.current -= sideInput * delta * 1.35 * steeringDirection;
      }
      const driveSpeed = forwardInput >= 0 ? 12.5 : 5.2;
      moveDirectionRef.current.copy(forwardDirectionRef.current).multiplyScalar(forwardInput * driveSpeed);
      body.setLinvel(
        { x: active ? moveDirectionRef.current.x : 0, y: velocity.y, z: active ? moveDirectionRef.current.z : 0 },
        true,
      );
      if (vehicleRef.current) vehicleRef.current.rotation.y = yawRef.current;
    } else {
      const speed = keys.run ? 6 : 3.5;
      moveDirectionRef.current
        .copy(forwardDirectionRef.current)
        .multiplyScalar(forwardInput)
        .addScaledVector(rightDirectionRef.current, sideInput);

      if (moving) {
        moveDirectionRef.current.normalize().multiplyScalar(speed);
        body.setLinvel(
          { x: moveDirectionRef.current.x, y: velocity.y, z: moveDirectionRef.current.z },
          true,
        );
        walkTimeRef.current += delta * (keys.run ? 12 : 8.5);
      } else {
        body.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
      }

      if (active && keys.jump && !jumpPressedRef.current && position.y < 0.88) {
        body.setLinvel({ x: velocity.x, y: 6.2, z: velocity.z }, true);
      }
      jumpPressedRef.current = keys.jump;
    }

    const interaction = resolveInteraction(position.x, position.z, snapshot);
    if (interaction !== interactionRef.current) {
      interactionRef.current = interaction;
      onInteractionChange(interaction);
    }

    if (state.clock.elapsedTime - lastTelemetryTimeRef.current > 0.1) {
      lastTelemetryTimeRef.current = state.clock.elapsedTime;
      onPlayerUpdate({
        area: resolveArea(position.x, position.z),
        heading: yawRef.current,
        pitch: pitchRef.current,
        x: position.x,
        y: position.y,
        z: position.z,
      });
    }

    if (position.y < -4) {
      body.setTranslation(snapshot.player, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    const bob = moving && !snapshot.inCar ? Math.sin(walkTimeRef.current) * 0.025 : 0;
    const standingEye = standingEyeRef.current.set(
      position.x,
      position.y + (snapshot.inCar ? 0.52 : 0.72) + bob,
      position.z,
    );
    lookEulerRef.current.set(pitchRef.current, yawRef.current, 0, "YXZ");
    targetQuaternionRef.current.setFromEuler(lookEulerRef.current);

    if (wakeStartedAt !== null) {
      const rawProgress = THREE.MathUtils.clamp((Date.now() - wakeStartedAt) / 3_500, 0, 1);
      const riseProgress = THREE.MathUtils.smoothstep(rawProgress, 0.22, 0.92);
      camera.position.lerpVectors(wakeEyeRef.current, standingEye, riseProgress);
      wakeQuaternionRef.current.setFromEuler(wakeEulerRef.current);
      camera.quaternion.slerpQuaternions(wakeQuaternionRef.current, targetQuaternionRef.current, riseProgress);
    } else {
      camera.position.copy(standingEye);
      camera.quaternion.copy(targetQuaternionRef.current);
    }

    const viewModel = viewModelRef.current;
    if (viewModel) {
      viewModel.visible = wakeStartedAt === null;
      viewModel.position.copy(camera.position);
      viewModel.quaternion.copy(camera.quaternion);
      viewModel.translateX(selectedGun ? 0.3 : 0);
      viewModel.translateY(snapshot.inCar ? -0.25 : -0.42);
      viewModel.translateZ(snapshot.inCar ? -0.25 : -0.82);
    }
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        canSleep={false}
        ccd
        colliders={false}
        enabledRotations={[false, false, false]}
        linearDamping={0.4}
        position={[snapshot.player.x, snapshot.player.y, snapshot.player.z]}
      >
        <CapsuleCollider args={[0.42, 0.33]} friction={0} />
        {snapshot.inCar ? <group ref={vehicleRef}><VehicleBody /></group> : null}
      </RigidBody>
      <group ref={viewModelRef}>
        <ViewModel
          cinematicProgress={cinematicProgress}
          holdingCoffee={holdingCoffee}
          holdingPackage={holdingPackage}
          inCar={snapshot.inCar}
          selectedGun={selectedGun}
          shotTick={shotTick}
        />
      </group>
    </>
  );
}
