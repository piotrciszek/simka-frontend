import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClassParams } from 'ag-grid-community';
import { environment } from '../../../environments/environment';
import {
  CsvCompareService,
  TeamGroup,
  PlayerDiff,
  SKILL_COLUMNS,
} from '../../core/services/csv-compare.service';

interface CsvFile {
  filename: string;
  modifiedAt: string;
  isDirectory: boolean;
}

interface GridRow {
  team: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  [key: string]: any;
}

@Component({
  selector: 'app-compare-csv',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatInputModule,
    AgGridAngular,
  ],
  templateUrl: './compare-csv.component.html',
  styleUrl: './compare-csv.component.scss',
})
export class CompareCsvComponent implements OnInit {
  private http = inject(HttpClient);
  private compareService = inject(CsvCompareService);
  private gridApi!: GridApi;

  files = signal<CsvFile[]>([]);
  selectedOld = signal<string>('');
  selectedNew = signal<string>('');
  groups = signal<TeamGroup[]>([]);
  rowData = signal<GridRow[]>([]);
  loading = signal(false);
  error = signal('');
  quickFilter = signal('');

  readonly canCompare = computed(
    () => this.selectedOld() && this.selectedNew() && this.selectedOld() !== this.selectedNew(),
  );

sortMode = signal<'value' | 'delta'>('value');

  readonly colDefs = computed<ColDef[]>(() => {
    const mode = this.sortMode();
    return [
      {
        field: 'firstName',
        headerName: 'Imię',
        headerTooltip: 'Imię',
        pinned: 'left',
        width: 90,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'lastName',
        headerName: 'Nazwisko',
        headerTooltip: 'Nazwisko',
        pinned: 'left',
        width: 100,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'position',
        headerName: 'Poz.',
        headerTooltip: 'Pozycja',
        pinned: 'left',
        width: 50,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'team',
        headerName: 'Drużyna',
        headerTooltip: 'Drużyna',
        pinned: 'left',
        width: 80,
        filter: 'agTextColumnFilter',
      },
      ...SKILL_COLUMNS.map(skill => ({
        field: skill,
        headerName: skill,
        headerTooltip: skill,
        width: 70,
        filter: 'agNumberColumnFilter',
        // valueGetter decyduje po czym sortuje ag-Grid — nowa wartość lub delta
        valueGetter: (params: any) =>
          mode === 'value'
            ? (params.data?.[skill]?.new ?? params.data?.[skill]?.old ?? null)
            : (params.data?.[skill]?.delta ?? null),
        cellRenderer: (params: any) => {
          const val = params.data?.[skill]?.new ?? params.data?.[skill]?.old ?? '';
          const delta = params.data?.[skill]?.delta;
          if (delta === null || delta === undefined || delta === 0) return `${val}`;
          const color = delta > 0 ? '#2e7d32' : '#c62828';
          return `<span>${val} <small style="color:${color}">${delta > 0 ? '+' : ''}${delta}</small></span>`;
        },
      })),
    ];
  });

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
  };

  ngOnInit(): void {
    this.http.get<CsvFile[]>(`${environment.apiUrl}/csv/files`).subscribe({
      next: files => this.files.set(files.filter(f => !f.isDirectory)),
      error: () => this.error.set('Błąd ładowania listy plików'),
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onQuickFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.quickFilter.set(value);
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', value);
    }
  }

  compare(): void {
    if (!this.canCompare()) return;
    this.loading.set(true);
    this.error.set('');
    this.groups.set([]);
    this.rowData.set([]);

    forkJoin({
      old: this.compareService.fetchCsv(this.selectedOld()),
      new: this.compareService.fetchCsv(this.selectedNew()),
    }).subscribe({
      next: ({ old, new: newMap }) => {
        const { groups, error } = this.compareService.compareGrouped(old, newMap);
        if (error) {
          this.error.set(error);
        } else {
          this.groups.set(groups);
          this.rowData.set(this.buildRowData(groups));
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd pobierania plików CSV');
        this.loading.set(false);
      },
    });
  }

  private buildRowData(groups: TeamGroup[]): GridRow[] {
    const rows: GridRow[] = [];

    for (const group of groups) {
      for (const player of group.players) {
        const row: GridRow = {
          team: player.team || 'FA',
          firstName: player.firstName,
          lastName: player.lastName,
          position: player.position,
          status: player.status,
        };
        for (const skill of SKILL_COLUMNS) {
          row[skill] = player.skills[skill];
        }
        rows.push(row);
      }
    }

    return rows;
  }

  getRowClass = (params: RowClassParams): string => {
    switch (params.data?.status) {
      case 'added':
        return 'row-added';
      case 'removed':
        return 'row-removed';
      case 'changed':
        return 'row-changed';
      default:
        return '';
    }
  };
}
