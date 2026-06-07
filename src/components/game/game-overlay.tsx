"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  collapseSequenceDurations,
  roomConfig,
} from "@/components/game/game-config";
import { type ParallelBranchRequest } from "@/components/game/parallel-branching";
import { sceneLayout } from "@/components/game/scene-layout";
import {
  type CollapsePhase,
  type IntroPhase,
  type InventoryItem,
  type NarrationEntry,
  useGameStore,
} from "@/components/game/game-store";
import {
  interactionLabels,
  jarEmptyNarration,
  jarNarration,
  openingMonologue,
  standingMonologue,
} from "@/components/game/story-script";
import { wallNotes } from "@/components/game/wall-notes";

type OverlayTab = "home" | "controls";

type MenuOption = {
  id: string;
  label: string;
  onSelect: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const narrationTiming = {
  firstWordDelayMs: 260,
  nextWordDelayMs: 92,
  completionHoldMs: 520,
} as const;

const hudPrimaryButtonClass =
  "font-hud-sans rounded-[1.55rem] border border-white/54 bg-[linear-gradient(135deg,rgba(255,245,226,0.94)_0%,rgba(255,181,212,0.92)_34%,rgba(255,214,134,0.94)_66%,rgba(126,226,255,0.9)_100%)] px-5 py-4 text-left text-slate-950 shadow-[0_24px_64px_rgba(244,114,182,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_78px_rgba(56,189,248,0.22)]";

const hudSecondaryButtonClass =
  "font-hud-sans rounded-[1.55rem] border border-white/46 bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(229,249,255,0.84)_44%,rgba(233,255,236,0.8)_100%)] px-5 py-4 text-left text-slate-950 shadow-[0_20px_54px_rgba(14,165,233,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(218,245,255,0.88)_42%,rgba(242,255,228,0.84)_100%)]";

const hudRoundButtonClass =
  "font-hud-sans rounded-full border border-white/44 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(225,245,255,0.8)_56%,rgba(255,239,214,0.84)_100%)] px-4 py-2 text-sm text-slate-950 shadow-[0_16px_40px_rgba(14,165,233,0.14)] transition duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(214,240,255,0.9)_50%,rgba(255,233,198,0.9)_100%)]";

function getCollapsePhaseDurationMs(phase: CollapsePhase) {
  if (phase === "idle" || phase === "blackout") {
    return 0;
  }

  return (
    (phase === "priming"
      ? collapseSequenceDurations.priming
      : phase === "surging"
        ? collapseSequenceDurations.surging
        : phase === "falling"
          ? collapseSequenceDurations.falling
          : collapseSequenceDurations.closing) * 1000
  );
}

function getGroundDropPosition(
  playerPosition: readonly [number, number, number],
  playerForward: readonly [number, number, number],
) {
  let forwardX = playerForward[0];
  let forwardZ = playerForward[2];
  const forwardLength = Math.hypot(forwardX, forwardZ);

  if (forwardLength < 0.001) {
    forwardX = 0;
    forwardZ = -1;
  } else {
    forwardX /= forwardLength;
    forwardZ /= forwardLength;
  }

  const limitX = roomConfig.width / 2 - 0.42;
  const limitZ = roomConfig.depth / 2 - 0.42;
  const dropDistance = 0.92;

  return [
    clamp(playerPosition[0] + forwardX * dropDistance, -limitX, limitX),
    0.032,
    clamp(playerPosition[2] + forwardZ * dropDistance, -limitZ, limitZ),
  ] as const;
}

function isNearTable(playerPosition: readonly [number, number, number]) {
  const dx = playerPosition[0] - sceneLayout.table.position[0];
  const dz = playerPosition[2] - sceneLayout.table.position[2];
  return Math.hypot(dx, dz) <= 1.8;
}

function EyeOpeningOverlay({ phase }: { phase: string }) {
  const opening = phase === "opening";
  const hidden = phase === "standing" || phase === "playing";

  return (
    <div
      className={[
        "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-500",
        hidden ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-x-0 top-0 h-1/2 bg-[#030406] transition-transform duration-[1200ms] ease-out",
          opening ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      />
      <div
        className={[
          "absolute inset-x-0 bottom-0 h-1/2 bg-[#030406] transition-transform duration-[1200ms] ease-out",
          opening ? "translate-y-full" : "translate-y-0",
        ].join(" ")}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_38%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}

function NeuralBlackoutOverlay({ phase }: { phase: CollapsePhase }) {
  const [phaseTimer, setPhaseTimer] = useState<{
    phase: CollapsePhase;
    elapsed: number;
  }>({
    phase: "idle",
    elapsed: 0,
  });

  useEffect(() => {
    if (phase === "idle") {
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();

    const updateElapsed = (now: number) => {
      setPhaseTimer({
        phase,
        elapsed: (now - startedAt) / 1000,
      });
      frameId = window.requestAnimationFrame(updateElapsed);
    };

    frameId = window.requestAnimationFrame(updateElapsed);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [phase]);

  const phaseElapsed =
    phaseTimer.phase === phase ? Math.max(0, phaseTimer.elapsed) : 0;

  const bandRatio =
    phase === "priming"
      ? 0.04 + Math.sin(phaseElapsed * 2.8) * 0.006
      : phase === "surging"
        ? 0.14 +
          clamp(phaseElapsed / collapseSequenceDurations.surging, 0, 1) * 0.08
        : phase === "falling"
          ? 0.3 + clamp(phaseElapsed / 0.22, 0, 1) * 0.18
          : phase === "closing"
            ? 0.5
            : 0.5;
  const darkness =
    phase === "priming"
      ? 0.34
      : phase === "surging"
        ? 0.58
        : phase === "falling"
          ? 0.82
          : phase === "closing"
            ? 0.94
            : 1;
  const ghostOpacity =
    phase === "priming"
      ? 0.08
      : phase === "surging"
        ? 0.16
        : phase === "falling"
          ? 0.22
          : 0.08;
  const stutterShift =
    phase === "priming"
      ? Math.sin(phaseElapsed * 6.5) * 2
      : phase === "surging"
      ? Math.sin(phaseElapsed * 18) * 8
      : phase === "falling"
        ? Math.sin(phaseElapsed * 20) * 14
        : phase === "closing"
          ? Math.sin(phaseElapsed * 9) * 4
          : 0;
  const flareOpacity =
    phase === "priming"
      ? 0.08
      : phase === "surging"
        ? 0.18
        : phase === "falling"
          ? 0.28
          : phase === "closing"
            ? 0.08
            : 0;
  const blackoutFlashOpacity =
    phase === "blackout"
      ? phaseElapsed < 0.07
        ? 1
        : phaseElapsed < 0.14
          ? 0.08
          : phaseElapsed < 0.2
            ? 0.76
            : phaseElapsed < 0.28
              ? 0.12
              : phaseElapsed < 0.36
                ? 0.42
                : phaseElapsed < 0.54
                  ? 0.42 * (1 - (phaseElapsed - 0.36) / 0.18)
                  : 0
      : 0;
  const lightningOpacity =
    phase === "falling"
      ? Math.max(0, 0.72 * (1 - phaseElapsed / 0.18))
      : phase === "blackout"
        ? blackoutFlashOpacity * 0.92
        : phase === "closing"
          ? 0.08
          : 0;
  const blackoutNoiseOpacity =
    phase === "blackout"
      ? Math.max(0.06, 0.14 * Math.exp(-phaseElapsed * 2.8))
      : phase === "closing"
        ? 0.12
        : 0.08;
  const phospheneOpacity =
    phase === "falling"
      ? 0.16
      : phase === "closing"
        ? 0.1
        : phase === "blackout"
          ? 0.04
          : 0.06;

  if (phase === "idle") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          opacity: phase === "blackout" ? 1 : 0.28 + darkness * 0.44,
          background:
            phase === "blackout"
              ? "#000000"
              : "radial-gradient(circle, transparent 14%, rgba(1,2,4,0.88) 76%, rgba(0,0,0,0.98) 100%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-screen transition-opacity duration-300"
        style={{
          opacity: phase === "blackout" ? blackoutFlashOpacity : flareOpacity,
          background:
            "radial-gradient(circle at 50% 48%, rgba(255,255,255,0.98) 0%, rgba(174,223,255,0.82) 14%, rgba(94,146,255,0.18) 26%, transparent 48%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-screen blur-[2px]"
        style={{
          opacity: lightningOpacity,
          background:
            "linear-gradient(118deg, transparent 0%, transparent 44%, rgba(255,255,255,0.96) 45%, rgba(188,223,255,0.95) 46%, transparent 47%, transparent 100%), linear-gradient(74deg, transparent 0%, transparent 59%, rgba(255,255,255,0.88) 60%, transparent 61%), radial-gradient(circle at 54% 46%, rgba(255,255,255,0.96) 0%, rgba(188,223,255,0.54) 11%, transparent 24%)",
        }}
      />
      <div
        className="absolute inset-0 blur-2xl"
        style={{
          opacity: ghostOpacity,
          transform: `translateX(${stutterShift}px) scale(1.04)`,
          background:
            "radial-gradient(circle at 52% 50%, rgba(183,226,255,0.34) 0%, rgba(17,27,39,0.1) 34%, transparent 58%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: blackoutNoiseOpacity,
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 5px)",
        }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 blur-2xl"
        style={{
          opacity: phase === "blackout" ? blackoutFlashOpacity * 0.75 : flareOpacity,
          transform: `translateY(-50%) scaleY(${
            phase === "falling" ? 1.6 : phase === "closing" ? 2.2 : 1.2
          })`,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(184,227,255,0.22) 30%, rgba(255,255,255,0.38) 50%, rgba(184,227,255,0.22) 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 bg-[#020304] transition-[height] duration-[1100ms] ease-out"
        style={{ height: `${bandRatio * 100}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-[#020304] transition-[height] duration-[1100ms] ease-out"
        style={{ height: `${bandRatio * 100}%` }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: phospheneOpacity,
          background:
            "radial-gradient(circle at 24% 34%, rgba(255,255,255,0.32) 0%, transparent 10%), radial-gradient(circle at 68% 28%, rgba(255,255,255,0.28) 0%, transparent 8%), radial-gradient(circle at 58% 62%, rgba(255,255,255,0.18) 0%, transparent 6%)",
        }}
      />
    </div>
  );
}

function ShortcutRow({
  keys,
  description,
}: {
  keys: string;
  description: string;
}) {
  return (
    <div className="hud-panel flex items-center justify-between gap-4 rounded-[1.45rem] border border-white/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(238,246,255,0.78)_54%,rgba(255,241,216,0.76)_100%)] px-4 py-3 shadow-[0_18px_50px_rgba(7,18,29,0.18)]">
      <span className="font-hud-sans text-xs uppercase tracking-[0.28em] text-sky-950/68">
        {keys}
      </span>
      <span className="font-hud-sans text-sm text-slate-900/86">
        {description}
      </span>
    </div>
  );
}

function HudFlower({
  className,
  petalColor,
  centerColor,
}: {
  className: string;
  petalColor: string;
  centerColor: string;
}) {
  return (
    <div className={className}>
      <div className="relative h-14 w-14 animate-[hud-float_8s_ease-in-out_infinite]">
        {[0, 90, 180, 270].map((rotation) => (
          <span
            key={rotation}
            className="absolute left-1/2 top-1/2 h-6 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
            style={{
              background: petalColor,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-11px)`,
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.32)]"
          style={{ background: centerColor }}
        />
      </div>
    </div>
  );
}

function HudLadybug({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="relative h-8 w-10 animate-[hud-bob_5s_ease-in-out_infinite]">
        <span className="absolute left-1/2 top-1/2 h-6 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6f7c] shadow-[0_0_18px_rgba(255,111,124,0.35)]" />
        <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-slate-950/50" />
        <span className="absolute left-[38%] top-[38%] h-1.5 w-1.5 rounded-full bg-slate-950/72" />
        <span className="absolute left-[58%] top-[52%] h-1.5 w-1.5 rounded-full bg-slate-950/72" />
        <span className="absolute left-[28%] top-[58%] h-1.5 w-1.5 rounded-full bg-slate-950/72" />
        <span className="absolute left-[55%] top-[24%] h-2.5 w-2.5 rounded-full bg-slate-950/86" />
      </div>
    </div>
  );
}

function HudButterfly({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="relative h-10 w-12 animate-[hud-drift_10s_ease-in-out_infinite]">
        <span className="absolute left-[14%] top-[22%] h-6 w-4 rounded-[80%_20%_70%_30%/60%_30%_70%_40%] bg-[linear-gradient(180deg,#8ce7ff,#7bc4ff)] opacity-90 shadow-[0_0_18px_rgba(123,196,255,0.32)]" />
        <span className="absolute right-[14%] top-[22%] h-6 w-4 rounded-[20%_80%_30%_70%/30%_60%_40%_70%] bg-[linear-gradient(180deg,#ffd4a8,#ff9dd0)] opacity-92 shadow-[0_0_18px_rgba(255,157,208,0.28)]" />
        <span className="absolute left-[22%] top-[48%] h-5 w-3 rounded-[70%_30%_80%_20%/70%_30%_80%_20%] bg-[linear-gradient(180deg,#b7ffba,#8ce7ff)] opacity-88" />
        <span className="absolute right-[22%] top-[48%] h-5 w-3 rounded-[30%_70%_20%_80%/30%_70%_20%_80%] bg-[linear-gradient(180deg,#ffd783,#ffb2cb)] opacity-88" />
        <span className="absolute left-1/2 top-[30%] h-6 w-[3px] -translate-x-1/2 rounded-full bg-slate-900/70" />
      </div>
    </div>
  );
}

function GardenHudLayer({ subdued = false }: { subdued?: boolean }) {
  return (
    <div
      className={[
        "pointer-events-none absolute inset-0 z-[15] overflow-hidden transition-opacity duration-500",
        subdued ? "opacity-50" : "opacity-100",
      ].join(" ")}
    >
      <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,168,206,0.24)_0%,rgba(255,168,206,0.08)_42%,transparent_72%)] blur-3xl" />
      <div className="absolute right-[-4rem] top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(126,226,255,0.22)_0%,rgba(126,226,255,0.08)_44%,transparent_72%)] blur-3xl" />
      <div className="absolute bottom-[-5rem] left-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(199,255,152,0.18)_0%,rgba(199,255,152,0.06)_44%,transparent_72%)] blur-3xl" />
      <HudFlower
        className="absolute left-8 top-10 opacity-90"
        petalColor="linear-gradient(135deg,#ff9fc7,#ffd78a)"
        centerColor="#fff4b3"
      />
      <HudFlower
        className="absolute right-10 top-28 scale-[0.88] opacity-85"
        petalColor="linear-gradient(135deg,#8ce7ff,#9effbc)"
        centerColor="#fff2ba"
      />
      <HudFlower
        className="absolute bottom-24 left-[14%] scale-[0.78] opacity-80"
        petalColor="linear-gradient(135deg,#ffd6a0,#ff9ec7)"
        centerColor="#fff3c6"
      />
      <HudLadybug className="absolute bottom-28 right-[16%] opacity-70" />
      <HudButterfly className="absolute right-[22%] top-14 opacity-80" />
      <HudButterfly className="absolute left-[24%] bottom-20 scale-[0.82] opacity-65" />
    </div>
  );
}

function OverlayCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hud-panel hud-grid font-hud-sans w-full max-w-3xl rounded-[2.35rem] border border-white/32 bg-[linear-gradient(145deg,rgba(14,24,36,0.86)_0%,rgba(42,28,63,0.84)_52%,rgba(21,66,82,0.8)_100%)] p-6 text-slate-50 shadow-[0_34px_130px_rgba(4,12,22,0.34)] backdrop-blur-2xl sm:p-8">
      <HudFlower
        className="pointer-events-none absolute -left-3 -top-3 opacity-92"
        petalColor="linear-gradient(135deg,#ff9ec7,#ffcf7b)"
        centerColor="#fff4b8"
      />
      <HudFlower
        className="pointer-events-none absolute -right-1 bottom-3 scale-[0.78] opacity-88"
        petalColor="linear-gradient(135deg,#7ee2ff,#9effb7)"
        centerColor="#fff0a4"
      />
      <HudLadybug className="pointer-events-none absolute right-16 top-5 opacity-78" />
      <HudButterfly className="pointer-events-none absolute left-20 bottom-5 opacity-70" />
      <div className="relative z-10">
        <p className="font-hud-sans text-xs uppercase tracking-[0.38em] text-pink-100/74">
        {subtitle}
        </p>
        <h2 className="font-hud-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function GameOverlay({
  canCloseParallel = false,
  externallyFrozen = false,
  freezeLabel = null,
  onCloseParallel,
  onOpenParallelBranch,
  transcriptMount,
}: {
  canCloseParallel?: boolean;
  externallyFrozen?: boolean;
  freezeLabel?: string | null;
  onCloseParallel?: () => void;
  onOpenParallelBranch?: (request: ParallelBranchRequest) => void;
  transcriptMount?: HTMLDivElement | null;
}) {
  const introPhase = useGameStore((state) => state.introPhase);
  const paused = useGameStore((state) => state.paused);
  const interactionMenuOpen = useGameStore(
    (state) => state.interactionMenuOpen,
  );
  const interactionMenuIndex = useGameStore(
    (state) => state.interactionMenuIndex,
  );
  const interactionTarget = useGameStore((state) => state.interactionTarget);
  const openNoteId = useGameStore((state) => state.openNoteId);
  const textPanelExpanded = useGameStore(
    (state) => state.textPanelExpanded,
  );
  const collapsePhase = useGameStore((state) => state.collapsePhase);
  const jamServings = useGameStore((state) => state.jamServings);
  const chocolateServings = useGameStore((state) => state.chocolateServings);
  const gunHeld = useGameStore((state) => state.gunHeld);
  const equippedItem = useGameStore((state) => state.equippedItem);
  const apartmentDoorOpen = useGameStore((state) => state.apartmentDoorOpen);
  const buildingExitDoorOpen = useGameStore(
    (state) => state.buildingExitDoorOpen,
  );
  const packageState = useGameStore((state) => state.packageState);
  const packageDecision = useGameStore((state) => state.packageDecision);
  const coffeeDecision = useGameStore((state) => state.coffeeDecision);
  const currentObjective = useGameStore((state) => state.currentObjective);
  const deliverySequencePhase = useGameStore(
    (state) => state.deliverySequencePhase,
  );
  const unlockedNeighborDoor = useGameStore(
    (state) => state.unlockedNeighborDoor,
  );
  const playerPosition = useGameStore((state) => state.playerPosition);
  const playerForward = useGameStore((state) => state.playerForward);
  const narrationQueue = useGameStore((state) => state.narrationQueue);
  const narrationFeed = useGameStore((state) => state.narrationFeed);
  const setLookEnabled = useGameStore((state) => state.setLookEnabled);
  const setPaused = useGameStore((state) => state.setPaused);
  const setIntroPhase = useGameStore((state) => state.setIntroPhase);
  const setInteractionMenuOpen = useGameStore(
    (state) => state.setInteractionMenuOpen,
  );
  const setInteractionMenuIndex = useGameStore(
    (state) => state.setInteractionMenuIndex,
  );
  const cycleInteractionMenuIndex = useGameStore(
    (state) => state.cycleInteractionMenuIndex,
  );
  const setOpenNoteId = useGameStore((state) => state.setOpenNoteId);
  const setTextPanelExpanded = useGameStore(
    (state) => state.setTextPanelExpanded,
  );
  const beginCollapseSequence = useGameStore(
    (state) => state.beginCollapseSequence,
  );
  const setCollapsePhase = useGameStore((state) => state.setCollapsePhase);
  const consumeJar = useGameStore((state) => state.consumeJar);
  const setGunHeld = useGameStore((state) => state.setGunHeld);
  const setEquippedItem = useGameStore((state) => state.setEquippedItem);
  const setGunPlacement = useGameStore((state) => state.setGunPlacement);
  const setGroundGunPosition = useGameStore(
    (state) => state.setGroundGunPosition,
  );
  const setApartmentDoorOpen = useGameStore(
    (state) => state.setApartmentDoorOpen,
  );
  const setBuildingExitDoorOpen = useGameStore(
    (state) => state.setBuildingExitDoorOpen,
  );
  const setPackageState = useGameStore((state) => state.setPackageState);
  const setPackageDecision = useGameStore((state) => state.setPackageDecision);
  const setCoffeeDecision = useGameStore((state) => state.setCoffeeDecision);
  const setCurrentObjective = useGameStore((state) => state.setCurrentObjective);
  const setDeliverySequencePhase = useGameStore(
    (state) => state.setDeliverySequencePhase,
  );
  const setUnlockedNeighborDoor = useGameStore(
    (state) => state.setUnlockedNeighborDoor,
  );
  const setOpenNeighborDoorId = useGameStore(
    (state) => state.setOpenNeighborDoorId,
  );
  const queueNarration = useGameStore((state) => state.queueNarration);
  const clearNarrationQueue = useGameStore(
    (state) => state.clearNarrationQueue,
  );
  const removeNarration = useGameStore((state) => state.removeNarration);
  const pushNarrationFeed = useGameStore((state) => state.pushNarrationFeed);
  const clearNarrationFeed = useGameStore((state) => state.clearNarrationFeed);
  const resetRun = useGameStore((state) => state.resetRun);

  const [activeEntry, setActiveEntry] = useState<NarrationEntry | null>(null);
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [menuTab, setMenuTab] = useState<OverlayTab>("home");
  const [pauseTab, setPauseTab] = useState<OverlayTab>("home");
  const [blackoutTimer, setBlackoutTimer] = useState<{
    phase: CollapsePhase;
    elapsed: number;
  }>({
    phase: "idle",
    elapsed: 0,
  });

  const hasStartedIntro = useRef(false);
  const hasQueuedStanding = useRef(false);
  const previousIntroPhase = useRef<IntroPhase>(introPhase);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const noteLookup = useMemo(
    () =>
      new Map(
        wallNotes.map((note) => [
          note.id,
          note,
        ]),
      ),
    [],
  );

  const currentNote = openNoteId ? noteLookup.get(openNoteId) ?? null : null;
  const collapseActive = collapsePhase !== "idle";
  const typingPaused =
    externallyFrozen ||
    paused ||
    collapseActive ||
    openNoteId !== null ||
    introPhase === "menu";
  const nearTable = useMemo(
    () => isNearTable(playerPosition),
    [playerPosition],
  );

  const restoreLook = useCallback(() => {
    if (
      introPhase === "playing" &&
      !externallyFrozen &&
      !paused &&
      !collapseActive &&
      deliverySequencePhase === "idle" &&
      !interactionMenuOpen &&
      openNoteId === null &&
      !textPanelExpanded
    ) {
      setLookEnabled(true);
    }
  }, [
    interactionMenuOpen,
    collapseActive,
    externallyFrozen,
    introPhase,
    deliverySequencePhase,
    openNoteId,
    paused,
    setLookEnabled,
    textPanelExpanded,
  ]);

  const closeInteractionMenu = useCallback(() => {
    setInteractionMenuOpen(false);
    setInteractionMenuIndex(0);
    restoreLook();
  }, [restoreLook, setInteractionMenuIndex, setInteractionMenuOpen]);

  const closeNote = useCallback(() => {
    setOpenNoteId(null);
    restoreLook();
  }, [restoreLook, setOpenNoteId]);

  useEffect(() => {
    if (introPhase !== "menu") {
      return;
    }

    hasStartedIntro.current = false;
    hasQueuedStanding.current = false;

    const resetTimeout = window.setTimeout(() => {
      setActiveEntry(null);
      setVisibleWordCount(0);
      setMenuTab("home");
      setPauseTab("home");
    }, 0);

    return () => {
      window.clearTimeout(resetTimeout);
    };
  }, [introPhase]);

  useEffect(() => {
    if (collapsePhase !== "blackout") {
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();

    const updateAge = (now: number) => {
      setBlackoutTimer({
        phase: "blackout",
        elapsed: (now - startedAt) / 1000,
      });
      frameId = window.requestAnimationFrame(updateAge);
    };

    frameId = window.requestAnimationFrame(updateAge);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [collapsePhase]);

  const blackoutOverlayAge =
    collapsePhase === "blackout" && blackoutTimer.phase === "blackout"
      ? Math.max(0, blackoutTimer.elapsed)
      : 0;

  useEffect(() => {
    const enteredPlayingFromStanding =
      previousIntroPhase.current === "standing" && introPhase === "playing";

    if (
      enteredPlayingFromStanding &&
      !hasQueuedStanding.current &&
      !collapseActive
    ) {
      hasQueuedStanding.current = true;
      standingMonologue.forEach((line) => queueNarration(line));
    }

    previousIntroPhase.current = introPhase;
  }, [collapseActive, introPhase, queueNarration]);

  useEffect(() => {
    if (!collapseActive) {
      return;
    }

    const resetNarrationTimeout = window.setTimeout(() => {
      clearNarrationQueue();
      setActiveEntry(null);
      setVisibleWordCount(0);
    }, 0);

    return () => {
      window.clearTimeout(resetNarrationTimeout);
    };
  }, [clearNarrationQueue, collapseActive]);

  useEffect(() => {
    const nextEntry = narrationQueue[0];
    if (!nextEntry || activeEntry !== null || typingPaused) {
      return;
    }

    const activationTimeout = window.setTimeout(() => {
      setActiveEntry(nextEntry);
      setVisibleWordCount(0);
      removeNarration(nextEntry.id);
    }, 0);

    return () => {
      window.clearTimeout(activationTimeout);
    };
  }, [activeEntry, narrationQueue, removeNarration, typingPaused]);

  const activeWords = useMemo(
    () => (activeEntry ? activeEntry.text.split(" ") : []),
    [activeEntry],
  );

  useEffect(() => {
    if (!activeEntry || typingPaused) {
      return;
    }

    if (visibleWordCount >= activeWords.length) {
      const completionTimeout = window.setTimeout(() => {
        pushNarrationFeed(activeEntry);
        setActiveEntry(null);
        setVisibleWordCount(0);
      }, narrationTiming.completionHoldMs);

      return () => {
        window.clearTimeout(completionTimeout);
      };
    }

    const nextWordDelay =
      visibleWordCount === 0
        ? narrationTiming.firstWordDelayMs
        : narrationTiming.nextWordDelayMs;
    const wordTimeout = window.setTimeout(() => {
      setVisibleWordCount((currentCount) => currentCount + 1);
    }, nextWordDelay);

    return () => {
      window.clearTimeout(wordTimeout);
    };
  }, [
    activeEntry,
    activeWords.length,
    pushNarrationFeed,
    typingPaused,
    visibleWordCount,
  ]);

  const currentLine = activeEntry
    ? activeWords.slice(0, visibleWordCount).join(" ")
    : "";

  useEffect(() => {
    if (!textPanelExpanded || !transcriptRef.current) {
      return;
    }

    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [currentLine, narrationFeed, textPanelExpanded]);

  const handleStartFromMenu = useCallback(() => {
    resetRun();
    clearNarrationQueue();
    clearNarrationFeed();
    setActiveEntry(null);
    setVisibleWordCount(0);
    setIntroPhase("sleeping");
    setPaused(false);
    setLookEnabled(false);
    hasStartedIntro.current = false;
    hasQueuedStanding.current = false;
  }, [
    clearNarrationQueue,
    clearNarrationFeed,
    resetRun,
    setIntroPhase,
    setLookEnabled,
    setPaused,
  ]);

  const handleOpenEyes = useCallback(() => {
    if (hasStartedIntro.current) {
      return;
    }

    hasStartedIntro.current = true;
    clearNarrationQueue();
    clearNarrationFeed();
    setActiveEntry(null);
    setVisibleWordCount(0);
    setIntroPhase("opening");
    openingMonologue.forEach((line) => queueNarration(line));
  }, [
    clearNarrationFeed,
    clearNarrationQueue,
    queueNarration,
    setIntroPhase,
  ]);

  const handleReturnToMenu = useCallback(() => {
    resetRun();
    clearNarrationQueue();
    clearNarrationFeed();
    setActiveEntry(null);
    setVisibleWordCount(0);
    setLookEnabled(false);
  }, [
    clearNarrationFeed,
    clearNarrationQueue,
    resetRun,
    setLookEnabled,
  ]);

  const handlePlaceGunOnTable = useCallback(() => {
    setGunPlacement("table");
    setGunHeld(false);
    setEquippedItem("hands");
  }, [setEquippedItem, setGunHeld, setGunPlacement]);

  const handleToggleApartmentDoor = useCallback(() => {
    setApartmentDoorOpen(!apartmentDoorOpen);
    closeInteractionMenu();
  }, [apartmentDoorOpen, closeInteractionMenu, setApartmentDoorOpen]);

  const handleToggleBuildingExitDoor = useCallback(() => {
    setBuildingExitDoorOpen(!buildingExitDoorOpen);
    if (!buildingExitDoorOpen && currentObjective !== "deliver-package") {
      setCurrentObjective("free-roam");
    }
    closeInteractionMenu();
  }, [
    buildingExitDoorOpen,
    closeInteractionMenu,
    currentObjective,
    setBuildingExitDoorOpen,
    setCurrentObjective,
  ]);

  const handleDropGun = useCallback(() => {
    const dropPosition = getGroundDropPosition(playerPosition, playerForward);
    setGroundGunPosition(dropPosition);
    setGunPlacement("ground");
    setGunHeld(false);
    setEquippedItem("hands");
  }, [
    playerForward,
    playerPosition,
    setEquippedItem,
    setGroundGunPosition,
    setGunHeld,
    setGunPlacement,
  ]);

  const handleTakeGun = useCallback(() => {
    if (onOpenParallelBranch) {
      closeInteractionMenu();
      onOpenParallelBranch({
        kind: "gun-take",
        title: "Silahi Yanina Aldigin Evren",
      });
      return;
    }

    setGunHeld(true);
    setEquippedItem("gun");
    closeInteractionMenu();
  }, [
    closeInteractionMenu,
    onOpenParallelBranch,
    setEquippedItem,
    setGunHeld,
  ]);

  const handleDeliverPackageBranch = useCallback(() => {
    if (onOpenParallelBranch) {
      closeInteractionMenu();
      onOpenParallelBranch({
        kind: "package-deliver",
        title: "Ilac Paketini Teslim Ettigin Evren",
      });
      return;
    }

    setPackageState("carried");
    setPackageDecision("deliver");
    setUnlockedNeighborDoor(sceneLayout.package.recipientDoorId);
    setCurrentObjective("deliver-package");
    closeInteractionMenu();
  }, [
    closeInteractionMenu,
    onOpenParallelBranch,
    setCurrentObjective,
    setPackageDecision,
    setPackageState,
    setUnlockedNeighborDoor,
  ]);

  const handleLeavePackage = useCallback(() => {
    setPackageDecision("left");
    if (currentObjective !== "deliver-package") {
      setCurrentObjective("free-roam");
    }
    closeInteractionMenu();
  }, [closeInteractionMenu, currentObjective, setCurrentObjective, setPackageDecision]);

  const handleDeliverPackageToNeighbor = useCallback(() => {
    closeInteractionMenu();
    setLookEnabled(false);
    setPackageDecision("deliver");
    setCurrentObjective("delivery-scene");
    setDeliverySequencePhase("opening-door");
    setUnlockedNeighborDoor(null);
    setOpenNeighborDoorId(sceneLayout.package.recipientDoorId);
  }, [
    closeInteractionMenu,
    setCurrentObjective,
    setDeliverySequencePhase,
    setLookEnabled,
    setOpenNeighborDoorId,
    setPackageDecision,
    setUnlockedNeighborDoor,
  ]);

  const handleAcceptCoffeeDecision = useCallback(() => {
    if (onOpenParallelBranch) {
      closeInteractionMenu();
      onOpenParallelBranch({
        kind: "coffee-accept",
        title: "Kahve Teklifini Kabul Ettigin Evren",
      });
      return;
    }

    setCoffeeDecision("accept");
    setCurrentObjective("neighbor-visit");
    setDeliverySequencePhase("idle");
    setInteractionMenuOpen(false);
    setInteractionMenuIndex(0);
  }, [
    closeInteractionMenu,
    onOpenParallelBranch,
    setCoffeeDecision,
    setCurrentObjective,
    setDeliverySequencePhase,
    setInteractionMenuIndex,
    setInteractionMenuOpen,
  ]);

  const handleDeclineCoffeeDecision = useCallback(() => {
    if (onOpenParallelBranch) {
      closeInteractionMenu();
      onOpenParallelBranch({
        kind: "coffee-decline",
        title: "Kahve Teklifini Reddettigin Evren",
      });
      return;
    }

    setCoffeeDecision("decline");
    setCurrentObjective("free-roam");
    setDeliverySequencePhase("idle");
    setInteractionMenuOpen(false);
    setInteractionMenuIndex(0);
  }, [
    closeInteractionMenu,
    onOpenParallelBranch,
    setCoffeeDecision,
    setCurrentObjective,
    setDeliverySequencePhase,
    setInteractionMenuIndex,
    setInteractionMenuOpen,
  ]);

  const handleActivateDevice = useCallback(() => {
    if (onOpenParallelBranch) {
      closeInteractionMenu();
      onOpenParallelBranch({
        kind: "gun-trigger",
        title: "Tetiği Cektigin Evren",
      });
      return;
    }

    clearNarrationQueue();
    clearNarrationFeed();
    setActiveEntry(null);
    setVisibleWordCount(0);
    setGunHeld(true);
    setEquippedItem("gun");
    beginCollapseSequence();
  }, [
    beginCollapseSequence,
    clearNarrationFeed,
    clearNarrationQueue,
    closeInteractionMenu,
    onOpenParallelBranch,
    setEquippedItem,
    setGunHeld,
  ]);

  useEffect(() => {
    if (collapsePhase === "idle" || collapsePhase === "blackout") {
      return;
    }

    const nextPhase: CollapsePhase =
      collapsePhase === "priming"
        ? "surging"
        : collapsePhase === "surging"
          ? "falling"
          : collapsePhase === "falling"
            ? "closing"
            : "blackout";

    const timeout = window.setTimeout(() => {
      setCollapsePhase(nextPhase);
    }, getCollapsePhaseDurationMs(collapsePhase));

    return () => {
      window.clearTimeout(timeout);
    };
  }, [collapsePhase, setCollapsePhase]);

  useEffect(() => {
    if (deliverySequencePhase === "idle" || deliverySequencePhase === "choice") {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (deliverySequencePhase === "opening-door") {
        setPackageState("delivered");
        setDeliverySequencePhase("thanks");
        queueNarration(
          "Kapinin zinciri surtunuyor. Yasli adam kutuyu gorur gormez nefesi yumusuyor.",
        );
        return;
      }

      if (deliverySequencePhase === "thanks") {
        setDeliverySequencePhase("invite");
        queueNarration(
          "\"Cok sag ol evlat,\" diyor. Kutuyu gogus hizasinda tutup kapiyi biraz daha aciyor.",
        );
        return;
      }

      setDeliverySequencePhase("choice");
      setInteractionMenuIndex(0);
      setInteractionMenuOpen(true);
      queueNarration(
        "\"Iceri gel. Bir kahve ic, oyle cik,\" diye ekliyor. Sesinde acele degil, yorgun bir minnettarlik var.",
      );
    }, deliverySequencePhase === "opening-door" ? 1300 : 2200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    deliverySequencePhase,
    queueNarration,
    setDeliverySequencePhase,
    setInteractionMenuIndex,
    setInteractionMenuOpen,
    setPackageState,
  ]);

  const handleCycleInventory = useCallback(
    (delta: number) => {
      if (!gunHeld) {
        return;
      }

      const inventoryOrder: InventoryItem[] = ["hands", "gun"];
      const currentIndex = inventoryOrder.indexOf(equippedItem);
      const nextIndex =
        ((currentIndex + delta) % inventoryOrder.length + inventoryOrder.length) %
        inventoryOrder.length;
      setEquippedItem(inventoryOrder[nextIndex]);
    },
    [equippedItem, gunHeld, setEquippedItem],
  );

  const menuOptions = useMemo<MenuOption[]>(() => {
    if (deliverySequencePhase === "choice") {
      return [
        {
          id: "coffee-accept",
          label: "Kahve teklifini kabul et",
          onSelect: handleAcceptCoffeeDecision,
        },
        {
          id: "coffee-decline",
          label: "Nazikce reddet",
          onSelect: handleDeclineCoffeeDecision,
        },
      ];
    }

    if (!interactionTarget) {
      return [];
    }

    switch (interactionTarget) {
      case "jam":
        if (jamServings >= sceneLayout.maxJarServings) {
          return [
            {
              id: "jam-empty",
              label: "Boş kavanoza bak",
              onSelect: () => {
                queueNarration(jarEmptyNarration.jam);
              },
            },
            {
              id: "jam-leave",
              label: "Şimdilik bırak",
              onSelect: closeInteractionMenu,
            },
          ];
        }

        return [
          {
            id: "jam-eat",
            label: "Bir kaşık ye",
            onSelect: () => {
              const servingIndex = consumeJar("jam");
              queueNarration(jarNarration.jam[servingIndex - 1]);
            },
          },
          {
            id: "jam-leave",
            label: "Şimdilik bırak",
            onSelect: closeInteractionMenu,
          },
        ];
      case "chocolate":
        if (chocolateServings >= sceneLayout.maxJarServings) {
          return [
            {
              id: "chocolate-empty",
              label: "Boş kavanoza bak",
              onSelect: () => {
                queueNarration(jarEmptyNarration.chocolate);
              },
            },
            {
              id: "chocolate-leave",
              label: "Şimdilik bırak",
              onSelect: closeInteractionMenu,
            },
          ];
        }

        return [
          {
            id: "chocolate-eat",
            label: "Bir kaşık ye",
            onSelect: () => {
              const servingIndex = consumeJar("chocolate");
              queueNarration(jarNarration.chocolate[servingIndex - 1]);
            },
          },
          {
            id: "chocolate-leave",
            label: "Şimdilik bırak",
            onSelect: closeInteractionMenu,
          },
        ];
      case "gun":
        return [
          {
            id: "gun-take",
            label: "Yanına al",
            onSelect: handleTakeGun,
          },
          {
            id: "gun-trigger",
            label: "Cihazı tetikle",
            onSelect: () => {
              handleActivateDevice();
            },
          },
        ];
      case "package":
        return [
          {
            id: "package-deliver",
            label: "Sahibine gotur",
            onSelect: handleDeliverPackageBranch,
          },
          {
            id: "package-leave",
            label: "Paketi birak",
            onSelect: handleLeavePackage,
          },
        ];
      case "apartment-door":
        return [
          {
            id: apartmentDoorOpen ? "apartment-door-close" : "apartment-door-open",
            label: apartmentDoorOpen ? "Kapiyi kapat" : "Kapiyi ac",
            onSelect: handleToggleApartmentDoor,
          },
        ];
      case "building-exit":
        return [
          {
            id: buildingExitDoorOpen ? "building-exit-close" : "building-exit-open",
            label: buildingExitDoorOpen ? "Dis kapiyi kapat" : "Dis kapiyi ac",
            onSelect: handleToggleBuildingExitDoor,
          },
        ];
      case "equipped-gun":
        return [
          {
            id: "equipped-gun-trigger",
            label: "Cihazı tetikle",
            onSelect: () => {
              handleActivateDevice();
            },
          },
          {
            id: "equipped-gun-holster",
            label: "Boş ellere dön",
            onSelect: () => {
              setEquippedItem("hands");
              closeInteractionMenu();
            },
          },
          {
            id: nearTable ? "equipped-gun-table" : "equipped-gun-drop",
            label: nearTable ? "Masaya koy" : "Yere bırak",
            onSelect: () => {
              if (nearTable) {
                handlePlaceGunOnTable();
              } else {
                handleDropGun();
              }
              closeInteractionMenu();
            },
          },
        ];
      default:
        if (interactionTarget.startsWith("neighbor-door:")) {
          return interactionTarget.endsWith(unlockedNeighborDoor ?? "")
            ? [
                {
                  id: "neighbor-door-deliver",
                  label: "Kapiyi cal ve teslim et",
                  onSelect: handleDeliverPackageToNeighbor,
                },
                {
                  id: "neighbor-door-cancel",
                  label: "Vazgec",
                  onSelect: closeInteractionMenu,
                },
              ]
            : [];
        }

        return [];
    }
  }, [
    apartmentDoorOpen,
    buildingExitDoorOpen,
    chocolateServings,
    closeInteractionMenu,
    consumeJar,
    handleActivateDevice,
    handleAcceptCoffeeDecision,
    handleDeclineCoffeeDecision,
    handleDeliverPackageBranch,
    handleDeliverPackageToNeighbor,
    handleDropGun,
    handleLeavePackage,
    handlePlaceGunOnTable,
    handleTakeGun,
    handleToggleApartmentDoor,
    handleToggleBuildingExitDoor,
    interactionTarget,
    jamServings,
    nearTable,
    queueNarration,
    setEquippedItem,
    deliverySequencePhase,
    unlockedNeighborDoor,
  ]);

  const previousEquippedItem = useRef<InventoryItem>("hands");

  useEffect(() => {
    if (
      previousEquippedItem.current !== "gun" &&
      equippedItem === "gun" &&
      gunHeld &&
      introPhase === "playing" &&
      !externallyFrozen &&
      !paused &&
      !collapseActive &&
      openNoteId === null &&
      !textPanelExpanded
    ) {
      setInteractionMenuIndex(0);
      setInteractionMenuOpen(true);
      setLookEnabled(false);
    }

    previousEquippedItem.current = equippedItem;
  }, [
    collapseActive,
    equippedItem,
    externallyFrozen,
    gunHeld,
    introPhase,
    openNoteId,
    paused,
    setInteractionMenuIndex,
    setInteractionMenuOpen,
    setLookEnabled,
    textPanelExpanded,
  ]);

  useEffect(() => {
    if (!interactionMenuOpen) {
      return;
    }

    if (interactionMenuIndex >= menuOptions.length) {
      setInteractionMenuIndex(0);
    }
  }, [
    interactionMenuIndex,
    interactionMenuOpen,
    menuOptions.length,
    setInteractionMenuIndex,
  ]);

  const promptLabel = useMemo(() => {
    if (deliverySequencePhase === "choice") {
      return "Kahve teklifi";
    }

    if (!interactionTarget) {
      return null;
    }

    if (interactionTarget.startsWith("note:")) {
      return "Notu oku";
    }

    if (interactionTarget === "equipped-gun") {
      return "Silah menüsü";
    }

    if (interactionTarget === "package") {
      return "Ilac paketi";
    }

    if (interactionTarget === "apartment-door") {
      return "Daire kapisi";
    }

    if (interactionTarget === "building-exit") {
      return "Apartman cikisi";
    }

    if (interactionTarget.startsWith("neighbor-door:")) {
      const doorId = interactionTarget.slice("neighbor-door:".length);
      return `${doorId} kapisi`;
    }

    return interactionLabels[
      interactionTarget as keyof typeof interactionLabels
    ];
  }, [deliverySequencePhase, interactionTarget]);

  const promptText = interactionTarget
    ? interactionTarget.startsWith("note:")
      ? "E / Notu oku"
      : interactionTarget === "equipped-gun"
        ? "E / Silah menüsü"
        : `E / ${promptLabel}`
    : null;
  const objectiveText =
    currentObjective === "delivery-scene"
      ? "2B kapisinda yanit bekleniyor."
      : currentObjective === "neighbor-visit"
        ? coffeeDecision === "accept"
          ? "Kahve teklifini kabul ettigin yeni dal devam ediyor."
          : "2B davetinin ardindan yeni dal ilerliyor."
        : currentObjective === "deliver-package"
      ? `${sceneLayout.package.recipientDoorId} kapisina ilaclari ulastir`
      : packageState === "delivered"
        ? "Paket teslim edildi. Koridor ve disari acik."
      : packageDecision === "left"
        ? "Paket yerinde kaldi. Koridor ve cikis acik."
        : currentObjective === "free-roam"
          ? "Sol rota ve duz yol acik."
          : null;

  const handleConfirmInteraction = useCallback(() => {
    if (
      externallyFrozen ||
      paused ||
      introPhase !== "playing" ||
      collapseActive ||
      (deliverySequencePhase !== "idle" && deliverySequencePhase !== "choice")
    ) {
      return;
    }

    if (openNoteId !== null) {
      closeNote();
      return;
    }

    if (interactionMenuOpen) {
      const selectedOption = menuOptions[interactionMenuIndex];
      if (selectedOption) {
        selectedOption.onSelect();
      }
      return;
    }

    if (!interactionTarget) {
      return;
    }

    if (interactionTarget.startsWith("note:")) {
      const noteId = interactionTarget.slice(5);
      setOpenNoteId(noteId);
      setLookEnabled(false);
      return;
    }

    setInteractionMenuIndex(0);
    setInteractionMenuOpen(true);
    setLookEnabled(false);
  }, [
    closeNote,
    interactionMenuIndex,
    interactionMenuOpen,
    interactionTarget,
    introPhase,
    collapseActive,
    deliverySequencePhase,
    externallyFrozen,
    menuOptions,
    openNoteId,
    paused,
    setInteractionMenuIndex,
    setInteractionMenuOpen,
    setLookEnabled,
    setOpenNoteId,
  ]);

  const toggleTextPanel = useCallback(() => {
    if (
      externallyFrozen ||
      introPhase !== "playing" ||
      collapseActive ||
      deliverySequencePhase !== "idle"
    ) {
      return;
    }

    if (!textPanelExpanded && (interactionMenuOpen || openNoteId !== null)) {
      return;
    }

    const nextValue = !textPanelExpanded;
    setTextPanelExpanded(nextValue);
    if (nextValue) {
      setLookEnabled(false);
    } else {
      restoreLook();
    }
  }, [
    externallyFrozen,
    introPhase,
    interactionMenuOpen,
    openNoteId,
    collapseActive,
    deliverySequencePhase,
    restoreLook,
    setLookEnabled,
    setTextPanelExpanded,
    textPanelExpanded,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (introPhase === "menu") {
        return;
      }

      if (externallyFrozen) {
        return;
      }

      if (collapsePhase !== "idle") {
        if (
          collapsePhase === "blackout" &&
          (event.code === "Escape" ||
            event.code === "Enter" ||
            event.code === "Space")
        ) {
          event.preventDefault();
          if (canCloseParallel && onCloseParallel) {
            onCloseParallel();
          } else {
            handleReturnToMenu();
          }
        }
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();

        if (openNoteId !== null) {
          closeNote();
          return;
        }

        if (interactionMenuOpen) {
          closeInteractionMenu();
          return;
        }

        if (textPanelExpanded) {
          setTextPanelExpanded(false);
          restoreLook();
          return;
        }

        if (introPhase === "playing") {
          const nextPaused = !paused;
          setPaused(nextPaused);
          if (nextPaused) {
            setLookEnabled(false);
          } else {
            restoreLook();
          }
        }
        return;
      }

      if (paused) {
        return;
      }

      if (
        deliverySequencePhase !== "idle" &&
        deliverySequencePhase !== "choice"
      ) {
        return;
      }

      if (event.code === "KeyM") {
        event.preventDefault();
        toggleTextPanel();
        return;
      }

      if (introPhase !== "playing") {
        return;
      }

      if (interactionMenuOpen) {
        if (event.code === "KeyE") {
          event.preventDefault();
          handleConfirmInteraction();
          return;
        }

        if (event.code === "ArrowUp" || event.code === "KeyW") {
          event.preventDefault();
          cycleInteractionMenuIndex(menuOptions.length, -1);
          return;
        }

        if (event.code === "ArrowDown" || event.code === "KeyS") {
          event.preventDefault();
          cycleInteractionMenuIndex(menuOptions.length, 1);
        }
        return;
      }

      if (openNoteId !== null) {
        if (event.code === "KeyE") {
          event.preventDefault();
          closeNote();
        }
        return;
      }

      if (textPanelExpanded) {
        return;
      }

      if (event.code === "Digit1") {
        event.preventDefault();
        setEquippedItem("hands");
        return;
      }

      if (event.code === "Digit2" && gunHeld) {
        event.preventDefault();
        setEquippedItem("gun");
        return;
      }

      if (event.code === "KeyQ" && gunHeld && equippedItem === "gun") {
        event.preventDefault();
        handleDropGun();
        return;
      }

      if (event.code === "KeyE" && interactionTarget) {
        event.preventDefault();
        handleConfirmInteraction();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        externallyFrozen ||
        paused ||
        introPhase !== "playing" ||
        (deliverySequencePhase !== "idle" &&
          !(deliverySequencePhase === "choice" && interactionMenuOpen))
      ) {
        return;
      }

      if (openNoteId !== null || textPanelExpanded) {
        return;
      }

      if (interactionMenuOpen && menuOptions.length > 0) {
        event.preventDefault();
        cycleInteractionMenuIndex(
          menuOptions.length,
          event.deltaY > 0 ? 1 : -1,
        );
        return;
      }

      if (!gunHeld) {
        return;
      }

      event.preventDefault();
      handleCycleInventory(event.deltaY > 0 ? 1 : -1);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [
    closeInteractionMenu,
    closeNote,
    cycleInteractionMenuIndex,
    equippedItem,
    gunHeld,
    handleConfirmInteraction,
    handleCycleInventory,
    handleDropGun,
    handleReturnToMenu,
    canCloseParallel,
    externallyFrozen,
    interactionMenuOpen,
    interactionTarget,
    introPhase,
    menuOptions.length,
    onCloseParallel,
    openNoteId,
    paused,
    collapsePhase,
    deliverySequencePhase,
    restoreLook,
    setEquippedItem,
    setLookEnabled,
    setPaused,
    setTextPanelExpanded,
    textPanelExpanded,
    toggleTextPanel,
  ]);

  const transcriptEntries = useMemo(
    () => [
      ...narrationFeed,
      ...(currentLine
        ? [
            {
              id: -1,
              text: currentLine,
            },
          ]
        : []),
    ],
    [currentLine, narrationFeed],
  );

  const inventorySlots = useMemo(
    () => [
      {
        id: "hands" as const,
        label: "Boş Eller",
        active: equippedItem === "hands",
        available: true,
        hotkey: "1",
      },
      {
        id: "gun" as const,
        label: "Silah",
        active: equippedItem === "gun",
        available: gunHeld,
        hotkey: "2",
      },
    ],
    [equippedItem, gunHeld],
  );

  const transcriptPanel = (
    <div
      className={[
        "hud-panel font-hud-sans mx-auto w-full max-w-6xl rounded-[2.2rem] border border-white/24 bg-[linear-gradient(135deg,rgba(13,20,35,0.9)_0%,rgba(49,28,70,0.84)_42%,rgba(17,72,92,0.82)_100%)] shadow-[0_24px_90px_rgba(4,12,22,0.34)] backdrop-blur-2xl transition-[padding] duration-300",
        textPanelExpanded ? "pointer-events-auto p-4 sm:p-5" : "px-4 py-3 sm:px-5 sm:py-4",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.34em] text-cyan-100/72">
          İç Ses
        </p>
        <p className="text-[11px] uppercase tracking-[0.28em] text-pink-100/66">
          {collapseActive
            ? collapsePhase === "blackout"
              ? "Bağlantı kesildi"
              : "Sinyal çözülüyor"
            : textPanelExpanded
              ? "M ile kapat / kaydırarak oku"
              : "M ile aç"}
        </p>
      </div>

      {textPanelExpanded ? (
        <div
          ref={transcriptRef}
          className="mt-3 max-h-[22dvh] overflow-y-auto pr-2"
        >
          <div className="grid gap-2">
            {transcriptEntries.map((entry) => (
              <p
                key={entry.id}
                className={[
                  "text-sm leading-7",
                  entry.id === -1 ? "text-white" : "text-slate-200/74",
                ].join(" ")}
              >
                {entry.text}
                {entry.id === -1 && activeEntry ? (
                  <span className="ml-1 inline-block h-5 w-px animate-pulse bg-cyan-50/75 align-middle" />
                ) : null}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-1.5">
          {narrationFeed.slice(-1).map((entry) => (
            <p key={entry.id} className="text-sm leading-6 text-slate-200/68">
              {entry.text}
            </p>
          ))}
          <p className="min-h-9 text-[0.98rem] leading-6 text-white sm:text-[1rem]">
            {currentLine || " "}
            {activeEntry ? (
              <span className="ml-1 inline-block h-5 w-px animate-pulse bg-cyan-50/75 align-middle" />
            ) : null}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <GardenHudLayer subdued={collapseActive || paused || externallyFrozen} />
      <EyeOpeningOverlay phase={introPhase} />
      <NeuralBlackoutOverlay phase={collapsePhase} />

      {introPhase === "menu" ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,153,196,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(126,226,255,0.2),transparent_24%),radial-gradient(circle_at_bottom,rgba(196,255,144,0.14),transparent_22%),rgba(3,7,17,0.82)] px-4">
          <OverlayCard
            title="Uyandığın sabahın eşiğinde"
            subtitle="Choices / Ana Menü"
          >
            {menuTab === "home" ? (
              <div className="grid gap-4">
                <p className="font-hud-sans max-w-2xl text-sm leading-7 text-slate-200/82">
                  Sessiz bir oda. Dağınık notlar. Seçimlerin ağırlaşacağı bir
                  sabah. Oyun ses yerine iç sesiyle, hareket yerine duraksamayla
                  ve ayrıntı yerine atmosferle ilerliyor.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className={hudPrimaryButtonClass}
                    onClick={handleStartFromMenu}
                  >
                    <span className="block text-xs uppercase tracking-[0.28em] text-slate-900/56">
                      Başla
                    </span>
                    <span className="mt-2 block text-lg font-semibold">
                      Oyuna Başla
                    </span>
                  </button>
                  <button
                    type="button"
                    className={hudSecondaryButtonClass}
                    onClick={() => setMenuTab("controls")}
                  >
                    <span className="block text-xs uppercase tracking-[0.28em] text-sky-950/52">
                      Rehber
                    </span>
                    <span className="mt-2 block text-lg font-semibold">
                      Tuşlar ve Kısayollar
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {menuTab === "controls" ? (
              <div className="grid gap-3">
                <ShortcutRow keys="W A S D" description="Yürü" />
                <ShortcutRow keys="Mouse" description="Kamerayı yönlendir" />
                <ShortcutRow keys="Shift" description="Hızlan" />
                <ShortcutRow keys="Ctrl" description="Eğil" />
                <ShortcutRow keys="Space" description="Zıpla" />
                <ShortcutRow keys="E" description="Etkileşime gir / Seç" />
                <ShortcutRow keys="M" description="Metin panelini aç / kapa" />
                <ShortcutRow
                  keys="1 / 2"
                  description="Boş eller / Silah seç"
                />
                <ShortcutRow
                  keys="Wheel"
                  description="Envanter veya seçenekler arasında geç"
                />
                <ShortcutRow keys="Q" description="Seçili silahı bırak" />
                <ShortcutRow keys="Esc" description="Oyunu duraklat" />

                <button
                  type="button"
                  className={`mt-2 self-start ${hudRoundButtonClass}`}
                  onClick={() => setMenuTab("home")}
                >
                  Geri dön
                </button>
              </div>
            ) : null}

          </OverlayCard>
        </div>
      ) : null}

      {introPhase === "sleeping" ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,153,196,0.12),transparent_28%),rgba(3,6,14,0.88)] px-6">
          <OverlayCard
            title="Uyanmak zorunda kaldığın sabah"
            subtitle="İç Ses"
          >
            <p className="font-hud-sans text-sm leading-7 text-slate-200/82">
              Önce gözlerini aç. Sonra yataktan kalk. Geri kalanı düşünceler
              zaten kendi kendine fısıldayacak.
            </p>
            <button
              type="button"
              className={`${hudPrimaryButtonClass} mt-8 rounded-full px-7 py-3 text-center text-sm font-semibold`}
              onClick={handleOpenEyes}
            >
              Gözünü aç
            </button>
          </OverlayCard>
        </div>
      ) : null}

      {paused && !collapseActive ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(4,8,18,0.54)] px-4 backdrop-blur-sm">
          <OverlayCard title="Duraklatıldı" subtitle="Esc / Oyun Menüsü">
            {pauseTab === "home" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className={hudPrimaryButtonClass}
                  onClick={() => {
                    setPaused(false);
                    restoreLook();
                  }}
                >
                  Devam et
                </button>
                <button
                  type="button"
                  className={hudSecondaryButtonClass}
                  onClick={() => setPauseTab("controls")}
                >
                  Tuşlar
                </button>
                <button
                  type="button"
                  className={hudSecondaryButtonClass}
                  onClick={handleReturnToMenu}
                >
                  Ana menüye dön
                </button>
              </div>
            ) : null}

            {pauseTab === "controls" ? (
              <div className="grid gap-3">
                <ShortcutRow keys="E" description="Etkileşim / Seçim" />
                <ShortcutRow keys="M" description="Metin paneli" />
                <ShortcutRow keys="1 / 2" description="Envanter" />
                <ShortcutRow keys="Wheel" description="Seçim / Envanter geçişi" />
                <ShortcutRow keys="Q" description="Silahı bırak" />
                <button
                  type="button"
                  className={`mt-2 self-start ${hudRoundButtonClass}`}
                  onClick={() => setPauseTab("home")}
                >
                  Geri dön
                </button>
              </div>
            ) : null}

          </OverlayCard>
        </div>
      ) : null}

      {externallyFrozen ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/46 px-4 backdrop-blur-[2px]">
          <OverlayCard
            title="Bu evren askida"
            subtitle="Paralel Dal Acik"
          >
            <p className="font-hud-sans max-w-2xl text-sm leading-7 text-slate-200/82">
              {freezeLabel
                ? `${freezeLabel} adli pencere acik. O pencere kapaninca bu evren kaldigi yerden yeniden hareket edecek.`
                : "Acilan paralel pencere kapaninca bu evren kaldigi yerden devam edecek."}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-fuchsia-950/54">
              Bu pencerede zaman ve etkileşim gecici olarak donduruldu
            </p>
          </OverlayCard>
        </div>
      ) : null}

      {collapsePhase === "blackout" ? (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-4">
          <div
            className={[
              "pointer-events-auto w-full max-w-3xl transition-all duration-500",
              blackoutOverlayAge > 1.05
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            ].join(" ")}
          >
            <OverlayCard
              title="Bağlantı kesildi"
              subtitle="Sinirsel Çöküş"
            >
              <p className="font-hud-sans max-w-2xl text-sm leading-7 text-slate-200/82">
                Oda geride kaldı, beden yerde kaldı, bilinç bir süreliğine askıda.
                {canCloseParallel
                  ? "Bu dal kapatilirsa onceki evren yeniden canlanacak."
                  : "Buradan devam etmek yerine sabahin en basina donebilirsin."}
              </p>
              <button
                type="button"
                className={`${hudPrimaryButtonClass} mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold`}
                onClick={() => {
                  if (canCloseParallel && onCloseParallel) {
                    onCloseParallel();
                    return;
                  }

                  handleReturnToMenu();
                }}
              >
                {canCloseParallel ? "Onceki evrene don" : "Ana menuye don"}
              </button>
            </OverlayCard>
          </div>
        </div>
      ) : null}

      {currentNote ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <OverlayCard title={currentNote.title} subtitle="Duvar Notu">
            <p className="font-hud-sans text-base leading-8 text-slate-100/90">
              {currentNote.body}
            </p>
            {currentNote.attribution ? (
              <p className="mt-5 text-sm italic leading-7 text-fuchsia-950/64">
                {currentNote.attribution}
              </p>
            ) : null}
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-sky-950/58">
              E veya Esc ile kapat
            </p>
          </OverlayCard>
        </div>
      ) : null}

      {canCloseParallel && onCloseParallel && !externallyFrozen ? (
        <div className="absolute right-4 top-4 z-40">
          <button
            type="button"
            className="pointer-events-auto font-hud-sans rounded-full border border-white/44 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(225,245,255,0.8)_54%,rgba(255,234,201,0.84)_100%)] px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-950 shadow-[0_20px_40px_rgba(14,165,233,0.18)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(212,240,255,0.88)_48%,rgba(255,225,181,0.9)_100%)]"
            onClick={onCloseParallel}
          >
            Bu Evreni Kapat
          </button>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-40 p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          {introPhase === "playing" && !collapseActive && !externallyFrozen ? (
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {inventorySlots
                  .filter((slot) => slot.available)
                  .map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className={[
                        "pointer-events-auto hud-panel font-hud-sans rounded-[1.65rem] border px-4 py-3 text-left transition duration-200",
                        slot.active
                          ? "border-white/40 bg-[linear-gradient(135deg,rgba(255,208,229,0.42)_0%,rgba(255,232,172,0.34)_44%,rgba(148,233,255,0.34)_100%)] shadow-[0_0_34px_rgba(244,114,182,0.18)]"
                          : "border-white/18 bg-[linear-gradient(135deg,rgba(14,18,36,0.8),rgba(31,22,53,0.72)_46%,rgba(23,50,70,0.72)_100%)] hover:bg-[linear-gradient(135deg,rgba(18,24,46,0.88),rgba(40,27,65,0.82)_48%,rgba(28,62,80,0.82)_100%)]",
                      ].join(" ")}
                      onClick={() => setEquippedItem(slot.id)}
                    >
                      <span className="block text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">
                        {slot.hotkey}
                      </span>
                      <span className="mt-1 block text-sm text-white">
                        {slot.label}
                      </span>
                    </button>
                  ))}
              </div>

              <div className="font-hud-sans rounded-full border border-white/22 bg-[linear-gradient(135deg,rgba(18,28,48,0.84),rgba(58,31,76,0.8)_54%,rgba(22,80,90,0.76)_100%)] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-pink-50/86 shadow-[0_16px_44px_rgba(4,12,22,0.32)]">
                {equippedItem === "gun"
                  ? "Q bırak / Tekerlek / 1-2 geçiş"
                  : "M metin / Esc duraklat"}
              </div>
            </div>
          ) : null}

          {introPhase === "playing" &&
          !collapseActive &&
          !externallyFrozen &&
          promptText &&
          !paused ? (
            <div className="font-hud-sans self-start rounded-full border border-white/26 bg-[linear-gradient(135deg,rgba(19,31,53,0.84),rgba(28,95,109,0.78)_52%,rgba(72,53,102,0.76)_100%)] px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-50/88 shadow-[0_16px_42px_rgba(4,12,22,0.3)]">
              {interactionMenuOpen ? "Seçenekler açık" : promptText}
            </div>
          ) : null}

          {introPhase === "playing" &&
          !collapseActive &&
          !externallyFrozen &&
          objectiveText ? (
            <div className="font-hud-sans self-start rounded-full border border-white/26 bg-[linear-gradient(135deg,rgba(255,164,196,0.3),rgba(255,216,134,0.26)_48%,rgba(126,226,255,0.2)_100%)] px-4 py-2 text-xs uppercase tracking-[0.24em] text-amber-50/92 shadow-[0_16px_42px_rgba(190,24,93,0.18)]">
              {objectiveText}
            </div>
          ) : null}

          {interactionMenuOpen &&
          !collapseActive &&
          !externallyFrozen &&
          menuOptions.length > 0 ? (
            <div className="hud-panel font-hud-sans w-full rounded-[2.1rem] border border-white/34 bg-[linear-gradient(145deg,rgba(255,250,241,0.92),rgba(232,247,255,0.82)_44%,rgba(249,234,255,0.8)_100%)] p-4 text-slate-950 shadow-[0_26px_82px_rgba(4,12,22,0.26)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.32em] text-fuchsia-950/58">
                  {promptLabel}
                </p>
                <p className="text-[11px] uppercase tracking-[0.28em] text-sky-950/48">
                  Tekerlekle gezin / E ile seç / Esc ile çık
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {menuOptions.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      "font-hud-sans rounded-[1.6rem] border px-4 py-4 text-left text-sm transition duration-200",
                      interactionMenuIndex === index
                        ? "border-white/54 bg-[linear-gradient(135deg,rgba(255,171,203,0.92),rgba(255,220,140,0.94)_52%,rgba(140,230,255,0.84)_100%)] text-slate-950 shadow-[0_0_34px_rgba(244,114,182,0.16)]"
                        : "border-sky-950/10 bg-white/56 text-slate-900 hover:bg-white/76",
                    ].join(" ")}
                    onMouseEnter={() => setInteractionMenuIndex(index)}
                    onClick={() => {
                      setInteractionMenuIndex(index);
                      option.onSelect();
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>

      {transcriptMount ? createPortal(transcriptPanel, transcriptMount) : null}
    </>
  );
}
