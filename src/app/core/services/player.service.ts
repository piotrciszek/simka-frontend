import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { environment } from '../../../environments/environment';

interface UploadResponse {
  message: string;
  playersCount: number;
}

export interface CsvUpload {
  id: number;
  filename: string;
  season: string;
  is_active: boolean;
  uploaded_at: string;
  uploaded_by: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPlayers(team?: string): Observable<Player[]> {
    const url = team
      ? `${this.apiUrl}/csv/players?team=${encodeURIComponent(team)}`
      : `${this.apiUrl}/csv/players`;
    return this.http.get<Player[]>(url);
  }

  uploadCsv(file: File, season: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('season', season);
    return this.http.post<UploadResponse>(`${this.apiUrl}/csv/upload`, formData);
  }

  getUploads(): Observable<CsvUpload[]> {
    return this.http.get<CsvUpload[]>(`${this.apiUrl}/csv/uploads`);
  }
}
