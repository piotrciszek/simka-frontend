import { Component } from '@angular/core';
import { IframeViewerComponent } from '../../../shared/components/iframe-viewer/iframe-viewer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transactions',
  imports: [IframeViewerComponent],
  template: `
    <app-iframe-viewer src="${environment.apiUrl}/uploads/html/transactions.htm" />
  `,
})
export class TransactionsComponent {}
