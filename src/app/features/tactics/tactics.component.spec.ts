import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacticsComponent } from './tactics.component';

describe('TacticsComponent', () => {
  let component: TacticsComponent;
  let fixture: ComponentFixture<TacticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TacticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TacticsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
