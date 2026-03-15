import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ActivityService, UserActivity } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, DatePipe],
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.scss',
})
export class ActivityLogComponent implements OnInit {
  private activityService = inject(ActivityService);
  authService = inject(AuthService);

  users = signal<UserActivity[]>([]);
  loading = signal(false);
  error = signal('');

  displayedColumns = ['team', 'username', 'loggedAt', 'ipAddress'];

  ngOnInit(): void {
    this.loading.set(true);
    this.activityService.getActivity().subscribe({
      next: data => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania danych');
        this.loading.set(false);
      },
    });
  }
}
