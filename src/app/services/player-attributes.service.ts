import { Injectable } from '@angular/core';
import Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class PlayerAttributesService {

  players: Record<string, string>[] = [];
  attributes: string[] = [];

  loadFile(file: File): Promise<void> {

    return new Promise((resolve) => {

      const reader = new FileReader();

      reader.onload = () => {

        const csvText = reader.result as string;

        const result = Papa.parse<Record<string,string>>(
          csvText,
          {
            header:true,
            delimiter:',',
            skipEmptyLines:true
          }
        );

        this.players = result.data.map(player => {

          const fullName = [
            player['FirstName']?.trim(),
            player['LastName']?.trim()
          ]
          .filter(Boolean)
          .join(' ');

return {
  ...player,

  Name: fullName,

  Salary1: player['Salary1']
    ? Number(player['Salary1']).toLocaleString('pl-PL')
    : '0'
};
        });

        const ignoredColumns = [
          'FirstName',
          'LastName',
          'Height',
          'Weight',
          'Age',
          'Position',
          'College',
          'Experience',
          'Team'
        ];

        this.attributes =
          (result.meta.fields ?? [])
          .filter(
            h =>
            !ignoredColumns.includes(h)
          );

        resolve();

      };

      reader.readAsText(
        file,
        'utf-8'
      );

    });

  }

}
