/** ATTENDEE DETAIL INTERFACE**/
export interface IAttendeeDetail {
  id: string;
  tenantId: string;
}

/** SESSION AND TOKEN INTERFACE **/
export interface ISessionDetail {
  sessionId: string;
  token: string;
}

/** SESSION OPTION **/
export interface ISessionOptions {
  meetingLink?: string;
  expireTime?: Date;
  data?: string;
  meetingLinkId?: string;
}
/** VIDEO SESSION DETAIL INTERFACE**/
export interface IVideoSessionDetail {
  apiKey: string;
  sessionId: string;
  token: string;
  eventDetail: IEventDetail;
}

/** VIDEO SESSION EVENT DETAIL**/
export interface IEventDetail {
  eventId: string;
  firstName: string;
  lastName: string;
  timeZone: string;
  startTime: string;
  endTime: string;
}
