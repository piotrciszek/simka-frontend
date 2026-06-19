import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Types matching backend API responses
export interface PlayerStat {
  id: number;
  Name: string;
  Position: string;
  Team: string;
  Games: number;
  Minutes: number;
  FG: number;
  FGA: number;
  'FG%': number;
  FT: number;
  FTA: number;
  'FT%': number;
  '3P': number;
  '3PA': number;
  '3P%': number;
  Rebounds: number;
  OREB: number;
  Assists: number;
  Steals: number;
  Blocks: number;
  Turnovers: number;
  Fouls: number;
  Points: number;
  'eFG%': number;
  'TS%': number;
  EFF: number;
  'AST/TO': number;
  USG: number;
  POSS: number;
  PPP: number;
  PIE: number;
}

export interface ScorerRanking {
  rank: number;
  name: string;
  ts: string;
  efg: string;
  fga: string;
  shooterScore: string;
}

export interface PlayerComparison {
  leftPlayer: PlayerStat;
  rightPlayer: PlayerStat;
}

export interface PlayerListItem {
  Name: string;
  Team: string;
  Position: string;
}

export interface StatsFilters {
  team?: string;
  minGames?: number;
  season?: string;
  position?: string;
}

export interface TradePlayer {
  Name: string;
  Team: string;
  Position: string;
  Salary: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Pobiera zaawansowane statystyki z opcjonalnymi filtrami
   */
  getAdvancedStats(filters?: StatsFilters): Observable<PlayerStat[]> {
    const params = new URLSearchParams();

    if (filters?.team) params.append('team', filters.team);
    if (filters?.minGames) params.append('minGames', filters.minGames.toString());
    if (filters?.season) params.append('season', filters.season);
    if (filters?.position) params.append('position', filters.position);

    const queryString = params.toString();
    const url = `${this.apiUrl}/stats/advanced${queryString ? '?' + queryString : ''}`;

    return this.http.get<PlayerStat[]>(url);
  }

  /**
   * Pobiera statystyki podsumowujące (dla advanced-stats component)
   */
  getSummaryStats(season?: string): Observable<PlayerStat[]> {
    const params = season ? `?season=${season}` : '';
    return this.http.get<PlayerStat[]>(`${this.apiUrl}/stats/summary${params}`);
  }

  /**
   * Porównuje dwóch graczy
   */
  comparePlayers(player1: string, player2: string): Observable<PlayerComparison> {
    const players = `${player1},${player2}`;
    return this.http.get<PlayerComparison>(
      `${this.apiUrl}/stats/compare?players=${encodeURIComponent(players)}`,
    );
  }

  /**
   * Pobiera ranking strzelców
   */
  getScorersRanking(minFGA: number = 5, season?: string): Observable<ScorerRanking[]> {
    const params = new URLSearchParams();
    params.append('minFGA', minFGA.toString());
    if (season) params.append('season', season);

    return this.http.get<ScorerRanking[]>(
      `${this.apiUrl}/stats/rankings/scorers?${params.toString()}`,
    );
  }

  /**
   * Pobiera listę wszystkich graczy (do dropdownów)
   */
  getPlayersList(): Observable<PlayerListItem[]> {
    return this.http.get<PlayerListItem[]>(`${this.apiUrl}/stats/players`);
  }

  /**
   * Generuje statystyki z pliku CSV
   */
  generateStatsFromFile(filename: string, season: string, csvUploadId?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/stats/generate-from-file`, {
      filename,
      season,
      csvUploadId: csvUploadId || null,
    });
  }
  getPer36Stats(filters?: StatsFilters): Observable<PlayerStat[]> {
  return this.getAdvancedStats(filters).pipe(
    map(players =>
      players.map(player => this.mapPlayerToPer36(player)),
    ),
  );
}

getTradePlayers(): Observable<TradePlayer[]> {
  return this.http.get<TradePlayer[]>(
    `${this.apiUrl}/stats/trade-players`,
  );
}

private mapPlayerToPer36(player: PlayerStat): PlayerStat {
  const minutes = Number(player.Minutes) || 0;

  if (minutes <= 0) {
    return player;
  }

  return {
    ...player,
    FG: this.toPer36(player.FG, minutes),
    FGA: this.toPer36(player.FGA, minutes),
    FT: this.toPer36(player.FT, minutes),
    FTA: this.toPer36(player.FTA, minutes),
    '3P': this.toPer36(player['3P'], minutes),
    '3PA': this.toPer36(player['3PA'], minutes),
    Rebounds: this.toPer36(player.Rebounds, minutes),
    OREB: this.toPer36(player.OREB, minutes),
    Assists: this.toPer36(player.Assists, minutes),
    Steals: this.toPer36(player.Steals, minutes),
    Blocks: this.toPer36(player.Blocks, minutes),
    Turnovers: this.toPer36(player.Turnovers, minutes),
    Fouls: this.toPer36(player.Fouls, minutes),
    Points: this.toPer36(player.Points, minutes),
  };
}

private toPer36(value: number, minutes: number): number {
  return (value / minutes) * 36;
}
}
