import {
  normalizeSnapshot,
  type GameSnapshot,
  type MajorChoice,
} from "@/components/game/game-types";

const storagePrefix = "intihab-world-001-branch:v2:";

export type BranchRecord = {
  choice: Exclude<MajorChoice, null>;
  createdAt: number;
  id: string;
  parentId: string | null;
  snapshot: GameSnapshot;
  title: string;
};

function storageKey(id: string) {
  return `${storagePrefix}${id}`;
}

export function createBranch(
  snapshot: GameSnapshot,
  title: string,
  parentId: string | null,
  choice: Exclude<MajorChoice, null>,
): BranchRecord {
  const id = crypto.randomUUID();
  const branch: BranchRecord = {
    choice,
    createdAt: Date.now(),
    id,
    parentId,
    snapshot,
    title,
  };

  localStorage.setItem(storageKey(id), JSON.stringify(branch));
  return branch;
}

export function loadBranch(id: string): BranchRecord | null {
  try {
    const rawBranch = localStorage.getItem(storageKey(id));
    if (!rawBranch) return null;
    const branch = JSON.parse(rawBranch) as BranchRecord;
    return { ...branch, snapshot: normalizeSnapshot(branch.snapshot) };
  } catch {
    return null;
  }
}

export function saveBranch(id: string, snapshot: GameSnapshot) {
  const branch = loadBranch(id);
  if (!branch) return;
  localStorage.setItem(storageKey(id), JSON.stringify({ ...branch, snapshot }));
}
