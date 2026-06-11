import { Component, inject, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PlayerService } from '../../../core/services/player.service';
import { StatsService, type PlayerListItem } from '../../../core/services/stats.service';

export interface ComparisonItem {
  label: string;
  leftValue: string;
  rightValue: string;
  leftWins: boolean;
  rightWins: boolean;
}

export interface ComparisonData<T> {
  leftPlayer: T;
  rightPlayer: T;
}

export interface CompareConfig {
  type: 'attributes' | 'stats';
  pageTitle: string;
  tableHeader: string;
  dataFields: Array<{ key: string; label: string }>;
  playerNameField: string;
  playerTeamField: string;
}

@Component({
  selector: 'app-player-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './player-compare.component.html',
  styleUrl: './player-compare.component.scss',
})
export class PlayerCompareComponent {
  private playerService = inject(PlayerService);
  private statsService = inject(StatsService);

  config = input.required<CompareConfig>();

  players = signal<PlayerListItem[]>([]);
  comparison = signal<ComparisonData<any> | null>(null);
  isLoading = signal(false);

  leftName = '';
  rightName = '';

  comparisonItems = signal<ComparisonItem[]>([]);

  constructor() {
    // Reaguj na zmiany konfiguracji używając effect
    effect(() => {
      const config = this.config();
      if (config) {
        this.loadPlayersList();
      }
    });
  }

  private loadPlayersList() {
    const config = this.config();

    if (config.type === 'attributes') {
      this.playerService.getPlayersFull().subscribe({
        next: data => {
          // Konwertuj dane z endpointa na format kompatybilny z dropdownami
          const playersList = data.map((p: any) => ({
            Name: `${p.firstName} ${p.lastName}`,
            Team: p.team,
            Position: p.position,
          }));
          this.players.set(playersList);
        },
        error: error => {
          console.error('Błąd ładowania listy graczy:', error);
        },
      });
    } else {
      this.statsService.getPlayersList().subscribe({
        next: data => {
          this.players.set(data);
        },
        error: error => {
          console.error('Błąd ładowania listy graczy:', error);
        },
      });
    }
  }

  selectPlayers() {
    if (!this.leftName || !this.rightName) {
      this.comparison.set(null);
      this.comparisonItems.set([]);
      return;
    }

    this.isLoading.set(true);
    const config = this.config();

    if (config.type === 'attributes') {
      this.compareAttributes(this.leftName, this.rightName);
    } else {
      this.compareStats(this.leftName, this.rightName);
    }
  }

  private compareAttributes(player1Name: string, player2Name: string) {
    this.playerService.getPlayersFull().subscribe({
      next: data => {
        // Znajdź graczy w danych
        const leftPlayer = data.find((p: any) => `${p.firstName} ${p.lastName}` === player1Name);
        const rightPlayer = data.find((p: any) => `${p.firstName} ${p.lastName}` === player2Name);

        if (!leftPlayer || !rightPlayer) {
          console.error('Nie znaleziono jednego lub obu graczy');
          this.comparison.set(null);
          this.comparisonItems.set([]);
          this.isLoading.set(false);
          return;
        }

        const leftAttributes = this.convertToPlayerAttributes(leftPlayer);
        const rightAttributes = this.convertToPlayerAttributes(rightPlayer);

        const comparisonData = {
          leftPlayer: leftAttributes,
          rightPlayer: rightAttributes,
        };

        this.comparison.set(comparisonData);
        this.generateComparison(comparisonData);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Błąd porównania graczy:', error);
        this.comparison.set(null);
        this.comparisonItems.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private compareStats(player1Name: string, player2Name: string) {
    this.statsService.comparePlayers(player1Name, player2Name).subscribe({
      next: data => {
        this.comparison.set(data);
        this.generateComparison(data);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Błąd porównania graczy:', error);
        this.comparison.set(null);
        this.comparisonItems.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private convertToPlayerAttributes(player: any) {
    return {
      firstName: player.firstName,
      lastName: player.lastName,
      name: `${player.firstName} ${player.lastName}`,
      team: player.team,
      position: player.position,
      // Mapowanie z snake_case (backend) na PascalCase (frontend interface)
      InsideScoring: player.inside_scoring || 0,
      Jumpshot: player.jumpshot || 0,
      '3P': player.three_p || 0,
      Handling: player.handling || 0,
      Passing: player.passing || 0,
      Quickness: player.quickness || 0,
      PostD: player.post_d || 0,
      PerimeterD: player.perimeter_d || 0,
      DriveD: player.drive_d || 0,
      Stealing: player.stealing || 0,
      Blocking: player.blocking || 0,
      Oreb: player.oreb || 0,
      Dreb: player.dreb || 0,
      Jumping: player.jumping || 0,
      Strength: player.strength || 0,
      Potential: player.potential || 0,
      Overall:
        (player.inside_scoring || 0) +
          (player.jumpshot || 0) +
          (player.three_p || 0) +
          (player.handling || 0) +
          (player.passing || 0) +
          (player.quickness || 0) +
          (player.post_d || 0) +
          (player.perimeter_d || 0) +
          (player.drive_d || 0) +
          (player.stealing || 0) +
          (player.blocking || 0) +
          (player.oreb || 0) +
          (player.dreb || 0) +
          (player.jumping || 0) +
          (player.strength || 0),
    };
  }

  private generateComparison(comparison: ComparisonData<any>) {
    const left = comparison.leftPlayer;
    const right = comparison.rightPlayer;
    const config = this.config();

    const comparisonData = config.dataFields.map(field => {
      const leftValue = (left as any)[field.key];
      const rightValue = (right as any)[field.key];
      const leftNum = parseFloat(leftValue) || 0;
      const rightNum = parseFloat(rightValue) || 0;

      const leftWins = leftNum > rightNum;
      const rightWins = rightNum > leftNum;

      // Lista statystyk procentowych dla stats
      const percentageStats = ['FG%', '3P%', 'FT%', 'TS%', 'eFG%'];
      const isPercentageStat = config.type === 'stats' && percentageStats.includes(field.key);

      return {
        label: field.label,
        leftValue: this.formatValue(leftValue, isPercentageStat, config.type === 'attributes'),
        rightValue: this.formatValue(rightValue, isPercentageStat, config.type === 'attributes'),
        leftWins,
        rightWins,
      };
    });

    this.comparisonItems.set(comparisonData);
  }

  private formatValue(value: any, isPercentage: boolean, isAttribute: boolean = false): string {
    if (value == null) return '0';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';

    if (isPercentage) {
      // Konwertuj 0.42 → 42%
      return `${(numValue * 100).toFixed(1)}%`;
    }

    if (isAttribute) {
      // Atrybuty graczy - liczby całkowite bez miejsc dziesiętnych
      return Math.round(numValue).toString();
    }

    // Statystyki - liczby z 2 miejscami dziesiętnymi
    return typeof value === 'number' ? value.toFixed(2) : value.toString();
  }

  // Getter dla nazw graczy - abstrahuje różnice w strukturze danych
  getPlayerName(player: any): string {
    const config = this.config();
    return (player as any)[config.playerNameField] || '';
  }

  getPlayerTeam(player: any): string {
    const config = this.config();
    return (player as any)[config.playerTeamField] || '';
  }
}
