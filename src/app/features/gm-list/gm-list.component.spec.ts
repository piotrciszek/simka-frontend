import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GmListComponent } from './gm-list.component';

describe('GmListComponent', () => {
  let component: GmListComponent;
  let fixture: ComponentFixture<GmListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GmListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GmListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
