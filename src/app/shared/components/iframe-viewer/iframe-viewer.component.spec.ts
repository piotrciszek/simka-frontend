import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeViewerComponent } from './iframe-viewer.component';

describe('IframeViewerComponent', () => {
  let component: IframeViewerComponent;
  let fixture: ComponentFixture<IframeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IframeViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IframeViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
