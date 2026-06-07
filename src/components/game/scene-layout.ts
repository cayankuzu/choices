export type NeighborDoorId =
  | "1B"
  | "1C"
  | "1D"
  | "2A"
  | "2B"
  | "2C"
  | "2D";

const corridorCenterX = 4.05;
const corridorCenterZ = -6.25;
const corridorWidth = 24.6;
const corridorDepth = 4.8;
const corridorHalfDepth = corridorDepth / 2;
const corridorLeftWallX = corridorCenterX - corridorWidth / 2;
const corridorSouthWallZ = corridorCenterZ + corridorHalfDepth;
const corridorNorthWallZ = corridorCenterZ - corridorHalfDepth;
const southDoorStartX = 5.15;
const southDoorSpacing = 3.05;
const northDoorStartX = 4.5;
const northDoorSpacing = 2.9;
const neighborDoorApproachOffset = 0.46;

const southSideResidents = [
  { id: "1B" as NeighborDoorId, residentName: "Beta" },
  { id: "1C" as NeighborDoorId, residentName: "Gama" },
  { id: "1D" as NeighborDoorId, residentName: "Delta" },
];

const northSideResidents = [
  { id: "2A" as NeighborDoorId, residentName: "Epsilon" },
  { id: "2B" as NeighborDoorId, residentName: "Teta" },
  { id: "2C" as NeighborDoorId, residentName: "Eta" },
  { id: "2D" as NeighborDoorId, residentName: "Iota" },
];

export const sceneLayout = {
  playerSpawn: [-0.48, 0.9, 1.42] as const,
  table: {
    position: [1.08, 0, -1.18] as const,
    topY: 0.78,
    jamOffset: [-0.28, 0.02, 0.03] as const,
    chocolateOffset: [0.04, 0.02, -0.04] as const,
    gunOffset: [0.24, 0.046, 0.08] as const,
  },
  bed: {
    position: [-1.92, 0, 1.52] as const,
    size: [2.2, 0.34, 1.14] as const,
    mattressHeight: 0.44,
  },
  intro: {
    startPosition: [-1.94, 0.79, 1.56] as const,
    startPitch: 1.22,
    startYaw: -0.16,
    endPitch: -0.16,
    endYaw: -1.16,
  },
  apartmentDoor: {
    hinge: [0.14, 0, -3.61] as const,
    width: 1.08,
    height: 2.16,
    thickness: 0.08,
    interactionPosition: [0.64, 1.02, -3.26] as const,
    unitId: "1A",
    residentName: "Alfa",
  },
  corridor: {
    center: [corridorCenterX, 0, corridorCenterZ] as const,
    size: [corridorWidth, 0.04, corridorDepth] as const,
  },
  buildingExitDoor: {
    hinge: [corridorLeftWallX, 0, corridorCenterZ - 0.61] as const,
    width: 1.22,
    height: 2.18,
    thickness: 0.08,
    interactionPosition: [corridorLeftWallX + 0.72, 1.04, corridorCenterZ] as const,
  },
  outside: {
    center: [-15.3, 0, -5.92] as const,
    size: [22.8, 0.04, 18.6] as const,
  },
  package: {
    position: [1.42, 0.03, -4.64] as const,
    size: [0.46, 0.26, 0.34] as const,
    recipientName: "Teta",
    recipientDoorId: "2B" as NeighborDoorId,
    labelLine1: "KALP ILACI",
    labelLine2: "Teta / 2B",
  },
  nearSideNeighborDoors: southSideResidents.map((door, index) => ({
    ...door,
    position: [
      southDoorStartX + index * southDoorSpacing,
      0,
      corridorSouthWallZ,
    ] as const,
  })),
  farSideNeighborDoors: northSideResidents.map((door, index) => ({
    ...door,
    position: [
      northDoorStartX + index * northDoorSpacing,
      0,
      corridorNorthWallZ,
    ] as const,
  })),
  interactionRange: 3.15,
  maxJarServings: 6,
} as const;

export function addVec3(
  base: readonly [number, number, number],
  offset: readonly [number, number, number],
) {
  return [
    base[0] + offset[0],
    base[1] + offset[1],
    base[2] + offset[2],
  ] as const;
}

export const worldPositions = {
  jamJar: addVec3(sceneLayout.table.position, [
    sceneLayout.table.jamOffset[0],
    sceneLayout.table.topY + sceneLayout.table.jamOffset[1],
    sceneLayout.table.jamOffset[2],
  ]),
  chocolateJar: addVec3(sceneLayout.table.position, [
    sceneLayout.table.chocolateOffset[0],
    sceneLayout.table.topY + sceneLayout.table.chocolateOffset[1],
    sceneLayout.table.chocolateOffset[2],
  ]),
  pistol: addVec3(sceneLayout.table.position, [
    sceneLayout.table.gunOffset[0],
    sceneLayout.table.topY + sceneLayout.table.gunOffset[1],
    sceneLayout.table.gunOffset[2],
  ]),
  package: sceneLayout.package.position,
  apartmentDoor: sceneLayout.apartmentDoor.interactionPosition,
  buildingExitDoor: sceneLayout.buildingExitDoor.interactionPosition,
  tableCenter: addVec3(sceneLayout.table.position, [0, 0, 0]),
  bedCenter: addVec3(sceneLayout.bed.position, [
    0,
    sceneLayout.bed.mattressHeight,
    0,
  ]),
  neighborDoors: [
    ...sceneLayout.nearSideNeighborDoors.map((door) => ({
      ...door,
      interactionPosition: [
        door.position[0],
        1.04,
        door.position[2] - neighborDoorApproachOffset,
      ] as const,
    })),
    ...sceneLayout.farSideNeighborDoors.map((door) => ({
      ...door,
      interactionPosition: [
        door.position[0],
        1.04,
        door.position[2] + neighborDoorApproachOffset,
      ] as const,
    })),
  ],
} as const;
