import { Injectable, computed, signal } from '@angular/core';

export interface TradePlayer {
  Name: string;
  Team: string;
  Position: string;
  Salary: number;
}

export interface TradeMove {
  player: TradePlayer;
  fromTeam: string;
  toTeam: string;
}

@Injectable({
  providedIn: 'root',
})
export class TradeMachineService {
  readonly players = signal<TradePlayer[]>([]);
  readonly tradeMoves = signal<TradeMove[]>([]);

  readonly teamA = signal('');
  readonly teamB = signal('');
  readonly teamC = signal('');
  readonly teamD = signal('');

  readonly selectedTeams = computed(() =>
    [this.teamA(), this.teamB(), this.teamC(), this.teamD()].filter(Boolean)
  );

  readonly movesByTargetTeam = computed(() =>
    this.selectedTeams().map(team => ({
      team,
      players: this.tradeMoves()
        .filter(move => move.toTeam === team)
        .map(move => move.player),
      salary: this.salaryIn(team),
    }))
  );

  setPlayers(players: TradePlayer[]): void {
    this.players.set(players);
  }

  setTeam(slot: 'A' | 'B' | 'C' | 'D', team: string): void {
    if (slot === 'A') this.teamA.set(team);
    if (slot === 'B') this.teamB.set(team);
    if (slot === 'C') this.teamC.set(team);
    if (slot === 'D') this.teamD.set(team);

    this.removeMovesForTeam(team);
  }

  movePlayer(player: TradePlayer, fromTeam: string, toTeam: string): void {
    this.tradeMoves.update(moves => [
      ...moves.filter(move => move.player.Name !== player.Name),
      { player, fromTeam, toTeam },
    ]);
  }

  removeMove(player: TradePlayer): void {
    this.tradeMoves.update(moves =>
      moves.filter(move => move.player.Name !== player.Name)
    );
  }

  salaryIn(team: string): number {
    return this.tradeMoves()
      .filter(move => move.toTeam === team)
      .reduce((sum, move) => sum + move.player.Salary, 0);
  }

  private removeMovesForTeam(team: string): void {
    this.tradeMoves.update(moves =>
      moves.filter(move => move.fromTeam !== team && move.toTeam !== team)
    );
  }
}
