import { Injectable } from '@angular/core';

export interface TradePlayer {
  Name: string;
  Team: string;
  Salary1: number;
}

@Injectable({
  providedIn: 'root'
})
export class TradeMachineService {

		parseSalary(value: string | number | undefined): number {
		
		  if (!value) {
		    return 0;
		  }
		
		  return Number(
		    String(value)
		      .replace(/[^\d]/g, '')
		  ) || 0;
		
		}
  formatSalary(value: number): string {
    return value.toLocaleString('pl-PL');
  }

  sumSalary(players: TradePlayer[]): number {
    return players.reduce(
      (sum, player) => sum + player.Salary1,
      0
    );
  }
}
