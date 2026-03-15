import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFilesComponent } from './csv-files.component';

describe('CsvFilesComponent', () => {
  let component: CsvFilesComponent;
  let fixture: ComponentFixture<CsvFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvFilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CsvFilesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
