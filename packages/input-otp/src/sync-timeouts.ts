export function syncTimeouts(cb: (...args: any[]) => unknown): number[] {
  const t1 = setTimeout(cb, 0) // For faster machines
  const t2 = setTimeout(cb, 1_0)
  const t3 = setTimeout(cb, 5_0)
  return [t1, t2, t3]
}
