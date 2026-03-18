import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface PbpFile {
  filename: string;
  size: number;
  modifiedAt: string;
}

@Component({
  selector: 'app-pbp-files',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './pbp-files.component.html',
  styleUrl: './pbp-files.component.scss',
})
export class PbpFilesComponent implements OnInit {
  private http = inject(HttpClient);

  files = signal<PbpFile[]>([]);
  loading = signal(true);
  error = signal('');

  readonly baseUrl = `${environment.apiUrl}/pbp`;

  ngOnInit(): void {
    this.http.get<PbpFile[]>(`${environment.apiUrl}/pbp/files`).subscribe({
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
