import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StandingRow {
  team_name: string;
  team_code: string;
  wins: number;
  losses: number;
  win_pct: string;
  last10: string;
  home_record: string;
  games_back: string;
  conference: string;
  division: string;
  division_rank: number;
  conference_rank: number;
}

export interface StandingsResponse {
  easternConference: StandingRow[];
  westernConference: StandingRow[];
}

@Injectable({
  providedIn: 'root',
})
export class StandingsService {
  private readonly http = inject(HttpClient);

  getStandings(): Observable<StandingsResponse> {
    return this.http.get<StandingsResponse>('http://localhost:3000/season/standings');
  }
}