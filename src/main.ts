import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  QuickFilterModule,
  RowStyleModule,
  ValidationModule,
} from 'ag-grid-community';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));

// Rejestrujemy tylko moduły faktycznie używane — zamiast AllCommunityModule (~1MB)
ModuleRegistry.registerModules([
  ClientSideRowModelModule, // podstawowy model danych
  TextFilterModule,         // agTextColumnFilter
  NumberFilterModule,       // agNumberColumnFilter
  QuickFilterModule,        // quickFilterText (wyszukiwarka)
  RowStyleModule,           // getRowClass
  ValidationModule,         // ostrzeżenia w trybie dev
]);
