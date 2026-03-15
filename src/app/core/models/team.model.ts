export interface Team {
  id: number;
  name: string;
  csvTeamName?: string;
  logoPath?: string;
  isActive: boolean;
  createdAt: string;
  ownerUsername?: string;
  userId?: number;
}
