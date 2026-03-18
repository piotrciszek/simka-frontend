import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PbpFilesComponent } from './pbp-files.component';

describe('PbpFilesComponent', () => {
  let component: PbpFilesComponent;
  let fixture: ComponentFixture<PbpFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PbpFilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PbpFilesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
