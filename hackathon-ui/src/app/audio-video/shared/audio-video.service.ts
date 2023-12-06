import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";

import * as OT from "@opentok/client";
import { Observable, Subject } from "rxjs";
import { UserSessionStoreService } from "@care/core/store";
import { ExternalUserAdapter } from "./adapters";
import { ExternalJoinMeetAdapterService } from "./adapters/external-join-meet-adapter.service";
import { ApiService } from "@care/core/api/api.service";
import { EndCallCommand } from "./commands/end-call.command";
import { JoinMeetingExternalCommand } from "./commands/join-meeting-external.command";
import { AnyAdapter } from "@care/core/api/adapters/any-adapter.service";
import { SendOtpCommand } from "./commands/send-otp.command";
import { VerifyOtpCommand } from "./commands/verify-otp.command";
import { HttpHeaders } from "@angular/common/http";
import { RegisterCommand } from "./commands/register-patient.command";
import { SendSmsCommand } from "./commands/send-sms.command";
import { JoinMeetingProviderCommand } from "./commands/join-provider.command";
import { ArchiveSessionCommand } from "@care/shared/commands/archive-session.command";

@Injectable({
  providedIn: "root",
})
export class AudioVideoService {
  session: OT.Session;
  token: string;
  private readonly preCallVerified = new Subject<boolean>();
  preCallVerifiedObv = this.preCallVerified.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly externalJoinMeetingAdapter: ExternalJoinMeetAdapterService
  ) {}

  /**
   * The function returns the value of the variable OT.
   * @returns The variable OT is being returned.
   */
  getOT() {
    return OT;
  }

  initSession(apiKey: string, sessionId: string, token: string) {
    this.session = this.getOT().initSession(apiKey, sessionId);
    this.token = token;
    return Promise.resolve(this.session);
  }

  /**
   * The `connect` function returns a promise that resolves with the session if the connection is
   * successful, or rejects with an error if there is an error.
   * @returns A Promise object is being returned.
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.session.connect(this.token, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.session);
        }
      });
    });
  }

  /**
   * The function `endCall` ends a call by executing an `EndCallCommand` with the provided `eventId`.
   * @param {string} eventId - The `eventId` parameter is a string that represents the unique
   * identifier of a call event. It is used to identify the specific call event that needs to be ended.
   * @returns The `execute()` method of the `EndCallCommand` object is being called and its return
   * value is being returned.
   */
  endCall(meetingLinkId: string, archiveId: string, sessionId: string) {
    const command: EndCallCommand<object> = new EndCallCommand(
      this.apiService,
      this.anyAdapter
    );
    let headers = new HttpHeaders();
    headers = headers.set("Authorization", this.store.getAccessToken());
    command.parameters = {
      data: {
        meetingId: meetingLinkId,
        archiveId: archiveId,
        sessionId: sessionId,
      },
      headers,
    };

    return command.execute();
  }

  setPrecallVerified(value: boolean) {
    this.preCallVerified.next(value);
  }

  JoinMeetingProvider(code: string): Observable<any> {
    const command: JoinMeetingProviderCommand<any> =
      new JoinMeetingProviderCommand(this.apiService, this.anyAdapter);
    command.parameters = {
      data: {
        code,
      },
    };
    return command.execute();
  }

  sendOtp(phoneNumber) {
    const command: SendOtpCommand<any> = new SendOtpCommand(
      this.apiService,
      this.anyAdapter
    );
    command.parameters = {
      data: {
        phoneNumber: phoneNumber,
      },
    };

    return command.execute();
  }

  verifyOtp(enteredCode, requestId, code) {
    const command: VerifyOtpCommand<any> = new VerifyOtpCommand(
      this.apiService,
      this.anyAdapter
    );
    command.parameters = {
      data: {
        enteredCode: enteredCode,
        requestId: requestId,
        code: code,
      },
    };

    return command.execute();
  }
  joinMeeting(meetingLinkId: string) {
    const command: JoinMeetingExternalCommand<any> =
      new JoinMeetingExternalCommand(this.apiService, this.anyAdapter);
    let headers = new HttpHeaders();
    headers = headers.set("Authorization", this.store.getAccessToken());
    command.parameters = {
      data: { meetingLinkId: meetingLinkId },
      headers,
    };

    return command.execute();
  }
  registerUser(user) {
    const command: RegisterCommand<any> = new RegisterCommand(
      this.apiService,
      this.anyAdapter
    );
    const data = { ...user, name: undefined };
    data.gender = data.gender === "Female" ? "F" : "M";

    command.parameters = {
      data: {
        ...data,
      },
    };

    return command.execute();
  }

  sendSms(phoneNumber) {
    const command: SendSmsCommand<any> = new SendSmsCommand(
      this.apiService,
      this.anyAdapter
    );
    command.parameters = {
      data: {
        phoneNumber: phoneNumber,
      },
    };

    return command.execute();
  }

  archive(sessionId: string) {
    const command: ArchiveSessionCommand<any> = new ArchiveSessionCommand(
      this.apiService,
      this.anyAdapter
    );
    let headers = new HttpHeaders();
    headers = headers.set("Authorization", this.store.getAccessToken());
    command.parameters = {
      data: {
        sessionId,
      },
      headers,
    };

    return command.execute();
  }
}
