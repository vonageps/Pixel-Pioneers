import {TestBed} from '@angular/core/testing';

import {AudioVideoService} from './audio-video.service';

describe('AudioVideoService', () => {
  let service: AudioVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
