import { Component } from '@angular/core';
import { IframeViewerComponent } from '../../../shared/components/iframe-viewer/iframe-viewer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-player-season-records',
  imports: [IframeViewerComponent],
  template: `
    <app-iframe-viewer src="${environment.apiUrl}/uploads/html/playerssnrecords.htm" />
  `,
})
export class PlayerSeasonRecordsComponent {}
