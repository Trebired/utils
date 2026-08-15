import { toTrimmedString } from "./text.js";

type ActionLabelResolver = (value: unknown) => string;
type RuntimeActionKind = "restart" | "start" | "stop";

function normalizedRuntimeActionKind(value: unknown): RuntimeActionKind {
  const kind = toTrimmedString(value).toLowerCase();
  if (kind === "restart") return "restart";
  if (kind === "stop") return "stop";
  return "start";
}

function runtimeActionLabel(value: unknown): string {
  const kind = normalizedRuntimeActionKind(value);
  if (kind === "restart") return "Restart";
  if (kind === "stop") return "Stop";
  return "Start";
}

function runtimeActionLabelLower(value: unknown): string {
  return runtimeActionLabel(value).toLowerCase();
}

function scopedActionCopy(
  kindInput: unknown,
  outcomeInput: unknown,
  labelForAction: ActionLabelResolver = runtimeActionLabel,
): string {
  const actionLabel =
  toTrimmedString(labelForAction(kindInput)) || runtimeActionLabel(kindInput);
  const actionLower = actionLabel.toLowerCase();
  const outcome = toTrimmedString(outcomeInput).toLowerCase();
  return scopedActionOutcomeCopy(outcome, actionLabel, actionLower);
}

function scopedActionOutcomeCopy(
  outcome: string,
  actionLabel: string,
  actionLower: string,
): string {
  if (outcome === "completed") {
    return `${actionLabel} completed. Latest ${actionLower} steps are shown below.`;
  }
  if (outcome === "failed") {
    return `${actionLabel} failed. Latest ${actionLower} steps are shown below.`;
  }
  if (outcome === "accepted") {
    return `${actionLabel} accepted. Waiting for the next step now.`;
  }
  if (outcome === "queued") {
    return `${actionLabel} queued. Waiting for the worker to claim it.`;
  }
  if (outcome === "preparing") {
    return `${actionLabel} accepted. Preparing the next step now.`;
  }
  if (outcome === "running") {
    return `${actionLabel} in progress. Waiting for the next step now.`;
  }
  if (outcome === "reconnecting") {
    return `${actionLabel} stopped reporting progress. Reconnecting to the newest steps now.`;
  }
  return `Latest ${actionLower} steps are shown below.`;
}

export {
  normalizedRuntimeActionKind,
  runtimeActionLabel,
  runtimeActionLabelLower,
  scopedActionCopy,
};
export type { ActionLabelResolver, RuntimeActionKind };
