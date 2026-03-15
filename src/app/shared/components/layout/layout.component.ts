import { Component, inject, signal, viewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    NavbarComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements AfterViewInit {
  authService = inject(AuthService);
  sidenav = viewChild<MatSidenav>('sidenav');
  private breakpoint = inject(BreakpointObserver);

  isMobile = signal(false);

  ngAfterViewInit() {
    this.breakpoint.observe('(max-width: 945px)').subscribe(result => {
      this.isMobile.set(result.matches);
      if (result.matches) {
        this.sidenav()?.close();
      } else {
        this.sidenav()?.open();
      }
    });
  }

  toggleSidenav() {
    this.sidenav()?.toggle();
  }
}
