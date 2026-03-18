import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SaveFile {
  filename: string;
  size: number;
  modifiedAt: string;
  isDirectory: boolean;
}

@Component({
  selector: 'app-save-files',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './save-files.component.html',
  styleUrl: './save-files.component.scss',
})
export class SaveFilesComponent {
  private http = inject(HttpClient);

  files = signal<SaveFile[]>([]);
  loading = signal(true);
  error = signal('');

  readonly baseUrl = `${environment.apiUrl}/save`;
  readonly apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.http.get<SaveFile[]>(`${environment.apiUrl}/save/files`).subscribe({
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
