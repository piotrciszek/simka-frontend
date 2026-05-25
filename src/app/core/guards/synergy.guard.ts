import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const synergyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Admin zawsze ma dostęp
  if (user.role === 'admin') {
    return true;
  }

  // Sprawdź pole canAccessSynergy z bazy danych
  if (user.canAccessSynergy) {
    return true;
  }

  // Przekieruj na główną stronę jeśli brak dostępu
  router.navigate(['/html/standings']);
  return false;
};