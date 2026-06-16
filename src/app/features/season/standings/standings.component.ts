import { Component, computed, inject, signal } from '@angular/core';
import { StandingsTableComponent } from './standings-table/standings-table.component';
import { StandingsService, StandingRow } from './standings.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [StandingsTableComponent],
  templateUrl: './standings.component.html',
  styleUrl: './standings.component.scss',
})
export class StandingsComponent {
  private readonly standingsService = inject(StandingsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly easternConference = signal<StandingRow[]>([]);
  readonly westernConference = signal<StandingRow[]>([]);

  readonly hasData = computed(
    () => this.easternConference().length > 0 || this.westernConference().length > 0,
  );

  constructor() {
    this.standingsService.getStandings().subscribe({
      next: standings => {
        this.easternConference.set(standings.easternConference);
        this.westernConference.set(standings.westernConference);
        this.loading.set(false);
      },
      error: err => {
  console.error('STANDINGS ERROR', err);

  this.error.set('Nie udało się pobrać tabeli standings.');
  this.loading.set(false);
},
    });
  }
}