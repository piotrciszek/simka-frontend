import { Component } from '@angular/core';
import { PlayerCompareComponent, type CompareConfig } from '../../../shared/components/player-compare/player-compare.component';

@Component({
  selector: 'app-compare-stats',
  standalone: true,
  imports: [PlayerCompareComponent],
  template: `<app-player-compare [config]="compareConfig" />`,
})
export class CompareStatsComponent {
  compareConfig: CompareConfig = {
    type: 'stats',
    pageTitle: 'Porównaj graczy',
    tableHeader: 'Statystyka',
    playerNameField: 'Name',
    playerTeamField: 'Team',
    dataFields: [
      { key: 'Points', label: 'Points' },
      { key: 'Rebounds', label: 'Rebounds' },
      { key: 'Assists', label: 'Assist' },
      { key: 'FG%', label: 'FG%' },
      { key: '3P%', label: '3P%' },
      { key: 'FT%', label: 'FT%' },
      { key: 'TS%', label: 'TS%' },
      { key: 'eFG%', label: 'eFG%' },
      { key: 'EFF', label: 'EFF' },
      { key: 'POSS', label: 'POSS' },
      { key: 'PPP', label: 'PPP' },
      { key: 'AST/TO', label: 'AST/TO' },
      { key: 'USG', label: 'USG %' },
      { key: 'PIE', label: 'PIE' },
    ],
  };
}
