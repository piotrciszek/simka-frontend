import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlayerSkills {
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  InsideScoring: number;
  Jumpshot: number;
  '3P': number;
  Handling: number;
  Passing: number;
  Quickness: number;
  PostD: number;
  PerimeterD: number;
  DriveD: number;
  Stealing: number;
  Blocking: number;
  Oreb: number;
  Dreb: number;
  Jumping: number;
  Strength: number;
  Potential: number;
  Overall: number;
}

export interface TeamGroup {
  team: string;
  players: PlayerDiff[];
  teamSumDelta: number; // suma delt Overall graczy changed/same
}

export const SKILL_COLUMNS = [
  'InsideScoring',
  'Jumpshot',
  '3P',
  'Handling',
  'Passing',
  'Quickness',
  'PostD',
  'PerimeterD',
  'DriveD',
  'Stealing',
  'Blocking',
  'Oreb',
  'Dreb',
  'Jumping',
  'Strength',
  'Potential',
  'Overall',
] as const;

export type SkillKey = (typeof SKILL_COLUMNS)[number];

export interface PlayerDiff {
  key: string;
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  status: 'same' | 'changed' | 'added' | 'removed';
  skills: {
    [K in SkillKey]: {
      old: number | null;
      new: number | null;
      delta: number | null;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class CsvCompareService {
  private http = inject(HttpClient);

  fetchCsv(filename: string): Observable<Map<string, PlayerSkills>> {
    return this.http
      .get(`${environment.apiUrl}/csv/file/${filename}`, { responseType: 'text' })
      .pipe(map(text => this.parseCsv(text)));
  }

  private parseCsv(text: string): Map<string, PlayerSkills> {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const headers = lines[0].split(',').map(h => h.trim());
    const result = new Map<string, PlayerSkills>();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].includes(',')) continue;

      const cols = lines[i].split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => (row[h] = cols[idx]?.trim() ?? ''));

      const key = `${row['FirstName']} ${row['LastName']}`;
      const skills = {
        firstName: row['FirstName'],
        lastName: row['LastName'],
        team: row['Team'],
        position: row['Position'],
        InsideScoring: +row['InsideScoring'],
        Jumpshot: +row['Jumpshot'],
        '3P': +row['3P'],
        Handling: +row['Handling'],
        Passing: +row['Passing'],
        Quickness: +row['Quickness'],
        PostD: +row['PostD'],
        PerimeterD: +row['PerimeterD'],
        DriveD: +row['DriveD'],
        Stealing: +row['Stealing'],
        Blocking: +row['Blocking'],
        Oreb: +row['Oreb'],
        Dreb: +row['Dreb'],
        Jumping: +row['Jumping'],
        Strength: +row['Strength'],
        Potential: +row['Potential'],
        Overall: 0, // placeholder, liczymy niżej
      };

      skills.Overall =
        skills.InsideScoring +
        skills.Jumpshot +
        skills['3P'] +
        skills.Handling +
        skills.Passing +
        skills.Quickness +
        skills.PostD +
        skills.PerimeterD +
        skills.DriveD +
        skills.Stealing +
        skills.Blocking +
        skills.Oreb +
        skills.Dreb +
        skills.Jumping +
        skills.Strength;

      result.set(key, skills);
    }

    return result;
  }

  compare(oldMap: Map<string, PlayerSkills>, newMap: Map<string, PlayerSkills>): PlayerDiff[] {
    const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
    const result: PlayerDiff[] = [];

    for (const key of allKeys) {
      const oldP = oldMap.get(key) ?? null;
      const newP = newMap.get(key) ?? null;
      const player = newP ?? oldP!;

      let status: PlayerDiff['status'] = 'same';
      if (!oldP) status = 'added';
      else if (!newP) status = 'removed';

      const skills: any = {};
      let hasChange = false;

      for (const skill of SKILL_COLUMNS) {
        const o = oldP ? oldP[skill] : null;
        const n = newP ? newP[skill] : null;
        const delta = o !== null && n !== null ? n - o : null;
        if (delta !== null && delta !== 0) hasChange = true;
        skills[skill] = { old: o, new: n, delta };
      }

      if (status === 'same' && hasChange) status = 'changed';

      result.push({
        key,
        firstName: player.firstName,
        lastName: player.lastName,
        team: player.team,
        position: player.position,
        status,
        skills,
      });
    }

    return result.sort((a, b) => {
      const order = { added: 0, removed: 1, changed: 2, same: 3 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return a.lastName.localeCompare(b.lastName);
    });
  }
  compareGrouped(
    oldMap: Map<string, PlayerSkills>,
    newMap: Map<string, PlayerSkills>,
  ): { groups: TeamGroup[]; error: string | null } {
    const diffs = this.compare(oldMap, newMap);

    // Walidacja: czy któryś gracz zmienił drużynę?
    for (const key of oldMap.keys()) {
      const oldPlayer = oldMap.get(key)!;
      const newPlayer = newMap.get(key);
      if (newPlayer && oldPlayer.team !== newPlayer.team) {
        return {
          groups: [],
          error: `Nie można porównać — gracz ${key} zmienił drużynę (${oldPlayer.team} → ${newPlayer.team}). Pliki muszą być z tego samego sezonu.`,
        };
      }
    }

    const groupMap = new Map<string, PlayerDiff[]>();

    for (const player of diffs) {
      const team = player.team || 'FA';
      if (!groupMap.has(team)) groupMap.set(team, []);
      groupMap.get(team)!.push(player);
    }

    const groups: TeamGroup[] = [];

    for (const [team, players] of groupMap) {
      const sorted = players.sort((a, b) => {
        const last = a.lastName.localeCompare(b.lastName);
        return last !== 0 ? last : a.firstName.localeCompare(b.firstName);
      });

      const teamSumDelta = sorted
        .filter(p => p.status === 'changed' || p.status === 'same')
        .reduce((sum, p) => sum + (p.skills['Overall'].delta ?? 0), 0);

      groups.push({ team, players: sorted, teamSumDelta });
    }

    // Alfabetycznie, FA na końcu
    groups.sort((a, b) => {
      if (a.team === 'FA') return 1;
      if (b.team === 'FA') return -1;
      return a.team.localeCompare(b.team);
    });

    return { groups, error: null };
  }
}
