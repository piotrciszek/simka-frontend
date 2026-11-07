// Kontrakt GET /api/standings — kopia 1:1 z simbasket-backend/src/types/standings.ts.
// Przy zmianie kontraktu po stronie backendu trzeba zaktualizować oba pliki.
// Liczby są "surowe" — formatowanie (GB "-", Win% ",789" itd.) robi frontend.

export interface WinLoss {
  wins: number;
  losses: number;
}

export interface TeamStanding {
  teamId: number;
  city: string;
  name: string;
  wins: number;
  losses: number;
  winPct: number;
  last10: WinLoss;
  home: WinLoss;
  road: WinLoss;
  gb: number;
  confGb: number;
  divRank: number;
  confRank: number;
  // Seria: dodatnia = wygrane z rzędu, ujemna = porażki z rzędu
  streak: number;
}

export interface DivisionStandings {
  name: string;
  // Posortowane po divRank już przez backend
  teams: TeamStanding[];
}

export interface ConferenceStandings {
  name: string;
  divisions: DivisionStandings[];
}

export interface StandingsResponse {
  season: number;
  // Ostatni dzień sezonu z rozegranym meczem (null, gdy sezon jeszcze się nie zaczął)
  lastGameDay: number | null;
  conferences: ConferenceStandings[];
}
