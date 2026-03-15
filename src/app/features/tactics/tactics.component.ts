import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TeamService } from '../../core/services/team.service';
import { TacticsService } from '../../core/services/tactics.service';
import { PlayerService } from '../../core/services/player.service';
import { AuthService } from '../../core/services/auth.service';
import { Team } from '../../core/models/team.model';
import { Player } from '../../core/models/player.model';
import { Tactics, TacticsData, GamePlan, DepthChart } from '../../core/models/tactics.model';

@Component({
  selector: 'app-tactics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    DatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './tactics.component.html',
  styleUrl: './tactics.component.scss',
})
export class TacticsComponent implements OnInit {
  private teamService = inject(TeamService);
  private tacticsService = inject(TacticsService);
  private playerService = inject(PlayerService);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);

  teams = signal<Team[]>([]);
  selectedTeam = signal<Team | null>(null);
  players = signal<Player[]>([]);
  tactics = signal<Tactics | null>(null);

  loading = signal(false);
  submitting = signal(false);
  error = signal('');

  paceOptions = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
  frequencyOptions = ['Never', 'Sometimes', 'Normal', 'Often', 'Always'];
  offenseOptions = ['Inside', 'Balanced', 'Outside'];
  positions = ['C', 'PF', 'SF', 'SG', 'PG'];
  positionsMobile = ['PG', 'SG', 'SF', 'PF', 'C'];

  gamePlan = signal<GamePlan>({
    pace: 'Normal',
    trapFrequency: 'Never',
    pressFrequency: 'Never',
    offenseFocus: 'Balanced',
  });

  // Wymagany gracz (nie null)
  playerRequired = (control: AbstractControl): ValidationErrors | null => {
    return control.value === null ? { required: true } : null;
  };

  // Brak powtórzeń w FormArray
  noDuplicates = (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const values = array.controls
      .filter(c => !c.disabled && c.value !== null)
      .map(c => `${c.value.firstName}_${c.value.lastName}`);
    return values.length !== new Set(values).size ? { duplicates: true } : null;
  };

  // Starter (#1) nie może się powtarzać między pozycjami
  noStarterDuplicates = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const starters = ['C', 'PF', 'SF', 'SG', 'PG']
      .map(pos => (group.get(pos) as FormArray)?.at(0)?.value)
      .filter(v => v !== null)
      .map(v => `${v.firstName}_${v.lastName}`);
    return starters.length !== new Set(starters).size ? { starterDuplicates: true } : null;
  };

  form = new FormGroup({
    keyPlayers: new FormArray(
      [
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ],
      {},
    ),
    injuredList: new FormArray([
      new FormControl<Player | null>(null),
      new FormControl<Player | null>(null),
      new FormControl<Player | null>(null),
    ]),
    depthChart: new FormGroup({
      C: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ]),
      PF: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ]),
      SF: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ]),
      SG: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ]),
      PG: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ]),
    }),
  });

  get keyPlayersArray(): FormArray {
    return this.form.get('keyPlayers') as FormArray;
  }
  get injuredListArray(): FormArray {
    return this.form.get('injuredList') as FormArray;
  }
  depthChartArray(pos: string): FormArray {
    return this.form.get('depthChart')?.get(pos) as FormArray;
  }

  hasMultipleTeams = computed(() => this.teams().length > 1);
  hasNoTeams = computed(() => this.teams().length === 0);

  get availablePlayers(): Player[] {
    const injured = this.injuredListArray
      .getRawValue()
      .filter((p: Player | null) => p !== null)
      .map((p: Player) => `${p.firstName}_${p.lastName}`);
    return this.players().filter(p => !injured.includes(`${p.firstName}_${p.lastName}`));
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.teamService.getTeams().subscribe({
      next: teams => {
        this.teams.set(teams);
        if (teams.length === 1) {
          this.selectTeam(teams[0]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania drużyn');
        this.loading.set(false);
      },
    });
  }

  selectTeam(team: Team): void {
    this.selectedTeam.set(team);
    this.loadPlayersAndTactics(team);
  }

  loadPlayersAndTactics(team: Team): void {
    const csvName = team.csvTeamName || team.name;
    this.playerService.getPlayers(csvName).subscribe({
      next: players => {
        this.players.set(players);
        this.updateILControls();
        // Dopiero po załadowaniu graczy ładuj taktykę
        this.loadTactics(team.id);
      },
    });
  }

  loadTactics(teamId: number): void {
    this.tacticsService.getTacticsByTeam(teamId).subscribe({
      next: tactics => {
        this.tactics.set(tactics);
        this.updateILControls();
        if (tactics.dataDraft) {
          this.fillFormIL(tactics.dataDraft); // najpierw IL
          this.fillFormKeyPlayers(tactics.dataDraft); // potem Key Players
          this.fillFormDepthChart(tactics.dataDraft);
        } else if (tactics.dataApproved) {
          this.fillFormIL(tactics.dataApproved);
          this.fillFormKeyPlayers(tactics.dataApproved);
          this.fillFormDepthChart(tactics.dataApproved);
        }
      },
      error: () => {},
    });
  }

  fillFormIL(data: TacticsData): void {
    this.gamePlan.set(data.gamePlan);
    const il = [...data.injuredList, null, null, null].slice(0, 3);
    il.forEach((player, i) => {
      const control = this.injuredListArray.at(i);
      if (control.disabled) return;
      const exists = player
        ? this.players().find(
            p => p.firstName === player.firstName && p.lastName === player.lastName,
          )
        : null;
      control.setValue(exists || null);
    });

    // Przelicz duplikaty IL po wypełnieniu
    const values = this.injuredListArray.controls.map(c => c.value);
    this.injuredListArray.controls.forEach((control, i) => {
      const val = control.value;
      if (val === null) return;
      const isDuplicate = values.some(
        (v, vi) => vi !== i && v?.firstName === val.firstName && v?.lastName === val.lastName,
      );
      if (isDuplicate) {
        control.setErrors({ ...control.errors, duplicates: true });
      }
    });
  }

  fillFormKeyPlayers(data: TacticsData): void {
    const injuredNames = this.injuredListArray.controls
      .filter(c => !c.disabled && c.value !== null)
      .map(c => `${c.value.firstName}_${c.value.lastName}`);

    const kp = [...data.keyPlayers, null, null, null].slice(0, 3);
    kp.forEach((player, i) => {
      const exists = player
        ? this.players().find(
            p => p.firstName === player.firstName && p.lastName === player.lastName,
          )
        : null;
      const isInjured = exists
        ? injuredNames.includes(`${exists.firstName}_${exists.lastName}`)
        : false;
      this.keyPlayersArray.at(i).setValue(exists && !isInjured ? exists : null);
    });

    // Przelicz duplikaty po wypełnieniu
    const values = this.keyPlayersArray.controls.map(c => c.value);
    this.keyPlayersArray.controls.forEach((control, i) => {
      const val = control.value;
      if (val === null) return;
      const isDuplicate = values.some(
        (v, vi) => vi !== i && v?.firstName === val.firstName && v?.lastName === val.lastName,
      );
      if (isDuplicate) {
        control.setErrors({ ...control.errors, duplicates: true });
      }
    });
  }

  fillFormDepthChart(data: TacticsData): void {
    for (const pos of this.positions) {
      const posPlayers = data.depthChart[pos as keyof DepthChart] || [];
      const dc = [...posPlayers, null, null, null].slice(0, 3);
      dc.forEach((player, i) => {
        const exists = player
          ? this.players().find(
              p => p.firstName === player.firstName && p.lastName === player.lastName,
            )
          : null;
        this.depthChartArray(pos)
          .at(i)
          .setValue(exists || null);
      });
    }

    // Przelicz duplikaty starterów po wypełnieniu
    const starters = this.positions.map(pos => this.depthChartArray(pos).at(0).value);
    this.positions.forEach((pos, pi) => {
      const control = this.depthChartArray(pos).at(0);
      const val = control.value;
      if (val === null) return;
      const isDuplicate = starters.some(
        (v, vi) => vi !== pi && v?.firstName === val.firstName && v?.lastName === val.lastName,
      );
      if (isDuplicate) {
        control.setErrors({ ...control.errors, starterDuplicates: true });
      }
    });
  }

  updateGamePlan(field: keyof GamePlan, value: string): void {
    this.gamePlan.set({ ...this.gamePlan(), [field]: value });
  }

  updateKeyPlayer(index: number, player: Player | null): void {
    this.keyPlayersArray.at(index).setValue(player);
    this.keyPlayersArray.updateValueAndValidity();

    // Ręczne ustawienie błędu duplikatu na kontrolkach
    const values = this.keyPlayersArray.controls.map(c => c.value);
    this.keyPlayersArray.controls.forEach((control, i) => {
      const val = control.value;
      if (val === null) return;
      const isDuplicate = values.some(
        (v, vi) => vi !== i && v?.firstName === val.firstName && v?.lastName === val.lastName,
      );
      if (isDuplicate) {
        control.setErrors({ ...control.errors, duplicates: true });
      } else {
        const errors = { ...control.errors };
        delete errors['duplicates'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    });
  }
  updateInjuredList(index: number, player: Player | null): void {
    this.injuredListArray.at(index).setValue(player);
    this.injuredListArray.updateValueAndValidity();

    // Wyczyść Key Players i Depth Chart jeśli gracz trafił na IL
    if (player !== null) {
      this.keyPlayersArray.controls.forEach(c => {
        if (
          c.value &&
          c.value.firstName === player.firstName &&
          c.value.lastName === player.lastName
        ) {
          c.setValue(null);
        }
      });
      this.positions.forEach(pos => {
        this.depthChartArray(pos).controls.forEach(c => {
          if (
            c.value &&
            c.value.firstName === player.firstName &&
            c.value.lastName === player.lastName
          ) {
            c.setValue(null);
          }
        });
      });
    }
  }

  updateILControls(): void {
    this.injuredListArray.controls.forEach((control, i) => {
      if (this.ilDisabled || i >= this.requiredIL) {
        control.clearValidators();
        control.disable();
        control.setValue(null);
      } else {
        control.setValidators(this.playerRequired);
        control.enable();
        control.updateValueAndValidity();
      }
    });
  }

  updateDepthChart(position: string, index: number, player: Player | null): void {
    this.depthChartArray(position).at(index).setValue(player);
    if (index === 0) {
      (this.form.get('depthChart') as FormGroup).updateValueAndValidity();
    }
  }

  clearForm(): void {
    this.gamePlan.set({
      pace: 'Normal',
      trapFrequency: 'Never',
      pressFrequency: 'Never',
      offenseFocus: 'Balanced',
    });
    this.keyPlayersArray.controls.forEach(c => c.setValue(null));
    this.injuredListArray.controls.forEach(c => c.setValue(null));
    this.positions.forEach(pos =>
      this.depthChartArray(pos).controls.forEach(c => c.setValue(null)),
    );
  }

  buildTacticsData(): TacticsData {
    return {
      gamePlan: this.gamePlan(),
      keyPlayers: this.keyPlayersArray.value.filter((p: Player | null) => p !== null) as Player[],
      injuredList: this.injuredListArray.value.filter((p: Player | null) => p !== null) as Player[],
      depthChart: {
        C: this.depthChartArray('C').value.filter((p: Player | null) => p !== null) as Player[],
        PF: this.depthChartArray('PF').value.filter((p: Player | null) => p !== null) as Player[],
        SF: this.depthChartArray('SF').value.filter((p: Player | null) => p !== null) as Player[],
        SG: this.depthChartArray('SG').value.filter((p: Player | null) => p !== null) as Player[],
        PG: this.depthChartArray('PG').value.filter((p: Player | null) => p !== null) as Player[],
      },
    };
  }

  submitTactics(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (!this.tactics()) return;
    this.submitting.set(true);
    this.error.set('');

    this.tacticsService.saveDraft(this.tactics()!.id, this.buildTacticsData()).subscribe({
      next: () => {
        this.tacticsService.submitTactics(this.tactics()!.id).subscribe({
          next: () => {
            this.submitting.set(false);
            this.loadTactics(this.selectedTeam()!.id);
            this.snackBar.open('Taktyka wysłana do zatwierdzenia!', 'OK', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
          error: err => {
            this.error.set(err.error?.message || 'Błąd wysyłania');
            this.submitting.set(false);
          },
        });
      },
      error: err => {
        this.error.set(err.error?.message || 'Błąd zapisu');
        this.submitting.set(false);
      },
    });
  }

  playerShortName(p: Player): string {
    return `${p.firstName.charAt(0)}. ${p.lastName}`;
  }

  comparePlayer(p1: Player | null, p2: Player | null): boolean {
    if (!p1 || !p2) return p1 === p2;
    return p1.firstName === p2.firstName && p1.lastName === p2.lastName;
  }

  getControl(array: FormArray, index: number): FormControl {
    return array.at(index) as FormControl;
  }

  get requiredIL(): number {
    return Math.max(0, this.players().length - 12);
  }

  get ilDisabled(): boolean {
    return this.requiredIL === 0;
  }
}
