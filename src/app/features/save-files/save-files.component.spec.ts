import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveFilesComponent } from './save-files.component';

describe('SaveFilesComponent', () => {
  let component: SaveFilesComponent;
  let fixture: ComponentFixture<SaveFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveFilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveFilesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
