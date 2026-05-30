import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { StatsService, type PlayerStat } from '../../../core/services/stats.service';

@Component({
  selector: 'app-advanced-statsp',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './advanced-statsp.component.html',
  styleUrl: './advanced-statsp.component.scss',
})
export class AdvancedStatspComponent {
  private statsService = inject(StatsService);

  rows = signal<PlayerStat[]>([]);
  
  private numberCol(field: string, headerName: string, width = 70): ColDef {
  return {
    field,
    headerName,
    width,
    filter: 'agNumberColumnFilter',
    valueGetter: params => Number(params.data?.[field]) || 0,
    comparator: (a, b) => Number(a) - Number(b),
  };
}

  // Kolumny dla zaawansowanych statystyk per game (identyczne jak w sum)
  readonly colDefs: ColDef[] = [
  {
    field: 'Name',
    headerName: 'Gracz',
    pinned: 'left',
    width: 180,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) =>
      `<span style="font-weight:bold;">${params.value}</span>`
  },
  { field: 'Position', headerName: 'Poz.', width: 70, filter: 'agTextColumnFilter' },
  { field: 'Team', headerName: 'Team', width: 100, filter: 'agTextColumnFilter' },

  this.numberCol('Games', 'GP'),
  this.numberCol('Minutes', 'Min'),
  {
    ...this.numberCol('Points', 'PTS'),
    cellRenderer: (params: any) =>
      `<span style="font-weight:bold;">${params.value}</span>`
  },
  this.numberCol('FG', 'FG'),
  this.numberCol('FGA', 'FGA'),
  this.numberCol('FT', 'FT'),
  this.numberCol('FTA', 'FTA'),
  this.numberCol('3P', '3P'),
  this.numberCol('3PA', '3PA'),
  this.numberCol('Rebounds', 'REB'),
  this.numberCol('OREB', 'OREB', 80),
  this.numberCol('Assists', 'AST'),
  this.numberCol('Steals', 'STL'),
  this.numberCol('Blocks', 'BLK'),
  this.numberCol('Turnovers', 'TO'),
  this.numberCol('Fouls', 'PF'),
  ];

  readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor() {
    this.loadAdvancedStats();
  }

  private loadAdvancedStats() {
    this.statsService.getAdvancedStats().subscribe({
      next: data => {
        this.rows.set(data);
      },
      error: error => {
        console.error('Błąd ładowania statystyk:', error);
      },
    });
  }

}
