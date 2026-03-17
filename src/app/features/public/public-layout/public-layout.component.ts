import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicHeaderComponent } from './public-header/public-header.component';
import { PublicSidebarComponent } from './public-sidebar/public-sidebar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterModule, PublicHeaderComponent, PublicSidebarComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {}
