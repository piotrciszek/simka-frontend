import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvDataService } from '../../services/csv-data.service';

@Component({
  selector: 'app-import-csv',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="import-page">
      <h1>Import CSV</h1>

      <div class="toolbar">
        <input
          #fileInput
          hidden
          type="file"
          accept=".csv"
          (change)="selectFile($event)"
        />

        <button (click)="fileInput.click()">
          Wybierz CSV
        </button>

        <button
          (click)="loadCsv()"
          [disabled]="!selectedFile"
        >
          Wczytaj
        </button>
      </div>

      <p *ngIf="selectedFileName">
        Wybrany plik: <strong>{{ selectedFileName }}</strong>
      </p>

      <p *ngIf="csvData.fileName">
        Aktualnie wczytany plik:
        <strong>{{ csvData.fileName }}</strong>
      </p>

      <p *ngIf="csvData.rows.length">
        Wczytano zawodników:
        <strong>{{ csvData.rows.length }}</strong>
      </p>
    </section>
  `,
  styles: [`
    .import-page {
      padding: 24px;
    }

    h1 {
      color: #ff6a00;
      margin-bottom: 24px;
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

    p {
      color: #ddd;
    }
  `],
})
export class ImportCsvComponent {
  selectedFile: File | null = null;

  selectedFileName = '';

  constructor(
    public csvData: CsvDataService,
    private cdr: ChangeDetectorRef,
  ) {}

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedFile = input.files[0];
    this.selectedFileName = this.selectedFile.name;

    input.value = '';
  }

  async loadCsv(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    await this.csvData.loadFile(this.selectedFile);

    this.cdr.detectChanges();
  }
}
