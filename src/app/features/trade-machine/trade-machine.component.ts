import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { PlayerService } from '../../core/services/player.service';
import { TradeMachineService } from '../../core/services/trade-machine.service';

type TeamSlot = 'A' | 'B' | 'C' | 'D';

interface TradePlayer {
  id: string;
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

interface TeamSummary {
  team: string;
  salaryBefore: number;
  salaryOut: number;
  salaryIn: number;
  salaryAfter: number;
  difference: number;
  salaryAdjustment: string;
  tradeValid: boolean;
}

@Component({
  selector: 'app-trade-machine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSelectModule,
  ],
  templateUrl: './trade-machine.component.html',
  styleUrl: './trade-machine.component.scss',
})
export class TradeMachineComponent {
  private readonly playerService = inject(PlayerService);
  private readonly tradeMachineService = inject(TradeMachineService);

  readonly players = signal<TradePlayer[]>([]);
  readonly tradeMoves = signal<TradeMove[]>([]);

  readonly teamA = signal('');
  readonly teamB = signal('');
  readonly teamC = signal('');
  readonly teamD = signal('');

  readonly showMinimumForm = signal(false);
  readonly minimumTeam = signal('');
  readonly minimumSalary = signal<number | null>(null);

  readonly minimumContracts = [
    { label: 'Rookie - 332 817', value: 332817 },
    { label: '1 rok - 465 850', value: 465850 },
    { label: '2 lata - 540 850', value: 540850 },
    { label: '3 lata - 565 850', value: 565850 },
    { label: '4 lata - 590 850', value: 590850 },
    { label: '5 lat - 653 350', value: 653350 },
    { label: '6 lat - 715 850', value: 715850 },
    { label: '7 lat - 778 350', value: 778350 },
    { label: '8 lat - 840 850', value: 840850 },
    { label: '9 lat - 965 850', value: 965850 },
    { label: '10+ lat - 1 000 000', value: 1000000 },
  ];

  readonly teams = computed(() =>
    Array.from(
      new Set(
        this.players()
          .map(player => player.Team)
          .filter(team => team && team !== 'FA'),
      ),
    ).sort(),
  );

  readonly teamSlots = computed(() => [
    {
      slot: 'A' as TeamSlot,
      label: 'Team A',
      team: this.teamA(),
      players: this.playersForTeam(this.teamA()),
    },
    {
      slot: 'B' as TeamSlot,
      label: 'Team B',
      team: this.teamB(),
      players: this.playersForTeam(this.teamB()),
    },
    {
      slot: 'C' as TeamSlot,
      label: 'Team C',
      team: this.teamC(),
      players: this.playersForTeam(this.teamC()),
    },
    {
      slot: 'D' as TeamSlot,
      label: 'Team D',
      team: this.teamD(),
      players: this.playersForTeam(this.teamD()),
    },
  ]);

  readonly selectedTeams = computed(() =>
    this.teamSlots()
      .map(teamSlot => teamSlot.team)
      .filter(Boolean),
  );

  readonly resultSummaries = computed<TeamSummary[]>(() =>
    this.selectedTeams().map(team => {
      const salaryBefore = this.teamSalary(team);
      const salaryOut = this.salaryOut(team);
      const salaryIn = this.salaryIn(team);
      const salaryAfter = salaryBefore - salaryOut + salaryIn;
      const difference = salaryIn - salaryOut;

      return {
        team,
        salaryBefore,
        salaryOut,
        salaryIn,
        salaryAfter,
        difference,
        salaryAdjustment: this.buildSalaryAdjustment(team, salaryOut, difference),
        tradeValid: this.isTradeValid(team, salaryOut, salaryIn, salaryAfter, difference),
      };
    }),
  );

  readonly canShowSummary = computed(() => {
    const resultSummaries = this.resultSummaries();

    if (!resultSummaries.length) {
      return false;
    }

    return resultSummaries.every(summary => summary.tradeValid);
  });

  constructor() {
    this.playerService.getPlayersFull().subscribe({
      next: players => {
        const tradePlayers = players.map((player, index) => ({
          id: this.buildPlayerId(player.team, player.firstName, player.lastName, index),
          Name: `${player.firstName} ${player.lastName}`,
          Team: player.team,
          Position: player.position,
          Salary: Number(player.salary1) || 0,
        }));

        this.players.set(tradePlayers);
        this.tradeMachineService.setPlayers(tradePlayers);
      },
      error: error => {
        console.error('Błąd ładowania graczy do Trade Machine:', error);
      },
    });
  }

  availableTeams(currentTeam: string): string[] {
    const selectedTeams = this.selectedTeams()
      .filter(team => team && team !== currentTeam);

    return this.teams().filter(team => !selectedTeams.includes(team));
  }

  availableTradeTargets(currentTeam: string): string[] {
    return this.selectedTeams()
      .filter(team => team && team !== currentTeam);
  }

	setTeam(slot: TeamSlot, team: string): void {
	  const previousTeam = this.teamBySlot(slot);
	
	  if (slot === 'A') {
	    this.teamA.set(team);
	  }
	
	  if (slot === 'B') {
	    this.teamB.set(team);
	  }
	
	  if (slot === 'C') {
	    this.teamC.set(team);
	  }
	
	  if (slot === 'D') {
	    this.teamD.set(team);
	  }
	
	  this.tradeMachineService.setTeam(slot, team);
	
	  if (previousTeam) {
	    this.removeMovesForTeam(previousTeam);
	  }
	
	  if (team) {
	    this.removeMovesForTeam(team);
	  }
	}
	
  private teamBySlot(slot: TeamSlot): string {
  if (slot === 'A') {
    return this.teamA();
  }

  if (slot === 'B') {
    return this.teamB();
  }

  if (slot === 'C') {
    return this.teamC();
  }

  return this.teamD();
  }	

  addMinimumPlayer(): void {
    const team = this.minimumTeam();
    const salary = this.minimumSalary();

    if (!team || !salary) {
      return;
    }

    const minimumPlayer: TradePlayer = {
      id: this.buildMinimumPlayerId(team, salary),
      Name: 'Minimum',
      Team: team,
      Position: 'MIN',
      Salary: salary,
    };

    this.players.update(players => [
      ...players,
      minimumPlayer,
    ]);

    this.tradeMachineService.setPlayers(this.players());

    this.minimumTeam.set('');
    this.minimumSalary.set(null);
    this.showMinimumForm.set(false);
  }

  movePlayer(player: TradePlayer, fromTeam: string, toTeam: string): void {
    this.tradeMoves.update(moves => [
      ...moves.filter(move => move.player.id !== player.id),
      {
        player,
        fromTeam,
        toTeam,
      },
    ]);

    this.tradeMachineService.movePlayer(player, fromTeam, toTeam);
  }

  removeMove(player: TradePlayer): void {
    this.tradeMoves.update(moves =>
      moves.filter(move => move.player.id !== player.id),
    );

    this.tradeMachineService.removeMove(player);
  }

  playerMove(player: TradePlayer): TradeMove | undefined {
    return this.tradeMoves().find(
      move => move.player.id === player.id,
    );
  }

  money(value: number): string {
    return value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private playersForTeam(team: string): TradePlayer[] {
    return this.players()
      .filter(player => player.Team === team)
      .sort((a, b) => b.Salary - a.Salary);
  }

  private teamSalary(team: string): number {
    return this.sumSalary(this.playersForTeam(team));
  }

  private salaryOut(team: string): number {
    return this.sumSalary(
      this.tradeMoves()
        .filter(move => move.fromTeam === team)
        .map(move => move.player),
    );
  }

  private salaryIn(team: string): number {
    return this.sumSalary(
      this.tradeMoves()
        .filter(move => move.toTeam === team)
        .map(move => move.player),
    );
  }

  private buildSalaryAdjustment(
    team: string,
    salaryOut: number,
    difference: number,
  ): string {
    if (!team || salaryOut <= 0 || difference === 0) {
      return '0.00';
    }

    const allowedDifference = salaryOut * 0.15;
    const absDifference = Math.abs(difference);

    if (absDifference <= allowedDifference) {
      return '0.00';
    }

    const adjustment = absDifference - allowedDifference;

    if (difference > 0) {
      return `CUT ${this.money(adjustment)}`;
    }

    return `ADD ${this.money(adjustment)}`;
  }

  private isTradeValid(
    team: string,
    salaryOut: number,
    salaryIn: number,
    salaryAfter: number,
    difference: number,
  ): boolean {
    if (!team) {
      return false;
    }

    if (salaryAfter > 80_000_000) {
      return false;
    }

    if (salaryOut > 0 && salaryIn === 0) {
      return true;
    }

    if (salaryIn > 0) {
      const diffPercent = salaryOut > 0
        ? Math.abs(difference) / salaryOut * 100
        : 100;

      return diffPercent <= 15;
    }

    return false;
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

  private buildPlayerId(
    team: string,
    firstName: string,
    lastName: string,
    index: number,
  ): string {
    return [team, firstName, lastName, index]
      .join('-')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  private buildMinimumPlayerId(team: string, salary: number): string {
    return `minimum-${team}-${salary}-${Date.now()}`;
  }
}
