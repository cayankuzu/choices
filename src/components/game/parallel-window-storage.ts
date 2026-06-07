"use client";

import {
  createBranchSnapshot,
  type ParallelBranchRequest,
} from "@/components/game/parallel-branching";
import {
  cloneGameSnapshot,
  type GameSnapshot,
} from "@/components/game/game-store";

const storageKeyPrefix = "choices:parallel-branch:v2:";
const signalStorageKey = "choices:parallel-signal:v1";
const staleBranchAgeMs = 1000 * 60 * 60 * 12;

export type StoredParallelBranch = {
  childId: string | null;
  createdAt: number;
  id: string;
  parentId: string | null;
  snapshot: GameSnapshot;
  title: string;
};

export type ParallelSignal = {
  id: string;
  parentId: string | null;
  type: "opened" | "closed";
  ts: number;
};

export type ParallelBranchContext = {
  currentBranchId: string | null;
  currentTitle: string;
};

function createBranchId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `branch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStorageKey(branchId: string) {
  return `${storageKeyPrefix}${branchId}`;
}

function writeStoredParallelBranch(storedBranch: StoredParallelBranch) {
  window.localStorage.setItem(
    getStorageKey(storedBranch.id),
    JSON.stringify(storedBranch),
  );
}

function updateStoredParallelBranch(
  branchId: string,
  updater: (branch: StoredParallelBranch) => StoredParallelBranch,
) {
  const existingBranch = readStoredParallelBranch(branchId);
  if (!existingBranch) {
    return null;
  }

  const updatedBranch = updater(existingBranch);
  writeStoredParallelBranch(updatedBranch);
  return updatedBranch;
}

function createStoredCheckpoint(snapshot: GameSnapshot, title: string) {
  const checkpointId = createBranchId();
  const checkpoint: StoredParallelBranch = {
    childId: null,
    createdAt: Date.now(),
    id: checkpointId,
    parentId: null,
    snapshot: cloneGameSnapshot(snapshot),
    title,
  };

  writeStoredParallelBranch(checkpoint);
  return checkpoint;
}

function buildBranchUrl(branchId: string) {
  const branchUrl = new URL(window.location.href);
  branchUrl.searchParams.set("branch", branchId);
  return branchUrl.toString();
}

export function getParallelSignalStorageKey() {
  return signalStorageKey;
}

export function emitParallelSignal(signal: ParallelSignal) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify(signal);
  window.localStorage.setItem(signalStorageKey, payload);
  window.setTimeout(() => {
    if (window.localStorage.getItem(signalStorageKey) === payload) {
      window.localStorage.removeItem(signalStorageKey);
    }
  }, 180);
}

export function parseParallelSignal(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsedSignal = JSON.parse(value) as Partial<ParallelSignal>;
    if (
      (parsedSignal.type !== "opened" && parsedSignal.type !== "closed") ||
      typeof parsedSignal.id !== "string" ||
      typeof parsedSignal.ts !== "number"
    ) {
      return null;
    }

    return {
      id: parsedSignal.id,
      parentId:
        typeof parsedSignal.parentId === "string" ? parsedSignal.parentId : null,
      ts: parsedSignal.ts,
      type: parsedSignal.type,
    } satisfies ParallelSignal;
  } catch {
    return null;
  }
}

export function cleanupStaleParallelBranches() {
  if (typeof window === "undefined") {
    return;
  }

  const expiredBefore = Date.now() - staleBranchAgeMs;

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith(storageKeyPrefix)) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      window.localStorage.removeItem(key);
      continue;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Partial<StoredParallelBranch>;

      if (
        typeof parsedValue.createdAt !== "number" ||
        parsedValue.createdAt < expiredBefore
      ) {
        window.localStorage.removeItem(key);
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  }
}

export function createStoredParallelBranch(
  snapshot: GameSnapshot,
  request: ParallelBranchRequest,
  context: ParallelBranchContext,
) {
  if (typeof window === "undefined") {
    throw new Error("Parallel branches can only be created in the browser.");
  }

  let parentId = context.currentBranchId;

  if (parentId) {
    const persistedParent = updateStoredParallelBranch(parentId, (branch) => ({
      ...branch,
      createdAt: Date.now(),
      snapshot: cloneGameSnapshot(snapshot),
      title: context.currentTitle,
    }));

    if (!persistedParent) {
      parentId = createStoredCheckpoint(snapshot, context.currentTitle).id;
    }
  } else {
    parentId = createStoredCheckpoint(snapshot, context.currentTitle).id;
  }

  const id = createBranchId();
  const storedBranch: StoredParallelBranch = {
    childId: null,
    createdAt: Date.now(),
    id,
    parentId,
    snapshot: createBranchSnapshot(snapshot, request),
    title: request.title,
  };

  writeStoredParallelBranch(storedBranch);
  updateStoredParallelBranch(parentId, (branch) => ({
    ...branch,
    childId: id,
  }));

  return {
    branchUrl: buildBranchUrl(id),
    storedBranch,
  };
}

export function readStoredParallelBranch(branchId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(getStorageKey(branchId));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredParallelBranch;
  } catch {
    window.localStorage.removeItem(getStorageKey(branchId));
    return null;
  }
}

export function removeStoredParallelBranch(branchId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const existingBranch = readStoredParallelBranch(branchId);
  if (existingBranch?.parentId) {
    updateStoredParallelBranch(existingBranch.parentId, (branch) => ({
      ...branch,
      childId: branch.childId === branchId ? null : branch.childId,
    }));
  }

  window.localStorage.removeItem(getStorageKey(branchId));
}
