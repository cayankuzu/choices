"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { createBranch, loadBranch, saveBranch } from "@/components/game/branch-storage";
import { playGameSound } from "@/components/game/game-audio";
import {
  ChoicePanel,
  DeathScreen,
  DialogueFeed,
  FrozenScreen,
  FullMap,
  GameHud,
  MainMenu,
  WakeOverlay,
  type ChoiceOption,
  type DialogueLine,
  type GameSettings,
} from "@/components/game/game-ui";
import {
  initialPlayerPose,
  initialSnapshot,
  type BulletImpact,
  type GameSnapshot,
  type InteractionId,
  type MajorChoice,
  type PlayerPose,
  type PlayerTelemetry,
  type StoryStage,
  type WeaponSlot,
} from "@/components/game/game-types";

const GameWorld = dynamic(
  () => import("@/components/game/game-world").then((module) => module.GameWorld),
  {
    loading: () => <div className="game-loading"><span /><p>Dünya kuruluyor…</p></div>,
    ssr: false,
  },
);

type BranchAction =
  | "coffee-drink"
  | "coffee-reject"
  | "door-cancel"
  | "door-give"
  | "gun-carry"
  | "gun-self"
  | "package-leave"
  | "package-take";

const defaultSettings: GameSettings = {
  filmGrain: true,
  sensitivity: 1,
  volume: 0.45,
};

const initialTelemetry: PlayerTelemetry = {
  ...initialPlayerPose,
  area: "Bizim ev · Stüdyo daire",
};

const interactionLabels: Record<Exclude<InteractionId, null>, string> = {
  bed: "Yatağı incele",
  car: "Arabaya bin",
  "car-exit": "Arabadan in",
  "garage-door": "Garaj kapısını aç",
  gun: "Tabancayı incele",
  honey: "Bal ye",
  jam: "Reçel ye",
  "neighbor-door": "Kapıyı çal",
  package: "Paketi incele",
};

const actionChoice: Record<BranchAction, Exclude<MajorChoice, null>> = {
  "coffee-drink": "coffee",
  "coffee-reject": "coffee",
  "door-cancel": "door",
  "door-give": "door",
  "gun-carry": "gun",
  "gun-self": "gun",
  "package-leave": "package",
  "package-take": "package",
};

const branchTitles: Record<BranchAction, string> = {
  "coffee-drink": "Kahveyi kabul ettin",
  "coffee-reject": "Kahveyi reddettin",
  "door-cancel": "Kapıdan vazgeçtin",
  "door-give": "Paketi teslim ettin",
  "gun-carry": "Silahı yanına aldın",
  "gun-self": "Silahı kendine çevirdin",
  "package-leave": "Paketi bıraktın",
  "package-take": "Paketi yanına aldın",
};

const randomActions: Record<Exclude<MajorChoice, null>, [BranchAction, BranchAction]> = {
  coffee: ["coffee-drink", "coffee-reject"],
  door: ["door-give", "door-cancel"],
  gun: ["gun-self", "gun-carry"],
  package: ["package-take", "package-leave"],
};

const choiceTitles: Record<Exclude<MajorChoice, null>, string> = {
  coffee: "Bir kahve içer misin?",
  door: "Kapının arkasında bir hayat var.",
  gun: "Silah masada.",
  package: "Paket kapının önünde.",
};

const choiceOptions: Record<Exclude<MajorChoice, null>, Array<ChoiceOption<BranchAction>>> = {
  coffee: [
    { action: "coffee-drink", detail: "Ayakta bir fincan paylaş.", label: "Kahve iç" },
    { action: "coffee-reject", detail: "Teşekkür et ve yoluna devam et.", label: "Reddet" },
  ],
  door: [
    { action: "door-give", detail: "Kutuyu Nihat Bey'e teslim et.", label: "Kutuyu ver" },
    { action: "door-cancel", detail: "Paket sende kalsın.", label: "Vazgeç" },
  ],
  gun: [
    { action: "gun-self", detail: "Bu evren burada sona erer.", label: "Kafana sık", tone: "danger" },
    { action: "gun-carry", detail: "Silah envantere eklenir.", label: "Yanına al" },
  ],
  package: [
    { action: "package-take", detail: "Kutu envanterine eklenir.", label: "Yanına al" },
    { action: "package-leave", detail: "Kutuyu olduğu yerde bırak.", label: "Bırak" },
  ],
};

function poseFromTelemetry(telemetry: PlayerTelemetry): PlayerPose {
  return {
    heading: telemetry.heading,
    pitch: telemetry.pitch,
    x: telemetry.x,
    y: telemetry.y,
    z: telemetry.z,
  };
}

function snapshotForAction(
  action: BranchAction,
  current: GameSnapshot,
  player: PlayerPose,
): GameSnapshot {
  const continued: GameSnapshot = {
    ...current,
    carPose: current.inCar ? player : current.carPose,
    player,
  };

  switch (action) {
    case "gun-carry":
      return { ...continued, bullets: 6, gunState: "carried", magazines: 6, playerDead: false, selectedSlot: 2 };
    case "gun-self":
      return { ...continued, gunState: "used", playerDead: true, selectedSlot: 1 };
    case "package-take":
      return { ...continued, packageDeadlineAt: Date.now() + 180_000, packageState: "carried" };
    case "package-leave":
      return { ...continued, packageDeadlineAt: null, packageState: "left" };
    case "door-give":
      return {
        ...continued,
        neighborDoorOpen: true,
        packageDeadlineAt: null,
        packageState: "delivered",
        storyStage: "delivery",
      };
    case "door-cancel":
      return { ...continued, storyStage: "free" };
    case "coffee-drink":
      return { ...continued, coffeeAccepted: true, storyStage: "coffee-drink" };
    case "coffee-reject":
      return { ...continued, coffeeAccepted: false, storyStage: "coffee-reject" };
  }
}

export function GameShell({ initialBranchId }: { initialBranchId: string | null }) {
  const [branchReady, setBranchReady] = useState(!initialBranchId);
  const [branchTitle, setBranchTitle] = useState<string | null>(null);
  const [choice, setChoice] = useState<MajorChoice>(null);
  const [choiceSeconds, setChoiceSeconds] = useState(13);
  const [cinematicActive, setCinematicActive] = useState(false);
  const [cinematicProgress, setCinematicProgress] = useState(0);
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [frozen, setFrozen] = useState(false);
  const [interaction, setInteraction] = useState<InteractionId>(null);
  const [locked, setLocked] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuPanel, setMenuPanel] = useState<"controls" | "settings" | null>(null);
  const [pendingBranchUrl, setPendingBranchUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [shotTick, setShotTick] = useState(0);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [started, setStarted] = useState(Boolean(initialBranchId));
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [toast, setToast] = useState<string | null>(null);
  const [wakeStartedAt, setWakeStartedAt] = useState<number | null>(null);

  const childWatchRef = useRef<number | null>(null);
  const choiceDeadlineRef = useRef(0);
  const cinematicRunRef = useRef<StoryStage | null>(null);
  const dialogueIdRef = useRef(0);
  const freezeStartedAtRef = useRef(0);
  const frozenChoiceRef = useRef<Exclude<MajorChoice, null> | null>(null);
  const interactionHandlerRef = useRef<(target: Exclude<InteractionId, null>) => void>(() => undefined);
  const reservedTabRef = useRef<Window | null>(null);
  const settingsRef = useRef(settings);
  const snapshotRef = useRef(snapshot);
  const telemetryRef = useRef(telemetry);
  const toastTimerRef = useRef<number | null>(null);
  const wakeTimerRef = useRef<number | null>(null);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { snapshotRef.current = snapshot; }, [snapshot]);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3_500);
  }, []);

  const addDialogue = useCallback((speaker: DialogueLine["speaker"], text: string) => {
    dialogueIdRef.current += 1;
    const line: DialogueLine = { id: dialogueIdRef.current, speaker, text };
    setDialogueLines((current) => [...current.slice(-3), line]);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem("intihab-settings:v1");
        if (stored) setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        // Varsayılan ayarlar kullanılmaya devam eder.
      }
      setSettingsReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    localStorage.setItem("intihab-settings:v1", JSON.stringify(settings));
  }, [settings, settingsReady]);

  useEffect(() => {
    if (!initialBranchId) return;
    const timer = window.setTimeout(() => {
      const branch = loadBranch(initialBranchId);
      if (branch) {
        setSnapshot(branch.snapshot);
        setTelemetry({ ...branch.snapshot.player, area: "Kapının önü" });
        telemetryRef.current = { ...branch.snapshot.player, area: "Kapının önü" };
        setBranchTitle(branch.title);
      } else {
        setStarted(false);
        showToast("Bu evren bulunamadı. Ana dünyaya dönüldü.");
      }
      setBranchReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialBranchId, showToast]);

  useEffect(() => {
    if (!initialBranchId || !branchReady) return;
    const timer = window.setTimeout(() => saveBranch(initialBranchId, snapshot), 0);
    return () => window.clearTimeout(timer);
  }, [branchReady, initialBranchId, snapshot]);

  const reserveChoiceTab = useCallback(() => {
    if (reservedTabRef.current && !reservedTabRef.current.closed) return;
    const tab = window.open("about:blank", "_blank");
    if (!tab) return;
    tab.document.title = "İntihab · Seçim bekleniyor";
    tab.document.body.style.cssText =
      "margin:0;display:grid;place-items:center;min-height:100vh;background:#0d1211;color:#d7c49a;font:600 12px Arial;letter-spacing:.14em;text-transform:uppercase";
    tab.document.body.textContent = "Kararın bekleniyor…";
    reservedTabRef.current = tab;
    tab.blur();
    window.focus();
  }, []);

  const openChoice = useCallback((nextChoice: Exclude<MajorChoice, null>) => {
    document.exitPointerLock?.();
    choiceDeadlineRef.current = Date.now() + 13_000;
    setChoiceSeconds(13);
    setChoice(nextChoice);
    setMapOpen(false);
    playGameSound("choice", settingsRef.current.volume);
  }, []);

  const restoreParentChoice = useCallback((originChoice: Exclude<MajorChoice, null>) => {
    const frozenFor = Date.now() - freezeStartedAtRef.current;
    setSnapshot((current) => ({
      ...current,
      packageDeadlineAt: current.packageDeadlineAt ? current.packageDeadlineAt + frozenFor : null,
    }));
    setFrozen(false);
    setPendingBranchUrl(null);
    openChoice(originChoice);
  }, [openChoice]);

  const commitMajorChoice = useCallback((action: BranchAction, useCurrentTabFallback = false) => {
    const originChoice = actionChoice[action];
    const nextSnapshot = snapshotForAction(action, snapshotRef.current, poseFromTelemetry(telemetryRef.current));
    const branch = createBranch(nextSnapshot, branchTitles[action], initialBranchId, originChoice);
    const branchUrl = new URL(window.location.href);
    branchUrl.searchParams.set("branch", branch.id);

    let child: Window | null = null;
    if (reservedTabRef.current && !reservedTabRef.current.closed) {
      child = reservedTabRef.current;
      child.location.replace(branchUrl.toString());
      reservedTabRef.current = null;
    } else {
      child = window.open(branchUrl.toString(), "_blank");
    }

    if (!child) {
      if (useCurrentTabFallback) {
        window.location.assign(branchUrl.toString());
        return;
      }
      setPendingBranchUrl(branchUrl.toString());
      showToast("Yeni sekme engellendi. Seçeneğe yeniden tıkla.");
      return;
    }

    document.exitPointerLock?.();
    frozenChoiceRef.current = originChoice;
    freezeStartedAtRef.current = Date.now();
    setChoice(null);
    setFrozen(true);
    playGameSound("choice", settingsRef.current.volume);
    child.focus();

    if (childWatchRef.current) window.clearInterval(childWatchRef.current);
    childWatchRef.current = window.setInterval(() => {
      if (!child.closed) return;
      if (childWatchRef.current) window.clearInterval(childWatchRef.current);
      childWatchRef.current = null;
      const previousChoice = frozenChoiceRef.current;
      frozenChoiceRef.current = null;
      if (previousChoice) restoreParentChoice(previousChoice);
    }, 400);
  }, [initialBranchId, restoreParentChoice, showToast]);

  useEffect(() => {
    if (!choice) return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((choiceDeadlineRef.current - Date.now()) / 1_000));
      setChoiceSeconds(seconds);
      if (Date.now() < choiceDeadlineRef.current) return;
      window.clearInterval(timer);
      const actions = randomActions[choice];
      commitMajorChoice(actions[Math.random() < 0.5 ? 0 : 1], true);
    }, 160);
    return () => window.clearInterval(timer);
  }, [choice, commitMajorChoice]);

  useEffect(() => {
    if (frozen || snapshot.packageState !== "carried" || !snapshot.packageDeadlineAt) return;
    const timer = window.setTimeout(() => {
      setSnapshot((current) => {
        if (!current.packageDeadlineAt || current.packageState !== "carried" || Date.now() < current.packageDeadlineAt) return current;
        return { ...current, elderAlive: false, neighborDoorOpen: false, packageDeadlineAt: null };
      });
    }, Math.max(0, snapshot.packageDeadlineAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [frozen, snapshot.packageDeadlineAt, snapshot.packageState]);

  useEffect(() => {
    if (!branchReady || !started) return;
    const stage = snapshot.storyStage;
    if (stage === "coffee-offer") {
      const timer = window.setTimeout(() => {
        if (!choice && !frozen) openChoice("coffee");
      }, 0);
      return () => window.clearTimeout(timer);
    }
    if (stage !== "delivery" && stage !== "coffee-drink" && stage !== "coffee-reject") return;
    if (cinematicRunRef.current === stage) return;
    cinematicRunRef.current = stage;
    if (stage === "coffee-drink") playGameSound("coffee", settingsRef.current.volume);
    setCinematicActive(true);
    setCinematicProgress(0);
    setDialogueLines([]);
    document.exitPointerLock?.();

    const sequences: Record<Exclude<StoryStage, "free" | "coffee-offer" | "complete">, {
      duration: number;
      lines: Array<[number, DialogueLine["speaker"], string]>;
    }> = {
      delivery: {
        duration: 11_800,
        lines: [
          [500, "Nihat Bey", "Teşekkür ederim, ben de ilaçlarım ne zaman gelecek diye düşünüyordum."],
          [2_400, "Sen", "Rica ederim, ne demek."],
          [3_800, "Nihat Bey", "Ne yapacaksın bugün?"],
          [5_600, "Sen", "Öyle dolaşmaya çıktım. Belki yemek yerim."],
          [7_500, "Nihat Bey", "Şu yeni açılan Son Akşam Yemeği'nde yeme de! Hahaha."],
          [9_600, "Sen", "Aslında güzel fikir... Hahaha."],
          [10_900, "Nihat Bey", "Bir kahve içer misin?"],
        ],
      },
      "coffee-drink": {
        duration: 8_600,
        lines: [
          [400, "Sen", "Olur, bir kahve içerim."],
          [1_900, "Nihat Bey", "Ayakta içelim; dizlerim oturunca daha çok ağrıyor."],
          [4_000, "Nihat Bey", "Bazen bir fincan, bütün günün yönünü değiştirir."],
          [6_400, "Sen", "Bugün yön değiştirmeye alışıyorum."],
        ],
      },
      "coffee-reject": {
        duration: 4_200,
        lines: [
          [400, "Sen", "Teşekkür ederim, bugün almayayım."],
          [2_100, "Nihat Bey", "Canın sağ olsun. Yolun açık olsun."],
        ],
      },
    };

    const sequence = sequences[stage];
    const startedAt = Date.now();
    const timers = sequence.lines.map(([delay, speaker, text]) => window.setTimeout(() => addDialogue(speaker, text), delay));
    const progressTimer = window.setInterval(() => {
      setCinematicProgress(Math.min(1, (Date.now() - startedAt) / sequence.duration));
    }, 80);
    const finishTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer);
      setCinematicProgress(1);
      setCinematicActive(false);
      if (stage === "delivery") {
        setSnapshot((current) => ({ ...current, storyStage: "coffee-offer" }));
      } else {
        setSnapshot((current) => ({ ...current, storyStage: "complete" }));
        window.setTimeout(() => setDialogueLines([]), 2_400);
      }
    }, sequence.duration);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
    };
  }, [addDialogue, branchReady, choice, frozen, openChoice, snapshot.storyStage, started]);

  const handleStart = useCallback(() => {
    setMenuPanel(null);
    setStarted(true);
    const startedAt = Date.now();
    setWakeStartedAt(startedAt);
    document.querySelector<HTMLCanvasElement>(".game-world canvas")?.requestPointerLock();
    if (wakeTimerRef.current) window.clearTimeout(wakeTimerRef.current);
    wakeTimerRef.current = window.setTimeout(() => setWakeStartedAt(null), 3_650);
  }, []);

  const handlePlayerUpdate = useCallback((nextTelemetry: PlayerTelemetry) => {
    telemetryRef.current = nextTelemetry;
    setTelemetry(nextTelemetry);
  }, []);

  const handleInteract = useCallback((target: Exclude<InteractionId, null>) => {
    const current = snapshotRef.current;

    if (target === "gun") {
      openChoice("gun");
      return;
    }
    if (target === "package") {
      openChoice("package");
      return;
    }
    if (target === "honey" || target === "jam") {
      const key = target === "honey" ? "honeyServings" : "jamServings";
      if (current[key] <= 0) {
        showToast("Kavanoz boş.");
        return;
      }
      setSnapshot({ ...current, [key]: current[key] - 1 });
      showToast(`${target === "honey" ? "Bal" : "Reçel"} yedin. Kavanozda ${current[key] - 1} porsiyon kaldı.`);
      playGameSound("eat", settingsRef.current.volume);
      return;
    }
    if (target === "bed") {
      showToast("Yatak dağınık; sabah burada başladı.");
      return;
    }
    if (target === "garage-door") {
      setSnapshot({ ...current, garageOpen: true });
      showToast("Garaj kapısı yukarı doğru açıldı.");
      playGameSound("engine", settingsRef.current.volume);
      return;
    }
    if (target === "car") {
      setSnapshot({ ...current, inCar: true, player: poseFromTelemetry(telemetryRef.current), selectedSlot: 1 });
      showToast("Kontak çevrildi. E ile araçtan inebilirsin.");
      playGameSound("engine", settingsRef.current.volume);
      return;
    }
    if (target === "car-exit") {
      const pose = poseFromTelemetry(telemetryRef.current);
      setSnapshot({ ...current, carPose: pose, inCar: false, player: pose });
      showToast("Arabadan indin.");
      return;
    }

    const expired = current.packageState === "carried" && current.packageDeadlineAt !== null && Date.now() >= current.packageDeadlineAt;
    playGameSound("door", settingsRef.current.volume);
    if (!current.elderAlive || expired) {
      setSnapshot({ ...current, elderAlive: false, neighborDoorOpen: false, packageDeadlineAt: null });
      showToast("Kapıyı çaldın. İçeriden ses gelmiyor.");
      return;
    }
    if (current.packageState === "carried") {
      openChoice("door");
      return;
    }
    if (current.packageState === "delivered") {
      showToast("Kapı açık. Nihat Bey içeride.");
      return;
    }
    showToast("Kapıyı çaldın. Bir süre bekledin; açan olmadı.");
  }, [openChoice, showToast]);

  useEffect(() => { interactionHandlerRef.current = handleInteract; }, [handleInteract]);

  const handleFire = useCallback((impact: Omit<BulletImpact, "id"> | null) => {
    const current = snapshotRef.current;
    if (current.gunState !== "carried" || current.selectedSlot !== 2 || current.inCar || current.playerDead) return;
    if (current.bullets <= 0) {
      showToast("Şarjör boş. R ile değiştir.");
      return;
    }

    const bulletImpact: BulletImpact | null = impact ? { ...impact, id: crypto.randomUUID() } : null;
    const nextDamage = bulletImpact?.targetId
      ? { ...current.worldDamage, [bulletImpact.targetId]: (current.worldDamage[bulletImpact.targetId] ?? 0) + 1 }
      : current.worldDamage;
    setSnapshot({
      ...current,
      bulletImpacts: bulletImpact ? [...current.bulletImpacts.slice(-39), bulletImpact] : current.bulletImpacts,
      bullets: current.bullets - 1,
      worldDamage: nextDamage,
    });
    setShotTick((tick) => tick + 1);
    playGameSound("gun", settingsRef.current.volume);
  }, [showToast]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!started || frozen || snapshotRef.current.playerDead) return;

      if (event.code === "KeyM" && !event.repeat && !choice && !cinematicActive && wakeStartedAt === null) {
        document.exitPointerLock?.();
        setMapOpen((open) => !open);
        return;
      }
      if (event.code === "Escape" && mapOpen) {
        setMapOpen(false);
        return;
      }
      if (choice || cinematicActive || mapOpen || wakeStartedAt !== null) return;

      if (event.code === "KeyE" && !event.repeat && interaction) {
        const current = snapshotRef.current;
        const major = interaction === "gun" || interaction === "package" || (
          interaction === "neighbor-door" && current.elderAlive && current.packageState === "carried"
        );
        if (major) reserveChoiceTab();
        interactionHandlerRef.current(interaction);
        return;
      }
      if (event.code === "Digit1") setSnapshot((current) => ({ ...current, selectedSlot: 1 }));
      if (event.code === "Digit2" && snapshotRef.current.gunState === "carried" && !snapshotRef.current.inCar) {
        setSnapshot((current) => ({ ...current, selectedSlot: 2 }));
      }
      if (event.code === "KeyR") {
        const current = snapshotRef.current;
        if (current.gunState === "carried" && current.selectedSlot === 2 && current.bullets < 6 && current.magazines > 0) {
          setSnapshot({ ...current, bullets: 6, magazines: current.magazines - 1 });
          playGameSound("reload", settingsRef.current.volume);
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const current = snapshotRef.current;
      if (!started || frozen || choice || cinematicActive || mapOpen || current.playerDead || current.inCar || current.gunState !== "carried") return;
      event.preventDefault();
      const slot: WeaponSlot = current.selectedSlot === 1 ? 2 : 1;
      setSnapshot({ ...current, selectedSlot: slot });
    };

    window.addEventListener("keydown", handleKeyboard);
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [choice, cinematicActive, frozen, interaction, mapOpen, reserveChoiceTab, started, wakeStartedAt]);

  useEffect(() => () => {
    if (childWatchRef.current) window.clearInterval(childWatchRef.current);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    if (wakeTimerRef.current) window.clearTimeout(wakeTimerRef.current);
    if (reservedTabRef.current && !reservedTabRef.current.closed) reservedTabRef.current.close();
  }, []);

  const active =
    started &&
    branchReady &&
    !choice &&
    !cinematicActive &&
    !frozen &&
    !mapOpen &&
    !snapshot.playerDead &&
    wakeStartedAt === null;

  return (
    <main className="game-root">
      {branchReady ? (
        <section className="game-world" aria-label="İntihab birinci kişi oyun dünyası">
          <GameWorld
            active={active}
            cinematicProgress={cinematicProgress}
            lookSensitivity={settings.sensitivity}
            onFire={handleFire}
            onInteractionChange={setInteraction}
            onLockChange={setLocked}
            onPlayerUpdate={handlePlayerUpdate}
            shotTick={shotTick}
            snapshot={snapshot}
            wakeStartedAt={wakeStartedAt}
          />
        </section>
      ) : null}

      <div className="screen-grade" aria-hidden="true" />
      {settings.filmGrain ? <div className="film-grain" aria-hidden="true" /> : null}

      {!started ? (
        <MainMenu
          onClosePanel={() => setMenuPanel(null)}
          onOpenPanel={setMenuPanel}
          onSettingsChange={setSettings}
          onStart={handleStart}
          panel={menuPanel}
          settings={settings}
        />
      ) : null}

      {started && branchReady && !snapshot.playerDead && !frozen && !choice && !mapOpen ? (
        <GameHud
          interaction={cinematicActive || wakeStartedAt !== null ? null : interaction}
          interactionLabel={interaction ? interactionLabels[interaction] : null}
          locked={locked || cinematicActive || wakeStartedAt !== null}
          onLock={() => document.querySelector<HTMLCanvasElement>(".game-world canvas")?.requestPointerLock()}
          snapshot={snapshot}
          telemetry={telemetry}
          toast={toast}
        />
      ) : null}

      {wakeStartedAt !== null ? <WakeOverlay /> : null}
      {mapOpen ? <FullMap onClose={() => setMapOpen(false)} telemetry={telemetry} /> : null}
      <DialogueFeed lines={dialogueLines} />

      {choice ? (
        <ChoicePanel
          choice={choice}
          onSelect={commitMajorChoice}
          options={choiceOptions[choice]}
          pendingBranch={Boolean(pendingBranchUrl)}
          seconds={choiceSeconds}
          title={choiceTitles[choice]}
        />
      ) : null}

      {frozen ? <FrozenScreen /> : null}
      {snapshot.playerDead && branchReady ? <DeathScreen title={branchTitle} /> : null}
      {!branchReady ? <div className="branch-loading"><span /><p>Seçim anı yükleniyor…</p></div> : null}
      {cinematicActive ? <div className="cinematic-vignette" aria-hidden="true" /> : null}
    </main>
  );
}
