import { CanActivateFn } from '@angular/router';

export const advancedStatsGuard: CanActivateFn = () => {

  const access = localStorage.getItem('advanced_stats_access');

  if (access === 'true') {
    return true;
  }

  const password = prompt(
    'Podaj haslo do Zaawansowanych statystyk'
  );

  if (password === 'simka123') {

    localStorage.setItem(
      'advanced_stats_access',
      'true'
    );

    return true;
  }

  return false;
};
