import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NAV_MENUS } from '../../../../core/constants/nav.model';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { PlayoffService } from '../../../../core/services/playoff.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent {
  private router = inject(Router);
  themeService = inject(ThemeService);
  private playoffService = inject(PlayoffService);

  // ukrywa sekcję Playoffs gdy pliki niedostępne na serwerze
  menus = computed(() =>
    NAV_MENUS.filter(m => m.key !== 'playoffs' || this.playoffService.playoffsAvailable()),
  );
  openMenu = signal<string | null>(null);

  themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'dark', label: 'Ciemny', icon: 'dark_mode' },
    { value: 'light', label: 'Jasny', icon: 'light_mode' },
    { value: 'retro', label: 'Retro', icon: 'sports_basketball' },
  ];

  isOpen(key: string): boolean {
    return this.openMenu() === key;
  }

  toggleMenu(key: string, event: Event): void {
    event.stopPropagation();
    this.openMenu.set(this.openMenu() === key ? null : key);
  }

  navigateTo(route: string): void {
    this.router.navigate(['/html', route]);
    this.openMenu.set(null);
  }

  closeMenus(): void {
    this.openMenu.set(null);
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
