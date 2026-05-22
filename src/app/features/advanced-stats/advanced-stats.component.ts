import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Papa from 'papaparse';

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="advanced-stats-page">
      <h1>Zaawansowane statystyki</h1>

      <div class="import-box">
        <label for="csvFile">Wybierz plik CSV:</label>

        <input
          id="csvFile"
          type="file"
          accept=".csv"
          (change)="onCsvSelected($event)"
        />
      </div>

      <div *ngIf="fileName" class="file-info">
        Wczytany plik: <strong>{{ fileName }}</strong>
      </div>

      <div *ngIf="rows.length > 0" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th *ngFor="let header of headers">
                {{ header }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let row of rows">
              <td *ngFor="let header of headers">
                {{ row[header] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="rows.length === 0" class="empty-state">
        Wybierz plik CSV, ¿eby zobaczyæ dane.
      </p>
    </section>
  `,
  styles: [`
    .advanced-stats-page {
      padding: 24px;
    }

    h1 {
      color: #ff6a00;
      margin-bottom: 24px;
    }

    .import-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #151515;
    }

    input[type="file"] {
      color: #fff;
    }

    .file-info {
      margin-bottom: 16px;
      color: #ddd;
    }

	.table-wrapper {
	  max-height: 600px;
	  overflow: auto;
	
	  border: 1px solid #333;
	  border-radius: 8px;
	}
	
	/* Scrollbar Chrome/Edge */
	.table-wrapper::-webkit-scrollbar {
	  width: 10px;
	  height: 10px;
	}
	
	.table-wrapper::-webkit-scrollbar-track {
	  background: #1a1a1a;
	}
	
	.table-wrapper::-webkit-scrollbar-thumb {
	  background: #ff6a00;
	  border-radius: 10px;
	}
	
	.table-wrapper::-webkit-scrollbar-thumb:hover {
	  background: #ff8533;
	}

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
      background: #111;
    }

    th,
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #333;
      text-align: left;
      font-size: 13px;
      white-space: nowrap;
    }

    th {
      color: #ff6a00;
      background: #1f1f1f;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    td {
      color: #eee;
    }

    .empty-state {
      color: #aaa;
      margin-top: 24px;
    }
  `],
})
export class AdvancedStatsComponent {
  fileName = '';

  headers: string[] = [];

  rows: Record<string, string>[] = [];

  onCsvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.fileName = file.name;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (result) => {
        this.rows = result.data;
        this.headers = result.meta.fields ?? [];

        console.log('CSV rows:', this.rows);
        console.log('CSV headers:', this.headers);
      },
      error: (error) => {
        console.error('B³¹d CSV:', error);
      },
    });
  }
}
