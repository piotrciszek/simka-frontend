import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CsvFile {
  filename: string;
  size: number;
  modifiedAt: string;
}

interface GenerateStatsResponse {
  message: string;
  playersProcessed: number;
  statsGenerated: number;
}

@Component({
  selector: 'app-generate-stats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './generate-stats.component.html',
  styleUrl: './generate-stats.component.scss',
})
export class GenerateStatsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiUrl = environment.apiUrl;

  files = signal<CsvFile[]>([]);
  loading = signal(false);
  loadingFiles = signal(false);
  error = signal('');

  selectedFile = signal<string | null>(null);
  seasonControl = new FormControl('', Validators.required);

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.loadingFiles.set(true);

    this.http.get<CsvFile[]>(`${this.apiUrl}/stats/files`).subscribe({
      next: files => {
        this.files.set(files);
        this.loadingFiles.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania listy plików statystyk');
        this.loadingFiles.set(false);
      },
    });
  }

  generateStats(): void {
    if (!this.selectedFile() || !this.seasonControl.value) {
      this.seasonControl.markAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.http
      .post<GenerateStatsResponse>(`${this.apiUrl}/stats/generate-from-file`, {
        filename: this.selectedFile(),
        season: this.seasonControl.value,
      })
      .subscribe({
        next: res => {
          this.loading.set(false);
          this.snackBar.open(
            `${res.message} — ${res.playersProcessed} graczy, ${res.statsGenerated} statystyk`,
            'OK',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            },
          );
        },
        error: err => {
          this.error.set(err.error?.message || 'Błąd generowania statystyk');
          this.loading.set(false);
        },
      });
  }

  onFileSelect(filename: string): void {
    this.selectedFile.set(filename);
    // Wykryj sezon z nazwy pliku — jeśli zaczyna się od 4 cyfr
    const match = filename.match(/^(\d{4})/);
    if (match) {
      const year = parseInt(match[1]);
      const season = `${year}`;
      this.seasonControl.setValue(season);
    } else {
      this.seasonControl.setValue('');
    }
  }
}
