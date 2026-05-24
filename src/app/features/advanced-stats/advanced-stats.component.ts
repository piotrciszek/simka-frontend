import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, type PlayerStat } from '../../core/services/stats.service';

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advanced-stats.component.html',
  styleUrl: './advanced-stats.component.scss',
})
export class AdvancedStatsComponent {
  private statsService = inject(StatsService);

  rows = signal<PlayerStat[]>([]);

  headers = computed(() => {
    const firstRow = this.rows()[0];
    return firstRow ? Object.keys(firstRow) : [];
  });

  constructor() {
    this.loadSummaryStats();
  }

  private loadSummaryStats() {
    this.statsService.getSummaryStats().subscribe({
      next: data => {
        this.rows.set(data);
      },
      error: error => {
        console.error('Błąd ładowania statystyk:', error);
      },
    });
  }

  getCellValue(row: PlayerStat, header: string): any {
    return (row as any)[header] ?? '';
  }
}
