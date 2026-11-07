import {
  formatGb,
  formatRecord,
  formatStreak,
  formatWinPct,
} from './standings-format';

describe('standings-format', () => {
  describe('formatGb', () => {
    it('lider → "-"', () => expect(formatGb(0, true)).toBe('-'));
    it('remis z liderem (gb 0, nie 1. miejsce) → "0,0"', () => expect(formatGb(0, false)).toBe('0,0'));
    it('pół meczu → "0,5"', () => expect(formatGb(0.5, false)).toBe('0,5'));
    it('liczba całkowita z jednym miejscem → "11,0"', () => expect(formatGb(11, false)).toBe('11,0'));
  });

  describe('formatWinPct', () => {
    it('0.789 → ",789"', () => expect(formatWinPct(0.789)).toBe(',789'));
    // Backend zwraca surowy iloraz, np. 15/19 = 0.7894736842105263
    it('zaokrągla surowy iloraz: 15/19 → ",789"', () => expect(formatWinPct(15 / 19)).toBe(',789'));
    it('dopełnia zerami: 0.5 → ",500"', () => expect(formatWinPct(0.5)).toBe(',500'));
    it('0 → ",000"', () => expect(formatWinPct(0)).toBe(',000'));
    it('1 → "1,000" (jedynki nie obcinamy)', () => expect(formatWinPct(1)).toBe('1,000'));
  });

  describe('formatRecord', () => {
    it('{7,3} → "7-3"', () => expect(formatRecord({ wins: 7, losses: 3 })).toBe('7-3'));
    it('{0,0} → "0-0"', () => expect(formatRecord({ wins: 0, losses: 0 })).toBe('0-0'));
  });

  describe('formatStreak', () => {
    it('dodatnia → "W3"', () => expect(formatStreak(3)).toBe('W3'));
    it('ujemna → "L1"', () => expect(formatStreak(-1)).toBe('L1'));
    it('zero → "-"', () => expect(formatStreak(0)).toBe('-'));
  });
});
