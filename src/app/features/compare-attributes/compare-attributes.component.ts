import { Component } from '@angular/core';
import { PlayerCompareComponent, type CompareConfig } from '../../shared/components/player-compare/player-compare.component';

@Component({
  selector: 'app-compare-attributes',
  standalone: true,
  imports: [PlayerCompareComponent],
  template: `<app-player-compare [config]="compareConfig" />`,
})
export class CompareAttributesComponent {
  compareConfig: CompareConfig = {
    type: 'attributes',
    pageTitle: 'Porównaj atrybuty graczy',
    tableHeader: 'Atrybut',
    playerNameField: 'name',
    playerTeamField: 'team',
    dataFields: [
      { key: 'InsideScoring', label: 'Inside Scoring' },
      { key: 'Jumpshot', label: 'Jump Shot' },
      { key: '3P', label: '3P Shooting' },
      { key: 'Handling', label: 'Ball Handling' },
      { key: 'Passing', label: 'Passing' },
      { key: 'Quickness', label: 'Quickness' },
      { key: 'PostD', label: 'Post Defense' },
      { key: 'PerimeterD', label: 'Perimeter D' },
      { key: 'DriveD', label: 'Drive Defense' },
      { key: 'Stealing', label: 'Stealing' },
      { key: 'Blocking', label: 'Shot Blocking' },
      { key: 'Oreb', label: 'Off. Rebounding' },
      { key: 'Dreb', label: 'Def. Rebounding' },
      { key: 'Jumping', label: 'Jumping' },
      { key: 'Strength', label: 'Strength' },
      { key: 'Potential', label: 'Potential' },
      { key: 'Overall', label: 'Overall' },
    ],
  };
}