import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: 'admin' | 'komisz' | 'user';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  teamId: number | null;
  teamName: string | null;
}

export interface AdminTeam {
  id: number;
  name: string;
  owner_username: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  getTeams(): Observable<AdminTeam[]> {
    return this.http.get<AdminTeam[]>(`${this.apiUrl}/teams`);
  }

  createUser(data: {
    username: string;
    password: string;
    email?: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  resetPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/reset-password`, { newPassword });
  }

  toggleActive(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/toggle-active`, {});
  }

  changeRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  assignTeam(userId: number, teamId: number | null): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/team`, { teamId });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
