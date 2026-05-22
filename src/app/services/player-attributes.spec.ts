import { TestBed } from '@angular/core/testing';

import { PlayerAttributes } from './player-attributes';

describe('PlayerAttributes', () => {
  let service: PlayerAttributes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerAttributes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
