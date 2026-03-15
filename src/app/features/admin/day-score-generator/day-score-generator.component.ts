import { Component, inject, signal } from '@angular/core';
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

interface Game {
  gameNum: number;
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

  generate(): void {
    if (!this.selectedDay()) return;

    this.loading.set(true);
    this.error.set('');
    this.generatedText.set('');

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

  buildBBCode(result: DayResult): string {
    const { day, games } = result;
    const base = this.BASE_URL;
    const lines: string[] = [];

    // Nagłówek dnia
    lines.push(
      `[url=${base}/html/boxes/day${day}.htm][size=4][b][u]Dzień ${day}[/u][/b][/size][/url] (na pierwszym miejscu goscie)`,
    );

    // Mecze
    for (const game of games) {
      lines.push(
        `[url=${base}/html/boxes/${day}-${game.gameNum}.html]${game.away.name} ${game.away.score} - ${game.home.name} ${game.home.score}[/url]`,
      );
      lines.push(`[size=1][url=${base}/pbp/${day}-${game.gameNum}.txt]play-by-play[/url][/size]`);
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
