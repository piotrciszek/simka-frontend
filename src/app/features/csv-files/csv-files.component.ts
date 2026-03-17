import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CsvFile {
  filename: string;
  size: number;
  modifiedAt: string;
}

@Component({
  selector: 'app-csv-files',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, DatePipe],
  templateUrl: './csv-files.component.html',
  styleUrl: './csv-files.component.scss',
})
export class CsvFilesComponent implements OnInit {
  private http = inject(HttpClient);

  files = signal<CsvFile[]>([]);
  loading = signal(true);
  error = signal('');

  readonly baseUrl = `${environment.apiUrl}/csv`;

  ngOnInit(): void {
    this.http.get<CsvFile[]>(`${environment.apiUrl}/csv/files`).subscribe({
      next: files => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania listy plików');
        this.loading.set(false);
      },
    });
  }
}
