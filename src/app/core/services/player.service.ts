import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { environment } from '../../../environments/environment';

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

  uploadCsv(file: File, season: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('season', season);
    return this.http.post(`${this.apiUrl}/csv/upload`, formData);
  }

  getUploads(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/csv/uploads`);
  }
}
