export interface TradePlayer {
  id: string;
  Name: string;
  Team: string;
  Position: string;
  Salary: number;
}

export interface TradeMove {
  player: TradePlayer;
  fromTeam: string;
  toTeam: string;
}

export interface TeamSummary {
  team: string;
  salaryBefore: number;
  salaryOut: number;
  salaryIn: number;
  salaryAfter: number;
  difference: number;
  salaryAdjustment: string;
  tradeValid: boolean;
}

export type TeamSlot = 'A' | 'B' | 'C' | 'D';