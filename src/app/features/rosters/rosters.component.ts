import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TEAM_ORDER } from '../../core/constants/team-order';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  team: string;
}

interface TacticsData {
  gamePlan: {
    pace: string;
    offenseFocus: string;
    trapFrequency: string;
    pressFrequency: string;
  };
  depthChart: {
    C: Player[];
    PF: Player[];
    SF: Player[];
    SG: Player[];
    PG: Player[];
  };
  keyPlayers: Player[];
  injuredList: Player[];
}

interface TeamLineup {
  teamId: number;
  teamName: string;
  logo_path: string | null;
  displayStatus: 'approved' | 'pending' | 'brak';
  data: TacticsData | null;
}

@Component({
  selector: 'app-rosters',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './rosters.component.html',
  styleUrl: './rosters.component.scss',
})
export class RostersComponent implements OnInit {
  private http = inject(HttpClient);

  lineups = signal<TeamLineup[]>([]);
  loading = signal(true);
  error = signal('');

  sortedLineups = computed(() =>
    [...this.lineups()].sort((a, b) => {
      const aIdx = TEAM_ORDER.findIndex(t => a.teamName.includes(t) || t.includes(a.teamName));
      const bIdx = TEAM_ORDER.findIndex(t => b.teamName.includes(t) || t.includes(b.teamName));
      return aIdx - bIdx;
    }),
  );

  readonly positions = ['C', 'PF', 'SF', 'SG', 'PG'];

  ngOnInit(): void {
    this.http.get<TeamLineup[]>(`${environment.apiUrl}/tactics/all-lineups`).subscribe({
      next: data => {
        this.lineups.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania składów');
        this.loading.set(false);
      },
    });
  }

  getPlayer(lineup: TeamLineup, position: string, slot: number): string {
    if (!lineup.data) return '—';
    const players = lineup.data.depthChart[position as keyof typeof lineup.data.depthChart];
    if (!players || !players[slot]) return '—';
    return `${players[slot].firstName} ${players[slot].lastName}`;
  }

  getLogoUrl(teamName: string): string {
    const map: Record<string, string> = {
      'Boston Celtics': 'bos',
      'Miami Heat': 'mia',
      'New Jersey Nets': 'njn',
      'New York Knicks': 'nyk',
      'Orlando Magic': 'orl',
      'Philadelphia 76ers': 'phi',
      'Washington Wizards': 'was',
      'Atlanta Hawks': 'atl',
      'New Orleans Hornets': 'no',
      'Chicago Bulls': 'chi',
      'Cleveland Cavaliers': 'cle',
      'Detroit Pistons': 'det',
      'Indiana Pacers': 'ind',
      'Milwaukee Bucks': 'mil',
      'Toronto Raptors': 'tor',
      'Dallas Mavericks': 'dal',
      'Denver Nuggets': 'den',
      'Houston Rockets': 'hou',
      'Utah Jazz': 'uta',
      'Seattle Sonics': 'sea',
      'Minnesota Timberwolves': 'min',
      'Memphis Grizzlies': 'mem',
      'Golden State Warriors': 'gsw',
      'Los Angeles Clippers': 'lac',
      'Los Angeles Lakers': 'lal',
      'Phoenix Suns': 'pho',
      'Portland Trailblazers': 'por',
      'Sacramento Kings': 'sac',
      'San Antonio Spurs': 'sas',
    };
    const abbr = map[teamName];
    return abbr ? `${environment.apiUrl}/img/team/${abbr}.png` : '';
  }
}
