import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  FormGroup,
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

  readonly positionOrder: Record<string, string[]> = {
    C: ['C', 'PF', 'SF', 'SG', 'PG'],
    PF: ['PF', 'C', 'SF', 'SG', 'PG'],
    SF: ['SF', 'SG', 'PF', 'PG', 'C'],
    SG: ['SG', 'SF', 'PG', 'PF', 'C'],
    PG: ['PG', 'SG', 'SF', 'PF', 'C'],
  };

  gamePlan = signal<GamePlan>({
    pace: 'Normal',
    trapFrequency: 'Never',
    pressFrequency: 'Never',
    offenseFocus: 'Balanced',
  });

  // ── HELPER METHODS ──

  private isOnIL(player: Player): boolean {
    return this.injuredListArray.controls.some(control => {
      const ilPlayer = control.value;
      return ilPlayer &&
             ilPlayer.firstName === player.firstName &&
             ilPlayer.lastName === player.lastName;
    });
  }

  private removeFromOtherForms(player: Player): void {
    // Usuń z Key Players
    this.keyPlayersArray.controls.forEach(control => {
      if (control.value &&
          control.value.firstName === player.firstName &&
          control.value.lastName === player.lastName) {
        control.setValue(null);
      }
    });

    // Usuń z Depth Chart (wszystkie pozycje i poziomy)
    this.positions.forEach(pos => {
      this.depthChartArray(pos).controls.forEach(control => {
        if (control.value &&
            control.value.firstName === player.firstName &&
            control.value.lastName === player.lastName) {
          control.setValue(null);
        }
      });
    });
  }

  private getPlayerKey(player: Player): string {
    return `${player.firstName}_${player.lastName}`;
  }

  private updateILSignal(): void {
    const ilPlayers = this.injuredListArray.controls
      .map(c => c.value)
      .filter((p): p is Player => p !== null);
    this.ilPlayersSignal.set([...ilPlayers]);
  }

  // ── COMPUTED SIGNALS ──

  availableForKeyPlayers = computed(() => {
    // Wymuszamy reactywność przez odczyt ilPlayersSignal
    const ilPlayers = this.ilPlayersSignal();
    return this.players().filter(p =>
      !ilPlayers.some(ilPlayer =>
        ilPlayer.firstName === p.firstName &&
        ilPlayer.lastName === p.lastName
      )
    );
  });

  availableForDepthChart = computed(() => {
    // Wymuszamy reactywność przez odczyt ilPlayersSignal
    const ilPlayers = this.ilPlayersSignal();
    return this.players().filter(p =>
      !ilPlayers.some(ilPlayer =>
        ilPlayer.firstName === p.firstName &&
        ilPlayer.lastName === p.lastName
      )
    );
  });

  // ── WALIDATORY ──

  ilNoDuplicates = (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const players = array.controls
      .map(c => c.value)
      .filter((p): p is Player => p !== null);

    const duplicates: { index: number; player: Player; duplicateIndexes: number[] }[] = [];

    players.forEach((player, i) => {
      const otherIndexes = players
        .map((p, idx) => ({ player: p, index: idx }))
        .filter(({ player: p, index: idx }) =>
          idx !== i &&
          p.firstName === player.firstName &&
          p.lastName === player.lastName
        )
        .map(({ index }) => index);

      if (otherIndexes.length > 0) {
        duplicates.push({
          index: i,
          player,
          duplicateIndexes: otherIndexes
        });
      }
    });

    return duplicates.length > 0 ? {
      ilDuplicates: {
        message: 'Gracz nie może być na IL więcej niż raz',
        duplicates
      }
    } : null;
  };

  noStarterDuplicates = (control: AbstractControl): ValidationErrors | null => {
    const depthChartGroup = control as FormGroup;
    const starters = this.positions.map(pos => ({
      position: pos,
      player: (depthChartGroup.get(pos) as FormArray)?.at(0)?.value
    })).filter(({ player }) => player !== null);

    const conflicts: { position: string; player: Player; conflictPositions: string[] }[] = [];

    starters.forEach(({ position, player }) => {
      const conflictPositions = starters
        .filter(({ position: pos, player: p }) =>
          pos !== position &&
          p.firstName === player.firstName &&
          p.lastName === player.lastName
        )
        .map(({ position: pos }) => pos);

      if (conflictPositions.length > 0) {
        conflicts.push({
          position,
          player,
          conflictPositions
        });
      }
    });

    return conflicts.length > 0 ? {
      starterDuplicates: {
        message: 'Gracz może być starterem tylko na jednej pozycji',
        conflicts
      }
    } : null;
  };

  playerRequired = (control: AbstractControl): ValidationErrors | null => {
    return control.value === null ? {
      required: {
        message: 'Wybierz gracza'
      }
    } : null;
  };

  keyPlayersNoDuplicates = (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const players = array.controls
      .map(c => c.value)
      .filter((p): p is Player => p !== null);

    const duplicates: { index: number; player: Player; duplicateIndexes: number[] }[] = [];

    players.forEach((player, i) => {
      const otherIndexes = players
        .map((p, idx) => ({ player: p, index: idx }))
        .filter(({ player: p, index: idx }) =>
          idx !== i &&
          p.firstName === player.firstName &&
          p.lastName === player.lastName
        )
        .map(({ index }) => index);

      if (otherIndexes.length > 0) {
        duplicates.push({
          index: i,
          player,
          duplicateIndexes: otherIndexes
        });
      }
    });

    return duplicates.length > 0 ? {
      keyPlayersDuplicates: {
        message: 'Gracz nie może być wybrany więcej niż raz w Key Players',
        duplicates
      }
    } : null;
  };

  // Walidator dla pozycji w Depth Chart - gracz nie może być #1 i #2 na tej samej pozycji
  depthChartPositionNoDuplicates = (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const starter = array.at(0)?.value; // #1
    const backup1 = array.at(1)?.value; // #2

    // Sprawdź czy #1 i #2 to ten sam gracz
    if (starter && backup1 &&
        starter.firstName === backup1.firstName &&
        starter.lastName === backup1.lastName) {
      return {
        samePlayerStarterBackup: {
          message: `Gracz nie może być jednocześnie #1 i #2 na tej samej pozycji`,
          player: starter
        }
      };
    }

    return null;
  };

  form = new FormGroup({
    keyPlayers: new FormArray([
      new FormControl<Player | null>(null, this.playerRequired),
      new FormControl<Player | null>(null, this.playerRequired),
      new FormControl<Player | null>(null, this.playerRequired),
    ], this.keyPlayersNoDuplicates),
    injuredList: new FormArray([
      new FormControl<Player | null>(null),
      new FormControl<Player | null>(null),
      new FormControl<Player | null>(null),
    ], this.ilNoDuplicates),
    depthChart: new FormGroup({
      C: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ], this.depthChartPositionNoDuplicates),
      PF: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ], this.depthChartPositionNoDuplicates),
      SF: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ], this.depthChartPositionNoDuplicates),
      SG: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ], this.depthChartPositionNoDuplicates),
      PG: new FormArray([
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
        new FormControl<Player | null>(null, this.playerRequired),
      ], this.depthChartPositionNoDuplicates),
    }, this.noStarterDuplicates),
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

  sortedPlayers = computed(() => {
    const order = ['C', 'PF', 'SF', 'SG', 'PG'];
    return [...this.players()].sort((a, b) => {
      const ai = order.indexOf(a.position);
      const bi = order.indexOf(b.position);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  });

  getPlayersForPosition(pos: string): Player[] {
    const order = this.positionOrder[pos] ?? this.positions;
    return [...this.availableForDepthChart()].sort((a, b) => {
      const ai = order.indexOf(a.position);
      const bi = order.indexOf(b.position);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }

  getPlayersForKeyPlayers(): Player[] {
    return [...this.availableForKeyPlayers()].sort((a, b) => {
      const order = ['C', 'PF', 'SF', 'SG', 'PG'];
      const ai = order.indexOf(a.position);
      const bi = order.indexOf(b.position);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
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
      const exists = player
        ? this.players().find(
            p => p.firstName === player.firstName && p.lastName === player.lastName,
          )
        : null;
      this.injuredListArray.at(i).setValue(exists || null);
    });

    // Wymusz aktualizację IL signal po wypełnieniu
    this.updateILSignal();
  }

  fillFormKeyPlayers(data: TacticsData): void {
    const kp = [...data.keyPlayers, null, null, null].slice(0, 3);
    kp.forEach((player, i) => {
      const exists = player
        ? this.players().find(
            p => p.firstName === player.firstName && p.lastName === player.lastName,
          )
        : null;
      this.keyPlayersArray.at(i).setValue(exists || null);
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
  }

  updateGamePlan(field: keyof GamePlan, value: string): void {
    this.gamePlan.set({ ...this.gamePlan(), [field]: value });
  }

  updateKeyPlayer(index: number, player: Player | null): void {
    this.keyPlayersArray.at(index).setValue(player);
    this.keyPlayersArray.updateValueAndValidity();

    // Propaguj błędy duplikatów na kontrolki żeby podświetlić pola
    // Wywołujemy asynchronicznie żeby walidatory FormArray się wykonały
    setTimeout(() => {
      this.propagateArrayErrorsToControls(this.keyPlayersArray);
    });
  }

  updateInjuredList(index: number, player: Player | null): void {
    const previousPlayer = this.injuredListArray.at(index).value;

    // Ustaw nową wartość
    this.injuredListArray.at(index).setValue(player);

    // Wymusz aktualizację IL signal dla reactywności
    this.updateILSignal();

    // Jeśli dodano gracza na IL - usuń go z innych formularzy
    if (player !== null) {
      this.removeFromOtherForms(player);
    }

    // Przeliczy walidację IL (duplikaty)
    this.injuredListArray.updateValueAndValidity();

    // Propaguj błędy duplikatów na kontrolki żeby podświetlić pola (asynchronicznie)
    setTimeout(() => {
      this.propagateArrayErrorsToControls(this.injuredListArray);
    });

    // Przeliczy walidację innych formularzy jeśli potrzeba
    this.keyPlayersArray.updateValueAndValidity();
    setTimeout(() => {
      this.propagateArrayErrorsToControls(this.keyPlayersArray);
    });
    (this.form.get('depthChart') as FormGroup).updateValueAndValidity();
  }

  updateILControls(): void {
    this.injuredListArray.controls.forEach((control, i) => {
      if (this.ilDisabled() || i >= this.requiredIL()) {
        control.clearValidators();
        control.disable();
        control.setValue(null);
      } else {
        control.setValidators([this.playerRequired]);
        control.enable();
        control.updateValueAndValidity();
      }
    });
  }

  updateDepthChart(position: string, index: number, player: Player | null): void {
    this.depthChartArray(position).at(index).setValue(player);

    // Przeliczy walidację pozycji (starter+backup validation)
    this.depthChartArray(position).updateValueAndValidity();

    // Propaguj błędy na kontrolki żeby podświetlić pola (asynchronicznie)
    setTimeout(() => {
      this.propagateArrayErrorsToControls(this.depthChartArray(position));
    });

    // Jeśli to starter (index 0), przeliczy walidację całego depth chart (starter duplicates)
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
    // Oznacz wszystkie pola jako touched żeby pokazać błędy
    this.form.markAllAsTouched();

    // Dodatkowe oznaczenie dla FormArray - czasem markAllAsTouched nie wystarczy
    this.keyPlayersArray.markAsTouched();
    this.injuredListArray.markAsTouched();
    (this.form.get('depthChart') as FormGroup).markAsTouched();

    // Oznacz wszystkie kontrolki w FormArrays
    this.keyPlayersArray.controls.forEach(c => c.markAsTouched());
    this.injuredListArray.controls.forEach(c => c.markAsTouched());
    this.positions.forEach(pos => {
      this.depthChartArray(pos).markAsTouched();
      this.depthChartArray(pos).controls.forEach(c => c.markAsTouched());
    });

    // Propaguj błędy z FormArray na kontrolki żeby podświetlić wszystkie błędne pola
    this.propagateArrayErrorsToControls(this.keyPlayersArray);
    this.propagateArrayErrorsToControls(this.injuredListArray);
    this.positions.forEach(pos => {
      this.propagateArrayErrorsToControls(this.depthChartArray(pos));
    });

    // Sprawdź czy formularz jest valid
    if (this.form.invalid) {
      this.error.set('Popraw błędy w formularzu przed wysłaniem');
      return;
    }

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

  // ── ERROR HANDLING ──

  getErrorMessage(control: AbstractControl): string {
    if (!control.errors) return '';

    // Required error
    if (control.errors['required']) {
      return control.errors['required'].message || 'Pole wymagane';
    }

    // Key Players duplicates
    if (control.errors['keyPlayersDuplicates']) {
      return control.errors['keyPlayersDuplicates'].message || 'Duplikaty w Key Players';
    }

    // IL duplicates
    if (control.errors['ilDuplicates']) {
      return control.errors['ilDuplicates'].message || 'Duplikaty na liście kontuzjowanych';
    }

    // Starter duplicates
    if (control.errors['starterDuplicates']) {
      const error = control.errors['starterDuplicates'];
      return error.message || 'Duplikaty w starterach';
    }

    // Same player starter+backup na tej samej pozycji
    if (control.errors['samePlayerStarterBackup']) {
      const error = control.errors['samePlayerStarterBackup'];
      return error.message || 'Gracz nie może być jednocześnie #1 i #2';
    }

    // Błędy propagowane z FormArray na kontrolki
    if (control.errors['duplicateInArray']) {
      return control.errors['duplicateInArray'].message || 'Duplikat w formularzu';
    }

    if (control.errors['samePlayerBackup']) {
      return control.errors['samePlayerBackup'].message || 'Nie może być swoim zastępcą';
    }

    return 'Nieznany błąd walidacji';
  }

  hasFormErrors(): boolean {
    return this.form.invalid && this.form.touched;
  }

  // Sprawdź czy FormArray jest kompletnie valid (array + wszystkie ENABLED kontrolki)
  isFormArrayFullyValid(formArray: FormArray): boolean {
    const enabledControls = formArray.controls.filter(control => control.enabled);

    if (enabledControls.length === 0) {
      return true;
    }

    return formArray.valid && enabledControls.every(control => control.valid);
  }

  // Zbierz wszystkie błędy z FormArray (array + ENABLED kontrolki)
  getFormArrayErrors(formArray: FormArray): string[] {
    const errors: string[] = [];

    // Błędy z poziomu FormArray (duplikaty)
    if (formArray.errors) {
      errors.push(this.getErrorMessage(formArray));
    }

    // Błędy z poszczególnych kontrolek (tylko enabled)
    formArray.controls.forEach((control, index) => {
      if (control.enabled && control.errors) {
        errors.push(`Pozycja #${index + 1}: ${this.getErrorMessage(control)}`);
      }
    });

    return errors;
  }

  // Propaguj błędy z FormArray na konkretne kontrolki żeby podświetlić pola
  propagateArrayErrorsToControls(formArray: FormArray): void {
    // KROK 1: Wyczyść stare błędy propagowane z tego FormArray
    formArray.controls.forEach(control => {
      if (control.errors) {
        const cleanedErrors = { ...control.errors };
        delete cleanedErrors['duplicateInArray'];
        delete cleanedErrors['samePlayerBackup'];

        // Jeśli nie ma innych błędów, ustaw null
        const hasOtherErrors = Object.keys(cleanedErrors).length > 0;
        control.setErrors(hasOtherErrors ? cleanedErrors : null);
      }
    });

    // KROK 2: Dodaj nowe błędy jeśli istnieją

    // Key Players duplikaty
    if (formArray.errors?.['keyPlayersDuplicates']) {
      const duplicates = formArray.errors['keyPlayersDuplicates'].duplicates;
      duplicates.forEach((dup: any) => {
        const control = formArray.at(dup.index);
        const currentErrors = control.errors || {};
        control.setErrors({
          ...currentErrors,
          duplicateInArray: { message: 'Gracz już wybrany w Key Players' }
        });
      });
    }

    // IL duplikaty
    if (formArray.errors?.['ilDuplicates']) {
      const duplicates = formArray.errors['ilDuplicates'].duplicates;
      duplicates.forEach((dup: any) => {
        const control = formArray.at(dup.index);
        const currentErrors = control.errors || {};
        control.setErrors({
          ...currentErrors,
          duplicateInArray: { message: 'Gracz już wybrany na IL' }
        });
      });
    }

    // Depth Chart pozycja duplikaty (#1 i #2)
    if (formArray.errors?.['samePlayerStarterBackup']) {
      const control1 = formArray.at(0); // #1
      const control2 = formArray.at(1); // #2

      // Dodaj błąd do obu kontrolek
      [control1, control2].forEach(control => {
        const currentErrors = control.errors || {};
        control.setErrors({
          ...currentErrors,
          samePlayerBackup: { message: 'Nie może być swoim zastępcą' }
        });
      });
    }
  }

  requiredIL = computed(() => Math.max(0, this.players().length - 12));

  ilDisabled = computed(() => this.requiredIL() === 0);

  // Signal do śledzenia zmian IL dla reactywności
  private ilPlayersSignal = signal<Player[]>([]);

  constructor() {
    // Effect do śledzenia zmian w IL i wymuszania reactywności
    effect(() => {
      const ilPlayers = this.injuredListArray.controls
        .map(c => c.value)
        .filter((p): p is Player => p !== null);

      this.ilPlayersSignal.set(ilPlayers);
    });
  }
}
