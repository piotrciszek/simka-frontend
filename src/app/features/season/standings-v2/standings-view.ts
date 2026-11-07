import {
  ConferenceStandings,
  StandingsResponse,
  TeamStanding,
} from '../../../core/models/standings.model';
import { teamAbbr } from '../../../core/constants/team-abbr';
import {
  formatGb,
  formatRecord,
  formatStreak,
  formatWinPct,
} from './standings-format';

// Budowanie modelu widoku z jednej odpowiedzi API — czyste funkcje bez Angulara,
// komponent tylko wywołuje buildStandingsView() w computed().

export type StandingsView = 'division' | 'playoffs';

const VIEWS: readonly StandingsView[] = ['division', 'playoffs'];

// Top 8 z konferencji awansuje (drabinka MDB: 8 serii w 1. rundzie = 16 drużyn)
export const PLAYOFF_SPOTS = 8;

// Wiersz gotowy do wyświetlenia — wszystkie wartości już sformatowane,
// więc template nie wywołuje funkcji przy każdym change detection.
export interface StandingRow {
  teamId: number;
  team: string;
  // Skrót 3-literowy — pokazywany zamiast pełnej nazwy na wąskich ekranach
  abbr: string;
  wins: number;
  losses: number;
  winPct: string;
  last10: string;
  home: string;
  road: string;
  gb: string;
  streak: string;
  streakType: 'win' | 'loss' | 'none';
  // Tylko widok Playoffs: "*" przed nazwą (miejsce premiowane awansem)
  playoffSeed: boolean;
  // Tylko widok Playoffs: linia odcięcia pod tym wierszem (po ostatnim miejscu z awansem)
  cutoffAfter: boolean;
}

export interface StandingsTable {
  // null = bez podtytułu (Playoffs: jedna tabela na konferencję)
  title: string | null;
  rows: StandingRow[];
}

export interface ConferenceView {
  name: string;
  tables: StandingsTable[];
}

// Wartość z query param ?view= → znany widok; brak / zła wartość (też dawne 'conference') → division
export function parseView(raw: string | null): StandingsView {
  return VIEWS.find(v => v === raw) ?? 'division';
}

// Etykiety do wyświetlenia — backend zwraca krótkie identyfikatory ("East"/"West"),
// pełna nazwa to sprawa prezentacji, więc mapujemy po stronie frontu.
// Nieznana nazwa (np. nowa konferencja) → fallback "<nazwa> Conference" zamiast błędu.
const CONFERENCE_LABELS: Record<string, string> = {
  East: 'Eastern Conference',
  West: 'Western Conference',
};

export function conferenceLabel(name: string): string {
  return CONFERENCE_LABELS[name] ?? `${name} Conference`;
}

// rank/gb przekazywane z zewnątrz: w Division divRank/gb, w Playoffs rozstawienie/confGb
function toRow(t: TeamStanding, rank: number, gb: number): StandingRow {
  return {
    teamId: t.teamId,
    team: `${t.city} ${t.name}`,
    abbr: teamAbbr(t.name),
    wins: t.wins,
    losses: t.losses,
    winPct: formatWinPct(t.winPct),
    last10: formatRecord(t.last10),
    home: formatRecord(t.home),
    road: formatRecord(t.road),
    gb: formatGb(gb, rank === 1),
    streak: formatStreak(t.streak),
    streakType: t.streak > 0 ? 'win' : t.streak < 0 ? 'loss' : 'none',
    playoffSeed: false,
    cutoffAfter: false,
  };
}

function divisionTables(conf: ConferenceStandings): StandingsTable[] {
  // Kolejność drużyn bez zmian — backend sortuje po divRank
  return conf.divisions.map(d => ({
    title: `${d.name} Division`,
    rows: d.teams.map(t => toRow(t, t.divRank, t.gb)),
  }));
}

// Rozstawienie playoff w konferencji:
//  1-2: mistrzowie dywizji (gwarantowany awans), między sobą po confRank,
//  3+:  pozostałe drużyny po confRank.
// Np. mistrz Central z confRank 8 dostaje rozstawienie 2, a wszyscy z Atlantic poza mistrzem
// przesuwają się o jedno miejsce w dół.
// Kolejność wewnątrz grup bierzemy z confRank z API (FBB rankuje po GB, nie po winPct).
export function playoffSeeding(conf: ConferenceStandings): TeamStanding[] {
  const byConfRank = (a: TeamStanding, b: TeamStanding) => a.confRank - b.confRank;

  // Jeden mistrz na dywizję: divRank 1 (backend sortuje po divRank, więc fallback = pierwszy w tabeli)
  const winners = conf.divisions
    .map(d => d.teams.find(t => t.divRank === 1) ?? d.teams[0])
    .filter((t): t is TeamStanding => t !== undefined)
    .sort(byConfRank);

  const winnerIds = new Set(winners.map(t => t.teamId));
  const rest = conf.divisions
    .flatMap(d => d.teams)
    .filter(t => !winnerIds.has(t.teamId))
    .sort(byConfRank);

  return [...winners, ...rest];
}

function playoffTable(conf: ConferenceStandings): StandingsTable {
  const teams = playoffSeeding(conf);
  const rows = teams.map((t, i) => {
    const seed = i + 1;
    // GB = confGb bez zmian (odległość od lidera konferencji) — przy mistrzu dywizji
    // na 2. miejscu kolumna może nie rosnąć monotonicznie i to jest zamierzone
    const row = toRow(t, seed, t.confGb);
    row.playoffSeed = seed <= PLAYOFF_SPOTS;
    // Linia tylko gdy pod 8. miejscem ktoś jeszcze jest
    row.cutoffAfter = seed === PLAYOFF_SPOTS && teams.length > PLAYOFF_SPOTS;
    return row;
  });
  return { title: null, rows };
}

export function buildStandingsView(data: StandingsResponse, view: StandingsView): ConferenceView[] {
  return data.conferences.map(conf => ({
    name: conferenceLabel(conf.name),
    tables: view === 'division' ? divisionTables(conf) : [playoffTable(conf)],
  }));
}
