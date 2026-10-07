export type ControlAction =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "run"
  | "jump";

export type InteractionId =
  | "bed"
  | "car"
  | "car-exit"
  | "garage-door"
  | "gun"
  | "honey"
  | "jam"
  | "neighbor-door"
  | "package"
  | null;

export type WorldArea =
  | "Bizim ev · Stüdyo daire"
  | "Bizim bahçe"
  | "Garaj"
  | "Kapının önü"
  | "Mahalle caddesi"
  | "Nihat Bey'in bahçesi"
  | "Yan ev · Nihat Bey'in evi";

export type PlayerPose = {
  heading: number;
  pitch: number;
  x: number;
  y: number;
  z: number;
};

export type PlayerTelemetry = PlayerPose & {
  area: WorldArea;
};

export type BulletImpact = {
  id: string;
  normal: [number, number, number];
  point: [number, number, number];
  targetId: string | null;
};

export type GunState = "table" | "carried" | "used";
export type PackageState = "doorstep" | "carried" | "left" | "delivered";
export type StoryStage = "free" | "delivery" | "coffee-offer" | "coffee-drink" | "coffee-reject" | "complete";
export type WeaponSlot = 1 | 2;

export type GameSnapshot = {
  bulletImpacts: BulletImpact[];
  bullets: number;
  carPose: PlayerPose;
  coffeeAccepted: boolean | null;
  elderAlive: boolean;
  garageOpen: boolean;
  gunState: GunState;
  honeyServings: number;
  inCar: boolean;
  jamServings: number;
  magazines: number;
  neighborDoorOpen: boolean;
  packageDeadlineAt: number | null;
  packageState: PackageState;
  player: PlayerPose;
  playerDead: boolean;
  selectedSlot: WeaponSlot;
  storyStage: StoryStage;
  worldDamage: Record<string, number>;
};

export type MajorChoice = "coffee" | "door" | "gun" | "package" | null;

export const initialPlayerPose: PlayerPose = {
  heading: -0.98,
  pitch: 0,
  x: -5,
  y: 1.05,
  z: -4.45,
};

export const initialSnapshot: GameSnapshot = {
  bulletImpacts: [],
  bullets: 6,
  carPose: {
    heading: Math.PI,
    pitch: 0,
    x: -13.2,
    y: 1.05,
    z: -5.15,
  },
  coffeeAccepted: null,
  elderAlive: true,
  garageOpen: false,
  gunState: "table",
  honeyServings: 7,
  inCar: false,
  jamServings: 6,
  magazines: 6,
  neighborDoorOpen: false,
  packageDeadlineAt: null,
  packageState: "doorstep",
  player: initialPlayerPose,
  playerDead: false,
  selectedSlot: 1,
  storyStage: "free",
  worldDamage: {},
};

export function normalizeSnapshot(value: Partial<GameSnapshot> | null): GameSnapshot {
  return {
    ...initialSnapshot,
    ...value,
    bulletImpacts: Array.isArray(value?.bulletImpacts) ? value.bulletImpacts.slice(-40) : [],
    carPose: { ...initialSnapshot.carPose, ...value?.carPose },
    player: { ...initialSnapshot.player, ...value?.player },
    worldDamage: value?.worldDamage ?? {},
  };
}
