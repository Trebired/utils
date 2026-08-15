type IntervalHandle = ReturnType<typeof setInterval>|null;
type TimeoutHandle = ReturnType<typeof setTimeout>|number | null;

type IntervalRef = {
  current: IntervalHandle;
};

type TimeoutRef = {
  current: TimeoutHandle;
};

function clearTimerRef(
  ref: { current: unknown },
  clearTimer: (handle: any) => void,
): void {
  if (!ref.current) return;
  clearTimer(ref.current);
  ref.current = null;
}

function clearIntervalRef(ref: IntervalRef): void {
  clearTimerRef(ref, clearInterval);
}

function clearTimeoutRef(ref: TimeoutRef): void {
  clearTimerRef(ref, clearTimeout);
}

export type { IntervalRef, TimeoutRef };
export { clearIntervalRef, clearTimeoutRef };
