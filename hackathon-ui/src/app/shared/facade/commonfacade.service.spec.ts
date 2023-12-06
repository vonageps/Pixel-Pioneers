import { TestBed } from '@angular/core/testing';

import { CommonfacadeService } from './commonfacade.service';

describe('CommonfacadeService', () => {
  let service: CommonfacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonfacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
