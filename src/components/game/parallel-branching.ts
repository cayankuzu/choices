import {
  cloneGameSnapshot,
  type GameSnapshot,
} from "@/components/game/game-store";
import { sceneLayout } from "@/components/game/scene-layout";

export type ParallelBranchRequest =
  | {
      kind: "gun-take";
      title: string;
    }
  | {
      kind: "gun-trigger";
      title: string;
    }
  | {
      kind: "package-deliver";
      title: string;
    }
  | {
      kind: "coffee-accept";
      title: string;
    }
  | {
      kind: "coffee-decline";
      title: string;
    };

export function createBranchSnapshot(
  snapshot: GameSnapshot,
  request: ParallelBranchRequest,
) {
  const branchSnapshot = cloneGameSnapshot(snapshot);

  branchSnapshot.lookEnabled = false;
  branchSnapshot.paused = false;
  branchSnapshot.interactionMenuOpen = false;
  branchSnapshot.interactionMenuIndex = 0;
  branchSnapshot.interactionTarget = null;
  branchSnapshot.openNoteId = null;
  branchSnapshot.textPanelExpanded = false;
  branchSnapshot.narrationQueue = [];
  branchSnapshot.deliverySequencePhase = "idle";
  branchSnapshot.openNeighborDoorId = null;

  if (request.kind === "gun-take") {
    branchSnapshot.gunHeld = true;
    branchSnapshot.equippedItem = "gun";
    return branchSnapshot;
  }

  if (request.kind === "gun-trigger") {
    branchSnapshot.gunHeld = true;
    branchSnapshot.equippedItem = "gun";
    branchSnapshot.collapsePhase = "priming";
    branchSnapshot.currentObjective = "collapse";
    return branchSnapshot;
  }

  if (request.kind === "package-deliver") {
    branchSnapshot.packageState = "carried";
    branchSnapshot.packageDecision = "deliver";
    branchSnapshot.coffeeDecision = "unseen";
    branchSnapshot.unlockedNeighborDoor = sceneLayout.package.recipientDoorId;
    branchSnapshot.currentObjective = "deliver-package";

    if (branchSnapshot.equippedItem === "package") {
      branchSnapshot.equippedItem = "hands";
    }

    return branchSnapshot;
  }

  branchSnapshot.packageState = "delivered";
  branchSnapshot.packageDecision = "deliver";
  branchSnapshot.coffeeDecision =
    request.kind === "coffee-accept" ? "accept" : "decline";
  branchSnapshot.unlockedNeighborDoor = null;
  branchSnapshot.openNeighborDoorId = sceneLayout.package.recipientDoorId;
  branchSnapshot.currentObjective =
    request.kind === "coffee-accept" ? "neighbor-visit" : "free-roam";

  return branchSnapshot;
}
