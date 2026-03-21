import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';

interface Game {
  gameNum: number;
  filename?: string;
  away: { name: string; score: string };
  home: { name: string; score: string };
}

interface DayResult {
  day: number;
  games: Game[];
}

@Component({
  selector: 'app-day-score-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './day-score-generator.component.html',
  styleUrl: './day-score-generator.component.scss',
})
export class DayScoreGeneratorComponent {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiUrl = environment.apiUrl;

  days = Array.from({ length: 200 }, (_, i) => i + 1);
  selectedDay = signal<number | null>(null);
  injuredPlayers = new FormControl('');
  loading = signal(false);
  error = signal('');
  generatedText = signal('');

  readonly BASE_URL = 'http://app.simbasket.pl';
  readonly PLAYOFF_ROUNDS = [
    { value: 'round1', label: '1 Runda' },
    { value: 'round2', label: '2 Runda' },
    { value: 'conference', label: 'Finał Konferencji' },
    { value: 'finals', label: 'Finał SimBasket' },
  ];
  selectedRound = signal<string | null>(null);
  isPlayoffs = computed(() => (this.selectedDay() ?? 0) >= 121);

  generate(): void {
    if (!this.selectedDay()) return;
    if (this.isPlayoffs() && !this.selectedRound()) return;

    this.loading.set(true);
    this.error.set('');
    this.generatedText.set('');

    if (this.isPlayoffs()) {
      forkJoin({
        playoffs: this.http.get<any>(`${this.apiUrl}/boxes/playoffs`),
        result: this.http.get<DayResult>(`${this.apiUrl}/boxes/day/${this.selectedDay()}`),
      }).subscribe({
        next: ({ playoffs, result }) => {
          this.generatedText.set(this.buildPlayoffsBBCode(result, playoffs, this.selectedRound()!));
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err?.error?.message || 'Błąd pobierania danych');
          this.loading.set(false);
        },
      });
    } else {
      this.http.get<DayResult>(`${this.apiUrl}/boxes/day/${this.selectedDay()}`).subscribe({
        next: result => {
          this.generatedText.set(this.buildBBCode(result));
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err.error?.message || 'Błąd pobierania danych');
          this.loading.set(false);
        },
      });
    }
  }

  buildBBCode(result: DayResult): string {
    const { day, games } = result;
    const base = this.BASE_URL;
    const lines: string[] = [];

    // Nagłówek dnia
    lines.push(
      `[url=${base}/html/boxes/day${day}.htm][size=4][b][u]Dzień ${day}[/u][/b][/size][/url] (na pierwszym miejscu goscie)`,
    );
    // All-Star Day
    if (day === 60) {
      for (const game of games) {
        const boxFile = game.filename ?? `${day}-${game.gameNum}.html`;
        const pbpFile = game.gameNum === 1 ? 'AllStar-Rookie.txt' : 'AllStar-Regular.txt';
        lines.push(
          `[url=${base}/html/boxes/${boxFile}]${game.away.name} ${game.away.score} - ${game.home.name} ${game.home.score}[/url]`,
        );
        lines.push(`[size=1][url=${base}/pbp/${pbpFile}]play-by-play[/url][/size]`);
      }
      lines.push('');
      lines.push(`[url=${base}/html/boxes/3presults.htm]3-Point Shootout[/url]`);
      lines.push('');
      lines.push(`[url=${base}/html/boxes/dunkresults.htm]Slam Dunk Contest[/url]`);
    } else {
      // Mecze
      for (const game of games) {
        lines.push(
          `[url=${base}/html/boxes/${day}-${game.gameNum}.html]${game.away.name} ${game.away.score} - ${game.home.name} ${game.home.score}[/url]`,
        );
        lines.push(`[size=1][url=${base}/pbp/${day}-${game.gameNum}.txt]play-by-play[/url][/size]`);
      }
    }

    // Kontuzjowani
    const injured = this.injuredPlayers.value?.trim() || '';
    const injuredFormatted = injured
      ? injured
          .split('\n')
          .map(line => `[*]${line.trim()}`)
          .join('\n')
      : '';
    lines.push(
      '-----------------------------------------------------------------------------------------------------------------',
    );
    lines.push(`Aktualnie kontuzjowani:  `);
    lines.push(`[list]${injuredFormatted ? '\n' + injuredFormatted : ''}[/list]`);
    lines.push(
      '-----------------------------------------------------------------------------------------------------------------',
    );
    lines.push('Kolejne mecze jutro!');
    lines.push(
      `[url=${base}/html/divstand.htm]Tabela[/url] | [url=${base}/html/leagueleaders.htm]Statystyki indywidualne[/url] | [url=${base}/html/tmstats/offense/team.htm]Statystyki drużynowe[/url] | [url=${base}/]Główna strona SimBasketu[/url]`,
    );

    return lines.join('\n');
  }

  buildPlayoffsBBCode(result: DayResult, playoffs: any, round: string): string {
    const base = this.BASE_URL;
    const lines: string[] = [];
    const day = result.day;
    const games = result.games ?? [];

    const roundNames: Record<string, { west: string; east: string }> = {
      round1: { west: 'Western Conference First Round', east: 'Eastern Conference First Round' },
      round2: { west: 'Western Conference Semifinals', east: 'Eastern Conference Semifinals' },
      conference: { west: 'Western Conference Finals', east: 'Eastern Conference Finals' },
      finals: { west: 'Simbasket Finals', east: 'Simbasket Finals' },
    };

    const buildConference = (pairs: any[], conf: string) => {
      if (!pairs?.length) return;

      const title =
        round === 'finals' ? roundNames['finals'].west : roundNames[round][conf as 'west' | 'east'];
      lines.push(`[b]${title}[/b]`);

      for (const pair of pairs) {
        const seed1 = pair.seeds
          ? pair.seeds.split('/')[0]
          : this.getSeed(pair.team1, playoffs.round1);
        const seed2 = pair.seeds
          ? pair.seeds.split('/')[1]
          : this.getSeed(pair.team2, playoffs.round1);
        lines.push(`(${seed1}) ${pair.team1} vs ${pair.team2} (${seed2})`);
        lines.push(`Bilans serii: ${pair.wins1} - ${pair.wins2}`);

        // Awans lub mistrzostwo
        if (parseInt(pair.wins1) === 4 || parseInt(pair.wins2) === 4) {
          const winner = parseInt(pair.wins1) === 4 ? pair.team1 : pair.team2;
          if (round === 'finals') {
            lines.push(`[color=red]${winner} mistrzami Simbasketu![/color]`);
          } else {
            lines.push(`[color=red][b]Awans ${winner}![/b][/color]`);
          }
        }
        // Znajdź mecz tej pary w dzisiejszych grach
        const game = games.find(
          g =>
            (g.away.name === pair.team1 && g.home.name === pair.team2) ||
            (g.away.name === pair.team2 && g.home.name === pair.team1),
        );

        if (game) {
          lines.push(
            `[url=${base}/html/boxes/${day}-${game.gameNum}.html]${game.away.name} ${game.away.score} - ${game.home.name} ${game.home.score}[/url]`,
          );
          lines.push(
            `[size=1][url=${base}/pbp/${day}-${game.gameNum}.txt]play-by-play[/url][/size]`,
          );
        }
        lines.push('');
      }
    };

    lines.push(
      `[url=${base}/html/boxes/day${day}.htm][size=4][b][u]Dzień ${day}[/u][/b][/size][/url] (na pierwszym miejscu goscie)`,
    );

    if (round === 'finals') {
      buildConference(playoffs.finals, 'finals');
    } else {
      const data = round === 'conference' ? playoffs.confFinals : playoffs[round];
      const westPairs = data?.west ?? [];
      buildConference(westPairs, 'west');
      buildConference(data?.east ?? [], 'east');
    }

    const injured = this.injuredPlayers.value?.trim() || '';
    const injuredFormatted = injured
      ? injured
          .split('\n')
          .map((line: string) => `[*]${line.trim()}`)
          .join('\n')
      : '';
    lines.push(
      '-----------------------------------------------------------------------------------------------------------------',
    );
    lines.push(`Aktualnie kontuzjowani:  `);
    lines.push(`[list]${injuredFormatted ? '\n' + injuredFormatted : ''}[/list]`);
    lines.push(
      '-----------------------------------------------------------------------------------------------------------------',
    );
    lines.push('Kolejne mecze jutro!');
    lines.push(
      `[url=${base}/html/divstand.htm]Tabela[/url] | [url=${base}/html/leagueleaders.htm]Statystyki indywidualne[/url] | [url=${base}/html/tmstats/offense/team.htm]Statystyki drużynowe[/url] | [url=${base}/]Główna strona SimBasketu[/url]`,
    );

    return lines.join('\n');
  }

  getSeed = (teamName: string, round1Data: any): string => {
    const allPairs = [...(round1Data?.west ?? []), ...(round1Data?.east ?? [])];
    for (const pair of allPairs) {
      const seeds = pair.seeds?.split('/') ?? ['', ''];
      if (pair.team1 === teamName) return seeds[0];
      if (pair.team2 === teamName) return seeds[1];
    }
    return '';
  };

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedText()).then(() => {
      this.snackBar.open('Skopiowano do schowka!', 'OK', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    });
  }
}
