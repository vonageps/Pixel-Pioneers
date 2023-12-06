import {TestBed} from '@angular/core/testing';

import {ExternalUserAdapter} from './external-user-adapter.service';

describe('ExternalUserAdapter', () => {
  let service: ExternalUserAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalUserAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
