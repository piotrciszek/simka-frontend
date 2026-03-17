import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSidebarComponent } from './public-sidebar.component';

describe('PublicSidebarComponent', () => {
  let component: PublicSidebarComponent;
  let fixture: ComponentFixture<PublicSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
