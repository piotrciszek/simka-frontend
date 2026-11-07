import { buildStandingsView, parseView, PLAYOFF_SPOTS, playoffSeeding } from './standings-view';
import { StandingsResponse, TeamStanding } from '../../../core/models/standings.model';

// Fabryka drużyny — nadpisujemy tylko pola istotne dla danego testu
function team(teamId: number, over: Partial<TeamStanding> = {}): TeamStanding {
  return {
    teamId,
    city: 'City',
    name: `T${teamId}`,
    wins: 0,
    losses: 0,
    winPct: 0,
    last10: { wins: 0, losses: 0 },
    home: { wins: 0, losses: 0 },
    road: { wins: 0, losses: 0 },
    gb: 0,
    confGb: 0,
    divRank: 1,
    confRank: teamId,
    streak: 0,
    ...over,
  };
}

// Konferencja East z 10 drużynami (5 + 5) i West z 6 — confRank przemieszany między dywizjami
function response(): StandingsResponse {
  return {
    season: 2051,
    lastGameDay: 30,
    conferences: [
      {
        name: 'East',
        divisions: [
          {
            name: 'Atlantic',
            teams: [
              team(1, { divRank: 1, gb: 0, confRank: 2, confGb: 0 }),
              team(2, { divRank: 2, gb: 0, confRank: 3, confGb: 0 }),
              team(3, { divRank: 3, gb: 2, confRank: 6, confGb: 2 }),
              team(4, { divRank: 4, gb: 4, confRank: 8, confGb: 4 }),
              team(5, { divRank: 5, gb: 6, confRank: 10, confGb: 6 }),
            ],
          },
          {
            name: 'Central',
            teams: [
              team(6, { divRank: 1, gb: 0, confRank: 1, confGb: 0 }),
              team(7, { divRank: 2, gb: 1, confRank: 4, confGb: 1 }),
              team(8, { divRank: 3, gb: 1.5, confRank: 5, confGb: 1.5 }),
              team(9, { divRank: 4, gb: 3, confRank: 7, confGb: 3 }),
              team(10, { divRank: 5, gb: 5, confRank: 9, confGb: 5 }),
            ],
          },
        ],
      },
      {
        name: 'West',
        divisions: [
          { name: 'Midwest', teams: [team(11, { confRank: 2 }), team(12, { confRank: 4 })] },
          { name: 'Pacific', teams: [team(13, { confRank: 1 }), team(14, { confRank: 3 }),
            team(15, { confRank: 5 }), team(16, { confRank: 6 })] },
        ],
      },
    ],
  };
}

describe('standings-view', () => {
  describe('parseView', () => {
    it('znane wartości przechodzą bez zmian', () => {
      expect(parseView('division')).toBe('division');
      expect(parseView('playoffs')).toBe('playoffs');
    });
    it('brak lub zła wartość → division (także usunięty widok conference)', () => {
      expect(parseView(null)).toBe('division');
      expect(parseView('xyz')).toBe('division');
      expect(parseView('conference')).toBe('division');
    });
  });

  it('pełne nazwy konferencji', () => {
    expect(buildStandingsView(response(), 'division').map(c => c.name)).toEqual([
      'Eastern Conference',
      'Western Conference',
    ]);
  });

  describe('division', () => {
    const east = buildStandingsView(response(), 'division')[0];

    it('tabela na dywizję, kolejność drużyn jak z API', () => {
      expect(east.tables.map(t => t.title)).toEqual(['Atlantic Division', 'Central Division']);
      expect(east.tables[0].rows.map(r => r.teamId)).toEqual([1, 2, 3, 4, 5]);
    });

    it('GB z gb; "-" tylko dla divRank 1, remis na czele → "0,0"', () => {
      expect(east.tables[0].rows.map(r => r.gb)).toEqual(['-', '0,0', '2,0', '4,0', '6,0']);
    });

    it('bez oznaczeń playoff', () => {
      const rows = east.tables.flatMap(t => t.rows);
      expect(rows.some(r => r.playoffSeed || r.cutoffAfter)).toBe(false);
    });
  });

  describe('playoffs', () => {
    const [east, west] = buildStandingsView(response(), 'playoffs');
    const eastRows = east.tables[0].rows;

    it('jedna tabela bez podtytułu; mistrzowie dywizji na 1-2, reszta po confRank', () => {
      expect(east.tables).toHaveLength(1);
      expect(east.tables[0].title).toBeNull();
      expect(eastRows.map(r => r.teamId)).toEqual([6, 1, 2, 7, 8, 3, 9, 4, 10, 5]);
    });

    it('GB z confGb; "-" tylko dla rozstawienia 1', () => {
      expect(eastRows.slice(0, 4).map(r => r.gb)).toEqual(['-', '0,0', '0,0', '1,0']);
    });

    it('"*" dokładnie dla top 8', () => {
      expect(eastRows.filter(r => r.playoffSeed)).toHaveLength(PLAYOFF_SPOTS);
      expect(eastRows.slice(PLAYOFF_SPOTS).every(r => !r.playoffSeed)).toBe(true);
    });

    it('linia odcięcia tylko pod 8. miejscem', () => {
      expect(eastRows.map(r => r.cutoffAfter)).toEqual([
        false, false, false, false, false, false, false, true, false, false,
      ]);
    });

    it('brak linii, gdy w konferencji jest <= 8 drużyn', () => {
      expect(west.tables[0].rows.some(r => r.cutoffAfter)).toBe(false);
      expect(west.tables[0].rows.every(r => r.playoffSeed)).toBe(true);
    });

    // Mistrz dywizji ma gwarantowany awans: Central z confRank 9 i tak dostaje rozstawienie 2,
    // a 7 drużyn z Atlantic (confRank 2-8) zjeżdża o miejsce — confRank 8 ląduje pod linią.
    describe('mistrz słabej dywizji', () => {
      const data: StandingsResponse = {
        season: 2051,
        lastGameDay: 30,
        conferences: [
          {
            name: 'East',
            divisions: [
              {
                name: 'Atlantic',
                teams: [1, 2, 3, 4, 5, 6, 7, 8].map(id =>
                  team(id, { divRank: id, confRank: id, confGb: id - 1 }),
                ),
              },
              {
                name: 'Central',
                teams: [
                  team(9, { divRank: 1, confRank: 9, confGb: 8 }),
                  team(10, { divRank: 2, confRank: 10, confGb: 9 }),
                ],
              },
            ],
          },
        ],
      };
      const rows = buildStandingsView(data, 'playoffs')[0].tables[0].rows;

      it('dostaje rozstawienie 2, reszta przesuwa się w dół', () => {
        expect(playoffSeeding(data.conferences[0]).map(t => t.teamId)).toEqual([
          1, 9, 2, 3, 4, 5, 6, 7, 8, 10,
        ]);
      });

      it('"*" i linia liczone od rozstawienia, nie od confRank', () => {
        expect(rows[1]).toMatchObject({ teamId: 9, playoffSeed: true, gb: '8,0' });
        expect(rows[7]).toMatchObject({ teamId: 7, playoffSeed: true, cutoffAfter: true });
        expect(rows[8]).toMatchObject({ teamId: 8, playoffSeed: false, cutoffAfter: false });
      });
    });

    // FBB rankuje po GB: Atlanta 10-5 (.667) jest ZA New Jersey 15-8 (.652).
    // Widok musi trzymać się confRank z API, a nie przesortować po winPct.
    it('kolejność z confRank, nawet gdy winPct mówi inaczej', () => {
      const data: StandingsResponse = {
        season: 2051,
        lastGameDay: 20,
        conferences: [
          {
            name: 'East',
            divisions: [
              {
                name: 'Atlantic',
                teams: [
                  team(1, { name: 'Nets', wins: 15, losses: 8, winPct: 15 / 23, confRank: 1 }),
                  team(2, { name: 'Hawks', wins: 10, losses: 5, winPct: 10 / 15, confRank: 2 }),
                ],
              },
            ],
          },
        ],
      };
      const rows = buildStandingsView(data, 'playoffs')[0].tables[0].rows;
      expect(rows.map(r => r.teamId)).toEqual([1, 2]);
      expect(rows.map(r => r.winPct)).toEqual([',652', ',667']);
    });
  });
});
