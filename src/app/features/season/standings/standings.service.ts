import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

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

export interface StandingsGroup {
  title: string;
  rows: StandingRow[];
}

@Injectable({
  providedIn: 'root',
})
export class StandingsService {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly easternConference = signal<StandingRow[]>([]);
  readonly westernConference = signal<StandingRow[]>([]);

  readonly hasData = computed(
    () => this.easternConference().length > 0 || this.westernConference().length > 0,
  );

  readonly leagueStandings = computed(() =>
    this.sortLeague([
      ...this.westernConference(),
      ...this.easternConference(),
    ]),
  );

  readonly divisionStandings = computed<StandingsGroup[]>(() => {
    const rows = [
      ...this.westernConference(),
      ...this.easternConference(),
    ];

return [
  'Pacific',
  'Atlantic',
  'Central',
  'Midwest',
].map(division => ({
      title: division,
      rows: rows
        .filter(row => row.division === division)
        .sort((a, b) => a.division_rank - b.division_rank),
    }));
  });

  loadStandings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<StandingsResponse>('http://localhost:3000/season/standings').subscribe({
      next: standings => {
        this.easternConference.set(standings.easternConference);
        this.westernConference.set(standings.westernConference);
        this.loading.set(false);
      },
      error: err => {
        console.error('STANDINGS ERROR', err);

        this.error.set('Nie uda³o siê pobraæ tabeli standings.');
        this.loading.set(false);
      },
    });
  }

  private sortLeague(rows: StandingRow[]): StandingRow[] {
    return [...rows].sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }

      return Number(b.win_pct) - Number(a.win_pct);
    });
  }
}
