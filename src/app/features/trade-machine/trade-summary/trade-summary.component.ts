import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TradeMachineService } from '../../../core/services/trade-machine.service';

@Component({
  selector: 'app-trade-summary',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink],
  templateUrl: './trade-summary.component.html',
  styleUrl: './trade-summary.component.scss',
})
export class TradeSummaryComponent {
  readonly tradeMachine = inject(TradeMachineService);

  readonly teams = computed(() => this.tradeMachine.movesByTargetTeam());

  money(value: number): string {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
}
