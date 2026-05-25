import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { environment } from '../../../environments/environment';

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

  getUploads(): Observable<CsvUpload[]> {
    return this.http.get<CsvUpload[]>(`${this.apiUrl}/csv/uploads`);
  }
}
