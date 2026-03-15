import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light' | 'retro';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'simbasket-theme';

  currentTheme = signal<Theme>(this.getSavedTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'retro') {
      return saved;
    }
    return 'dark';
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light', 'theme-retro');
    body.classList.add(`theme-${theme}`);
  }
}
