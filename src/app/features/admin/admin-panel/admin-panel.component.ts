import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAdminService, AdminUser, AdminTeam } from '../../../core/services/user-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { TEAM_ORDER } from '../../../core/constrants/team-order';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
})
export class AdminPanelComponent implements OnInit {
  private userAdminService = inject(UserAdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);

  users = signal<AdminUser[]>([]);
  teams = signal<AdminTeam[]>([]);
  loading = signal(false);
  error = signal('');

  showResetDialog = signal(false);
  resetUserId = signal<number | null>(null);
  resetUsername = signal('');
  resetLoading = signal(false);
  resetError = signal('');

  showCreateDialog = signal(false);
  createLoading = signal(false);
  createError = signal('');

  roles = ['admin', 'komisz', 'user'];
  displayedColumns = ['team', 'username', 'role', 'status', 'actions'];

  createForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    email: new FormControl(''),
    role: new FormControl('user', Validators.required),
  });

  sortedUsers = computed(() => {
    const users = this.users();
    return [...users].sort((a, b) => {
      const aActive = a.is_active;
      const bActive = b.is_active;
      const aHasTeam = a.teamName !== null;
      const bHasTeam = b.teamName !== null;

      // Zablokowani na końcu
      if (aActive !== bActive) return aActive ? -1 : 1;

      // Bez drużyny przed zablokowanymi ale po z drużyną
      if (aHasTeam !== bHasTeam) return aHasTeam ? -1 : 1;

      // Sortuj po kolejności drużyn
      const aIdx = TEAM_ORDER.findIndex(
        t => a.teamName?.includes(t) || t.includes(a.teamName || ''),
      );
      const bIdx = TEAM_ORDER.findIndex(
        t => b.teamName?.includes(t) || t.includes(b.teamName || ''),
      );
      return aIdx - bIdx;
    });
  });

  resetForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.userAdminService.getUsers().subscribe({
      next: users => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania użytkowników');
        this.loading.set(false);
      },
    });

    this.userAdminService.getTeams().subscribe({
      next: teams => this.teams.set(teams),
    });
  }

  toggleActive(user: AdminUser): void {
    this.userAdminService.toggleActive(user.id).subscribe({
      next: res => {
        this.users.update(users =>
          users.map(u =>
            u.id === user.id
              ? {
                  ...u,
                  is_active: res.is_active,
                  teamId: res.is_active ? u.teamId : null, // dodaj
                  teamName: res.is_active ? u.teamName : null, // dodaj
                }
              : u,
          ),
        );
        this.snackBar.open(res.message, 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: err => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 }),
    });
  }

  changeRole(user: AdminUser, role: string): void {
    this.userAdminService.changeRole(user.id, role).subscribe({
      next: res => {
        this.loadData();
        this.snackBar.open(res.message, 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: err => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 }),
    });
  }

  assignTeam(user: AdminUser, teamId: number | null): void {
    this.userAdminService.assignTeam(user.id, teamId).subscribe({
      next: () => {
        this.loadData();
        this.snackBar.open('Drużyna przypisana', 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: err => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 }),
    });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${user.username}?`)) return;
    this.userAdminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update(users => users.filter(u => u.id !== user.id));
        this.snackBar.open('Użytkownik usunięty', 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: err => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 }),
    });
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
    this.createForm.reset({ role: 'user' });
    this.createError.set('');
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  submitCreate(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;

    this.createLoading.set(true);
    this.createError.set('');

    const { username, password, email, role } = this.createForm.value;
    this.userAdminService
      .createUser({
        username: username!,
        password: password!,
        email: email || undefined,
        role: role!,
      })
      .subscribe({
        next: () => {
          this.createLoading.set(false);
          this.closeCreateDialog();
          this.loadData();
          this.snackBar.open('Użytkownik utworzony', 'OK', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: err => {
          this.createError.set(err.error?.message || 'Błąd tworzenia');
          this.createLoading.set(false);
        },
      });
  }

  openResetDialog(user: AdminUser): void {
    this.resetUserId.set(user.id);
    this.resetUsername.set(user.username);
    this.resetError.set('');
    this.resetForm.reset();
    this.showResetDialog.set(true);
  }

  closeResetDialog(): void {
    this.showResetDialog.set(false);
  }

  submitReset(): void {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;

    this.resetLoading.set(true);
    this.resetError.set('');

    this.userAdminService
      .resetPassword(this.resetUserId()!, this.resetForm.value.newPassword!)
      .subscribe({
        next: () => {
          this.resetLoading.set(false);
          this.closeResetDialog();
          this.snackBar.open('Hasło zresetowane', 'OK', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: err => {
          this.resetError.set(err.error?.message || 'Błąd resetu');
          this.resetLoading.set(false);
        },
      });
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }

  isAdminOrKomisz(): boolean {
    return this.authService.hasRole('admin', 'komisz');
  }

  availableTeams(currentUserId: number): AdminTeam[] {
    return this.teams().filter(
      t =>
        t.owner_username === null ||
        this.users().find(u => u.id === currentUserId)?.teamName === t.name,
    );
  }
}
