export const clamp = (v: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, v));

export const formatMoney = (n: number): string => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
};

export const formatPercent = (n: number): string => `${Math.round(n)}%`;

export const uid = (): string => Math.random().toString(36).slice(2, 9);
