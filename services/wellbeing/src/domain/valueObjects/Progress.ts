export interface Progress {
  completed: number;
  expected: number;
  percentage: number;
}

export const buildProgress = (
  completed: number,
  expected: number,
): Progress => ({
  completed,
  expected,
  percentage: expected === 0 ? 0 : Math.round((completed / expected) * 100),
});
