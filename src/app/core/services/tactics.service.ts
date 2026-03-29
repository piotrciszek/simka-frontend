import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tactics, TacticsData } from '../models/tactics.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TacticsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTacticsByTeam(teamId: number): Observable<Tactics> {
    return this.http.get<Tactics>(`${this.apiUrl}/tactics/team/${teamId}`);
  }

  createTactics(teamId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tactics/team/${teamId}`, {});
  }

  saveDraft(tacticId: number, data: TacticsData): Observable<any> {
    return this.http.put(`${this.apiUrl}/tactics/${tacticId}/draft`, { data });
  }

  submitTactics(tacticId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/tactics/${tacticId}/submit`, {});
  }

  openForReview(tacticId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/tactics/${tacticId}/review`, {});
  }

  approveTactics(tacticId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/tactics/${tacticId}/approve`, {});
  }

  getPendingTactics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tactics/pending`);
  }
}
