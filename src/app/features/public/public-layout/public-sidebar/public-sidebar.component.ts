import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { NAV_MENUS } from '../../../../core/constants/nav.model';

@Component({
  selector: 'app-public-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-sidebar.component.html',
  styleUrl: './public-sidebar.component.scss',
})
export class PublicSidebarComponent {
  private router = inject(Router);

  currentMenu = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url),
      map(url => {
        const route = url.replace('/html/', '').split('?')[0];
        return NAV_MENUS.find(m => m.links.some(l => l.route === route)) ?? null;
      }),
    ),
  );
}
