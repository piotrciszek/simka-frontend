import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvDataService } from '../../services/csv-data.service';

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="advanced-stats-page">

      <h1>Zaawansowane statystyki</h1>

      <p *ngIf="!rows.length" class="empty-state">
        Brak danych. Najpierw wczytaj plik w zak³adce Import CSV.
      </p>

      <div *ngIf="rows.length > 0" class="table-wrapper">

        <table>

          <thead>
            <tr>
              <th *ngFor="let header of headers">
                {{header}}
              </th>
            </tr>
          </thead>

          <tbody>

            <tr *ngFor="let row of rows">

              <td *ngFor="let header of headers">
                {{row[header]}}
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>
  `,
  styles:[`
    .advanced-stats-page{
      padding:24px;
    }

    h1{
      color:#ff6a00;
      margin-bottom:24px;
    }

    .table-wrapper{
      max-height:600px;
      overflow:auto;
      border:1px solid #333;
      border-radius:8px;
    }

    .table-wrapper::-webkit-scrollbar{
      width:10px;
      height:10px;
    }

    .table-wrapper::-webkit-scrollbar-track{
      background:#1a1a1a;
    }

    .table-wrapper::-webkit-scrollbar-thumb{
      background:#ff6a00;
      border-radius:10px;
    }

    table{
      width:100%;
      border-collapse:collapse;
      min-width:800px;
      background:#111;
    }

    th,
    td{
      padding:10px 12px;
      border-bottom:1px solid #333;
      text-align:left;
      font-size:13px;
      white-space:nowrap;
    }

    th{
      color:#ff6a00;
      background:#1f1f1f;
      position:sticky;
      top:0;
      z-index:1;
    }

    td{
      color:#eee;
    }

    .empty-state{
      color:#aaa;
      margin-top:24px;
    }
  `]
})
export class AdvancedStatsComponent implements OnInit {

  headers:string[]=[];
  rows:any[]=[];

  constructor(public csvData:CsvDataService){}

ngOnInit(): void {
  this.headers = [...this.csvData.sumHeaders];
  this.rows = [...this.csvData.sumRows];
}

}
