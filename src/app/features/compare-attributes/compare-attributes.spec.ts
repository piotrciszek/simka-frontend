import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareAttributes } from './compare-attributes';

describe('CompareAttributes', () => {
  let component: CompareAttributes;
  let fixture: ComponentFixture<CompareAttributes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareAttributes],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareAttributes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
