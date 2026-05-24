import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService, type PlayerStat } from '../../core/services/stats.service';

@Component({
  selector: 'app-advanced-statsp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-statsp.component.html',
  styleUrl: './advanced-statsp.component.scss',
})
export class AdvancedStatspComponent {
  private statsService = inject(StatsService);

  private allRows = signal<PlayerStat[]>([]);
  private filteredRows = signal<PlayerStat[]>([]);

  rows = computed(() => (this.filteredRows().length ? this.filteredRows() : this.allRows()));
  headers = computed(() => {
    const firstRow = this.allRows()[0];
    return firstRow ? Object.keys(firstRow) : [];
  });

  // Filter controls
  filterColumn = '';
  filterOperator = '>';
  filterValue = '';
  operators = signal(['>', '>=', '<', '<=', '=']);

  // Sort controls
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  constructor() {
    // Load data on component initialization
    this.loadAdvancedStats();
  }

  private loadAdvancedStats() {
    this.statsService.getAdvancedStats().subscribe({
      next: data => {
        this.allRows.set(data);
      },
      error: error => {
        console.error('Błąd ładowania statystyk:', error);
      },
    });
  }

  getCellValue(row: PlayerStat, header: string): any {
    return (row as any)[header] ?? '';
  }

  sort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    const currentRows = this.filteredRows().length ? [...this.filteredRows()] : [...this.allRows()];

    const sortedRows = currentRows.sort((a, b) => {
      const aVal = (a as any)[column];
      const bVal = (b as any)[column];
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return this.sortDirection() === 'asc' ? aNum - bNum : bNum - aNum;
      }

      return this.sortDirection() === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    if (this.filteredRows().length) {
      this.filteredRows.set(sortedRows);
    } else {
      this.allRows.set(sortedRows);
    }
  }

  applyFilter() {
    if (!this.filterColumn || this.filterValue === '') {
      this.filteredRows.set([]);
      return;
    }

    const filterNumber = Number(this.filterValue);

    const filtered = this.allRows().filter(row => {
      const value = (row as any)[this.filterColumn];
      const rowNumber = Number(value);

      if (isNaN(rowNumber) || isNaN(filterNumber)) {
        if (this.filterOperator === '=') {
          return String(value).toLowerCase() === String(this.filterValue).toLowerCase();
        }
        return false;
      }

      switch (this.filterOperator) {
        case '>':
          return rowNumber > filterNumber;
        case '>=':
          return rowNumber >= filterNumber;
        case '<':
          return rowNumber < filterNumber;
        case '<=':
          return rowNumber <= filterNumber;
        case '=':
          return rowNumber === filterNumber;
        default:
          return true;
      }
    });

    this.filteredRows.set(filtered);
  }

  clearFilter() {
    this.filterColumn = '';
    this.filterOperator = '>';
    this.filterValue = '';
    this.filteredRows.set([]);
  }
}
