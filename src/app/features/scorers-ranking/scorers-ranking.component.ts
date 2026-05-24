import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, type ScorerRanking } from '../../core/services/stats.service';

@Component({
  selector: 'app-scorers-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scorers-ranking.component.html',
  styleUrl: './scorers-ranking.component.scss',
})
export class ScorersRankingComponent {
  private statsService = inject(StatsService);

  players = signal<ScorerRanking[]>([]);

  constructor() {
    this.loadScorersRanking();
  }

  private loadScorersRanking() {
    this.statsService.getScorersRanking(5).subscribe({
      next: data => {
        this.players.set(data);
      },
      error: error => {
        console.error('Błąd ładowania rankingu:', error);
      },
    });
  }
}
