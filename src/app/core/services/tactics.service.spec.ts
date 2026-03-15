import { TestBed } from '@angular/core/testing';

import { TacticsService } from './tactics.service';

describe('TacticsService', () => {
  let service: TacticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TacticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
