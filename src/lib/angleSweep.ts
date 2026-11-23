/** Angles for a sweep from start to end (inclusive) with the given step, clamped to 0–89°. */
export function buildAngleList(start: number, end: number, step: number, max = 200): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step <= 0) return [];
  const lo = Math.max(0, Math.min(start, end));
  const hi = Math.min(89, Math.max(start, end));
  const out: number[] = [];
  for (let a = lo; a <= hi + 1e-9 && out.length < max; a += step) out.push(Math.round(a * 1000) / 1000);
  return out;
}
