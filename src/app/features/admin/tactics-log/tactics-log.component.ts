import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TacticsService } from '../../../core/services/tactics.service';
import { TacticsLogEntry } from '../../../core/models/tactics.model';
import { TacticsPreviewComponent } from '../tactics-preview/tactics-preview.component';

@Component({
  selector: 'app-tactics-log',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './tactics-log.component.html',
  styleUrl: './tactics-log.component.scss',
})
export class TacticsLogComponent implements OnInit {
  private tacticsService = inject(TacticsService);
  private dialog = inject(MatDialog);

  entries = signal<TacticsLogEntry[]>([]);
  loading = signal(false);
  error = signal('');

  displayedColumns = ['team', 'manager', 'submittedAt', 'approvedBy', 'approvedAt', 'actions'];

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.loading.set(true);
    this.tacticsService.getPendingTactics().subscribe({
      next: entries => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania danych');
        this.loading.set(false);
      },
    });
  }

  openTactics(entry: TacticsLogEntry): void {
    const dialogRef = this.dialog.open(TacticsPreviewComponent, {
      data: entry,
      maxWidth: '90vw',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.approved) {
        this.loadEntries();
      }
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Oczekuje';
      case 'approved':
        return 'Zatwierdzona';
      case 'draft':
        return 'Szkic';
      default:
        return status;
    }
  }
}
