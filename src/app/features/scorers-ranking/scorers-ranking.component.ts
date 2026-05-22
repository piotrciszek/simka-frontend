import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvDataService } from '../../services/csv-data.service';

interface ScorerRow {
  rank: number;
  name: string;
  ts: string;
  efg: string;
  fga: string;
  shooterScore: string;
}

@Component({
  selector: 'app-scorers-ranking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="ranking-page">
      <h1>Ranking scorerow</h1>

      <p *ngIf="!players.length" class="empty">
        Brak danych. Najpierw wczytaj CSV w zak³adce Import CSV.
      </p>

      <div *ngIf="players.length" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>TS%</th>
              <th>EFG%</th>
              <th>FGA</th>
              <th>ShooterScore</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let p of players">
              <td>{{ p.rank }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.ts }} %</td>
              <td>{{ p.efg }} %</td>
              <td>{{ p.fga }}</td>
              <td>{{ p.shooterScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .ranking-page {
      padding: 24px;
    }

    h1 {
      color: #ff6a00;
      margin-bottom: 24px;
    }

    .empty {
      color: #aaa;
    }

    .table-wrapper {
      max-height: 700px;
      overflow: auto;
      border: 1px solid #333;
      border-radius: 8px;
      background: #111;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #111;
    }

    th,
    td {
      padding: 11px 14px;
      border-bottom: 1px solid #2b2b2b;
      text-align: left;
      white-space: nowrap;
      font-size: 14px;
    }

    th {
      position: sticky;
      top: 0;
      background: #1f1f1f;
      color: #ff6a00;
      font-weight: 700;
      z-index: 1;
    }

    td {
      color: #eee;
    }

    tbody tr:hover {
      background: #181818;
    }

    td:first-child,
    th:first-child {
      width: 70px;
      text-align: center;
    }

    td:last-child,
    th:last-child {
      font-weight: 700;
      text-align: right;
    }
  `],
})
export class ScorersRankingComponent implements OnInit {
  players: ScorerRow[] = [];

  constructor(public csvData: CsvDataService) {}

  ngOnInit(): void {
    this.players = [...this.csvData.rows]
    .filter((p) => Number(p['FGA']) > 5)
      .map((p) => {
        const ts = Number(p['TS%']) || 0;
        const efg = Number(p['eFG%']) || 0;
        const fga = Number(p['FGA']) || 0;

        const shooterScore =
          ((ts * 0.7) + (efg * 0.3)) * Math.sqrt(fga);

        return {
          rank: 0,
          name: p['Name'],
          ts: ts.toFixed(1),
          efg: efg.toFixed(1),
          fga: fga.toFixed(1),
          shooterScore: shooterScore.toFixed(3),
        };
      })
      .sort((a, b) => Number(b.shooterScore) - Number(a.shooterScore))
      .map((p, index) => ({
        ...p,
        rank: index + 1,
      }));
  }
}
