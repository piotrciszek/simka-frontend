import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StandingsResponse } from '../models/standings.model';

@Injectable({ providedIn: 'root' })
export class StandingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Endpoint publiczny — zwykły HttpClient jest OK (jwtInterceptor doda token, jeśli jest,
  // ale backend go nie wymaga, więc 401 → wylogowanie tu nie wystąpi).
  // season = null → backend zwraca bieżący sezon.
  getStandings(season: number | null): Observable<StandingsResponse> {
    const params = season !== null ? new HttpParams().set('season', season) : undefined;
    return this.http.get<StandingsResponse>(`${this.apiUrl}/api/standings`, { params });
  }
}
