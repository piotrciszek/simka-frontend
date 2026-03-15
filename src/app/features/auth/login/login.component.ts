import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  onSubmit(): void {
    if (!this.username() || !this.password()) {
      this.error.set('Podaj login i hasło');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.username(), this.password()).subscribe({
      next: response => {
        if (response.mustChangePassword) {
          this.router.navigate(['/change-password']);
        } else {
          this.router.navigate(['/teams']);
        }
      },
      error: err => {
        this.error.set(err.error?.message || 'Błąd logowania');
        this.loading.set(false);
      },
    });
  }
}
