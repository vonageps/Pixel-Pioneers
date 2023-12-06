import { Injectable } from '@angular/core';
import { ExternalUserJoinMeet } from '../interfaces';
import { IAdapter } from '@care/core/api/adapters/i-adapter';

@Injectable({
  providedIn: 'root',
})
export class ExternalJoinMeetAdapterService
  implements IAdapter<ExternalUserJoinMeet>
{
  adaptFromModel(data: Partial<ExternalUserJoinMeet>) {
    return data;
  }
  adaptToModel(resp: any): ExternalUserJoinMeet {
    const call: ExternalUserJoinMeet = {
      currentLevel: resp.currentLevel,
      apiKey: resp.pickCall?.apiKey,
      sessionId: resp.pickCall?.meetingSessionId,
      token: resp.pickCall?.meetingToken,
    };
    return call;
  }
}
