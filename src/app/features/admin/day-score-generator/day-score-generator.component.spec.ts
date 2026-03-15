import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayScoreGeneratorComponent } from './day-score-generator.component';

describe('DayScoreGeneratorComponent', () => {
  let component: DayScoreGeneratorComponent;
  let fixture: ComponentFixture<DayScoreGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayScoreGeneratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DayScoreGeneratorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
