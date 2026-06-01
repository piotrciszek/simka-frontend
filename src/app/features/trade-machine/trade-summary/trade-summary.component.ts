import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TradeMachineService } from '../../../core/services/trade-machine.service';

@Component({
  selector: 'app-trade-summary',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './trade-summary.component.html',
  styleUrl: './trade-summary.component.scss',
})
export class TradeSummaryComponent {
  readonly tradeMachine = inject(TradeMachineService);

  readonly teams = computed(() => this.tradeMachine.movesByTargetTeam());

  readonly tradeText = computed(() => {
    const teams = this.teams();

    if (teams.length < 2) {
      return '';
    }

    const lines: string[] = [
      teams
        .map(team => team.team)
        .join(' - '),
      '',
    ];

    teams.forEach(team => {
      const incoming = this.tradeMachine.tradeMoves()
        .filter(move => move.toTeam === team.team)
        .map(move => move.player.Name);

      const outgoing = this.tradeMachine.tradeMoves()
        .filter(move => move.fromTeam === team.team)
        .map(move => move.player.Name);

      lines.push(`${team.team} IN:`);
      lines.push(incoming.length ? incoming.join(', ') : '-');
      lines.push('');

      lines.push(`${team.team} OUT:`);
      lines.push(outgoing.length ? outgoing.join(', ') : '-');
      lines.push('');
    });

    return lines.join('\n');
  });

  money(value: number): string {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
}
