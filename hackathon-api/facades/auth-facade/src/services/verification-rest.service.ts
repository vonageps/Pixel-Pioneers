import {BindingScope, Provider, inject, injectable} from '@loopback/core';
import {AnyObject} from '@loopback/repository';

import {getService} from '@loopback/service-proxy';
import {VerificationRestDataSource} from '../datasources';

export interface VerificationRestService {
  sendOtp(body: {phoneNumber: string}): Promise<AnyObject>;
  verifyOtp(body: {enteredCode: string; requestId: string}): Promise<AnyObject>;
}
@injectable({scope: BindingScope.TRANSIENT})
export class VerificationRestProvider
  implements Provider<VerificationRestService>
{
  constructor(
    // VerificationRest must match the name property in the datasource json file
    @inject('datasources.verificationRest')
    protected _dataSource: VerificationRestDataSource = new VerificationRestDataSource(),
  ) {}

  async value(): Promise<VerificationRestService> {
    return getService(this._dataSource);
  }
}
