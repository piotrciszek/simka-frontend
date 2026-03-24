import { Component } from '@angular/core';
import { IframeViewerComponent } from '../../../shared/components/iframe-viewer/iframe-viewer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-playoffs',
  imports: [IframeViewerComponent],
  template: `
    <app-iframe-viewer src="${environment.apiUrl}/uploads/html/playoffs.htm" />
  `,
})
export class PlayoffsComponent {}
