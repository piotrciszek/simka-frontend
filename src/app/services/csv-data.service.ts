import { Injectable } from '@angular/core';
import Papa from 'papaparse';

export interface CsvRow {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root',
})
export class CsvDataService {
  fileName = '';

  headers: string[] = [];
  rows: CsvRow[] = [];
  allRows: CsvRow[] = [];

  sumHeaders: string[] = [];
  sumRows: CsvRow[] = [];

  loadFile(file: File): Promise<void> {
    this.fileName = file.name;

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const csvText = reader.result as string;

        const result = Papa.parse<Record<string, string>>(csvText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
        });

        this.prepareSumData(result.data);
        this.preparePerGameData(result.data);

        resolve();
      };

      reader.readAsText(file, 'utf-8');
    });
  }

  private prepareSumData(baseRows: Record<string, string>[]): void {
    this.sumRows = baseRows.map(row => ({ ...row }));

    this.sumHeaders = [
      'Name', 'Position', 'Team', 'Games', 'Minutes',
      'FG', 'FGA', 'FT', 'FTA', '3P', '3PA',
      'Rebounds', 'Assists', 'Steals', 'Blocks',
      'Turnovers', 'Fouls', 'Points', 'OREB'
    ];
  }

  private preparePerGameData(baseRows: Record<string, string>[]): void {
    const pgColumns = [
      'Minutes', 'FG', 'FGA', 'FT', 'FTA', '3P', '3PA',
      'Rebounds', 'Assists', 'Steals', 'Blocks',
      'Turnovers', 'Fouls', 'Points', 'OREB',
    ];

    this.rows = baseRows.map((row) => {
      const games = Number(row['Games']) || 0;

      const newRow: CsvRow = {
        Name: row['Name'],
        Team: row['Team'],
        Position: row['Position'],
        PIE: row['PIE'] || '0',
      };

      pgColumns.forEach((col) => {
        const value = Number(row[col]) || 0;
        newRow[col] = games > 0 ? (value / games).toFixed(2) : '0.00';
      });

      const fg = Number(row['FG']) || 0;
      const fga = Number(row['FGA']) || 0;
      const threeP = Number(row['3P']) || 0;
      const threePA = Number(row['3PA']) || 0;
      const ft = Number(row['FT']) || 0;
      const fta = Number(row['FTA']) || 0;
      const points = Number(row['Points']) || 0;
      const rebounds = Number(row['Rebounds']) || 0;
      const assists = Number(row['Assists']) || 0;
      const steals = Number(row['Steals']) || 0;
      const blocks = Number(row['Blocks']) || 0;
      const turnovers = Number(row['Turnovers']) || 0;
      const oreb = Number(row['OREB']) || 0;

      newRow['FG%'] = fga > 0 ? ((fg / fga) * 100).toFixed(1) : '0.0';
      newRow['3P%'] = threePA > 0 ? ((threeP / threePA) * 100).toFixed(1) : '0.0';
      newRow['FT%'] = fta > 0 ? ((ft / fta) * 100).toFixed(1) : '0.0';

      newRow['TS%'] =
        (fga + 0.44 * fta) > 0
          ? ((points / (2 * (fga + 0.44 * fta))) * 100).toFixed(1)
          : '0.0';

      newRow['eFG%'] =
        fga > 0
          ? (((fg + 0.5 * threeP) / fga) * 100).toFixed(1)
          : '0.0';

      const effTotal =
        points + rebounds + assists + steals + blocks -
        ((fga - fg) + (fta - ft) + turnovers);

      newRow['EFF'] = games > 0 ? (effTotal / games).toFixed(2) : '0.00';

      newRow['AST/TO'] =
        turnovers > 0
          ? (assists / turnovers).toFixed(2)
          : assists > 0
            ? assists.toFixed(2)
            : '0.00';

      const usgTotal = fga + 0.44 * fta + turnovers;
      const possTotal = fga + 0.44 * fta - oreb + turnovers;

      newRow['USG'] = games > 0 ? (usgTotal / games).toFixed(2) : '0.00';
      newRow['POSS'] = games > 0 ? (possTotal / games).toFixed(2) : '0.00';
      newRow['PPP'] = possTotal > 0 ? (points / possTotal).toFixed(2) : '0.00';

      return newRow;
    });

    this.allRows = [...this.rows];

    this.headers = [
      'Name', 'Team', 'Position', 'Minutes', 'FG', 'FGA', 'FG%',
      'FT', 'FTA', 'FT%', '3P', '3PA', '3P%',
      'Rebounds', 'Assists', 'Steals', 'Blocks',
      'Turnovers', 'Fouls', 'Points', 'OREB',
      'eFG%', 'TS%', 'EFF', 'AST/TO', 'USG', 'POSS', 'PPP',
    ];
  }
}
