import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebuildPlayerDbComponent } from './rebuild-player-db.component';

describe('RebuildPlayerDbComponent', () => {
  let component: RebuildPlayerDbComponent;
  let fixture: ComponentFixture<RebuildPlayerDbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RebuildPlayerDbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RebuildPlayerDbComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
