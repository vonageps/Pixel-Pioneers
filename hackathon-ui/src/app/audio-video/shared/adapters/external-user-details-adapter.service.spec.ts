import {TestBed} from '@angular/core/testing';

import {ExternalUserDetailsAdapterService} from './external-user-details-adapter.service';

describe('ExternalUserDetailsAdapterService', () => {
  let service: ExternalUserDetailsAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalUserDetailsAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
