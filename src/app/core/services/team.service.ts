import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../models/team.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/teams`);
  }

  getTeam(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/teams/${id}`);
  }

  createTeam(name: string, userId?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams`, { name, user_id: userId });
  }

  updateTeam(id: number, data: Partial<Team>): Observable<any> {
    return this.http.put(`${this.apiUrl}/teams/${id}`, data);
  }
}
