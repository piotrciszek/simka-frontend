import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { StandingsService } from '../../../core/services/standings.service';
import {
  buildStandingsView,
  ConferenceView,
  parseView,
  StandingsView,
} from './standings-view';

// Status HTTP z błędu resource. HttpErrorResponse ma name/message, więc Angular
// zwykle przekazuje go bez opakowania — ale na wszelki wypadek sprawdzamy też .cause.
function httpStatus(err: Error): number {
  if (err instanceof HttpErrorResponse) return err.status;
  if (err.cause instanceof HttpErrorResponse) return err.cause.status;
  return 0;
}

@Component({
  selector: 'app-standings-v2',
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './standings-v2.component.html',
  styleUrl: './standings-v2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandingsV2Component {
  private standingsService = inject(StandingsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly displayedColumns = [
    'team', 'wins', 'losses', 'winPct', 'last10', 'home', 'road', 'gb', 'streak',
  ] as const;

  // null = bieżący sezon (backend sam wybiera)
  readonly season = signal<number | null>(null);
  // Widok z query param ?view= — URL jest źródłem prawdy (odświeżenie, Wstecz, link do udostępnienia)
  readonly view = toSignal(
    this.route.queryParamMap.pipe(map(p => parseView(p.get('view')))),
    { initialValue: parseView(this.route.snapshot.queryParamMap.get('view')) },
  );
  readonly invalidInput = signal(false);

  // rxResource (w Angular 21.2 nadal @experimental): sam subskrybuje, anuluje poprzednie
  // zapytanie przy zmianie season i wystawia sygnały value / isLoading / error.
  // params opakowane w obiekt, bo undefined oznacza dla resource "nie ładuj".
  readonly standings = rxResource({
    params: () => ({ season: this.season() }),
    stream: ({ params }) => this.standingsService.getStandings(params.season),
  });

  // Pole sezonu: po załadowaniu danych przyjmuje data.season, ale użytkownik może je nadpisać.
  // Gdy danych nie ma (ładowanie / błąd), zostaje poprzednia wartość.
  readonly seasonInput = linkedSignal<number | null, number | null>({
    source: () => (this.standings.hasValue() ? this.standings.value().season : null),
    computation: (loaded, previous) => loaded ?? previous?.value ?? null,
  });

  readonly header = computed(() => {
    const res = this.standings;
    if (!res.hasValue()) return null;
    const { season, lastGameDay } = res.value();
    return lastGameDay === null
      ? `Sezon ${season} · sezon jeszcze się nie rozpoczął`
      : `Sezon ${season} · po dniu ${lastGameDay}`;
  });

  readonly errorMessage = computed(() => {
    const err = this.standings.error();
    if (!err) return null;
    switch (httpStatus(err)) {
      case 400:
        return 'Nieprawidłowy sezon.';
      case 404:
        return `Brak danych dla sezonu ${this.season() ?? 'bieżącego'}.`;
      default:
        return 'Nie udało się pobrać tabeli.';
    }
  });

  // Jedna odpowiedź API → wszystkie trzy widoki. Zmiana widoku przelicza tylko ten computed,
  // season się nie zmienia, więc rxResource nie wysyła nowego requestu.
  readonly conferences = computed<ConferenceView[]>(() => {
    // Lokalna zmienna — type guard hasValue() zawęża typ value() do StandingsResponse
    const res = this.standings;
    return res.hasValue() ? buildStandingsView(res.value(), this.view()) : [];
  });

  setView(view: StandingsView): void {
    // Zwykła nawigacja (bez replaceUrl) — przycisk Wstecz wraca do poprzedniego widoku
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  loadSeason(): void {
    const value = this.seasonInput();
    // Walidacja po stronie frontu — nie wysyłamy zapytania z oczywiście złą wartością
    if (value === null || !Number.isInteger(value) || value <= 0) {
      this.invalidInput.set(true);
      return;
    }
    this.invalidInput.set(false);

    if (value === this.season()) {
      // Ten sam sezon — signal by się nie zmienił, więc wymuszamy ponowne pobranie
      this.standings.reload();
    } else {
      this.season.set(value);
    }
  }
}
