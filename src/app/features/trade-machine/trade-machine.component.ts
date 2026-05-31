import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { PlayerService } from '../../core/services/player.service';
import { RouterLink } from '@angular/router';
import { TradeMachineService } from '../../core/services/trade-machine.service';

interface TradePlayer {
  Name: string;
  Team: string;
  Position: string;
  Salary: number;
}

interface TradeMove {
  player: TradePlayer;
  fromTeam: string;
  toTeam: string;
}

@Component({
  selector: 'app-trade-machine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSelectModule,
    RouterLink,
  ],
  templateUrl: './trade-machine.component.html',
  styleUrl: './trade-machine.component.scss',
})
export class TradeMachineComponent {
  private playerService = inject(PlayerService);
  private tradeMachineService = inject(TradeMachineService);

  players = signal<TradePlayer[]>([]);
  tradeMoves = signal<TradeMove[]>([]);

  teamA = signal('');
  teamB = signal('');
  teamC = signal('');
  teamD = signal('');

  readonly teams = computed(() =>
  Array.from(
    new Set(
      this.players()
        .map(player => player.Team)
        .filter(team => team && team !== 'FA'),
    ),
  ).sort(),
  );

  playersA = computed(() => this.playersForTeam(this.teamA()));
  playersB = computed(() => this.playersForTeam(this.teamB()));
  playersC = computed(() => this.playersForTeam(this.teamC()));
  playersD = computed(() => this.playersForTeam(this.teamD()));
  
  readonly canShowSummary = computed(() => {
  const selectedTeams = [
    this.teamA(),
    this.teamB(),
    this.teamC(),
    this.teamD(),
  ].filter(Boolean);

  if (!selectedTeams.length) {
    return false;
  }

  return selectedTeams.every(team =>
    this.tradeValid(team),
  );
  });

  constructor() {
    this.playerService.getPlayersFull().subscribe({
      next: players => {
      const tradePlayers = players.map(player => ({
	  Name: `${player.firstName} ${player.lastName}`,
	  Team: player.team,
	  Position: player.position,
	  Salary: Number(player.salary1) || 0,
	  }));
	
	  this.players.set(tradePlayers);
	  this.tradeMachineService.setPlayers(tradePlayers);
              
      },
      error: error => {
        console.error('Blad ladowania graczy do Trade Machine:', error);
      },
    });
  }

  availableTeams(currentTeam: string): string[] {
    const selectedTeams = [
      this.teamA(),
      this.teamB(),
      this.teamC(),
      this.teamD(),
    ].filter(team => team && team !== currentTeam);

    return this.teams().filter(team => !selectedTeams.includes(team));
  }

  availableTradeTargets(currentTeam: string): string[] {
    return [
      this.teamA(),
      this.teamB(),
      this.teamC(),
      this.teamD(),
    ].filter(team => team && team !== currentTeam);
  }

setTeamA(team: string): void {
  this.teamA.set(team);
  this.tradeMachineService.setTeam('A', team);
  this.removeMovesForTeam(team);
}

setTeamB(team: string): void {
  this.teamB.set(team);
  this.tradeMachineService.setTeam('B', team);
  this.removeMovesForTeam(team);
}

setTeamC(team: string): void {
  this.teamC.set(team);
  this.tradeMachineService.setTeam('C', team);
  this.removeMovesForTeam(team);
}

setTeamD(team: string): void {
  this.teamD.set(team);
  this.tradeMachineService.setTeam('D', team);
  this.removeMovesForTeam(team);
}

  movePlayer(player: TradePlayer, fromTeam: string, toTeam: string): void {
    this.tradeMoves.update(moves => {
      const withoutPlayer = moves.filter(
        move => move.player.Name !== player.Name,
      );

      return [
        ...withoutPlayer,
        {
          player,
          fromTeam,
          toTeam,
        },
      ];
    });
    this.tradeMachineService.movePlayer(player, fromTeam, toTeam);
  }

  removeMove(player: TradePlayer): void {
    this.tradeMoves.update(moves =>
      moves.filter(move => move.player.Name !== player.Name),
    );
  }

  playerMove(player: TradePlayer): TradeMove | undefined {
    return this.tradeMoves().find(
      move => move.player.Name === player.Name,
    );
  }

  playersForTeam(team: string): TradePlayer[] {
    return this.players()
      .filter(player => player.Team === team)
      .sort((a, b) => b.Salary - a.Salary);
  }

  teamSalary(team: string): number {
    return this.sumSalary(this.playersForTeam(team));
  }

  salaryOut(team: string): number {
    return this.sumSalary(
      this.tradeMoves()
        .filter(move => move.fromTeam === team)
        .map(move => move.player),
    );
  }

  salaryIn(team: string): number {
    return this.sumSalary(
      this.tradeMoves()
        .filter(move => move.toTeam === team)
        .map(move => move.player),
    );
  }

  salaryAfterTrade(team: string): number {
    return this.teamSalary(team) - this.salaryOut(team) + this.salaryIn(team);
  }

  difference(team: string): number {
    return this.salaryIn(team) - this.salaryOut(team);
  }
  
  salaryAdjustment(team: string): string {
  const out = this.salaryOut(team);
  const salaryDifference = this.difference(team);

  if (!team || out <= 0 || salaryDifference === 0) {
    return '0';
  }

  const allowedDifference = out * 0.15;
  const absDifference = Math.abs(salaryDifference);

  if (absDifference <= allowedDifference) {
    return '0';
  }

  const adjustment = absDifference - allowedDifference;

  if (salaryDifference > 0) {
    return `CUT ${this.money(adjustment)}`;
  }

  return `ADD ${this.money(adjustment)}`;
  }

  tradeValid(team: string): boolean {
  const out = this.salaryOut(team);
  const incoming = this.salaryIn(team);
  const after = this.salaryAfterTrade(team);

  if (!team) {
    return false;
  }

  if (after > 80_000_000) {
    return false;
  }

  // Dru¿yna tylko oddaje salary i nic nie bierze.
  // To jest OK w multiwayu.
  if (out > 0 && incoming === 0) {
    return true;
  }

  // Dru¿yna coœ dostaje, wiêc musi mieœciæ siê w +/- 15%.
  if (incoming > 0) {
    const diffPercent = out > 0
      ? Math.abs(this.difference(team)) / out * 100
      : 100;

    return diffPercent <= 15;
  }

  return false;
   }

  money(value: number): string {
    return value.toLocaleString('pl-PL');
  }

  private sumSalary(players: TradePlayer[]): number {
    return players.reduce((sum, player) => sum + player.Salary, 0);
  }

  private removeMovesForTeam(team: string): void {
    this.tradeMoves.update(moves =>
      moves.filter(
        move => move.fromTeam !== team && move.toTeam !== team,
      ),
    );
  }
}
