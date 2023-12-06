import { Injectable } from "@angular/core";
import { IAdapter } from "@care/core/api/adapters/i-adapter";
import { UserSessionStoreService } from "@care/core/store";
import { ExternalUser } from "@care/shared/models/external-user.model";

@Injectable({
  providedIn: "root",
})
export class ExternalUserAdapter implements IAdapter<ExternalUser> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): ExternalUser {
    const externalUser = new ExternalUser();
    externalUser.firstName = resp.attendeeFirstName;
    externalUser.lastName = resp.attendeeLastName;
    return externalUser;
  }

  adaptFromModel(data: any): any {
    return {
      attendeeFirstName: data.firstName,
      attendeeLastName: data.lastName,
      shortUrl: data.callShortLink,
      eventId: this.store.getEventData().id,

      organizationId: data.organizationId,
    };
  }
}
