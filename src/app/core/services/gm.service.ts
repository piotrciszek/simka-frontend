import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface GmEntry {
  teamName: string;
  logo_path: string | null;
  username: string | null;
  email: string | null;
}

@Injectable({ providedIn: 'root' })
export class GmService {
  private http = inject(HttpClient);

  getGmList() {
    return this.http.get<GmEntry[]>(`${environment.apiUrl}/users/gm-list`);
  }
}
