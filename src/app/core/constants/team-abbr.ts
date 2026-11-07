// Skróty 3-literowe do wyświetlania (np. wąskie tabele na telefonie).
// Klucz = sama nazwa drużyny bez miasta (pole `name` z API), bo jest unikalna w lidze
// i nie zależy od zapisu miasta. Uwaga: to NIE są nazwy plików logo z rosters
// (tam np. Hornets = 'no') — tu zawsze 3 wielkie litery.
export const TEAM_ABBR: Readonly<Record<string, string>> = {
  Celtics: 'BOS',
  Heat: 'MIA',
  Nets: 'NJN',
  Knicks: 'NYK',
  Magic: 'ORL',
  '76ers': 'PHI',
  Wizards: 'WAS',
  Hawks: 'ATL',
  Hornets: 'NOH',
  Bulls: 'CHI',
  Cavaliers: 'CLE',
  Pistons: 'DET',
  Pacers: 'IND',
  Bucks: 'MIL',
  Raptors: 'TOR',
  Mavericks: 'DAL',
  Nuggets: 'DEN',
  Rockets: 'HOU',
  Jazz: 'UTA',
  Sonics: 'SEA',
  Timberwolves: 'MIN',
  Grizzlies: 'MEM',
  Warriors: 'GSW',
  Clippers: 'LAC',
  Lakers: 'LAL',
  Suns: 'PHO',
  Trailblazers: 'POR',
  Kings: 'SAC',
  Spurs: 'SAS',
};

// Nieznana drużyna (np. nowa franczyza) → pierwsze 3 litery nazwy zamiast pustej komórki
export function teamAbbr(name: string): string {
  return TEAM_ABBR[name] ?? name.slice(0, 3).toUpperCase();
}
