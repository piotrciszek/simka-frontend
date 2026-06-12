import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  error = signal('');
  success = signal('');
  loading = signal(false);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  onSubmit(): void {
    if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.error.set('Wypełnij wszystkie pola');
      return;
    }

    if (this.newPassword().length < 8) {
      this.error.set('Nowe hasło musi mieć minimum 8 znaków');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('Nowe hasła nie są identyczne');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.changePassword(this.currentPassword(), this.newPassword()).subscribe({
      next: () => {
        this.success.set('Hasło zostało zmienione!');
        setTimeout(() => this.router.navigate(['/teams']), 1500);
      },
      error: err => {
        this.error.set(err.error?.message || 'Błąd zmiany hasła');
        this.loading.set(false);
      },
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
