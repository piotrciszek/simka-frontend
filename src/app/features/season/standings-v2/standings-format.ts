import { WinLoss } from '../../../core/models/standings.model';

// Czyste funkcje formatujące — bez zależności od Angulara, łatwe do testów jednostkowych.

// GB: lider tabeli (1. miejsce) → "-", reszta z jednym miejscem po przecinku: 0,0 / 0,5 / 11,0.
// O "-" decyduje miejsce, nie gb === 0 — przy remisie na czele drugi zespół ma "0,0" (jak w starym HTML).
export function formatGb(gb: number, isLeader: boolean): string {
  if (isLeader) return '-';
  return gb.toFixed(1).replace('.', ',');
}

// Win%: 0.789 → ",789", 1 → "1,000", 0 → ",000" (bez zera wiodącego, jak w divstand.htm)
export function formatWinPct(pct: number): string {
  return pct.toFixed(3).replace(/^0/, '').replace('.', ',');
}

// Bilans: { wins: 7, losses: 3 } → "7-3"
export function formatRecord(record: WinLoss): string {
  return `${record.wins}-${record.losses}`;
}

// Seria: 3 → "W3", -1 → "L1", 0 → "-"
export function formatStreak(streak: number): string {
  if (streak > 0) return `W${streak}`;
  if (streak < 0) return `L${Math.abs(streak)}`;
  return '-';
}
