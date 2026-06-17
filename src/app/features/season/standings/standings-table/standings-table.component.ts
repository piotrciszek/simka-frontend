import { Component, input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
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
  readonly showTopEightSeparator = input(false);
getLogoUrl(teamCode: string): string {
  return '/debug/logo-test.png';
}
getAwayRecord(row: StandingRow): string {
  const [homeWins, homeLosses] = row.home_record
    .split('-')
    .map(Number);

  const awayWins = row.wins - homeWins;
  const awayLosses = row.losses - homeLosses;

  return `${awayWins}-${awayLosses}`;
}
getGamesBack(rowIndex: number, gamesBack: string): string {
  return rowIndex === 0 ? '-' : gamesBack === '-' ? '0,0' : gamesBack;
}
}
