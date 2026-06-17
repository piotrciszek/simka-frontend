import { Component, inject, signal } from '@angular/core';
import { StandingsTableComponent } from './standings-table/standings-table.component';
import { StandingsService } from './standings.service';

type StandingsView = 'conference' | 'league' | 'division';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [StandingsTableComponent],
  templateUrl: './standings.component.html',
  styleUrl: './standings.component.scss',
})
export class StandingsComponent {
  readonly standingsService = inject(StandingsService);

  readonly selectedView = signal<StandingsView>('conference');

  constructor() {
    this.standingsService.loadStandings();
  }

  selectView(view: StandingsView): void {
    this.selectedView.set(view);
  }
}
