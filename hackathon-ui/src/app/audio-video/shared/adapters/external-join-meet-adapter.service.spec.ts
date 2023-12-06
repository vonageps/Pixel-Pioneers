import {TestBed} from '@angular/core/testing';

import {ExternalJoinMeetAdapterService} from './external-join-meet-adapter.service';

describe('ExternalJoinMeetAdapterService', () => {
  let service: ExternalJoinMeetAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalJoinMeetAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
