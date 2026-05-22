import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Papa from 'papaparse';

@Component({
  selector: 'app-advanced-statsp',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="advanced-stats-page">
      <h1>Zaawansowane statystyki P</h1>

      <div class="toolbar">
        <input
          #fileInput
          hidden
          type="file"
          accept=".csv"
          (change)="selectFile($event)"
        />

        <button (click)="fileInput.click()">Import CSV</button>

        <button
          (click)="loadCsv()"
          [disabled]="!selectedFile"
        >
          Wczytaj
        </button>
      </div>

      <div *ngIf="fileName">
        Wybrano: <strong>{{ fileName }}</strong>
      </div>

      <div *ngIf="rows.length" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th
                *ngFor="let h of headers"
                (click)="sort(h)"
                style="cursor:pointer"
              >
                {{ h }}
                <span *ngIf="sortColumn === h">
                  {{ sortDirection === 'asc' ? '^' : '¡' }}
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let row of rows">
              <td *ngFor="let h of headers">
                {{ row[h] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .advanced-stats-page {
      padding: 24px;
    }

    .toolbar {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    button {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      background: #ff6a00;
      color: white;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .table-wrapper {
      margin-top: 20px;
      max-height: 600px;
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1100px;
    }

    th,
    td {
      padding: 10px;
      border-bottom: 1px solid #333;
      white-space: nowrap;
    }
    
    /* Pierwsza kolumna Name */

	th:first-child,
	td:first-child {
	  position: sticky;
	  left: 0;
	  z-index: 2;
	  background: #111;
	}
	
	/* Nag³ówek Name nad wszystkim */
	
	th:first-child {
	  z-index: 3;
	  background: #151515;
	}

    th {
      position: sticky;
      top: 0;
      background: #151515;
      color: #ff6a00;
      z-index: 1;
    }
  `],
})
export class AdvancedStatspComponent {
  selectedFile: File | null = null;

  fileName = '';

  headers: string[] = [];

  rows: Record<string, string>[] = [];

  sortColumn = '';

  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private cdr: ChangeDetectorRef) {}

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedFile = input.files[0];
    this.fileName = this.selectedFile.name;

    input.value = '';
  }

  loadCsv(): void {
    if (!this.selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const csvText = reader.result as string;

      const result = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
      });

      const baseRows = result.data;

      const pgColumns = [
        'Minutes',
        'FG',
        'FGA',
        'FT',
        'FTA',
        '3P',
        '3PA',
        'Rebounds',
        'Assists',
        'Steals',
        'Blocks',
        'Turnovers',
        'Fouls',
        'Points',
        'OREB',
      ];

      this.rows = baseRows.map((row) => {
        const games = Number(row['Games']) || 0;

        const newRow: Record<string, string> = {
          Name: row['Name'],
          Team: row['Team'],
          Position: row['Position'],
        };

        pgColumns.forEach((col) => {
          const value = Number(row[col]) || 0;
		  const pgName = `${col}`;
          newRow[pgName] =
            games > 0
              ? (value / games).toFixed(2)
              : '0.00';
        });

        const fg = Number(row['FG']) || 0;
        const fga = Number(row['FGA']) || 0;
        const threeP = Number(row['3P']) || 0;
        const threePA = Number(row['3PA']) || 0;
        const ft = Number(row['FT']) || 0;
        const fta = Number(row['FTA']) || 0;

        newRow['FG%'] =
          fga > 0 ? ((fg / fga) * 100).toFixed(1) : '0.0';

        newRow['3P%'] =
          threePA > 0 ? ((threeP / threePA) * 100).toFixed(1) : '0.0';

        newRow['FT%'] =
          fta > 0 ? ((ft / fta) * 100).toFixed(1) : '0.0';
          
          const points = Number(row['Points']) || 0;
			const rebounds = Number(row['Rebounds']) || 0;
			const assists = Number(row['Assists']) || 0;
			const steals = Number(row['Steals']) || 0;
			const blocks = Number(row['Blocks']) || 0;
			const turnovers = Number(row['Turnovers']) || 0;
			const oreb = Number(row['OREB']) || 0;

			const usgTotal =
			  fga + (0.44 * fta) + turnovers;
			
			const possTotal =
			  fga + (0.44 * fta) - oreb + turnovers;
			
			const usgPG =
			  games > 0 ? usgTotal / games : 0;
			
			const possPG =
			  games > 0 ? possTotal / games : 0;
			
			const ppp =
			  possTotal > 0
			    ? points / possTotal
			    : 0;
			
			newRow['USG'] = usgPG.toFixed(2);
			newRow['POSS'] = possPG.toFixed(2);
			newRow['PPP'] = ppp.toFixed(2);
			
			newRow['TS%'] =
			  (fga + 0.44 * fta) > 0
			    ? ((points / (2 * (fga + 0.44 * fta))) * 100).toFixed(1)
			    : '0.0';
			
			newRow['eFG%'] =
			  fga > 0
			    ? (((fg + 0.5 * threeP) / fga) * 100).toFixed(1)
			    : '0.0';
			
			newRow['EFF'] =
			  (
			    points +
			    rebounds +
			    assists +
			    steals +
			    blocks -
			    ((fga - fg) + (fta - ft) + turnovers)
			  ).toFixed(1);
			
			newRow['AST/TO'] =
			  turnovers > 0
			    ? (assists / turnovers).toFixed(2)
			    : assists > 0
			      ? assists.toFixed(2)
			      : '0.00';

        return newRow;
      });

      const pgHeaders = [...pgColumns];

      this.headers = [
        'Name',
        'Team',
        'Position',
        ...pgHeaders,
      ];

      this.headers.splice(this.headers.indexOf('FGA') + 1, 0, 'FG%');
      this.headers.splice(this.headers.indexOf('FTA') + 1, 0, 'FT%');
      this.headers.splice(this.headers.indexOf('3PA') + 1, 0, '3P%');
		this.headers.push(
		  'eFG%',
		  'TS%',
		  'EFF',
		  'AST/TO'
		);
		
		this.headers.push(
		  'USG',
		  'POSS',
		  'PPP'
		);
      this.cdr.detectChanges();
    };

    reader.readAsText(this.selectedFile, 'utf-8');
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.rows.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return this.sortDirection === 'asc'
          ? aNum - bNum
          : bNum - aNum;
      }

      return this.sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }
}
