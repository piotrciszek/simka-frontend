import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TacticsService } from '../../../core/services/tactics.service';
import { TacticsLogEntry, TacticsData } from '../../../core/models/tactics.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tactics-preview',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './tactics-preview.component.html',
  styleUrl: './tactics-preview.component.scss',
})
export class TacticsPreviewComponent {
  private dialogRef = inject(MatDialogRef<TacticsPreviewComponent>);
  private tacticsService = inject(TacticsService);
  private snackBar = inject(MatSnackBar);

  data: TacticsLogEntry = inject(MAT_DIALOG_DATA);
  tacticsData = signal<TacticsData | null>(null);
  approving = signal(false);
  error = signal('');
  raceCondition = signal(false);

  positions = ['C', 'PF', 'SF', 'SG', 'PG'];

  constructor() {
    if (this.data.status === 'approved') {
      const approved = this.data.dataApproved;
      if (approved) {
        this.tacticsData.set(typeof approved === 'string' ? JSON.parse(approved) : approved);
      }
    } else if (this.data.status === 'pending') {
      this.tacticsService.openForReview(this.data.id).subscribe({
        next: res => {
          const pending = res.tactic?.data_pending;
          if (pending) {
            this.tacticsData.set(typeof pending === 'string' ? JSON.parse(pending) : pending);
          }
        },
        error: err => {
          this.error.set(err.error?.message || 'Błąd ładowania taktyki');
        },
      });
    } else {
      const pending = this.data.dataPending;
      if (pending) {
        this.tacticsData.set(typeof pending === 'string' ? JSON.parse(pending) : pending);
      }
    }
  }

  approve(): void {
    this.approving.set(true);
    this.tacticsService.approveTactics(this.data.id).subscribe({
      next: () => {
        this.snackBar.open('Taktyka zatwierdzona!', 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.dialogRef.close({ approved: true });
      },
      error: err => {
        if (err.status === 409) {
          this.raceCondition.set(true);
          this.error.set('Taktyka zmieniła się od momentu otwarcia — wróć do listy');
        } else {
          this.error.set(err.error?.message || 'Błąd zatwierdzania');
        }
        this.approving.set(false);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({ approved: false });
  }
}
