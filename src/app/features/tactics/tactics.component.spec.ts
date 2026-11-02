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

  it('should treat an array with only disabled controls as valid', () => {
    component.injuredListArray.controls.forEach(control => control.disable());

    expect(component.isFormArrayFullyValid(component.injuredListArray)).toBe(true);
  });

  it('should treat an enabled required empty control as invalid', () => {
    const control = component.injuredListArray.at(0);
    control.setValidators(component.playerRequired);
    control.updateValueAndValidity();
    component.injuredListArray.updateValueAndValidity();

    expect(component.isFormArrayFullyValid(component.injuredListArray)).toBe(false);
  });
});
