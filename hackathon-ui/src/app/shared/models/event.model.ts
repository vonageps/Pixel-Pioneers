import { MediaType } from "../enum/media-type.enum";
import { ExternalUser } from "./external-user.model";

export class Event {
  id: string;
  startDateTime: Date; //actual
  endDateTime: Date; //actual
  scheduledStartDateTime: Date;
  scheduledEndTDateime: Date;
  rrule: string;
  subject: string;
  mediaType = MediaType.audio;
  attendees: ExternalUser[];
  patient: string | ExternalUser;
  provider: string | ExternalUser;
  isReadOnly: boolean;
  color: string;
  sessionId?: string;
  token?: string;
  apiKey?: string;
  from?: string;
  meetingLink?: string;
  currentLevel: any; //NOSONAR
  audio = true;
  video = true;
  audioDeviceId: string;
  audioOutputDeviceId: string;
  videoDeviceId: string;
  status: string;
  meetingLinkId: string;
  isProvider: boolean;
  archiveId?: string;
}
