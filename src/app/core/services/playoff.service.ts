import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayoffService {
  // true gdy oba pliki play-offs są dostępne na serwerze
  playoffsAvailable = signal(false);

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    // fetch() zamiast HttpClient — omija jwtInterceptor, więc błąd 404/401
    // nie spowoduje przypadkowego wylogowania użytkownika
    try {
      const [a, b] = await Promise.all([
        fetch(`${environment.apiUrl}/uploads/html/playoffs.htm`, { method: 'HEAD' }),
        fetch(`${environment.apiUrl}/uploads/html/playoffleaders.htm`, { method: 'HEAD' }),
      ]);
      this.playoffsAvailable.set(a.ok && b.ok);
    } catch {
      this.playoffsAvailable.set(false);
    }
  }
}
