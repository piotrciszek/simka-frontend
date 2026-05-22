import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

import { PlayerAttributesService } from '../../services/player-attributes.service';
import { TradeMachineService, TradePlayer } from '../../services/trade-machine.service';

@Component({
  selector: 'app-trade-machine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule
  ],
  templateUrl: './trade-machine.component.html',
  styleUrl: './trade-machine.component.scss'
})
export class TradeMachineComponent implements OnInit {

  teams: string[] = [];

  teamA = '';
  teamB = '';

  playersA: TradePlayer[] = [];
  playersB: TradePlayer[] = [];

  selectedA: TradePlayer[] = [];
  selectedB: TradePlayer[] = [];

  constructor(
    public attributesService: PlayerAttributesService,
    public tradeService: TradeMachineService
  ) {}

  ngOnInit(): void {
    const players = this.attributesService.players;

    this.teams = Array.from(
      new Set(
        players
          .map(p => p['Team'])
          .filter(Boolean)
      )
    ).sort();
  }

  onTeamAChange(): void {
    this.playersA = this.getPlayersByTeam(this.teamA);
    this.selectedA = [];
  }

  onTeamBChange(): void {
    this.playersB = this.getPlayersByTeam(this.teamB);
    this.selectedB = [];
  }
  
  tradeValidForA(): boolean {

			  const out = this.salaryOutA();
			
			  if (out === 0) {
			    return false;
			  }
			
			  const diffPercent =
			    Math.abs(this.differenceA()) / out * 100;
			
			  return diffPercent <= 15;
			}
			
			tradeValidForB(): boolean {
			
			  const out = this.salaryOutB();
			
			  if (out === 0) {
			    return false;
			  }
			
			  const diffPercent =
			    Math.abs(this.differenceB()) / out * 100;
			
			  return diffPercent <= 15;
			}

  getPlayersByTeam(team: string): TradePlayer[] {
    return this.attributesService.players
      .filter(p => p['Team'] === team)
      .map(p => ({
        Name: p['Name'],
        Team: p['Team'],
        Salary1: this.tradeService.parseSalary(p['Salary1'])
      }))
      .sort((a, b) => b.Salary1 - a.Salary1);
  }

  togglePlayer(player: TradePlayer, side: 'A' | 'B'): void {
    const selected = side === 'A' ? this.selectedA : this.selectedB;

    const exists = selected.some(p => p.Name === player.Name);

    if (exists) {
      const filtered = selected.filter(p => p.Name !== player.Name);

      if (side === 'A') {
        this.selectedA = filtered;
      } else {
        this.selectedB = filtered;
      }

      return;
    }

    if (side === 'A') {
      this.selectedA = [...this.selectedA, player];
    } else {
      this.selectedB = [...this.selectedB, player];
    }
  }

  isSelected(player: TradePlayer, side: 'A' | 'B'): boolean {
    const selected = side === 'A' ? this.selectedA : this.selectedB;

    return selected.some(p => p.Name === player.Name);
  }

  salaryOutA(): number {
    return this.tradeService.sumSalary(this.selectedA);
  }

  salaryInA(): number {
    return this.tradeService.sumSalary(this.selectedB);
  }

  salaryOutB(): number {
    return this.tradeService.sumSalary(this.selectedB);
  }

  salaryInB(): number {
    return this.tradeService.sumSalary(this.selectedA);
  }

  differenceA(): number {
    return this.salaryInA() - this.salaryOutA();
  }

  differenceB(): number {
    return this.salaryInB() - this.salaryOutB();
  }

  money(value: number): string {
    return this.tradeService.formatSalary(value);
  }
}
