import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RostersComponent } from './rosters.component';

describe('RostersComponent', () => {
  let component: RostersComponent;
  let fixture: ComponentFixture<RostersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RostersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RostersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
