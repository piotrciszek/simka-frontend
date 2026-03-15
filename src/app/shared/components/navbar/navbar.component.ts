import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  isMobile = input<boolean>(false);
  menuToggle = output<void>();
  showEmailDialog = signal(false);
  emailLoading = signal(false);
  emailError = signal('');
  emailControl = new FormControl('', [Validators.email]);

  themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'dark', label: 'Ciemny', icon: 'dark_mode' },
    { value: 'light', label: 'Jasny', icon: 'light_mode' },
    { value: 'retro', label: 'Retro', icon: 'sports_basketball' },
  ];

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  openEmailDialog(): void {
    const currentEmail = this.authService.getCurrentUser()?.email || '';
    this.emailControl.setValue(currentEmail);
    this.emailError.set('');
    this.showEmailDialog.set(true);
  }

  closeEmailDialog(): void {
    this.showEmailDialog.set(false);
  }

  submitEmail(): void {
    if (this.emailControl.invalid) return;

    this.emailLoading.set(true);
    this.emailError.set('');

    const userId = this.authService.getCurrentUser()?.id;

    this.http
      .put(`${environment.apiUrl}/users/${userId}/email`, {
        email: this.emailControl.value,
      })
      .subscribe({
        next: () => {
          this.emailLoading.set(false);
          this.closeEmailDialog();
          this.snackBar.open('Email zaktualizowany', 'OK', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: err => {
          this.emailError.set(err.error?.message || 'Błąd zapisu');
          this.emailLoading.set(false);
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
