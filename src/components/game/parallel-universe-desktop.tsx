"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { GameShell } from "@/components/game/game-shell";
import { shouldExposeLocalDebug } from "@/components/game/local-debug";
import type { ParallelBranchRequest } from "@/components/game/parallel-branching";
import {
  cleanupStaleParallelBranches,
  createStoredParallelBranch,
  emitParallelSignal,
  getParallelSignalStorageKey,
  parseParallelSignal,
  readStoredParallelBranch,
  removeStoredParallelBranch,
  type StoredParallelBranch,
} from "@/components/game/parallel-window-storage";
import { useGameStore } from "@/components/game/game-store";

type ParallelUniverseDesktopProps = {
  initialBranchId: string | null;
};

type ChildBranchWindow = {
  id: string;
  popup: Window | null;
  preview: string | null;
  status: "pending" | "open";
  title: string;
  url: string;
};

type BranchBootState = "booting" | "missing" | "ready";

function getBranchWindowFeatures() {
  const width = Math.round(Math.min(Math.max(window.outerWidth * 0.74, 920), 1240));
  const height = Math.round(
    Math.min(Math.max(window.outerHeight * 0.78, 660), 860),
  );
  const left = Math.max(
    24,
    Math.round(window.screenX + (window.outerWidth - width) / 2 + 28),
  );
  const top = Math.max(
    24,
    Math.round(window.screenY + (window.outerHeight - height) / 2 + 24),
  );

  return [
    "popup=yes",
    "toolbar=no",
    "menubar=no",
    "location=yes",
    "status=no",
    "scrollbars=yes",
    "resizable=yes",
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
  ].join(",");
}

function paintBranchLoadingState(popup: Window) {
  try {
    popup.document.title = "Choices | Paralel Pencere";
    popup.document.body.innerHTML = `
      <main style="margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:
        radial-gradient(circle at top left, rgba(255,163,198,.28), transparent 24%),
        radial-gradient(circle at top right, rgba(126,226,255,.24), transparent 22%),
        radial-gradient(circle at bottom, rgba(198,255,148,.18), transparent 20%),
        #07101a;color:#f8fbff;font-family:Geist,system-ui,sans-serif;">
        <section style="max-width:480px;border:1px solid rgba(255,255,255,.2);border-radius:28px;padding:28px 30px;
          background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.06));
          box-shadow:0 28px 100px rgba(4,12,22,.36);backdrop-filter:blur(18px);">
          <p style="margin:0 0 12px;font-size:11px;letter-spacing:.34em;text-transform:uppercase;opacity:.74;">Parallel Window</p>
          <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;">Yeni pencere hazirlaniyor</h1>
          <p style="margin:0;font-size:15px;line-height:1.75;opacity:.84;">
            Buyuk karar kendi evrenine ayriliyor. Yukleme tamamlaninca oyun bu yeni pencerede devam edecek.
          </p>
        </section>
      </main>
    `;
  } catch {
    // Some browsers restrict painting a just-opened window for a brief moment.
  }
}

export function ParallelUniverseDesktop({
  initialBranchId,
}: ParallelUniverseDesktopProps) {
  const isBranchWindow = initialBranchId !== null;
  const [bootState, setBootState] = useState<BranchBootState>(
    isBranchWindow ? "booting" : "ready",
  );
  const [activeUniverse, setActiveUniverse] = useState({
    id: initialBranchId ?? "main",
    title: isBranchWindow ? "Paralel Evren" : "Ana Evren",
  });
  const [childBranch, setChildBranch] = useState<ChildBranchWindow | null>(null);
  const [popupError, setPopupError] = useState<string | null>(null);
  const captureRef = useRef<() => string | null>(() => null);
  const activeBranchRef = useRef<StoredParallelBranch | null>(null);
  const childBranchRef = useRef<ChildBranchWindow | null>(null);

  useEffect(() => {
    childBranchRef.current = childBranch;
  }, [childBranch]);

  useEffect(() => {
    cleanupStaleParallelBranches();
  }, []);

  const returnToParentUniverse = useCallback(
    (parentId: string | null) => {
      const nextUrl = new URL(window.location.href);

      if (parentId) {
        nextUrl.searchParams.set("branch", parentId);
      } else {
        nextUrl.searchParams.delete("branch");
      }

      window.location.assign(nextUrl.toString());
    },
    [],
  );

  useEffect(() => {
    if (!initialBranchId) {
      activeBranchRef.current = null;
      return;
    }

    const syncTimeout = window.setTimeout(() => {
      const storedBranch = readStoredParallelBranch(initialBranchId);
      if (!storedBranch) {
        setBootState("missing");
        return;
      }

      activeBranchRef.current = storedBranch;
      useGameStore.getState().loadSnapshot(storedBranch.snapshot);
      setActiveUniverse({
        id: storedBranch.id,
        title: storedBranch.title,
      });
      setBootState("ready");
      emitParallelSignal({
        id: storedBranch.id,
        parentId: storedBranch.parentId,
        ts: Date.now(),
        type: "opened",
      });
    }, 0);

    return () => {
      window.clearTimeout(syncTimeout);
    };
  }, [initialBranchId]);

  useEffect(() => {
    if (!initialBranchId) {
      return;
    }

    const handlePageHide = () => {
      const branchMeta = activeBranchRef.current;
      const nestedChild = childBranchRef.current;

      if (nestedChild?.popup && !nestedChild.popup.closed) {
        try {
          nestedChild.popup.close();
        } catch {
          // Some browsers can ignore close attempts during page teardown.
        }
      }

      if (!branchMeta) {
        return;
      }

      emitParallelSignal({
        id: branchMeta.id,
        parentId: branchMeta.parentId,
        ts: Date.now(),
        type: "closed",
      });
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [initialBranchId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== getParallelSignalStorageKey()) {
        return;
      }

      const signal = parseParallelSignal(event.newValue);
      if (!signal) {
        return;
      }

      if (childBranchRef.current?.id === signal.id) {
        if (signal.type === "opened") {
          setChildBranch((currentBranch) =>
            currentBranch && currentBranch.id === signal.id
              ? {
                  ...currentBranch,
                  status: "open",
                }
              : currentBranch,
          );
          setPopupError(null);
          return;
        }

        removeStoredParallelBranch(signal.id);
        setChildBranch(null);
        return;
      }

      const activeBranch = activeBranchRef.current;
      if (
        signal.type === "closed" &&
        activeBranch &&
        activeBranch.parentId === signal.id
      ) {
        returnToParentUniverse(signal.parentId);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [returnToParentUniverse]);

  useEffect(() => {
    if (!childBranch?.popup) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!childBranch.popup || !childBranch.popup.closed) {
        return;
      }

      emitParallelSignal({
        id: childBranch.id,
        parentId: initialBranchId,
        ts: Date.now(),
        type: "closed",
      });
      removeStoredParallelBranch(childBranch.id);
      setChildBranch(null);
    }, 450);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [childBranch, initialBranchId]);

  useEffect(() => {
    if (!childBranch || childBranch.status !== "pending") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (childBranchRef.current?.id !== childBranch.id) {
        return;
      }

      setPopupError(
        "Yeni dal penceresi beklenenden uzun suruyor. Acik pencereyi kontrol et veya ayni dali yeniden ac.",
      );
    }, 9000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [childBranch]);

  const handleRegisterCapture = useCallback((capture: () => string | null) => {
    captureRef.current = capture;
  }, []);

  const prepareBranchWindow = useCallback(() => {
    try {
      const popup = window.open(
        "",
        `choices-parallel-${Date.now()}`,
        getBranchWindowFeatures(),
      );
      if (!popup) {
        return null;
      }

      paintBranchLoadingState(popup);
      return popup;
    } catch {
      return null;
    }
  }, []);

  const openBranchInWindow = useCallback(
    (branchUrl: string, existingPopup?: Window | null) => {
      const popup = existingPopup ?? prepareBranchWindow();
      if (!popup) {
        setPopupError(
          "Yeni pencere acilamadi. Tarayici popup iznini kontrol edip tekrar dene.",
        );
        return null;
      }

      try {
        popup.location.replace(branchUrl);
        popup.focus();
        return popup;
      } catch {
        try {
          popup.close();
        } catch {
          // Ignore close failures and retry with a direct open.
        }

        try {
          return window.open(
            branchUrl,
            `choices-parallel-${Date.now()}`,
            getBranchWindowFeatures(),
          );
        } catch {
          setPopupError(
            "Yeni pencere acilamadi. Tarayici popup iznini kontrol edip tekrar dene.",
          );
          return null;
        }
      }
    },
    [prepareBranchWindow],
  );

  const handleOpenParallelBranch = useCallback(
    (request: ParallelBranchRequest) => {
      if (childBranchRef.current) {
        setPopupError(
          "Bu evrende zaten hazirlanan bir dal penceresi var. Once onu ac ya da kapat.",
        );
        return;
      }

      setPopupError(null);
      const popup = prepareBranchWindow();

      if (!popup) {
        setPopupError(
          "Yeni pencere acilamadi. Tarayici popup iznini kontrol edip tekrar dene.",
        );
        return;
      }

      try {
        const currentSnapshot = useGameStore.getState().getSnapshot();
        const preview = captureRef.current();
        const { branchUrl, storedBranch } = createStoredParallelBranch(
          currentSnapshot,
          request,
          {
            currentBranchId: initialBranchId,
            currentTitle: activeUniverse.title,
          },
        );
        const branchPopup = openBranchInWindow(branchUrl, popup);

        setChildBranch({
          id: storedBranch.id,
          popup: branchPopup,
          preview,
          status: "pending",
          title: storedBranch.title,
          url: branchUrl,
        });
      } catch {
        try {
          popup.close();
        } catch {
          // Ignore close failures.
        }
        setPopupError(
          "Paralel pencere hazirlanirken bir sorun olustu. Sayfayi yenileyip tekrar dene.",
        );
      }
    },
    [activeUniverse.title, initialBranchId, openBranchInWindow, prepareBranchWindow],
  );

  useEffect(() => {
    if (!shouldExposeLocalDebug()) {
      return;
    }

    (
      window as typeof window & {
        __choicesParallelDebug?: {
          openBranch: (request: ParallelBranchRequest) => void;
        };
      }
    ).__choicesParallelDebug = {
      openBranch: (request) => {
        handleOpenParallelBranch(request);
      },
    };
  }, [handleOpenParallelBranch]);

  const handleCloseParallelBranch = useCallback(() => {
    if (!initialBranchId) {
      return;
    }

    const activeBranch = activeBranchRef.current;
    const nestedChild = childBranchRef.current;

    if (nestedChild?.popup && !nestedChild.popup.closed) {
      try {
        nestedChild.popup.close();
      } catch {
        // Some browsers may ignore close attempts.
      }
    }

    emitParallelSignal({
      id: initialBranchId,
      parentId: activeBranch?.parentId ?? null,
      ts: Date.now(),
      type: "closed",
    });
    removeStoredParallelBranch(initialBranchId);

    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus();
      } catch {
        // Cross-window focus can fail silently.
      }
      window.close();
      window.setTimeout(() => {
        if (!window.closed) {
          returnToParentUniverse(activeBranch?.parentId ?? null);
        }
      }, 120);
      return;
    }

    returnToParentUniverse(activeBranch?.parentId ?? null);
  }, [initialBranchId, returnToParentUniverse]);

  const handleFocusChildWindow = useCallback(() => {
    if (!childBranch) {
      return;
    }

    if (childBranch.popup) {
      try {
        childBranch.popup.focus();
        return;
      } catch {
        // Ignore focus failures and try a direct open below.
      }
    }

    openBranchInWindow(childBranch.url);
  }, [childBranch, openBranchInWindow]);

  const handleDismissPendingBranch = useCallback(() => {
    const pendingBranch = childBranchRef.current;
    if (!pendingBranch) {
      return;
    }

    removeStoredParallelBranch(pendingBranch.id);
    setChildBranch(null);
    setPopupError(null);
  }, []);

  const childBadgeText = useMemo(() => {
    if (childBranch) {
      return childBranch.status === "open"
        ? "Pencere Acik"
        : "Pencere Hazirlaniyor";
    }

    return isBranchWindow ? "Canli Dal" : "Ana Akis";
  }, [childBranch, isBranchWindow]);

  if (bootState === "booting") {
    return (
      <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,153,196,0.2),transparent_26%),radial-gradient(circle_at_top_right,rgba(126,226,255,0.22),transparent_24%),rgba(4,7,16,0.92)] px-6 text-white">
        <div className="hud-panel font-hud-sans w-full max-w-xl rounded-[2.2rem] border border-white/40 bg-[linear-gradient(140deg,rgba(255,250,240,0.88),rgba(232,246,255,0.76)_42%,rgba(247,230,255,0.72)_100%)] p-8 text-center text-slate-950 shadow-[0_20px_90px_rgba(15,23,42,0.26)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-fuchsia-950/56">
            Paralel Evren
          </p>
          <h1 className="font-hud-display mt-3 text-2xl font-semibold text-slate-950">
            Yeni pencere yukleniyor
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-800/82">
            Bu dal kendi snapshot&apos;i ile ayaga kalkiyor. Yukleme bitince secimin
            actigi evren kaldigi noktadan devam edecek.
          </p>
        </div>
      </div>
    );
  }

  if (bootState === "missing") {
    return (
      <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,153,196,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(126,226,255,0.18),transparent_22%),rgba(4,7,16,0.92)] px-6 text-white">
        <div className="hud-panel font-hud-sans w-full max-w-xl rounded-[2.2rem] border border-rose-300/28 bg-[linear-gradient(140deg,rgba(255,249,244,0.9),rgba(255,235,239,0.8)_44%,rgba(243,234,255,0.72)_100%)] p-8 text-slate-950 shadow-[0_20px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-rose-950/58">
            Paralel Evren Eksik
          </p>
          <h1 className="font-hud-display mt-3 text-2xl font-semibold text-slate-950">
            Bu pencerenin snapshot&apos;i bulunamadi
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-800/82">
            Dal kaydi silinmis veya tarayici pencereyi snapshot olusmadan once
            yenilemis olabilir. Yeni bir buyuk karar verdiginde pencere yeniden
            sorunsuz acilacak.
          </p>
          <button
            type="button"
            className="mt-7 font-hud-sans rounded-full border border-sky-950/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(220,245,255,0.74))] px-5 py-2.5 text-sm text-slate-950 transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(206,237,255,0.82))]"
            onClick={() => {
              returnToParentUniverse(activeBranchRef.current?.parentId ?? null);
            }}
          >
            Ana evrene don
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,153,196,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(126,226,255,0.22),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(202,255,148,0.14),transparent_22%),linear-gradient(180deg,#010308_0%,#05070c_100%)] text-white">
      {childBranch?.preview ? (
        <div
          aria-label={childBranch.title}
          className="absolute inset-0 bg-cover bg-center opacity-22 blur-[3px]"
          style={{ backgroundImage: `url(${childBranch.preview})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,7,0.12)_0%,rgba(2,4,7,0.78)_100%)]" />

      <div
        className="absolute z-20 flex min-h-0 flex-col overflow-hidden rounded-[2.3rem] border border-white/20 bg-[linear-gradient(180deg,rgba(8,12,24,0.76)_0%,rgba(13,18,33,0.68)_100%)] shadow-[0_34px_130px_rgba(4,12,22,0.42)] backdrop-blur-sm"
        style={{ inset: "0.75rem" }}
      >
        <div className="flex items-center justify-between border-b border-white/12 bg-[linear-gradient(90deg,rgba(15,21,42,0.94),rgba(32,22,51,0.92),rgba(20,60,76,0.88))] px-5 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff8cab] shadow-[0_0_12px_rgba(255,140,171,0.46)]" />
              <span className="h-3 w-3 rounded-full bg-[#ffd98a] shadow-[0_0_12px_rgba(255,217,138,0.42)]" />
              <span className="h-3 w-3 rounded-full bg-[#98f0a8] shadow-[0_0_12px_rgba(152,240,168,0.4)]" />
            </div>
            <div>
              <p className="font-hud-sans text-[11px] uppercase tracking-[0.34em] text-pink-100/66">
                {isBranchWindow ? "Paralel Evren" : "Kok Evren"}
              </p>
              <h1 className="font-hud-display mt-1 text-base font-semibold text-white sm:text-lg">
                {activeUniverse.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-hud-sans text-[11px] uppercase tracking-[0.34em] text-pink-100/66">
              Ayrilabilir Pencere
            </p>
            {childBranch ? (
              <button
                type="button"
                className="hidden font-hud-sans rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white transition hover:-translate-y-0.5 hover:bg-white/16 sm:inline-flex"
                onClick={handleFocusChildWindow}
              >
                Pencereyi odaga al
              </button>
            ) : null}
            <span className="font-hud-sans rounded-full border border-pink-100/24 bg-[linear-gradient(135deg,rgba(255,166,194,0.22),rgba(126,226,255,0.18))] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-pink-50">
              {childBadgeText}
            </span>
          </div>
        </div>

        <div className="min-h-0 w-full" style={{ flex: 1 }}>
          <GameShell
            key={activeUniverse.id}
            canCloseParallel={isBranchWindow}
            externallyFrozen={childBranch?.status === "open"}
            freezeLabel={childBranch?.status === "open" ? childBranch.title : null}
            onCloseParallel={handleCloseParallelBranch}
            onOpenParallelBranch={handleOpenParallelBranch}
            onRegisterCapture={handleRegisterCapture}
          />
        </div>
      </div>

      {childBranch ? (
        <aside className="pointer-events-none absolute right-4 top-4 z-30 flex w-[320px] flex-col gap-3">
          <div className="hud-panel overflow-hidden rounded-[1.7rem] border border-white/18 bg-[linear-gradient(155deg,rgba(12,16,34,0.9),rgba(33,22,54,0.82)_58%,rgba(18,45,63,0.78)_100%)] shadow-[0_20px_80px_rgba(15,23,42,0.34)] backdrop-blur-xl">
            {childBranch.preview ? (
              <div
                aria-label={childBranch.title}
                className="h-36 w-full bg-cover bg-center opacity-78"
                style={{ backgroundImage: `url(${childBranch.preview})` }}
              />
            ) : (
              <div className="h-36 w-full bg-[linear-gradient(135deg,#0a1018_0%,#151d28_100%)]" />
            )}
            <div className="border-t border-white/8 p-4">
              <p className="font-hud-sans text-[10px] uppercase tracking-[0.28em] text-pink-100/64">
                {childBranch.status === "open"
                  ? "Acik Paralel Pencere"
                  : "Paralel Pencere Hazirlaniyor"}
              </p>
              <p className="font-hud-display mt-2 text-base text-white">{childBranch.title}</p>
              <p className="font-hud-sans mt-2 text-sm leading-6 text-slate-200/78">
                {childBranch.status === "open"
                  ? "Bu pencere askida. Dal penceresi kapaninca oyun burada kaldigi yerden devam edecek."
                  : "Yeni pencere yukleniyor. Dal acilir acilmaz akisi oradan surdureceksin; bu pencere ancak o anda askiya alinacak."}
              </p>
            </div>
          </div>
        </aside>
      ) : null}

      {popupError ? (
        <div className="hud-panel absolute bottom-5 left-1/2 z-40 w-[min(92vw,560px)] -translate-x-1/2 rounded-[1.7rem] border border-white/26 bg-[linear-gradient(145deg,rgba(255,249,239,0.9),rgba(232,246,255,0.78)_48%,rgba(247,230,255,0.74)_100%)] px-5 py-4 text-sm text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <p className="font-hud-sans text-[10px] uppercase tracking-[0.28em] text-fuchsia-950/56">
            Dal Penceresi Bekliyor
          </p>
          <p className="font-hud-sans mt-2 leading-6 text-slate-800/84">{popupError}</p>
          {childBranch ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="font-hud-sans rounded-full border border-rose-200/45 bg-[linear-gradient(135deg,rgba(255,153,196,0.9),rgba(255,215,126,0.92))] px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-950 transition hover:-translate-y-0.5"
                onClick={handleFocusChildWindow}
              >
                Pencereyi yeniden ac
              </button>
              <button
                type="button"
                className="font-hud-sans rounded-full border border-sky-950/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(220,245,255,0.72))] px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-950 transition hover:-translate-y-0.5"
                onClick={handleDismissPendingBranch}
              >
                Bu evrende kal
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
