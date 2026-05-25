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

  // Kolumny dla zaawansowanych statystyk per game (identyczne jak w sum)
  readonly colDefs: ColDef[] = [
    {
      field: 'Name',
      headerName: 'Gracz',
      pinned: 'left',
      width: 180,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => `<span style="font-weight: bold;">${params.value}</span>`
    },
    { field: 'Position', headerName: 'Poz.', width: 70, filter: 'agTextColumnFilter' },
    { field: 'Team', headerName: 'Drużyna', width: 100, filter: 'agTextColumnFilter' },
    { field: 'Games', headerName: 'GP', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'Minutes', headerName: 'Min', width: 70, filter: 'agNumberColumnFilter' },
    {
      field: 'Points',
      headerName: 'PTS',
      width: 70,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: any) => `<span style="font-weight: bold;">${params.value}</span>`
    },
    { field: 'FG', headerName: 'FG', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'FGA', headerName: 'FGA', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'FT', headerName: 'FT', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'FTA', headerName: 'FTA', width: 70, filter: 'agNumberColumnFilter' },
    { field: '3P', headerName: '3P', width: 70, filter: 'agNumberColumnFilter' },
    { field: '3PA', headerName: '3PA', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'Rebounds', headerName: 'REB', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'OREB', headerName: 'OREB', width: 80, filter: 'agNumberColumnFilter' },
    { field: 'Assists', headerName: 'AST', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'Steals', headerName: 'STL', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'Blocks', headerName: 'BLK', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'Turnovers', headerName: 'TO', width: 70, filter: 'agNumberColumnFilter' },
    { field: 'Fouls', headerName: 'PF', width: 70, filter: 'agNumberColumnFilter' },
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
