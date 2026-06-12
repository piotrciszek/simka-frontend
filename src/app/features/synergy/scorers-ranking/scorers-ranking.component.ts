import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { StatsService, type ScorerRanking } from '../../../core/services/stats.service';

@Component({
  selector: 'app-scorers-ranking',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './scorers-ranking.component.html',
  styleUrl: './scorers-ranking.component.scss',
})
export class ScorersRankingComponent {
  private statsService = inject(StatsService);

  players = signal<ScorerRanking[]>([]);

  // Kolumny dla rankingu strzelców
  readonly colDefs: ColDef[] = [
    { field: 'name', headerName: 'Gracz', width: 180, filter: 'agTextColumnFilter', pinned: 'left' },
    { field: 'ts', headerName: 'TS%', width: 100, filter: 'agNumberColumnFilter' },
    { field: 'efg', headerName: 'EFG%', width: 100, filter: 'agNumberColumnFilter' },
    { field: 'fga', headerName: 'FGA', width: 100, filter: 'agNumberColumnFilter' },
    { field: 'shooterScore', headerName: 'ShooterScore', width: 140, filter: 'agNumberColumnFilter' },
  ];

  readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

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
