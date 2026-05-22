import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvDataService } from '../../services/csv-data.service';

@Component({
  selector: 'app-compare-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="compare-page">
      <h1>Porownaj</h1>

      <p *ngIf="!players.length">
        Brak danych. Najpierw wczytaj CSV w zak³adce Import CSV.
      </p>

      <div *ngIf="players.length" class="selectors">
        <select [(ngModel)]="leftName" (change)="selectPlayers()">
          <option value="">Wybierz gracza</option>
          <option *ngFor="let p of players" [value]="p.Name">
            {{ p.Name }}
          </option>
        </select>

        <select [(ngModel)]="rightName" (change)="selectPlayers()">
          <option value="">Wybierz gracza</option>
          <option *ngFor="let p of players" [value]="p.Name">
            {{ p.Name }}
          </option>
        </select>
      </div>

     <div *ngIf="leftPlayer && rightPlayer" class="compare-simple">

  <div class="players-row">
    <div>{{ leftPlayer.Name }}</div>
    <div>{{ rightPlayer.Name }}</div>
  </div>

  <div class="section-title">Overall Stats</div>

  <div class="stat-row" *ngFor="let stat of stats">
    <div [class.better]="isLeftBetter(stat)">
      {{ leftPlayer[stat] }}
    </div>

    <div class="stat-name">
      {{ stat }}
    </div>

    <div [class.better]="isRightBetter(stat)">
      {{ rightPlayer[stat] }}
    </div>
  </div>

</div>
    </section>
  `,
  styles: [`
    .compare-page {
      padding: 24px;
    }

    h1 {
      color: #ff6a00;
      margin-bottom: 20px;
    }

    .selectors {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    select {
      background: #151515;
      color: white;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 10px 14px;
      min-width: 260px;
    }

    .compare-card {
      max-width: 760px;
      background: #f5f5f5;
      color: #000;
      border: 1px solid #444;
    }

    .top-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      border-bottom: 1px solid #555;
    }

    .player-box {
      text-align: center;
      padding: 16px;
    }

    .photo-placeholder {
      width: 150px;
      height: 180px;
      background: #ddd;
      margin: 0 auto 10px;
      border: 1px solid #bbb;
    }

    .player-box h2 {
      color: #234cff;
      text-decoration: underline;
      font-size: 18px;
      margin: 8px 0 4px;
    }

    .player-box p {
      margin: 0;
      font-size: 13px;
    }

    .vs-box {
      text-align: center;
      color: #555;
      font-weight: 700;
    }

    .logo {
      font-size: 22px;
      margin-bottom: 10px;
    }

    .vs {
      color: #ff6a00;
      font-size: 18px;
    }

    .section-title {
      text-align: center;
      font-weight: 800;
      color: #b00000;
      padding: 8px;
      background: #e8e8e8;
      border-bottom: 1px solid #555;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    td,
    th {
      padding: 7px 12px;
      border-bottom: 1px solid #ddd;
      text-align: center;
      font-size: 17px;
    }

    th {
      width: 33%;
      font-weight: 800;
    }

    td {
      width: 33%;
    }

    .winner {
      background: #dfeee0;
      font-weight: 800;
    }
    
.compare-simple {
  max-width: 100%;
  margin-top: 18px;
  color: #fff;
}

.players-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  padding: 4px 40px;
  font-size: 18px;
  font-weight: 400;
}

.players-row div:last-child {
  text-align: right;
}

.section-title {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0;
  color: #fff;
  background: transparent;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  min-height: 14px;
  border-bottom: 1px solid #333;
  font-size: 16px;
}

.stat-row div {
  text-align: center;
}

.stat-name {
  font-weight: 500;
}

.better {
  background: rgba(255, 106, 0, 0.28);
  border-radius: 4px;
  font-weight: 700;
  margin: 0px 10px;
  padding: 4px 0;
}
  `],
})
export class CompareStatsComponent implements OnInit {
  players: any[] = [];

  leftName = '';
  rightName = '';

  leftPlayer: any = null;
  rightPlayer: any = null;

  stats = [
    'Points',
    'Rebounds',
    'Assists',
    'Steals',
    'Blocks',
    'FG%',
    '3P%',
    'FT%',
    'eFG%',
    'TS%',
    'EFF',
    'AST/TO',
    'USG',
    'POSS',
    'PPP',
  ];

  constructor(public csvData: CsvDataService) {}

  ngOnInit(): void {
    this.players = [...this.csvData.rows];
  }

  selectPlayers(): void {
    this.leftPlayer = this.players.find(p => p.Name === this.leftName) || null;
    this.rightPlayer = this.players.find(p => p.Name === this.rightName) || null;
  }

  isLeftBetter(stat: string): boolean {
    if (!this.leftPlayer || !this.rightPlayer) return false;

    const left = Number(this.leftPlayer[stat]);
    const right = Number(this.rightPlayer[stat]);

    return !isNaN(left) && !isNaN(right) && left > right;
  }

  isRightBetter(stat: string): boolean {
    if (!this.leftPlayer || !this.rightPlayer) return false;

    const left = Number(this.leftPlayer[stat]);
    const right = Number(this.rightPlayer[stat]);

    return !isNaN(left) && !isNaN(right) && right > left;
  }
}
