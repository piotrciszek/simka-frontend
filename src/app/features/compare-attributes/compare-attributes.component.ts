import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerAttributesService } from '../../services/player-attributes.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-compare-attributes',
  standalone: true,
	imports: [
	  CommonModule,
	  FormsModule,
	  MatButtonModule,
	  MatFormFieldModule,
	  MatSelectModule
	],
  templateUrl: './compare-attributes.component.html',
  styleUrl: './compare-attributes.component.scss'
})
export class CompareAttributesComponent {
  selectedFile: File | null = null;
  fileName = '';

  leftName = '';
  rightName = '';

  leftPlayer: Record<string, string> | null = null;
  rightPlayer: Record<string, string> | null = null;

  constructor(
  public attributesService: PlayerAttributesService,
  private cdr: ChangeDetectorRef
) {}

async selectFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  this.selectedFile = input.files[0];
  this.fileName = this.selectedFile.name;

  input.value = '';

  await this.loadCsv();
}

  async loadCsv(): Promise<void> {
    if (!this.selectedFile) return;

    await this.attributesService.loadFile(this.selectedFile);

    this.leftName = '';
    this.rightName = '';
    this.leftPlayer = null;
    this.rightPlayer = null;
  }

  selectPlayers(): void {
    this.leftPlayer =
      this.attributesService.players.find(p => p['Name'] === this.leftName) || null;

    this.rightPlayer =
      this.attributesService.players.find(p => p['Name'] === this.rightName) || null;
  }

  isLeftBetter(attr: string): boolean {
    if (!this.leftPlayer || !this.rightPlayer) return false;

    const left = Number(this.leftPlayer[attr]);
    const right = Number(this.rightPlayer[attr]);

    return !isNaN(left) && !isNaN(right) && left > right;
  }

  isRightBetter(attr: string): boolean {
    if (!this.leftPlayer || !this.rightPlayer) return false;

    const left = Number(this.leftPlayer[attr]);
    const right = Number(this.rightPlayer[attr]);

    return !isNaN(left) && !isNaN(right) && right > left;
  }
}
