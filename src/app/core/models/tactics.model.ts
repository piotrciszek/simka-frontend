export type TacticStatus = 'draft' | 'pending' | 'approved';

export type Pace = 'Very Slow' | 'Slow' | 'Normal' | 'Fast' | 'Very Fast';
export type Frequency = 'Never' | 'Sometimes' | 'Normal' | 'Often' | 'Always';
export type OffenseFocus = 'Inside' | 'Balanced' | 'Outside';

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  team: string;
}

export interface GamePlan {
  pace: Pace;
  trapFrequency: Frequency;
  pressFrequency: Frequency;
  offenseFocus: OffenseFocus;
}

export interface DepthChart {
  PG: Player[];
  SG: Player[];
  SF: Player[];
  PF: Player[];
  C: Player[];
  [key: string]: Player[];
}

export interface TacticsData {
  gamePlan: GamePlan;
  keyPlayers: Player[];
  injuredList: Player[];
  depthChart: DepthChart;
}

export interface Tactics {
  id: number;
  teamId: number;
  status: 'draft' | 'pending' | 'approved';
  version: number;
  dataDraft: TacticsData | null;
  dataPending: TacticsData | null;
  dataApproved: TacticsData | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface TacticsLogEntry {
  id: number;
  status: TacticStatus;
  version: number;
  submittedAt: string | null;
  approvedAt: string | null;
  teamName: string;
  logoPath: string | null;
  ownerUsername: string | null;
  approvedBy: string | null;
  dataPending: TacticsData | null;
  dataApproved: TacticsData | null;
}
