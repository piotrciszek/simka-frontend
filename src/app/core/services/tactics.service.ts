import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tactics, TacticsData, TacticsLogEntry } from '../models/tactics.model';

interface OpenForReviewResponse {
  message: string;
  tactic: {
    data_pending: TacticsData | string | null;
  };
}
import { environment } from '../../../environments/environment';

interface TacticsActionResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TacticsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTacticsByTeam(teamId: number): Observable<Tactics> {
    return this.http.get<Tactics>(`${this.apiUrl}/tactics/team/${teamId}`);
  }

  createTactics(teamId: number): Observable<TacticsActionResponse> {
    return this.http.post<TacticsActionResponse>(`${this.apiUrl}/tactics/team/${teamId}`, {});
  }

  saveDraft(tacticId: number, data: TacticsData): Observable<TacticsActionResponse> {
    return this.http.put<TacticsActionResponse>(`${this.apiUrl}/tactics/${tacticId}/draft`, { data });
  }

  submitTactics(tacticId: number): Observable<TacticsActionResponse> {
    return this.http.put<TacticsActionResponse>(`${this.apiUrl}/tactics/${tacticId}/submit`, {});
  }

  openForReview(tacticId: number): Observable<OpenForReviewResponse> {
    return this.http.put<OpenForReviewResponse>(`${this.apiUrl}/tactics/${tacticId}/review`, {});
  }

  approveTactics(tacticId: number): Observable<TacticsActionResponse> {
    return this.http.put<TacticsActionResponse>(`${this.apiUrl}/tactics/${tacticId}/approve`, {});
  }

  getPendingTactics(): Observable<TacticsLogEntry[]> {
    return this.http.get<TacticsLogEntry[]>(`${this.apiUrl}/tactics/pending`);
  }
}
