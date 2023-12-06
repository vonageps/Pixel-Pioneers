import { Injectable } from '@angular/core';
import { IAdapter } from '@care/core/api/adapters/i-adapter';
import { Event } from '@care/shared/models/event.model';
@Injectable({
  providedIn: 'root',
})
export class ExternalUserDetailsAdapterService implements IAdapter<Event> {
  adaptFromModel(data: Partial<Event>) {
    return data;
  }
  adaptToModel(res: any): Event {
    if (res) {
      const call = new Event();
      call.apiKey = res.pickCallData?.apiKey;
      call.sessionId = res.pickCallData?.meetingSessionId;
      call.token = res.pickCallData?.meetingToken;
      call.startDateTime = res.videoChatDetails.actualStartDateTime;
      call.endDateTime = res.videoChatDetails.actualEndDateTime;
      call.scheduledStartDateTime = res.videoChatDetails.startedAt;
      call.scheduledEndTDateime = res.videoChatDetails.endedAt;
      call.currentLevel = res.currentLevel;
      call.attendees = res.attendees;

      call['component'] = res.component;
      call['tokenVal'] = res.token;
      return call;
    }
  }
}
