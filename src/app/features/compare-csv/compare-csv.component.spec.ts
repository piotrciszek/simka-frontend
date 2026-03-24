import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareCsvComponent } from './compare-csv.component';

describe('CompareCsvComponent', () => {
  let component: CompareCsvComponent;
  let fixture: ComponentFixture<CompareCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareCsvComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareCsvComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
