import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

import { StatsService, type PlayerStat } from '../../../core/services/stats.service';

@Component({
  selector: 'app-per-36',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './per-36.component.html',
  styleUrl: './per-36.component.scss',
})
export class Per36Component {
  private readonly statsService = inject(StatsService);

  readonly rows = signal<PlayerStat[]>([]);

  private numberCol(
    field: string,
    headerName: string,
    width = 70,
    decimals = 2,
  ): ColDef {
    return {
      field,
      headerName,
      width,
      filter: 'agNumberColumnFilter',
      valueGetter: params => Number(params.data?.[field]) || 0,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value == null) {
          return '';
        }

        const formatted = Number(params.value).toFixed(decimals);

        return `<span style="font-weight:bold;">${formatted}</span>`;
      },
    };
  }

  readonly colDefs: ColDef[] = [
    {
      field: 'Name',
      headerName: 'Gracz',
      pinned: 'left',
      width: 180,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams) =>
        `<span style="font-weight:bold;">${params.value}</span>`,
    },
    {
      field: 'Position',
      headerName: 'Poz.',
      width: 70,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Team',
      headerName: 'Team',
      width: 100,
      filter: 'agTextColumnFilter',
    },

    this.numberCol('Games', 'GP', 70, 0),
    this.numberCol('Points', 'PTS'),
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
    this.loadPer36Stats();
  }

  private loadPer36Stats(): void {
  this.statsService.getPer36Stats().subscribe({
    next: data => {
      this.rows.set(data);
    },
    error: error => {
      console.error('B³¹d ³adowania statystyk per 36:', error);
    },
  });
  }
}
