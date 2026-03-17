import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GmService, GmEntry } from '../../core/services/gm.service';
import { TEAM_ORDER } from '../../core/constants/team-order';

@Component({
  selector: 'app-gm-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './gm-list.component.html',
  styleUrl: './gm-list.component.scss',
})
export class GmListComponent implements OnInit {
  private gmService = inject(GmService);

  gms = signal<GmEntry[]>([]);
  sortedGms = computed(() =>
    [...this.gms()].sort((a, b) => {
      const aIdx = TEAM_ORDER.findIndex(
        t => a.teamName?.includes(t) || t.includes(a.teamName || ''),
      );
      const bIdx = TEAM_ORDER.findIndex(
        t => b.teamName?.includes(t) || t.includes(b.teamName || ''),
      );
      return aIdx - bIdx;
    }),
  );
  loading = signal(true);
  error = signal('');

  readonly FORUM_INBOX = 'https://forum.e-nba.pl/messenger/';

  ngOnInit(): void {
    this.gmService.getGmList().subscribe({
      next: data => {
        this.gms.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania listy GM');
        this.loading.set(false);
      },
    });
  }
}
