import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CsvFile {
  filename: string;
  size: number;
  modifiedAt: string;
}

interface CsvUpload {
  id: number;
  filename: string;
  season: string;
  is_active: boolean;
  uploaded_at: string;
  uploaded_by: string;
}

interface LoadFileResponse {
  message: string;
  playersCount: number;
}

@Component({
  selector: 'app-rebuild-player-db',
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
    MatTableModule,
    DatePipe,
  ],
  templateUrl: './rebuild-player-db.component.html',
  styleUrl: './rebuild-player-db.component.scss',
})
export class RebuildPlayerDbComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiUrl = environment.apiUrl;

  files = signal<CsvFile[]>([]);
  uploads = signal<CsvUpload[]>([]);
  loading = signal(false);
  loadingFiles = signal(false);
  error = signal('');

  selectedFile = signal<string | null>(null);
  seasonControl = new FormControl('', Validators.required);

  uploadsColumns = ['filename', 'season', 'uploaded_by', 'uploaded_at', 'status'];

  ngOnInit(): void {
    this.loadFiles();
    this.loadHistory();
  }

  loadFiles(): void {
    this.loadingFiles.set(true);
    this.http.get<CsvFile[]>(`${this.apiUrl}/csv/files`).subscribe({
      next: files => {
        this.files.set(files);
        this.loadingFiles.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania listy plików');
        this.loadingFiles.set(false);
      },
    });
  }

  loadHistory(): void {
    this.http.get<CsvUpload[]>(`${this.apiUrl}/csv/uploads`).subscribe({
      next: uploads => this.uploads.set(uploads),
      error: () => {},
    });
  }

  loadFile(): void {
    if (!this.selectedFile() || !this.seasonControl.value) {
      this.seasonControl.markAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.http
      .post<LoadFileResponse>(`${this.apiUrl}/csv/load-file`, {
        filename: this.selectedFile(),
        season: this.seasonControl.value,
      })
      .subscribe({
        next: res => {
          this.loading.set(false);
          this.loadHistory();
          this.snackBar.open(`${res.message} — ${res.playersCount} graczy`, 'OK', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: err => {
          this.error.set(err.error?.message || 'Błąd ładowania pliku');
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
