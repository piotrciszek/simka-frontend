import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvDataService } from '../../services/csv-data.service';

@Component({
selector:'app-advanced-statsp',
standalone:true,
imports:[CommonModule,FormsModule],
template:`
<section class="advanced-stats-page">
<h1>Zaawansowane statystyki P</h1>

<p *ngIf="!rows.length">
Brak danych. Najpierw wczytaj CSV.
</p>

<div *ngIf="headers.length" class="filter-bar">
<select [(ngModel)]="filterColumn">
<option value="">Wybierz atrybut</option>
<option *ngFor="let h of headers" [value]="h">{{h}}</option>
</select>

<select [(ngModel)]="filterOperator">
<option *ngFor="let op of operators" [value]="op">{{op}}</option>
</select>

<input [(ngModel)]="filterValue" placeholder="np. 5"/>
<button (click)="applyFilter()">Filtruj</button>
<button (click)="clearFilter()">Wyczyœæ</button>
</div>

<div *ngIf="rows.length" class="table-wrapper">
<table>
<thead>
<tr>
<th *ngFor="let h of headers" (click)="sort(h)">{{h}}</th>
</tr>
</thead>

<tbody>
<tr *ngFor="let row of rows">
<td *ngFor="let h of headers">{{row[h]}}</td>
</tr>
</tbody>

</table>
</div>
</section>
`,
styles: [`
  .advanced-stats-page {
    padding: 24px;
  }

  h1 {
    color: #ff6a00;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin: 20px 0;
  }

  .filter-bar select,
  .filter-bar input {
    background: #151515;
    color: white;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 9px 12px;
  }

  button {
    background: #ff6a00;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 9px 14px;
    cursor: pointer;
  }

  .table-wrapper {
    margin-top: 20px;
    max-height: 650px;
    overflow: auto;
    border: 1px solid #333;
  }

  table {
    width: 100%;
    min-width: 1200px;
    border-collapse: collapse;
    background: #111;
  }

  th,
  td {
    padding: 14px 12px;
    border-bottom: 1px solid #2b2b2b;
    white-space: nowrap;
    text-align: left;
  }

  th {
    position: sticky;
    top: 0;
    background: #1f1f1f;
    color: #ff6a00;
    z-index: 2;
    font-weight: 700;
  }

  td {
    color: #fff;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    background: #111;
    z-index: 3;
  }

  th:first-child {
    background: #1f1f1f;
    z-index: 4;
  }
`]
})

export class AdvancedStatspComponent implements OnInit{

headers:string[]=[];
rows:any[]=[];
allRows:any[]=[];

filterColumn='';
filterOperator='>';
filterValue='';
operators=['>','>=','<','<=','='];

sortColumn='';
sortDirection:'asc'|'desc'='asc';

constructor(public csvData:CsvDataService){}

ngOnInit():void{
this.rows=[...this.csvData.rows];
this.allRows=[...this.csvData.allRows];
this.headers=[...this.csvData.headers];
}

sort(column:string){
if(this.sortColumn===column){
this.sortDirection=this.sortDirection==='asc'?'desc':'asc';
}else{
this.sortColumn=column;
this.sortDirection='asc';
}

this.rows.sort((a,b)=>{
const aNum=parseFloat(a[column]);
const bNum=parseFloat(b[column]);

if(!isNaN(aNum)&&!isNaN(bNum)){
return this.sortDirection==='asc'?aNum-bNum:bNum-aNum;
}

return this.sortDirection==='asc'
?String(a[column]).localeCompare(String(b[column]))
:String(b[column]).localeCompare(String(a[column]));
});
}

applyFilter(){
if(!this.filterColumn||this.filterValue===''){
this.rows=[...this.allRows];
return;
}

const filterNumber=Number(this.filterValue);

this.rows=this.allRows.filter(row=>{
const value=row[this.filterColumn];
const rowNumber=Number(value);

if(isNaN(rowNumber)||isNaN(filterNumber)){
if(this.filterOperator==='='){
return String(value).toLowerCase()===String(this.filterValue).toLowerCase();
}
return false;
}

switch(this.filterOperator){
case '>': return rowNumber>filterNumber;
case '>=': return rowNumber>=filterNumber;
case '<': return rowNumber<filterNumber;
case '<=': return rowNumber<=filterNumber;
case '=': return rowNumber===filterNumber;
default: return true;
}
});
}

clearFilter(){
this.filterColumn='';
this.filterOperator='>';
this.filterValue='';
this.rows=[...this.allRows];
}



}

