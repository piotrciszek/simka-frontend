import { Component } from '@angular/core';
import { IframeViewerComponent } from '../../../shared/components/iframe-viewer/iframe-viewer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-allstar-winners',
  imports: [IframeViewerComponent],
  template: `
    <app-iframe-viewer src="${environment.apiUrl}/uploads/html/allstarweekend.htm" />
  `,
})
export class AllstarWinnersComponent {}
