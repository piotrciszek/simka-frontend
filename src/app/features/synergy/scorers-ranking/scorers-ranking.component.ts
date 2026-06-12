import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
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

  private numberCol(field: string, headerName: string, width = 70, decimals = 2): ColDef {
    return {
      field,
      headerName,
      width,
      filter: 'agNumberColumnFilter',
      valueGetter: params => Number(params.data?.[field]) || 0,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value == null) return '';
        return Number(params.value).toFixed(decimals);
      },
    };
  }

  // Kolumny dla rankingu strzelców
  readonly colDefs: ColDef[] = [
    {
      field: 'rank',
      headerName: 'Rank',
      width: 70,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'name',
      headerName: 'Gracz',
      width: 160,
      filter: 'agTextColumnFilter',
    },
    this.numberCol('ts', 'TS%', 95, 1),
    this.numberCol('efg', 'EFG%', 98, 1),
    this.numberCol('fga', 'FGA', 95, 1),
    this.numberCol('shooterScore', 'ShooterScore', 140, 3),
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
