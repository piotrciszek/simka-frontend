import { Component, input } from '@angular/core';
import { StandingRow } from '../standings.service';

@Component({
  selector: 'app-standings-table',
  standalone: true,
  templateUrl: './standings-table.component.html',
  styleUrl: './standings-table.component.scss',
})
export class StandingsTableComponent {
  readonly title = input.required<string>();
  readonly rows = input.required<StandingRow[]>();
}