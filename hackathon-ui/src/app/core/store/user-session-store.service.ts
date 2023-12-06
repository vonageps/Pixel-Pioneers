import { Inject, Injectable } from "@angular/core";
import { InMemoryStorageService, StorageService } from "ngx-webstorage-service";
import { Event } from "@care/shared/models/event.model";
import { EncryptDecrypt } from "./encrypt-data";
import { StoreKeys } from "./store-keys.enum";
import { APP_SESSION_STORE, APPLICATION_STORE } from "./store.interface";
import { ExternalUser } from "@care/shared/models/external-user.model";

@Injectable()
export class UserSessionStoreService extends EncryptDecrypt {
  constructor(
    @Inject(APPLICATION_STORE)
    private readonly localStore: StorageService,
    @Inject(APP_SESSION_STORE)
    private readonly sessionStore: StorageService,
    private readonly inMemoryStore: InMemoryStorageService
  ) {
    super();
  }
  applicationLevelData: { [key: string]: any } = {}; //NOSONAR

  /**
   * The function saves an access token by encrypting it and storing it in the local store.
   * @param {string} token - The `token` parameter is a string that represents an access token.
   * @returns A boolean value of true is being returned.
   */
  public saveAccessToken(token: string): boolean {
    this.localStore.set(StoreKeys.ACCESS_TOKEN_KEY, this.encrypt(token));
    return true;
  }

  /**
   * The function retrieves and decrypts an access token from local storage.
   * @returns A string value is being returned.
   */
  public getAccessToken(): string {
    return this.decrypt(this.localStore.get(StoreKeys.ACCESS_TOKEN_KEY));
  }

  /**
   * The function removes the access token from the local store and returns a boolean indicating
   * success.
   * @returns A boolean value of true is being returned.
   */
  public removeAccessToken(): boolean {
    this.localStore.remove(StoreKeys.ACCESS_TOKEN_KEY);
    return true;
  }

  /**
   * The function sets the encrypted call data in the session store.
   * @param {Event} call - The parameter "call" is of type "Event".
   */
  public setEventData(call: Event) {
    this.sessionStore.set(StoreKeys.CALL_DATA, this.encrypt(call));
  }

  /**
   * The function `getEventData` returns the decrypted event data stored in the session store.
   * @returns The method is returning an Event object.
   */
  public getEventData(): Event {
    return this.decrypt(this.sessionStore.get(StoreKeys.CALL_DATA));
  }

  /**
   * The function removes call data from the session store and returns a boolean indicating success.
   * @returns A boolean value of true is being returned.
   */
  public removeCallData(): boolean {
    this.sessionStore.remove(StoreKeys.CALL_DATA);
    return true;
  }

  /**
   * The function sets the external user details in the session store after encrypting them.
   * @param {ExternalUser} externalUserDetails - The parameter `externalUserDetails` is of type
   * `ExternalUser`.
   */
  public setExternalUserDetails(externalUserDetails: ExternalUser) {
    this.sessionStore.set(
      StoreKeys.EXTERNAL_USER_DATA,
      this.encrypt(externalUserDetails)
    );
  }

  /**
   * The function returns the decrypted external user details stored in the session store.
   * @returns The method is returning an object of type ExternalUser.
   */
  public getExternalUserDetails(): ExternalUser {
    return this.decrypt(this.sessionStore.get(StoreKeys.EXTERNAL_USER_DATA));
  }

  /**
   * The function deletes external user details from the session store and returns a boolean indicating
   * success.
   * @returns A boolean value of true is being returned.
   */
  public deleteExternalUserDetails(): boolean {
    this.sessionStore.remove(StoreKeys.EXTERNAL_USER_DATA);
    return true;
  }

  /**
   * The function sets the value of a key in the session store after encrypting the data.
   * @param {boolean} data - The `data` parameter is a boolean value that represents whether a pre-call
   * has been verified or not.
   */
  public setPreCallVerified(data: boolean) {
    this.sessionStore.set(StoreKeys.PRE_CALL_VERIFIED, this.encrypt(data));
  }

  /**
   * The function returns the decrypted value of the "PRE_CALL_VERIFIED" key from the session store.
   * @returns A boolean value is being returned.
   */
  public getPreCallVerified(): boolean {
    return this.decrypt(this.sessionStore.get(StoreKeys.PRE_CALL_VERIFIED));
  }

  /**
   * The clearAll function clears the in-memory, session, and local storage, while preserving the
   * remember me data and encrypted flag if present.
   */
  public clearAll(): void {
    let encrypted;
    if (localStorage.getItem("encrypted")) {
      encrypted = true;
    }
    this.inMemoryStore.clear();
    this.sessionStore.clear();
    this.localStore.clear();

    if (encrypted) {
      localStorage.setItem("encrypted", "true");
    }
  }
}
