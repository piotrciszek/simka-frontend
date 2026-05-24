import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StatsService,
  type PlayerListItem,
  type PlayerStat,
  type PlayerComparison,
} from '../../core/services/stats.service';

@Component({
  selector: 'app-compare-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compare-stats.component.html',
  styleUrl: './compare-stats.component.scss',
})
export class CompareStatsComponent {
  private statsService = inject(StatsService);

  players = signal<PlayerListItem[]>([]);
  comparison = signal<PlayerComparison | null>(null);
  isLoading = signal(false);

  leftName = '';
  rightName = '';

  comparisonStats = signal<
    Array<{
      label: string;
      leftValue: string;
      rightValue: string;
      leftWins: boolean;
      rightWins: boolean;
    }>
  >([]);

  constructor() {
    this.loadPlayersList();
  }

  private loadPlayersList() {
    this.statsService.getPlayersList().subscribe({
      next: data => {
        this.players.set(data);
      },
      error: error => {
        console.error('Błąd ładowania listy graczy:', error);
      },
    });
  }

  selectPlayers() {
    if (!this.leftName || !this.rightName) {
      this.comparison.set(null);
      this.comparisonStats.set([]);
      return;
    }

    this.isLoading.set(true);
    this.statsService.comparePlayers(this.leftName, this.rightName).subscribe({
      next: data => {
        this.comparison.set(data);
        this.generateComparisonStats(data);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Błąd porównania graczy:', error);
        this.comparison.set(null);
        this.comparisonStats.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private generateComparisonStats(comparison: PlayerComparison) {
    const left = comparison.leftPlayer;
    const right = comparison.rightPlayer;

    const stats = [
      { key: 'Points', label: 'Punkty' },
      { key: 'Rebounds', label: 'Zbiórki' },
      { key: 'Assists', label: 'Asysty' },
      { key: 'FG%', label: 'FG%' },
      { key: '3P%', label: '3P%' },
      { key: 'FT%', label: 'FT%' },
      { key: 'TS%', label: 'TS%' },
      { key: 'eFG%', label: 'eFG%' },
      { key: 'EFF', label: 'Efektywność' },
      { key: 'AST/TO', label: 'AST/TO' },
      { key: 'USG', label: 'Użycie %' },
      { key: 'PIE', label: 'PIE' },
    ];

    const comparisonData = stats.map(stat => {
      const leftValue = (left as any)[stat.key];
      const rightValue = (right as any)[stat.key];
      const leftNum = parseFloat(leftValue) || 0;
      const rightNum = parseFloat(rightValue) || 0;

      const leftWins = leftNum > rightNum;
      const rightWins = rightNum > leftNum;

      return {
        label: stat.label,
        leftValue:
          typeof leftValue === 'number' ? leftValue.toFixed(2) : leftValue?.toString() || '0',
        rightValue:
          typeof rightValue === 'number' ? rightValue.toFixed(2) : rightValue?.toString() || '0',
        leftWins,
        rightWins,
      };
    });

    this.comparisonStats.set(comparisonData);
  }
}
