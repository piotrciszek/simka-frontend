import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as XLSX from 'xlsx-js-style';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClassParams,
  ValueGetterParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { environment } from '../../../environments/environment';
import {
  CsvCompareService,
  TeamGroup,
  SKILL_COLUMNS,
  SkillKey,
} from '../../core/services/csv-compare.service';

interface CsvFile {
  filename: string;
  modifiedAt: string;
  isDirectory: boolean;
}

type SkillCell = { old: number | null; new: number | null; delta: number | null };

type GridRow = {
  team: string;
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  experience: number;
  status: string;
} & { [K in SkillKey]: SkillCell };

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
    MatIconModule,
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

  // Przechowywanie surowych danych dla eksportu
  private fullOldData: Map<string, any> = new Map();
  private fullNewData: Map<string, any> = new Map();

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
        width: 90,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'lastName',
        headerName: 'Nazwisko',
        headerTooltip: 'Nazwisko',
        width: 100,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'age',
        headerName: 'Wiek',
        headerTooltip: 'Wiek',
        width: 70,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'position',
        headerName: 'Poz.',
        headerTooltip: 'Pozycja',
        width: 70,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'experience',
        headerName: 'Exp.',
        headerTooltip: 'Doświadczenie',
        width: 70,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'team',
        headerName: 'Drużyna',
        headerTooltip: 'Drużyna',
        width: 80,
        filter: 'agTextColumnFilter',
      },
      ...SKILL_COLUMNS.map(skill => ({
        field: skill,
        headerName: skill,
        headerTooltip: skill,
        width: 80,
        filter: 'agNumberColumnFilter',
        // valueGetter decyduje po czym sortuje ag-Grid — nowa wartość lub delta
        valueGetter: (params: ValueGetterParams<GridRow>) =>
          mode === 'value'
            ? (params.data?.[skill]?.new ?? params.data?.[skill]?.old ?? null)
            : (params.data?.[skill]?.delta ?? null),
        cellRenderer: (params: ICellRendererParams<GridRow>) => {
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
      fullOld: this.fetchFullCsv(this.selectedOld()),
      fullNew: this.fetchFullCsv(this.selectedNew()),
    }).subscribe({
      next: ({ old, new: newMap, fullOld, fullNew }) => {
        // Przechowaj surowe dane dla eksportu
        this.fullOldData = fullOld;
        this.fullNewData = fullNew;

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
        rows.push({
          team: player.team || 'FA',
          firstName: player.firstName,
          lastName: player.lastName,
          age: player.age,
          position: player.position,
          experience: player.experience,
          status: player.status,
          ...player.skills,
        });
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

  exportToExcel(): void {
    if (!this.groups().length || !this.fullOldData.size || !this.fullNewData.size) {
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Arkusz 1: Dane "Przed"
      const beforeData = this.prepareDataForExport(this.fullOldData);
      const beforeSheet = this.createSimpleWorksheet(beforeData, true);
      XLSX.utils.book_append_sheet(workbook, beforeSheet, 'Przed');

      // Arkusz 2: Dane "Po"
      const afterData = this.prepareDataForExport(this.fullNewData);
      const afterSheet = this.createSimpleWorksheet(afterData, true);
      XLSX.utils.book_append_sheet(workbook, afterSheet, 'Po');

      // Arkusz 3: Porównanie
      const compareData = this.prepareComparisonData();
      const compareSheet = this.createSimpleWorksheet(compareData, true);
      XLSX.utils.book_append_sheet(workbook, compareSheet, 'Porównanie');

      // Generuj i pobierz plik
      const filename = `CAMP_COMPARE.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Błąd eksportu do Excel:', error);
      this.error.set('Błąd podczas eksportu do Excel');
    }
  }

  private prepareDataForExport(dataMap: Map<string, any>): any[] {
    const players = Array.from(dataMap.values());

    // Sortowanie: team -> lastName -> firstName
    return players
      .sort((a, b) => {
        const teamA = a.team || 'FA';
        const teamB = b.team || 'FA';

        if (teamA !== teamB) return teamA.localeCompare(teamB);
        if (a.lastName !== b.lastName) return a.lastName.localeCompare(b.lastName);
        return a.firstName.localeCompare(b.firstName);
      })
      .map(player => {
        // Oblicz Overall jako suma atrybutów (bez Potential)
        const overall =
          (player.InsideScoring || 0) +
          (player.Jumpshot || 0) +
          (player['3P'] || 0) +
          (player.Handling || 0) +
          (player.Passing || 0) +
          (player.Quickness || 0) +
          (player.PostD || 0) +
          (player.PerimeterD || 0) +
          (player.DriveD || 0) +
          (player.Stealing || 0) +
          (player.Blocking || 0) +
          (player.Oreb || 0) +
          (player.Dreb || 0) +
          (player.Jumping || 0) +
          (player.Strength || 0);

        return {
          FirstName: player.firstName || '',
          LastName: player.lastName || '',
          Height: player.Height || 0,
          Weight: player.Weight || 0,
          Age: player.Age || 0,
          Position: player.position || '',
          College: player.College || '',
          Experience: player.Experience || 0,
          Team: player.team || 'FA',
          InsideScoring: player.InsideScoring || 0,
          Jumpshot: player.Jumpshot || 0,
          '3P': player['3P'] || 0,
          Handling: player.Handling || 0,
          Passing: player.Passing || 0,
          Quickness: player.Quickness || 0,
          PostD: player.PostD || 0,
          PerimeterD: player.PerimeterD || 0,
          DriveD: player.DriveD || 0,
          Stealing: player.Stealing || 0,
          Blocking: player.Blocking || 0,
          Oreb: player.Oreb || 0,
          Dreb: player.Dreb || 0,
          Jumping: player.Jumping || 0,
          Strength: player.Strength || 0,
          Potential: player.Potential || 0,
          Overall: overall,
          Salary1: player.Salary1 || 0,
          Salary2: player.Salary2 || 0,
          Salary3: player.Salary3 || 0,
          Salary4: player.Salary4 || 0,
          Salary5: player.Salary5 || 0,
          Salary6: player.Salary6 || 0,
          Salary7: player.Salary7 || 0,
        };
      });
  }

  private prepareComparisonData(): any[] {
    const groups = this.groups();
    const compareData: any[] = [];

    // Sortowanie grup po nazwach zespołów
    const sortedGroups = groups.sort((a, b) => a.team.localeCompare(b.team));

    // Mapa do przechowywania sum Overall dla każdego zespołu
    const teamOverallSums = new Map<string, number>();

    // Pierwsze przejście - oblicz dane graczy i sumy zespołowe
    for (const group of sortedGroups) {
      let teamSum = 0;
      const teamName = group.team || 'FA';

      // Sortowanie graczy w grupie: lastName -> firstName
      const sortedPlayers = group.players.sort((a, b) => {
        if (a.lastName !== b.lastName) return a.lastName.localeCompare(b.lastName);
        return a.firstName.localeCompare(b.firstName);
      });

      for (const player of sortedPlayers) {
        // Pobierz dane gracza z fullNewData lub fullOldData dla Age/Experience
        const playerKey = `${player.firstName} ${player.lastName}`;
        const playerData = this.fullNewData.get(playerKey) || this.fullOldData.get(playerKey);

        const row: any = {
          FirstName: player.firstName,
          LastName: player.lastName,
          Age: playerData?.Age || 0,
          Position: player.position,
          Experience: playerData?.Experience || 0,
          Team: player.team || 'FA',
        };

        // Oblicz Overall dla porównania (bez Potential)
        let overallOld = 0;
        let overallNew = 0;
        let hasOverallData = false;

        // Dodaj wszystkie atrybuty - tylko różnice jako liczby
        for (const skill of SKILL_COLUMNS) {
          const skillData = player.skills[skill as SkillKey];
          const oldVal = skillData?.old ?? null;
          const newVal = skillData?.new ?? null;
          const delta = skillData?.delta;

          // Pokaż tylko różnicę jako liczbę
          row[skill] = delta ?? 0;

          // Zlicz atrybuty do Overall (wszystkie oprócz Potential)
          if (skill !== 'Potential' && skill !== 'Overall') {
            if (oldVal !== null) {
              overallOld += oldVal;
              hasOverallData = true;
            }
            if (newVal !== null) {
              overallNew += newVal;
              hasOverallData = true;
            }
          }
        }

        // Dodaj Overall jako obliczoną wartość - tylko różnica jako liczba
        let overallDelta = 0;
        if (hasOverallData) {
          overallDelta = overallNew - overallOld;
          row['Overall'] = overallDelta;
        } else {
          row['Overall'] = 0;
        }

        // Dodaj do sumy zespołowej
        teamSum += overallDelta;

        compareData.push(row);
      }

      // Zapisz sumę zespołową
      teamOverallSums.set(teamName, teamSum);
    }

    // Drugie przejście - dodaj TeamSum do każdego gracza
    compareData.forEach(row => {
      const teamName = row.Team;
      row.TeamSum = teamOverallSums.get(teamName) || 0;
    });

    return compareData;
  }

  private createSimpleWorksheet(data: any[], withShading: boolean = false): XLSX.WorkSheet {
    if (data.length === 0) {
      return XLSX.utils.aoa_to_sheet([['Brak danych']]);
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    if (withShading && data.length > 0) {
      // Znajdź unikalne zespoły w kolejności wystąpienia
      const uniqueTeams: string[] = [];
      data.forEach((row: any) => {
        const team = row.Team || 'FA';
        if (!uniqueTeams.includes(team)) {
          uniqueTeams.push(team);
        }
      });

      // Określ które zespoły mają być zacieniowane (co drugi)
      const grayTeams = new Set(uniqueTeams.filter((_, index) => index % 2 === 1));

      // Zastosuj style do wierszy
      data.forEach((row: any, rowIndex: number) => {
        const team = row.Team || 'FA';
        if (grayTeams.has(team)) {
          // Zacieniuj cały wiersz (rowIndex + 2, bo pierwszy wiersz to nagłówki)
          const keys = Object.keys(row);
          keys.forEach((key, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
            if (!worksheet[cellRef]) worksheet[cellRef] = { v: row[key] };
            worksheet[cellRef].s = {
              fill: {
                patternType: 'solid',
                fgColor: { rgb: 'E0E0E0' }, // Ciemniejszy szary
              },
            };
          });
        }
      });
    }

    return worksheet;
  }

  readonly canExport = computed(
    () => this.groups().length > 0 && this.fullOldData.size > 0 && this.fullNewData.size > 0,
  );

  private fetchFullCsv(filename: string): Observable<Map<string, any>> {
    return this.http
      .get(`${environment.apiUrl}/csv/file/${filename}`, { responseType: 'text' })
      .pipe(map(text => this.parseFullCsv(text)));
  }

  private parseFullCsv(text: string): Map<string, any> {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const headers = lines[0].split(',').map(h => h.trim());
    const result = new Map<string, any>();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].includes(',')) continue;

      const cols = lines[i].split(',');
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        const value = cols[idx]?.trim() ?? '';
        // Konwertuj liczby dla kolumn numerycznych
        if (
          [
            'Height',
            'Weight',
            'Age',
            'Experience',
            'InsideScoring',
            'Jumpshot',
            '3P',
            'Handling',
            'Passing',
            'Quickness',
            'PostD',
            'PerimeterD',
            'DriveD',
            'Stealing',
            'Blocking',
            'Oreb',
            'Dreb',
            'Jumping',
            'Strength',
            'Potential',
            'Salary1',
            'Salary2',
            'Salary3',
            'Salary4',
            'Salary5',
            'Salary6',
            'Salary7',
          ].includes(h)
        ) {
          row[h] = +value || 0;
        } else {
          row[h] = value;
        }
      });

      // Użyj nazw z CSV jako kluczy w obiekcie
      const key = `${row['FirstName']} ${row['LastName']}`;
      result.set(key, {
        firstName: row['FirstName'],
        lastName: row['LastName'],
        Height: row['Height'] || 0,
        Weight: row['Weight'] || 0,
        Age: row['Age'] || 0,
        position: row['Position'],
        College: row['College'] || '',
        Experience: row['Experience'] || 0,
        team: row['Team'],
        InsideScoring: row['InsideScoring'] || 0,
        Jumpshot: row['Jumpshot'] || 0,
        '3P': row['3P'] || 0,
        Handling: row['Handling'] || 0,
        Passing: row['Passing'] || 0,
        Quickness: row['Quickness'] || 0,
        PostD: row['PostD'] || 0,
        PerimeterD: row['PerimeterD'] || 0,
        DriveD: row['DriveD'] || 0,
        Stealing: row['Stealing'] || 0,
        Blocking: row['Blocking'] || 0,
        Oreb: row['Oreb'] || 0,
        Dreb: row['Dreb'] || 0,
        Jumping: row['Jumping'] || 0,
        Strength: row['Strength'] || 0,
        Potential: row['Potential'] || 0,
        Salary1: row['Salary1'] || 0,
        Salary2: row['Salary2'] || 0,
        Salary3: row['Salary3'] || 0,
        Salary4: row['Salary4'] || 0,
        Salary5: row['Salary5'] || 0,
        Salary6: row['Salary6'] || 0,
        Salary7: row['Salary7'] || 0,
      });
    }

    return result;
  }
}
