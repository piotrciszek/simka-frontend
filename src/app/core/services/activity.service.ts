import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserActivity {
  id: number;
  username: string;
  teamName: string | null;
  teamLogo: string | null;
  ipAddress: string | null;
  loggedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getActivity(): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/auth/activity`);
  }
}
