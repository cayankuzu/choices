"use client";

import { create } from "zustand";

import {
  defaultGameSettings,
  type GameSettings,
} from "@/components/game/game-settings";
import {
  sceneLayout,
  type NeighborDoorId,
} from "@/components/game/scene-layout";

export type IntroPhase =
  | "menu"
  | "sleeping"
  | "opening"
  | "standing"
  | "playing";

export type InventoryItem = "hands" | "gun" | "package";
export type GunPlacement = "table" | "ground";
export type PackageState = "doorstep" | "carried" | "delivered";
export type PackageDecision = "unseen" | "left" | "deliver";
export type CoffeeDecision = "unseen" | "accept" | "decline";
export type CurrentObjective =
  | "apartment"
  | "free-roam"
  | "deliver-package"
  | "delivery-scene"
  | "neighbor-visit"
  | "collapse";
export type DeliverySequencePhase =
  | "idle"
  | "opening-door"
  | "thanks"
  | "invite"
  | "choice";

export type CollapsePhase =
  | "idle"
  | "priming"
  | "surging"
  | "falling"
  | "closing"
  | "blackout";

export type InteractionTargetId =
  | "jam"
  | "chocolate"
  | "gun"
  | "equipped-gun"
  | "package"
  | "apartment-door"
  | "building-exit"
  | `neighbor-door:${NeighborDoorId}`
  | `note:${string}`;

export type NarrationEntry = {
  id: number;
  text: string;
};

type Vec3 = readonly [number, number, number];

const defaultGroundGunPosition: Vec3 = [
  sceneLayout.table.position[0] + sceneLayout.table.gunOffset[0],
  0.04,
  sceneLayout.table.position[2] + sceneLayout.table.gunOffset[2],
];

export type GameSnapshot = {
  lookEnabled: boolean;
  paused: boolean;
  introPhase: IntroPhase;
  interactionMenuOpen: boolean;
  interactionMenuIndex: number;
  interactionTarget: InteractionTargetId | null;
  openNoteId: string | null;
  textPanelExpanded: boolean;
  collapsePhase: CollapsePhase;
  jamServings: number;
  chocolateServings: number;
  gunHeld: boolean;
  equippedItem: InventoryItem;
  gunPlacement: GunPlacement;
  groundGunPosition: Vec3;
  apartmentDoorOpen: boolean;
  buildingExitDoorOpen: boolean;
  packageState: PackageState;
  packageDecision: PackageDecision;
  coffeeDecision: CoffeeDecision;
  currentObjective: CurrentObjective;
  deliverySequencePhase: DeliverySequencePhase;
  unlockedNeighborDoor: NeighborDoorId | null;
  openNeighborDoorId: NeighborDoorId | null;
  playerPosition: Vec3;
  playerForward: Vec3;
  narrationQueue: NarrationEntry[];
  narrationFeed: NarrationEntry[];
  settings: GameSettings;
};

export function cloneGameSnapshot(snapshot: GameSnapshot) {
  return structuredClone(snapshot) as GameSnapshot;
}

function createDefaultSnapshot(settings = defaultGameSettings): GameSnapshot {
  return {
    lookEnabled: false,
    paused: false,
    introPhase: "menu",
    interactionMenuOpen: false,
    interactionMenuIndex: 0,
    interactionTarget: null,
    openNoteId: null,
    textPanelExpanded: false,
    collapsePhase: "idle",
    jamServings: 0,
    chocolateServings: 0,
    gunHeld: false,
    equippedItem: "hands",
    gunPlacement: "table",
    groundGunPosition: defaultGroundGunPosition,
    apartmentDoorOpen: false,
    buildingExitDoorOpen: false,
    packageState: "doorstep",
    packageDecision: "unseen",
    coffeeDecision: "unseen",
    currentObjective: "apartment",
    deliverySequencePhase: "idle",
    unlockedNeighborDoor: null,
    openNeighborDoorId: null,
    playerPosition: [
      sceneLayout.playerSpawn[0],
      sceneLayout.playerSpawn[1],
      sceneLayout.playerSpawn[2],
    ],
    playerForward: [0, 0, -1],
    narrationQueue: [],
    narrationFeed: [],
    settings,
  };
}

export function createGameSnapshot(state: GameStore) {
  return cloneGameSnapshot({
    lookEnabled: state.lookEnabled,
    paused: state.paused,
    introPhase: state.introPhase,
    interactionMenuOpen: state.interactionMenuOpen,
    interactionMenuIndex: state.interactionMenuIndex,
    interactionTarget: state.interactionTarget,
    openNoteId: state.openNoteId,
    textPanelExpanded: state.textPanelExpanded,
    collapsePhase: state.collapsePhase,
    jamServings: state.jamServings,
    chocolateServings: state.chocolateServings,
    gunHeld: state.gunHeld,
    equippedItem: state.equippedItem,
    gunPlacement: state.gunPlacement,
    groundGunPosition: state.groundGunPosition,
    apartmentDoorOpen: state.apartmentDoorOpen,
    buildingExitDoorOpen: state.buildingExitDoorOpen,
    packageState: state.packageState,
    packageDecision: state.packageDecision,
    coffeeDecision: state.coffeeDecision,
    currentObjective: state.currentObjective,
    deliverySequencePhase: state.deliverySequencePhase,
    unlockedNeighborDoor: state.unlockedNeighborDoor,
    openNeighborDoorId: state.openNeighborDoorId,
    playerPosition: state.playerPosition,
    playerForward: state.playerForward,
    narrationQueue: state.narrationQueue,
    narrationFeed: state.narrationFeed,
    settings: state.settings,
  });
}

type GameStore = GameSnapshot & {
  setLookEnabled: (lookEnabled: boolean) => void;
  setPaused: (paused: boolean) => void;
  setIntroPhase: (introPhase: IntroPhase) => void;
  setInteractionMenuOpen: (open: boolean) => void;
  setInteractionMenuIndex: (index: number) => void;
  cycleInteractionMenuIndex: (count: number, delta: number) => void;
  setInteractionTarget: (target: InteractionTargetId | null) => void;
  setOpenNoteId: (noteId: string | null) => void;
  setTextPanelExpanded: (expanded: boolean) => void;
  beginCollapseSequence: () => void;
  setCollapsePhase: (phase: CollapsePhase) => void;
  consumeJar: (kind: "jam" | "chocolate") => number;
  setGunHeld: (gunHeld: boolean) => void;
  setEquippedItem: (item: InventoryItem) => void;
  setGunPlacement: (placement: GunPlacement) => void;
  setGroundGunPosition: (position: Vec3) => void;
  setApartmentDoorOpen: (open: boolean) => void;
  setBuildingExitDoorOpen: (open: boolean) => void;
  setPackageState: (packageState: PackageState) => void;
  setPackageDecision: (packageDecision: PackageDecision) => void;
  setCoffeeDecision: (coffeeDecision: CoffeeDecision) => void;
  setCurrentObjective: (objective: CurrentObjective) => void;
  setDeliverySequencePhase: (phase: DeliverySequencePhase) => void;
  setUnlockedNeighborDoor: (doorId: NeighborDoorId | null) => void;
  setOpenNeighborDoorId: (doorId: NeighborDoorId | null) => void;
  setPlayerPose: (position: Vec3, forward: Vec3) => void;
  queueNarration: (text: string) => void;
  clearNarrationQueue: () => void;
  removeNarration: (id: number) => void;
  pushNarrationFeed: (entry: NarrationEntry) => void;
  clearNarrationFeed: () => void;
  getSnapshot: () => GameSnapshot;
  loadSnapshot: (snapshot: GameSnapshot) => void;
  resetRun: () => void;
  setSetting: <Key extends keyof GameSettings>(
    key: Key,
    value: GameSettings[Key],
  ) => void;
  resetSettings: () => void;
};

let narrationId = 0;

function wrapIndex(index: number, count: number) {
  if (count <= 0) {
    return 0;
  }

  return ((index % count) + count) % count;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createDefaultSnapshot(),
  setLookEnabled: (lookEnabled) => set({ lookEnabled }),
  setPaused: (paused) => set({ paused }),
  setIntroPhase: (introPhase) => set({ introPhase }),
  setInteractionMenuOpen: (interactionMenuOpen) =>
    set({
      interactionMenuOpen,
      interactionMenuIndex: interactionMenuOpen
        ? get().interactionMenuIndex
        : 0,
    }),
  setInteractionMenuIndex: (interactionMenuIndex) =>
    set({ interactionMenuIndex }),
  cycleInteractionMenuIndex: (count, delta) =>
    set((state) => ({
      interactionMenuIndex: wrapIndex(
        state.interactionMenuIndex + delta,
        count,
      ),
    })),
  setInteractionTarget: (interactionTarget) => set({ interactionTarget }),
  setOpenNoteId: (openNoteId) => set({ openNoteId }),
  setTextPanelExpanded: (textPanelExpanded) => set({ textPanelExpanded }),
  beginCollapseSequence: () =>
    set({
      lookEnabled: false,
      paused: false,
      interactionMenuOpen: false,
      interactionMenuIndex: 0,
      interactionTarget: null,
      openNoteId: null,
      textPanelExpanded: false,
      collapsePhase: "priming",
      currentObjective: "collapse",
      deliverySequencePhase: "idle",
      openNeighborDoorId: null,
    }),
  setCollapsePhase: (collapsePhase) => set({ collapsePhase }),
  consumeJar: (kind) => {
    const key = kind === "jam" ? "jamServings" : "chocolateServings";
    const nextValue = Math.min(get()[key] + 1, sceneLayout.maxJarServings);
    set({ [key]: nextValue } as Pick<GameStore, typeof key>);
    return nextValue;
  },
  setGunHeld: (gunHeld) =>
    set((state) => ({
      gunHeld,
      equippedItem:
        !gunHeld && state.equippedItem === "gun"
          ? "hands"
          : state.equippedItem,
    })),
  setEquippedItem: (equippedItem) => {
    if (equippedItem === "gun" && !get().gunHeld) {
      return;
    }

    if (equippedItem === "package" && get().packageState !== "carried") {
      return;
    }

    set({ equippedItem });
  },
  setGunPlacement: (gunPlacement) => set({ gunPlacement }),
  setGroundGunPosition: (groundGunPosition) => set({ groundGunPosition }),
  setApartmentDoorOpen: (apartmentDoorOpen) => set({ apartmentDoorOpen }),
  setBuildingExitDoorOpen: (buildingExitDoorOpen) =>
    set({ buildingExitDoorOpen }),
  setPackageState: (packageState) => set({ packageState }),
  setPackageDecision: (packageDecision) => set({ packageDecision }),
  setCoffeeDecision: (coffeeDecision) => set({ coffeeDecision }),
  setCurrentObjective: (currentObjective) => set({ currentObjective }),
  setDeliverySequencePhase: (deliverySequencePhase) =>
    set({ deliverySequencePhase }),
  setUnlockedNeighborDoor: (unlockedNeighborDoor) =>
    set({ unlockedNeighborDoor }),
  setOpenNeighborDoorId: (openNeighborDoorId) =>
    set({ openNeighborDoorId }),
  setPlayerPose: (playerPosition, playerForward) =>
    set({
      playerPosition,
      playerForward,
    }),
  queueNarration: (text) =>
    set((state) => ({
      narrationQueue: [
        ...state.narrationQueue,
        {
          id: ++narrationId,
          text,
        },
      ],
    })),
  clearNarrationQueue: () => set({ narrationQueue: [] }),
  removeNarration: (id) =>
    set((state) => ({
      narrationQueue: state.narrationQueue.filter((entry) => entry.id !== id),
    })),
  pushNarrationFeed: (entry) =>
    set((state) => ({
      narrationFeed: [...state.narrationFeed.slice(-59), entry],
    })),
  clearNarrationFeed: () => set({ narrationFeed: [] }),
  getSnapshot: () => createGameSnapshot(get()),
  loadSnapshot: (snapshot) => set(cloneGameSnapshot(snapshot)),
  resetRun: () =>
    set((state) => ({
      ...createDefaultSnapshot(state.settings),
    })),
  setSetting: (key, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: value,
      } as GameSettings,
    })),
  resetSettings: () =>
    set((state) => ({
      settings: defaultGameSettings,
      ...(state.introPhase === "menu"
        ? {
            ...createDefaultSnapshot(defaultGameSettings),
          }
        : {}),
    })),
}));
